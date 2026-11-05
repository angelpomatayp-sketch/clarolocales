<?php

namespace App\Http\Controllers\Admin;

use App\Application\Servicios\ReviewService;
use App\Application\Servicios\ServiceOrderManager;
use App\Application\Servicios\SubmitService;
use App\Application\Servicios\UpdateServiceLocation;
use App\Domain\Servicios\ServiceCatalog;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Servicios\ReviewServiceRequest;
use App\Http\Requests\Admin\Servicios\ServiceOrderRequest;
use App\Http\Requests\Admin\Servicios\SubmitServiceRequest;
use App\Http\Requests\Admin\Servicios\UpdateServiceLocationRequest;
use App\Models\EvidenciaServicio;
use App\Models\Local;
use App\Models\Pantalla;
use App\Models\ServicioPantalla;
use App\Models\TipoPantalla;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ServicioPantallaController extends Controller
{
    private const SERVICES_PER_PAGE = 15;

    public function index(Request $request)
    {
        $user = $request->user();
        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'estado' => trim((string) $request->query('estado', '')),
        ];

        $query = ServicioPantalla::query()
            ->with([
                'local:id,codigo,nombre,direccion,zona,departamento,provincia,distrito',
                'pantalla.componentes:id,pantalla_id,serie,fila,columna,estado',
                'operador:id,name,email',
                'creador:id,name',
                'revisor:id,name',
                'evidencias:id,servicio_id,servicio_equipo_id,user_id,tipo,ruta,nombre_original,mime,tamanio,orden,created_at',
                'evidencias.equipo:id,orden',
                'equipos.pantalla.componentes:id,pantalla_id,serie,fila,columna,estado',
                'cambiosLocal.usuario:id,name',
            ])
            ->when($user->rol === 'operativo', fn ($query) => $query->where('operador_id', $user->id))
            ->when($filters['estado'] !== '', fn ($query) => $query->where('estado', $filters['estado']))
            ->when($filters['search'] !== '', function ($query) use ($filters) {
                $search = $filters['search'];
                $query->where(function ($inner) use ($search) {
                    $inner->where('codigo', 'like', "%{$search}%")
                        ->orWhere('numero_solicitud', 'like', "%{$search}%")
                        ->orWhereHas('local', fn ($local) => $local
                            ->where('nombre', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%"))
                        ->orWhereHas('pantalla', fn ($screen) => $screen
                            ->where('serie', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%"))
                        ->orWhereHas('equipos.pantalla', fn ($screen) => $screen
                            ->where('serie', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%"));
                });
            })
            ->orderByRaw("CASE estado
                WHEN 'en_revision' THEN 1
                WHEN 'observado' THEN 2
                WHEN 'en_curso' THEN 3
                WHEN 'pendiente' THEN 4
                WHEN 'finalizado' THEN 5
                WHEN 'cancelado' THEN 6
                ELSE 7 END")
            ->orderBy('fecha_programada')
            ->orderByDesc('id');

        return Inertia::render('Admin/Servicios/Index', [
            'servicios' => $query->paginate(self::SERVICES_PER_PAGE)->withQueryString(),
            'filters' => $filters,
            'locales' => $user->rol === 'operativo' ? [] : Local::orderBy('zona')->orderBy('nombre')->get([
                'id', 'codigo', 'nombre', 'direccion', 'zona', 'departamento', 'provincia', 'distrito',
            ]),
            'pantallas' => $user->rol === 'operativo' ? [] : Pantalla::with('componentes:id,pantalla_id,serie,fila,columna,estado')
                ->orderBy('codigo')->get(),
            'operadores' => $user->rol === 'operativo' ? [] : User::where('rol', 'operativo')->where('activo', true)
                ->orderBy('name')->get(['id', 'name', 'email']),
            'tiposPantalla' => TipoPantalla::where('activo', true)->orderBy('nombre')->pluck('nombre'),
            'estadosPantalla' => ServiceCatalog::SCREEN_STATES,
        ]);
    }

    public function store(ServiceOrderRequest $request, ServiceOrderManager $orders)
    {
        $orders->create($request->validated(), $request->user());

        return back()->with('success', 'Servicio creado y asignado.');
    }

    public function update(ServiceOrderRequest $request, ServicioPantalla $servicio, ServiceOrderManager $orders)
    {
        $orders->update($servicio, $request->validated());

        return back()->with('success', 'Asignación actualizada.');
    }

    public function start(Request $request, ServicioPantalla $servicio)
    {
        $this->authorizeOperator($request, $servicio);
        abort_unless(in_array($servicio->estado, ['pendiente', 'observado'], true), 422, 'El servicio no puede iniciarse en su estado actual.');

        $servicio->update([
            'estado' => 'en_curso',
            'iniciado_at' => $servicio->iniciado_at ?? now(),
        ]);

        return back()->with('success', 'Servicio iniciado.');
    }

    public function submit(SubmitServiceRequest $request, ServicioPantalla $servicio, SubmitService $submission)
    {
        $submission->handle($request, $servicio, $request->validated());

        return back()->with('success', 'Servicio enviado a revisión.');
    }

    public function review(ReviewServiceRequest $request, ServicioPantalla $servicio, ReviewService $review)
    {
        $message = $review->handle($servicio, $request->validated(), $request->user());

        return back()->with('success', $message);
    }

    public function updateLocalAddress(
        UpdateServiceLocationRequest $request,
        ServicioPantalla $servicio,
        UpdateServiceLocation $locationUpdater,
    ) {
        $locationUpdater->handle($servicio, $request->validated(), $request->user());

        return back()->with('success', 'Dirección actualizada y vinculada al historial del servicio.');
    }

    public function cancel(Request $request, ServicioPantalla $servicio)
    {
        $this->authorizeCoordinator($request);
        abort_if($servicio->estado === 'finalizado', 422, 'Un servicio finalizado no puede cancelarse.');
        $servicio->update(['estado' => 'cancelado']);

        return back()->with('success', 'Servicio cancelado.');
    }

    public function evidence(Request $request, ServicioPantalla $servicio, EvidenciaServicio $evidencia): StreamedResponse
    {
        abort_unless($evidencia->servicio_id === $servicio->id, 404);
        $allowed = in_array($request->user()->rol, ['admin', 'supervisor'], true)
            || ($request->user()->rol === 'operativo' && $servicio->operador_id === $request->user()->id);
        abort_unless($allowed, 403);
        abort_unless(Storage::disk('local')->exists($evidencia->ruta), 404);

        return Storage::disk('local')->response($evidencia->ruta, $evidencia->nombre_original, [
            'Content-Type' => $evidencia->mime,
            'Content-Disposition' => 'inline; filename="'.addslashes($evidencia->nombre_original).'"',
        ]);
    }

    private function authorizeCoordinator(Request $request): void
    {
        abort_unless(in_array($request->user()?->rol, ['admin', 'supervisor'], true), 403);
    }

    private function authorizeOperator(Request $request, ServicioPantalla $servicio): void
    {
        abort_unless($request->user()?->rol === 'operativo' && $servicio->operador_id === $request->user()->id, 403);
    }
}

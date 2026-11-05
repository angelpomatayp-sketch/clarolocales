<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ComponentePantalla;
use App\Models\Local;
use App\Models\MovimientoPantalla;
use App\Models\Pantalla;
use App\Models\TipoPantalla;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PantallaController extends Controller
{
    private const ESTADOS = [
        'En almacén', 'Operativa', 'En mantenimiento', 'Avería',
        'Sin señal', 'Trasladada', 'Retirada', 'Dada de baja',
    ];

    public function index(Request $request)
    {
        $filters = [
            'search' => trim((string) $request->query('search', '')),
        ];

        return Inertia::render('Admin/Pantallas/Index', [
            'pantallas' => Pantalla::query()
                ->with([
                    'local:id,codigo,nombre',
                    'componentes:id,pantalla_id,serie,fila,columna,estado,activo',
                ])
                ->withCount('componentes')
                ->when($filters['search'] !== '', function ($query) use ($filters) {
                    $search = $filters['search'];
                    $query->where(function ($query) use ($search) {
                        $query->where('serie', 'like', "%{$search}%")
                            ->orWhere('codigo', 'like', "%{$search}%")
                            ->orWhere('modelo', 'like', "%{$search}%")
                            ->orWhere('modelo_equipo', 'like', "%{$search}%")
                            ->orWhere('marca', 'like', "%{$search}%")
                            ->orWhere('numero_solicitud', 'like', "%{$search}%")
                            ->orWhereHas('componentes', fn ($componentes) => $componentes->where('serie', 'like', "%{$search}%"))
                            ->orWhereHas('local', function ($query) use ($search) {
                                $query->where('nombre', 'like', "%{$search}%")
                                    ->orWhere('codigo', 'like', "%{$search}%");
                            });
                    });
                })
                ->orderBy('codigo')
                ->paginate(10)
                ->withQueryString(),
            'locales' => Local::orderBy('zona')
                ->orderBy('departamento')
                ->orderBy('provincia')
                ->orderBy('distrito')
                ->orderBy('nombre')
                ->get([
                    'id', 'codigo', 'nombre', 'zona', 'departamento',
                    'provincia', 'distrito', 'direccion',
                ]),
            'tipos' => TipoPantalla::where('activo', true)->orderBy('nombre')->pluck('nombre'),
            'filters' => $filters,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'serie' => 'required|string|unique:pantallas,serie',
            'numero_solicitud' => 'nullable|string|max:100',
            'marca' => 'nullable|string',
            'modelo' => 'required|string',
            'modelo_equipo' => 'nullable|string',
            'tamanio' => 'nullable|integer|min:1|max:255',
            'filas' => 'nullable|integer|min:1|max:10',
            'columnas' => 'nullable|integer|min:1|max:10',
            'estado' => ['required', 'string', Rule::in(self::ESTADOS)],
            'fecha_registro' => 'nullable|date',
            'local_id' => 'nullable|exists:locales,id',
            'componentes' => 'nullable|array|max:100',
            'componentes.*.serie' => 'required|string|distinct',
            'componentes.*.marca' => 'nullable|string|max:255',
            'componentes.*.modelo' => 'nullable|string|max:255',
            'componentes.*.tamanio' => 'nullable|integer|min:1|max:255',
            'componentes.*.fila' => 'required|integer|min:1|max:10',
            'componentes.*.columna' => 'required|integer|min:1|max:10',
            'componentes.*.estado' => ['nullable', Rule::in(self::ESTADOS)],
        ]);
        $data['fecha_registro'] = $data['fecha_registro'] ?? now()->toDateString();

        if (auth()->user()?->rol === 'operativo') {
            $this->ensureLocalForOperationalState($data['estado'], $data['local_id'] ?? null);
        }
        $this->ensurePrimarySeriesIsNotAComponent($data['serie']);
        $this->validateVideoWallPayload($data);

        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                DB::transaction(function () use (&$data) {
                    $componentes = $data['componentes'] ?? [];
                    unset($data['componentes']);

                    if ($data['modelo'] !== 'Video Wall') {
                        $data['filas'] = null;
                        $data['columnas'] = null;
                        $componentes = [];
                    }

                    $codes = Pantalla::where('codigo', 'like', 'PAN-%')
                        ->lockForUpdate()
                        ->pluck('codigo');

                    $max = $codes->map(fn ($code) => (int) substr($code, 4))->max() ?? 0;
                    $data['codigo'] = 'PAN-'.str_pad($max + 1, 3, '0', STR_PAD_LEFT);

                    $pantalla = Pantalla::create($data);

                    if ($componentes !== []) {
                        $pantalla->componentes()->createMany($this->prepareComponentes($componentes, $data));
                    }

                    MovimientoPantalla::create([
                        'pantalla_id' => $pantalla->id,
                        'user_id' => auth()->id(),
                        'local_nuevo_id' => $pantalla->local_id,
                        'tipo' => $pantalla->local_id ? 'Instalación' : 'Registro',
                        'descripcion' => $pantalla->local_id
                            ? 'Pantalla registrada y asignada al local'
                            : 'Pantalla registrada sin local asignado',
                        'motivo' => 'Estado inicial: '.$pantalla->estado,
                    ]);
                });

                return back();
            } catch (UniqueConstraintViolationException $e) {
                if ($attempt === 3) {
                    throw $e;
                }

                usleep(50000);
            }
        }

        return back();
    }

    public function update(Request $request, Pantalla $pantalla)
    {
        if ($request->user()?->rol === 'operativo') {
            return $this->updateOperativo($request, $pantalla);
        }

        $data = $request->validate([
            'serie' => 'required|string|unique:pantallas,serie,'.$pantalla->id,
            'numero_solicitud' => 'nullable|string|max:100',
            'marca' => 'nullable|string',
            'modelo' => 'required|string',
            'modelo_equipo' => 'nullable|string',
            'tamanio' => 'nullable|integer|min:1|max:255',
            'filas' => 'nullable|integer|min:1|max:10',
            'columnas' => 'nullable|integer|min:1|max:10',
            'estado' => ['required', 'string', Rule::in(self::ESTADOS)],
            'fecha_registro' => 'nullable|date',
            'local_id' => 'nullable|exists:locales,id',
            'motivo' => 'nullable|string',
            'mantenimiento_fecha' => 'nullable|date',
            'mantenimiento_motivo' => 'nullable|string',
            'componentes' => 'nullable|array|max:100',
            'componentes.*.serie' => 'required|string|distinct',
            'componentes.*.marca' => 'nullable|string|max:255',
            'componentes.*.modelo' => 'nullable|string|max:255',
            'componentes.*.tamanio' => 'nullable|integer|min:1|max:255',
            'componentes.*.fila' => 'required|integer|min:1|max:10',
            'componentes.*.columna' => 'required|integer|min:1|max:10',
            'componentes.*.estado' => ['nullable', Rule::in(self::ESTADOS)],
        ]);
        $this->ensurePrimarySeriesIsNotAComponent($data['serie'], $pantalla);
        $this->validateVideoWallPayload($data, $pantalla);

        if ($request->boolean('registrar_historial')) {
            $anteriorLocalId = $pantalla->local_id ? (int) $pantalla->local_id : null;
            $nuevoLocalId = ! empty($data['local_id']) ? (int) $data['local_id'] : null;
            if ($nuevoLocalId !== $anteriorLocalId) {
                MovimientoPantalla::create([
                    'pantalla_id' => $pantalla->id,
                    'user_id' => auth()->id(),
                    'tipo' => 'Traslado',
                    'descripcion' => 'Pantalla trasladada a nuevo local',
                    'local_anterior_id' => $anteriorLocalId,
                    'local_nuevo_id' => $nuevoLocalId,
                    'motivo' => $data['motivo'] ?? null,
                ]);
            }
            if (! empty($data['estado']) && $data['estado'] !== $pantalla->estado) {
                MovimientoPantalla::create([
                    'pantalla_id' => $pantalla->id,
                    'user_id' => auth()->id(),
                    'tipo' => 'Cambio de estado',
                    'descripcion' => $pantalla->estado.' → '.$data['estado'],
                    'motivo' => $data['motivo'] ?? null,
                ]);
            }
        }
        if ($request->boolean('registrar_mantenimiento')) {
            $fecha = ! empty($data['mantenimiento_fecha'])
                ? Carbon::parse($data['mantenimiento_fecha'])
                : now();

            MovimientoPantalla::create([
                'pantalla_id' => $pantalla->id,
                'user_id' => auth()->id(),
                'tipo' => 'Mantenimiento',
                'descripcion' => 'Mantenimiento realizado ('.$fecha->format('d/m/Y').')',
                'motivo' => $data['mantenimiento_motivo'] ?? null,
            ]);
        }

        unset(
            $data['registrar_historial'],
            $data['registrar_mantenimiento'],
            $data['motivo'],
            $data['mantenimiento_fecha'],
            $data['mantenimiento_motivo']
        );
        DB::transaction(function () use ($pantalla, $data) {
            $componentes = $data['componentes'] ?? [];
            $pantallaData = $data;
            unset(
                $pantallaData['componentes'],
                $pantallaData['registrar_historial'],
                $pantallaData['registrar_mantenimiento'],
                $pantallaData['motivo'],
                $pantallaData['mantenimiento_fecha'],
                $pantallaData['mantenimiento_motivo']
            );

            if ($pantallaData['modelo'] !== 'Video Wall') {
                $pantallaData['filas'] = null;
                $pantallaData['columnas'] = null;
                $componentes = [];
            }

            $pantalla->update($pantallaData);
            $pantalla->componentes()->delete();

            if ($componentes !== []) {
                $pantalla->componentes()->createMany($this->prepareComponentes($componentes, $pantallaData));
            }
        });

        return back();
    }

    private function validateVideoWallPayload(array $data, ?Pantalla $pantalla = null): void
    {
        if (($data['modelo'] ?? null) !== 'Video Wall') {
            return;
        }

        $filas = (int) ($data['filas'] ?? 0);
        $columnas = (int) ($data['columnas'] ?? 0);
        $componentes = $data['componentes'] ?? [];
        $errors = [];

        if ($filas < 1 || $columnas < 1) {
            $errors['filas'] = 'Indica la configuración de filas y columnas del Video Wall.';
        } elseif (count($componentes) !== $filas * $columnas) {
            $errors['componentes'] = 'Registra una serie por cada panel de la configuración seleccionada.';
        }

        $positions = [];
        $expectedPositions = [];
        for ($fila = 1; $fila <= $filas; $fila++) {
            for ($columna = 1; $columna <= $columnas; $columna++) {
                $expectedPositions[] = $fila.'-'.$columna;
            }
        }

        foreach ($componentes as $index => $componente) {
            $serie = trim((string) ($componente['serie'] ?? ''));
            $position = ((int) ($componente['fila'] ?? 0)).'-'.((int) ($componente['columna'] ?? 0));
            $positions[] = $position;

            $exists = ComponentePantalla::where('serie', $serie)
                ->when($pantalla, fn ($query) => $query->where('pantalla_id', '!=', $pantalla->id))
                ->exists();

            if ($serie !== '' && $exists) {
                $errors["componentes.$index.serie"] = 'Esta serie ya pertenece a otro Video Wall.';
            }

            if ($serie !== '' && ($serie === trim((string) ($data['serie'] ?? '')) || Pantalla::where('serie', $serie)->exists())) {
                $errors["componentes.$index.serie"] = 'Esta serie ya está registrada como serie principal de una pantalla.';
            }
        }

        if (count($positions) !== count(array_unique($positions))) {
            $errors['componentes'] = 'No puede repetirse una posición dentro del Video Wall.';
        } elseif (array_diff($expectedPositions, $positions) !== [] || array_diff($positions, $expectedPositions) !== []) {
            $errors['componentes'] = 'Las posiciones deben corresponder a la configuración seleccionada.';
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    private function prepareComponentes(array $componentes, array $pantallaData): array
    {
        return collect($componentes)->map(fn ($componente) => [
            'serie' => trim($componente['serie']),
            'marca' => $componente['marca'] ?? ($pantallaData['marca'] ?? null),
            'modelo' => $componente['modelo'] ?? ($pantallaData['modelo_equipo'] ?? null),
            'tamanio' => $componente['tamanio'] ?? ($pantallaData['tamanio'] ?? null),
            'fila' => (int) $componente['fila'],
            'columna' => (int) $componente['columna'],
            'estado' => $componente['estado'] ?? ($pantallaData['estado'] ?? 'Operativa'),
            'activo' => true,
            'fecha_instalacion' => $pantallaData['fecha_registro'] ?? now()->toDateString(),
        ])->all();
    }

    private function ensurePrimarySeriesIsNotAComponent(string $serie, ?Pantalla $pantalla = null): void
    {
        $exists = ComponentePantalla::where('serie', trim($serie))
            ->when($pantalla, fn ($query) => $query->where('pantalla_id', '!=', $pantalla->id))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'serie' => 'Esta serie ya está registrada como componente de un Video Wall.',
            ]);
        }
    }

    private function updateOperativo(Request $request, Pantalla $pantalla)
    {
        $request->validate([
            'operacion' => ['required', Rule::in(['actualizacion', 'mantenimiento'])],
        ]);

        if ($request->input('operacion') === 'mantenimiento') {
            $data = $request->validate([
                'operacion' => ['required', Rule::in(['mantenimiento'])],
                'estado' => ['required', Rule::in(self::ESTADOS)],
                'mantenimiento_fecha' => ['required', 'date'],
                'mantenimiento_motivo' => ['required', 'string', 'max:500'],
            ]);

            $this->ensureLocalForOperationalState($data['estado'], $pantalla->local_id);

            DB::transaction(function () use ($pantalla, $data) {
                MovimientoPantalla::create([
                    'pantalla_id' => $pantalla->id,
                    'user_id' => auth()->id(),
                    'tipo' => 'Mantenimiento',
                    'descripcion' => 'Mantenimiento realizado ('
                        .Carbon::parse($data['mantenimiento_fecha'])->format('d/m/Y')
                        .'). Estado: '.$pantalla->estado.' → '.$data['estado'],
                    'motivo' => $data['mantenimiento_motivo'],
                ]);

                $pantalla->update(['estado' => $data['estado']]);
            });

            return back();
        }

        $rules = [
            'operacion' => ['required', Rule::in(['actualizacion'])],
            'estado' => ['required', Rule::in(self::ESTADOS)],
            'local_id' => ['nullable', 'exists:locales,id'],
            'motivo' => ['nullable', 'string', 'max:500'],
        ];

        if ($pantalla->modelo === 'Video Wall') {
            $rules = array_merge($rules, [
                'filas' => ['required', 'integer', 'min:1', 'max:10'],
                'columnas' => ['required', 'integer', 'min:1', 'max:10'],
                'componentes' => ['required', 'array', 'max:100'],
                'componentes.*.serie' => ['required', 'string', 'distinct'],
                'componentes.*.fila' => ['required', 'integer', 'min:1', 'max:10'],
                'componentes.*.columna' => ['required', 'integer', 'min:1', 'max:10'],
                'componentes.*.estado' => ['nullable', Rule::in(self::ESTADOS)],
            ]);
        }

        $data = $request->validate($rules);
        $this->ensureLocalForOperationalState($data['estado'], $data['local_id'] ?? null);

        if ($pantalla->modelo === 'Video Wall') {
            $this->validateVideoWallPayload([
                ...$data,
                'modelo' => $pantalla->modelo,
                'serie' => $pantalla->serie,
            ], $pantalla);
        }

        DB::transaction(function () use ($pantalla, $data) {
            $anteriorLocalId = $pantalla->local_id ? (int) $pantalla->local_id : null;
            $nuevoLocalId = ! empty($data['local_id']) ? (int) $data['local_id'] : null;

            if ($nuevoLocalId !== $anteriorLocalId) {
                $tipo = $anteriorLocalId === null
                    ? 'Instalación'
                    : ($nuevoLocalId === null ? 'Retiro' : 'Traslado');

                MovimientoPantalla::create([
                    'pantalla_id' => $pantalla->id,
                    'user_id' => auth()->id(),
                    'local_anterior_id' => $anteriorLocalId,
                    'local_nuevo_id' => $nuevoLocalId,
                    'tipo' => $tipo,
                    'descripcion' => $tipo.' de pantalla registrada en campo',
                    'motivo' => $data['motivo'] ?? null,
                ]);
            }

            if ($data['estado'] !== $pantalla->estado) {
                MovimientoPantalla::create([
                    'pantalla_id' => $pantalla->id,
                    'user_id' => auth()->id(),
                    'tipo' => 'Cambio de estado',
                    'descripcion' => $pantalla->estado.' → '.$data['estado'],
                    'motivo' => $data['motivo'] ?? null,
                ]);
            }

            if ($pantalla->modelo === 'Video Wall') {
                $seriesAnteriores = $pantalla->componentes()
                    ->orderBy('fila')
                    ->orderBy('columna')
                    ->pluck('serie')
                    ->all();
                $seriesNuevas = collect($data['componentes'])->pluck('serie')->all();
                $inventarioCambio = (int) $pantalla->filas !== (int) $data['filas']
                    || (int) $pantalla->columnas !== (int) $data['columnas']
                    || $seriesAnteriores !== $seriesNuevas;

                if ($inventarioCambio) {
                    MovimientoPantalla::create([
                        'pantalla_id' => $pantalla->id,
                        'user_id' => auth()->id(),
                        'tipo' => 'Inventario de Video Wall',
                        'descripcion' => 'Configuración '.$data['filas'].'x'.$data['columnas']
                            .' con '.count($data['componentes']).' paneles verificados',
                        'motivo' => $data['motivo'] ?? 'Series corroboradas en campo',
                    ]);
                }

                $pantalla->componentes()->delete();
                $pantalla->componentes()->createMany($this->prepareComponentes(
                    $data['componentes'],
                    [
                        'marca' => $pantalla->marca,
                        'modelo_equipo' => $pantalla->modelo_equipo,
                        'tamanio' => $pantalla->tamanio,
                        'estado' => $data['estado'],
                        'fecha_registro' => $pantalla->fecha_registro,
                    ]
                ));
            }

            $pantalla->update([
                'estado' => $data['estado'],
                'local_id' => $nuevoLocalId,
                'filas' => $pantalla->modelo === 'Video Wall' ? $data['filas'] : $pantalla->filas,
                'columnas' => $pantalla->modelo === 'Video Wall' ? $data['columnas'] : $pantalla->columnas,
            ]);
        });

        return back();
    }

    private function ensureLocalForOperationalState(string $estado, mixed $localId): void
    {
        if (in_array($estado, ['Operativa', 'En mantenimiento', 'Avería', 'Sin señal'], true) && empty($localId)) {
            throw ValidationException::withMessages([
                'local_id' => 'Selecciona el local donde se encuentra la pantalla para usar este estado.',
            ]);
        }
    }

    public function destroy(Pantalla $pantalla)
    {
        abort_unless(auth()->user()?->rol === 'admin', 403, 'Sin permisos para eliminar pantallas.');

        $pantalla->movimientos()->delete();
        $pantalla->delete();

        return back();
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Local;
use App\Models\MovimientoLocal;
use App\Models\Zona;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LocalController extends Controller
{
    public function index()
    {
        $locales = Local::withCount('pantallas')->orderBy('codigo')->get();
        $zonas   = Zona::orderBy('nombre')->get(['id','nombre','color','departamentos']);
        $zonaMap = $zonas->flatMap(fn($z) => collect($z->departamentos)->mapWithKeys(fn($d) => [$d => $z->nombre]))->toArray();
        return Inertia::render('Admin/Locales/Index', ['locales' => $locales, 'zonas' => $zonas, 'zonaMap' => $zonaMap]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'        => 'required|string',
            'tipo'          => 'required|in:DAC,CAC,CADENA',
            'estado'        => 'required|string',
            'zona'          => 'required|string',
            'departamento'  => 'required|string',
            'provincia'     => 'required|string',
            'distrito'      => 'required|string',
            'direccion'     => 'required|string',
            'lat'              => 'nullable|numeric',
            'lng'              => 'nullable|numeric',
            'fecha_apertura'   => 'nullable|date',
            'contacto_nombre'  => 'nullable|string',
            'contacto_celular' => 'nullable|string',
        ]);
        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                DB::transaction(function () use (&$data) {
                    $data['codigo'] = $this->generateCodigo($data['tipo']);
                    Local::create($data);
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

    public function update(Request $request, Local $local)
    {
        $data = $request->validate([
            'nombre'        => 'required|string',
            'tipo'          => 'required|in:DAC,CAC,CADENA',
            'estado'        => 'required|string',
            'zona'          => 'required|string',
            'departamento'  => 'required|string',
            'provincia'     => 'required|string',
            'distrito'      => 'required|string',
            'direccion'     => 'required|string',
            'lat'              => 'nullable|numeric',
            'lng'              => 'nullable|numeric',
            'fecha_apertura'   => 'nullable|date',
            'contacto_nombre'  => 'nullable|string',
            'contacto_celular' => 'nullable|string',
            'motivo'           => 'nullable|string',
        ]);
        if ($request->boolean('registrar_historial')) {
            if (!empty($data['direccion']) && $data['direccion'] !== $local->direccion) {
                MovimientoLocal::create([
                    'local_id'    => $local->id,
                    'user_id'     => auth()->id(),
                    'tipo'        => 'Cambio de ubicación',
                    'descripcion' => 'Dirección anterior: ' . $local->direccion,
                    'motivo'      => $data['motivo'] ?? null,
                ]);
            }
            if (!empty($data['estado']) && $data['estado'] !== $local->estado) {
                MovimientoLocal::create([
                    'local_id'    => $local->id,
                    'user_id'     => auth()->id(),
                    'tipo'        => 'Cambio de estado',
                    'descripcion' => $local->estado . ' → ' . $data['estado'],
                    'motivo'      => $data['motivo'] ?? null,
                ]);
            }
        }

        unset($data['registrar_historial'], $data['motivo']);
        $local->update($data);
        return back();
    }

    private function generateCodigo(string $tipo): string
    {
        $prefix = match($tipo) {
            'DAC'    => 'DAC',
            'CAC'    => 'CAC',
            'CADENA' => 'CAD',
            default  => 'LOC',
        };
        $codes = Local::where('codigo', 'like', $prefix . '-%')
            ->lockForUpdate()
            ->pluck('codigo');
        $max   = $codes->map(fn($c) => (int) substr($c, strlen($prefix) + 1))->max() ?? 0;
        return $prefix . '-' . str_pad($max + 1, 3, '0', STR_PAD_LEFT);
    }

    public function destroy(Local $local)
    {
        abort_unless(auth()->user()?->rol === 'admin', 403, 'Sin permisos para eliminar locales.');

        if ($local->pantallas()->exists()) {
            return back()->withErrors(['local' => 'No se puede eliminar: el local tiene pantallas asignadas.']);
        }
        $local->movimientos()->delete();
        $local->delete();
        return back();
    }
}

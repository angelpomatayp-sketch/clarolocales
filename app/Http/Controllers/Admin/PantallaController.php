<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Local;
use App\Models\MovimientoPantalla;
use App\Models\Pantalla;
use App\Models\TipoPantalla;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PantallaController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Pantallas/Index', [
            'pantallas' => Pantalla::with('local:id,codigo,nombre')->orderBy('codigo')->get(),
            'locales'   => Local::orderBy('codigo')->get(['id','codigo','nombre']),
            'tipos'     => TipoPantalla::where('activo', true)->orderBy('nombre')->pluck('nombre'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'serie'           => 'required|string|unique:pantallas,serie',
            'numero_guia'     => 'nullable|string',
            'marca'           => 'nullable|string',
            'modelo'          => 'required|string',
            'modelo_equipo'   => 'nullable|string',
            'tamanio'         => 'nullable|integer|min:1|max:255',
            'posicion'        => 'nullable|string',
            'estado'          => 'required|string',
            'fecha_registro'  => 'nullable|date',
            'local_id'        => 'nullable|exists:locales,id',
        ]);

        for ($attempt = 1; $attempt <= 3; $attempt++) {
            try {
                DB::transaction(function () use (&$data) {
                    $codes = Pantalla::where('codigo', 'like', 'PAN-%')
                        ->lockForUpdate()
                        ->pluck('codigo');

                    $max = $codes->map(fn($code) => (int) substr($code, 4))->max() ?? 0;
                    $data['codigo'] = 'PAN-' . str_pad($max + 1, 3, '0', STR_PAD_LEFT);

                    Pantalla::create($data);
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
        $data = $request->validate([
            'serie'          => 'required|string|unique:pantallas,serie,'.$pantalla->id,
            'numero_guia'    => 'nullable|string',
            'marca'          => 'nullable|string',
            'modelo'         => 'required|string',
            'modelo_equipo'  => 'nullable|string',
            'tamanio'        => 'nullable|integer|min:1|max:255',
            'posicion'       => 'nullable|string',
            'estado'         => 'required|string',
            'fecha_registro' => 'nullable|date',
            'local_id'       => 'nullable|exists:locales,id',
            'motivo'         => 'nullable|string',
            'mantenimiento_fecha'  => 'nullable|date',
            'mantenimiento_motivo' => 'nullable|string',
        ]);
        if ($request->boolean('registrar_historial')) {
            $anteriorLocalId = $pantalla->local_id ? (int) $pantalla->local_id : null;
            $nuevoLocalId    = !empty($data['local_id']) ? (int) $data['local_id'] : null;
            if ($nuevoLocalId !== $anteriorLocalId) {
                MovimientoPantalla::create([
                    'pantalla_id'       => $pantalla->id,
                    'user_id'           => auth()->id(),
                    'tipo'              => 'Traslado',
                    'descripcion'       => 'Pantalla trasladada a nuevo local',
                    'local_anterior_id' => $anteriorLocalId,
                    'local_nuevo_id'    => $nuevoLocalId,
                    'motivo'            => $data['motivo'] ?? null,
                ]);
            }
            if (!empty($data['estado']) && $data['estado'] !== $pantalla->estado) {
                MovimientoPantalla::create([
                    'pantalla_id' => $pantalla->id,
                    'user_id'     => auth()->id(),
                    'tipo'        => 'Cambio de estado',
                    'descripcion' => $pantalla->estado . ' → ' . $data['estado'],
                    'motivo'      => $data['motivo'] ?? null,
                ]);
            }
        }
        if ($request->boolean('registrar_mantenimiento')) {
            $fecha = !empty($data['mantenimiento_fecha'])
                ? Carbon::parse($data['mantenimiento_fecha'])
                : now();

            MovimientoPantalla::create([
                'pantalla_id' => $pantalla->id,
                'user_id'     => auth()->id(),
                'tipo'        => 'Mantenimiento',
                'descripcion' => 'Mantenimiento realizado (' . $fecha->format('d/m/Y') . ')',
                'motivo'      => $data['mantenimiento_motivo'] ?? null,
            ]);
        }

        unset(
            $data['registrar_historial'],
            $data['registrar_mantenimiento'],
            $data['motivo'],
            $data['mantenimiento_fecha'],
            $data['mantenimiento_motivo']
        );
        $pantalla->update($data);
        return back();
    }

    public function destroy(Pantalla $pantalla)
    {
        abort_unless(auth()->user()?->rol === 'admin', 403, 'Sin permisos para eliminar pantallas.');

        $pantalla->movimientos()->delete();
        $pantalla->delete();
        return back();
    }
}

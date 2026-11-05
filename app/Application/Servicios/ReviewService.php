<?php

namespace App\Application\Servicios;

use App\Models\MovimientoPantalla;
use App\Models\Pantalla;
use App\Models\ServicioEquipo;
use App\Models\ServicioPantalla;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ReviewService
{
    public function __construct(private readonly EquipmentSeriesValidator $seriesValidator) {}

    public function handle(ServicioPantalla $service, array $data, User $reviewer): string
    {
        abort_unless($service->estado === 'en_revision', 422, 'El servicio no está pendiente de revisión.');

        if ($data['decision'] === 'observar') {
            $service->update([
                'estado' => 'observado',
                'motivo_observacion' => $data['motivo_observacion'],
                'revisado_por' => $reviewer->id,
            ]);

            return 'Servicio devuelto al operador con observaciones.';
        }

        DB::transaction(function () use ($service, $reviewer) {
            if ($service->tipo === 'instalacion') {
                $this->approveInstallation($service);
            } else {
                $this->approveExistingScreenService($service);
            }

            $service->update([
                'estado' => 'finalizado',
                'revisado_por' => $reviewer->id,
                'finalizado_at' => now(),
                'motivo_observacion' => null,
            ]);
        });

        return 'Servicio aprobado e inventario actualizado.';
    }

    private function approveInstallation(ServicioPantalla $service): void
    {
        $items = $service->equipos()->orderBy('orden')->get();
        abort_if($items->isEmpty(), 422, 'La instalación no tiene equipos asignados.');
        $this->seriesValidator->validateStored($items);

        $max = Pantalla::where('codigo', 'like', 'PAN-%')
            ->lockForUpdate()
            ->pluck('codigo')
            ->map(fn ($code) => (int) substr($code, 4))
            ->max() ?? 0;

        $firstScreenId = null;
        foreach ($items->where('resultado', 'instalado')->values() as $offset => $item) {
            $screen = $this->createInstalledScreen($service, $item, $max + $offset + 1);
            $item->update(['pantalla_id' => $screen->id]);
            $firstScreenId ??= $screen->id;
            $this->createMovement($service, $screen, 'Instalación', null, $service->local_id);
        }

        $service->update(['pantalla_id' => $firstScreenId]);
    }

    private function createInstalledScreen(ServicioPantalla $service, ServicioEquipo $item, int $sequence): Pantalla
    {
        $equipment = $item->datos_equipo;
        $screen = Pantalla::create([
            'codigo' => 'PAN-'.str_pad($sequence, 3, '0', STR_PAD_LEFT),
            'serie' => trim($equipment['serie']),
            'numero_solicitud' => $service->numero_solicitud,
            'marca' => $equipment['marca'] ?? null,
            'modelo' => $equipment['modelo'],
            'modelo_equipo' => $equipment['modelo_equipo'] ?? null,
            'tamanio' => $equipment['tamanio'] ?? null,
            'filas' => $equipment['modelo'] === 'Video Wall' ? ($equipment['filas'] ?? null) : null,
            'columnas' => $equipment['modelo'] === 'Video Wall' ? ($equipment['columnas'] ?? null) : null,
            'estado' => $item->estado_resultante,
            'fecha_registro' => now()->toDateString(),
            'local_id' => $service->local_id,
        ]);

        if ($equipment['modelo'] === 'Video Wall') {
            $screen->componentes()->createMany(collect($equipment['componentes'] ?? [])->map(fn ($component) => [
                'serie' => trim($component['serie']),
                'marca' => $equipment['marca'] ?? null,
                'modelo' => $equipment['modelo_equipo'] ?? null,
                'tamanio' => $equipment['tamanio'] ?? null,
                'fila' => $component['fila'],
                'columna' => $component['columna'],
                'estado' => $item->estado_resultante,
                'activo' => true,
                'fecha_instalacion' => now()->toDateString(),
            ])->all());
        }

        return $screen;
    }

    private function approveExistingScreenService(ServicioPantalla $service): void
    {
        $screen = $service->pantalla;
        abort_unless($screen, 422, 'La pantalla asignada al servicio ya no existe.');

        if ($service->tipo === 'desmonte') {
            $screen->update([
                'estado' => $service->estado_resultante,
                'local_id' => null,
            ]);
            $screen->componentes()->update([
                'estado' => $service->estado_resultante,
                'fecha_retiro' => now()->toDateString(),
            ]);
            $this->createMovement($service, $screen, 'Desmonte', $service->local_id, null);

            return;
        }

        $screen->update(['estado' => $service->estado_resultante]);
        $screen->componentes()->update(['estado' => $service->estado_resultante]);
        $this->createMovement($service, $screen, 'Mantenimiento', null, $service->local_id);
    }

    private function createMovement(ServicioPantalla $service, Pantalla $screen, string $type, ?int $previousLocal, ?int $newLocal): void
    {
        MovimientoPantalla::create([
            'pantalla_id' => $screen->id,
            'servicio_id' => $service->id,
            'user_id' => $service->operador_id,
            'local_anterior_id' => $previousLocal,
            'local_nuevo_id' => $newLocal,
            'tipo' => $type,
            'descripcion' => $service->informe_tecnico,
            'motivo' => $service->observaciones,
        ]);
    }
}

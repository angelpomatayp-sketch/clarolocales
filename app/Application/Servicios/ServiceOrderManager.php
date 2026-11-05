<?php

namespace App\Application\Servicios;

use App\Models\ServicioPantalla;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ServiceOrderManager
{
    public function create(array $data, User $creator): ServicioPantalla
    {
        return DB::transaction(function () use ($data, $creator) {
            $equipmentPlan = $data['equipos_plan'] ?? [];
            unset($data['equipos_plan']);

            $last = ServicioPantalla::where('codigo', 'like', 'SER-%')
                ->lockForUpdate()
                ->pluck('codigo')
                ->map(fn ($code) => (int) substr($code, 4))
                ->max() ?? 0;

            if ($data['tipo'] === 'instalacion') {
                $data['pantalla_id'] = null;
            }

            $service = ServicioPantalla::create([
                ...$data,
                'codigo' => 'SER-'.str_pad($last + 1, 5, '0', STR_PAD_LEFT),
                'estado' => 'pendiente',
                'creado_por' => $creator->id,
            ]);

            $this->syncEquipmentPlan($service, $equipmentPlan);

            return $service;
        });
    }

    public function update(ServicioPantalla $service, array $data): ServicioPantalla
    {
        abort_unless($service->estado === 'pendiente', 422, 'Solo puede editarse una asignación que todavía no ha iniciado.');

        return DB::transaction(function () use ($service, $data) {
            $equipmentPlan = $data['equipos_plan'] ?? [];
            unset($data['equipos_plan']);

            if ($data['tipo'] === 'instalacion') {
                $data['pantalla_id'] = null;
            }

            $service->update($data);
            $service->equipos()->delete();
            $this->syncEquipmentPlan($service, $equipmentPlan);

            return $service->refresh();
        });
    }

    private function syncEquipmentPlan(ServicioPantalla $service, array $equipmentPlan): void
    {
        if ($service->tipo !== 'instalacion') {
            return;
        }

        $service->equipos()->createMany(
            collect($equipmentPlan)->values()->map(fn ($item, $index) => [
                'orden' => $index + 1,
                'tipo_esperado' => $item['tipo_esperado'] ?? null,
                'resultado' => 'pendiente',
            ])->all()
        );
    }
}

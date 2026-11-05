<?php

namespace App\Application\Servicios;

use App\Models\MovimientoLocal;
use App\Models\ServicioPantalla;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateServiceLocation
{
    private const LOCATION_FIELDS = ['zona', 'departamento', 'provincia', 'distrito', 'direccion'];

    public function handle(ServicioPantalla $service, array $data, User $reviewer): void
    {
        abort_unless($service->tipo === 'mantenimiento', 422, 'El cambio directo de dirección está disponible para mantenimientos.');
        abort_unless($service->estado === 'en_revision', 422, 'La dirección solo puede actualizarse durante la revisión del servicio.');

        $local = $service->local()->firstOrFail();
        $before = collect($local->only(self::LOCATION_FIELDS))->all();
        $after = collect($data)->only(self::LOCATION_FIELDS)->all();

        if ($before === $after) {
            throw ValidationException::withMessages([
                'direccion' => 'La ubicación ingresada es igual a la registrada actualmente.',
            ]);
        }

        DB::transaction(function () use ($local, $service, $reviewer, $data, $before, $after) {
            $local->update([...$after, 'lat' => null, 'lng' => null]);
            MovimientoLocal::create([
                'local_id' => $local->id,
                'servicio_id' => $service->id,
                'user_id' => $reviewer->id,
                'tipo' => 'Cambio de ubicación',
                'descripcion' => $before['direccion'].' → '.$after['direccion'],
                'motivo' => $data['motivo'],
                'datos_anteriores' => $before,
                'datos_nuevos' => $after,
            ]);
        });
    }
}

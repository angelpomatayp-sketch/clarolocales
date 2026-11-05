<?php

namespace App\Application\Servicios;

use App\Models\ServicioEquipo;
use App\Models\ServicioPantalla;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ServiceEvidenceManager
{
    public function assertRequired(Request $request, ServicioPantalla $service): void
    {
        $required = ['documento' => 'evidencia_documento', 'resultado' => 'evidencia_resultado'];
        if ($service->tipo !== 'instalacion') {
            $required['serie'] = 'evidencia_serie';
        }
        if (in_array($service->tipo, ['mantenimiento', 'desmonte'], true)) {
            $required['inicial'] = 'evidencia_inicial';
        }

        $errors = [];
        foreach ($required as $type => $field) {
            if (! $request->hasFile($field) && ! $service->evidencias()->where('tipo', $type)->exists()) {
                $errors[$field] = 'Esta evidencia fotográfica es obligatoria.';
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }

    public function store(
        UploadedFile $file,
        ServicioPantalla $service,
        string $type,
        int $userId,
        array &$storedPaths,
        ?ServicioEquipo $equipment = null
    ): void {
        $name = $type.'-'.uniqid().'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('servicios/'.$service->id, $name, 'local');
        if (! $path) {
            throw ValidationException::withMessages(['evidencias' => 'No fue posible guardar una de las fotografías.']);
        }

        $storedPaths[] = $path;
        $service->evidencias()->create([
            'servicio_equipo_id' => $equipment?->id,
            'user_id' => $userId,
            'tipo' => $type,
            'ruta' => $path,
            'nombre_original' => $file->getClientOriginalName(),
            'mime' => $file->getMimeType() ?: 'application/octet-stream',
            'tamanio' => $file->getSize(),
            'orden' => $service->evidencias()->count(),
        ]);
    }

    public function rollbackFiles(array $paths): void
    {
        foreach ($paths as $path) {
            Storage::disk('local')->delete($path);
        }
    }
}

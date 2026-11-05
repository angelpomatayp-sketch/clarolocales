<?php

namespace App\Application\Servicios;

use App\Models\ComponentePantalla;
use App\Models\Pantalla;
use App\Models\ServicioPantalla;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class EquipmentSeriesValidator
{
    public function validateSubmitted(Request $request, ServicioPantalla $service, array $items): void
    {
        $planned = $service->equipos()->with('evidencias')->get()->keyBy('id');
        $errors = [];
        $seenSeries = [];

        if (count($items) !== $planned->count()) {
            $errors['equipos'] = 'Debes registrar el resultado de todos los equipos asignados.';
        }

        foreach ($items as $index => $itemData) {
            $item = $planned->get((int) ($itemData['id'] ?? 0));
            if (! $item) {
                $errors["equipos.$index.id"] = 'Este equipo no pertenece al servicio.';

                continue;
            }

            if (($itemData['resultado'] ?? null) === 'no_instalado') {
                if (blank($itemData['motivo_no_instalado'] ?? null)) {
                    $errors["equipos.$index.motivo_no_instalado"] = 'Indica por qué no se instaló este equipo.';
                }

                continue;
            }

            foreach (['serie' => 'serie', 'modelo' => 'tipo de pantalla', 'estado_resultante' => 'estado resultante'] as $field => $label) {
                if (blank($itemData[$field] ?? null)) {
                    $errors["equipos.$index.$field"] = 'Completa el campo '.$label.'.';
                }
            }

            if (! $request->hasFile("equipos.$index.evidencia_serie") && $item->evidencias->where('tipo', 'serie')->isEmpty()) {
                $errors["equipos.$index.evidencia_serie"] = 'La fotografía de la serie es obligatoria.';
            }

            $this->collectErrors($itemData, "equipos.$index", $seenSeries, $errors);
        }

        $this->throwWhenInvalid($errors);
    }

    public function validateStored(Collection $items): void
    {
        $errors = [];
        $seenSeries = [];

        foreach ($items->where('resultado', 'instalado')->values() as $index => $item) {
            $data = $item->datos_equipo ?? [];
            foreach (['serie', 'modelo'] as $field) {
                if (blank($data[$field] ?? null)) {
                    $errors["equipos.$index.$field"] = 'Faltan datos obligatorios del equipo instalado.';
                }
            }
            if (blank($item->estado_resultante)) {
                $errors["equipos.$index.estado_resultante"] = 'Falta el estado resultante del equipo instalado.';
            }
            $this->collectErrors($data, "equipos.$index", $seenSeries, $errors);
        }

        $this->throwWhenInvalid($errors);
    }

    private function collectErrors(array $data, string $prefix, array &$seenSeries, array &$errors): void
    {
        $series = trim((string) ($data['serie'] ?? ''));
        if ($series !== '') {
            if (in_array($series, $seenSeries, true) || $this->exists($series)) {
                $errors[$prefix.'.serie'] = 'Esta serie ya está registrada o repetida en el servicio.';
            }
            $seenSeries[] = $series;
        }

        if (($data['modelo'] ?? null) !== 'Video Wall') {
            return;
        }

        $rows = (int) ($data['filas'] ?? 0);
        $columns = (int) ($data['columnas'] ?? 0);
        $components = $data['componentes'] ?? [];
        if ($rows < 1 || $columns < 1 || count($components) !== $rows * $columns) {
            $errors[$prefix.'.componentes'] = 'Selecciona la configuración y registra una serie por panel.';
        }

        foreach ($components as $index => $component) {
            $componentSeries = trim((string) ($component['serie'] ?? ''));
            if ($componentSeries === '' || in_array($componentSeries, $seenSeries, true) || $this->exists($componentSeries)) {
                $errors[$prefix.".componentes.$index.serie"] = 'Esta serie está vacía, registrada o repetida.';
            }
            $seenSeries[] = $componentSeries;
        }
    }

    private function exists(string $series): bool
    {
        return Pantalla::where('serie', $series)->exists()
            || ComponentePantalla::where('serie', $series)->exists();
    }

    private function throwWhenInvalid(array $errors): void
    {
        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }
}

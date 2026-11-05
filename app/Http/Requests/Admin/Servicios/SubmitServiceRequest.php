<?php

namespace App\Http\Requests\Admin\Servicios;

use App\Domain\Servicios\ServiceCatalog;
use App\Models\ServicioPantalla;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        $service = $this->route('servicio');

        return $service instanceof ServicioPantalla
            && $this->user()?->rol === 'operativo'
            && $service->operador_id === $this->user()->id;
    }

    public function rules(): array
    {
        /** @var ServicioPantalla $service */
        $service = $this->route('servicio');
        $resultStates = $service->tipo === 'desmonte'
            ? ServiceCatalog::REMOVAL_STATES
            : ServiceCatalog::SCREEN_STATES;
        $image = ServiceCatalog::IMAGE_RULES;

        $rules = [
            'numero_solicitud' => ['required', 'string', 'max:100'],
            'informe_tecnico' => ['required', 'string', 'max:5000'],
            'observaciones' => ['nullable', 'string', 'max:3000'],
            'persona_recepcion' => ['required', 'string', 'max:255'],
            'estado_resultante' => [$service->tipo === 'instalacion' ? 'nullable' : 'required', Rule::in($resultStates)],
            'evidencia_documento' => ['nullable', ...$image],
            'evidencia_serie' => ['nullable', ...$image],
            'evidencia_inicial' => ['nullable', ...$image],
            'evidencia_resultado' => ['nullable', ...$image],
            'evidencias_adicionales' => ['nullable', 'array', 'max:4'],
            'evidencias_adicionales.*' => $image,
        ];

        if ($service->tipo !== 'instalacion') {
            return $rules;
        }

        return array_merge($rules, [
            'equipos' => ['required', 'array', 'min:1', 'max:20'],
            'equipos.*.id' => ['required', 'integer', 'distinct'],
            'equipos.*.resultado' => ['required', Rule::in(['instalado', 'no_instalado'])],
            'equipos.*.serie' => ['nullable', 'string', 'max:255'],
            'equipos.*.marca' => ['nullable', 'string', 'max:255'],
            'equipos.*.modelo' => ['nullable', 'string', 'max:255'],
            'equipos.*.modelo_equipo' => ['nullable', 'string', 'max:255'],
            'equipos.*.tamanio' => ['nullable', 'integer', 'min:1', 'max:255'],
            'equipos.*.estado_resultante' => ['nullable', Rule::in(ServiceCatalog::SCREEN_STATES)],
            'equipos.*.motivo_no_instalado' => ['nullable', 'string', 'max:1000'],
            'equipos.*.filas' => ['nullable', 'integer', 'min:1', 'max:10'],
            'equipos.*.columnas' => ['nullable', 'integer', 'min:1', 'max:10'],
            'equipos.*.componentes' => ['nullable', 'array', 'max:100'],
            'equipos.*.componentes.*.serie' => ['required', 'string'],
            'equipos.*.componentes.*.fila' => ['required', 'integer', 'min:1', 'max:10'],
            'equipos.*.componentes.*.columna' => ['required', 'integer', 'min:1', 'max:10'],
            'equipos.*.evidencia_serie' => ['nullable', ...$image],
        ]);
    }
}

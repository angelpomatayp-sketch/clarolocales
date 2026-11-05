<?php

namespace App\Http\Requests\Admin\Servicios;

use App\Domain\Servicios\ServiceCatalog;
use App\Models\Pantalla;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class ServiceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->rol, ['admin', 'supervisor'], true);
    }

    public function rules(): array
    {
        return [
            'tipo' => ['required', Rule::in(ServiceCatalog::TYPES)],
            'local_id' => ['required', 'exists:locales,id'],
            'pantalla_id' => ['nullable', 'exists:pantallas,id'],
            'operador_id' => [
                'required',
                Rule::exists('users', 'id')->where(fn ($query) => $query->where('rol', 'operativo')->where('activo', true)),
            ],
            'fecha_programada' => ['required', 'date'],
            'instrucciones' => ['nullable', 'string', 'max:2000'],
            'equipos_plan' => ['nullable', 'array', 'min:1', 'max:20'],
            'equipos_plan.*.tipo_esperado' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator) {
            $type = $this->input('tipo');
            $screenId = $this->input('pantalla_id');

            if (in_array($type, ['mantenimiento', 'desmonte'], true) && blank($screenId)) {
                $validator->errors()->add(
                    'pantalla_id',
                    $type === 'desmonte'
                        ? 'Selecciona la pantalla que será desmontada.'
                        : 'Selecciona la pantalla que recibirá mantenimiento.'
                );
            }

            if ($screenId && ! Pantalla::whereKey($screenId)->where('local_id', $this->input('local_id'))->exists()) {
                $validator->errors()->add('pantalla_id', 'La pantalla seleccionada no pertenece a este local.');
            }

            if ($type === 'instalacion' && empty($this->input('equipos_plan'))) {
                $validator->errors()->add('equipos_plan', 'Agrega por lo menos un equipo a la instalación.');
            }
        }];
    }
}

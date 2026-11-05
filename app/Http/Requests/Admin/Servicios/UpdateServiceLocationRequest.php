<?php

namespace App\Http\Requests\Admin\Servicios;

use Illuminate\Foundation\Http\FormRequest;

class UpdateServiceLocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->rol, ['admin', 'supervisor'], true);
    }

    public function rules(): array
    {
        return [
            'zona' => ['required', 'string', 'max:255'],
            'departamento' => ['required', 'string', 'max:255'],
            'provincia' => ['required', 'string', 'max:255'],
            'distrito' => ['required', 'string', 'max:255'],
            'direccion' => ['required', 'string', 'max:500'],
            'motivo' => ['required', 'string', 'max:1000'],
        ];
    }
}

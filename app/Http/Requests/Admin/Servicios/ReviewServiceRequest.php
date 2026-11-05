<?php

namespace App\Http\Requests\Admin\Servicios;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return in_array($this->user()?->rol, ['admin', 'supervisor'], true);
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::in(['aprobar', 'observar'])],
            'motivo_observacion' => ['nullable', 'string', 'max:2000', Rule::requiredIf($this->input('decision') === 'observar')],
        ];
    }
}

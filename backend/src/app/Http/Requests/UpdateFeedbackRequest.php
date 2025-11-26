<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFeedbackRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'target_id' => 'sometimes|exists:team_members,id',
            'category' => 'sometimes|string|in:positivo,negativo,sugerencia,mejora',
            'title' => 'sometimes|string|max:50',
            'text' => 'sometimes|string|max:300',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'target_id.exists' => 'El destinatario seleccionado no existe.',
            'category.string' => 'La categoría debe ser texto.',
            'category.in' => 'La categoría debe ser: positivo, negativo, sugerencia o mejora.',
            'title.string' => 'El título debe ser texto.',
            'title.max' => 'El título no puede exceder 50 caracteres.',
            'text.string' => 'El contenido debe ser texto.',
            'text.max' => 'El contenido no puede exceder 300 caracteres.',
        ];
    }

    public function mappData(): array
    {
        return $this->only(['target_id', 'author_id', 'category', 'title', 'text']);
    }
}

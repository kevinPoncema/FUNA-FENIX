<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeedbackRequest extends FormRequest
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
            'target_id' => 'required|exists:team_members,id',
            'category' => 'required|string|max:100',
            'title' => 'required|string|max:255',
            'text' => 'required|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'target_id.required' => 'El destinatario es obligatorio.',
            'target_id.exists' => 'El destinatario seleccionado no existe.',
            'category.required' => 'La categoría es obligatoria.',
            'category.string' => 'La categoría debe ser texto.',
            'category.max' => 'La categoría no puede exceder 100 caracteres.',
            'title.required' => 'El título es obligatorio.',
            'title.string' => 'El título debe ser texto.',
            'title.max' => 'El título no puede exceder 255 caracteres.',
            'text.required' => 'El contenido del feedback es obligatorio.',
            'text.string' => 'El contenido debe ser texto.',
            'text.max' => 'El contenido no puede exceder 1000 caracteres.',
        ];
    }

    public function mappData(): array
    {
        return $this->only(['target_id', 'author_id', 'category', 'title', 'text']);
    }
}

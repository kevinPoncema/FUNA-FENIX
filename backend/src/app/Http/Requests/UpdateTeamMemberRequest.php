<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamMemberRequest extends FormRequest
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
            'name' => 'sometimes|string|max:120',
            'role' => 'sometimes|string|max:120',
        ];
    }

    public function messages(): array
    {
        return [
            'name.string' => 'El nombre debe ser una cadena de texto.',
            'name.max' => 'El nombre no debe exceder los 120 caracteres.',
            'role.string' => 'El rol debe ser una cadena de texto.',
            'role.max' => 'El rol no debe exceder los 120 caracteres.',
        ];
    }

    public function mappData(): array
    {
        return $this->only(['name', 'role']);
    }
}

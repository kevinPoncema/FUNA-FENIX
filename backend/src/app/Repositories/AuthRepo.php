<?php

namespace App\Repositories;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthRepo
{
    /**
     * Busca un usuario por credenciales (email/password) y verifica que sea admin
     */
    public function findUserByCredentials(array $credentials): ?User
    {
        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            if ($user && $user->role === 'admin') {
                return $user;
            }
        }
        return null;
    }

    /**
     * Busca un usuario invitado por su hash único
     */
    public function findGuestByHash(string $hash): ?User
    {
        return User::where('guest_hash', $hash)
                  ->where('role', 'guest')
                  ->first();
    }

    /**
     * Crea un nuevo usuario invitado
     */
    public function createGuest(string $name, string $hash): User
    {
        return User::create([
            'name' => $name,
            'role' => 'guest',
            'guest_hash' => $hash,
            'email' => null,
            'password' => null,
        ]);
    }

    /**
     * Genera un token de Sanctum para el usuario
     */
    public function issueToken(User $user, string $tokenName, array $abilities = ['*']): string
    {
        return $user->createToken($tokenName, $abilities)->plainTextToken;
    }
}

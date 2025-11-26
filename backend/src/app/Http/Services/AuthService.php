<?php

namespace App\Http\Services;

use App\Repositories\AuthRepo;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Auth\AuthenticationException;

class AuthService
{
    protected AuthRepo $authRepo;

    public function __construct(AuthRepo $authRepo)
    {
        $this->authRepo = $authRepo;
    }

    /**
     * Lógica de login para invitados anónimos
     */
    public function loginGuest(string $name, string $providedHash = null): array
    {
        // Si se proporciona un hash, intentar encontrar al usuario existente
        if ($providedHash) {
            $user = $this->authRepo->findGuestByHash($providedHash);

            if ($user) {
                // Usuario encontrado, generar token y retornar
                $token = $this->authRepo->issueToken($user, 'guest-token', ['guest']);
                return [
                    'user' => $user,
                    'token' => $token,
                    'hash' => $providedHash
                ];
            }
        }

        // Si no se encontró usuario o no se proporcionó hash, crear nuevo invitado
        $newHash = Str::uuid()->toString();
        $user = $this->authRepo->createGuest($name, $newHash);
        $token = $this->authRepo->issueToken($user, 'guest-token', ['guest']);

        return [
            'user' => $user,
            'token' => $token,
            'hash' => $newHash
        ];
    }

    /**
     * Lógica de login para administradores
     */
    public function loginAdmin(array $credentials): array
    {
        $user = $this->authRepo->findUserByCredentials($credentials);

        if (!$user) {
            throw new AuthenticationException('Invalid credentials or insufficient permissions');
        }

        $token = $this->authRepo->issueToken($user, 'admin-token', ['admin']);

        return [
            'user' => $user,
            'token' => $token
        ];
    }
}

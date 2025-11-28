<?php

namespace App\Http\Services;

use App\Repositories\AuthRepo;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;

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
        // Generar hash del nombre para buscar usuario existente
        $hashedName = $this->hashGuestName($name);
        
        // Si se proporciona un hash, intentar encontrar al usuario existente por hash
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

        // Buscar usuario existente por nombre hasheado
        $existingUser = $this->authRepo->findGuestByHashedName($hashedName);
        
        if ($existingUser) {
            // Usuario existe, generar token y retornar
            $token = $this->authRepo->issueToken($existingUser, 'guest-token', ['guest']);
            return [
                'user' => $existingUser,
                'token' => $token,
                'hash' => $existingUser->hash ?? Str::uuid()->toString()
            ];
        }

        // Si no existe, crear nuevo invitado
        $newHash = Str::uuid()->toString();
        $user = $this->authRepo->createGuest($hashedName, $newHash);
        $token = $this->authRepo->issueToken($user, 'guest-token', ['guest']);

        return [
            'user' => $user,
            'token' => $token,
            'hash' => $newHash
        ];
    }

    /**
     * Hashea el nombre de un usuario invitado para mantener anonimato
     * Usa el mismo algoritmo que el comando HashUserNames
     */
    private function hashGuestName(string $name): string
    {
        // Usar SHA-256 simple como en el comando HashUserNames
        return hash('sha256', $name);
    }

    /**
     * Lógica de login para administradores
     */
    public function loginAdmin(array $credentials): array
    {
        $user = $this->authRepo->findUserByCredentials($credentials);

        if (!$user) {
            throw new AuthenticationException('Invalid credentials');
        }

        if (!$this->authRepo->isAdmin($user)) {
            throw new AuthorizationException('Access denied. Only administrators can access.');
        }

        $token = $this->authRepo->issueToken($user, 'admin-token', ['admin']);

        return [
            'user' => $user,
            'token' => $token
        ];
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Services\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Access\AuthorizationException;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Login para administradores
     */
    public function loginAdmin(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            $credentials = $request->only(['email', 'password']);
            $result = $this->authService->loginAdmin($credentials);

            return response()->json([
                'message' => 'Login successful',
                'user' => $result['user'],
                'token' => $result['token'],
                'role' => 'admin'
            ], 200);

        } catch (AuthenticationException $e) {
            return response()->json([
                'error' => 'Credenciales inválidas'
            ], 401);
        } catch (AuthorizationException $e) {
            return response()->json([
                'error' => 'Acceso denegado. Solo administradores pueden acceder.'
            ], 403);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login para invitados anónimos
     */
    public function loginGuest(Request $request): JsonResponse
    {
        try {
            // Si no se proporciona name, generar uno automático
            $name = $request->input('name', 'Invitado-' . uniqid());
            $hash = $request->input('hash');

            $result = $this->authService->loginGuest($name, $hash);

            return response()->json([
                'user' => $result['user'],
                'token' => $result['token']
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Guest login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout (revoca el token actual)
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'message' => 'Sesión cerrada correctamente'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener información del usuario autenticado
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json($request->user(), 200);
    }
}

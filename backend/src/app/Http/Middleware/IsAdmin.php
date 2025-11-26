<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // El middleware auth:sanctum ya maneja la autenticación
        // Solo verificamos el role del usuario autenticado
        $user = auth()->user();
        
        if (!$user || !in_array($user->role, ['admin', 'administrator'])) {
            return response()->json([
                'error' => 'Acceso denegado. Se requieren privilegios de administrador.'
            ], 403);
        }

        return $next($request);
    }
}

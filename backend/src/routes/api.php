<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TeamMemberController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\AuthController;

// Rutas de autenticación (sin middleware)
Route::post('auth/login-admin', [AuthController::class, 'loginAdmin']);
Route::post('auth/login-guest', [AuthController::class, 'loginGuest']);

// Rutas protegidas con Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    
    // Recursos protegidos
    Route::apiResource('team-members', TeamMemberController::class);
    Route::apiResource('feedbacks', FeedbackController::class);
    Route::get('team-members-with-feedbacks', [TeamMemberController::class, 'indexWithFeedbacks']);
});

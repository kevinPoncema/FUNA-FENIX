<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('team-members', App\Http\Api\Controllers\TeamMemberController::class);
Route::apiResource('feedbacks', App\Http\Controllers\Api\FeedbackController::class);

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Http\Requests\UpdateFeedbackRequest;
use App\Http\Services\FeedbackServices;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;

class FeedbackController extends Controller
{
    protected FeedbackServices $feedbackServices;

    public function __construct(FeedbackServices $feedbackServices)
    {
        $this->feedbackServices = $feedbackServices;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $feedbacks = $this->feedbackServices->getAllFeedbacks();
            return response()->json($feedbacks, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving feedbacks',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFeedbackRequest $request): JsonResponse
    {
        try {
            $feedback = $this->feedbackServices->createFeedback($request->validated());
            return response()->json($feedback, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        try {
            $feedback = $this->feedbackServices->getFeedbackById($id);
            return response()->json($feedback, 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Feedback not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFeedbackRequest $request, string $id): JsonResponse
    {
        try {
            $feedback = $this->feedbackServices->updateFeedback($id, $request->validated());
            return response()->json($feedback, 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Feedback not found'
            ], 404);
        } catch (AuthenticationException $e) {
            return response()->json([
                'error' => 'Usuario no autenticado'
            ], 401);
        } catch (AuthorizationException $e) {
            return response()->json([
                'error' => 'No autorizado. Solo el propietario puede modificar este feedback.'
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->feedbackServices->deleteFeedback($id);
            return response()->json(null, 204);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Feedback not found'
            ], 404);
        } catch (AuthenticationException $e) {
            return response()->json([
                'error' => 'Usuario no autenticado'
            ], 401);
        } catch (AuthorizationException $e) {
            return response()->json([
                'error' => 'No autorizado. Solo el propietario puede modificar este feedback.'
            ], 403);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting feedback',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

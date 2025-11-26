<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeamMemberRequest;
use App\Http\Requests\UpdateTeamMemberRequest;
use App\Http\Services\TeamMemberServices;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;

class TeamMemberController extends Controller
{
    protected TeamMemberServices $teamMemberServices;

    public function __construct(TeamMemberServices $teamMemberServices)
    {
        $this->teamMemberServices = $teamMemberServices;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        try {
            $teamMembers = $this->teamMemberServices->getAllTeamMembers();
            return response()->json($teamMembers, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving team members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeamMemberRequest $request): JsonResponse
    {
        try {
            $teamMember = $this->teamMemberServices->createTeamMember($request->validated());
            return response()->json($teamMember, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating team member',
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
            $teamMember = $this->teamMemberServices->getTeamMemberById((int)$id);
            return response()->json($teamMember, 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Team member not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving team member',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeamMemberRequest $request, string $id): JsonResponse
    {
        try {
            $teamMember = $this->teamMemberServices->updateTeamMember((int)$id, $request->validated());
            return response()->json($teamMember, 200);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Team member not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating team member',
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
            $this->teamMemberServices->deleteTeamMember((int)$id);
            return response()->json(null, 204);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Team member not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting team member',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

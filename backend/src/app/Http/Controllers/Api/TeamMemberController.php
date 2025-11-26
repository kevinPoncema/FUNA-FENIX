<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeamMemberRequest;
use App\Http\Requests\UpdateTeamMemberRequest;
use App\Http\Services\TeamMemberServices;

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
    public function index()
    {
        return $this->teamMemberServices->getAllTeamMembers();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTeamMemberRequest $request)
    {
        return $this->teamMemberServices->createTeamMember($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return $this->teamMemberServices->getTeamMemberById($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTeamMemberRequest $request, string $id)
    {
        return $this->teamMemberServices->updateTeamMember($id, $request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        return $this->teamMemberServices->deleteTeamMember($id);
    }
}

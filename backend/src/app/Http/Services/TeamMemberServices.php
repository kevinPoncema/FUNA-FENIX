<?php
namespace App\Http\Services;
use App\Repositories\TeamMemberRepo;

class TeamMemberServices
{
    protected TeamMemberRepo $teamMemberRepo;

    public function __construct(TeamMemberRepo $teamMemberRepo)
    {
        $this->teamMemberRepo = $teamMemberRepo;
    }

    public function getAllTeamMembers()
    {
        return $this->teamMemberRepo->getAllTeamMembers();
    }

    public function getTeamMemberById(int $id)
    {
        return $this->teamMemberRepo->getTeamMemberById($id);
    }

    public function createTeamMember(array $data)
    {
        return $this->teamMemberRepo->createTeamMember($data);
    }

    public function updateTeamMember(int $id, array $data)
    {
        return $this->teamMemberRepo->updateTeamMember($id, $data);
    }

    public function deleteTeamMember(int $id)
    {
        return $this->teamMemberRepo->deleteTeamMember($id);
    }
}

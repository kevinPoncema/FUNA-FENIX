<?php
namespace App\Http\Services;
use App\Repositories\TeamMemberRepo;
use App\Events\TeamMemberCreated;
use App\Events\TeamMemberUpdated;
use App\Events\TeamMemberDeleted;
use App\Models\TeamMember;

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
        $tm = $this->teamMemberRepo->createTeamMember($data);
        event(new TeamMemberCreated($tm));
        return $tm;
    }

    public function updateTeamMember(int $id, array $data)
    {
        $tm = $this->teamMemberRepo->updateTeamMember($id, $data);
        event(new TeamMemberUpdated($tm));
        return $tm;
    }

    public function deleteTeamMember(int $id)
    {
        $this->teamMemberRepo->deleteTeamMember($id);
        event(new TeamMemberDeleted($id));
    }

    public function getAllTeamMembersWithFeedbacks()
    {
        return $this->teamMemberRepo->getAllTeamMembersWithFeedbacks();
    }
}

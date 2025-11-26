<?php
namespace App\Repository;
use App\Models\TeamMember;
use Illuminate\Database\Eloquent\Collection;
class TeamMemberRepo
{
    public function getAllTeamMembers(): Collection
    {
        return TeamMember::all();
    }

    public function getTeamMemberById(int $id): ?TeamMember
    {
        return TeamMember::find($id);
    }

    public function createTeamMember(array $data): TeamMember
    {
        return TeamMember::create($data);
    }

    public function updateTeamMember(int $id, array $data): ?TeamMember
    {
        $teamMember = TeamMember::find($id);
        if ($teamMember) {
            $teamMember->update($data);
        }
        return $teamMember;
    }

    public function deleteTeamMember(int $id): bool
    {
        $teamMember = TeamMember::find($id);
        if ($teamMember) {
            return $teamMember->delete();
        }
        return false;
    }
}

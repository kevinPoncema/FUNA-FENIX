<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TeamMember;

class TeamMemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teamMembers = [
            ['name' => 'pipe', 'role' => 'Frontend/Sysadmin'],
            ['name' => 'carlos', 'role' => 'Sysadmin'],
            ['name' => 'moys', 'role' => 'SL'],
            ['name' => 'brayan', 'role' => 'Frontend Líder'],
            ['name' => 'jimenez', 'role' => 'Backend Líder'],
            ['name' => 'angel', 'role' => 'Frontend'],
            ['name' => 'katerine', 'role' => 'BA'],
            ['name' => 'kevin', 'role' => 'Backend'],
            ['name' => 'marco', 'role' => 'Backend/QA/DBA'],
        ];

        foreach ($teamMembers as $member) {
            TeamMember::create($member);
        }
    }
}

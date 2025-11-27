<?php

namespace Database\Factories;

use App\Models\TeamMember;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TeamMember>
 */
class TeamMemberFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = TeamMember::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roles = [
            'Desarrollador Frontend',
            'Desarrollador Backend',
            'Full Stack Developer',
            'DevOps Engineer',
            'QA Tester',
            'Product Owner',
            'Scrum Master',
            'UI/UX Designer',
            'Data Analyst',
            'Project Manager',
            'Tech Lead',
            'Arquitecto de Software'
        ];

        return [
            'name' => fake()->name(),
            'role' => fake()->randomElement($roles),
        ];
    }
}

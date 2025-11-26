<?php

namespace Tests\Feature;

use App\Models\TeamMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TeamMemberTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_get_all_team_members()
    {
        // Arrange
        TeamMember::create([
            'name' => 'John Doe',
            'role' => 'Developer'
        ]);
        TeamMember::create([
            'name' => 'Jane Smith',
            'role' => 'Designer'
        ]);
        TeamMember::create([
            'name' => 'Bob Wilson',
            'role' => 'Manager'
        ]);

        // Act
        $response = $this->getJson('/api/team-members');

        // Assert
        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_team_member()
    {
        // Arrange
        $data = [
            'name' => 'John Doe',
            'role' => 'Developer'
        ];

        // Act
        $response = $this->postJson('/api/team-members', $data);

        // Assert
        $response->assertStatus(201)
                 ->assertJson([
                     'name' => 'John Doe',
                     'role' => 'Developer'
                 ]);

        $this->assertDatabaseHas('team_members', $data);
    }

    public function test_can_show_team_member()
    {
        // Arrange
        $teamMember = TeamMember::create([
            'name' => 'John Doe',
            'role' => 'Developer'
        ]);

        // Act
        $response = $this->getJson("/api/team-members/{$teamMember->id}");

        // Assert
        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $teamMember->id,
                     'name' => $teamMember->name,
                     'role' => $teamMember->role
                 ]);
    }

    public function test_can_update_team_member()
    {
        // Arrange
        $teamMember = TeamMember::create([
            'name' => 'John Doe',
            'role' => 'Developer'
        ]);
        $updateData = [
            'name' => 'Jane Doe',
            'role' => 'Senior Developer'
        ];

        // Act
        $response = $this->putJson("/api/team-members/{$teamMember->id}", $updateData);

        // Assert
        $response->assertStatus(200)
                 ->assertJson($updateData);

        $this->assertDatabaseHas('team_members', array_merge(['id' => $teamMember->id], $updateData));
    }

    public function test_can_delete_team_member()
    {
        // Arrange
        $teamMember = TeamMember::create([
            'name' => 'John Doe',
            'role' => 'Developer'
        ]);

        // Act
        $response = $this->deleteJson("/api/team-members/{$teamMember->id}");

        // Assert
        $response->assertStatus(204);
        $this->assertDatabaseMissing('team_members', ['id' => $teamMember->id]);
    }

    public function test_create_team_member_validation_fails()
    {
        // Arrange
        $data = [
            'name' => '', // Campo requerido vacío
            'role' => str_repeat('a', 121) // Excede máximo de caracteres
        ];

        // Act
        $response = $this->postJson('/api/team-members', $data);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'role']);
    }

    public function test_update_team_member_validation_fails()
    {
        // Arrange
        $teamMember = TeamMember::create([
            'name' => 'John Doe',
            'role' => 'Developer'
        ]);
        $data = [
            'name' => str_repeat('a', 121), // Excede máximo de caracteres
            'role' => str_repeat('b', 121)  // Excede máximo de caracteres
        ];

        // Act
        $response = $this->putJson("/api/team-members/{$teamMember->id}", $data);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['name', 'role']);
    }

    public function test_show_nonexistent_team_member_returns_404()
    {
        // Act
        $response = $this->getJson('/api/team-members/999');

        // Assert
        $response->assertStatus(404);
    }
}

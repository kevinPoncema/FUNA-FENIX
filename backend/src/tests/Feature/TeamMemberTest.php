<?php

namespace Tests\Feature;

use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Hash;

class TeamMemberTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;
    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear usuarios para las pruebas
        $this->adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->regularUser = User::create([
            'name' => 'Regular User',
            'email' => 'user@test.com',
            'password' => Hash::make('password'),
            'role' => 'guest',
            'email_verified_at' => now(),
        ]);
    }

    public function test_admin_can_get_all_team_members()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);
        
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

    public function test_regular_user_cannot_get_team_members()
    {
        // Arrange
        Sanctum::actingAs($this->regularUser);

        // Act
        $response = $this->getJson('/api/team-members');

        // Assert
        $response->assertStatus(403)
                 ->assertJson(['error' => 'Acceso denegado. Se requieren privilegios de administrador.']);
    }

    public function test_unauthenticated_user_cannot_get_team_members()
    {
        // Act
        $response = $this->getJson('/api/team-members');

        // Assert
        $response->assertStatus(401);
    }

    public function test_admin_can_create_team_member()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);
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

    public function test_regular_user_cannot_create_team_member()
    {
        // Arrange
        Sanctum::actingAs($this->regularUser);
        $data = [
            'name' => 'John Doe',
            'role' => 'Developer'
        ];

        // Act
        $response = $this->postJson('/api/team-members', $data);

        // Assert
        $response->assertStatus(403)
                 ->assertJson(['error' => 'Acceso denegado. Se requieren privilegios de administrador.']);
    }

    public function test_admin_can_show_team_member()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);
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

    public function test_admin_can_update_team_member()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);
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

    public function test_regular_user_cannot_update_team_member()
    {
        // Arrange
        Sanctum::actingAs($this->regularUser);
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
        $response->assertStatus(403);
    }

    public function test_admin_can_delete_team_member()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);
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

    public function test_regular_user_cannot_delete_team_member()
    {
        // Arrange
        Sanctum::actingAs($this->regularUser);
        $teamMember = TeamMember::create([
            'name' => 'John Doe',
            'role' => 'Developer'
        ]);

        // Act
        $response = $this->deleteJson("/api/team-members/{$teamMember->id}");

        // Assert
        $response->assertStatus(403);
        $this->assertDatabaseHas('team_members', ['id' => $teamMember->id]);
    }

    public function test_admin_create_team_member_validation_fails()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);
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

    public function test_admin_update_team_member_validation_fails()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);
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
        // Arrange
        Sanctum::actingAs($this->adminUser);

        // Act
        $response = $this->getJson('/api/team-members/999');

        // Assert
        $response->assertStatus(404);
    }
}

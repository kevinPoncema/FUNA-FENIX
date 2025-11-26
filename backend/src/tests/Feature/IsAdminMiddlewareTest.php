<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Hash;

class IsAdminMiddlewareTest extends TestCase
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

    public function test_admin_role_can_access_protected_routes()
    {
        // Arrange
        Sanctum::actingAs($this->adminUser);

        // Act & Assert - Probar diferentes rutas protegidas por isAdmin
        $this->getJson('/api/team-members')
             ->assertStatus(200);

        $this->getJson('/api/team-members-with-feedbacks')
             ->assertStatus(200);

        $this->postJson('/api/team-members', [
            'name' => 'Test Member',
            'role' => 'Developer'
        ])->assertStatus(201);
    }

    public function test_administrator_role_can_access_protected_routes()
    {
        // Arrange - Crear usuario con role 'administrator' 
        $administratorUser = User::create([
            'name' => 'Administrator User',
            'email' => 'administrator@test.com',
            'password' => Hash::make('password'),
            'role' => 'administrator',
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($administratorUser);

        // Act & Assert
        $this->getJson('/api/team-members')
             ->assertStatus(200);

        $this->postJson('/api/team-members', [
            'name' => 'Test Member',
            'role' => 'Developer'
        ])->assertStatus(201);
    }

    public function test_guest_role_cannot_access_protected_routes()
    {
        // Arrange
        Sanctum::actingAs($this->regularUser);

        // Act & Assert
        $this->getJson('/api/team-members')
             ->assertStatus(403)
             ->assertJson(['error' => 'Acceso denegado. Se requieren privilegios de administrador.']);

        $this->postJson('/api/team-members', [
            'name' => 'Test Member',
            'role' => 'Developer'
        ])->assertStatus(403)
          ->assertJson(['error' => 'Acceso denegado. Se requieren privilegios de administrador.']);

        $this->getJson('/api/team-members-with-feedbacks')
             ->assertStatus(403);
    }

    public function test_user_with_other_role_cannot_access_protected_routes()
    {
        // Arrange - Crear usuario con un role diferente
        $otherUser = User::create([
            'name' => 'Other User',
            'email' => 'other@test.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($otherUser);

        // Act & Assert
        $this->getJson('/api/team-members')
             ->assertStatus(403)
             ->assertJson(['error' => 'Acceso denegado. Se requieren privilegios de administrador.']);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes()
    {
        // Act & Assert - Sin autenticación
        $this->getJson('/api/team-members')
             ->assertStatus(401)
             ->assertJson(['error' => 'Usuario no autenticado']);

        $this->postJson('/api/team-members', [
            'name' => 'Test Member',
            'role' => 'Developer'
        ])->assertStatus(401);

        $this->getJson('/api/team-members-with-feedbacks')
             ->assertStatus(401);
    }

    public function test_middleware_allows_access_to_non_protected_routes()
    {
        // Arrange
        Sanctum::actingAs($this->regularUser);

        // Act & Assert - Rutas que NO están protegidas por isAdmin
        $this->getJson('/api/user')
             ->assertStatus(200);

        $this->getJson('/api/feedbacks')
             ->assertStatus(200);
    }

    public function test_middleware_works_with_put_and_delete_methods()
    {
        // Arrange - Crear team member para las pruebas
        $teamMember = \App\Models\TeamMember::create([
            'name' => 'Test Member',
            'role' => 'Developer'
        ]);

        // Test con admin
        Sanctum::actingAs($this->adminUser);
        
        $this->putJson("/api/team-members/{$teamMember->id}", [
            'name' => 'Updated Member',
            'role' => 'Senior Developer'
        ])->assertStatus(200);

        // Test con usuario regular - debe fallar
        Sanctum::actingAs($this->regularUser);
        
        $this->putJson("/api/team-members/{$teamMember->id}", [
            'name' => 'Unauthorized Update',
            'role' => 'Hacker'
        ])->assertStatus(403);

        $this->deleteJson("/api/team-members/{$teamMember->id}")
             ->assertStatus(403);
    }

    public function test_middleware_error_response_format()
    {
        // Arrange
        Sanctum::actingAs($this->regularUser);

        // Act
        $response = $this->getJson('/api/team-members');

        // Assert - Verificar estructura de respuesta de error
        $response->assertStatus(403)
                 ->assertJsonStructure(['error'])
                 ->assertHeader('Content-Type', 'application/json');
    }
}
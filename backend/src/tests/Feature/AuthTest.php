<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear usuario admin para las pruebas
        $this->adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);
    }

    public function test_admin_can_login_with_valid_credentials()
    {
        // Arrange
        $credentials = [
            'email' => 'admin@test.com',
            'password' => 'password'
        ];

        // Act
        $response = $this->postJson('/api/auth/login-admin', $credentials);

        // Assert
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'user' => ['id', 'name', 'email', 'role'],
                     'token'
                 ])
                 ->assertJson([
                     'user' => [
                         'email' => 'admin@test.com',
                         'role' => 'admin'
                     ]
                 ]);
    }

    public function test_admin_login_fails_with_invalid_credentials()
    {
        // Arrange
        $credentials = [
            'email' => 'admin@test.com',
            'password' => 'wrong-password'
        ];

        // Act
        $response = $this->postJson('/api/auth/login-admin', $credentials);

        // Assert
        $response->assertStatus(401)
                 ->assertJson(['error' => 'Credenciales inválidas']);
    }

    public function test_admin_login_fails_for_non_admin_user()
    {
        // Arrange
        $guestUser = User::create([
            'name' => 'Guest User',
            'email' => 'guest@test.com',
            'password' => Hash::make('password'),
            'role' => 'guest',
        ]);

        $credentials = [
            'email' => 'guest@test.com',
            'password' => 'password'
        ];

        // Act
        $response = $this->postJson('/api/auth/login-admin', $credentials);

        // Assert
        $response->assertStatus(403)
                 ->assertJson(['error' => 'Acceso denegado. Solo administradores pueden acceder.']);
    }

    public function test_admin_login_validation_fails_with_missing_fields()
    {
        // Act
        $response = $this->postJson('/api/auth/login-admin', []);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_admin_login_validation_fails_with_invalid_email()
    {
        // Arrange
        $credentials = [
            'email' => 'invalid-email',
            'password' => 'password'
        ];

        // Act
        $response = $this->postJson('/api/auth/login-admin', $credentials);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['email']);
    }

    public function test_guest_can_login_and_get_hash()
    {
        // Act
        $response = $this->postJson('/api/auth/login-guest');

        // Assert
        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'user' => ['id', 'name', 'role', 'guest_hash'],
                     'token'
                 ])
                 ->assertJson([
                     'user' => [
                         'role' => 'guest'
                     ]
                 ]);

        // Verificar que se creó un usuario guest en la base de datos
        $this->assertDatabaseHas('users', [
            'role' => 'guest',
            'guest_hash' => $response->json('user.guest_hash')
        ]);
    }

    public function test_authenticated_user_can_get_user_info()
    {
        // Arrange
        $token = $this->adminUser->createToken('test-token')->plainTextToken;

        // Act
        $response = $this->getJson('/api/user', [
            'Authorization' => 'Bearer ' . $token
        ]);

        // Assert
        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $this->adminUser->id,
                     'name' => $this->adminUser->name,
                     'email' => $this->adminUser->email,
                     'role' => $this->adminUser->role
                 ]);
    }

    public function test_unauthenticated_user_cannot_get_user_info()
    {
        // Act
        $response = $this->getJson('/api/user');

        // Assert
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_logout()
    {
        // Arrange
        $token = $this->adminUser->createToken('test-token')->plainTextToken;

        // Act
        $response = $this->postJson('/api/auth/logout', [], [
            'Authorization' => 'Bearer ' . $token
        ]);

        // Assert
        $response->assertStatus(200)
                 ->assertJson(['message' => 'Sesión cerrada correctamente']);

        // Verificar que el token fue revocado
        $this->assertEquals(0, $this->adminUser->tokens()->count());
    }

    public function test_unauthenticated_user_cannot_logout()
    {
        // Act
        $response = $this->postJson('/api/auth/logout');

        // Assert
        $response->assertStatus(401);
    }
}
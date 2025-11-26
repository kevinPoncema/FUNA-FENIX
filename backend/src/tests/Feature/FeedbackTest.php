<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Hash;

class FeedbackTest extends TestCase
{
    use RefreshDatabase;

    private User $user1;
    private User $user2;
    private TeamMember $targetMember;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear usuarios para las pruebas
        $this->user1 = User::create([
            'name' => 'User One',
            'email' => 'user1@test.com',
            'password' => Hash::make('password'),
            'role' => 'guest',
            'email_verified_at' => now(),
        ]);

        $this->user2 = User::create([
            'name' => 'User Two',
            'email' => 'user2@test.com',
            'password' => Hash::make('password'),
            'role' => 'guest',
            'email_verified_at' => now(),
        ]);

        // Crear team member que será target
        $this->targetMember = TeamMember::create([
            'name' => 'Target Member',
            'role' => 'Developer'
        ]);
    }

    public function test_authenticated_user_can_get_all_feedbacks()
    {
        // Arrange
        Sanctum::actingAs($this->user1);
        
        Feedback::create([
            'target_id' => $this->targetMember->id,
            'owner_id' => $this->user1->id,
            'category' => 'achievements',
            'title' => 'Great job 1',
            'text' => 'First feedback text'
        ]);

        // Act
        $response = $this->getJson('/api/feedbacks');

        // Assert
        $response->assertStatus(200)
                 ->assertJsonCount(1);
    }

    public function test_unauthenticated_user_cannot_get_feedbacks()
    {
        // Act
        $response = $this->getJson('/api/feedbacks');

        // Assert
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_create_feedback()
    {
        // Arrange
        Sanctum::actingAs($this->user1);
        $data = [
            'target_id' => $this->targetMember->id,
            'category' => 'achievements',
            'title' => 'Great work on the project',
            'text' => 'You did an excellent job on the recent project delivery.'
        ];

        // Act
        $response = $this->postJson('/api/feedbacks', $data);

        // Assert
        $response->assertStatus(201)
                 ->assertJson($data);

        $this->assertDatabaseHas('feedback', array_merge($data, ['owner_id' => $this->user1->id]));
    }

    public function test_authenticated_user_can_show_feedback()
    {
        // Arrange
        Sanctum::actingAs($this->user1);
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'owner_id' => $this->user1->id,
            'category' => 'qualities',
            'title' => 'Great work',
            'text' => 'You did excellent work on this project'
        ]);

        // Act
        $response = $this->getJson("/api/feedbacks/{$feedback->id}");

        // Assert
        $response->assertStatus(200)
                 ->assertJson([
                     'id' => $feedback->id,
                     'target_id' => $feedback->target_id,
                     'owner_id' => $feedback->owner_id,
                     'category' => $feedback->category,
                     'title' => $feedback->title,
                     'text' => $feedback->text
                 ]);
    }

    public function test_owner_can_update_their_feedback()
    {
        // Arrange
        Sanctum::actingAs($this->user1);
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'owner_id' => $this->user1->id,
            'category' => 'achievements',
            'title' => 'Original title',
            'text' => 'Original feedback text'
        ]);

        $updateData = [
            'category' => 'qualities',
            'title' => 'Updated title',
            'text' => 'Updated feedback text'
        ];

        // Act
        $response = $this->putJson("/api/feedbacks/{$feedback->id}", $updateData);

        // Assert
        $response->assertStatus(200)
                 ->assertJson($updateData);

        $this->assertDatabaseHas('feedback', array_merge(['id' => $feedback->id], $updateData));
    }

    public function test_non_owner_cannot_update_feedback()
    {
        // Arrange - User1 creates feedback
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'owner_id' => $this->user1->id,
            'category' => 'achievements',
            'title' => 'Original title',
            'text' => 'Original feedback text'
        ]);

        // Act - User2 tries to update
        Sanctum::actingAs($this->user2);
        $updateData = [
            'title' => 'Unauthorized update',
            'text' => 'This should not work'
        ];

        $response = $this->putJson("/api/feedbacks/{$feedback->id}", $updateData);

        // Assert
        $response->assertStatus(403)
                 ->assertJson(['error' => 'No autorizado. Solo el propietario puede modificar este feedback.']);
    }

    public function test_owner_can_delete_their_feedback()
    {
        // Arrange
        Sanctum::actingAs($this->user1);
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'owner_id' => $this->user1->id,
            'category' => 'potential',
            'title' => 'Feedback to delete',
            'text' => 'This feedback will be deleted'
        ]);

        // Act
        $response = $this->deleteJson("/api/feedbacks/{$feedback->id}");

        // Assert
        $response->assertStatus(204);
        $this->assertDatabaseMissing('feedback', ['id' => $feedback->id]);
    }

    public function test_non_owner_cannot_delete_feedback()
    {
        // Arrange - User1 creates feedback
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'owner_id' => $this->user1->id,
            'category' => 'achievements',
            'title' => 'Feedback to keep',
            'text' => 'This should not be deleted'
        ]);

        // Act - User2 tries to delete
        Sanctum::actingAs($this->user2);
        $response = $this->deleteJson("/api/feedbacks/{$feedback->id}");

        // Assert
        $response->assertStatus(403)
                 ->assertJson(['error' => 'No autorizado. Solo el propietario puede modificar este feedback.']);
        
        $this->assertDatabaseHas('feedback', ['id' => $feedback->id]);
    }

    public function test_create_feedback_validation_fails()
    {
        // Arrange
        Sanctum::actingAs($this->user1);
        $data = [
            'target_id' => 999, // ID que no existe
            'category' => 'invalid_category', // Categoría inválida
            'title' => str_repeat('a', 51), // Excede máximo de 50
            'text' => str_repeat('a', 301) // Excede máximo de 300
        ];

        // Act
        $response = $this->postJson('/api/feedbacks', $data);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['target_id', 'category', 'title', 'text']);
    }

    public function test_show_nonexistent_feedback_returns_404()
    {
        // Arrange
        Sanctum::actingAs($this->user1);

        // Act
        $response = $this->getJson('/api/feedbacks/999');

        // Assert
        $response->assertStatus(404);
    }

    public function test_feedback_belongs_to_target_team_member()
    {
        // Arrange
        Sanctum::actingAs($this->user1);
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'owner_id' => $this->user1->id,
            'category' => 'achievements',
            'title' => 'Test relationship',
            'text' => 'Testing the relationship between feedback and team member'
        ]);

        // Act
        $response = $this->getJson("/api/feedbacks/{$feedback->id}");

        // Assert
        $response->assertStatus(200);

        // Verificar que existe la relación
        $this->assertEquals($this->targetMember->id, $feedback->fresh()->target->id);
    }

    public function test_feedback_belongs_to_owner_user()
    {
        // Arrange
        Sanctum::actingAs($this->user1);
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'owner_id' => $this->user1->id,
            'category' => 'qualities',
            'title' => 'Test owner relationship',
            'text' => 'Testing the relationship between feedback and user'
        ]);

        // Act & Assert
        $this->assertEquals($this->user1->id, $feedback->fresh()->owner->id);
        $this->assertEquals($this->user1->name, $feedback->fresh()->owner->name);
    }
}

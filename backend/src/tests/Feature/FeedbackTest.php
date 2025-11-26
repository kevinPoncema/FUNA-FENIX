<?php

namespace Tests\Feature;

use App\Models\Feedback;
use App\Models\TeamMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Crear team members que serán usados en los tests
        $this->targetMember = TeamMember::create([
            'name' => 'Target Member',
            'role' => 'Developer'
        ]);
        $this->authorMember = TeamMember::create([
            'name' => 'Author Member',
            'role' => 'Manager'
        ]);
    }

    public function test_can_get_all_feedbacks()
    {
        // Arrange
        Feedback::create([
            'target_id' => $this->targetMember->id,
            'author_id' => $this->authorMember->id,
            'category' => 'Performance',
            'title' => 'Great job 1',
            'text' => 'First feedback text'
        ]);
        Feedback::create([
            'target_id' => $this->targetMember->id,
            'author_id' => $this->authorMember->id,
            'category' => 'Communication',
            'title' => 'Great job 2',
            'text' => 'Second feedback text'
        ]);
        Feedback::create([
            'target_id' => $this->targetMember->id,
            'author_id' => $this->authorMember->id,
            'category' => 'Teamwork',
            'title' => 'Great job 3',
            'text' => 'Third feedback text'
        ]);

        // Act
        $response = $this->getJson('/api/feedbacks');

        // Assert
        $response->assertStatus(200)
                 ->assertJsonCount(3);
    }

    public function test_can_create_feedback()
    {
        // Arrange
        $data = [
            'target_id' => $this->targetMember->id,
            'author_id' => $this->authorMember->id,
            'category' => 'Performance',
            'title' => 'Great work on the project',
            'text' => 'You did an excellent job on the recent project delivery.'
        ];

        // Act
        $response = $this->postJson('/api/feedbacks', $data);

        // Assert
        $response->assertStatus(201)
                 ->assertJson($data);

        $this->assertDatabaseHas('feedback', $data);
    }

    public function test_can_show_feedback()
    {
        // Arrange
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'author_id' => $this->authorMember->id,
            'category' => 'Performance',
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
                     'author_id' => $feedback->author_id,
                     'category' => $feedback->category,
                     'title' => $feedback->title,
                     'text' => $feedback->text
                 ]);
    }

    public function test_can_update_feedback()
    {
        // Arrange
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'author_id' => $this->authorMember->id,
            'category' => 'Performance',
            'title' => 'Original title',
            'text' => 'Original feedback text'
        ]);

        $updateData = [
            'category' => 'Communication',
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

    public function test_can_delete_feedback()
    {
        // Arrange
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'author_id' => $this->authorMember->id,
            'category' => 'Performance',
            'title' => 'Feedback to delete',
            'text' => 'This feedback will be deleted'
        ]);

        // Act
        $response = $this->deleteJson("/api/feedbacks/{$feedback->id}");

        // Assert
        $response->assertStatus(204);
        $this->assertDatabaseMissing('feedback', ['id' => $feedback->id]);
    }

    public function test_create_feedback_validation_fails()
    {
        // Arrange
        $data = [
            'target_id' => 999, // ID que no existe
            'author_id' => 999, // ID que no existe
            'category' => str_repeat('a', 101), // Excede máximo
            'title' => '', // Campo requerido vacío
            'text' => str_repeat('a', 1001) // Excede máximo
        ];

        // Act
        $response = $this->postJson('/api/feedbacks', $data);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['target_id', 'author_id', 'category', 'title', 'text']);
    }

    public function test_update_feedback_validation_fails()
    {
        // Arrange
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'author_id' => $this->authorMember->id,
            'category' => 'Performance',
            'title' => 'Original title',
            'text' => 'Original text'
        ]);

        $data = [
            'target_id' => 999, // ID que no existe
            'category' => str_repeat('a', 101), // Excede máximo
            'text' => str_repeat('a', 1001) // Excede máximo
        ];

        // Act
        $response = $this->putJson("/api/feedbacks/{$feedback->id}", $data);

        // Assert
        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['target_id', 'category', 'text']);
    }

    public function test_show_nonexistent_feedback_returns_404()
    {
        // Act
        $response = $this->getJson('/api/feedbacks/999');

        // Assert
        $response->assertStatus(404);
    }

    public function test_feedback_belongs_to_target_team_member()
    {
        // Arrange
        $feedback = Feedback::create([
            'target_id' => $this->targetMember->id,
            'author_id' => $this->authorMember->id,
            'category' => 'Performance',
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
}

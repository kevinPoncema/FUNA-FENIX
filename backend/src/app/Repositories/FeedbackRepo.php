<?php
namespace App\Repositories;
use App\Models\Feedback;

class FeedbackRepo
{
    public function createFeedback(array $data): Feedback
    {
        return Feedback::create($data);
    }

    public function getFeedbackById(string $id): Feedback
    {
        return Feedback::findOrFail($id);
    }

    public function updateFeedback(string $id, array $data): Feedback
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->update($data);
        return $feedback;
    }

    public function deleteFeedback(string $id): bool
    {
        $feedback = Feedback::findOrFail($id);
        return $feedback->delete();
    }
    public function getAllFeedbacks()
    {
        return Feedback::all();
    }
}

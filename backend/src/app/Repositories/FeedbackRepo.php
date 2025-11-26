<?php
namespace App\Repositories;
use App\Models\Feedback;

class FeedbackRepo
{
    public function createFeedback(array $data): Feedback
    {
        return Feedback::create($data);
    }

    public function getFeedbackById(string $id): ?Feedback
    {
        return Feedback::find($id);
    }

    public function updateFeedback(string $id, array $data): ?Feedback
    {
        $feedback = Feedback::find($id);
        if ($feedback) {
            $feedback->update($data);
        }
        return $feedback;
    }

    public function deleteFeedback(string $id): bool
    {
        $feedback = Feedback::find($id);
        if ($feedback) {
            return $feedback->delete();
        }
        return false;
    }
    public function getAllFeedbacks()
    {
        return Feedback::all();
    }
}

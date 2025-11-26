<?php
namespace App\Repository;
use App\Models\Feddback;
class FeedbackRepo
{
    public function createFeedback(array $data): Feddback
    {
        return Feedback::create($data);
    }

    public function getFeedbackById(string $id): ?Feddback
    {
        return Feedback::find($id);
    }

    public function updateFeedback(string $id, array $data): ?Feddback
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

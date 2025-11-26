<?php
namespace App\Http\Services;
use App\Repositories\FeedbackRepo;
class FeedbackServices
{
    protected FeedbackRepo $feedbackRepo;
    public function __construct(FeedbackRepo $feedbackRepo)
    {
        $this->feedbackRepo = $feedbackRepo;
    }
    public function createFeedback(array $data)
    {
        return $this->feedbackRepo->createFeedback($data);
    }

    public function getFeedbackById(string $id)
    {
        return $this->feedbackRepo->getFeedbackById($id);
    }

    public function updateFeedback(string $id, array $data)
    {
        return $this->feedbackRepo->updateFeedback($id, $data);
    }

    public function deleteFeedback(string $id)
    {
        return $this->feedbackRepo->deleteFeedback($id);
    }

    public function getAllFeedbacks()
    {
        return $this->feedbackRepo->getAllFeedbacks();
    }
}

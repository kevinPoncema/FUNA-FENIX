<?php
namespace App\Http\Services;
use App\Repositories\FeedbackRepo;
use App\Events\FeedbackCreated;
use App\Events\FeedbackUpdated;
use App\Events\FeedbackDeleted;

class FeedbackServices
{
    protected FeedbackRepo $feedbackRepo;

    public function __construct(FeedbackRepo $feedbackRepo)
    {
        $this->feedbackRepo = $feedbackRepo;
    }

    public function createFeedback(array $data)
    {
        $fd = $this->feedbackRepo->createFeedback($data);
        event(new FeedbackCreated($fd));
        return $fd;
    }

    public function getFeedbackById(string $id)
    {
        return $this->feedbackRepo->getFeedbackById($id);
    }

    public function updateFeedback(string $id, array $data)
    {
        $fd = $this->feedbackRepo->updateFeedback($id, $data);
        event(new FeedbackUpdated($fd));
        return $fd;
    }

    public function deleteFeedback(string $id)
    {
        $this->feedbackRepo->deleteFeedback($id);
        event(new FeedbackDeleted($id));
    }

    public function getAllFeedbacks()
    {
        return $this->feedbackRepo->getAllFeedbacks();
    }
}

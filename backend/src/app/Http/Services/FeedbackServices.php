<?php
namespace App\Http\Services;
use App\Repositories\FeedbackRepo;
use App\Events\FeedbackCreated;
use App\Events\FeedbackUpdated;
use App\Events\FeedbackDeleted;
use Illuminate\Http\Exceptions\HttpResponseException;

class FeedbackServices
{
    protected FeedbackRepo $feedbackRepo;

    public function __construct(FeedbackRepo $feedbackRepo)
    {
        $this->feedbackRepo = $feedbackRepo;
    }

    public function createFeedback(array $data)
    {
        // Asignar automáticamente el owner_id al usuario autenticado
        $data['owner_id'] = auth()->id();
        
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
        $this->validateOwnership($feedback);
        $feedback = $this->feedbackRepo->getFeedbackById($id);
        $fd = $this->feedbackRepo->updateFeedback($id, $data);
        event(new FeedbackUpdated($fd));
        return $fd;
    }

    public function deleteFeedback(string $id)
    {
        $this->validateOwnership($feedback);
        $feedback = $this->feedbackRepo->getFeedbackById($id);
        
        $this->feedbackRepo->deleteFeedback($id);
        event(new FeedbackDeleted($id));
    }

    public function getAllFeedbacks()
    {
        return $this->feedbackRepo->getAllFeedbacks();
    }

    /**
     * Validar que el usuario actual sea el owner del feedback
     */
    private function validateOwnership($feedback)
    {
        $currentUserId = auth()->id();
        
        if (!$currentUserId) {
            throw new HttpResponseException(response()->json([
                'error' => 'Usuario no autenticado'
            ], 401));
        }

        if ($feedback->owner_id !== $currentUserId) {
            throw new HttpResponseException(response()->json([
                'error' => 'No autorizado. Solo el propietario puede modificar este feedback.'
            ], 403));
        }
    }
}

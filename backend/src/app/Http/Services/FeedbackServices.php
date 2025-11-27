<?php
namespace App\Http\Services;
use App\Repositories\FeedbackRepo;
use App\Events\FeedbackCreated;
use App\Events\FeedbackUpdated;
use App\Events\FeedbackDeleted;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;

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
        $feedback = $this->feedbackRepo->getFeedbackById($id);
        $this->validateOwnership($feedback);
        $fd = $this->feedbackRepo->updateFeedback($id, $data);
        event(new FeedbackUpdated($fd));
        return $fd;
    }

    public function deleteFeedback(string $id)
    {
        $feedback = $this->feedbackRepo->getFeedbackById($id);
        $this->validateOwnership($feedback);
        
        $this->feedbackRepo->deleteFeedback($id);
        event(new FeedbackDeleted($id));
    }

    public function getAllFeedbacks()
    {
        return $this->feedbackRepo->getAllFeedbacks();
    }

    /**
     * Validar que el usuario actual sea el owner del feedback o sea admin
     */
    private function validateOwnership($feedback)
    {
        $currentUser = auth()->user();
        
        if (!$currentUser) {
            throw new AuthenticationException('Usuario no autenticado');
        }

        // Permitir si es el propietario del feedback
        if ($feedback->owner_id === $currentUser->id) {
            return;
        }

        // Permitir si es admin
        if ($currentUser->role === 'admin') {
            return;
        }

        // Si no es ni propietario ni admin, denegar acceso
        throw new AuthorizationException('No autorizado. Solo el propietario o un administrador pueden modificar este feedback.');
    }
}

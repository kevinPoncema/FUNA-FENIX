<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Http\Requests\UpdateFeedbackRequest;
use App\Http\Services\FeedbackServices;

class FeedbackController extends Controller
{
    protected FeedbackServices $feedbackServices;

    public function __construct(FeedbackServices $feedbackServices)
    {
        $this->feedbackServices = $feedbackServices;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return $this->feedbackServices->getAllFeedbacks();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreFeedbackRequest $request)
    {
        return $this->feedbackServices->createFeedback($request->validated());
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return $this->feedbackServices->getFeedbackById($id);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateFeedbackRequest $request, string $id)
    {
        return $this->feedbackServices->updateFeedback($id, $request->validated());
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        return $this->feedbackServices->deleteFeedback($id);
    }
}

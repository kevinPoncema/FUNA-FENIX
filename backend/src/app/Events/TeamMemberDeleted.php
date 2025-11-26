<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TeamMemberDeleted
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    
    public int $teamMemberId;

    /**
     * Create a new event instance.
     */
    public function __construct(int $teamMemberId)
    {
        $this->teamMemberId = $teamMemberId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('team-members'),
        ];
    }
}

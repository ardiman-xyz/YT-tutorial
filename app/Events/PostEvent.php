<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public array $post; // 👈 Ganti dari string $message ke array $post

    /**
     * Create a new event instance.
     */
    public function __construct(array $post) // 👈 Parameter ganti ke array
    {
        $this->post = $post;
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('post'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NewPost';
    }

    public function broadcastWith(): array
    {
        return [
            'message' => 'New post created',
            'post' => $this->post, // 👈 Return array post
        ];
    }
}
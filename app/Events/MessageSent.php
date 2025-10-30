<?php

namespace App\Events;

use App\Models\Message;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $sender;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message, User $sender)
    {
        $this->message = $message;
        $this->sender = $sender;
    }

   

     /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.' . $this->message->conversation_id),
        ];
    }

     /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }

     /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'content' => $this->message->content,
            'sender_id' => $this->message->sender_id,
            'conversation_id' => $this->message->conversation_id,
            'created_at' => $this->message->created_at->toISOString(),
            'sender' => [
                'id' => $this->sender->id,
                'name' => $this->sender->name,
                'username' => $this->sender->username,
                'avatar' => $this->sender->avatar,
            ],
        ];
    }
}

<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;  // Changed!
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class TestBroadcast implements ShouldBroadcastNow  // Changed!
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(string $message)
    {
        $this->message = $message;
        Log::info('TestBroadcast event created', ['message' => $message]);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        Log::info('Broadcasting on channel: test');
        return [
            new Channel('test'), // Public channel
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'TestBroadcast';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $data = [
            'message' => $this->message,
            'timestamp' => now()->toISOString(),
        ];
        
        Log::info('Broadcasting data', $data);
        
        return $data;
    }
}
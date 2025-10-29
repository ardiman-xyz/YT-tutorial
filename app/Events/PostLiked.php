<?php

namespace App\Events;

use App\Models\Post;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PostLiked implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $postId;
    public $postOwnerId;
    public $likerName;
    public $likerUsername;
    public $likerAvatar;
    public $postContent;

    public function __construct(Post $post, User $liker)
    {
        $this->postId = $post->id;
        $this->postOwnerId = $post->user_id;
        $this->likerName = $liker->name;
        $this->likerUsername = $liker->username;
        $this->likerAvatar = $liker->avatar;
        $this->postContent = substr($post->content, 0, 50); 
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->postOwnerId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'PostLiked';
    }

    public function broadcastWith(): array
    {
        return [
            'post_id' => $this->postId,
            'liker_name' => $this->likerName,
            'liker_username' => $this->likerUsername,
            'liker_avatar' => $this->likerAvatar,
            'post_content' => $this->postContent,
            'timestamp' => now()->toISOString(),
        ];
    }
}
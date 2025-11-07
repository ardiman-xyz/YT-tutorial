<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('user.{id}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Test channel - return true to allow all authenticated users
Broadcast::channel('test', function ($user) {
    return true; // All authenticated users can listen
});
Broadcast::channel('orders', function () {
    return true; 
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    // Check if user is participant of this conversation
    return \App\Models\Conversation::find($conversationId)
        ->participants()
        ->where('user_id', $user->id)
        ->exists();
});

Broadcast::channel("post", function() {
    return true;
});
<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;

class MessagesController extends Controller
{
    /**
     * Display messages page.
     */
    public function index()
    {
        $currentUser = auth()->user();

        // Get user's conversations
        $userConversations = $currentUser->conversations()
            ->latest('updated_at')
            ->get();

        // Map conversations with details
        $conversations = $userConversations->map(function($conversation) use ($currentUser) {
            $otherUser = $conversation->getOtherParticipant($currentUser);
            
            if (!$otherUser) {
                return null;
            }

            $lastMessage = $conversation->messages()
                ->orderBy('created_at', 'desc')
                ->first();
            
            $unreadCount = $conversation->getUnreadCountFor($currentUser);
            
            return [
                'id' => $conversation->id,
                'user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'username' => $otherUser->username,
                    'avatar' => $otherUser->avatar,
                    'is_verified' => $otherUser->is_verified,
                    'is_online' => false,
                ],
                'last_message' => $lastMessage ? [
                    'content' => $lastMessage->content,
                    'created_at' => $lastMessage->created_at->toISOString(),
                    'is_read' => $lastMessage->sender_id === $currentUser->id || $lastMessage->is_read,
                ] : null,
                'unread_count' => $unreadCount,
            ];
        })->filter()->values();

        return inertia('messages/index', [
            'conversations' => $conversations,
            'active_conversation' => null,
            'messages' => [],
            'auth' => [
                'user' => [
                    'id' => $currentUser->id,
                    'name' => $currentUser->name,
                    'username' => $currentUser->username,
                    'avatar' => $currentUser->avatar,
                ],
            ],
        ]);
    }

    /**
     * Show new conversation form.
     */
    public function create()
    {
        $currentUser = auth()->user();

        // Get users that current user is following or followers (excluding self and existing conversations)
        $existingConversationUserIds = $currentUser->conversations()
            ->get()
            ->map(function($conversation) use ($currentUser) {
                $otherUser = $conversation->getOtherParticipant($currentUser);
                return $otherUser ? $otherUser->id : null;
            })
            ->filter()
            ->toArray();

        // Get potential users to message
        $suggestedUsers = User::where('id', '!=', $currentUser->id)
            ->whereNotIn('id', $existingConversationUserIds)
            ->where(function($query) use ($currentUser) {
                // Following or followers
                $query->whereHas('followers', function($q) use ($currentUser) {
                    $q->where('follower_id', $currentUser->id);
                })
                ->orWhereHas('following', function($q) use ($currentUser) {
                    $q->where('following_id', $currentUser->id);
                });
            })
            ->limit(20)
            ->get()
            ->map(function($user) use ($currentUser) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                    'is_verified' => $user->is_verified,
                    'is_following' => $currentUser->following()
                        ->where('following_id', $user->id)
                        ->exists(),
                ];
            });

        return inertia('messages/new', [
            'suggested_users' => $suggestedUsers,
            'auth' => [
                'user' => [
                    'id' => $currentUser->id,
                    'name' => $currentUser->name,
                    'username' => $currentUser->username,
                    'avatar' => $currentUser->avatar,
                ],
            ],
        ]);
    }

    /**
     * Create new conversation and send first message.
     */
    public function createConversation(Request $request)
    {
        $validated = $request->validate([
            'recipient_id' => 'required|exists:users,id',
            'message' => 'required|string|max:1000',
        ]);

        $currentUser = auth()->user();

        // Check if user is trying to message themselves
        if ($validated['recipient_id'] == $currentUser->id) {
            return back()->withErrors(['recipient_id' => 'You cannot message yourself.']);
        }

        // Check if conversation already exists
        $existingConversation = Conversation::whereHas('participants', function($query) use ($currentUser) {
            $query->where('user_id', $currentUser->id);
        })
        ->whereHas('participants', function($query) use ($validated) {
            $query->where('user_id', $validated['recipient_id']);
        })
        ->first();

        if ($existingConversation) {
            // Conversation exists, redirect to it
            return redirect()->route('messages.show', $existingConversation->id);
        }

        // Create new conversation
        $conversation = Conversation::create([]);

        // Add participants
        $conversation->participants()->attach([
            $currentUser->id,
            $validated['recipient_id'],
        ]);

        // Create first message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $currentUser->id,
            'content' => $validated['message'],
        ]);

        // Broadcast event
        broadcast(new MessageSent($message, $currentUser))->toOthers();

        return redirect()->route('messages.show', $conversation->id);
    }

    /**
     * Search users to start conversation.
     */
    public function searchUsers(Request $request)
    {
        $query = $request->input('q', '');
        $currentUser = auth()->user();

        if (empty($query)) {
            return response()->json(['users' => []]);
        }

        // Get existing conversation user IDs
        $existingConversationUserIds = $currentUser->conversations()
            ->get()
            ->map(function($conversation) use ($currentUser) {
                $otherUser = $conversation->getOtherParticipant($currentUser);
                return $otherUser ? $otherUser->id : null;
            })
            ->filter()
            ->toArray();

        // Search users
        $users = User::where('id', '!=', $currentUser->id)
            ->whereNotIn('id', $existingConversationUserIds)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('username', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get()
            ->map(function($user) use ($currentUser) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                    'is_verified' => $user->is_verified,
                    'is_following' => $currentUser->following()
                        ->where('following_id', $user->id)
                        ->exists(),
                ];
            });

        return response()->json(['users' => $users]);
    }

    /**
     * Show specific conversation.
     */
    public function show($conversationId)
    {
        $currentUser = auth()->user();
        
        $conversation = Conversation::findOrFail($conversationId);

        // Check if user is participant
        if (!$conversation->hasParticipant($currentUser)) {
            abort(403, 'Unauthorized');
        }

        // Get all conversations for sidebar
        $userConversations = $currentUser->conversations()
            ->latest('updated_at')
            ->get();

        $conversations = $userConversations->map(function($conv) use ($currentUser) {
            $otherUser = $conv->getOtherParticipant($currentUser);
            
            if (!$otherUser) {
                return null;
            }

            $lastMessage = $conv->messages()
                ->orderBy('created_at', 'asc')
                ->first();
            
            return [
                'id' => $conv->id,
                'user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'username' => $otherUser->username,
                    'avatar' => $otherUser->avatar,
                    'is_verified' => $otherUser->is_verified,
                    'is_online' => false,
                ],
                'last_message' => $lastMessage ? [
                    'content' => $lastMessage->content,
                    'created_at' => $lastMessage->created_at->toISOString(),
                    'is_read' => $lastMessage->sender_id === $currentUser->id || $lastMessage->is_read,
                ] : null,
                'unread_count' => $conv->getUnreadCountFor($currentUser),
            ];
        })->filter()->values();

        // Get messages
        $messages = $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function($message) {
                return [
                    'id' => $message->id,
                    'content' => $message->content,
                    'sender_id' => $message->sender_id,
                    'created_at' => $message->created_at->toISOString(),
                ];
            });

        // Mark as read
        $conversation->markAsReadFor($currentUser);

        // Get other user
        $otherUser = $conversation->getOtherParticipant($currentUser);

        if (!$otherUser) {
            return redirect()->route('messages.index');
        }

        return inertia('messages/index', [
            'conversations' => $conversations,
            'active_conversation' => [
                'id' => $conversation->id,
                'user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'username' => $otherUser->username,
                    'avatar' => $otherUser->avatar,
                    'is_verified' => $otherUser->is_verified,
                    'is_online' => false,
                ],
            ],
            'messages' => $messages,
            'auth' => [
                'user' => [
                    'id' => $currentUser->id,
                    'name' => $currentUser->name,
                    'username' => $currentUser->username,
                    'avatar' => $currentUser->avatar,
                ],
            ],
        ]);
    }

    /**
     * Send a message.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => 'required|integer|exists:conversations,id',
            'content' => 'required|string|max:1000',
        ]);

        $currentUser = auth()->user();
        
        // Check if user is participant
        $conversation = Conversation::findOrFail($validated['conversation_id']);
        if (!$conversation->hasParticipant($currentUser)) {
            abort(403, 'Unauthorized');
        }

        // Create message
        $message = Message::create([
            'conversation_id' => $validated['conversation_id'],
            'sender_id' => $currentUser->id,
            'content' => $validated['content'],
        ]);

        // Update conversation timestamp
        $conversation->touch();

        // Broadcast event
        broadcast(new MessageSent($message, $currentUser))->toOthers();

        return response()->json([
            'success' => true,
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'sender_id' => $message->sender_id,
                'conversation_id' => $message->conversation_id,
                'created_at' => $message->created_at->toISOString(),
            ],
        ]);
    }

    /**
     * Broadcast typing indicator.
     */
    public function typing(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => 'required|integer|exists:conversations,id',
            'is_typing' => 'required|boolean',
        ]);

        $currentUser = auth()->user();
        
        // Check if user is participant
        $conversation = Conversation::findOrFail($validated['conversation_id']);
        if (!$conversation->hasParticipant($currentUser)) {
            abort(403, 'Unauthorized');
        }

        // Broadcast typing event
        // broadcast(new UserTyping(
        //     $currentUser,
        //     $validated['conversation_id'],
        //     $validated['is_typing']
        // ))->toOthers();

        return response()->json(['success' => true]);
    }
}
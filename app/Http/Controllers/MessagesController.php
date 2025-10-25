<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MessagesController extends Controller
{
    /**
     * Display messages page.
     */
    public function index()
    {
        $currentUser = auth()->user();

        // TODO: Get real conversations from database
        $conversations = $this->getMockConversations();

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
     * Show specific conversation.
     */
    public function show($conversationId)
    {
        $currentUser = auth()->user();

        // TODO: Get real conversation from database
        $conversations = $this->getMockConversations();
        $activeConversation = collect($conversations)->firstWhere('id', (int) $conversationId);
        
        if (!$activeConversation) {
            return redirect()->route('messages.index');
        }

        // TODO: Get real messages from database
        $messages = $this->getMockMessages((int) $conversationId);

        return inertia('messages/index', [
            'conversations' => $conversations,
            'active_conversation' => $activeConversation,
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
            'conversation_id' => 'required|integer',
            'content' => 'required|string|max:1000',
        ]);

        // TODO: Store message in database
        // TODO: Broadcast message via Reverb

        return response()->json([
            'success' => true,
            'message' => [
                'id' => rand(1000, 9999),
                'content' => $validated['content'],
                'sender_id' => auth()->id(),
                'created_at' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * Get mock conversations for UI testing.
     */
    private function getMockConversations()
    {
        return [
            [
                'id' => 1,
                'user' => [
                    'id' => 2,
                    'name' => 'John Doe',
                    'username' => 'johndoe',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
                    'is_verified' => true,
                    'is_online' => true,
                ],
                'last_message' => [
                    'content' => 'Hey! How are you doing?',
                    'created_at' => now()->subMinutes(5)->toISOString(),
                    'is_read' => false,
                ],
                'unread_count' => 2,
            ],
            [
                'id' => 2,
                'user' => [
                    'id' => 3,
                    'name' => 'Jane Smith',
                    'username' => 'janesmith',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
                    'is_verified' => false,
                    'is_online' => true,
                ],
                'last_message' => [
                    'content' => 'Thanks for the help yesterday!',
                    'created_at' => now()->subHour()->toISOString(),
                    'is_read' => true,
                ],
                'unread_count' => 0,
            ],
            [
                'id' => 3,
                'user' => [
                    'id' => 4,
                    'name' => 'Mike Johnson',
                    'username' => 'mikej',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
                    'is_verified' => true,
                    'is_online' => false,
                ],
                'last_message' => [
                    'content' => 'Did you see the new Laravel release?',
                    'created_at' => now()->subHours(3)->toISOString(),
                    'is_read' => true,
                ],
                'unread_count' => 0,
            ],
            [
                'id' => 4,
                'user' => [
                    'id' => 5,
                    'name' => 'Sarah Williams',
                    'username' => 'sarahw',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                    'is_verified' => false,
                    'is_online' => false,
                ],
                'last_message' => [
                    'content' => 'Let me know when you\'re free to chat',
                    'created_at' => now()->subDays(1)->toISOString(),
                    'is_read' => true,
                ],
                'unread_count' => 0,
            ],
            [
                'id' => 5,
                'user' => [
                    'id' => 6,
                    'name' => 'Alex Brown',
                    'username' => 'alexb',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
                    'is_verified' => true,
                    'is_online' => true,
                ],
                'last_message' => [
                    'content' => 'Perfect! See you tomorrow',
                    'created_at' => now()->subDays(2)->toISOString(),
                    'is_read' => true,
                ],
                'unread_count' => 0,
            ],
        ];
    }

    /**
     * Get mock messages for a conversation.
     */
    private function getMockMessages($conversationId)
    {
        $currentUserId = auth()->id();

        $messagesMap = [
            1 => [
                [
                    'id' => 1,
                    'content' => 'Hey! How are you doing?',
                    'sender_id' => 2,
                    'created_at' => now()->subHours(2)->toISOString(),
                ],
                [
                    'id' => 2,
                    'content' => 'I\'m doing great! Just working on the new project',
                    'sender_id' => $currentUserId,
                    'created_at' => now()->subHours(2)->addMinutes(5)->toISOString(),
                ],
                [
                    'id' => 3,
                    'content' => 'That sounds exciting! What are you building?',
                    'sender_id' => 2,
                    'created_at' => now()->subHours(1)->toISOString(),
                ],
                [
                    'id' => 4,
                    'content' => 'A Twitter clone with Laravel and React. It\'s coming along nicely!',
                    'sender_id' => $currentUserId,
                    'created_at' => now()->subHours(1)->addMinutes(2)->toISOString(),
                ],
                [
                    'id' => 5,
                    'content' => 'Wow! Can\'t wait to see it. Let me know if you need any help',
                    'sender_id' => 2,
                    'created_at' => now()->subMinutes(5)->toISOString(),
                ],
            ],
            2 => [
                [
                    'id' => 6,
                    'content' => 'Hey, do you have a minute?',
                    'sender_id' => 3,
                    'created_at' => now()->subHours(5)->toISOString(),
                ],
                [
                    'id' => 7,
                    'content' => 'Sure! What\'s up?',
                    'sender_id' => $currentUserId,
                    'created_at' => now()->subHours(5)->addMinutes(3)->toISOString(),
                ],
                [
                    'id' => 8,
                    'content' => 'I was wondering if you could help me with that React issue',
                    'sender_id' => 3,
                    'created_at' => now()->subHours(4)->toISOString(),
                ],
                [
                    'id' => 9,
                    'content' => 'Of course! Send me the code and I\'ll take a look',
                    'sender_id' => $currentUserId,
                    'created_at' => now()->subHours(4)->addMinutes(1)->toISOString(),
                ],
                [
                    'id' => 10,
                    'content' => 'Thanks for the help yesterday!',
                    'sender_id' => 3,
                    'created_at' => now()->subHour()->toISOString(),
                ],
            ],
            3 => [
                [
                    'id' => 11,
                    'content' => 'Did you see the new Laravel release?',
                    'sender_id' => 4,
                    'created_at' => now()->subHours(3)->toISOString(),
                ],
                [
                    'id' => 12,
                    'content' => 'Yes! The new features look amazing',
                    'sender_id' => $currentUserId,
                    'created_at' => now()->subHours(3)->addMinutes(10)->toISOString(),
                ],
            ],
        ];

        return $messagesMap[$conversationId] ?? [];
    }
}
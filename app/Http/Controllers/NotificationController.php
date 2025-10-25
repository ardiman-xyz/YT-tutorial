<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display notifications page.
     */
    public function index()
    {
        $currentUser = auth()->user();

        // TODO: Get real notifications from database
        // For now, return mock data for UI testing
        $notifications = $this->getMockNotifications();

        return inertia('notifications/index', [
            'notifications' => [
                'all' => $notifications,
                'verified' => array_filter($notifications, fn($n) => $n['user']['is_verified']),
                'mentions' => array_filter($notifications, fn($n) => $n['type'] === 'mention'),
            ],
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
     * Mark notification as read.
     */
    public function markAsRead($id)
    {
        // TODO: Implement mark as read
        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        // TODO: Implement mark all as read
        return response()->json(['success' => true]);
    }

    /**
     * Get mock notifications for UI testing.
     */
    private function getMockNotifications()
    {
        return [
            [
                'id' => 1,
                'type' => 'like',
                'user' => [
                    'id' => 2,
                    'name' => 'John Doe',
                    'username' => 'johndoe',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
                    'is_verified' => true,
                ],
                'post' => [
                    'id' => 1,
                    'content' => 'Just launched my new project! Check it out 🚀',
                ],
                'created_at' => now()->subMinutes(5)->toISOString(),
                'read_at' => null,
            ],
            [
                'id' => 2,
                'type' => 'follow',
                'user' => [
                    'id' => 3,
                    'name' => 'Jane Smith',
                    'username' => 'janesmith',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
                    'is_verified' => false,
                ],
                'post' => null,
                'created_at' => now()->subHour()->toISOString(),
                'read_at' => null,
            ],
            [
                'id' => 3,
                'type' => 'reply',
                'user' => [
                    'id' => 4,
                    'name' => 'Mike Johnson',
                    'username' => 'mikej',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
                    'is_verified' => true,
                ],
                'post' => [
                    'id' => 2,
                    'content' => 'What do you think about the new Laravel features?',
                ],
                'created_at' => now()->subHours(3)->toISOString(),
                'read_at' => null,
            ],
            [
                'id' => 4,
                'type' => 'repost',
                'user' => [
                    'id' => 5,
                    'name' => 'Sarah Williams',
                    'username' => 'sarahw',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                    'is_verified' => false,
                ],
                'post' => [
                    'id' => 3,
                    'content' => 'React Server Components are game changers! 🎮',
                ],
                'created_at' => now()->subHours(5)->toISOString(),
                'read_at' => now()->subHours(4)->toISOString(),
            ],
            [
                'id' => 5,
                'type' => 'mention',
                'user' => [
                    'id' => 6,
                    'name' => 'Alex Brown',
                    'username' => 'alexb',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
                    'is_verified' => true,
                ],
                'post' => [
                    'id' => 4,
                    'content' => '@you Great work on the animation tutorial!',
                ],
                'created_at' => now()->subDay()->toISOString(),
                'read_at' => null,
            ],
            [
                'id' => 6,
                'type' => 'like',
                'user' => [
                    'id' => 7,
                    'name' => 'Emily Davis',
                    'username' => 'emilyd',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
                    'is_verified' => false,
                ],
                'post' => [
                    'id' => 5,
                    'content' => 'Building a Twitter clone with Laravel + React! Day 5 progress 💪',
                ],
                'created_at' => now()->subDays(2)->toISOString(),
                'read_at' => now()->subDay()->toISOString(),
            ],
            [
                'id' => 7,
                'type' => 'follow',
                'user' => [
                    'id' => 8,
                    'name' => 'Chris Wilson',
                    'username' => 'chrisw',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
                    'is_verified' => true,
                ],
                'post' => null,
                'created_at' => now()->subDays(3)->toISOString(),
                'read_at' => now()->subDays(2)->toISOString(),
            ],
            [
                'id' => 8,
                'type' => 'reply',
                'user' => [
                    'id' => 9,
                    'name' => 'Lisa Anderson',
                    'username' => 'lisaa',
                    'avatar' => 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
                    'is_verified' => false,
                ],
                'post' => [
                    'id' => 6,
                    'content' => 'Anyone using Tailwind CSS v4 yet?',
                ],
                'created_at' => now()->subDays(4)->toISOString(),
                'read_at' => now()->subDays(3)->toISOString(),
            ],
        ];
    }
}
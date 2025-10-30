<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Display notifications page.
     */
    public function index()
    {
        $currentUser = auth()->user();

        // Get real notifications from database
        // Exclude notifications where user is the actor (self-notifications)
        $notifications = Notification::with(['actor', 'post'])
            ->where('user_id', $currentUser->id)
            ->where('actor_id', '!=', $currentUser->id) // Exclude self-notifications
            ->latest()
            ->get()
            ->toArray();

        return inertia('notifications/index', [
            'notifications' => [
                'all' => $notifications,
                'verified' => array_filter($notifications, fn($n) => $n['actor']['is_verified'] ?? false),
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

    public function getUnreadCount()
    {
        $count = auth()->user()->notifications()
            ->where('is_read', false)
            ->count();
        
        return response()->json(['count' => $count]);
    }

    public function markAsRead($id)
    {
        $notification = Notification::where('id', $id)
            ->where('user_id', auth()->id())
            ->first();
        
        if ($notification) {
            $notification->update(['is_read' => true]);
        }
        
        return response()->json(['success' => true]);
    }

    /**
        * Mark all notifications as read.
    */
    public function markAllAsRead()
    {
        try {
            $currentUser = auth()->user();
            
            // Update all unread notifications for current user
            $updatedCount = $currentUser->notifications()
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read',
                'updated_count' => $updatedCount,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notifications as read',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    

}
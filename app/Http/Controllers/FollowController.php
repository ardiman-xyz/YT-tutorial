<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class FollowController extends Controller
{
    /**
     * Toggle follow/unfollow a user.
     */
    public function toggle(User $user)
    {
        $currentUser = auth()->user();

        // Can't follow yourself
        if ($currentUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You cannot follow yourself.',
            ], 400);
        }

        // Check if already following
        $isFollowing = $currentUser->following()->where('following_id', $user->id)->exists();

        if ($isFollowing) {
            // Unfollow
            $currentUser->following()->detach($user->id);
            $action = 'unfollowed';
        } else {
            // Follow
            $currentUser->following()->attach($user->id);
            $action = 'followed';
        }

        return response()->json([
            'success' => true,
            'action' => $action,
            'isFollowing' => !$isFollowing,
            'followersCount' => $user->followers()->count(),
            'followingCount' => $user->following()->count(),
        ]);
    }

    /**
     * Get followers list.
     */
    public function followers(User $user)
    {
        $followers = $user->followers()
            ->select('users.id', 'users.name', 'users.username', 'users.avatar', 'users.bio', 'users.is_verified')
            ->get();

        return response()->json([
            'followers' => $followers,
        ]);
    }

    /**
     * Get following list.
     */
    public function following(User $user)
    {
        $following = $user->following()
            ->select('users.id', 'users.name', 'users.username', 'users.avatar', 'users.bio', 'users.is_verified')
            ->get();

        return response()->json([
            'following' => $following,
        ]);
    }
}
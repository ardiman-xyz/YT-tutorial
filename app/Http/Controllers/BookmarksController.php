<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;

class BookmarksController extends Controller
{
    /**
     * Display bookmarks page.
     */
    public function index()
    {
        $currentUser = auth()->user();

        // Get bookmarked post IDs with timestamp
        $bookmarkedPostIds = $currentUser->bookmarks()
            ->orderBy('created_at', 'desc')
            ->pluck('post_id')
            ->toArray();

        // Get posts in the order they were bookmarked
        $bookmarks = Post::whereIn('id', $bookmarkedPostIds)
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media:id,post_id,type,url,thumbnail_url,duration',
            ])
            ->withCount(['likes', 'reposts', 'replies'])
            ->get()
            ->sortBy(function ($post) use ($bookmarkedPostIds) {
                return array_search($post->id, $bookmarkedPostIds);
            })
            ->values()
            ->map(function ($post) use ($currentUser) {
                $post->is_liked = $post->isLikedBy($currentUser);
                $post->is_reposted = $post->isRepostedBy($currentUser);
                $post->is_bookmarked = true; // Always true in bookmarks page
                return $post;
            });

        return inertia('bookmarks/index', [
            'bookmarks' => $bookmarks,
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
     * Clear all bookmarks.
     */
    public function clearAll()
    {
        $currentUser = auth()->user();
        
        // Remove all bookmarks
        $currentUser->bookmarks()->detach();

        return response()->json([
            'success' => true,
            'message' => 'All bookmarks cleared',
        ]);
    }
}
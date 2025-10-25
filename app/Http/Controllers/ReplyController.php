<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Hashtag;
use App\Models\Mention;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReplyController extends Controller
{
    /**
     * Store a reply to a post.
     */
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'content' => 'required|max:280',
            'images' => 'nullable|array|max:4',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        try {
            DB::beginTransaction();

            // Create reply
            $reply = Post::create([
                'user_id' => auth()->id(),
                'content' => $validated['content'],
                'parent_id' => $post->id,
                'reply_permission' => 'everyone',
            ]);

            // Handle media uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('posts/media', 'public');
                    
                    $reply->media()->create([
                        'type' => 'image',
                        'url' => Storage::url($path),
                        'order' => $index,
                    ]);
                }
            }

            // Process hashtags
            if (!empty($validated['content'])) {
                $hashtags = Hashtag::findOrCreateFromText($validated['content']);
                foreach ($hashtags as $hashtag) {
                    $reply->hashtags()->attach($hashtag->id);
                    $hashtag->incrementPostsCount();
                }
            }

            // Process mentions
            if (!empty($validated['content'])) {
                $mentionedUsers = Mention::findUsersFromText($validated['content']);
                foreach ($mentionedUsers as $userData) {
                    $reply->mentions()->create([
                        'user_id' => $userData['id']
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reply posted!',
                'reply' => $reply->load(['user:id,name,username,avatar,is_verified', 'media']),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to post reply: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get replies for a post.
     */
    public function index(Post $post)
    {
        $user = auth()->user();

        $replies = $post->replies()
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media:id,post_id,type,url,thumbnail_url,duration',
            ])
            ->withCount('likes')
            ->latest()
            ->get()
            ->map(function ($reply) use ($user) {
                $reply->is_liked = $reply->isLikedBy($user);
                return $reply;
            });

        return response()->json([
            'success' => true,
            'replies' => $replies,
        ]);
    }

    /**
     * Delete a reply.
     */
    public function destroy(Post $post, Post $reply)
    {
        // Check if reply belongs to this post
        if ($reply->parent_id !== $post->id) {
            return response()->json([
                'success' => false,
                'message' => 'Reply does not belong to this post.',
            ], 404);
        }

        // Check if user owns the reply
        if ($reply->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action.',
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Delete media files
            foreach ($reply->media as $media) {
                $path = str_replace('/storage/', '', $media->url);
                Storage::disk('public')->delete($path);
            }

            // Delete reply
            $reply->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reply deleted successfully!',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete reply: ' . $e->getMessage(),
            ], 500);
        }
    }
}
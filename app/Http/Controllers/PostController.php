<?php

namespace App\Http\Controllers;

use App\Events\PostEvent;
use App\Events\PostLiked;
use App\Models\FileUpload;
use App\Models\Post;
use App\Models\Hashtag;
use App\Models\Mention;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * Display a listing of posts (feed).
     */
    public function index(Request $request)
    {
        $user = auth()->user();

        // Get all posts (from everyone)
        $posts = Post::whereNull('parent_id') // Only top-level posts (no replies)
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media:id,post_id,type,url,thumbnail_url,duration',
            ])
            ->withCount(['likes', 'reposts', 'replies', 'bookmarks'])
            ->latest()
            ->get()
            ->map(function ($post) use ($user) {
                $post->is_liked = $post->isLikedBy($user);
                $post->is_reposted = $post->isRepostedBy($user);
                $post->is_bookmarked = $post->isBookmarkedBy($user);
                $post->is_following = $user->following()->where('following_id', $post->user_id)->exists();
                return $post;
            });

        return inertia('dashboard', [
            'posts' => $posts,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                ],
            ],
        ]);
    }

    /**
     * Display the specified post.
     */
    public function show(Post $post)
    {
        $user = auth()->user();

        // Load relationships
        $post->load([
            'user:id,name,username,avatar,is_verified',
            'media:id,post_id,type,url,thumbnail_url,duration',
            'replies' => function ($query) use ($user) {
                $query->with([
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
            },
        ]);

        $post->loadCount(['likes', 'reposts', 'replies']);
        $post->is_liked = $post->isLikedBy($user);
        $post->is_reposted = $post->isRepostedBy($user);
        $post->is_bookmarked = $post->isBookmarkedBy($user);

        return inertia('post/show', [
            'post' => $post,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                ],
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required_without_all:images,video_upload_ids|max:280',
            'images' => 'nullable|array|max:4',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            'video_upload_ids' => 'nullable|json',
            'audience' => 'nullable|in:everyone,circle',
            'parent_id' => 'nullable|exists:posts,id', // For replies
        ]);

        try {
            DB::beginTransaction();

            // Create post (or reply if parent_id exists)
            $post = Post::create([
                'user_id' => auth()->id(),
                'content' => $validated['content'] ?? '',
                'parent_id' => $validated['parent_id'] ?? null,
                'reply_permission' => $validated['audience'] === 'circle' ? 'following' : 'everyone',
            ]);

            // Handle image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('posts/media', 'public');
                    
                    $post->media()->create([
                        'type' => 'image',
                        'url' => Storage::url($path),
                        'order' => $index,
                    ]);
                }
            }

            // Handle video uploads from chunked upload
            if ($request->has('video_upload_ids')) {
                $videoUploadIds = json_decode($request->video_upload_ids, true);

                foreach ($videoUploadIds as $uploadId) {
                    // Get the completed upload
                    $upload = FileUpload::where('id', $uploadId)
                        ->where('user_id', auth()->id())
                        ->where('status', 'completed')
                        ->first();

                    if (!$upload) {
                        continue;
                    }

                    // Build URLs from file_uploads.path (single source of truth!)
                    $videoUrl = Storage::url($upload->path);
                    $thumbnailUrl = $upload->thumbnail_path 
                        ? Storage::url($upload->thumbnail_path) 
                        : null;

                    // Create post media - ONLY store URLs!
                    $media = $post->media()->create([
                        'type' => 'video',
                        'url' => $videoUrl,
                        'thumbnail_url' => $thumbnailUrl,
                        'order' => 0,
                    ]);

                    // Optional: Link upload to post
                    $upload->update(['used_in_post_id' => $post->id]);
                }
            }

            // Process hashtags
            if (!empty($validated['content'])) {
                $hashtags = Hashtag::findOrCreateFromText($validated['content']);
                foreach ($hashtags as $hashtag) {
                    $post->hashtags()->attach($hashtag->id);
                    $hashtag->incrementPostsCount();
                }
            }

            // Process mentions
            if (!empty($validated['content'])) {
                $mentionedUsers = Mention::findUsersFromText($validated['content']);
                foreach ($mentionedUsers as $userData) {
                    $post->mentions()->create([
                        'user_id' => $userData['id']
                    ]);
                }
            }

            $post->load('user', 'media');

            event(new PostEvent([
                'id' => $post->id,
                'content' => $post->content,
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'username' => $post->user->username,
                    'avatar' => $post->user->avatar_url ?? $post->user->profile_photo_url ?? null,
                ],
                'media' => $post->media->map(function ($media) {
                    return [
                        'id' => $media->id,
                        'post_id' => $media->post_id,
                        'type' => $media->type,
                        'url' => $media->url,
                        'thumbnail_url' => $media->thumbnail_url,
                        'duration' => $media->duration,
                    ];
                })->toArray(),
                'likes_count' => 0,
                'reposts_count' => 0,
                'replies_count' => 0,
                'bookmarks_count' => 0,
                'is_liked' => false,
                'is_reposted' => false,
                'is_bookmarked' => false,
                'is_following' => false,
                'created_at' => $post->created_at->toISOString(),
            ]));

            DB::commit();

            // If reply, redirect back to parent post
            if ($validated['parent_id'] ?? null) {
                $parentPost = Post::find($validated['parent_id']);
                return redirect()->route('posts.show', $parentPost)->with('success', 'Reply posted!');
            }

            return redirect()->route('dashboard')->with('success', 'Post created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->withErrors(['error' => 'Failed to create post: ' . $e->getMessage()])->withInput();
        }
    }


    /**
     * Delete a post.
     */
    // public function destroy(Post $post)
    // {
    //     if ($post->user_id !== auth()->id()) {
    //         return back()->withErrors(['error' => 'Unauthorized action.']);
    //     }

    //     try {
    //         DB::beginTransaction();

    //         foreach ($post->media as $media) {
    //             $path = str_replace('/storage/', '', $media->url);
    //             Storage::disk('public')->delete($path);
    //         }

    //         $post->delete();

    //         DB::commit();

    //         return back()->with('success', 'Post deleted successfully!');

    //     } catch (\Exception $e) {
    //         DB::rollBack();
    //         return back()->withErrors(['error' => 'Failed to delete post: ' . $e->getMessage()]);
    //     }
    // }

     public function destroy(Post $post)
    {
        try {
            // Check if the authenticated user owns this post
            if ($post->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to delete this post'
                ], 403);
            }

            DB::beginTransaction();

            // Delete associated media files from storage
            foreach ($post->media as $media) {
                // Extract path from URL (remove /storage/ prefix)
                $path = str_replace('/storage/', '', $media->url);
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                }

                // Delete thumbnail if exists
                if ($media->thumbnail_url) {
                    $thumbnailPath = str_replace('/storage/', '', $media->thumbnail_url);
                    if (Storage::disk('public')->exists($thumbnailPath)) {
                        Storage::disk('public')->delete($thumbnailPath);
                    }
                }
            }

            // Delete media records
            $post->media()->delete();

            // Delete associated records
            $post->likes()->delete();
            $post->reposts()->delete();
            $post->bookmarks()->delete();
            $post->mentions()->delete();

            // Detach hashtags and decrement their post counts
            foreach ($post->hashtags as $hashtag) {
                $hashtag->decrement('posts_count');
            }
            $post->hashtags()->detach();

            // Delete replies to this post
            $post->replies()->delete();

            // Delete the post itself
            $post->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Post deleted successfully'
            ]);

        } catch (Exception $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete post: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Toggle like on a post.
     */
   public function toggleLike(Post $post)
    {
        $user = auth()->user();
        $existingLike = $post->likes()->where('user_id', $user->id)->first();

        if ($existingLike) {
            $existingLike->delete();
            
            Notification::where([
                'user_id' => $post->user_id,
                'actor_id' => $user->id,
                'post_id' => $post->id,
                'type' => 'like'
            ])->delete();
            
            $isLiked = false;
        } else {
            $post->likes()->create([
                'user_id' => $user->id,
            ]);
            
            if ($post->user_id !== $user->id) {
                Notification::create([
                    'user_id' => $post->user_id,
                    'actor_id' => $user->id,
                    'type' => 'like',
                    'post_id' => $post->id,
                    'is_read' => false,
                ]);
                
                broadcast(new PostLiked($post, $user));
            }
            
            $isLiked = true;
        }

        return response()->json([
            'success' => true,
            'isLiked' => $isLiked,
            'likesCount' => $post->likes()->count(),
        ]);
    }

    /**
     * Toggle repost on a post.
     */
    public function toggleRepost(Post $post)
    {
        $user = auth()->user();

        $existingRepost = $post->reposts()->where('user_id', $user->id)->first();

        if ($existingRepost) {
            $existingRepost->delete();
            $isReposted = false;
        } else {
            $post->reposts()->create([
                'user_id' => $user->id,
            ]);
            $isReposted = true;
        }

        return response()->json([
            'success' => true,
            'isReposted' => $isReposted,
            'repostsCount' => $post->reposts()->count(),
        ]);
    }

    /**
     * Toggle bookmark on a post.
     */
    public function toggleBookmark(Post $post)
    {
        $user = auth()->user();

        $existingBookmark = $post->bookmarks()->where('user_id', $user->id)->first();

        if ($existingBookmark) {
            $existingBookmark->delete();
            $isBookmarked = false;
        } else {
            $post->bookmarks()->create([
                'user_id' => $user->id,
            ]);
            $isBookmarked = true;
        }

        return response()->json([
            'success' => true,
            'isBookmarked' => $isBookmarked,
        ]);
    }
}
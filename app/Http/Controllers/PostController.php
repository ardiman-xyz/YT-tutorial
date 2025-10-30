<?php

namespace App\Http\Controllers;

use App\Events\PostLiked;
use App\Models\Post;
use App\Models\Hashtag;
use App\Models\Mention;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

    /**
     * Store a newly created post.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required_without:images|max:280',
            'images' => 'nullable|array|max:4',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
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

            // Handle media uploads
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

            DB::commit();

            // If reply, redirect back to parent post
            if ($validated['parent_id'] ?? null) {
                $parentPost = Post::find($validated['parent_id']);
                return redirect()->route('posts.show', $parentPost)->with('success', 'Reply posted!');
            }

            return redirect()->route('dashboard')->with('success', 'Post created successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create post: ' . $e->getMessage()]);
        }
    }

    /**
     * Delete a post.
     */
    public function destroy(Post $post)
    {
        if ($post->user_id !== auth()->id()) {
            return back()->withErrors(['error' => 'Unauthorized action.']);
        }

        try {
            DB::beginTransaction();

            foreach ($post->media as $media) {
                $path = str_replace('/storage/', '', $media->url);
                Storage::disk('public')->delete($path);
            }

            $post->delete();

            DB::commit();

            return back()->with('success', 'Post deleted successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete post: ' . $e->getMessage()]);
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
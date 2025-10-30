<?php

namespace App\Http\Controllers;

use App\Events\PostLiked;
use App\Models\FileUpload;
use App\Models\Post;
use App\Models\Hashtag;
use App\Models\Mention;
use App\Models\Notification;
use Illuminate\Http\Request;
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

   /**
 * Store a newly created post.
 */
public function store(Request $request)
{
    // Log incoming request
    Log::info('📝 Post creation started', [
        'user_id' => auth()->id(),
        'has_content' => !empty($request->content),
        'has_images' => $request->hasFile('images'),
        'has_video_ids' => $request->has('video_upload_ids'),
    ]);

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

        Log::info('✅ Post created', ['post_id' => $post->id]);

        // Handle image uploads
        if ($request->hasFile('images')) {
            Log::info('🖼️ Processing images', ['count' => count($request->file('images'))]);
            
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
            
            Log::info('🎬 Processing videos', [
                'post_id' => $post->id,
                'video_ids' => $videoUploadIds,
            ]);

            foreach ($videoUploadIds as $uploadId) {
                // Get the completed upload
                $upload = FileUpload::where('id', $uploadId)
                    ->where('user_id', auth()->id())
                    ->where('status', 'completed')
                    ->first();

                if (!$upload) {
                    Log::warning('⚠️ Video upload not found', [
                        'upload_id' => $uploadId,
                        'post_id' => $post->id,
                    ]);
                    continue;
                }

                Log::info('📹 Video found', [
                    'upload_id' => $upload->id,
                    'filename' => $upload->original_filename ?? $upload->filename,
                    'path' => $upload->path,
                ]);

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

                Log::info('✅ Video linked to post', [
                    'post_id' => $post->id,
                    'media_id' => $media->id,
                    'video_url' => $videoUrl,
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
            
            if (count($hashtags) > 0) {
                Log::info('🏷️ Hashtags processed', ['count' => count($hashtags)]);
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
            
            if (count($mentionedUsers) > 0) {
                Log::info('👥 Mentions processed', ['count' => count($mentionedUsers)]);
            }
        }

        DB::commit();

        Log::info('🎉 Post creation completed', [
            'post_id' => $post->id,
            'media_count' => $post->media()->count(),
        ]);

        // If reply, redirect back to parent post
        if ($validated['parent_id'] ?? null) {
            $parentPost = Post::find($validated['parent_id']);
            return redirect()->route('posts.show', $parentPost)->with('success', 'Reply posted!');
        }

        return redirect()->route('dashboard')->with('success', 'Post created successfully!');

    } catch (\Exception $e) {
        DB::rollBack();
        
        Log::error('❌ Post creation failed', [
            'user_id' => auth()->id(),
            'error' => $e->getMessage(),
        ]);
        
        return back()->withErrors(['error' => 'Failed to create post: ' . $e->getMessage()])->withInput();
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
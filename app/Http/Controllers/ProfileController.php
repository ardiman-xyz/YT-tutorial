<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    /**
     * Display the user's profile.
     */
    public function show(User $user)
    {
        $currentUser = auth()->user();

        // Get user's posts
        $posts = $user->posts()
            ->whereNull('parent_id')
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media:id,post_id,type,url,thumbnail_url,duration',
            ])
            ->withCount(['likes', 'reposts', 'replies'])
            ->latest()
            ->get()
            ->map(function ($post) use ($currentUser) {
                $post->is_liked = $post->isLikedBy($currentUser);
                $post->is_reposted = $post->isRepostedBy($currentUser);
                $post->is_bookmarked = $post->isBookmarkedBy($currentUser);
                return $post;
            });

        // Get user stats
        $user->load([
            'followers',
            'following',
        ]);

        $stats = [
            'posts_count' => $user->posts()->whereNull('parent_id')->count(),
            'followers_count' => $user->followers()->count(),
            'following_count' => $user->following()->count(),
            'likes_count' => $user->posts()->withCount('likes')->get()->sum('likes_count'),
        ];

        // Check if current user follows this user
        $isFollowing = $currentUser->following()->where('following_id', $user->id)->exists();
        $isOwnProfile = $currentUser->id === $user->id;

        return inertia('profile/show', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'bio' => $user->bio,
                'location' => $user->location,
                'website' => $user->website,
                'avatar' => $user->avatar,
                'header' => $user->header,
                'is_verified' => $user->is_verified,
                'created_at' => $user->created_at,
                'stats' => $stats,
                'is_following' => $isFollowing,
                'is_own_profile' => $isOwnProfile,
            ],
            'posts' => $posts,
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
     * Show edit profile form.
     */
    public function edit()
    {
        $user = auth()->user();

        return inertia('profile/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'bio' => $user->bio,
                'location' => $user->location,
                'website' => $user->website,
                'avatar' => $user->avatar,
                'header' => $user->header,
                'birth_date' => $user->birth_date,
            ],
        ]);
    }

    /**
     * Update the user's profile.
     */
    public function update(Request $request)
    {
        $user = auth()->user();

        $validated = $request->validate([
            'name' => 'required|string|max:50',
            'username' => 'required|string|max:15|unique:users,username,' . $user->id,
            'bio' => 'nullable|string|max:160',
            'location' => 'nullable|string|max:30',
            'website' => 'nullable|url|max:100',
            'birth_date' => 'nullable|date',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'header' => 'nullable|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        try {
            // Handle avatar upload
            if ($request->hasFile('avatar')) {
                // Delete old avatar if exists
                if ($user->avatar) {
                    $oldPath = str_replace('/storage/', '', $user->avatar);
                    Storage::disk('public')->delete($oldPath);
                }

                $avatarPath = $request->file('avatar')->store('avatars', 'public');
                $validated['avatar'] = Storage::url($avatarPath);
            }

            // Handle header upload
            if ($request->hasFile('header')) {
                // Delete old header if exists
                if ($user->header) {
                    $oldPath = str_replace('/storage/', '', $user->header);
                    Storage::disk('public')->delete($oldPath);
                }

                $headerPath = $request->file('header')->store('headers', 'public');
                $validated['header'] = Storage::url($headerPath);
            }

            // Update user
            $user->update($validated);

            return redirect()->route('profile.show', $user->id)
                ->with('success', 'Profile updated successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update profile: ' . $e->getMessage()]);
        }
    }

    /**
     * Get user's liked posts.
     */
    public function likes(User $user)
    {
        $currentUser = auth()->user();

        $likedPosts = $user->likedPosts()
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media:id,post_id,type,url,thumbnail_url,duration',
            ])
            ->withCount(['likes', 'reposts', 'replies'])
            ->latest('likes.created_at')
            ->get()
            ->map(function ($post) use ($currentUser) {
                $post->is_liked = $post->isLikedBy($currentUser);
                $post->is_reposted = $post->isRepostedBy($currentUser);
                $post->is_bookmarked = $post->isBookmarkedBy($currentUser);
                return $post;
            });

        return inertia('profile/likes', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'is_verified' => $user->is_verified,
            ],
            'posts' => $likedPosts,
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
     * Get user's media posts.
     */
    public function media(User $user)
    {
        $currentUser = auth()->user();

        $mediaPosts = $user->posts()
            ->whereNull('parent_id')
            ->whereHas('media')
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media:id,post_id,type,url,thumbnail_url,duration',
            ])
            ->withCount(['likes', 'reposts', 'replies'])
            ->latest()
            ->get()
            ->map(function ($post) use ($currentUser) {
                $post->is_liked = $post->isLikedBy($currentUser);
                $post->is_reposted = $post->isRepostedBy($currentUser);
                $post->is_bookmarked = $post->isBookmarkedBy($currentUser);
                return $post;
            });

        return inertia('profile/media', [
            'profile' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'is_verified' => $user->is_verified,
            ],
            'posts' => $mediaPosts,
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
}
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ExploreController extends Controller
{
    /**
     * Display the explore page.
     */
    public function index()
    {
        $currentUser = auth()->user();

        // Get trending hashtags (mock data for now)
        $trending = $this->getTrendingTopics();

        // Get suggested users to follow
        $suggestedUsers = $this->getSuggestedUsers($currentUser);

        // Get popular posts (most liked in last 7 days)
        $popularPosts = Post::whereNull('parent_id')
            ->where('created_at', '>=', now()->subDays(7))
            ->withCount('likes')
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media:id,post_id,type,url,thumbnail_url,duration',
            ])
            ->orderBy('likes_count', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($post) use ($currentUser) {
                $post->is_liked = $post->isLikedBy($currentUser);
                $post->is_reposted = $post->isRepostedBy($currentUser);
                $post->is_bookmarked = $post->isBookmarkedBy($currentUser);
                return $post;
            });

        // Get recent posts
        $recentPosts = Post::whereNull('parent_id')
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media:id,post_id,type,url,thumbnail_url,duration',
            ])
            ->withCount(['likes', 'reposts', 'replies'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($post) use ($currentUser) {
                $post->is_liked = $post->isLikedBy($currentUser);
                $post->is_reposted = $post->isRepostedBy($currentUser);
                $post->is_bookmarked = $post->isBookmarkedBy($currentUser);
                return $post;
            });

        return inertia('explore/index', [
            'explore' => [
                'trending' => $trending,
                'suggested_users' => $suggestedUsers,
                'popular_posts' => $popularPosts,
                'recent_posts' => $recentPosts,
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
     * Get trending topics/hashtags.
     */
    private function getTrendingTopics()
    {
        // TODO: Implement real hashtag tracking
        // For now, return mock data
        return [
            [
                'id' => 1,
                'name' => 'Laravel',
                'category' => 'Technology',
                'posts_count' => 15420,
            ],
            [
                'id' => 2,
                'name' => 'React',
                'category' => 'Technology',
                'posts_count' => 12350,
            ],
            [
                'id' => 3,
                'name' => 'WebDevelopment',
                'category' => 'Technology',
                'posts_count' => 9870,
            ],
            [
                'id' => 4,
                'name' => 'AI',
                'category' => 'Technology',
                'posts_count' => 8540,
            ],
            [
                'id' => 5,
                'name' => 'JavaScript',
                'category' => 'Programming',
                'posts_count' => 7230,
            ],
            [
                'id' => 6,
                'name' => 'PHP',
                'category' => 'Programming',
                'posts_count' => 6100,
            ],
            [
                'id' => 7,
                'name' => 'TailwindCSS',
                'category' => 'Design',
                'posts_count' => 5420,
            ],
            [
                'id' => 8,
                'name' => 'Coding',
                'category' => 'Technology',
                'posts_count' => 4890,
            ],
        ];
    }

    /**
     * Get suggested users to follow.
     */
    private function getSuggestedUsers($currentUser)
    {
        // Get users that current user is not following
        // Order by followers count
        $followingIds = $currentUser->following()->pluck('following_id')->toArray();
        $followingIds[] = $currentUser->id; // Exclude self

        $users = User::whereNotIn('id', $followingIds)
            ->withCount('followers')
            ->orderBy('followers_count', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($user) use ($currentUser) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'username' => $user->username,
                    'avatar' => $user->avatar,
                    'bio' => $user->bio,
                    'is_verified' => $user->is_verified,
                    'followers_count' => $user->followers_count,
                    'is_following' => false,
                ];
            });

        return $users;
    }

    /**
     * Search posts and users.
     */
    public function search(Request $request)
    {
        $query = $request->input('q', '');
        $currentUser = auth()->user();

        if (empty($query)) {
            return redirect()->route('explore.index');
        }

        // Search users
        $users = User::where(function ($q) use ($query) {
            $q->where('name', 'like', "%{$query}%")
              ->orWhere('username', 'like', "%{$query}%");
        })
        ->withCount('followers')
        ->limit(20)
        ->get()
        ->map(function ($user) use ($currentUser) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'is_verified' => $user->is_verified,
                'followers_count' => $user->followers_count,
                'is_following' => $currentUser->following()
                    ->where('following_id', $user->id)
                    ->exists(),
            ];
        });

        // Search posts
        $posts = Post::where('content', 'like', "%{$query}%")
            ->whereNull('parent_id')
            ->with([
                'user:id,name,username,avatar,is_verified',
                'media:id,post_id,type,url,thumbnail_url,duration',
            ])
            ->withCount(['likes', 'reposts', 'replies'])
            ->latest()
            ->limit(50)
            ->get()
            ->map(function ($post) use ($currentUser) {
                $post->is_liked = $post->isLikedBy($currentUser);
                $post->is_reposted = $post->isRepostedBy($currentUser);
                $post->is_bookmarked = $post->isBookmarkedBy($currentUser);
                return $post;
            });

        return inertia('explore/search', [
            'query' => $query,
            'users' => $users,
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
}
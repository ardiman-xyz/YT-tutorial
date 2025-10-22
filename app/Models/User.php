<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'bio',
        'avatar',
        'banner',
        'location',
        'website',
        'birth_date',
        'is_verified',
        'is_private',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'birth_date' => 'date',
            'is_verified' => 'boolean',
            'is_private' => 'boolean',
        ];
    }

    // Posts relationship
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    // Likes relationship
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function likedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'likes')
            ->withTimestamps();
    }

    // Bookmarks relationship
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    public function bookmarkedPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'bookmarks')
            ->withTimestamps();
    }

    // Following relationship (user yang saya follow)
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->withTimestamps();
    }

    // Followers relationship (user yang follow saya)
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->withTimestamps();
    }

    // Check if this user follows another user
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    // Check if this user is followed by another user
    public function isFollowedBy(User $user): bool
    {
        return $this->followers()->where('follower_id', $user->id)->exists();
    }

    // Notifications received
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    // Notifications where this user is the actor
    public function actedNotifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'actor_id');
    }

    // Messages sent
    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    // Conversations
    public function conversations(): BelongsToMany
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withPivot('last_read_at', 'role')
            ->withTimestamps();
    }

    // Mentions
    public function mentions(): HasMany
    {
        return $this->hasMany(Mention::class);
    }

    // Posts where user is mentioned
    public function mentionedInPosts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'mentions')
            ->withTimestamps();
    }

    // Communities created
    public function createdCommunities(): HasMany
    {
        return $this->hasMany(Community::class, 'creator_id');
    }

    // Communities joined
    public function communities(): BelongsToMany
    {
        return $this->belongsToMany(Community::class, 'community_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    // Get followers count
    public function getFollowersCountAttribute(): int
    {
        return $this->followers()->count();
    }

    // Get following count
    public function getFollowingCountAttribute(): int
    {
        return $this->following()->count();
    }

    // Get posts count
    public function getPostsCountAttribute(): int
    {
        return $this->posts()->count();
    }

    // Check if user has liked a post
    public function hasLiked(Post $post): bool
    {
        return $this->likedPosts()->where('post_id', $post->id)->exists();
    }

    // Check if user has bookmarked a post
    public function hasBookmarked(Post $post): bool
    {
        return $this->bookmarkedPosts()->where('post_id', $post->id)->exists();
    }
}
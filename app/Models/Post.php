<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'content',
        'parent_id',
        'is_repost',
        'original_post_id',
        'reply_permission',
        'replies_count',
        'reposts_count',
        'likes_count',
        'views_count',
        'bookmarks_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_repost' => 'boolean',
            'replies_count' => 'integer',
            'reposts_count' => 'integer',
            'likes_count' => 'integer',
            'views_count' => 'integer',
            'bookmarks_count' => 'integer',
        ];
    }

    // User relationship
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Media relationship
    public function media(): HasMany
    {
        return $this->hasMany(Media::class)->orderBy('order');
    }

    // Likes relationship
    public function likes(): HasMany
    {
        return $this->hasMany(Like::class);
    }

    public function likedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'likes')
            ->withTimestamps();
    }

    // Bookmarks relationship
    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    public function bookmarkedByUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'bookmarks')
            ->withTimestamps();
    }

    // Parent post (untuk reply)
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'parent_id');
    }

    // Replies (posts yang reply ke post ini)
    public function replies(): HasMany
    {
        return $this->hasMany(Post::class, 'parent_id');
    }

    // Original post (untuk repost)
    public function originalPost(): BelongsTo
    {
        return $this->belongsTo(Post::class, 'original_post_id');
    }

    // Reposts (posts yang repost post ini)
    public function reposts(): HasMany
    {
        return $this->hasMany(Post::class, 'original_post_id')
            ->where('is_repost', true);
    }

    // Hashtags relationship
    public function hashtags(): BelongsToMany
    {
        return $this->belongsToMany(Hashtag::class, 'hashtag_post')
            ->withTimestamps();
    }

    // Mentions relationship
    public function mentions(): HasMany
    {
        return $this->hasMany(Mention::class);
    }

    public function mentionedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'mentions')
            ->withTimestamps();
    }

    // Notifications relationship
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    // Scopes
    public function scopeWithoutReplies($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeOnlyReplies($query)
    {
        return $query->whereNotNull('parent_id');
    }

    public function scopeWithoutReposts($query)
    {
        return $query->where('is_repost', false);
    }

    public function scopeOnlyReposts($query)
    {
        return $query->where('is_repost', true);
    }

    // Helper methods
    public function isReply(): bool
    {
        return !is_null($this->parent_id);
    }

    public function isRepost(): bool
    {
        return $this->is_repost;
    }

    public function isQuoteTweet(): bool
    {
        return $this->is_repost && !is_null($this->content);
    }

    public function canReply(User $user): bool
    {
        if ($this->reply_permission === 'everyone') {
            return true;
        }

        if ($this->reply_permission === 'following') {
            return $this->user->isFollowedBy($user) || $this->user_id === $user->id;
        }

        if ($this->reply_permission === 'mentioned') {
            return $this->mentionedUsers()->where('user_id', $user->id)->exists() 
                || $this->user_id === $user->id;
        }

        return false;
    }

    // Increment counters
    public function incrementRepliesCount(): void
    {
        $this->increment('replies_count');
    }

    public function decrementRepliesCount(): void
    {
        $this->decrement('replies_count');
    }

    public function incrementRepostsCount(): void
    {
        $this->increment('reposts_count');
    }

    public function decrementRepostsCount(): void
    {
        $this->decrement('reposts_count');
    }

    public function incrementLikesCount(): void
    {
        $this->increment('likes_count');
    }

    public function decrementLikesCount(): void
    {
        $this->decrement('likes_count');
    }

    public function incrementViewsCount(): void
    {
        $this->increment('views_count');
    }

    public function incrementBookmarksCount(): void
    {
        $this->increment('bookmarks_count');
    }

    public function decrementBookmarksCount(): void
    {
        $this->decrement('bookmarks_count');
    }
}
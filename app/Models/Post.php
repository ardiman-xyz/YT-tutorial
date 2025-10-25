<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'parent_id',
        'reply_permission',
        'views_count',
    ];

    protected $casts = [
        'views_count' => 'integer',
    ];

    /**
     * Get the user that owns the post.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the media for the post.
     */
    public function media()
    {
        return $this->hasMany(Media::class);
    }

    /**
     * Get the hashtags for the post.
     */
    public function hashtags()
    {
        return $this->belongsToMany(Hashtag::class, 'post_hashtags');
    }

    /**
     * Get the mentions in the post.
     */
    public function mentions()
    {
        return $this->hasMany(Mention::class);
    }

    /**
     * Get the parent post (for replies).
     */
    public function parent()
    {
        return $this->belongsTo(Post::class, 'parent_id');
    }

    /**
     * Get the replies to this post.
     */
    public function replies()
    {
        return $this->hasMany(Post::class, 'parent_id');
    }

    /**
     * Get the likes for the post.
     */
    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    /**
     * Get users who liked this post.
     */
    public function likedBy()
    {
        return $this->belongsToMany(User::class, 'likes')->withTimestamps();
    }

    /**
     * Check if user has liked this post.
     */
    public function isLikedBy(User $user)
    {
        return $this->likes()->where('user_id', $user->id)->exists();
    }

    /**
     * Get likes count.
     */
    public function likesCount()
    {
        return $this->likes()->count();
    }

    /**
     * Get the reposts for the post.
     */
    public function reposts()
    {
        return $this->hasMany(Repost::class);
    }

    /**
     * Get users who reposted this post.
     */
    public function repostedBy()
    {
        return $this->belongsToMany(User::class, 'reposts')->withTimestamps();
    }

    /**
     * Check if user has reposted this post.
     */
    public function isRepostedBy(User $user)
    {
        return $this->reposts()->where('user_id', $user->id)->exists();
    }

    /**
     * Get reposts count.
     */
    public function repostsCount()
    {
        return $this->reposts()->count();
    }

    /**
     * Get the bookmarks for the post.
     */
    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    /**
     * Get users who bookmarked this post.
     */
    public function bookmarkedBy()
    {
        return $this->belongsToMany(User::class, 'bookmarks')->withTimestamps();
    }

    /**
     * Check if user has bookmarked this post.
     */
    public function isBookmarkedBy(User $user)
    {
        return $this->bookmarks()->where('user_id', $user->id)->exists();
    }

    /**
     * Get bookmarks count.
     */
    public function bookmarksCount()
    {
        return $this->bookmarks()->count();
    }
}
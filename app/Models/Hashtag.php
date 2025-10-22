<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Hashtag extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'posts_count',
        'daily_posts_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'posts_count' => 'integer',
            'daily_posts_count' => 'integer',
        ];
    }

    // Posts relationship
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'hashtag_post')
            ->withTimestamps();
    }

    // Scopes
    public function scopeTrending($query, int $limit = 10)
    {
        return $query->orderBy('daily_posts_count', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit);
    }

    public function scopePopular($query, int $limit = 10)
    {
        return $query->orderBy('posts_count', 'desc')
            ->limit($limit);
    }

    // Helper methods
    public function incrementPostsCount(): void
    {
        $this->increment('posts_count');
        $this->increment('daily_posts_count');
    }

    public function decrementPostsCount(): void
    {
        $this->decrement('posts_count');
    }

    public function resetDailyCount(): void
    {
        $this->update(['daily_posts_count' => 0]);
    }

    // Get formatted name with #
    public function getFormattedNameAttribute(): string
    {
        return '#' . $this->name;
    }

    // Extract hashtags from text
    public static function extractHashtags(string $text): array
    {
        preg_match_all('/#(\w+)/u', $text, $matches);
        return array_unique($matches[1]);
    }

    // Find or create hashtags from text
    public static function findOrCreateFromText(string $text): array
    {
        $hashtagNames = self::extractHashtags($text);
        $hashtags = [];

        foreach ($hashtagNames as $name) {
            $hashtag = self::firstOrCreate(['name' => strtolower($name)]);
            $hashtags[] = $hashtag;
        }

        return $hashtags;
    }
}
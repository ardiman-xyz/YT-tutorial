<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [];

    // Participants relationship
    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'conversation_participants')
            ->withPivot('last_read_at', 'role')
            ->withTimestamps();
    }

    // Messages relationship
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'desc');
    }

    // Get latest message
    public function latestMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    // Check if user is participant
    public function hasParticipant(User $user): bool
    {
        return $this->participants()->where('user_id', $user->id)->exists();
    }

    // Get other participant (untuk 1-on-1 chat)
    public function getOtherParticipant(User $currentUser): ?User
    {
        return $this->participants()
            ->where('user_id', '!=', $currentUser->id)
            ->first();
    }

    // Mark as read for user
    public function markAsReadFor(User $user): void
    {
        $this->participants()->updateExistingPivot($user->id, [
            'last_read_at' => now(),
        ]);
    }

    // Get unread count for user
    public function getUnreadCountFor(User $user): int
    {
        $lastReadAt = $this->participants()
            ->where('user_id', $user->id)
            ->first()
            ->pivot
            ->last_read_at;

        if (!$lastReadAt) {
            return $this->messages()->count();
        }

        return $this->messages()
            ->where('created_at', '>', $lastReadAt)
            ->where('sender_id', '!=', $user->id)
            ->count();
    }
}

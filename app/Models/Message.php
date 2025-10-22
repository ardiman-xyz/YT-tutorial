<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Message extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'is_read',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
        ];
    }

    // Conversation relationship
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    // Sender relationship
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // Scopes
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    // Mark as read
    public function markAsRead(): void
    {
        $this->update(['is_read' => true]);
    }
}
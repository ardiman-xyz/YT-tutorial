<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ConversationParticipant extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'conversation_id',
        'user_id',
        'last_read_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_read_at' => 'datetime',
        ];
    }

    // Conversation relationship
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    // User relationship
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
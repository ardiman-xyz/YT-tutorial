<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Follow extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'follower_id',
        'following_id',
    ];

    // Follower (yang mengikuti)
    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follower_id');
    }

    // Following (yang diikuti)
    public function following(): BelongsTo
    {
        return $this->belongsTo(User::class, 'following_id');
    }
}
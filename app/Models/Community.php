<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Community extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'avatar',
        'banner',
        'creator_id',
        'is_private',
        'members_count',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
            'members_count' => 'integer',
        ];
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($community) {
            if (empty($community->slug)) {
                $community->slug = Str::slug($community->name);
            }
        });
    }

    // Creator relationship
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    // Members relationship
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'community_members')
            ->withPivot('role')
            ->withTimestamps();
    }

    // Admins
    public function admins(): BelongsToMany
    {
        return $this->members()->wherePivot('role', 'admin');
    }

    // Moderators
    public function moderators(): BelongsToMany
    {
        return $this->members()->wherePivot('role', 'moderator');
    }

    // Regular members
    public function regularMembers(): BelongsToMany
    {
        return $this->members()->wherePivot('role', 'member');
    }

    // Check if user is member
    public function hasMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }

    // Check if user is admin
    public function isAdmin(User $user): bool
    {
        return $this->members()
            ->wherePivot('user_id', $user->id)
            ->wherePivot('role', 'admin')
            ->exists();
    }

    // Check if user is moderator
    public function isModerator(User $user): bool
    {
        return $this->members()
            ->wherePivot('user_id', $user->id)
            ->wherePivot('role', 'moderator')
            ->exists();
    }

    // Check if user is admin or moderator
    public function isAdminOrModerator(User $user): bool
    {
        return $this->isAdmin($user) || $this->isModerator($user);
    }

    // Add member
    public function addMember(User $user, string $role = 'member'): void
    {
        if (!$this->hasMember($user)) {
            $this->members()->attach($user->id, ['role' => $role]);
            $this->increment('members_count');
        }
    }

    // Remove member
    public function removeMember(User $user): void
    {
        if ($this->hasMember($user)) {
            $this->members()->detach($user->id);
            $this->decrement('members_count');
        }
    }

    // Update member role
    public function updateMemberRole(User $user, string $role): void
    {
        $this->members()->updateExistingPivot($user->id, ['role' => $role]);
    }

    // Scopes
    public function scopePublic($query)
    {
        return $query->where('is_private', false);
    }

    public function scopePrivate($query)
    {
        return $query->where('is_private', true);
    }

    // Get route key name
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}

class CommunityMember extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'community_members';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'community_id',
        'user_id',
        'role',
    ];

    // Community relationship
    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }

    // User relationship
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Check role
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isModerator(): bool
    {
        return $this->role === 'moderator';
    }

    public function isMember(): bool
    {
        return $this->role === 'member';
    }
}
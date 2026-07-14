<?php

namespace App\Models;

use App\Tenancy\TenantManager;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'avatar',
        'locale',
        'is_super_admin',
        'provider',
        'provider_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }

    // ------------------------------------------------------------------
    // Relationships
    // ------------------------------------------------------------------

    /** Restaurant memberships (one row per restaurant the user works in). */
    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    /** Restaurants this user owns. */
    public function ownedRestaurants(): HasMany
    {
        return $this->hasMany(Restaurant::class, 'owner_id');
    }

    /** Restaurants this user belongs to (through the employees pivot). */
    public function restaurants(): BelongsToMany
    {
        return $this->belongsToMany(Restaurant::class, 'employees')
            ->withPivot(['role_id', 'job_title', 'status'])
            ->withTimestamps();
    }

    // ------------------------------------------------------------------
    // Tenancy helpers
    // ------------------------------------------------------------------

    public function isSuperAdmin(): bool
    {
        return (bool) $this->is_super_admin;
    }

    /**
     * Resolve which restaurant this request acts on. Honours an explicitly
     * requested id only if the user is a member of it; otherwise falls back
     * to the user's first active membership.
     */
    public function resolveRestaurant(?int $requestedId = null): ?Restaurant
    {
        $memberships = $this->employees()->with('restaurant')->get();

        if ($requestedId) {
            $match = $memberships->firstWhere('restaurant_id', (int) $requestedId);
            if ($match) {
                return $match->restaurant;
            }
        }

        return $memberships->first()?->restaurant;
    }

    /** The employee/membership record for a given restaurant (defaults to current tenant). */
    public function employeeFor(?int $restaurantId = null): ?Employee
    {
        $restaurantId ??= app(TenantManager::class)->id();

        if (! $restaurantId) {
            return null;
        }

        return $this->employees()
            ->with('role.permissions')
            ->where('restaurant_id', $restaurantId)
            ->first();
    }

    // ------------------------------------------------------------------
    // RBAC helpers (scoped to the current tenant)
    // ------------------------------------------------------------------

    public function hasRole(string $slug, ?int $restaurantId = null): bool
    {
        if ($this->isSuperAdmin() && $slug === 'super_admin') {
            return true;
        }

        return optional($this->employeeFor($restaurantId)->role ?? null)->slug === $slug;
    }

    public function hasPermission(string $slug, ?int $restaurantId = null): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        $employee = $this->employeeFor($restaurantId);

        if (! $employee || ! $employee->role) {
            return false;
        }

        return $employee->role->permissions->contains('slug', $slug);
    }
}

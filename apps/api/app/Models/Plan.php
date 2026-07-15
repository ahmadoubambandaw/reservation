<?php

namespace App\Models;

use App\Support\Modules;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'currency',
        'billing_period', 'trial_days', 'features', 'modules', 'limits',
        'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'modules' => 'array',
            'limits' => 'array',
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /** Read a numeric limit (null = unlimited). */
    public function limit(string $key): ?int
    {
        $value = $this->limits[$key] ?? null;

        return $value === null ? null : (int) $value;
    }

    public function hasFeature(string $feature): bool
    {
        return in_array($feature, $this->features ?? [], true);
    }

    /** Module keys unlocked by this plan (core modules are always included). */
    public function modules(): array
    {
        return array_values(array_unique([
            ...Modules::core(),
            ...($this->modules ?? []),
        ]));
    }

    public function hasModule(string $module): bool
    {
        return in_array($module, $this->modules(), true);
    }
}

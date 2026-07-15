<?php

namespace App\Tenancy;

use App\Http\Middleware\ResolveTenant;
use App\Models\Restaurant;
use App\Models\Scopes\TenantScope;

/**
 * Holds the "current tenant" (restaurant) for the lifetime of a request or job.
 *
 * Registered as a singleton (`tenant`) in the container. The active tenant is
 * set by {@see ResolveTenant} after authentication, and
 * consumed by the {@see TenantScope} global scope so that
 * every tenant-owned query is transparently filtered by `restaurant_id`.
 */
class TenantManager
{
    protected ?Restaurant $restaurant = null;

    /**
     * When true, the tenant global scope is bypassed entirely.
     * Used for the Super Admin and for background jobs that legitimately
     * need cross-tenant access.
     */
    protected bool $spanAll = false;

    public function set(?Restaurant $restaurant): static
    {
        $this->restaurant = $restaurant;

        return $this;
    }

    public function current(): ?Restaurant
    {
        return $this->restaurant;
    }

    public function id(): ?int
    {
        return $this->restaurant?->id;
    }

    public function check(): bool
    {
        return $this->restaurant !== null;
    }

    public function forget(): static
    {
        $this->restaurant = null;

        return $this;
    }

    public function spansAllTenants(): bool
    {
        return $this->spanAll;
    }

    /**
     * Run a callback with the tenant scope disabled (cross-tenant access),
     * restoring the previous state afterwards.
     */
    public function spanAllTenants(callable $callback): mixed
    {
        $previous = $this->spanAll;
        $this->spanAll = true;

        try {
            return $callback();
        } finally {
            $this->spanAll = $previous;
        }
    }

    /**
     * Run a callback as if a specific restaurant were the active tenant,
     * restoring the previous tenant afterwards.
     */
    public function forRestaurant(Restaurant $restaurant, callable $callback): mixed
    {
        $previous = $this->restaurant;
        $this->restaurant = $restaurant;

        try {
            return $callback();
        } finally {
            $this->restaurant = $previous;
        }
    }
}

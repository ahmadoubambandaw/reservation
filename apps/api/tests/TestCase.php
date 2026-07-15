<?php

namespace Tests;

use App\Models\Employee;
use App\Models\Restaurant;
use App\Models\Role;
use App\Models\User;
use App\Services\RestaurantProvisioner;
use App\Tenancy\TenantManager;
use Database\Seeders\PlanSeeder;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /** Seed the reference data (plans, roles, permissions) every test needs. */
    protected function seedReferenceData(): void
    {
        $this->seed([PlanSeeder::class, RolePermissionSeeder::class]);
    }

    /** Create a restaurant owned by a fresh user. Returns [restaurant, owner]. */
    protected function makeRestaurant(string $name = 'Test Resto'): array
    {
        $owner = User::factory()->create();
        $restaurant = app(RestaurantProvisioner::class)->provision($owner, $name, 'pro');

        return [$restaurant, $owner];
    }

    /** Attach a user to a restaurant with a given role and return the user. */
    protected function makeStaff(Restaurant $restaurant, string $roleSlug): User
    {
        $user = User::factory()->create();
        Employee::create([
            'restaurant_id' => $restaurant->id,
            'user_id' => $user->id,
            'role_id' => Role::where('slug', $roleSlug)->firstOrFail()->id,
            'status' => 'active',
        ]);

        return $user;
    }

    /** Run a callback within a restaurant's tenant context. */
    protected function withinTenant(Restaurant $restaurant, callable $callback): mixed
    {
        return app(TenantManager::class)->forRestaurant($restaurant, $callback);
    }
}

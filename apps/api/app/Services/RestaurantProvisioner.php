<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\Plan;
use App\Models\Restaurant;
use App\Models\Role;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Support\Facades\DB;

/**
 * Bootstraps a brand-new tenant: creates the restaurant, attaches the owner
 * with the restaurant_owner role, and opens a (trial) subscription.
 * Shared by the registration endpoint and the demo seeder.
 */
class RestaurantProvisioner
{
    public function provision(User $owner, string $restaurantName, ?string $planSlug = null): Restaurant
    {
        return DB::transaction(function () use ($owner, $restaurantName, $planSlug) {
            $restaurant = Restaurant::create([
                'owner_id' => $owner->id,
                'name' => $restaurantName,
                'status' => 'active',
            ]);

            $ownerRole = Role::where('slug', Role::OWNER)->firstOrFail();

            Employee::create([
                'restaurant_id' => $restaurant->id,
                'user_id' => $owner->id,
                'role_id' => $ownerRole->id,
                'job_title' => 'Propriétaire',
                'status' => 'active',
                'hired_at' => now(),
            ]);

            $plan = Plan::where('slug', $planSlug ?: 'free')->first()
                ?? Plan::orderBy('price')->first();

            if ($plan) {
                Subscription::create([
                    'restaurant_id' => $restaurant->id,
                    'plan_id' => $plan->id,
                    'status' => $plan->trial_days > 0 ? 'trialing' : 'active',
                    'provider' => 'manual',
                    'trial_ends_at' => $plan->trial_days > 0 ? now()->addDays($plan->trial_days) : null,
                    'starts_at' => now(),
                ]);
            }

            return $restaurant;
        });
    }
}

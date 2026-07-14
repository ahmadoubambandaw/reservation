<?php

namespace Database\Seeders;

use App\Models\Plan;
use App\Support\Permissions;
use Illuminate\Database\Seeder;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free', 'slug' => 'free', 'price' => 0, 'trial_days' => 0,
                'description' => 'Pour démarrer et tester la plateforme.',
                'features' => [Permissions::RESERVATIONS_MANAGE, Permissions::MENU_MANAGE, Permissions::TABLES_MANAGE],
                'limits' => ['tables' => 5, 'employees' => 2, 'menu_items' => 30],
                'sort_order' => 1,
            ],
            [
                'name' => 'Basic', 'slug' => 'basic', 'price' => 9900, 'trial_days' => 14,
                'description' => 'Pour les petits restaurants.',
                'features' => [
                    Permissions::RESERVATIONS_MANAGE, Permissions::MENU_MANAGE, Permissions::TABLES_MANAGE,
                    Permissions::ORDERS_MANAGE, Permissions::CUSTOMERS_MANAGE,
                ],
                'limits' => ['tables' => 20, 'employees' => 8, 'menu_items' => 150],
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro', 'slug' => 'pro', 'price' => 24900, 'trial_days' => 14,
                'description' => 'Pour les restaurants en croissance.',
                'features' => [
                    Permissions::RESERVATIONS_MANAGE, Permissions::MENU_MANAGE, Permissions::TABLES_MANAGE,
                    Permissions::ORDERS_MANAGE, Permissions::CUSTOMERS_MANAGE, Permissions::COUPONS_MANAGE,
                    Permissions::STATS_VIEW, Permissions::EMPLOYEES_MANAGE,
                ],
                'limits' => ['tables' => 60, 'employees' => 30, 'menu_items' => null],
                'sort_order' => 3,
            ],
            [
                'name' => 'Enterprise', 'slug' => 'enterprise', 'price' => 79900, 'trial_days' => 30,
                'description' => 'Chaînes et groupes multi-établissements.',
                'features' => Permissions::all(),
                'limits' => ['tables' => null, 'employees' => null, 'menu_items' => null],
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            Plan::updateOrCreate(['slug' => $plan['slug']], $plan + ['currency' => 'XOF', 'billing_period' => 'monthly', 'is_active' => true]);
        }
    }
}

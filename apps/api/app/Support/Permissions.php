<?php

namespace App\Support;

use App\Models\Role;

/**
 * Central catalogue of RBAC permissions and the default role → permission
 * mapping. Consumed by the permissions seeder and by the AppServiceProvider
 * which registers each slug as a Gate ability.
 */
class Permissions
{
    // Dashboard & stats
    public const DASHBOARD_VIEW = 'dashboard.view';

    public const STATS_VIEW = 'stats.view';

    // Restaurant settings
    public const RESTAURANT_MANAGE = 'restaurant.manage';

    public const SETTINGS_MANAGE = 'settings.manage';

    // Menu
    public const MENU_VIEW = 'menu.view';

    public const MENU_MANAGE = 'menu.manage';

    // Tables
    public const TABLES_VIEW = 'tables.view';

    public const TABLES_MANAGE = 'tables.manage';

    // Reservations
    public const RESERVATIONS_VIEW = 'reservations.view';

    public const RESERVATIONS_MANAGE = 'reservations.manage';

    // Orders
    public const ORDERS_VIEW = 'orders.view';

    public const ORDERS_MANAGE = 'orders.manage';

    public const ORDERS_KITCHEN = 'orders.kitchen';   // update preparation status

    // Customers / CRM
    public const CUSTOMERS_VIEW = 'customers.view';

    public const CUSTOMERS_MANAGE = 'customers.manage';

    // Employees
    public const EMPLOYEES_VIEW = 'employees.view';

    public const EMPLOYEES_MANAGE = 'employees.manage';

    // Promotions
    public const COUPONS_MANAGE = 'coupons.manage';

    // Reviews
    public const REVIEWS_MANAGE = 'reviews.manage';

    // Payments / billing
    public const PAYMENTS_VIEW = 'payments.view';

    public const BILLING_MANAGE = 'billing.manage';

    /**
     * All permissions grouped by module (used to seed the permissions table).
     *
     * @return array<string, array<string, string>> group => [slug => label]
     */
    public static function catalogue(): array
    {
        return [
            'Tableau de bord' => [
                self::DASHBOARD_VIEW => 'Voir le tableau de bord',
                self::STATS_VIEW => 'Voir les statistiques',
            ],
            'Restaurant' => [
                self::RESTAURANT_MANAGE => 'Gérer le restaurant',
                self::SETTINGS_MANAGE => 'Gérer les paramètres',
            ],
            'Menu' => [
                self::MENU_VIEW => 'Voir le menu',
                self::MENU_MANAGE => 'Gérer le menu',
            ],
            'Tables' => [
                self::TABLES_VIEW => 'Voir les tables',
                self::TABLES_MANAGE => 'Gérer les tables',
            ],
            'Réservations' => [
                self::RESERVATIONS_VIEW => 'Voir les réservations',
                self::RESERVATIONS_MANAGE => 'Gérer les réservations',
            ],
            'Commandes' => [
                self::ORDERS_VIEW => 'Voir les commandes',
                self::ORDERS_MANAGE => 'Gérer les commandes',
                self::ORDERS_KITCHEN => 'Mettre à jour la cuisine',
            ],
            'Clients' => [
                self::CUSTOMERS_VIEW => 'Voir les clients',
                self::CUSTOMERS_MANAGE => 'Gérer les clients',
            ],
            'Employés' => [
                self::EMPLOYEES_VIEW => 'Voir les employés',
                self::EMPLOYEES_MANAGE => 'Gérer les employés',
            ],
            'Promotions' => [
                self::COUPONS_MANAGE => 'Gérer les coupons',
            ],
            'Avis' => [
                self::REVIEWS_MANAGE => 'Gérer les avis',
            ],
            'Facturation' => [
                self::PAYMENTS_VIEW => 'Voir les paiements',
                self::BILLING_MANAGE => 'Gérer la facturation',
            ],
        ];
    }

    /** Flat list of every permission slug. */
    public static function all(): array
    {
        $slugs = [];
        foreach (static::catalogue() as $group) {
            foreach ($group as $slug => $label) {
                $slugs[] = $slug;
            }
        }

        return $slugs;
    }

    /**
     * Default permission set for each role.
     *
     * @return array<string, array<int, string>>
     */
    public static function forRoles(): array
    {
        $all = static::all();

        return [
            Role::OWNER => $all, // owner gets everything within the tenant

            Role::MANAGER => array_values(array_diff($all, [
                self::BILLING_MANAGE,
            ])),

            Role::CASHIER => [
                self::DASHBOARD_VIEW,
                self::ORDERS_VIEW, self::ORDERS_MANAGE,
                self::RESERVATIONS_VIEW, self::RESERVATIONS_MANAGE,
                self::CUSTOMERS_VIEW, self::CUSTOMERS_MANAGE,
                self::MENU_VIEW,
                self::TABLES_VIEW,
                self::PAYMENTS_VIEW,
            ],

            Role::WAITER => [
                self::DASHBOARD_VIEW,
                self::RESERVATIONS_VIEW, self::RESERVATIONS_MANAGE,
                self::ORDERS_VIEW, self::ORDERS_MANAGE,
                self::TABLES_VIEW,
                self::MENU_VIEW,
                self::CUSTOMERS_VIEW,
            ],

            Role::KITCHEN => [
                self::ORDERS_VIEW, self::ORDERS_KITCHEN,
                self::MENU_VIEW,
            ],

            Role::CUSTOMER => [],
        ];
    }
}

<?php

namespace App\Support;

/**
 * Catalogue of the Restaurant-OS modules. Each module can be turned on or off
 * per restaurant through its subscription plan (see `plans.modules`). This is
 * the backbone that keeps the platform modular and monetisable.
 *
 * Adding a new module = add a key here, list it in the relevant plans
 * (PlanSeeder), and guard its routes with the `module:<key>` middleware.
 */
class Modules
{
    public const RESERVATIONS = 'reservations';

    public const MENU = 'menu';

    public const POS = 'pos';

    public const KITCHEN_DISPLAY = 'kitchen_display';

    public const INVENTORY = 'inventory';

    public const CRM = 'crm';

    public const ACCOUNTING = 'accounting';

    public const MARKETING = 'marketing';

    public const REPORTS = 'reports';

    public const STAFF = 'staff';

    public const SETTINGS = 'settings';

    /**
     * Every module with human metadata, keyed by module key.
     *
     * @return array<string, array{name:string, description:string, core:bool}>
     */
    public static function catalogue(): array
    {
        return [
            self::RESERVATIONS => ['name' => 'Réservations', 'description' => 'Gestion des réservations et tables.', 'core' => true],
            self::MENU => ['name' => 'Menu', 'description' => 'Cartes, catégories, plats et QR menu.', 'core' => true],
            self::POS => ['name' => 'Point de vente (POS)', 'description' => 'Commandes, encaissement, caisse et ticket.', 'core' => false],
            self::KITCHEN_DISPLAY => ['name' => 'Écran cuisine', 'description' => 'File des commandes : en attente, préparation, prêt, servi.', 'core' => false],
            self::INVENTORY => ['name' => 'Stocks', 'description' => 'Ingrédients, fournisseurs, achats, inventaire et alertes.', 'core' => false],
            self::CRM => ['name' => 'CRM', 'description' => 'Historique clients, fidélité, coupons, anniversaires.', 'core' => false],
            self::ACCOUNTING => ['name' => 'Comptabilité', 'description' => 'Revenus, dépenses et bénéfices.', 'core' => false],
            self::MARKETING => ['name' => 'Marketing', 'description' => 'Campagnes SMS, Email, WhatsApp et promotions.', 'core' => false],
            self::REPORTS => ['name' => 'Rapports', 'description' => 'Ventes, réservations, plats populaires, employés.', 'core' => false],
            self::STAFF => ['name' => 'Personnel', 'description' => 'Rôles, permissions, horaires et présence.', 'core' => false],
            self::SETTINGS => ['name' => 'Paramètres', 'description' => 'Thème, couleurs, logo, domaine personnalisé.', 'core' => false],
        ];
    }

    /** All module keys. */
    public static function all(): array
    {
        return array_keys(static::catalogue());
    }

    /** Modules always available regardless of plan (kept for backward-compat). */
    public static function core(): array
    {
        return array_keys(array_filter(static::catalogue(), fn ($m) => $m['core']));
    }

    public static function exists(string $key): bool
    {
        return array_key_exists($key, static::catalogue());
    }
}

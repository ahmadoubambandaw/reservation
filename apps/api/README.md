# Ndaw-Resto API (Laravel 12)

API multi-tenant du SaaS Ndaw-Resto. Voir la doc d'ensemble à la racine du
monorepo : [`../../README.md`](../../README.md),
[`../../docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md),
[`../../docs/API.md`](../../docs/API.md).

## Prérequis

PHP 8.3+, Composer, PostgreSQL 14+, Redis.

## Installation

```bash
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

## Tests

Les tests tournent sur PostgreSQL (le code utilise `ilike`, `extract`,
`to_char`). Créez la base de test une fois :

```bash
createdb ndaw_resto_test
php artisan test
```

Suites incluses : authentification, isolation multi-tenant, RBAC, réservations.

## Structure clé

```
app/
├─ Tenancy/TenantManager.php          # tenant actif (singleton)
├─ Models/Concerns/BelongsToTenant.php# trait d'isolation
├─ Models/Scopes/TenantScope.php      # global scope restaurant_id
├─ Support/Permissions.php            # catalogue RBAC
├─ Services/                          # RestaurantProvisioner, TwoFactorService
├─ Http/Middleware/                   # ResolveTenant, EnsureRole, EnsurePermission
├─ Http/Controllers/Api/V1/           # contrôleurs (+ Public/, Admin/)
└─ Http/Resources/                    # sérialisation JSON
routes/api.php                        # toutes les routes /api/v1
database/{migrations,seeders}
```

## Intégrations externes (config prête, câblage à venir)

Les clés sont déjà prévues dans `.env.example` : Cloudinary, Stripe, Wave,
Orange Money, Google Maps, Twilio (SMS/WhatsApp), FCM (push), Google/Facebook
OAuth. Les services correspondants s'ajoutent dans `app/Services/` sans toucher
au socle.

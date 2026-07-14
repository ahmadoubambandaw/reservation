# Architecture — Ndaw-Resto API

## 1. Multi-tenancy (isolation des données)

Modèle retenu : **base unique, schéma partagé, colonne discriminante
`restaurant_id`**. Chaque restaurant est un *tenant*. C'est l'approche la plus
simple à opérer et la plus économique pour un SaaS à forte densité de petits
comptes, tout en garantissant une isolation stricte.

### Les 3 pièces

| Pièce | Rôle |
|-------|------|
| `App\Tenancy\TenantManager` | Singleton conteneur qui détient le tenant actif du cycle de requête/job. |
| `App\Models\Concerns\BelongsToTenant` | Trait posé sur chaque modèle appartenant à un restaurant. |
| `App\Models\Scopes\TenantScope` | Global scope qui filtre **toutes** les requêtes par `restaurant_id`. |

Le trait fait deux choses :

1. **Lecture** — enregistre le `TenantScope`, donc `MenuItem::all()` ne renvoie
   jamais que les plats du tenant courant.
2. **Écriture** — remplit automatiquement `restaurant_id` à la création, donc le
   code applicatif n'a jamais à le préciser.

```php
class MenuItem extends Model
{
    use BelongsToTenant; // isolation lecture + écriture, transparente
}
```

### Résolution du tenant + ordre des middlewares (point critique)

`App\Http\Middleware\ResolveTenant` fixe le tenant à partir de l'utilisateur
authentifié (ou de l'en-tête `X-Restaurant-Id` pour le Super Admin).

Pour que l'isolation s'applique **aussi** au route-model binding
(`GET /tables/{table}`), `ResolveTenant` **doit** s'exécuter *après*
l'authentification mais *avant* `SubstituteBindings`. C'est garanti par une
**priorité de middleware explicite** dans `bootstrap/app.php` :

```
Authenticate → ResolveTenant → SubstituteBindings → Authorize
```

Résultat : une requête vers l'ID d'une ressource d'un autre restaurant renvoie
**404** (jamais une fuite). Couvert par `tests/Feature/TenantIsolationTest.php`.

### Accès cross-tenant maîtrisé

Le Super Admin et les jobs de fond peuvent franchir la frontière via des API
explicites, jamais par accident :

```php
app(TenantManager::class)->spanAllTenants(fn () => Restaurant::count());
app(TenantManager::class)->forRestaurant($resto, fn () => MenuItem::create([...]));
```

## 2. RBAC (rôles & permissions)

- **7 rôles** : `super_admin`, `restaurant_owner`, `manager`, `cashier`,
  `waiter`, `kitchen`, `customer`.
- **21 permissions** groupées par module (voir `App\Support\Permissions`).
- L'appartenance à un restaurant **et** le rôle sont portés par la table pivot
  `employees` (`restaurant_id` + `user_id` + `role_id`). Un même utilisateur
  peut donc avoir des rôles différents dans plusieurs restaurants.

Chaque permission est enregistrée comme *Gate ability* dans
`AppServiceProvider`, adossée à `User::hasPermission()` (scopé au tenant
courant). Le Super Admin court-circuite tout via `Gate::before`.

```php
// Dans un contrôleur
$this->authorize(Permissions::RESERVATIONS_MANAGE);

// En route
Route::post(...)->middleware('permission:menu.manage');
Route::get(...)->middleware('role:manager,cashier');
```

## 3. Modularité / réutilisation pour d'autres SaaS

Le socle est conçu pour être réextrait :

- `Tenancy/` + `Concerns/BelongsToTenant` + `Scopes/TenantScope` : **package
  multi-tenant** réutilisable tel quel.
- `Support/Permissions` + middlewares `role`/`permission` : **package RBAC**.
- API versionnée (`/api/v1`), réponses via API Resources : contrat stable pour
  le web **et** le mobile Flutter (même token Sanctum).
- Services découplés (`RestaurantProvisioner`, `TwoFactorService`) : logique
  métier hors des contrôleurs, testable et remplaçable.

## 4. Sécurité

- **Auth** : Sanctum (tokens API + support SPA stateful).
- **2FA** : TOTP RFC 6238 autonome (`TwoFactorService`), compatible Google
  Authenticator.
- **RBAC** appliqué à chaque action (Gate + middlewares).
- **Isolation tenant** au niveau ORM (impossible à oublier dans un contrôleur).
- **Rate limiting** sur `login`/`register`.
- **Validation** systématique (Form Requests / `validate`).
- **CSRF** via le stateful guard Sanctum pour le front SPA.
- Table `audit_logs` prête pour la traçabilité.

## 5. Schéma de données (22 tables)

`users`, `restaurants`, `plans`, `subscriptions`, `roles`, `permissions`,
`permission_role`, `employees`, `customers`, `restaurant_tables`, `categories`,
`menus`, `menu_items`, `reservations`, `orders`, `order_items`, `payments`
(polymorphe), `invoices`, `reviews`, `coupons`, `audit_logs`, `settings`.

Tables **globales** (non scopées) : `users`, `plans`, `roles`, `permissions`,
`restaurants`. Toutes les autres portent `restaurant_id` et sont filtrées par le
`TenantScope`.

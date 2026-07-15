# Référence API — Ndaw-Resto (`/api/v1`)

Toutes les réponses sont en JSON. L'authentification utilise un **token Bearer**
(Sanctum) obtenu à l'inscription ou la connexion :

```
Authorization: Bearer <token>
```

Le Super Admin peut cibler un restaurant précis via l'en-tête
`X-Restaurant-Id: <id>` ; sans en-tête, il agit sur l'ensemble de la plateforme.

## Public (sans authentification)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/plans` | Liste des plans d'abonnement |
| GET | `/restaurants?q=&city=&per_page=` | Recherche de restaurants actifs |
| GET | `/restaurants/{slug}` | Fiche d'un restaurant |
| GET | `/restaurants/{slug}/menu` | Menu public groupé par catégorie |
| GET | `/restaurants/{slug}/reviews` | Avis approuvés |
| POST | `/restaurants/{slug}/reservations` | Réservation invité |
| GET | `/sites/{slug}` | **Site du restaurant** : payload agrégé (infos + branding + menu + avis + note) |
| GET | `/sites/resolve?domain=` | Résout un restaurant depuis un domaine perso / sous-domaine → `{ slug }` |

## Authentification

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Inscription propriétaire + création du restaurant |
| POST | `/auth/login` | Connexion (supporte `two_factor_code`) |
| GET | `/auth/me` | Profil + rôle + permissions + restaurants |
| POST | `/auth/logout` | Révoque le token courant |
| POST | `/auth/2fa/enable` | Génère secret TOTP + QR + codes de secours |
| POST | `/auth/2fa/confirm` | Active la 2FA après vérification d'un code |
| DELETE | `/auth/2fa` | Désactive la 2FA |

### Exemple — inscription

```http
POST /api/v1/auth/register
{
  "name": "Awa Diop",
  "email": "awa@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "restaurant_name": "Chez Awa",
  "plan": "pro"
}
```

## Espace restaurant (authentifié, scopé au tenant)

Chaque action est protégée par une permission RBAC.

| Ressource | Endpoints | Permission (view / manage) |
|-----------|-----------|-----------------------------|
| Dashboard | `GET /dashboard` | `dashboard.view` |
| Statistiques | `GET /stats/overview?from=&to=` | `stats.view` |
| Upload image | `POST /uploads` (multipart `file`, `type`=logo\|cover\|menu) | authentifié — Cloudinary si configuré, sinon disque local |
| Tables | `apiResource /tables` | `tables.view` / `tables.manage` |
| Catégories | `apiResource /categories` | `menu.view` / `menu.manage` |
| Menus | `/menus` (index, store, update, destroy) | `menu.view` / `menu.manage` |
| Plats | `apiResource /menu-items` | `menu.view` / `menu.manage` |
| Réservations | `apiResource /reservations` | `reservations.view` / `reservations.manage` |
| Commandes | `apiResource /orders` | `orders.view` / `orders.manage` / `orders.kitchen` |
| Clients (CRM) | `apiResource /customers` | `customers.view` / `customers.manage` |
| Employés | `/employees` (index, store, update, destroy) | `employees.view` / `employees.manage` |
| Coupons | `/coupons` (index, store, update, destroy) | `coupons.manage` |
| Avis | `/reviews` (index, update, destroy) | `reviews.manage` |

### Exemple — créer une commande

```http
POST /api/v1/orders
{
  "type": "dine_in",
  "table_id": 3,
  "tax_rate": 0.18,
  "items": [
    { "menu_item_id": 1, "quantity": 2 },
    { "menu_item_id": 4, "quantity": 1, "notes": "sans glace" }
  ]
}
```

Les totaux (`subtotal`, `tax`, `discount`, `total`) sont recalculés côté serveur
à partir des prix réels des plats et d'un éventuel coupon.

## Modules Restaurant OS (authentifié, gate `module:<clé>` + RBAC)

Chaque groupe n'est accessible que si le **plan** du restaurant inclut le module
(sinon `403`). Les modules actifs sont listés dans `GET /auth/me` et `GET /modules`.

### POS / caisse (`module:pos`)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/pos/sessions` | Historique des sessions de caisse |
| GET | `/pos/sessions/current` | Caisse actuellement ouverte |
| POST | `/pos/sessions` | Ouvrir la caisse (`opening_float`) |
| POST | `/pos/sessions/{id}/close` | Clôturer (`counted_amount`) + réconciliation |
| GET/POST | `/orders/{order}/payments` | Lister / enregistrer un paiement |
| GET | `/orders/{order}/ticket` | Ticket imprimable |

### Kitchen Display (`module:kitchen_display`)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/kitchen/queue` | File des commandes actives + résumé |
| PATCH | `/kitchen/items/{orderItem}` | Statut d'un plat (pending→preparing→ready→served) |
| POST | `/kitchen/orders/{order}/bump` | Faire avancer toute la commande |

### Stocks (`module:inventory`)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| `apiResource` | `/suppliers` | Fournisseurs |
| `apiResource` | `/ingredients` | Ingrédients |
| GET | `/ingredients/alerts` | Ingrédients sous le seuil de réappro |
| POST | `/ingredients/{id}/adjust` | Ajustement de stock (in/out/adjustment) |
| GET/POST | `/purchases` | Achats (avec lignes) |
| POST | `/purchases/{id}/receive` | Réception → entrée en stock |

### Comptabilité (`module:accounting`)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/accounting/summary` | Revenus − dépenses = bénéfice (par période) |
| `apiResource` | `/expenses` | Dépenses |

### Personnel (`module:staff`)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| `apiResource` | `/shifts` | Horaires / planning |
| GET | `/attendances` | Registre de présence |
| POST | `/attendances/clock-in` · `/clock-out` | Pointage entrée / sortie |

### Marketing (`module:marketing`)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| `apiResource` | `/campaigns` | Campagnes SMS/Email/WhatsApp/Push |
| GET | `/campaigns/{id}/audience` | Taille de l'audience ciblée |
| POST | `/campaigns/{id}/send` | Envoyer maintenant |

### Rapports (`module:reports`)

| Méthode | Endpoint |
|--------|----------|
| GET | `/reports/sales` · `/reports/reservations` · `/reports/popular-dishes` · `/reports/employees` |

### Paramètres / branding (`module:settings`)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/settings/branding` | Thème, couleurs, logo, domaine personnalisé |

## Super Admin (`/admin`, rôle `super_admin`)

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | KPI plateforme (MRR, comptes, abonnements) |
| GET/PUT/DELETE | `/admin/restaurants[/{slug}]` | Gestion des restaurants |
| GET/PUT | `/admin/subscriptions[/{id}]` | Gestion des abonnements |
| GET | `/admin/users[/{id}]` | Annuaire des utilisateurs |

## Conventions

- **Pagination** : `?per_page=` (défaut 12–20 selon la ressource). Réponses
  paginées au format Laravel (`data`, `links`, `meta`).
- **Erreurs** : `401` non authentifié, `403` permission manquante, `404`
  ressource hors tenant / introuvable, `422` validation (`{ message, errors }`).
- **Filtres** courants : `?status=`, `?q=` (recherche), `?date=`, `?upcoming=1`.

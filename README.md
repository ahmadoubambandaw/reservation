# Ndaw-Resto — SaaS de gestion de restaurants

> Plateforme SaaS multi-tenant permettant à n'importe quel restaurant de créer
> son espace de gestion après souscription à un abonnement.
> Développé par **Ndaw-Tech**.

Ce dépôt est un **monorepo** pensé pour être **modulaire et réutilisable** : la
même API sert le web (Next.js) et le futur mobile (Flutter), et le socle
multi-tenant + RBAC peut être réutilisé pour d'autres SaaS.

```
reservation/
├─ apps/
│  └─ api/            # API Laravel 12 (Sanctum, PostgreSQL, Redis)  ← livré
│  └─ web/            # Frontend Next.js 15 (à venir)
├─ docs/
│  ├─ ARCHITECTURE.md # Multi-tenant, RBAC, modularité
│  └─ API.md          # Référence des endpoints
└─ README.md
```

## État d'avancement

| Brique | Statut |
|--------|--------|
| **API — cœur multi-tenant** | ✅ Livré (ce commit) |
| Authentification (Sanctum, 2FA TOTP) | ✅ |
| RBAC (7 rôles, 21 permissions) | ✅ |
| Domaine complet (22 tables) | ✅ |
| Abonnements & plans (Free/Basic/Pro/Enterprise) | ✅ |
| Modules : Menu, Tables, Réservations, Commandes, CRM, Employés, Coupons, Avis | ✅ CRUD + RBAC |
| Dashboard & statistiques | ✅ |
| Espace Super Admin | ✅ |
| Tests (isolation tenant, RBAC, auth, réservations) | ✅ 16 tests verts |
| Intégrations paiement/SMS/maps (Stripe, Wave, Orange Money, Cloudinary) | 🔜 Câblage prévu (config prête) |
| Frontend Next.js | 🔜 |
| App mobile Flutter | 🔜 (consomme la même API) |

## Démarrage rapide (API)

Prérequis : PHP 8.3+, Composer, PostgreSQL, Redis.

```bash
cd apps/api
cp .env.example .env
composer install
php artisan key:generate

# Base de données (voir .env pour les identifiants)
createdb ndaw_resto
php artisan migrate --seed

php artisan serve   # http://localhost:8000
```

Comptes de démonstration (mot de passe : `password`) :

| Rôle | Email |
|------|-------|
| Super Admin | `admin@ndaw-resto.com` |
| Propriétaire | `owner@ledakar.com` |
| Manager | `manager@ledakar.com` |
| Serveur | `waiter@ledakar.com` |
| Cuisine | `kitchen@ledakar.com` |

Voir [`docs/API.md`](docs/API.md) pour la liste des endpoints et
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) pour le fonctionnement du
multi-tenant et du RBAC.

## Stack

- **Backend** : Laravel 12, Sanctum, PostgreSQL, Redis
- **Frontend** (à venir) : Next.js 15, TypeScript, Tailwind, shadcn/ui, Framer Motion
- **Stockage** : Cloudinary · **Paiement** : Stripe, Wave, Orange Money
- **Maps** : Google Maps · **Notifications** : Email, SMS, WhatsApp, Push

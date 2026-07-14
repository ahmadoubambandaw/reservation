# Ndaw-Resto — Restaurant OS (SaaS multi-tenant)

> Plateforme SaaS multi-tenant : un **Restaurant OS complet** (réservations,
> POS, cuisine, stocks, CRM, comptabilité, marketing, rapports, personnel)
> que chaque restaurant active après souscription à un abonnement.
> Développé par **Ndaw-Tech**.

Ce dépôt est un **monorepo** pensé pour être **modulaire et réutilisable** : la
même API sert le web (Next.js) et le futur mobile (Flutter), le socle
multi-tenant + RBAC peut être réutilisé pour d'autres SaaS, et **chaque module
s'active ou se désactive selon le plan d'abonnement du restaurant**.

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
| **API — cœur multi-tenant** (Laravel 13) | ✅ |
| Authentification (Sanctum, 2FA TOTP) | ✅ |
| RBAC (7 rôles, 30 permissions) | ✅ |
| Abonnements & plans (Free/Basic/Pro/Enterprise) | ✅ |
| **Système de modules activables par abonnement** | ✅ |
| Espace Super Admin + dashboard & statistiques | ✅ |

### Modules du Restaurant OS

| # | Module | Activation | Statut |
|---|--------|-----------|--------|
| — | Réservations, Menu, Tables | core (tous plans) | ✅ |
| 1 | **POS** (commandes, paiement, ticket, caisse) | Basic+ | ✅ |
| 2 | **Kitchen Display** (file cuisine, statuts par plat) | Basic+ | ✅ |
| 3 | **Stocks** (ingrédients, fournisseurs, achats, inventaire, alertes) | Pro+ | ✅ |
| 4 | **CRM** (historique, fidélité, coupons, anniversaires) | Basic+ | ✅ |
| 5 | **Comptabilité** (revenus, dépenses, bénéfices) | Enterprise | ✅ |
| 6 | **Marketing** (campagnes SMS/Email/WhatsApp, promotions) | Pro+ | ✅ |
| 7 | **Rapports** (ventes, réservations, plats, employés) | Pro+ | ✅ |
| 8 | **Personnel** (rôles, permissions, horaires, présence) | Pro+ | ✅ |
| 9 | **Paramètres** (thème, couleurs, logo, domaine perso) | Enterprise | ✅ |
| 10 | **API REST** (prête pour l'app mobile Flutter) | — | ✅ |

Envoi réel des campagnes/notifications (Twilio, FCM) et encaissement en ligne
(Stripe/Wave/Orange Money) : pilotes par driver déjà en place (driver `log`),
branchement des providers à venir — config prête dans `.env.example`.

| Suite | Statut |
|-------|--------|
| Tests (isolation, RBAC, gating modules, POS, stocks, compta, staff, marketing, KDS) | ✅ 26 tests verts |
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

- **Backend** : Laravel 13, Sanctum, PostgreSQL, Redis
- **Frontend** (à venir) : Next.js 15, TypeScript, Tailwind, shadcn/ui, Framer Motion
- **Stockage** : Cloudinary · **Paiement** : Stripe, Wave, Orange Money
- **Maps** : Google Maps · **Notifications** : Email, SMS, WhatsApp, Push

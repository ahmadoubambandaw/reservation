# Ndaw-Resto Web (Next.js 16)

Frontend du Restaurant OS Ndaw-Resto : site public + dashboard, consommant
l'API Laravel. Voir la doc d'ensemble à la racine : [`../../README.md`](../../README.md).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · next-themes (mode clair/sombre) · lucide-react.

## Démarrage

```bash
cp .env.example .env.local   # définit NEXT_PUBLIC_API_URL
npm install
npm run dev                  # http://localhost:3000
```

L'API Laravel doit tourner (voir `apps/api`). Par défaut le front pointe vers
`http://localhost:8000/api/v1`.

## Ce qui est inclus

- **Site public** : accueil premium (hero, modules, FAQ, CTA), tarifs (depuis
  `/plans`), annuaire des restaurants + recherche.
- **Site web par restaurant** (`/site/[slug]`) : mini-site autonome à la marque
  du restaurant (couleurs, logo, couverture) — hero, menu, horaires, carte,
  avis et réservation. Routage par hôte via `src/proxy.ts` : un domaine perso
  ou un sous-domaine sert directement le bon mini-site (`/sites/resolve`).
- **Authentification** : connexion (avec 2FA), inscription (crée le restaurant),
  session par token Sanctum persistée.
- **Dashboard** : shell responsive, **navigation adaptée aux modules actifs de
  l'abonnement** (via `/auth/me`), mode clair/sombre.
  - Vue d'ensemble (KPIs `/dashboard`), **Site web** (URL publique, QR code,
    domaine perso, aperçu live), Réservations (liste + création + statut),
    Menu (catégories + plats), Clients (CRM).
  - **POS** : ouverture/clôture de caisse, catalogue + panier, encaissement
    (espèces/Wave/Orange Money), commandes récentes et ticket imprimable.
  - **Rapports** : KPIs, graphique d'évolution du CA, plats populaires, ventes
    par type, performance des employés, période 7/30/90 jours.
  - **Écran cuisine (KDS)** : file temps réel (polling), statut par plat
    (en attente → préparation → prêt → servi), bump commande, alerte visuelle
    au-delà de 15 min.
  - **Stocks** : ingrédients (liste + ajout + ajustement entrée/sortie),
    alertes de réapprovisionnement, fournisseurs, achats (création multi-lignes
    + réception → entrée en stock).
  - **Comptabilité** : synthèse revenus/dépenses/bénéfice/marge, dépenses par
    catégorie, saisie et suppression de dépenses, période Ce mois/30j/90j.
  - **Marketing** : campagnes SMS/Email/WhatsApp/Push par audience
    (tous/fidèles/anniversaires), aperçu d'audience et envoi.
  - **Personnel** : planning (créneaux) + présence (pointage entrée/sortie).
  - **Paramètres** : thème, couleurs, **upload logo + couverture** (Cloudinary
    ou disque local), domaine personnalisé, aperçu live.
  - **Menu** : **upload de photos de plats**, affichées sur le mini-site.
  - Espace Super Admin (stats plateforme).

  Les 12 pages du dashboard sont connectées à l'API. Le compte de démo est en
  plan Enterprise pour exposer les 11 modules ; le gating par plan reste
  appliqué par l'API (middleware `module:*`) et couvert par les tests.

## Design system

`src/app/globals.css` définit les tokens (couleurs, rayons) pour les thèmes clair
et sombre. Primitives dans `src/components/ui` (Button, Card, Input, Badge,
Dialog, Toaster…). Client API typé dans `src/lib/api.ts`, contexte d'auth dans
`src/lib/auth.tsx`, catalogue des modules dans `src/lib/modules.tsx`.

## Scripts

```bash
npm run dev      # développement
npm run build    # build de production
npm run start    # serveur de production
npm run lint     # ESLint
```

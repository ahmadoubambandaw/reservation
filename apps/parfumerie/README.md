# Faty Store — Beauty & Co

Site e-commerce complet pour **Faty Store** : parfums, soins et accessoires.
Catalogue produits, panier, paiement en ligne via Stripe et back-office
d'administration (gestion des produits et du stock, suivi des commandes).

```
parfumerie/
├─ backend/   # API Node.js/Express + Postgres (Supabase) + Stripe — déployable sur Vercel
└─ frontend/  # Application React (Vite) — déployable sur Vercel
```

## Fonctionnalités

- **Catalogue public** : accueil avec sélection de produits mis en avant,
  catalogue filtrable par type (Parfums / Soins / Accessoires), par catégorie
  et par genre, fiche produit détaillée.
- **Panier** persistant (localStorage) avec gestion des quantités.
- **Paiement Stripe Checkout** : création d'une session de paiement, pages de
  confirmation (succès/annulation), décrémentation automatique du stock à la
  confirmation du paiement.
- **Back-office admin** avec un vrai compte (email + mot de passe) :
  - CRUD complet sur les produits (nom, marque, type, description, prix, stock, image…)
  - vue sur les commandes passées et leur statut
  - liste des inscrits à la newsletter
  - la cliente peut changer son mot de passe elle-même depuis l'onglet « Mon compte ».
- **Newsletter** : formulaire d'inscription fonctionnel (emails stockés en base).

## Base de données

Les données vivent dans le schéma Postgres `faty_store` (tables `products`,
`orders`, `order_items`, `admin_users`, `newsletter_subscribers`). Le backend
crée ce schéma et ses tables automatiquement au premier démarrage s'ils
n'existent pas encore, et pré-remplit le catalogue et le compte propriétaire
si les tables sont vides.

## Démarrage rapide (local)

### Backend

```bash
cd backend
cp .env.example .env   # renseigner DATABASE_URL, ADMIN_EMAIL/ADMIN_PASSWORD, JWT_SECRET et les clés Stripe
npm install
npm run dev             # http://localhost:4000
```

`DATABASE_URL` doit pointer vers une base Postgres (ex: un projet Supabase —
utiliser la chaîne « Transaction pooler », port 6543, depuis Database
Settings > Connection string).

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL doit pointer vers l'API backend
npm install
npm run dev             # http://localhost:5173
```

### Accès admin

Ouvrir `/admin`, puis se connecter avec l'email et le mot de passe définis
dans `backend/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). La cliente peut
ensuite changer son mot de passe elle-même depuis l'onglet « Mon compte ».

## Déploiement sur Vercel

Le backend est structuré pour tourner en fonction serverless Vercel
(`backend/api/index.js` exporte l'app Express, `backend/vercel.json` route
toutes les requêtes vers cette fonction). Frontend et backend se déploient
comme **deux projets Vercel distincts** (le frontend appelle le backend via
`VITE_API_URL`).

Variables d'environnement à renseigner dans les paramètres du projet Vercel
du **backend** (Project Settings > Environment Variables), puis redéployer :

- `DATABASE_URL` — chaîne de connexion Postgres (pooler Supabase, port 6543)
- `JWT_SECRET` — valeur aléatoire longue
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` — compte propriétaire initial
- `FRONTEND_URL` — URL du site déployé (pour les redirections Stripe et CORS)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — clés Stripe

Ces valeurs contiennent des secrets : à saisir directement dans le tableau de
bord Vercel, jamais commitées dans le dépôt.

## Coordonnées de la boutique

Les coordonnées affichées (adresse, WhatsApp, téléphone, réseaux sociaux)
sont codées dans `frontend/src/components/Footer.jsx` — à mettre à jour si
elles changent.

## Paiement Stripe

Le backend utilise l'API Stripe Checkout. En développement, utiliser une clé
secrète de test (`sk_test_...`) depuis le
[dashboard Stripe](https://dashboard.stripe.com/test/apikeys). Sans clé
valide, le tunnel de paiement renvoie une erreur explicite côté panier — le
reste du site (catalogue, panier, admin) fonctionne indépendamment de Stripe.

## Stack technique

- **Backend** : Node.js, Express, PostgreSQL (`pg`), Stripe SDK — déployé en
  fonction serverless Vercel
- **Frontend** : React 18, React Router, Vite

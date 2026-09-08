# Essence de Luxe — Boutique de parfumerie

Site e-commerce complet pour une boutique de parfumerie : catalogue produits,
panier, paiement en ligne via Stripe et back-office d'administration
(gestion des produits et du stock, suivi des commandes).

```
parfumerie/
├─ backend/   # API Node.js/Express + SQLite + Stripe
└─ frontend/  # Application React (Vite)
```

## Fonctionnalités

- **Catalogue public** : accueil avec sélection de parfums mis en avant,
  catalogue filtrable par famille olfactive et par genre, fiche produit détaillée.
- **Panier** persistant (localStorage) avec gestion des quantités.
- **Paiement Stripe Checkout** : création d'une session de paiement, pages de
  confirmation (succès/annulation), décrémentation automatique du stock à la
  confirmation du paiement.
- **Back-office admin** protégé par un jeton :
  - CRUD complet sur les produits (nom, marque, description, prix, stock, image…)
  - vue sur les commandes passées et leur statut.

## Démarrage rapide

### Backend

```bash
cd backend
cp .env.example .env   # renseigner ADMIN_TOKEN et les clés Stripe
npm install
npm run dev             # http://localhost:4000
```

La base SQLite (`data.sqlite`) est créée et pré-remplie automatiquement au
premier démarrage.

### Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL doit pointer vers l'API backend
npm install
npm run dev             # http://localhost:5173
```

### Accès admin

Ouvrir `/admin`, puis se connecter avec le jeton défini dans `ADMIN_TOKEN`
(fichier `backend/.env`).

## Paiement Stripe

Le backend utilise l'API Stripe Checkout. En développement, utiliser une clé
secrète de test (`sk_test_...`) depuis le
[dashboard Stripe](https://dashboard.stripe.com/test/apikeys). Sans clé
valide, le tunnel de paiement renvoie une erreur explicite côté panier — le
reste du site (catalogue, panier, admin) fonctionne indépendamment de Stripe.

## Stack technique

- **Backend** : Node.js, Express, better-sqlite3, Stripe SDK
- **Frontend** : React 18, React Router, Vite

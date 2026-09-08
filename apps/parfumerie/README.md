# Faty Store — Beauty & Co

Site e-commerce complet pour **Faty Store** : parfums, soins et accessoires.
Catalogue produits, panier, paiement en ligne via Stripe et back-office
d'administration (gestion des produits et du stock, suivi des commandes).

```
parfumerie/
├─ backend/   # API Node.js/Express + SQLite + Stripe
└─ frontend/  # Application React (Vite)
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
  - la cliente peut changer son mot de passe elle-même depuis l'onglet « Mon compte ».

## Démarrage rapide

### Backend

```bash
cd backend
cp .env.example .env   # renseigner ADMIN_EMAIL/ADMIN_PASSWORD, JWT_SECRET et les clés Stripe
npm install
npm run dev             # http://localhost:4000
```

La base SQLite (`data.sqlite`) est créée et pré-remplie automatiquement au
premier démarrage, avec un compte propriétaire créé à partir de
`ADMIN_EMAIL`/`ADMIN_PASSWORD` (uniquement s'il n'existe encore aucun compte).

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

- **Backend** : Node.js, Express, better-sqlite3, Stripe SDK
- **Frontend** : React 18, React Router, Vite

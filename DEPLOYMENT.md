# Déploiement de Ndaw-Resto

## ✅ Chemin retenu : tout sur Vercel + Supabase (schéma dédié)

Frontend **et** API sur Vercel ; base de données dans un **schéma isolé
`ndaw_resto`** d'un projet Supabase existant (non destructif). Aucun nouveau
compte/projet requis.

### A. API Laravel → Vercel (PHP serverless)

1. **vercel.com** → *Add New… Project* → importe `ahmadoubambandaw/reservation`.
2. **Root Directory** = `apps/api`. Vercel lit `apps/api/vercel.json`
   (runtime `vercel-php`).
3. **Environment Variables** (voir `apps/api/.env.production.example`) :
   - `APP_KEY` (fournie), `APP_ENV=production`, `APP_DEBUG=false`
   - `APP_URL=https://<ton-api>.vercel.app`
   - Supabase (Settings → Database → **Connection string / pooler**) :
     `DB_CONNECTION=pgsql`, `DB_HOST`, `DB_PORT=5432`, `DB_DATABASE=postgres`,
     `DB_USERNAME`, `DB_PASSWORD`, `DB_SSLMODE=require`, **`DB_SCHEMA=ndaw_resto`**
   - `CACHE_STORE=database`, `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`
   - `VIEW_COMPILED_PATH=/tmp`, `LOG_CHANNEL=stderr`
   - `SETUP_TOKEN=<chaîne-aléatoire-longue>`
   - (Optionnel) `CLOUDINARY_*` pour des uploads persistants.
4. Déploie. Vérifie `https://<ton-api>.vercel.app/up` → `200`.
5. **Provisionne la base une seule fois** (crée le schéma + migre + seed) :
   ```bash
   curl -X POST "https://<ton-api>.vercel.app/api/v1/system/setup?seed=1" \
     -H "X-Setup-Token: <ton-SETUP_TOKEN>"
   ```
   Réponse `{"ok":true,...}`. Ensuite, **retire `SETUP_TOKEN`** des variables
   pour désactiver l'endpoint, puis redéploie.

### B. Frontend Next.js → Vercel

1. *Add New Project* → même repo → **Root Directory** = `apps/web`.
2. Variables : `NEXT_PUBLIC_API_URL=https://<ton-api>.vercel.app/api/v1`,
   `NEXT_PUBLIC_APP_HOST=<ton-front>.vercel.app`. Déploie.

Comptes démo (mdp `password`) : `owner@ledakar.com` (Enterprise),
`admin@ndaw-resto.com` (super admin).

> ⚠️ Serverless PHP : cold starts possibles, et le disque est éphémère → les
> uploads d'images nécessitent des clés Cloudinary pour persister. Pour une
> prod à fort trafic, préfère l'option Railway ci-dessous.

---

## Alternative robuste : API sur Railway

Architecture recommandée si un plan Railway est disponible :

| Composant | Hébergeur | Pourquoi |
|-----------|-----------|----------|
| **Frontend** (`apps/web`, Next.js) | **Vercel** | Natif Next.js, déploiement depuis le repo GitHub |
| **API** (`apps/api`, Laravel) | **Railway** | PHP + PostgreSQL managé + Redis optionnel, migrations auto |
| **Base de données** | **Railway Postgres** (ou Supabase) | Managé, gratuit pour démarrer |
| **Images** | **Cloudinary** | Stockage persistant (le disque des hébergeurs est éphémère) |

> Les étapes ci-dessous se font dans les tableaux de bord Vercel/Railway
> (import du repo, variables d'environnement) — ce sont les seules actions qui
> demandent tes accès. Tout le code et les configs sont déjà prêts dans le repo.

---

## 1. API Laravel sur Railway

1. **railway.app** → *New Project* → *Deploy from GitHub repo* → choisis
   `ahmadoubambandaw/reservation`.
2. Dans le service créé → *Settings* → **Root Directory** = `apps/api`.
   (Nixpacks détecte PHP via `nixpacks.toml` et sert `public/`.)
3. Ajoute un **PostgreSQL** : *New* → *Database* → *Add PostgreSQL*. Railway
   injecte `DB_*` automatiquement — sinon copie l'URL dans les variables.
4. **Variables** (onglet *Variables*) — voir `apps/api/.env.production.example` :
   - `APP_KEY` : lance en local `php artisan key:generate --show` et colle la valeur.
   - `APP_ENV=production`, `APP_DEBUG=false`.
   - `APP_URL=https://<ton-api>.up.railway.app`
   - `CACHE_STORE=database`, `SESSION_DRIVER=database`, `QUEUE_CONNECTION=database`
   - `DB_CONNECTION=pgsql` (+ `DB_HOST/PORT/DATABASE/USERNAME/PASSWORD` de Railway)
   - (Optionnel) clés `CLOUDINARY_*` pour les uploads persistants.
5. **Migrations + données de démo** : *Settings* → **Pre-Deploy Command** =
   `php artisan migrate --force --seed`
   (au 1er déploiement ; ensuite tu peux enlever `--seed`).
6. Déploie. Vérifie `https://<ton-api>.up.railway.app/up` → `200`.

## 2. Frontend Next.js sur Vercel

1. **vercel.com** → *Add New… Project* → importe `ahmadoubambandaw/reservation`.
2. **Root Directory** = `apps/web` (Vercel détecte Next.js automatiquement).
3. **Environment Variables** — voir `apps/web/.env.production.example` :
   - `NEXT_PUBLIC_API_URL=https://<ton-api>.up.railway.app/api/v1`
   - `NEXT_PUBLIC_APP_HOST=<ton-domaine-web>` (ex. `ndaw-resto.vercel.app`)
4. Déploie. Ouvre l'URL Vercel → le site public, la connexion et le dashboard
   sont en ligne.

## 3. Boucler la boucle

- Reviens sur Railway et fixe `APP_FRONTEND_URL` / `FRONTEND_URL` /
  `SANCTUM_STATEFUL_DOMAINS` sur le domaine Vercel, puis redéploie l'API.
- Comptes de démo (mot de passe `password`) : `owner@ledakar.com` (propriétaire,
  plan Enterprise), `admin@ndaw-resto.com` (super admin).

## Domaines personnalisés des restaurants (écosystème)

Pour qu'un domaine perso (`ledakar.sn`) serve le mini-site :
1. Ajoute le domaine au projet **Vercel** (*Settings → Domains*).
2. Le client fait pointer un **CNAME** vers Vercel.
3. `proxy.ts` résout le domaine via l'API (`/sites/resolve`) et sert
   `/site/<slug>` automatiquement.

## Alternative : API en PHP serverless sur Vercel

Possible via le runtime communautaire `vercel-php` (un `vercel.json` +
`api/index.php`), avec Supabase pour Postgres. Moins robuste que Railway
(pas de Redis, disque éphémère, cold starts) — recommandé seulement pour une
démo. Railway reste conseillé pour un « bon fonctionnement ».

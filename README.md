## IoTactile Games

Plateforme de jeux en ligne (actuellement centrée sur un jeu de dés temps réel, avec d’autres jeux prévus à l’avenir), pensée pour être auto-hébergée facilement via Docker Compose (backend Fastify + frontend Next.js).

---

## Stack technique

- **Backend** : Fastify 5, TypeScript, JWT (access + refresh), cookies sécurisés, Zod, Prisma 7 + PostgreSQL, Redis.
- **Frontend** : Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4.
- **Architecture** : Clean Architecture + DDD (domain, application, adapters primaires/secondaires).

Les détails d’architecture sont décrits dans `.cursor/rules/architecture-projet.mdc`.

---

## Prérequis

- Docker + Docker Compose installés.
- Node.js ≥ 22 si tu veux lancer API/front en local sans Docker.
- Un fichier `.env` à la racine (voir `.env.example`).

---

## Lancer la stack complète avec Docker

1. **Créer le fichier d’environnement**

   ```bash
   cp .env.example .env
   ```

2. **Lancer en mode "prod" (API + front + Postgres)**

   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```

3. **Accéder à l’application**

- Frontend : `http://localhost:3001`
- API : `http://localhost:3000`

Pour plus de détails (déploiement sur VPS, tunnels, reverse proxy, Dokploy, etc.), voir `DEPLOY.md`.

---

## Lancer en mode développement (API + Postgres)

1. **Stack Docker dev**

   ```bash
   docker compose -f docker-compose.dev.yml up -d --build
   ```

2. **API seule (sans Docker)**

   ```bash
   cd api
   npm run dev
   ```

3. **Frontend seul (sans Docker)**

   ```bash
   cd app
   npm run dev
   ```

Puis ouvrir `http://localhost:3001` (si tu gardes le port Next.js par défaut, adapter l’URL).

---

## Scripts utiles

Dans `api/` :

- `npm run dev` : API Fastify avec rechargement.
- `npm run test` : tests unitaires / e2e (Vitest).
- `npm run lint` / `npm run format` : Biome.

Dans `app/` :

- `npm run dev` : Next.js en mode développement.
- `npm run lint` : ESLint.

---

## Tests

À chaque nouvelle fonctionnalité ou modification de logique métier :

- **Créer/mettre à jour** les tests correspondants (use cases, services, composants UI, routes).
- Ne pas considérer une tâche comme terminée tant que les tests ne sont pas à jour.

Les tests de l’API se trouvent dans `api/tests` (Vitest).

---

## Structure du projet (vue rapide)

- `api/` : API Fastify (domain, application, adapters, Prisma, tests).
- `app/` : Frontend Next.js (UI, pages/app router).
- `DEPLOY.md` : guide détaillé de déploiement (local, VPS, Dokploy, tunnels, etc.).
- `.cursor/rules/` : règles d’architecture et de tests pour le projet.

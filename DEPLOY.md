# Déploiement de la stack (API + base de données + frontend)

Ce projet peut être lancé entièrement avec Docker Compose : une **base PostgreSQL**, l’**API** (Fastify) et le **frontend** (Next.js) sont reliés par un réseau Docker et peuvent être déployés ensemble sur un serveur ou **sur ta machine**.

## Sur ma machine uniquement (PC allumé)

Tu peux tout faire tourner **sur ton PC** : l’appli ne fonctionne que lorsque ta machine est allumée et que Docker tourne. Dès que tu éteins le PC ou que tu fais `docker compose down`, tout s’arrête. Les données Postgres sont conservées dans un volume Docker tant que tu ne supprimes pas le volume.

- **Démarrer** : `docker compose up -d --build` (puis frontend sur http://localhost:3001, API sur http://localhost:3000).
- **Arrêter** : `docker compose down` (les conteneurs s’arrêtent ; au prochain `up`, tout repart).

Aucun serveur distant n’est nécessaire pour développer ou tester en local.

## Jouer en ligne avec ton domaine (ex. games2.iotactile.com)

Tu peux faire tourner la stack **sur ton PC** et que tes amis accèdent via **games2.iotactile.com** (ou un autre domaine que tu possèdes). Il faut que ce domaine pointe vers ta machine et que l’accès se fasse en **HTTPS** (recommandé pour les cookies et WebSockets).

### Option 1 : Tunnel (recommandé, pas de port forwarding)

Un **tunnel** expose ton PC sur internet via une URL, sans ouvrir les ports de ta box.

- **Cloudflare Tunnel** (gratuit) : tu installes `cloudflared` sur ton PC, tu connectes ton domaine (ex. `games2.iotactile.com`) à Cloudflare, et le tunnel envoie le trafic vers `localhost:3001` (frontend) et par ex. un sous-domaine ou un chemin pour l’API (`api.games2.iotactile.com` → `localhost:3000`). HTTPS est géré par Cloudflare.
- **ngrok** (gratuit avec limite) : donne une URL du type `xxx.ngrok.io` ; en version payante tu peux utiliser ton propre domaine.

Une fois le tunnel en place, dans ton `.env` à la racine :

- `BASE_URL_APP=https://games2.iotactile.com`
- `BASE_URL_API=https://api.games2.iotactile.com` (ou l’URL réelle de l’API fournie par le tunnel)
- `NEXT_PUBLIC_API_URL=https://api.games2.iotactile.com` (même URL que l’API côté navigateur)

Puis **reconstruire le frontend** (car `NEXT_PUBLIC_*` est fixé au build) :

```bash
docker compose build --no-cache app && docker compose up -d
```

Tes amis pourront aller sur **https://games2.iotactile.com** pour jouer, tant que ton PC est allumé et que le tunnel + Docker tournent.

### Option 2 : Port forwarding + reverse proxy sur ton PC

1. **DNS** : faire pointer `games2.iotactile.com` (et éventuellement `api.games2.iotactile.com`) vers l’**IP publique** de ta box.
2. **Box** : rediriger les ports 80 et 443 vers ton PC (port forwarding).
3. **Sur ton PC** : installer un reverse proxy (ex. **Caddy**) qui écoute sur 80/443, obtient un certificat HTTPS (Let’s Encrypt) pour `games2.iotactile.com`, et envoie le trafic vers `localhost:3001` (frontend) et `localhost:3000` (API). Ensuite, dans `.env` tu mets les mêmes `BASE_URL_*` et `NEXT_PUBLIC_API_URL` qu’au-dessus, tu reconstruis l’image `app`, et tu relances la stack.

Dans les deux cas, l’appli ne fonctionne que lorsque ton PC est allumé ; le domaine permet simplement d’y accéder en ligne avec une URL propre pour jouer avec tes amis.

## Prérequis

- Docker et Docker Compose
- Fichier `.env` à la racine (voir section suivante)

## Lancer la stack en local

1. **Créer le fichier d’environnement**

   ```bash
   cp .env.example .env
   ```

   En local, les valeurs par défaut suffisent ; en production, modifier au moins `POSTGRES_PASSWORD`, `COOKIE_SECRET` et `JWT_SECRET`.

2. **Construire et démarrer les services**

   ```bash
   docker compose up -d --build
   ```

3. **Accès**
   - **Frontend** : http://localhost:3001
   - **API** : http://localhost:3000

Les trois services (postgres, api, app) sont sur le réseau `app-network` et communiquent par leurs noms de service (`postgres`, `api`, `app`).

## Déployer sur un serveur

1. **Cloner le dépôt sur le serveur** (ou déployer les fichiers du repo).

2. **Créer et éditer `.env`** à la racine :
   - `POSTGRES_PASSWORD`, `COOKIE_SECRET`, `JWT_SECRET` : valeurs fortes et uniques.
   - `BASE_URL_API` et `BASE_URL_APP` : URLs **publiques** du serveur (ex. `https://api.mondomaine.com`, `https://app.mondomaine.com`) pour CORS et cookies.
   - `NEXT_PUBLIC_API_URL` : URL publique de l’API **telle que le navigateur l’appelle** (ex. `https://api.mondomaine.com`).  
     Cette variable est injectée au **build** du frontend, donc il faut **reconstruire** l’image après modification :
     ```bash
     docker compose build --no-cache app && docker compose up -d
     ```

3. **Lancer la stack**

   ```bash
   docker compose up -d --build
   ```

4. **Exposer les ports** (si pas de reverse proxy) : le serveur doit exposer `3000` (API) et `3001` (frontend). En production, il est préférable de mettre un **reverse proxy** (Nginx, Caddy, Traefik) devant pour HTTPS et éventuellement un seul domaine avec chemins ou sous-domaines.

### Exemple avec reverse proxy (Nginx)

- `https://mondomaine.com` → frontend (proxy vers `app:3000`)
- `https://mondomaine.com/api` ou `https://api.mondomaine.com` → API (proxy vers `api:3000`)

Dans ce cas, définir dans `.env` :

- `BASE_URL_APP=https://mondomaine.com`
- `BASE_URL_API=https://api.mondomaine.com` (ou `https://mondomaine.com/api`)
- `NEXT_PUBLIC_API_URL=https://api.mondomaine.com` (ou l’URL réelle de l’API côté navigateur)

Puis reconstruire le frontend et redémarrer.

## Déployer avec Dokploy sur un VPS (HTTPS géré automatiquement)

[Dokploy](https://dokploy.com) est une plateforme auto-hébergée (tu l’installes sur ton VPS) qui gère les déploiements Docker, les domaines et **le HTTPS via Let’s Encrypt (Traefik)**. Plus besoin de configurer Nginx ou Caddy à la main.

### Prérequis

- Un VPS avec Docker (2 Go RAM, 30 Go disque, ports 80 et 443 libres).
- Dokploy installé sur le VPS : `curl -sSL https://dokploy.com/install.sh | sh` (voir [docs](https://docs.dokploy.com/docs/core/installation)).
- Ton dépôt Git (GitHub, GitLab, Gitea, etc.) accessible depuis Dokploy.

### Étapes

1. **Créer un projet Docker Compose dans Dokploy**  
   Nouveau projet → type **Docker Compose** → connecter le dépôt (Git).

2. **Compose Path**  
   Indiquer le fichier dédié : **`./docker-compose.dokploy.yml`**.

3. **Variables d’environnement** (dans l’interface Dokploy ou un `.env`)  
   À définir au minimum :
   - `APP_DOMAIN` : domaine du frontend (ex. `games2.iotactile.com`)
   - `API_DOMAIN` : domaine de l’API (ex. `api.games2.iotactile.com`)
   - `POSTGRES_PASSWORD`, `COOKIE_SECRET`, `JWT_SECRET` : secrets
   - `BASE_URL_APP` : `https://games2.iotactile.com`
   - `BASE_URL_API` : `https://api.games2.iotactile.com`
   - `NEXT_PUBLIC_API_URL` : `https://api.games2.iotactile.com` (utilisé au **build** du frontend)

4. **DNS**  
   Faire pointer les enregistrements **A** de `games2.iotactile.com` et `api.games2.iotactile.com` vers l’**IP publique** du VPS.

5. **Déployer**  
   Lancer le déploiement. Traefik (inclus avec Dokploy) génère les certificats HTTPS automatiquement (quelques secondes après le premier déploiement).

Le fichier **`docker-compose.dokploy.yml`** attache les services `api` et `app` au réseau **`dokploy-network`** et ajoute les **labels Traefik** pour le routage et le TLS. La base Postgres reste interne (non exposée). Si tu préfères configurer les domaines sans toucher au compose, tu peux utiliser l’onglet **Domains** de Dokploy à la place des labels (voir [Domains](https://docs.dokploy.com/docs/core/domains)).

## Free tier VPS et hébergement pour une stack légère

Tu peux faire tourner ta stack (Postgres + API + front) sur un **VPS gratuit** ou un **hébergement app gratuit**. Voici des options réalistes pour une stack légère.

### VPS « toujours gratuit » (tu installes Docker et tu lances `docker compose`)

| Fournisseur | Offre | Ressources | Notes |
|-------------|--------|------------|--------|
| **Oracle Cloud** | Always Free | 4 cœurs ARM + 24 Go RAM (ou 2× AMD 1 Go) + 200 Go stockage | Le plus généreux. Idéal pour Docker. Inscription + carte (pas de prélèvement si tu restes dans les limites). |
| **Google Cloud** | Always Free | 1× e2-micro (0,25 vCPU, 1 Go RAM) dans 3 régions US | Très juste pour Postgres + API + front ; possible avec swap et images légères. |
| **AWS** | Free Tier 12 mois | 1× t2.micro / t3.micro (1 vCPU, 1 Go RAM) | Suffisant pour une stack légère ; après 12 mois, petit coût si tu gardes la VM. |

Sur un VPS : installer Docker + Docker Compose, cloner le repo, configurer `.env` (URLs publiques, secrets), lancer `docker compose up -d --build`. Optionnel : Nginx ou Caddy devant pour HTTPS (Let’s Encrypt).

### PaaS / app hosting (sans gérer une VM)

Pas de VPS, mais des free tiers pour faire tourner **API + BDD** (et parfois front) sans Docker sur une machine dédiée :

| Service | Free tier | Adapté à |
|---------|-----------|-----------|
| **Railway** | 500 Mo RAM, 5 Go stockage, crédit mensuel | API + Postgres (ou BDD managée) ; déploiement depuis le repo. |
| **Render** | 750 h/mois (1 instance toujours on), Postgres managé possible | API + front (build Docker ou natif) + BDD. |
| **Fly.io** | Essai limité (heures / jours), puis payant | Containers légers, plusieurs régions. |

Pour une **stack légère** : le plus simple est souvent **Oracle Cloud** (VPS gratuit) avec Docker, ou **Render** (1 service API + 1 front + Postgres managé gratuit) si tu préfères ne pas administrer une VM.

## Commandes utiles

| Commande                       | Description                                            |
| ------------------------------ | ------------------------------------------------------ |
| `docker compose up -d --build` | Construire et lancer en arrière-plan                   |
| `docker compose down`          | Arrêter et supprimer les conteneurs                    |
| `docker compose down -v`       | Idem + supprimer le volume Postgres (données effacées) |
| `docker compose logs -f api`   | Voir les logs de l’API                                 |
| `docker compose logs -f app`   | Voir les logs du frontend                              |

## Résumé du pipeline

- **Réseau** : `app-network` (bridge) relie `postgres`, `api` et `app`.
- **postgres** : image `postgres:18`, volume persistant `postgres_data`, healthcheck avant démarrage de l’API.
- **api** : build depuis `api/Dockerfile`, migrations Prisma au démarrage, écoute sur le port 3000.
- **app** : build depuis `app/Dockerfile` avec `NEXT_PUBLIC_API_URL` au build, écoute sur le port 3000 (mappé en 3001 sur l’hôte).

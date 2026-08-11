# Déployer l'API Passerelle (gratuit)

Le serveur utilise maintenant Postgres (voir `prisma/schema.prisma`) au lieu de SQLite — un vrai `DATABASE_URL` Postgres est donc nécessaire, en local comme en prod.

## En local (dev)

Il faut un Postgres qui tourne quelque part. Le plus simple avec `psql` déjà installé :

```bash
sudo -u postgres psql -c "CREATE ROLE passerelle WITH LOGIN PASSWORD 'passerelle' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE passerelle_dev OWNER passerelle;"
```

`.env` pointe déjà sur `postgresql://passerelle:passerelle@localhost:5432/passerelle_dev`. Puis :

```bash
npm run prisma:migrate   # applique prisma/migrations/ à passerelle_dev
npm run dev
```

Les tests (`npm test`) utilisent une base séparée `passerelle_test` (voir `tests/testDbUrl.ts`) qu'ils réinitialisent à chaque run — créer cette base une fois de la même façon (`CREATE DATABASE passerelle_test OWNER passerelle;`).

## En production (Render + Neon, gratuit, sans carte bancaire)

**1. Base de données — [neon.tech](https://neon.tech)**
Créer un compte, un projet, copier la connection string Postgres fournie (garder le `?sslmode=require` si présent).

**2. API — [render.com](https://render.com)**
- New → Web Service → connecter le repo, root directory `app/server`.
- Build command : `npm install && npm run build`
- Start command : `npm start` (lance `prisma migrate deploy` puis le serveur — les migrations en attente sont appliquées à chaque déploiement, voir `package.json`)
- Variables d'environnement à définir dans le dashboard Render :

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | la connection string Neon |
| `JWT_ACCESS_SECRET` | générée avec `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | générée avec `openssl rand -hex 32` (différente de la précédente) |
| `APP_DEEP_LINK` | `passerelle://calendar-connected` |
| `GOOGLE_REDIRECT_URI` | `https://<ton-service>.onrender.com/calendar/google/callback` (optionnel — laisser vide désactive proprement la sync Google, voir `src/routes/calendar.ts`) |
| `MICROSOFT_REDIRECT_URI` | `https://<ton-service>.onrender.com/calendar/microsoft/callback` (optionnel, idem pour Outlook) |

Ne pas laisser `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` vides : `src/env.ts` retombe sinon sur des valeurs de dev codées en dur.

**3. Vérifier**

```bash
curl https://<ton-service>.onrender.com/health   # -> {"ok":true}
```

Le plan gratuit Render met le service en veille après une période d'inactivité — le premier appel après une pause prend ~30-50s le temps qu'il redémarre, c'est normal.

## Côté app mobile

Voir `app/mobile/.env.local` (à créer, ignoré par git) : `EXPO_PUBLIC_API_URL=https://<ton-service>.onrender.com`.

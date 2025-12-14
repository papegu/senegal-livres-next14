# Vercel Environment Setup (Production)

## Variables à configurer

- `DATABASE_URL`: URL Supabase pooler (port 6543) avec `?pgbouncer=true&sslmode=require`
- `DIRECT_URL`: URL Supabase direct (port 5432) avec `?sslmode=require`
- `JWT_SECRET`: chaîne aléatoire forte (≥ 32 caractères)
- `NEXT_PUBLIC_BASE_URL`: `https://senegal-livres.sn`
- `STRIPE_SECRET_KEY`: si paiements Stripe activés
- `PAYDUNYA_*`: si flux PayDunya activés

## Domaine & DNS
- Ajouter les domaines dans Vercel → Project → Settings → Domains:
	- `senegal-livres.sn` (doit être “Active”)
	- `www.senegal-livres.sn` (CNAME vers `cname.vercel-dns.com`) pour une redirection propre vers l’apex.
- Notre `middleware.ts` redirige `www` → apex sans forcer HTTPS (évite les boucles).

## Cookies & Runtime
- Cookies en Production: `httpOnly`, `Secure`, `SameSite=Lax`, `Domain` dérivé dynamiquement du `Host` (gère apex et www).
- Toutes les routes API App Router exportent `runtime = "nodejs"`.

## Build & déploiement
- Prisma client est généré via `postinstall` (`prisma generate`).
- Ne pas exécuter `prisma db push` sur Vercel; le schéma est géré dans Supabase via SQL (`supabase_init.sql`).
- Commandes par défaut: `npm install`, `npm run build`.

## Vérifications après déploiement
- Santé: `GET /api/health` → `{ ok: true, db: "connected", missingEnv: [] }`
- Login: `POST /api/auth` avec `{ action, email, password }` → 200 + `Set-Cookie: auth_token`
- Auth: `GET /api/auth/me` → 200 si connecté
- Panier: `GET /api/cart` → 200 si connecté

## Dépannage rapide
- 401 sur `/api/auth/me` ou `/api/cart`:
	- Assurez-vous d’utiliser le même domaine et que les appels client incluent `credentials: 'include'`.
	- Vérifiez que le cookie `auth_token` existe (Secure, Lax, bon domain).
- 500 sur `/api/auth`:
	- `JWT_SECRET` manquant ou faible, ou URLs DB incorrectes.
	- Consultez `/api/health` pour `missingEnv` et `details`.
- `/api/health` inaccessible:
	- Projet non déployé ou environnement non configuré; corriger les envs et redéployer.

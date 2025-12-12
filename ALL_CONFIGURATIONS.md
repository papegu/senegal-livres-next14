# 📋 TOUTES LES CONFIGURATIONS - Résumé Complet

## Guide des toutes les variables et configurations requises

---

## 🔧 VERCEL ENVIRONMENT VARIABLES (Obligatoires)

Ces variables doivent être ajoutées dans: **Vercel Dashboard > Settings > Environment Variables**

### 1. Database Configuration

```env
# Obtenue depuis Planetscale Dashboard > Connect > Node.js
DATABASE_URL=mysql://[user]:[password]@[host]/senegal_livres?sslaccept=strict
```

Exemple:
```env
DATABASE_URL=mysql://hzxp1mye:pscale_pw_xxxxxxxx@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict
```

### 2. Next.js Configuration

```env
# Production = true
NODE_ENV=production

# Votre domaine
NEXT_PUBLIC_BASE_URL=https://senegal-livres.sn

# Dans dev: NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. PayDunya Configuration (Paiements)

```env
# Clés PayDunya (obtenées du dashboard PayDunya)
NEXT_PUBLIC_PAYDUNYA_SANDBOX_API_KEY=your_sandbox_api_key
NEXT_PUBLIC_PAYDUNYA_PRODUCTION_API_KEY=your_production_api_key
PAYDUNYA_PRIVATE_API_KEY=your_private_api_key

# URL où PayDunya envoie les confirmations
PAYDUNYA_CALLBACK_URL=https://senegal-livres.sn/api/paydunya/callback

# En production: false. En dev: true
PAYDUNYA_USE_MOCK=false
```

### 4. Authentication (Sécurité)

```env
# Clé secrète JWT (generate: https://generate-secret.vercel.app/32)
# MINIMUM 32 caractères, doit être UNIQUE et FORT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_chars_here_xyz123abc

# Token admin pour accès admin panel
ADMIN_TOKEN=your_admin_token_here_strong_unique
```

---

## 🗄️ PLANETSCALE DATABASE CONFIGURATION

### Connection String

```
Format: mysql://[username]:[password]@[host]/[database]?sslaccept=strict

Exemple:
mysql://hzxp1mye:pscale_pw_xxxxxxxx@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict
```

### Créer l'Admin User (via SQL Editor)

```sql
-- Dans Planetscale Dashboard > senegal_livres > SQL Editor

CREATE USER 'papeabdoulaye'@'%' IDENTIFIED BY 'pape1982';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'%';
FLUSH PRIVILEGES;

-- Vérifier:
SELECT user, host FROM mysql.user WHERE user='papeabdoulaye';
```

### Importer le Schéma

```sql
-- Copy-paste tout le contenu de: prisma/mysql-init.sql
-- Dans: SQL Editor
-- Click: Execute

-- Résultat: 7 tables créées
-- ✓ User
-- ✓ Book
-- ✓ Transaction
-- ✓ Purchase
-- ✓ CartItem
-- ✓ Submission
-- ✓ AdminStats
```

---

## 🔐 PAYDUNYA CONFIGURATION

### Obtenir les API Keys

```
1. Aller sur: https://www.paydunya.com/dashboard
2. Settings > API Keys (ou Développeur)
3. Copier:
   - Sandbox API Key
   - Production API Key (après KYC validation)
   - Private API Key

Attention:
- Production keys activés seulement après KYC
- En attente: utilisez Sandbox keys
- Ne JAMAIS partager private key
```

### Configurer le Webhook

```
Dans PayDunya Dashboard:

1. Settings > Webhooks
2. Add New Webhook
3. URL: https://senegal-livres.sn/api/paydunya/callback
4. Method: POST
5. Events à activer:
   ✓ payment.success
   ✓ payment.failed
   ✓ payment.cancelled
6. Save

Vérification:
- PayDunya envoie des test webhooks
- Vérifier dans Vercel Logs que la requête est reçue
- Status 200 OK confirmé
```

---

## 🌐 GITHUB CONFIGURATION

### Repository Settings

```
Repository Name: senegal-livres
Repository URL: https://github.com/YOUR_USERNAME/senegal-livres
Visibility: Public (pour que Vercel puisse accéder)
Branch: main (par défaut)
```

### .gitignore (Déjà configuré ✅)

```
Les fichiers JAMAIS à committer:
- .env.local (secrets!)
- node_modules/ (trop large)
- .next/ (build output)
- /coverage (test output)
- *.log (log files)
- .DS_Store (Mac files)
```

---

## 🔗 VERCEL DOMAIN CONFIGURATION

### Configuration DNS

```
Dans Vercel Dashboard:

1. Settings > Domains
2. Add Domain: senegal-livres.sn
3. Vercel vous donne les nameservers:
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com

Chez votre registrar (GoDaddy, Namecheap, etc.):

1. Domaines > senegal-livres.sn > DNS Settings
2. Remplacer les nameservers existants
3. Ajouter les nameservers de Vercel
4. Sauvegarder

Temps: 24-48 heures pour propagation
Vérifier: https://mxtoolbox.com/
```

### SSL Certificate (Automatique)

```
✅ Vercel fournit SSL gratuitement
✅ Certificate auto-renew (avant expiration)
✅ HTTPS forcé automatiquement
✅ A+ rating sur SSL Labs
```

---

## 🛠️ .ENV.LOCAL (Local Development)

**Fichier: `.env.local` - JAMAIS à committer**

```env
# Database (localhost MySQL)
DATABASE_URL=mysql://root:password@localhost:3306/senegal_livres

# Next.js
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# PayDunya (Sandbox pour dev)
NEXT_PUBLIC_PAYDUNYA_SANDBOX_API_KEY=your_sandbox_key
NEXT_PUBLIC_PAYDUNYA_PRODUCTION_API_KEY=your_production_key
PAYDUNYA_PRIVATE_API_KEY=your_private_key
PAYDUNYA_CALLBACK_URL=http://localhost:3000/api/paydunya/callback
PAYDUNYA_USE_MOCK=true  # ← true pour dev (mock responses)

# Authentication
JWT_SECRET=dev-secret-key-do-not-use-in-production
ADMIN_TOKEN=dev-admin-token
```

---

## 📊 PRISMA CONFIGURATION

### Fichier: `prisma/schema.prisma`

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  // ... fields
}

// 6 autres modèles...
```

### Migration (Setup Initial)

```bash
# Créer tables depuis le schéma
npx prisma db push

# Ou manuellement via Planetscale SQL Editor
# Copy-paste: prisma/mysql-init.sql
```

---

## 🐚 MYSQL LOCAL SETUP (Development)

### Installer MySQL (WAMP)

```
Déjà à: c:\wamp64\bin\mysql\mysql8.0.39
```

### Créer Database Localement

```bash
# Dans WAMP MySQL console:
mysql -u root -p

# Dans MySQL:
CREATE DATABASE senegal_livres;
USE senegal_livres;
source prisma/mysql-init.sql;
```

### User Admin Local

```sql
CREATE USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'localhost';
FLUSH PRIVILEGES;
```

---

## 🔄 GIT WORKFLOW

### Configuration Initiale

```bash
git config --global user.name "Serigne Babacar Gueye"
git config --global user.email "papeabdoulaye.gueye@uadb.edu.sn"
```

### Commandes Essentielles

```bash
# Voir les changements
git status

# Ajouter les modifications
git add .

# Créer un commit
git commit -m "Feature: description du changement"

# Envoyer sur GitHub
git push origin main

# Pull depuis GitHub
git pull origin main

# Voir l'historique
git log

# Créer une branche
git checkout -b feature/nom-feature

# Retourner à main
git checkout main

# Merger une branche
git merge feature/nom-feature
```

---

## 🔨 COMMANDES NPM

### Démarrage

```bash
# Installer les dépendances
npm install

# Développement (hot reload)
npm run dev

# Build pour production
npm run build

# Lancer la version buildée
npm start

# Linter (ESLint)
npm run lint

# Formater le code (Prettier)
npm run format
```

---

## 📝 FICHIERS DE CONFIGURATION

### `next.config.mjs`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration Next.js
  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node"
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

---

## 🔌 API ENDPOINTS

### PayDunya

```
POST /api/paydunya/create-invoice
- Input: {amount, description, bookIds}
- Output: {invoiceUrl}

POST /api/paydunya/callback
- Reçoit: webhook de PayDunya
- Traite: paiement confirmé, envoie PDF/ETA

GET /api/paydunya/check-payment/:reference
- Vérifie le status d'un paiement
```

### PDF Download

```
GET /api/pdfs/download?bookId=XXX
- Télécharge le PDF du livre
- Nécessite: authentification utilisateur
- Vérifie: l'utilisateur a acheté le livre
```

### ETA Calculation

```
GET|POST /api/eta
- Input: {lat, lon}
- Output: {ok, distKm, etaMinutes}
- Calcule: distance + ETA depuis Dakar
```

### Admin

```
GET /api/admin/database
- Retourne: statistiques database
- Nécessite: JWT auth + role=admin

POST /api/admin/database
- Crée/modifie des données
- Nécessite: JWT auth + role=admin
```

---

## 🔑 API KEYS & SECRETS

### Où les obtenir:

| Service | Clé | Où | Notes |
|---------|-----|---|--------|
| PayDunya | Sandbox Key | https://paydunya.com/dashboard | Pour tester |
| PayDunya | Production Key | https://paydunya.com/dashboard | Après KYC |
| PayDunya | Private Key | https://paydunya.com/dashboard | Ne JAMAIS partager |
| JWT Secret | Generate | https://generate-secret.vercel.app/32 | 32+ chars |
| Admin Token | Generate | UUID ou openssl | Unique |

### Où les stocker:

```
Local (.env.local):
- Ne jamais committer ✅

Vercel Environment Variables:
- Settings > Environment Variables
- Visibles seulement dans builds

Production database:
- Ne JAMAIS stocker dans code
- Toujours via environment variables
```

---

## ✅ CHECKLIST FINAL

```
Database:
- [ ] DATABASE_URL correct (Planetscale)
- [ ] Admin user créé (papeabdoulaye)
- [ ] Schéma importé (7 tables)
- [ ] Backups activés

PayDunya:
- [ ] Sandbox keys configurées (dev)
- [ ] Production keys configurées (prod)
- [ ] Webhook URL configurée
- [ ] Callback URL correcte

Vercel:
- [ ] All environment variables ajoutées
- [ ] Domain configuré
- [ ] SSL certificate actif
- [ ] Build réussi

GitHub:
- [ ] Code poussé
- [ ] .gitignore protège secrets
- [ ] main branch prête

Local:
- [ ] .env.local créé
- [ ] npm install réussi
- [ ] npm run dev fonctionne
- [ ] npm run build réussi
```

---

## 🎯 RÉSUMÉ DES CONFIGURATIONS

```
Le flux complet:

1. Développement local
   .env.local (local MySQL, sandbox PayDunya)
   npm run dev

2. Push sur GitHub
   git push origin main

3. Vercel redéploie
   Utilise: Vercel Environment Variables
   DATABASE_URL: Planetscale (production)
   PayDunya: Production keys
   Domain: senegal-livres.sn

4. Production live
   https://senegal-livres.sn avec vraies données ✅
```

---

**Tous les configs sont dans ce fichier pour référence rapide.**

Pour les instructions complètes: **DEPLOYER_SENEGAL_LIVRES.md**


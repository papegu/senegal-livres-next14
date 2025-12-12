# 🚀 GUIDE INSTALLATION RAPIDE - Prisma MySQL Migration

## ✅ Qu'est-ce qui a été fait?

Votre application Next.js 14 a été entièrement migrée de JSON local vers **MySQL avec Prisma ORM**.

### 📊 Modèles créés (7 tables):
1. **User** - Utilisateurs
2. **Book** - Catalogue de livres
3. **Transaction** - Paiements (PayDunya, Stripe, Wave, Orange, Ecobank)
4. **Purchase** - Achats de livres
5. **CartItem** - Panier
6. **Submission** - Soumissions d'auteurs
7. **AdminStats** - Statistiques

### 🔧 Routes API créées:
- `GET/POST/PUT/DELETE /api/users` - Gestion utilisateurs
- `GET/POST/PUT/DELETE /api/users/[id]` - User par ID
- `GET/POST/PUT/DELETE /api/books` - Gestion livres
- `GET/POST/PUT /api/transactions` - Paiements
- `GET/POST/PUT/DELETE /api/purchases` - Achats
- `GET/POST/PUT/DELETE /api/admin/submissions` - Soumissions

---

## 🎯 Installation (3 étapes)

### **Étape 1: Créer la base de données MySQL**

Ouvrir terminal MySQL:
```bash
mysql -u root -p
```

Exécuter:
```sql
CREATE DATABASE senegal_livres;
EXIT;
```

### **Étape 2: Configurer .env.local**

Créer fichier `.env.local` (ou modifier s'il existe):

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/senegal_livres"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
JWT_SECRET="dev_secret_change_me"
ADMIN_TOKEN="dev_admin_token"
PAYDUNYA_USE_MOCK="true"
```

**Remplacer `YOUR_PASSWORD` par votre mot de passe MySQL root.**

### **Étape 3: Générer le Prisma Client et créer les tables**

Dans PowerShell, à la racine du projet:

```bash
# Générer le client Prisma
npx prisma generate

# Créer les migrations et les tables
npx prisma migrate dev --name init
```

Le système va:
- ✅ Créer tous les fichiers de migration
- ✅ Créer les 7 tables dans MySQL
- ✅ Générer le Prisma Client

**Attendre 1-2 minutes** que les migrations s'exécutent.

---

## 📥 Optionnel: Migrer les données JSON existantes

Si vous avez un fichier `data/market.json` avec des données:

```bash
npx ts-node scripts/migrate-json-to-db.ts
```

Ce script va:
- Lire `data/market.json`
- Migrer tous les users, books, transactions, etc. vers MySQL
- Afficher un rapport final

---

## ✅ Vérifier que tout fonctionne

### 1. Démarrer le serveur
```bash
npm run dev
```

### 2. Tester un endpoint

Ouvrir PowerShell et exécuter:

```bash
# Créer un utilisateur
$body = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/users" `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -UseBasicParsing
```

Vous devez recevoir une réponse avec le nouvel utilisateur créé ✅

### 3. Vérifier la base de données

```bash
mysql -u root -p senegal_livres -e "SHOW TABLES;"
```

Vous devez voir les 7 tables:
- users
- books
- transactions
- purchases
- cartitems
- submissions
- adminstats

---

## 🌐 Déployer en Production (Vercel + PlanetScale)

### 1. Créer une base PlanetScale

1. Aller sur: https://planetscale.com
2. S'inscrire avec GitHub
3. Créer une base de données (gratuit)

### 2. Récupérer la chaîne de connexion

1. Dashboard → Votre base
2. Cliquer: **Connect**
3. Copier la chaîne pour Prisma: `mysql://...`

### 3. Ajouter à Vercel

1. Vercel Dashboard → Votre projet
2. Settings → Environment Variables
3. Ajouter:
   - **Name:** `DATABASE_URL`
   - **Value:** (la chaîne PlanetScale)
   - **Environments:** Production

4. Ajouter aussi les autres variables:
   - `JWT_SECRET`
   - `ADMIN_TOKEN`
   - `PAYDUNYA_MASTER_KEY`, etc.

### 4. Déployer

```bash
git add .
git commit -m "Prisma MySQL complete migration"
git push origin main
```

Vercel va déployer automatiquement ✅

---

## 📚 Documentation complète

3 fichiers de documentation sont inclus:

1. **PRISMA_MIGRATION.md** - Guide complet avec tous les détails
2. **SCHEMA_PRISMA_COMPLET.md** - Documentation du schéma
3. **MIGRATION_PRISMA_RESUME.md** - Résumé des fichiers modifiés

---

## 🆘 Problèmes courants

| Problème | Solution |
|----------|----------|
| "Can't reach database" | Vérifier que MySQL est en cours d'exécution |
| "Table doesn't exist" | Exécuter: `npx prisma migrate dev --name init` |
| "Port 3306 already in use" | Arrêter MySQL: `mysql.server stop` ou `systemctl stop mysql` |
| "DATABASE_URL not set" | Vérifier `.env.local` et redémarrer `npm run dev` |

---

## 📋 Prochaines étapes

- [x] Prisma installé et configuré
- [x] Schema MySQL complet
- [x] Routes API créées
- [x] Prisma Client généré
- [ ] **Créer la base de données MySQL** (FAIRE MAINTENANT)
- [ ] **Exécuter migrations** (FAIRE MAINTENANT)
- [ ] Tester les endpoints
- [ ] Déployer sur Vercel

---

## 💡 Points clés à retenir

1. **Tous les montants sont en centimes**: 5000 = 50 USD
2. **Les mots de passe sont hachés** avec bcrypt (jamais stockés en clair)
3. **Les relations sont correctes**: User → Transactions → Purchases → Books
4. **Force dynamic = true** pour désactiver le cache Vercel
5. **Les fichiers JSON** restent en place pour compatibilité (supprimer plus tard)

---

## ✨ C'est tout!

Vous avez maintenant une application Next.js 14 avec:
- ✅ Base de données MySQL Prisma
- ✅ 7 modèles complets
- ✅ Routes API CRUD sécurisées
- ✅ Migration depuis JSON possible
- ✅ Prêt pour la production

**À vous de jouer! 🚀**

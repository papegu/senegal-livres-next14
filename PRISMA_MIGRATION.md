# 📦 Migration MySQL avec Prisma - COMPLÈTE

Cette application a été migrée de stockage JSON local vers une base de données MySQL avec Prisma ORM.

## ✅ Prérequis

- **Node.js** 18+ 
- **MySQL 8.0+** (local ou cloud)
- **npm** ou **yarn**

---

## 📊 Modèles de données

Le schéma inclut maintenant:

1. **User** - Utilisateurs (auth, admin, clients)
2. **Book** - Livres (catalogue)
3. **Transaction** - Paiements (PayDunya, Stripe, Wave, Orange, Ecobank)
4. **Purchase** - Achats de livres
5. **CartItem** - Panier
6. **Submission** - Soumissions d'auteurs
7. **AdminStats** - Statistiques (optionnel)

---

## 🚀 Installation Locale (MySQL sur votre PC)

### 1. Installer MySQL

**Windows:**
- Télécharger depuis: https://dev.mysql.com/downloads/mysql/
- Installer avec les paramètres par défaut
- Mémoriser le mot de passe root

**macOS (via Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu):**
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

---

## 2. Créer la base de données

Ouvrir MySQL CLI:
```bash
mysql -u root -p
```

Entrer le mot de passe root, puis exécuter:
```sql
CREATE DATABASE senegal_livres;
EXIT;
```

---

## 3. Configurer .env.local

Créer ou modifier `.env.local` à la racine du projet:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/senegal_livres"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
PAYDUNYA_USE_MOCK="true"
JWT_SECRET="dev_secret_change_me"
ADMIN_TOKEN="dev_admin_token"
```

Remplacer `YOUR_PASSWORD` par votre mot de passe MySQL.

---

## 4. Initialiser Prisma et exécuter migrations

### Générer Prisma Client:
```bash
npx prisma generate
```

### Créer la migration initiale:
```bash
npx prisma migrate dev --name init
```

Le système va:
- ✅ Lire le schéma (`prisma/schema.prisma`)
- ✅ Créer les tables MySQL
- ✅ Générer le Prisma Client

### Voir les tables créées:
```bash
mysql -u root -p senegal_livres -e "SHOW TABLES;"
```

---

## 5. Migrer les données JSON

Si vous avez un fichier `data/market.json` avec des données existantes:

```bash
npx ts-node scripts/migrate-json-to-db.ts
```

Ce script va:
- ✅ Lire `data/market.json`
- ✅ Migrer tous les users, books, transactions, purchases, submissions
- ✅ Créer les relations correctes (userId → bookId, etc.)
- ✅ Afficher un rapport des statistiques

---

## 6. Tester localement

Démarrer le serveur de développement:
```bash
npm run dev
```

Ouvrir http://localhost:3000 et tester les endpoints API:

### Users
```bash
# Créer un utilisateur
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Lister les utilisateurs (admin required)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Récupérer un utilisateur
curl -X GET http://localhost:3000/api/users/1

# Mettre à jour
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane"}'

# Supprimer
curl -X DELETE http://localhost:3000/api/users/1
```

### Books
```bash
# Lister les livres (public)
curl -X GET http://localhost:3000/api/books

# Créer un livre (admin)
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"title":"Test Book","author":"John Doe","price":5000,"category":"Science"}'

# Mettre à jour
curl -X PUT http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"id":1,"title":"Updated Title"}'

# Supprimer
curl -X DELETE "http://localhost:3000/api/books?id=1" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Transactions
```bash
# Lister les transactions (admin)
curl -X GET http://localhost:3000/api/transactions \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Créer une transaction (depuis les routes de paiement)
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "orderId":"order-123",
    "userId":1,
    "amount":50000,
    "paymentMethod":"paydunya",
    "description":"Purchase"
  }'
```

### Purchases
```bash
# Lister mes achats (utilisateur connecté)
curl -X GET http://localhost:3000/api/purchases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Créer un achat
curl -X POST http://localhost:3000/api/purchases \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"bookId":1,"transactionId":1,"amount":50000}'
```

### Submissions
```bash
# Lister mes soumissions
curl -X GET http://localhost:3000/api/admin/submissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Créer une soumission
curl -X POST http://localhost:3000/api/admin/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title":"My Book","author":"Me","description":"...",category":"Science"}'

# Approuver une soumission (admin)
curl -X PUT http://localhost:3000/api/admin/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"id":1,"status":"approved","reviewNotes":"Great!"}'
```

---

## 🌐 Déploiement Production (Vercel + PlanetScale)

### 1. Créer un compte PlanetScale

- Aller sur https://planetscale.com
- S'inscrire avec GitHub
- Créer une base de données gratuite

### 2. Récupérer la chaîne de connexion

1. Dashboard PlanetScale
2. Votre base de données
3. Cliquer: **Connect**
4. Sélectionner: **Prisma**
5. Copier la chaîne: `mysql://...`

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
   - `PAYDUNYA_MASTER_KEY`, `PAYDUNYA_PUBLIC_KEY`, etc.

### 4. Déployer et migrer

Localement d'abord:
```bash
# Tester la connexion
npx prisma db push

# Ou créer une migration
npx prisma migrate deploy
```

Ensuite pusher sur GitHub:
```bash
git add .
git commit -m "Prisma MySQL complete migration"
git push origin main
```

Vercel va déployer automatiquement. Les tables MySQL existent déjà via PlanetScale.

---

## 📝 Fichiers modifiés/créés

- `prisma/schema.prisma` → Schéma MySQL complet
- `lib/prisma.ts` → Singleton Prisma Client
- `app/api/users/route.tsx` → CRUD users
- `app/api/users/[id]/route.ts` → CRUD users par ID
- `app/api/books/route-prisma.ts` → CRUD books
- `app/api/transactions/route-prisma.ts` → CRUD transactions
- `app/api/purchases/route-prisma.ts` → CRUD purchases
- `app/api/admin/submissions/route-prisma.ts` → CRUD submissions
- `scripts/migrate-json-to-db.ts` → Migration JSON → MySQL
- `.env` → DATABASE_URL pour MySQL
- `.env.example` → Toutes les variables

---

## 🔧 Commandes Prisma utiles

```bash
# Voir l'état des migrations
npx prisma migrate status

# Créer une nouvelle migration
npx prisma migrate dev --name add_new_field

# Réinitialiser la base (attention: supprime les données!)
npx prisma migrate reset

# Ouvrir Prisma Studio (interface web)
npx prisma studio

# Valider le schéma
npx prisma validate

# Format le schéma
npx prisma format
```

---

## 🆘 Dépannage

| Problème | Solution |
|----------|----------|
| "Can't reach database" | Vérifier que MySQL est lancé et DATABASE_URL est correct |
| "Table doesn't exist" | Exécuter: `npx prisma migrate deploy` |
| "Foreign key error" | Vérifier que les relations existent dans schema.prisma |
| "Port 3306 already in use" | Arrêter MySQL et relancer: `mysql.server restart` |
| "Prisma Client not generated" | Exécuter: `npx prisma generate` |
| "JSON migration failed" | Vérifier que `data/market.json` existe et les UUIDs sont valides |

---

## ✅ Prochaines étapes

- [ ] Configurer MySQL local ou PlanetScale
- [ ] Exécuter migrations: `npx prisma migrate dev --name init`
- [ ] Migrer données JSON: `npx ts-node scripts/migrate-json-to-db.ts`
- [ ] Tester endpoints API
- [ ] Déployer sur Vercel avec DATABASE_URL
- [ ] Vérifier logs Vercel pour confirmer connexion
- [ ] Remplacer ancien code CRUD JSON par Prisma (progressivement)

---

**Questions?** Consulter la doc Prisma: https://www.prisma.io/docs/

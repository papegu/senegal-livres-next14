# 🗄️ Structure Prisma MySQL - Guide Complet

## 📊 Schéma de Base de Données

### Modèles (Tables)

#### 1. **User** (Utilisateurs)
```prisma
- id: Int @id @default(autoincrement())
- email: String @unique
- password: String (bcrypt hashed)
- name: String
- role: String (admin | client)
- blocked: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```
**Relations:**
- `transactions`: Transaction[] (un user peut avoir plusieurs paiements)
- `purchases`: Purchase[] (un user peut acheter plusieurs livres)
- `submissions`: Submission[] (un user peut soumettre plusieurs livres)
- `cartItems`: CartItem[] (panier de l'user)

---

#### 2. **Book** (Livres/Catalogue)
```prisma
- id: Int @id @default(autoincrement())
- uuid: String @unique (compatibilité JSON)
- title: String
- author: String
- description: String (texte long)
- price: Int (en centimes, 5000 = 50 USD)
- coverImage: String (URL)
- pdfFile: String (URL du PDF)
- pdfFileName: String
- stock: Int
- category: String
- status: String (available | archived)
- eBook: Boolean
- source: String (admin | submission)
- createdAt: DateTime
- updatedAt: DateTime
```
**Relations:**
- `purchases`: Purchase[] (un livre peut être acheté plusieurs fois)
- `cartItems`: CartItem[] (un livre peut être dans plusieurs paniers)
- `transactions`: Transaction[] (relations avec les paiements)

---

#### 3. **Transaction** (Paiements)
```prisma
- id: Int @id @default(autoincrement())
- uuid: String @unique
- orderId: String @unique
- userId: Int (FK User, nullable)
- amount: Int (centimes)
- paymentMethod: String (paydunya|stripe|wave|orange|ecobank)
- status: String (pending|validated|failed|cancelled)
- paydunyaInvoiceToken: String
- paydunyaResponseCode: String
- paydunyaStatus: String
- providerTxId: String
- bookIds: String (JSON array)
- description: String
- customerEmail: String
- rawPayload: String (JSON du fournisseur)
- paymentConfirmedAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
```
**Relations:**
- `user`: User? (l'user qui a payé)
- `purchases`: Purchase[] (les achats créés par ce paiement)

---

#### 4. **Purchase** (Achats)
```prisma
- id: Int @id @default(autoincrement())
- uuid: String @unique
- userId: Int (FK User)
- bookId: Int (FK Book)
- transactionId: Int? (FK Transaction)
- amount: Int (prix au moment de l'achat)
- downloadCount: Int
- lastDownload: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
```
**Relations:**
- `user`: User (qui a acheté)
- `book`: Book (le livre acheté)
- `transaction`: Transaction? (le paiement associé)

---

#### 5. **CartItem** (Panier)
```prisma
- id: Int @id @default(autoincrement())
- userId: Int (FK User)
- bookId: Int (FK Book)
- quantity: Int
- addedAt: DateTime
- updatedAt: DateTime
- Unique: (userId, bookId)
```
**Relations:**
- `user`: User (le propriétaire du panier)
- `book`: Book (le livre dans le panier)

---

#### 6. **Submission** (Soumissions d'auteurs)
```prisma
- id: Int @id @default(autoincrement())
- uuid: String @unique
- userId: Int (FK User)
- title: String
- author: String
- description: String
- pdfFile: String (URL du PDF)
- pdfFileName: String
- category: String
- status: String (pending|approved|rejected)
- reviewNotes: String
- submittedAt: DateTime
- reviewedAt: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
```
**Relations:**
- `user`: User (l'auteur qui soumet)

---

#### 7. **AdminStats** (Statistiques)
```prisma
- id: Int @id @default(autoincrement())
- totalUsers: Int
- totalBooks: Int
- totalTransactions: Int
- totalRevenue: Int (centimes)
- lastUpdated: DateTime
- updatedAt: DateTime
```

---

## 🔄 Relations principales

```
User
├── transactions (1:N) → Transaction
│   └── purchases (1:N) → Purchase
│       └── book (N:1) → Book
├── purchases (1:N) → Purchase
│   └── book (N:1) → Book
├── submissions (1:N) → Submission
└── cartItems (1:N) → CartItem
    └── book (N:1) → Book
```

---

## 📝 Routes API disponibles

### Users
- `GET /api/users` - Lister (admin)
- `POST /api/users` - Créer (public inscription)
- `PUT /api/users` - Mettre à jour (admin)
- `DELETE /api/users` - Supprimer (admin)
- `GET /api/users/[id]` - Récupérer un user
- `PUT /api/users/[id]` - Mettre à jour par ID (admin)
- `DELETE /api/users/[id]` - Supprimer par ID (admin)

### Books
- `GET /api/books` - Lister (public)
- `POST /api/books` - Créer (admin)
- `PUT /api/books` - Mettre à jour (admin)
- `DELETE /api/books?id=X` - Supprimer (admin)

### Transactions
- `GET /api/transactions` - Lister (admin)
- `POST /api/transactions` - Créer
- `PUT /api/transactions` - Mettre à jour

### Purchases
- `GET /api/purchases` - Lister mes achats (user)
- `POST /api/purchases` - Créer (système)
- `PUT /api/purchases` - Mettre à jour
- `DELETE /api/purchases?id=X` - Supprimer

### Submissions
- `GET /api/admin/submissions` - Lister (admin ou user own)
- `POST /api/admin/submissions` - Créer (user)
- `PUT /api/admin/submissions` - Mettre à jour (admin)
- `DELETE /api/admin/submissions?id=X` - Supprimer (admin)

---

## 💾 Migration des données

Pour migrer depuis `data/market.json`:

```bash
npx ts-node scripts/migrate-json-to-db.ts
```

Ce script:
1. Lit `data/market.json`
2. Crée les utilisateurs
3. Crée les livres
4. Crée les transactions
5. Crée les achats
6. Crée les soumissions
7. Affiche les statistiques

---

## 🔐 Authentification & Autorisation

### JWT Token
- Utilisé pour les routes protégées
- Contient `sub` (user ID) et autres claims
- Signé avec `JWT_SECRET`

### Admin Token
- Requête header: `X-Admin-Token`
- Comparé à `ADMIN_TOKEN` env
- Utilisé pour les routes admin uniquement

### Exemple:
```bash
# Avec JWT
curl -X GET http://localhost:3000/api/purchases \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Avec Admin Token
curl -X GET http://localhost:3000/api/transactions \
  -H "X-Admin-Token: YOUR_ADMIN_TOKEN"
```

---

## 📈 Montants & Devises

Tous les montants sont stockés en **centimes**:
- 5000 = 50 USD/EUR/etc
- 1000 = 10 USD/EUR/etc
- 1 = 0.01 USD/EUR/etc

**À l'affichage, diviser par 100:**
```javascript
const amountInDollars = transaction.amount / 100; // 5000 → 50
```

---

## 🎯 Cas d'usage typiques

### 1. Un utilisateur s'inscrit
```
POST /api/users
→ Crée User record
```

### 2. Un utilisateur achète un livre
```
1. GET /api/books → voir les livres
2. POST /api/cart → ajouter au panier
3. POST /api/paydunya/create-invoice → créer transaction PayDunya
4. Paiement externe (PayDunya, Stripe, etc.)
5. Webhook reçu → PATCH /api/transaction/{id} status=validated
6. POST /api/purchases → enregistrer l'achat
7. User reçoit email + accès au PDF
```

### 3. Un auteur soumet un livre
```
1. POST /api/admin/submissions → créer submission
2. Admin revoit → PUT /api/admin/submissions status=approved
3. Admin crée le Book → POST /api/books
4. Book visible au public
```

---

## 🚀 Déploiement

### Local
```bash
DATABASE_URL="mysql://root:pass@localhost:3306/senegal_livres"
npx prisma migrate dev --name init
npm run dev
```

### Production (Vercel + PlanetScale)
```bash
# PlanetScale: créer base de données
# Récupérer: mysql://...@aws.connect.psdb.cloud/...

# Vercel: ajouter env var DATABASE_URL
# Deployer → migration auto
```

---

## 📚 Documentation

- Prisma Docs: https://www.prisma.io/docs/
- Guide Complet: `PRISMA_MIGRATION.md`
- Schéma: `prisma/schema.prisma`

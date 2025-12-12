# 📖 INDEX - Migration Prisma MySQL Complète

## 🎯 Vue d'ensemble

Votre application **senegal-livres-next14** a été entièrement migrée de JSON local vers **MySQL avec Prisma ORM**.

---

## 📂 Structure des fichiers créés/modifiés

### **1. Configuration Prisma**
```
prisma/
├── schema.prisma          ✅ Schéma MySQL avec 7 modèles
└── (migrations/)          ← Créés automatiquement après migrate dev
```

### **2. Client Prisma**
```
lib/
└── prisma.ts            ✅ Singleton client (importer dans routes)
```

### **3. Routes API Prisma**
```
app/api/
├── users/
│   ├── route.tsx        ✅ CRUD users (GET, POST, PUT, DELETE)
│   └── [id]/route.ts    ✅ CRUD users par ID (GET, PUT, DELETE)
├── books/
│   └── route-prisma.ts  ✅ CRUD books (GET, POST, PUT, DELETE)
├── transactions/
│   └── route-prisma.ts  ✅ CRUD transactions (GET, POST, PUT)
├── purchases/
│   └── route-prisma.ts  ✅ CRUD purchases (GET, POST, PUT, DELETE)
└── admin/submissions/
    └── route-prisma.ts  ✅ CRUD submissions (GET, POST, PUT, DELETE)
```

### **4. Configuration d'environnement**
```
.env                      ✅ DATABASE_URL pour MySQL
.env.example              ✅ Toutes les variables documentées
```

### **5. Scripts de migration**
```
scripts/
└── migrate-json-to-db.ts ✅ Migrer data/market.json → MySQL
```

### **6. Documentation**
```
INSTALLATION_RAPIDE.md          ✅ Guide 3 étapes pour commencer
PRISMA_MIGRATION.md             ✅ Guide complet détaillé
SCHEMA_PRISMA_COMPLET.md        ✅ Documentation du schéma
MIGRATION_PRISMA_RESUME.md      ✅ Résumé des fichiers
```

---

## 🗄️ Modèles (Tables) MySQL

| Table | Champs clés | Relations |
|-------|-----------|-----------|
| **users** | id, email, password, role | → transactions, purchases, submissions, cartItems |
| **books** | id, title, author, price, coverImage, pdfFile | → purchases, cartItems |
| **transactions** | id, orderId, amount, paymentMethod, status | → user, purchases |
| **purchases** | id, userId, bookId, transactionId, amount | → user, book, transaction |
| **cartitems** | id, userId, bookId, quantity | → user, book |
| **submissions** | id, userId, title, author, status | → user |
| **adminstats** | id, totalUsers, totalBooks, totalTransactions, totalRevenue | (stats only) |

---

## 🚀 Démarrage rapide

### **1. Créer base de données**
```bash
mysql -u root -p
> CREATE DATABASE senegal_livres;
> EXIT;
```

### **2. Configurer .env.local**
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/senegal_livres"
```

### **3. Générer & Migrer**
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### **4. Démarrer l'app**
```bash
npm run dev
```

---

## 📚 Lire d'abord

Commencez par ces fichiers dans cet ordre:

1. **INSTALLATION_RAPIDE.md** (3 min) - Installation basique
2. **PRISMA_MIGRATION.md** (10 min) - Guide détaillé complet
3. **SCHEMA_PRISMA_COMPLET.md** (5 min) - Structure des données

---

## ✅ Checklist pour la production

- [ ] Base de données MySQL créée localement
- [ ] `.env.local` configuré avec DATABASE_URL
- [ ] `npx prisma migrate dev --name init` exécuté
- [ ] Test: `npm run dev` fonctionne
- [ ] API `/api/users` testée (POST pour créer un user)
- [ ] Données JSON migrées (optionnel): `npx ts-node scripts/migrate-json-to-db.ts`
- [ ] Préparation production: Compte PlanetScale créé
- [ ] Vercel: Variables d'env ajoutées (DATABASE_URL, JWT_SECRET, etc.)
- [ ] Déploiement: `git push origin main`

---

## 🔗 Routes API disponibles

### Users
```
GET    /api/users              - Lister (admin)
POST   /api/users              - Créer (public)
PUT    /api/users              - Mettre à jour (admin)
DELETE /api/users              - Supprimer (admin)
GET    /api/users/[id]         - Récupérer
PUT    /api/users/[id]         - Mettre à jour (admin)
DELETE /api/users/[id]         - Supprimer (admin)
```

### Books
```
GET    /api/books              - Lister (public)
POST   /api/books              - Créer (admin)
PUT    /api/books              - Mettre à jour (admin)
DELETE /api/books?id=X         - Supprimer (admin)
```

### Transactions
```
GET    /api/transactions       - Lister (admin)
POST   /api/transactions       - Créer
PUT    /api/transactions       - Mettre à jour
```

### Purchases
```
GET    /api/purchases          - Lister (user)
POST   /api/purchases          - Créer
PUT    /api/purchases          - Mettre à jour
DELETE /api/purchases?id=X     - Supprimer
```

### Submissions
```
GET    /api/admin/submissions  - Lister
POST   /api/admin/submissions  - Créer (user)
PUT    /api/admin/submissions  - Mettre à jour (admin)
DELETE /api/admin/submissions?id=X - Supprimer (admin)
```

---

## 💡 Notes importantes

1. **Tous les montants**: En centimes (5000 = 50 USD)
2. **Mots de passe**: Hachés avec bcrypt (jamais en clair)
3. **Force dynamic**: `export const dynamic = 'force-dynamic'` utilisé partout
4. **Relations**: User → Transactions → Purchases → Books
5. **JSON legacy**: Les fichiers JSON restent pour transition progressive

---

## 🆘 Support

### Documentation Prisma
- https://www.prisma.io/docs/

### Fichiers d'aide
- `INSTALLATION_RAPIDE.md` - Démarrage rapide
- `PRISMA_MIGRATION.md` - Guide complet
- `SCHEMA_PRISMA_COMPLET.md` - Référence schéma
- `MIGRATION_PRISMA_RESUME.md` - Résumé technique

---

## ✨ Prochaines étapes (optionnel)

Après la migration initiale, vous pouvez:

1. **Remplacer les autres routes JSON progressivement**
   - `/api/books/route.tsx` → nouveau `route-prisma.ts`
   - `/api/auth` → nouvelle version Prisma
   - etc.

2. **Supprimer le code legacy**
   - `utils/fileDb.ts` (si tout est migré)
   - `data/market.json` (après backup)
   - Anciens modèles TypeScript dans `models/`

3. **Optimiser la base de données**
   - Ajouter des indices
   - Ajouter des contraintes de validation
   - Générer des statistiques

---

## 📞 Questions fréquentes

**Q: Dois-je migrer immédiatement tous les endpoints?**  
R: Non. Vous pouvez garder JSON + Prisma en parallèle et migrer progressivement.

**Q: Puis-je utiliser SQLite au lieu de MySQL?**  
R: Oui, changez `provider = "sqlite"` dans `prisma/schema.prisma`.

**Q: Où vont les migrations?**  
R: Dans `prisma/migrations/` (créé automatiquement).

**Q: Comment ajouter un nouveau modèle?**  
R: 1. Ajouter dans `schema.prisma`, 2. Exécuter `npx prisma migrate dev --name nom_migration`.

---

**Vous êtes prêt! 🚀 Commencez par INSTALLATION_RAPIDE.md**

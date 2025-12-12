# Configuration PlanetScale MySQL avec Prisma

## 📋 Vue d'ensemble
Ce guide explique comment configurer une base de données MySQL sur PlanetScale (MySQL serverless) pour remplacer le stockage JSON (`market.json`).

### Avantages de PlanetScale:
- ✅ MySQL serverless (pas de serveur à gérer)
- ✅ Auto-scaling automatique
- ✅ Branchements (dev/prod séparés)
- ✅ Gratuit jusqu'à 3 bases de données
- ✅ Idéal pour développement et production

---

## 🚀 Étapes de configuration

### 1. Créer un compte PlanetScale

1. Allez sur https://planetscale.com/
2. Cliquez sur "Sign Up"
3. Connectez-vous avec GitHub (recommandé)
4. Vérifiez votre email

### 2. Créer une base de données

1. Dans le dashboard PlanetScale, cliquez sur "Create a new database"
2. Nommez-la: `senegal_livres`
3. Sélectionnez la région la plus proche (ex: `us-east`)
4. Cliquez sur "Create database"

### 3. Créer un mot de passe (mot de passe de connexion)

1. Aller à l'onglet "Passwords" de votre base de données
2. Cliquez sur "Create password"
3. Copiez la chaîne de connexion complète (elle ressemble à):
   ```
   mysql://username:password@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict
   ```

### 4. Configurer la variable d'environnement

Dans `.env.local`, remplacez la DATABASE_URL:

```env
DATABASE_URL="mysql://username:password@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict"
```

⚠️ **Important**: Gardez cette chaîne secrète! Ajoutez `.env.local` à `.gitignore`

### 5. Vérifier .gitignore

Assurez-vous que `.env.local` est dans `.gitignore`:

```gitignore
# Environnement
.env
.env.local
.env.*.local
```

### 6. Installer les dépendances Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

### 7. Générer le Prisma Client

```bash
npx prisma generate
```

### 8. Exécuter les migrations

Pour créer toutes les tables dans PlanetScale:

```bash
npx prisma migrate deploy
```

Si c'est la première fois et qu'il n'existe pas de migration, créez-la:

```bash
npx prisma migrate dev --name init
```

### 9. Vérifier la connexion

```bash
npx prisma db push
```

Vous devriez voir:
```
✔ Database synced!
```

---

## 📊 Vérifier les tables créées

Depuis le dashboard PlanetScale:

1. Cliquez sur "Browse" → "Tables"
2. Vous devriez voir ces 8 tables:
   - `User`
   - `Book`
   - `Transaction`
   - `Purchase`
   - `CartItem`
   - `Submission`
   - `AdminStats`

---

## 🔄 Migrer les données de market.json vers MySQL

Un script migration a été créé: `/scripts/migrate-json-to-db.ts`

```bash
npx ts-node scripts/migrate-json-to-db.ts
```

Cela va:
1. Lire `data/market.json`
2. Créer les utilisateurs
3. Créer les livres
4. Créer les soumissions
5. Afficher un rapport de migration

---

## 🛠️ Commandes utiles Prisma

### Voir les données en base:
```bash
npx prisma studio
```

### Créer une nouvelle migration:
```bash
npx prisma migrate dev --name [nom_migration]
```

### Vérifier l'état de la base:
```bash
npx prisma db push
```

### Réinitialiser la base (ATTENTION - supprime tout):
```bash
npx prisma migrate reset
```

### Générer/Regénérer le client:
```bash
npx prisma generate
```

---

## 🔐 Utiliser Prisma dans l'application

### Importer le client Prisma:

```typescript
import { prisma } from '@/lib/prisma';

// Utiliser dans une route API:
export async function GET(req: Request) {
  try {
    const books = await prisma.book.findMany();
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}
```

### Exemple: Créer un utilisateur

```typescript
const user = await prisma.user.create({
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
    role: 'client',
  },
});
```

### Exemple: Récupérer les livres d'un utilisateur

```typescript
const purchases = await prisma.purchase.findMany({
  where: { userId: userId },
  include: { book: true },
  orderBy: { createdAt: 'desc' },
});
```

---

## 🌿 Branchements PlanetScale (Optionnel mais recommandé)

Pour avoir une base de données de développement séparée:

1. Allez à l'onglet "Branches" de votre base
2. Cliquez sur "Create a new branch"
3. Nommez-la: `develop`
4. Créez un mot de passe pour cette branche
5. Utilisez cette DATABASE_URL pour le développement

### .env.local pour dev:
```env
DATABASE_URL="mysql://dev_user:dev_password@aws.connect.psdb.cloud/senegal_livres/develop?sslaccept=strict"
```

### .env.production pour prod:
```env
DATABASE_URL="mysql://prod_user:prod_password@aws.connect.psdb.cloud/senegal_livres/main?sslaccept=strict"
```

---

## 🐛 Dépannage

### Erreur: "Unknown table: table_name"
**Solution**: Exécutez les migrations:
```bash
npx prisma migrate deploy
# ou
npx prisma db push
```

### Erreur: "Can't reach database server"
**Solution**: Vérifiez votre DATABASE_URL dans `.env.local`

### Erreur: "SSL connection error"
**Solution**: Assurez-vous que `?sslaccept=strict` est dans la DATABASE_URL

### Prisma Client n'est pas généré
```bash
npx prisma generate
```

---

## 📝 Fichiers modifiés

- ✅ `prisma/schema.prisma` - Datasource configuré pour MySQL avec relationMode
- ✅ `.env.local` - DATABASE_URL ajoutée
- ✅ `lib/prisma.ts` - Prisma Client singleton configuré
- ✅ Fichiers API - Import corrigé: `import { prisma } from '@/lib/prisma'`

---

## ✅ Checklist finale

- [ ] Compte PlanetScale créé
- [ ] Base de données `senegal_livres` créée
- [ ] Mot de passe créé et DATABASE_URL copié
- [ ] DATABASE_URL ajoutée à `.env.local`
- [ ] `npx prisma generate` exécuté
- [ ] `npx prisma migrate deploy` exécuté
- [ ] Tables créées dans PlanetScale
- [ ] Données migrées depuis market.json
- [ ] API testée et fonctionne

---

## 🚀 Prochaines étapes

1. Vérifier que la compilation TypeScript passe: `npm run build`
2. Tester en local: `npm run dev`
3. Vérifier l'admin dashboard: `http://localhost:3000/admin`
4. Tester les API routes avec Prisma

---

**Support PlanetScale**: https://planetscale.com/docs
**Documentation Prisma**: https://www.prisma.io/docs/


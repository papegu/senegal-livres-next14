# 🚀 Configuration PlanetScale MySQL - Guide Rapide

## Étape 1: Créer un compte PlanetScale

1. Allez sur https://planetscale.com/
2. Créez un compte (gratuit)
3. Connectez-vous

## Étape 2: Créer la base de données

1. Cliquez sur "New database"
2. Nom: `senegal_livres`
3. Région: Choisissez la plus proche (ex: `aws-eu-west-1` pour l'Europe)
4. Cliquez sur "Create"

## Étape 3: Obtenir la chaîne de connexion

1. Dans votre base de données, cliquez sur "Connect"
2. Sélectionnez "Prisma" comme framework
3. Copiez la **DATABASE_URL** complète

Elle ressemble à:
```
mysql://[username]:[password]@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict
```

## Étape 4: Configurer .env.local

Remplacez la ligne DATABASE_URL dans `.env.local`:

```env
DATABASE_URL="mysql://votre_username:votre_password@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict"
```

⚠️ **Important**: Utilisez la vraie URL de connexion de PlanetScale

## Étape 5: Pousser le schéma vers PlanetScale

```bash
npx prisma db push
```

Cette commande va:
- Créer toutes les 7 tables (User, Book, Transaction, Purchase, CartItem, Submission, AdminStats)
- Synchroniser votre schéma Prisma avec PlanetScale

Vous devriez voir:
```
✔ Database synced successfully
```

## Étape 6: Migrer les données de market.json

```bash
npx ts-node scripts/migrate-json-to-db.ts
```

Cela va transférer:
- 4 utilisateurs
- 3 livres  
- 1 soumission

## Étape 7: Vérifier dans Prisma Studio

```bash
npx prisma studio
```

Cela ouvre une interface web pour voir vos données.

## Étape 8: Tester l'application

```bash
npm run dev
```

Allez sur:
- http://localhost:3000/admin - Dashboard admin
- http://localhost:3000/admin/database - Gestion BDD

---

## ✅ Vérifications

- [ ] DATABASE_URL configurée dans .env.local
- [ ] `npx prisma db push` réussi
- [ ] Données migrées depuis market.json
- [ ] Application démarre sans erreur
- [ ] Dashboard admin accessible

---

## 🛠️ Commandes utiles

**Voir les données:**
```bash
npx prisma studio
```

**Synchroniser le schéma:**
```bash
npx prisma db push
```

**Régénérer le client:**
```bash
npx prisma generate
```

**Migrations (production):**
```bash
npx prisma migrate deploy
```

---

## 📊 Votre schéma contient:

- ✅ **User** - Utilisateurs (admin/client)
- ✅ **Book** - Livres/eBooks
- ✅ **Transaction** - Paiements (PayDunya, etc.)
- ✅ **Purchase** - Achats d'utilisateurs
- ✅ **CartItem** - Paniers d'achat
- ✅ **Submission** - Soumissions d'auteurs
- ✅ **AdminStats** - Statistiques

---

## 🔗 Liens utiles

- PlanetScale Dashboard: https://app.planetscale.com/
- Prisma Docs: https://www.prisma.io/docs
- PlanetScale + Prisma: https://www.prisma.io/docs/guides/database/planetscale


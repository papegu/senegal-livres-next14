# 🚀 Configuration MySQL - 3 Options Simples

Votre application est prête pour MySQL. Choisissez une option:

## Option 1: PlanetScale (Recommandé - Gratuit)

**Étapes rapides:**
1. Créez un compte sur https://planetscale.com
2. Créez une base "senegal_livres"
3. Copiez la DATABASE_URL
4. Collez-la dans `.env.local`
5. Exécutez: `npx prisma db push`
6. Exécutez: `npx ts-node scripts/migrate-json-to-db.ts`

**Temps:** 5 minutes

---

## Option 2: Railway (Gratuit - Plus Simple)

**Étapes rapides:**
1. Allez sur https://railway.app
2. Connectez-vous avec GitHub
3. New Project → Provision MySQL
4. Copiez la DATABASE_URL (onglet Variables)
5. Collez-la dans `.env.local`
6. Exécutez: `npx prisma db push`
7. Exécutez: `npx ts-node scripts/migrate-json-to-db.ts`

**Temps:** 3 minutes

---

## Option 3: MySQL Local (Si déjà installé)

**Si vous avez MySQL installé:**

1. Créez la base de données:
```sql
CREATE DATABASE senegal_livres;
CREATE USER 'senegal'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'senegal'@'localhost';
FLUSH PRIVILEGES;
```

2. Mettez à jour `.env.local`:
```env
DATABASE_URL="mysql://senegal:votre_mot_de_passe@localhost:3306/senegal_livres"
```

3. Exécutez:
```bash
npx prisma db push
npx ts-node scripts/migrate-json-to-db.ts
```

---

## ⚡ Configuration Actuelle

Actuellement, votre `.env.local` contient:
```
DATABASE_URL="mysql://root@localhost:3306/senegal_livres"
```

**Problème:** MySQL n'est pas accessible localement.

**Solution:** Choisissez l'Option 1 (PlanetScale) ou l'Option 2 (Railway) ci-dessus.

---

## 🔄 Après Configuration

Une fois la DATABASE_URL configurée:

1. **Synchroniser le schéma:**
   ```bash
   npx prisma db push
   ```
   ✅ Cela créera automatiquement toutes les tables

2. **Migrer les données:**
   ```bash
   npx ts-node scripts/migrate-json-to-db.ts
   ```
   ✅ Cela transférera vos données de market.json vers MySQL

3. **Tester:**
   ```bash
   npm run dev
   ```

---

## 📊 Que va-t-il se passer?

Après la migration, l'application utilisera automatiquement MySQL au lieu de market.json pour:
- ✅ Tous les utilisateurs
- ✅ Tous les livres
- ✅ Toutes les transactions
- ✅ Tous les achats
- ✅ Toutes les soumissions

market.json restera comme backup.

---

**Besoin d'aide?** Dites-moi quelle option vous préférez et je vous guide!


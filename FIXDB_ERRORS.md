# 🚨 Comment Corriger l'Erreur 500 sur le Dashboard Admin

Vous recevez une erreur **500** quand vous essayez d'accéder à `/api/admin/database`?

C'est normal! La base de données MySQL n'a pas encore été initialisée. Suivez ces étapes:

---

## ✅ Solution Rapide (3 étapes)

### Étape 1: Créer l'Utilisateur MySQL

Ouvrez **PowerShell** dans le répertoire du projet:

```powershell
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"
.\scripts\create-mysql-admin.ps1
```

**Résultat attendu:**
```
Configuration Utilisateur MySQL:
  Utilisateur: papeabdoulaye
  Mot de passe: [CACHÉ]
  Host: localhost
  Privilèges: ALL PRIVILEGES ON *.*

✓ Utilisateur créé avec succès!
```

---

### Étape 2: Exécuter les Migrations Prisma

Dans la même fenêtre PowerShell, exécutez:

```powershell
npx prisma migrate dev --name init
```

**Résultat attendu:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": MySQL database "senegal_livres" at "localhost:3306"

Prisma Migrate created the following migration(s):

  migrations/20250101000000_init/
  - Create table "User"
  - Create table "Book"
  - Create table "Transaction"
  - Create table "Purchase"
  - ...

Migration applied successfully.
```

---

### Étape 3: Rafraîchir le Dashboard

Une fois les migrations terminées:

1. Allez sur `http://localhost:3000/admin/database`
2. Rafraîchissez la page (F5 ou Ctrl+R)
3. Les données devraient maintenant s'afficher

---

## 🧪 Vérification

Pour vérifier que tout fonctionne:

```powershell
# Tester la connexion MySQL
mysql -u papeabdoulaye -ppape1982 -h localhost -e "SHOW DATABASES;"

# Voir les tables
mysql -u papeabdoulaye -ppape1982 -h localhost senegal_livres -e "SHOW TABLES;"

# Voir les statistiques
mysql -u papeabdoulaye -ppape1982 -h localhost senegal_livres -e "SELECT TABLE_NAME, TABLE_ROWS FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='senegal_livres';"
```

---

## ❓ Dépannage

### Erreur: "Script not found"
```powershell
# Assurez-vous d'être dans le bon répertoire
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

# Puis essayez à nouveau
.\scripts\create-mysql-admin.ps1
```

### Erreur: "Cannot find mysql command"
```powershell
# MySQL n'est pas dans le PATH
# Vérifiez que MySQL est installé:
mysql --version

# Si ça ne marche pas, installez MySQL ou ajoutez au PATH
```

### Erreur: "Access denied for user"
```powershell
# L'utilisateur n'a pas pu être créé
# Essayez manuellement:
mysql -u root -p

# Puis exécutez dans MySQL:
CREATE USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';
GRANT ALL PRIVILEGES ON *.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### Erreur: "Database 'senegal_livres' doesn't exist"
```powershell
# La base de données n'a pas été créée
# Prisma devrait la créer, mais si ça ne marche pas:
mysql -u root -p -e "CREATE DATABASE senegal_livres;"

# Puis relancez les migrations
npx prisma migrate dev --name init
```

---

## 📊 Après la Configuration

Une fois que tout fonctionne, vous devriez voir:

- ✅ Statistiques en temps réel
- ✅ Nombre d'utilisateurs, livres, transactions
- ✅ Taille de la base de données
- ✅ Boutons d'administration (Optimiser, Sauvegarder, etc.)
- ✅ Tableau détaillé des tables

---

## 🔄 Redémarrer le Serveur

Après les migrations, redémarrez le serveur:

```powershell
# Si npm run dev est déjà lancé:
# 1. Appuyez sur Ctrl+C pour l'arrêter
# 2. Exécutez à nouveau:
npm run dev

# Puis accédez à:
http://localhost:3000/admin/database
```

---

## 📚 Fichiers d'Aide

Consultez ces fichiers pour plus d'informations:

- `SETUP_INSTRUCTIONS.md` - Guide complet
- `MYSQL_ADMIN_README.md` - Résumé rapide
- `ADMIN_MYSQL_SETUP.md` - Documentation détaillée
- `setup_admin_mysql.sql` - Commandes SQL

---

**Configuration nécessaire avant d'utiliser le dashboard:**

1. ✅ Créer l'utilisateur MySQL
2. ✅ Lancer les migrations Prisma
3. ✅ Rafraîchir le dashboard

C'est tout! 🎉

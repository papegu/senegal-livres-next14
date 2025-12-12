# 🎯 INSTRUCTIONS D'INSTALLATION - Administrateur MySQL

Bonjour papeabdoulaye.gueye@uadb.edu.sn,

Voici comment configurer votre compte administrateur MySQL et accéder à la page de gestion de la base de données.

---

## ✅ ÉTAPES D'INSTALLATION (Ordre Important)

### ÉTAPE 1: Créer l'Utilisateur MySQL
**Durée: 2 minutes**

Exécutez le script PowerShell:

```powershell
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

### ÉTAPE 2: Vérifier la Configuration
**Durée: 1 minute**

Exécutez le script de vérification:

```powershell
.\scripts\verify-admin-setup.ps1
```

**Résultat attendu:**
```
[OK] Fichier route.ts cree
[OK] Fichier page.tsx cree
[OK] Documentation creee
... etc
```

---

### ÉTAPE 3: Lancer le Serveur
**Durée: 30 secondes**

```bash
npm run dev
```

**Résultat attendu:**
```
> next dev
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

### ÉTAPE 4: Accéder au Dashboard
**Durée: 1 minute**

1. Ouvrir: `http://localhost:3000/admin`
2. Se connecter comme administrateur (token admin requis)
3. Cliquer sur la carte **"🗄️ Base de Données"**

---

## 📊 PAGE D'ADMINISTRATION DE LA BASE DE DONNÉES

**URL:** `http://localhost:3000/admin/database`

### Fonctionnalités Disponibles:

#### 📈 Statistiques en Temps Réel
- Nombre d'utilisateurs
- Nombre de livres
- Nombre de transactions
- Nombre d'achats
- Nombre de soumissions

#### 📊 Informations de Taille
- Taille des données (MB/GB)
- Taille des index (MB/GB)
- Taille totale de la base de données
- Nombre total de lignes

#### 🔧 Actions d'Administration
- **Optimiser la Base de Données** - Améliore les performances
- **Créer une Sauvegarde** - Sauvegarde les données
- **Voir les Connexions** - Affiche les processus actifs
- **Rafraîchir** - Met à jour les statistiques

#### 📋 Détails des Tables
Tableau avec statistiques pour chaque table:
- Nombre de lignes
- Taille des données
- Taille des index
- Taille totale

---

## 🔌 Informations de Connexion MySQL

```
Utilisateur: papeabdoulaye
Mot de passe: pape1982
Host: localhost
Port: 3306
Base de données: senegal_livres
Privilèges: ALL (Administrateur Complet)
```

### Tester la Connexion

```bash
# Connexion directe
mysql -u papeabdoulaye -ppape1982 -h localhost

# Ou avec la base de données
mysql -u papeabdoulaye -ppape1982 -h localhost senegal_livres

# Vérifier les privilèges
SHOW GRANTS FOR 'papeabdoulaye'@'localhost';
```

---

## 📂 FICHIERS CRÉÉS

### Code Source:
- `app/api/admin/database/route.ts` - API d'administration
- `app/admin/database/page.tsx` - Interface utilisateur
- `app/admin/page.tsx` - Dashboard (modifié)

### Scripts:
- `scripts/create-mysql-admin.ps1` - Création utilisateur
- `scripts/verify-admin-setup.ps1` - Vérification

### Documentation:
- `MYSQL_ADMIN_README.md` - Guide rapide (CE FICHIER)
- `ADMIN_MYSQL_SETUP.md` - Documentation complète
- `setup_admin_mysql.sql` - Commandes SQL
- `SETUP_INSTRUCTIONS.md` - Instructions détaillées

---

## 🧪 COMMANDES UTILES

```bash
# Démarrer le serveur
npm run dev

# Compiler le projet
npm run build

# Tester la connexion MySQL
mysql -u papeabdoulaye -ppape1982 -e "SELECT VERSION();"

# Voir les tables
mysql -u papeabdoulaye -ppape1982 senegal_livres -e "SHOW TABLES;"

# Voir les utilisateurs MySQL
mysql -u root -p -e "SELECT User, Host FROM mysql.user;"

# Voir les privilèges
mysql -u papeabdoulaye -ppape1982 -e "SHOW GRANTS;"

# Créer un backup
mysqldump -u papeabdoulaye -ppape1982 senegal_livres > backup.sql

# Restaurer un backup
mysql -u papeabdoulaye -ppape1982 senegal_livres < backup.sql
```

---

## ❓ DÉPANNAGE

### Erreur: "Access Denied"
```bash
# Vérifier que l'utilisateur existe
mysql -u root -p -e "SELECT User FROM mysql.user WHERE User='papeabdoulaye';"

# Si vide, le créer manuellement:
mysql -u root -p < setup_admin_mysql.sql
```

### Erreur: "Can't Connect to MySQL Server"
```bash
# Vérifier que MySQL est en cours d'exécution
Get-Service MySQL80

# Redémarrer si nécessaire
Stop-Service MySQL80
Start-Service MySQL80
```

### Page d'Admin ne Charge Pas
1. Vérifier que vous êtes connecté en tant qu'administrateur
2. Vérifier que le serveur est lancé: `npm run dev`
3. Vérifier la console pour les erreurs: F12 → Console

---

## 🔐 SÉCURITÉ

### Avant la Production:

1. **Changer le mot de passe:**
```sql
ALTER USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe_fort';
FLUSH PRIVILEGES;
```

2. **Ajouter à `.env.production`:**
```env
DATABASE_URL=mysql://papeabdoulaye:pape1982@prod-db.example.com/senegal_livres
```

3. **Sauvegardes régulières:**
```bash
# Automatiser les sauvegardes
mysqldump -u papeabdoulaye -ppape1982 senegal_livres > backup_$(date +%Y%m%d).sql
```

---

## 📞 SUPPORT

Pour toute question ou problème:

1. Consulter `ADMIN_MYSQL_SETUP.md` pour la documentation complète
2. Vérifier les logs du serveur: `npm run dev`
3. Consulter la documentation MySQL: https://dev.mysql.com/doc/
4. Consulter la documentation Prisma: https://www.prisma.io/docs/

---

## ✨ PROCHAINES ÉTAPES

Une fois configuré:

1. ✅ Créer l'utilisateur MySQL (ÉTAPE 1)
2. ✅ Vérifier la configuration (ÉTAPE 2)
3. ✅ Lancer le serveur (ÉTAPE 3)
4. ✅ Accéder au dashboard (ÉTAPE 4)
5. 📊 Utiliser la page d'administration pour surveiller la base de données

---

**Configuration Date:** Décembre 2025  
**Utilisateur:** papeabdoulaye.gueye@uadb.edu.sn  
**Email:** papeabdoulaye.gueye@uadb.edu.sn

Bienvenue en tant qu'administrateur MySQL! 🎉

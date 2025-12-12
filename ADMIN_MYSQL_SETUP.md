# Configuration Administrateur MySQL - papeabdoulaye.gueye@uadb.edu.sn

## Vue d'ensemble

Cette documentation explique comment configurer l'utilisateur administrateur MySQL `papeabdoulaye` avec accès complet à la base de données et à la page d'administration dédiée.

## Informations de Connexion

```
Utilisateur MySQL: papeabdoulaye
Mot de passe: pape1982
Email: papeabdoulaye.gueye@uadb.edu.sn
Host: localhost
Privilèges: ALL PRIVILEGES ON *.*
```

## Étapes de Configuration

### 1. Créer l'Utilisateur MySQL

#### Option A: Via Script PowerShell (Recommandé)

```powershell
# Exécuter le script de création
.\scripts\create-mysql-admin.ps1
```

Le script va:
- Vérifier que MySQL est installé
- Créer l'utilisateur `papeabdoulaye` avec le mot de passe `pape1982`
- Attribuer tous les privilèges
- Vérifier la création

#### Option B: Via MySQL CLI

1. Ouvrir MySQL CLI:
```bash
mysql -u root -p
```

2. Exécuter les commandes SQL:
```sql
-- Créer l'utilisateur
CREATE USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';

-- Attribuer tous les privilèges
GRANT ALL PRIVILEGES ON *.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;

-- Rafraîchir les privilèges
FLUSH PRIVILEGES;

-- Vérifier la création
SELECT User, Host FROM mysql.user WHERE User='papeabdoulaye';
```

### 2. Vérifier la Création

```bash
mysql -u papeabdoulaye -ppape1982 -h localhost -e "SELECT USER(), VERSION();"
```

Vous devriez voir:
```
+----------------------------+-----------+
| USER()                     | VERSION() |
+----------------------------+-----------+
| papeabdoulaye@localhost    | 8.x.x     |
+----------------------------+-----------+
```

## Page d'Administration Base de Données

Une fois le serveur lancé, accédez à la page d'administration:

```
URL: http://localhost:3000/admin/database
```

### Fonctionnalités

**Statistiques en Temps Réel:**
- Nombre d'utilisateurs
- Nombre de livres
- Nombre de transactions
- Nombre d'achats
- Nombre de soumissions

**Informations de Taille:**
- Taille des données
- Taille des index
- Taille totale
- Nombre total de lignes

**Actions d'Administration:**
- 🔧 **Optimiser la Base de Données** - Exécute `OPTIMIZE TABLE` sur toutes les tables
- 💾 **Créer une Sauvegarde** - Initie une sauvegarde (timestamp fourni)
- 🔌 **Voir les Connexions** - Affiche les processus MySQL actifs
- 🔄 **Rafraîchir** - Met à jour les statistiques en temps réel

**Détails des Tables:**
- Tableau détaillé de chaque table
- Nombre de lignes par table
- Taille des données, index et total
- Mise à jour en temps réel

## Architecture de la Solution

### Fichiers Créés

#### 1. `/app/api/admin/database/route.ts`
Endpoint API pour les opérations de base de données:
- `GET` - Récupère les statistiques
- `POST` - Exécute les actions (optimize, backup, getConnections)

Authentification via header `x-admin-token`

#### 2. `/app/admin/database/page.tsx`
Interface utilisateur pour l'administration:
- Affichage des statistiques en temps réel
- Tableau des tables
- Actions d'administration interactives
- Instructions pour créer l'utilisateur MySQL

#### 3. `/scripts/create-mysql-admin.ps1`
Script PowerShell automatisé pour:
- Vérifier MySQL
- Créer l'utilisateur
- Configurer les privilèges
- Afficher les informations de confirmation

### Flux d'Authentification

```
1. L'administrateur se connecte via /auth/login
2. Stockage du token admin dans localStorage
3. Accès à /admin/dashboard
4. Clic sur "Base de Données"
5. Les requêtes à /api/admin/database incluent le header x-admin-token
6. Vérification du token côté serveur
```

## Utilisation Quotidienne

### Accéder à la Base de Données via CLI

```bash
# Connexion en tant qu'administrateur
mysql -u papeabdoulaye -ppape1982 -h localhost senegal_livres

# Ou avec des variables d'environnement
mysql --user=papeabdoulaye --password=pape1982 --host=localhost senegal_livres
```

### Lancer le Serveur

```bash
npm run dev
```

Accès au dashboard:
- Admin: `http://localhost:3000/admin`
- Base de données: `http://localhost:3000/admin/database`

### Vérifications Courantes

```sql
-- Voir tous les utilisateurs
SELECT User, Host, authentication_string FROM mysql.user;

-- Voir les privilèges de papeabdoulaye
SHOW GRANTS FOR 'papeabdoulaye'@'localhost';

-- Voir les tables de la base de données
USE senegal_livres;
SHOW TABLES;

-- Voir le nombre de lignes par table
SELECT 
  TABLE_NAME,
  TABLE_ROWS 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'senegal_livres';
```

## Sécurité

### Recommandations

1. **Environnement de Production:**
   - Changer le mot de passe `pape1982` par un mot de passe fort
   - Utiliser des variables d'environnement pour les credentials
   - Restreindre l'accès à l'utilisateur à des hosts spécifiques (ex: 192.168.1.%)

2. **Sauvegarde:**
   - Effectuer des sauvegardes régulières
   - Tester la restauration des sauvegardes
   - Stocker les sauvegardes hors site

3. **Monitoring:**
   - Vérifier régulièrement les processus actifs
   - Surveiller la taille de la base de données
   - Optimiser les tables régulièrement

### Changement de Mot de Passe

```sql
ALTER USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe';
FLUSH PRIVILEGES;
```

## Troubleshooting

### Erreur: "Access denied for user"

```bash
# Vérifier que l'utilisateur existe
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='papeabdoulaye';"

# Réinitialiser le mot de passe
mysql -u root -p -e "ALTER USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982'; FLUSH PRIVILEGES;"
```

### Erreur: "Can't connect to MySQL server"

1. Vérifier que MySQL est en cours d'exécution:
```bash
# Windows
Get-Service MySQL80  # ou votre version

# Linux/Mac
brew services list | grep mysql
```

2. Vérifier les paramètres de connexion:
```bash
# TEST avec host et port explicites
mysql -u papeabdoulaye -ppape1982 -h 127.0.0.1 -P 3306
```

### Erreur: "Page /admin/database not found"

Assurez-vous que:
1. Le serveur est lancé: `npm run dev`
2. Vous êtes connecté en tant qu'administrateur
3. Le token admin est en localStorage

## Migrations et Mises à Jour

Après la création de l'utilisateur, exécuter les migrations Prisma:

```bash
# Initialiser la base de données
npx prisma migrate dev --name init

# Migrer les données JSON vers MySQL
npx ts-node scripts/migrate-json-to-db.ts
```

## Intégration avec la CI/CD

Pour Vercel/Production:

```env
# .env.production
DATABASE_URL=mysql://papeabdoulaye:pape1982@db.example.com:3306/senegal_livres_prod
ADMIN_TOKEN=strong_random_token_here
```

Ou utiliser MySQL Cloud Services (PlanetScale, AWS RDS):

```env
DATABASE_URL=mysql://user:pass@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict
```

## Référence Rapide

| Action | Commande |
|--------|----------|
| Créer l'utilisateur | `.\scripts\create-mysql-admin.ps1` |
| Se connecter | `mysql -u papeabdoulaye -ppape1982` |
| Voir les tables | `SHOW TABLES;` |
| Optimiser | Via `/admin/database` |
| Sauvegarder | Via `/admin/database` |
| Consulter les logs | `SHOW PROCESSLIST;` |

## Support

Pour les problèmes:
1. Consulter les logs du serveur: `npm run dev`
2. Vérifier les erreurs MySQL: `mysql error log`
3. Consulter la documentation Prisma: https://www.prisma.io/docs/
4. Consulter la documentation MySQL: https://dev.mysql.com/doc/

---

**Dernière mise à jour:** Décembre 2025
**Version:** 1.0

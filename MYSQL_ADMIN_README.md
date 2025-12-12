# 🗄️ Configuration Administrateur MySQL - Résumé Rapide

## Installation en 3 Étapes

### 1️⃣ Créer l'Utilisateur MySQL

Exécutez le script PowerShell:

```powershell
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"
.\scripts\create-mysql-admin.ps1
```

**Ou manuellement via MySQL CLI:**

```bash
mysql -u root -p
```

```sql
CREATE USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982';
GRANT ALL PRIVILEGES ON *.* TO 'papeabdoulaye'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

### 2️⃣ Lancer le Serveur

```bash
npm run dev
```

### 3️⃣ Accéder au Dashboard

1. Aller à `http://localhost:3000/admin`
2. Cliquer sur **"🗄️ Base de Données"**
3. Voir les statistiques MySQL en temps réel

---

## 📊 Informations de Connexion

| Paramètre | Valeur |
|-----------|--------|
| **Utilisateur** | `papeabdoulaye` |
| **Mot de passe** | `pape1982` |
| **Email** | `papeabdoulaye.gueye@uadb.edu.sn` |
| **Host** | `localhost` |
| **Port** | `3306` (défaut) |
| **Privilèges** | ALL PRIVILEGES ON *.* |

---

## 🎯 Fonctionnalités

### Page d'Administration Base de Données
**URL:** `http://localhost:3000/admin/database`

- 📈 **Statistiques en temps réel**
  - Utilisateurs, Livres, Transactions, Achats, Soumissions
  
- 📊 **Informations de taille**
  - Données, Index, Taille totale, Nombre de lignes
  
- 🔧 **Actions d'administration**
  - Optimiser la base de données
  - Créer une sauvegarde
  - Voir les connexions actives
  - Rafraîchir les données
  
- 📋 **Détails des tables**
  - Tableau avec toutes les statistiques par table

---

## 🧪 Tester la Connexion

```bash
# Tester que l'utilisateur fonctionne
mysql -u papeabdoulaye -ppape1982 -h localhost -e "SELECT USER(), VERSION();"

# Afficher les privilèges
mysql -u papeabdoulaye -ppape1982 -h localhost -e "SHOW GRANTS FOR 'papeabdoulaye'@'localhost';"
```

---

## 📁 Fichiers Créés

```
senegal-livres-next14/
├── app/
│   ├── api/
│   │   └── admin/
│   │       └── database/
│   │           └── route.ts              # API d'administration
│   └── admin/
│       ├── page.tsx                      # Dashboard avec lien BD
│       └── database/
│           └── page.tsx                  # Page d'administration
├── scripts/
│   └── create-mysql-admin.ps1            # Script de création utilisateur
├── ADMIN_MYSQL_SETUP.md                  # Documentation complète
└── MYSQL_ADMIN_README.md                 # Ce fichier
```

---

## 🔐 Sécurité

### Avant la Production

1. **Changer le mot de passe:**
```sql
ALTER USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'nouveau_mot_de_passe_fort';
FLUSH PRIVILEGES;
```

2. **Restreindre l'accès (optionnel):**
```sql
-- Limiter à un réseau spécifique au lieu de localhost
ALTER USER 'papeabdoulaye'@'192.168.1.%' IDENTIFIED BY 'pape1982';
```

3. **Ajouter à `.env`:**
```env
DATABASE_ADMIN_USER=papeabdoulaye
DATABASE_ADMIN_PASS=pape1982
```

---

## 🛠️ Commandes Utiles

```bash
# Lancer le serveur dev
npm run dev

# Compiler le projet
npm run build

# Lancer les migrations Prisma
npx prisma migrate dev

# Migrer les données JSON vers MySQL
npx ts-node scripts/migrate-json-to-db.ts

# Lancer le script admin
.\scripts\create-mysql-admin.ps1
```

---

## ❓ Troubleshooting

### L'utilisateur ne peut pas se connecter

```bash
# Vérifier que l'utilisateur existe
mysql -u root -p -e "SELECT User, Host FROM mysql.user WHERE User='papeabdoulaye';"

# Réinitialiser le mot de passe
mysql -u root -p -e "ALTER USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'pape1982'; FLUSH PRIVILEGES;"
```

### MySQL n'est pas accessible

```bash
# Vérifier l'état du service (Windows)
Get-Service MySQL80

# Redémarrer MySQL (Windows)
Stop-Service MySQL80
Start-Service MySQL80
```

### Page d'administration ne charge pas

1. Vérifier que vous êtes connecté en tant qu'admin
2. Vérifier que le token admin est en localStorage
3. Vérifier les logs du serveur: `npm run dev`

---

## 📖 Documentation Complète

Voir `ADMIN_MYSQL_SETUP.md` pour la documentation détaillée avec:
- Architecture complète
- Flux d'authentification
- Utilisation avancée
- Intégration CI/CD
- Référence SQL

---

**Configuré le:** Décembre 2025  
**Utilisateur Admin:** papeabdoulaye.gueye@uadb.edu.sn  
**Email de Contact:** papeabdoulaye.gueye@uadb.edu.sn

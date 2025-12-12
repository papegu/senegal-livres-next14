# 🗄️ Guide Complet - Gestion de la Base de Données

## 3 Stratégies pour Gérer votre Database en Production

---

## 1️⃣ PLANETSCALE (Recommandé ⭐⭐⭐⭐⭐)

### Qu'est-ce que c'est?
**Planetscale = MySQL managé dans le cloud**
- Créé par les makers de MySQL
- Automatique: backups, scaling, replicas
- Gratuit jusqu'à 5GB de données
- Parfait pour: Startups, PME, MVP

### Avantages:
```
✅ Gratuit pour démarrer (même après)
✅ Zéro maintenance
✅ Backups automatiques
✅ Scaling automatique
✅ SSL/TLS par défaut
✅ Dashboard intuitif
✅ Excellent performance (CDN global)
✅ Pas besoin de gérer les serveurs
✅ Branching (dev/test/prod)
✅ Query Analytics
```

### Coûts:
```
Free Plan:
- 5GB storage (gratuit)
- 10 millions queries/month
- 1 database

Growth Plan:
- $39/mois
- Reads/writes illimitées
- Auto-scaling
- Priorité support
```

### Guide d'installation:

#### Étape 1: Créer un compte
```
1. Aller sur https://planetscale.com
2. Sign up avec email ou GitHub
3. Vérifier email
```

#### Étape 2: Créer une database
```
1. Click "Create a database"
2. Name: senegal_livres
3. Region: Europe - Frankfurt (ou Paris)
4. Plan: Free (suffisant pour démarrer)
5. Click "Create database"
6. Attendre ~2 minutes
```

#### Étape 3: Obtenir la CONNECTION STRING
```
1. Dashboard > senegal_livres database
2. Click "Connect"
3. Sélectionner "Node.js"
4. Copier la DATABASE_URL (commence par mysql://)

Exemple:
mysql://hzxxxxxp1mye:pscale_pw_xxxxx@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict
```

#### Étape 4: Utiliser dans .env.local
```env
DATABASE_URL=mysql://hzxxxxxp1mye:pscale_pw_xxxxx@aws.connect.psdb.cloud/senegal_livres?sslaccept=strict
```

#### Étape 5: Importer le schéma
```bash
# Méthode 1: Via Prisma (recommandé)
npx prisma db push

# Méthode 2: Via Planetscale console
# 1. Dashboard > Connect > SQL Editor
# 2. Copier-coller contenu de: prisma/mysql-init.sql
# 3. Execute
```

#### Étape 6: Créer un utilisateur admin (optionnel)
```sql
-- Via Planetscale SQL Editor:
CREATE USER 'papeabdoulaye'@'%' IDENTIFIED BY 'strong_password_123';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'%';
FLUSH PRIVILEGES;
```

### Sauvegarder & Restaurer

```bash
# Export (backup)
# Planetscale Dashboard > Backups > Download

# Import (restore)
# Planetscale Dashboard > Backups > Restore
# Ou via MySQL Workbench/command line

# Via ligne de commande:
mysql -h aws.connect.psdb.cloud -u user -p senegal_livres < backup.sql
```

### Monitoring & Analytics

```
Dashboard:
1. Query Analytics: Voir les requêtes lentes
2. Performance: CPU, Memory, Connections
3. Billing: Usage vs. Quota
4. Activity: Logs de connexion
5. Settings: Backups, Replication
```

---

## 2️⃣ VERCEL POSTGRES (Alternative)

### Avantages vs Planetscale:
```
✅ Tightly integrated avec Vercel
✅ Même pricing
✅ Très facile pour Vercel deployments
⚠️ PostgreSQL, pas MySQL (nécessite adapter schema)
```

### Guide rapide:
```
1. Vercel Dashboard > Storage > Create Database
2. Select: Postgres
3. Name: senegal-livres-postgres
4. Region: EU (Frankfurt)
5. Click "Create"
6. Copy connection string
7. Update DATABASE_URL
8. Run: npx prisma db push
```

### Adapter Prisma pour PostgreSQL:

```prisma
// prisma/schema.prisma - changer le provider
datasource db {
  provider = "postgresql"  // ← changé de "mysql"
  url      = env("DATABASE_URL")
}

// Le reste reste identique!
```

---

## 3️⃣ MYSQL SUR VPS/HOSTING

### Quand utiliser?
- Vous avez déjà un VPS
- Besoin de full control
- Données très sensibles (compliance)
- Très haute performance critique

### Avantages:
```
✅ Full control
✅ Pas de vendor lock-in
✅ Peut être moins cher (long terme)
✅ Data physiquement proche (latence)
```

### Inconvénients:
```
❌ Vous gérez les backups
❌ Vous gérez les mises à jour
❌ Vous gérez la sécurité
❌ Vous gérez le scaling
❌ Maintenance 24/7 requise
```

### Installation sur VPS

#### Sur votre VPS (SSH):
```bash
# Installer MySQL
sudo apt-get update
sudo apt-get install -y mysql-server

# Démarrer MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Sécuriser l'installation
sudo mysql_secure_installation
# (Répondre yes à toutes les questions)

# Vérifier status
sudo systemctl status mysql
```

#### Créer la database:
```bash
sudo mysql

# Dans MySQL console:
CREATE DATABASE senegal_livres CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'papeabdoulaye'@'%' IDENTIFIED BY 'strong_password_123';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'%';
FLUSH PRIVILEGES;
EXIT;
```

#### Ouvrir à distance (pour Vercel):
```bash
# Éditer config MySQL
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf

# Trouver: bind-address = 127.0.0.1
# Remplacer par: bind-address = 0.0.0.0

# Redémarrer MySQL
sudo systemctl restart mysql

# Vérifier port 3306 ouvert
sudo ufw allow 3306
```

#### Connection String pour Vercel:
```env
DATABASE_URL=mysql://papeabdoulaye:strong_password_123@your_vps_ip:3306/senegal_livres
```

#### Backups automatiques:
```bash
# Créer un script de backup
sudo nano /usr/local/bin/backup-mysql.sh

#!/bin/bash
BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u papeabdoulaye -p'password' senegal_livres > $BACKUP_DIR/senegal_livres_$DATE.sql
gzip $BACKUP_DIR/senegal_livres_$DATE.sql
# Garder seulement les 30 derniers jours
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Rendre exécutable
sudo chmod +x /usr/local/bin/backup-mysql.sh

# Ajouter dans crontab (quotidien à 2h du matin)
sudo crontab -e
# Ajouter: 0 2 * * * /usr/local/bin/backup-mysql.sh
```

---

## 🔄 MIGRATION ENTRE OPTIONS

### De Planetscale à VPS (ou inversement):

```bash
# Export depuis source:
mysqldump -h source_host -u user -p'password' senegal_livres > backup.sql

# Import dans destination:
mysql -h dest_host -u user -p'password' senegal_livres < backup.sql

# Ou si Planetscale vers local:
mysql -h aws.connect.psdb.cloud -u xxx -p -D senegal_livres < backup.sql
```

---

## 📊 COMPARAISON FINALE

| Critère | Planetscale | Vercel Postgres | VPS MySQL |
|---------|-------------|-----------------|-----------|
| **Setup** | 5 min | 3 min | 30 min |
| **Coût** | Gratuit (5GB) | Gratuit (256MB) | $5-20/mo |
| **Maintenance** | 0% | 0% | 100% |
| **Scaling** | Auto | Auto | Manuel |
| **Backups** | Auto | Auto | Manuel |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Reliability** | 99.95% SLA | 99.99% | Dépend config |
| **Support** | Email/Forum | Priority | Self |
| **Idéal pour** | Startups | Vercel users | Full control |

**✅ RECOMMENDATION:** Planetscale + Vercel
- Zéro complication
- Scaling automatique
- Performant à 99.9%
- Coût très prévisible

---

## 🔐 SÉCURITÉ

### Checklist de sécurité:

```
DATABASE_URL:
☑ Contient username/password: OUI
☑ N'est JAMAIS dans GitHub: OUI
☑ N'est que dans .env.local: OUI
☑ N'est dans logs: NON
☑ SSL/TLS activé: OUI

Credentials:
☑ Mot de passe minimum 16 caractères: OUI
☑ Caractères spéciaux inclus: OUI
☑ Unique par environnement: OUI
☑ Stocké de manière sécurisée: OUI
☑ Partagé seulement avec team: OUI

Access:
☑ Firewall restrictif: OUI
☑ Connexions depuis autorisées uniquement: OUI
☑ Pas de root access depuis internet: OUI
☑ Backups chiffrés: OUI
☑ Audit logs activés: OUI
```

---

## 🆘 DÉPANNAGE

### "Connection refused"
```
❌ Vérifier:
1. DATABASE_URL est correct
2. MySQL/Planetscale est online
3. Firewall autorise la connexion
4. Pas de timeout
```

### "Too many connections"
```
❌ Solution:
1. Utiliser connection pooling (Prisma: pooled)
2. Réduire timeout
3. Upgrade plan (Planetscale)
4. Fermer connexions inutiles
```

### "Disk space full"
```
❌ Solution:
1. Nettoyer les données non essentielles
2. Archiver les vieilles transactions
3. Compresser les logs
4. Upgrade plan ou VPS
```

### "Slow queries"
```
❌ Solution:
1. Activer Query Analytics
2. Ajouter des indexes (Prisma: @@index)
3. Optimiser les requêtes N+1
4. Utiliser caching (Redis)
```

---

## 📈 MONITORING RECOMMANDÉ

**Pour Planetscale:**
```
Dashboard:
- Query Analytics (voir les requêtes lentes)
- Performance graphs (CPU, Memory)
- Billing (tracking usage)
- Activity logs (audit)
```

**Pour VPS:**
```bash
# Installer tools
sudo apt-get install -y mysqltop mytop innotop

# Monitorer en temps réel
sudo mytop -u papeabdoulaye -p

# Logs
sudo tail -f /var/log/mysql/error.log
```

---

## ✅ CHECKLIST DE DÉPLOIEMENT

- [ ] Database créée (Planetscale ou VPS)
- [ ] CONNECTION STRING obtenue
- [ ] .env.local configuré
- [ ] Schéma importé
- [ ] User admin créé
- [ ] Connection testée localement
- [ ] Backups configurés
- [ ] Monitoring activé
- [ ] Sécurité vérifiée
- [ ] Documentation sauvegardée

---

**Vous avez des questions?** Consulter DEPLOYER_SENEGAL_LIVRES.md pour le guide complet.


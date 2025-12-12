# 🚀 Guide Complet de Déploiement - senegal-livres.sn

## Vue d'ensemble

Trois options de déploiement possibles:
1. **Option A (Recommandée):** Vercel + Planetscale (MySQL managed)
2. **Option B:** Vercel + MySQL externe (VPS/Hosting)
3. **Option C:** VPS Personnel (full control)

---

## ✅ OPTION A: VERCEL + PLANETSCALE (RECOMMANDÉ)

### Avantages:
- ✅ Gratuit pour starter (small scale)
- ✅ Base de données MySQL managed
- ✅ Scaling automatique
- ✅ Backups automatiques
- ✅ Pas de maintenance serveur

### Étapes:

#### Étape 1: Préparer GitHub
```bash
# 1. Créer un dépôt GitHub public
# Aller sur https://github.com/new
# Nom: senegal-livres
# Description: E-commerce de livres sénégalais
# Public ou Private (selon votre choix)

# 2. Depuis votre machine locale:
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

# 3. Initialiser le dépôt Git (s'il n'existe pas)
git init
git add .
git commit -m "Initial commit: senegal-livres production ready"

# 4. Ajouter le remote GitHub
git remote add origin https://github.com/papegu/senegal-livres.git
git branch -M main
git push -u origin main
```

#### Étape 2: Créer Planetscale (Base de données)
```
1. Aller sur https://planetscale.com
2. Sign Up avec email
3. Créer une nouvelle database:
   - Name: senegal-livres
   - Region: Europe (pour latence basse)
   - Click "Create Database"

4. Une fois créée, aller dans "Connect"
5. Copier la connection string MySQL:
   - Format: mysql://[user]:[password]@[host]/senegal_livres
   - Cette string commence par 'mysql://'

6. Aller dans "Settings" > "Passwords"
   - Créer un password pour la production
   - Copier la DATABASE_URL complète
```

#### Étape 3: Déployer sur Vercel
```
1. Aller sur https://vercel.com
2. Sign Up avec GitHub
3. Click "Import Project"
4. Sélectionner: https://github.com/papegu/senegal-livres
5. Click "Import"
6. Configuration du projet:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
   - Install Command: npm install
```

#### Étape 4: Configurer les Variables d'Environnement
**Dans Vercel Dashboard:**
- Go to: Settings > Environment Variables
- Ajouter toutes les variables de `.env.local`:

```env
# Base de données (from Planetscale)
DATABASE_URL=mysql://[user]:[password]@[host]/senegal_livres

# Next.js
NEXT_PUBLIC_BASE_URL=https://senegal-livres.sn
NODE_ENV=production

# PayDunya
NEXT_PUBLIC_PAYDUNYA_SANDBOX_API_KEY=your_sandbox_key
NEXT_PUBLIC_PAYDUNYA_PRODUCTION_API_KEY=your_production_key
PAYDUNYA_PRIVATE_API_KEY=your_private_key
PAYDUNYA_CALLBACK_URL=https://senegal-livres.sn/api/paydunya/callback
PAYDUNYA_USE_MOCK=false

# JWT
JWT_SECRET=your_strong_jwt_secret_here_minimum_32_chars

# Admin Token
ADMIN_TOKEN=your_admin_token_here

# Optional: Email Service
RESEND_API_KEY=your_resend_key (pour emails)
SENDGRID_API_KEY=your_sendgrid_key (alternative)
```

#### Étape 5: Configurer le Domaine
**Dans Vercel:**
```
1. Settings > Domains
2. Click "Add Domain"
3. Entrer: senegal-livres.sn
4. Vercel génère des nameservers
5. Aller chez votre registrar de domaine
6. Changer les nameservers vers ceux de Vercel
7. Attendre 24-48h pour propagation DNS
```

#### Étape 6: Importer le Schéma Database
**Après que le domaine pointe vers Vercel:**
```bash
# Vous pouvez utiliser Prisma pour migrer:
npx prisma migrate deploy

# Ou manuellement via Planetscale console:
# 1. Aller dans Planetscale Dashboard
# 2. Browse > SQL Editor
# 3. Copy-paste le contenu de: prisma/mysql-init.sql
# 4. Execute
```

---

## ⚠️ OPTION B: VERCEL + MYSQL EXTERNE

### Si vous avez un VPS ou Hosting avec MySQL:

#### Étape 1: Préparer le Database
```bash
# Sur votre VPS/hosting:
# 1. Accéder à phpMyAdmin
# 2. Créer database: senegal_livres
# 3. Créer utilisateur MySQL:
#    - Username: papeabdoulaye
#    - Password: (strong password)
#    - Host: localhost ou % (pour access externe)
#    - Privileges: Tous sur senegal_livres

# 4. Importer: prisma/mysql-init.sql

# Si vous devez accéder de Vercel (external):
# - Assurez-vous que MySQL écoute sur 0.0.0.0
# - Configurez firewall pour port 3306
# - Utilisez IP publique de votre VPS dans DATABASE_URL
```

#### Étape 2: DATABASE_URL pour Vercel
```
Format:
mysql://username:password@your_vps_ip_or_domain:3306/senegal_livres

Exemple:
mysql://papeabdoulaye:strongPassword123@192.168.1.100:3306/senegal_livres
```

#### Étape 3: Même processus que Option A
- Push sur GitHub
- Importer sur Vercel
- Configurer variables d'environnement
- Configurer domaine senegal-livres.sn

---

## 🏠 OPTION C: VPS PERSONNEL (Full Control)

### Pour déploiement sur VPS avec Node.js + PM2 + MySQL:

#### Étape 1: Préparer le VPS
```bash
# SSH dans votre VPS
ssh root@your_vps_ip

# Installer Node.js (v18+)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 (process manager)
npm install -g pm2

# Installer MySQL (s'il n'existe pas)
sudo apt-get install -y mysql-server

# Installer Nginx (reverse proxy)
sudo apt-get install -y nginx

# Installer Certbot (SSL free)
sudo apt-get install -y certbot python3-certbot-nginx
```

#### Étape 2: Cloner et Préparer l'App
```bash
# Sur le VPS
cd /var/www
git clone https://github.com/papegu/senegal-livres.git
cd senegal-livres

# Installer les dépendances
npm install

# Créer .env.local
nano .env.local
# (Ajouter toutes les variables comme ci-dessus)

# Build
npm run build
```

#### Étape 3: Configurer MySQL
```bash
# Sur le VPS
sudo mysql

# Créer database et utilisateur:
CREATE DATABASE senegal_livres;
CREATE USER 'papeabdoulaye'@'localhost' IDENTIFIED BY 'strongPassword';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Importer le schéma:
mysql -u papeabdoulaye -p senegal_livres < prisma/mysql-init.sql
# (Enter password when prompted)
```

#### Étape 4: Configurer Nginx
```bash
# Créer config Nginx
sudo nano /etc/nginx/sites-available/senegal-livres

# Ajouter:
server {
    listen 80;
    server_name senegal-livres.sn www.senegal-livres.sn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Activer le site
sudo ln -s /etc/nginx/sites-available/senegal-livres /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Étape 5: SSL Certificate (Gratuit)
```bash
# Obtenir certificat SSL
sudo certbot --nginx -d senegal-livres.sn -d www.senegal-livres.sn
# (Suivre les instructions)

# Auto-renew:
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### Étape 6: Lancer l'App avec PM2
```bash
# Dans /var/www/senegal-livres
pm2 start npm --name "senegal-livres" -- start

# Sauvegarder la configuration PM2
pm2 save

# Auto-start au reboot
pm2 startup
# (Suivre les instructions)

# Vérifier le status
pm2 status
pm2 logs
```

---

## 📊 COMPARAISON DES OPTIONS

| Aspect | Option A (Vercel + Planetscale) | Option B (Vercel + VPS MySQL) | Option C (VPS Full) |
|--------|--------------------------------|-------------------------------|-------------------|
| **Coût** | Gratuit → $20/mo | Gratuit → $10/mo | $5-20/mo |
| **Facilité** | ⭐⭐⭐⭐⭐ Très facile | ⭐⭐⭐⭐ Facile | ⭐⭐ Complexe |
| **Maintenance** | Minimal | Minimal | Beaucoup |
| **Scaling** | Automatique | Manuel | Manuel |
| **Downtime** | ~0% | Dépend VPS | Dépend VPS |
| **Performance** | Excellent | Bon | Dépend config |
| **Support** | Vercel + Planetscale | Vercel only | Auto |
| **Backup** | Automatique | À configurer | À configurer |
| **SSL** | Gratuit (inclus) | Gratuit (inclus) | Gratuit (Certbot) |

**✅ RECOMMANDÉ:** Option A (Vercel + Planetscale)
- Zéro maintenance
- Scaling automatique
- Performant pour 10 000+ users
- Coût prévisible

---

## 🔄 PROCESSUS DE MISE À JOUR

Une fois déployé, pour chaque mise à jour:

### Option A & B (Vercel):
```bash
# Sur votre machine locale
git add .
git commit -m "Update: description du changement"
git push origin main

# Vercel redéploie automatiquement!
# (Regardez Vercel Dashboard pour le status)
```

### Option C (VPS):
```bash
# Sur le VPS
cd /var/www/senegal-livres
git pull origin main
npm install
npm run build
pm2 restart senegal-livres
pm2 logs
```

---

## 🧪 TESTER AVANT DEPLOYER

```bash
# Localement, simuler la production:
npm run build
npm start

# Tester les paiements:
# Aller sur http://localhost:3000/payment-sandbox
# Utiliser les test keys PayDunya

# Tester l'admin:
# Aller sur http://localhost:3000/admin/database
# Login avec l'email admin

# Vérifier logs:
# npm start affiche les erreurs en temps réel
```

---

## 🐛 DÉPANNAGE

### "Database connection failed"
```
Solution:
1. Vérifier DATABASE_URL dans .env.local
2. Vérifier que Planetscale/VPS MySQL est actif
3. Vérifier les credentials
4. Tester: mysql -u user -p -h host (s'il y a MySQL localement)
```

### "PayDunya webhook not called"
```
Solution:
1. Vérifier PAYDUNYA_CALLBACK_URL dans .env.local
2. Vérifier dans PayDunya Dashboard > Settings > Webhook
3. Vercel logs: vercel logs --tail
4. Tester avec: curl -X POST http://localhost:3000/api/paydunya/callback
```

### "Admin login failed"
```
Solution:
1. Vérifier JWT_SECRET est défini
2. Vérifier le user est en base de données
3. Vérifier role = 'admin'
4. Cookies enabled dans le navigateur?
```

### "Email not sent"
```
Solution:
1. Si RESEND_API_KEY: vérifier la clé
2. Vérifier email dans .env.local
3. Vérifier les erreurs dans logs
4. Resend Dashboard > Activity pour voir les erreurs
```

---

## 🔐 SÉCURITÉ

**Avant le déploiement, vérifier:**

- [ ] DATABASE_URL n'est PAS public
- [ ] JWT_SECRET est fort (minimum 32 caractères)
- [ ] PayDunya keys sont secrets (NEXT_PUBLIC_ seulement pour clés publiques)
- [ ] HTTPS est activé (certificat SSL valide)
- [ ] Firewall MongoDB/MySQL est restrictif
- [ ] Les mots de passe sont uniques et forts
- [ ] Les logs ne contiennent pas de données sensibles

---

## 📈 MONITORING

### Option A & B (Vercel):
- Aller sur https://vercel.com/dashboard
- Analytics > Check Real-time data
- Errors section pour les problèmes
- Click sur un deployment pour les logs détaillés

### Option C (VPS):
```bash
# Voir les logs en temps réel
pm2 logs senegal-livres

# Voir la CPU/RAM usage
pm2 monit

# Uptime et status
pm2 status
```

---

## 📞 PROCHAINES ÉTAPES

1. **Choisir l'option:** A (Vercel+Planetscale) est recommandé ✅
2. **Créer Planetscale account:** https://planetscale.com
3. **Créer Vercel account:** https://vercel.com
4. **Push sur GitHub:** Depuis votre machine locale
5. **Importer sur Vercel:** Connecter à GitHub
6. **Configurer les domaines:** Dans Vercel + PayDunya Dashboard
7. **Tester les paiements:** Avec les test keys PayDunya

---

## 🎯 CHECKLIST FINALE

- [ ] Code poussé sur GitHub
- [ ] Variables d'environnement configurées
- [ ] Database connectée et schéma importé
- [ ] PayDunya keys ajoutées
- [ ] Domain pointing correct
- [ ] SSL certificate valide
- [ ] PayDunya webhook configuré
- [ ] Admin peut se connecter
- [ ] Paiement test fonctionne
- [ ] Emails sent (si configuré)
- [ ] Logs sans erreurs critiques

---

**Besoin d'aide?** Voir DEPLOYMENT_READY.md pour plus de détails techniques.


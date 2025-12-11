# 🌐 DÉPLOYER SUR senegal-livres.sn (Domaine Waneko)

## ✅ SITUATION ACTUELLE

- ✅ Domaine acheté: `senegal-livres.sn` chez Waneko
- ✅ Sera disponible demain (24h)
- ✅ Application prête (npm run build SUCCESS)
- ✅ Code sur PC local prêt à déployer
- ❓ Besoin: Où héberger? Comment publier?

---

## 🎯 DEUX SOLUTIONS

### **OPTION A: Vercel (RECOMMANDÉ - Plus simple)**
- Gratuit, facile, auto-scaling
- Déploiement en 15 minutes
- Parfait pour Next.js

### **OPTION B: Serveur/VPS Linux**
- Plus de contrôle
- Besoin d'un serveur loué
- Plus d'administration

---

## 📋 PRÉREQUIS POUR LES DEUX OPTIONS

**Avant demain:**
1. Compte GitHub créé (gratuit)
2. Code pushé sur GitHub
3. Waneko: vérifier que domaine sera actif demain

---

# 🚀 OPTION A: VERCEL (Recommandé)

## ÉTAPE 1️⃣: Pousser code sur GitHub

### Sur votre PC (PowerShell):

```powershell
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

# Initialiser git si pas fait
git init
git config user.name "Votre Nom"
git config user.email "votre.email@gmail.com"

# Ajouter tous les fichiers
git add .

# Faire un commit
git commit -m "Production ready - senegal-livres.sn"

# Créer branche main
git branch -M main

# Ajouter repo GitHub (remplacer YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/senegal-livres-next14.git

# Pousser
git push -u origin main
```

**Entrer identifiants GitHub si demandé**

✅ Code est sur GitHub!

---

## ÉTAPE 2️⃣: Créer compte Vercel

1. Aller sur: **https://vercel.com/signup**
2. Cliquer: **"Continue with GitHub"**
3. Autoriser Vercel
4. Créer compte

✅ Vercel connecté!

---

## ÉTAPE 3️⃣: Importer projet dans Vercel

### **22:00 - Import repo**

1. Sur Vercel Dashboard: https://vercel.com/dashboard
2. Cliquer: **"Add New"** → **"Project"**
3. Sélectionner: **senegal-livres-next14** (dans la liste)
4. Cliquer: **"Import"**

Vercel va:
- Détecter Next.js
- Builder le projet automatiquement
- Vous donner une URL temporaire

**Attendre que le build finisse (2-3 min)**

✅ Projet importé et déployé!

---

## ÉTAPE 4️⃣: Ajouter variables d'environnement

### **22:15 - Configurer .env**

1. Dans Vercel: Cliquer **Settings** (en haut)
2. Aller à: **Environment Variables**
3. Ajouter ces 8 variables:

| Variable | Valeur |
|----------|--------|
| PAYDUNYA_MASTER_KEY | 8BSOwm5q-07SR-4OXj-lOAs-fe4NixX5DFy1 |
| PAYDUNYA_PUBLIC_KEY | live_public_jrMROAFL1VCYjEJz68dHHf3W8Je |
| PAYDUNYA_PRIVATE_KEY | live_private_BBM6dh9qZ1ERwIP9ukvjLYhyAbk |
| PAYDUNYA_TOKEN | nico6girugIfU7x8d1HQ |
| PAYDUNYA_CALLBACK_URL | https://senegal-livres.sn/api/paydunya/callback |
| PAYDUNYA_USE_MOCK | false |
| NEXT_PUBLIC_BASE_URL | https://senegal-livres.sn |
| NODE_ENV | production |

**Pour chaque variable:**
1. Name: (copier le nom exact)
2. Value: (copier la valeur)
3. Environment: **Production**
4. Click: **Save**

**Après avoir ajouté toutes les variables → Cliquer "Redeploy"**

✅ Variables configurées!

---

## ÉTAPE 5️⃣: Pointer le domaine Waneko vers Vercel

### **22:30 - Configuration DNS chez Waneko**

Vercel vous a donné une URL comme: `senegal-livres-next14.vercel.app`

1. **Chez Waneko:**
   - Aller sur: https://www.waneko.sn (votre compte)
   - Gérer domaine: senegal-livres.sn
   - Trouver: **DNS** ou **Nameservers**

2. **Deux options:**

### **OPTION A1: Utiliser les nameservers Vercel (RECOMMANDÉ)**

1. Dans Vercel: **Settings** → **Domains**
2. Ajouter: `senegal-livres.sn`
3. Cliquer: **Add**
4. Vercel vous donne 4 nameservers:
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```

5. Chez Waneko:
   - Modifier les **Nameservers**
   - Remplacer par les 4 de Vercel
   - Sauvegarder

**Attendre 5-15 minutes** (propagation DNS)

### **OPTION A2: Utiliser CNAME (Si Waneko n'accepte pas les nameservers)**

1. Dans Vercel: **Settings** → **Domains**
2. Ajouter: `senegal-livres.sn`
3. Vercel donne: `cname.vercel.com` (ou similaire)

4. Chez Waneko:
   - Ajouter un enregistrement DNS:
     ```
     Type: CNAME
     Name: senegal-livres.sn
     Value: cname.vercel.com
     ```
   - Sauvegarder

✅ Domaine pointé vers Vercel!

---

## ÉTAPE 6️⃣: Vérifier que tout fonctionne

### **22:45 - Test**

Ouvrir: **https://senegal-livres.sn**

Vous devriez voir:
- ✅ Page d'accueil Senegal Livres
- ✅ URL: https://senegal-livres.sn
- ✅ Cadenas vert (HTTPS sécurisé)

---

## ÉTAPE 7️⃣: Configurer PayDunya Webhook

### **22:50 - Callback URL**

1. Aller sur: https://www.paydunya.com/dashboard
2. **Settings** → **API Configuration** (ou **Webhooks**)
3. Callback URL:
   ```
   https://senegal-livres.sn/api/paydunya/callback
   ```
4. **SAVE**

✅ PayDunya configuré!

---

## ÉTAPE 8️⃣: Tester un paiement réel

### **23:00 - TEST COMPLET**

1. Aller sur: **https://senegal-livres.sn/books**
2. Ajouter un livre au panier
3. Cliquer: **Checkout**
4. Sélectionner: **💳 PayDunya**
5. Cliquer: **Pay Now**
6. Sélectionner: **Wave** (ou Orange Money)
7. Compléter le paiement
8. Voir: **✅ Payment Successful**

**Vérifications:**
- PayDunya Dashboard → Nouvelle transaction?
- data/market.json → Transaction enregistrée?

✅ **LIVE avec paiements réels!**

---

# 🖥️ OPTION B: SERVEUR/VPS LINUX

## Si vous avez un serveur loué

### **22:10 - Se connecter au serveur**

```bash
ssh root@YOUR_SERVER_IP
```

### **22:15 - Cloner le code**

```bash
cd /home
git clone https://github.com/YOUR_USERNAME/senegal-livres-next14.git
cd senegal-livres-next14
```

### **22:20 - Installer dépendances**

```bash
npm install
```

### **22:25 - Créer .env.local**

```bash
nano .env.local
```

Coller:
```env
NEXT_PUBLIC_BASE_URL=https://senegal-livres.sn
PAYDUNYA_MASTER_KEY=8BSOwm5q-07SR-4OXj-lOAs-fe4NixX5DFy1
PAYDUNYA_PUBLIC_KEY=live_public_jrMROAFL1VCYjEJz68dHHf3W8Je
PAYDUNYA_PRIVATE_KEY=live_private_BBM6dh9qZ1ERwIP9ukvjLYhyAbk
PAYDUNYA_TOKEN=nico6girugIfU7x8d1HQ
PAYDUNYA_CALLBACK_URL=https://senegal-livres.sn/api/paydunya/callback
PAYDUNYA_USE_MOCK=false
NODE_ENV=production
```

Sauvegarder: Ctrl+O, Ctrl+X

### **22:30 - Builder et démarrer**

```bash
npm run build
npm start
# Ou avec PM2:
pm2 start npm --name "senegal-livres" -- start
```

### **22:40 - Configurer HTTPS**

```bash
apt-get install certbot -y
certbot certonly --standalone -d senegal-livres.sn
```

### **22:50 - Configurer Nginx**

```bash
apt-get install nginx -y
# Configurer reverse proxy...
systemctl restart nginx
```

### **23:00 - Test**

```
https://senegal-livres.sn
```

✅ LIVE!

---

# 📊 COMPARAISON: Vercel vs Serveur

| Aspect | Vercel | Serveur |
|--------|--------|---------|
| **Prix** | Gratuit | 3-10€/mois |
| **Facilité** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Temps setup** | 15 min | 1h |
| **Maintenance** | 0 (gratuit) | À gérer |
| **Scaling** | Auto | À configurer |
| **SSL** | Gratuit auto | Gratuit (Let's Encrypt) |
| **Logs** | Dans Vercel | Terminal |
| **Idéal pour** | Production | Contrôle total |

---

# ✅ CHECKLIST DEMAIN 22h-23h

## **OPTION VERCEL (Recommandé)**

- [ ] **22:00** Code sur GitHub (git push)
- [ ] **22:05** Compte Vercel créé
- [ ] **22:10** Repo importé dans Vercel
- [ ] **22:15** Variables .env ajoutées
- [ ] **22:20** Redeploy effectué
- [ ] **22:30** Domaine Waneko pointé vers Vercel
- [ ] **22:40** Attendre propagation DNS (5-15 min)
- [ ] **22:50** Webhook PayDunya configuré
- [ ] **23:00** Test paiement réel
- [ ] **23:15** Vérifier transaction
- [ ] **23:30** ✅ LIVE!

---

# 🎯 RÉSUMÉ RAPIDE - VERCEL

```
1. GitHub:
   git push origin main

2. Vercel:
   - Importer repo
   - Ajouter 8 variables .env
   - Ajouter domaine senegal-livres.sn

3. Waneko:
   - Changer nameservers (ou CNAME)

4. PayDunya:
   - Configurer callback URL

5. TEST → LIVE! 🚀
```

---

## 🆘 QUESTIONS AVANT DEMAIN?

- Vous avez un serveur loué? → Utilisez OPTION B
- Vous voulez simple et gratuit? → Utilisez OPTION A (Vercel)
- GitHub account? → Créer sur https://github.com
- Waneko: Comment accéder aux DNS? → Regarder leur docs

**Contactez-moi si besoin de précisions! 💪**

# 🚀 DÉPLOYER SUR VERCEL - GUIDE COMPLET

## ✨ POURQUOI VERCEL?

- ✅ Next.js est créé par Vercel (optimisé parfait)
- ✅ Déploiement en 1 clic
- ✅ SSL/HTTPS gratuit et automatique
- ✅ Domaine personnalisé facile (senegal-livres.sn)
- ✅ Logs en temps réel
- ✅ Variables d'environnement sécurisées
- ✅ Gratuit pour commencer

---

## 📝 ÉTAPE 1: Créer un compte GitHub (si pas déjà)

1. Aller sur: https://github.com/signup
2. Créer compte avec email
3. Confirmer email
4. Créer nouveau repo: `senegal-livres-next14`

---

## 📦 ÉTAPE 2: Pousser votre code sur GitHub

### Sur votre PC, dans le dossier du projet:

```bash
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

# Initialiser git
git init
git add .
git commit -m "Initial commit - Production ready"

# Ajouter repo GitHub
git remote add origin https://github.com/YOUR_USERNAME/senegal-livres-next14.git
git branch -M main
git push -u origin main

# Entrer vos identifiants GitHub
```

**Résultat:** Votre code est sur GitHub! ✅

---

## 🚀 ÉTAPE 3: Connecter Vercel à GitHub

### **22:00 - Créer compte Vercel**

1. Aller sur: https://vercel.com/signup
2. Cliquer: **"Continue with GitHub"**
3. Autoriser Vercel d'accéder à vos repos
4. Créer compte

---

## ⚙️ ÉTAPE 4: Importer le projet

### **22:10 - Déployer le repo**

1. Sur Vercel dashboard: https://vercel.com/dashboard
2. Cliquer: **"Add New..."** → **"Project"**
3. Sélectionner: **senegal-livres-next14**
4. Cliquer: **"Import"**

Vercel va:
- ✅ Détecter que c'est un projet Next.js
- ✅ Configurer automatiquement
- ✅ Builder le projet

---

## 🔐 ÉTAPE 5: Ajouter variables d'environnement

### **22:20 - Configurer .env**

Dans Vercel:

1. Cliquer: **Settings** (en haut)
2. Aller à: **Environment Variables**
3. Ajouter ces variables (une par une):

```
PAYDUNYA_MASTER_KEY
8BSOwm5q-07SR-4OXj-lOAs-fe4NixX5DFy1

PAYDUNYA_PUBLIC_KEY
live_public_jrMROAFL1VCYjEJz68dHHf3W8Je

PAYDUNYA_PRIVATE_KEY
live_private_BBM6dh9qZ1ERwIP9ukvjLYhyAbk

PAYDUNYA_TOKEN
nico6girugIfU7x8d1HQ

PAYDUNYA_CALLBACK_URL
https://senegal-livres.sn/api/paydunya/callback

PAYDUNYA_USE_MOCK
false

NEXT_PUBLIC_BASE_URL
https://senegal-livres.sn

NODE_ENV
production
```

**Pour chaque variable:**
1. Name: (ex: PAYDUNYA_MASTER_KEY)
2. Value: (coller la valeur)
3. Select Environment: **Production**
4. Cliquer: **Save**

✅ Toutes les variables ajoutées!

---

## 🌐 ÉTAPE 6: Pointer le domaine

### **22:30 - Ajouter domaine personnalisé**

Dans Vercel:

1. Cliquer: **Settings** → **Domains**
2. Entrer: `senegal-livres.sn`
3. Cliquer: **Add**

Vercel vous donne:
```
Name Server 1: ns1.vercel-dns.com
Name Server 2: ns2.vercel-dns.com
Name Server 3: ns3.vercel-dns.com
Name Server 4: ns4.vercel-dns.com
```

### **Chez votre registrar (OVH, Godaddy, etc.):**

1. Aller sur: Votre compte registrar
2. Gérer le domaine: `senegal-livres.sn`
3. Trouver: **DNS Settings** ou **Nameservers**
4. Remplacer par les 4 nameservers Vercel
5. Sauvegarder

**Attendre 5-15 minutes** (propagation DNS)

---

## ✅ ÉTAPE 7: Vérifier le déploiement

### **22:45 - Tester l'app**

```
https://senegal-livres.sn
```

Vous devriez voir:
- Page d'accueil Senegal Livres ✅
- URL: https://senegal-livres.sn ✅
- HTTPS vert (cadenas) ✅

---

## 🔗 ÉTAPE 8: Configurer PayDunya Webhook

### **22:50 - Configurer callback**

1. Aller sur: https://www.paydunya.com/dashboard
2. Cliquer: **Settings** → **API Configuration**
3. Trouver: **Callback URL** ou **Webhook URL**
4. Coller:
   ```
   https://senegal-livres.sn/api/paydunya/callback
   ```
5. **SAVE**

---

## 🧪 ÉTAPE 9: Tester un paiement réel

### **23:00 - Test complet**

1. Aller sur: `https://senegal-livres.sn/books`
2. Ajouter un livre au panier
3. Cliquer: **Checkout**
4. Sélectionner: **💳 PayDunya**
5. Cliquer: **Pay Now**
6. Sélectionner: **Wave** (ou Orange Money)
7. Compléter le paiement
8. Vérifier: "✅ Payment Successful"

**Vérifier dans PayDunya Dashboard:**
- Nouvelle transaction apparaît
- Statut: "Validated" ou "Completed"

**Vérifier dans votre DB:**
- Fichier: `data/market.json`
- Transaction enregistrée avec status="validated"

✅ **VOUS ÊTES LIVE!**

---

## 🔍 SURVEILLER LES LOGS

### Voir les erreurs en temps réel:

1. Vercel Dashboard
2. Cliquer: **Deployments** (en haut)
3. Sélectionner le dernier déploiement
4. Cliquer: **Logs**

Vous verrez tous les logs (erreurs, demandes API, etc.)

---

## 🆘 TROUBLESHOOTING VERCEL

| Problème | Solution |
|----------|----------|
| Build échoue | Vérifier logs Deployments, vérifier .env |
| Domain "Pending" | Attendre 10-15 min, vérifier nameservers |
| 502 Bad Gateway | App crash - vérifier logs |
| Paiement échoue | Vérifier clés dans Settings → Environment Variables |
| Webhook pas appelé | Vérifier callback URL exacte dans PayDunya |

---

## 💾 MISES À JOUR FUTURES

Si vous changez du code:

```bash
git add .
git commit -m "Fix something"
git push origin main
```

Vercel va **automatiquement** redéployer! ✅

---

## 📊 CHECKLIST DÉPLOIEMENT

- [ ] **22:00** Créer compte Vercel
- [ ] **22:10** Importer repo senegal-livres-next14
- [ ] **22:20** Ajouter toutes les variables .env
- [ ] **22:30** Pointer domaine senegal-livres.sn
- [ ] **22:40** Attendre propagation DNS (5-15 min)
- [ ] **22:50** Configurer webhook PayDunya
- [ ] **23:00** Tester paiement réel
- [ ] **23:15** Vérifier transaction dans PayDunya
- [ ] **23:30** Vérifier logs et data/market.json

---

## 🎯 RÉSUMÉ RAPIDE

```
1. Push code sur GitHub
   git push origin main

2. Connecter Vercel à GitHub
   https://vercel.com/signup

3. Ajouter variables .env
   Settings → Environment Variables

4. Pointer domaine
   Settings → Domains → senegal-livres.sn

5. Configurer PayDunya
   Callback: https://senegal-livres.sn/api/paydunya/callback

6. TEST → LIVE! ✅
```

---

## ⏰ TIMELINE COMPLÈTE

```
22:00 - Compte Vercel créé
22:10 - Repo importé et building
22:20 - Variables .env ajoutées
22:30 - Domaine ajouté (attendre propagation)
22:50 - Webhook PayDunya configurée
23:00 - TESTE paiement réel
23:15 - Vérifié transaction
23:30 - LIVE! 🚀
```

---

## ✨ AVANTAGES VERCEL

- ✅ **Zéro maintenance** - Vercel gère les serveurs
- ✅ **Auto-scaling** - Trafic augmente? Pas de problème
- ✅ **SSL gratuit** - Certificats auto-renouvelables
- ✅ **CDN global** - Site rapide partout dans le monde
- ✅ **Logs en temps réel** - Voir ce qui se passe
- ✅ **Rollback facile** - Revenir en arrière en 1 clic
- ✅ **Intégration GitHub** - Push = Auto-déploie

---

**C'EST TOUT! Vous êtes prêt pour demain! 🎉**

Des questions sur Vercel? Demandez!

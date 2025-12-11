# 🚀 GUIDE ÉTAPE PAR ÉTAPE - SUPER SIMPLE

## ✅ VOS ÉTAPES (dans l'ordre)

1. **Sauvegarder code sur GitHub**
2. **Créer compte Vercel**
3. **Importer projet dans Vercel**
4. **Ajouter variables .env dans Vercel**
5. **Pointer senegal-livres.sn vers Vercel (DNS Waneko)**
6. **Configurer webhook PayDunya**
7. **Tester paiement sur senegal-livres.sn**

---

# ÉTAPE 1️⃣: SAUVEGARDER CODE SUR GITHUB

## 1.1 Créer compte GitHub (si pas déjà)

Aller sur: **https://github.com/signup**

- Email: votre email
- Password: un mot de passe
- Username: ex: "serigne-babacar"
- Confirmer email

✅ Compte créé!

---

## 1.2 Créer un nouveau repo GitHub

1. Aller sur: https://github.com/new
2. **Repository name:** `senegal-livres-next14`
3. **Description:** "E-commerce de livres Senegal avec paiements PayDunya"
4. Public ou Private (à vous)
5. Cliquer: **Create repository**

✅ Repo créé! Vous avez une URL comme:
```
https://github.com/YOUR_USERNAME/senegal-livres-next14
```

---

## 1.3 Pousser votre code sur GitHub (PowerShell)

### Sur votre PC:

```powershell
cd "c:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"
```

### Initialiser git:

```powershell
git init
```

### Configurer git (première fois):

```powershell
git config user.name "Votre Nom"
git config user.email "votre.email@gmail.com"
```

### Ajouter tous les fichiers:

```powershell
git add .
```

### Faire un commit:

```powershell
git commit -m "Production ready - senegal-livres.sn"
```

### Créer branche main:

```powershell
git branch -M main
```

### Ajouter le repo GitHub (remplacer YOUR_USERNAME):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/senegal-livres-next14.git
```

### Pousser sur GitHub:

```powershell
git push -u origin main
```

**Si demandé:**
- Username: votre email GitHub
- Password: votre mot de passe GitHub

✅ **Code est sur GitHub!**

Vérifier: Aller sur https://github.com/YOUR_USERNAME/senegal-livres-next14
Vous devez voir tous vos fichiers!

---

# ÉTAPE 2️⃣: CRÉER COMPTE VERCEL

## 2.1 S'inscrire sur Vercel

Aller sur: **https://vercel.com/signup**

Cliquer: **"Continue with GitHub"**

- Cliquer: **"Authorize vercel"**
- Créer compte Vercel

✅ Compte Vercel créé!

---

# ÉTAPE 3️⃣: IMPORTER PROJET DANS VERCEL

## 3.1 Importer depuis GitHub

1. Aller sur: https://vercel.com/dashboard
2. Cliquer: **"Add New"** → **"Project"**
3. Vous verrez votre repo: **senegal-livres-next14**
4. Cliquer sur ce repo
5. Cliquer: **"Import"**

**Vercel va:**
- Détecter que c'est Next.js
- Configurer automatiquement
- Builder le projet

**Attendre 2-3 minutes que le build finisse**

✅ Projet importé dans Vercel!

---

# ÉTAPE 4️⃣: AJOUTER VARIABLES .ENV DANS VERCEL

## 4.1 Ouvrir Settings dans Vercel

1. Dans Vercel Dashboard
2. Votre projet: **senegal-livres-next14**
3. Cliquer: **Settings** (en haut)

## 4.2 Aller à Environment Variables

1. À gauche: **Environment Variables**
2. Cliquer sur **"Environment Variables"**

## 4.3 Ajouter les 8 variables

**Pour chaque variable:**
1. Click: **"Add New"** ou le bouton **+**
2. **Name:** (copier exact)
3. **Value:** (copier la valeur)
4. **Environments:** Sélectionner **Production**
5. Click: **Save**

### Les 8 variables à ajouter:

```
1. Name: PAYDUNYA_MASTER_KEY
   Value: 8BSOwm5q-07SR-4OXj-lOAs-fe4NixX5DFy1

2. Name: PAYDUNYA_PUBLIC_KEY
   Value: live_public_jrMROAFL1VCYjEJz68dHHf3W8Je

3. Name: PAYDUNYA_PRIVATE_KEY
   Value: live_private_BBM6dh9qZ1ERwIP9ukvjLYhyAbk

4. Name: PAYDUNYA_TOKEN
   Value: nico6girugIfU7x8d1HQ

5. Name: PAYDUNYA_CALLBACK_URL
   Value: https://senegal-livres.sn/api/paydunya/callback

6. Name: PAYDUNYA_USE_MOCK
   Value: false

7. Name: NEXT_PUBLIC_BASE_URL
   Value: https://senegal-livres.sn

8. Name: NODE_ENV
   Value: production
```

✅ Toutes les variables ajoutées!

## 4.4 Redéployer l'app

1. Cliquer: **Deployments** (en haut)
2. Cliquer sur le dernier déploiement
3. Cliquer: **Redeploy**

**Attendre que le redeploy finisse (2-3 min)**

✅ App redeployée avec nouvelles variables!

---

# ÉTAPE 5️⃣: POINTER DOMAINE VERS VERCEL

## 5.1 Ajouter domaine dans Vercel

1. Vercel Dashboard
2. **Settings** → **Domains** (à gauche)
3. Entrer: `senegal-livres.sn`
4. Cliquer: **Add**

Vercel vous donne 4 nameservers ou un CNAME.

✅ Domaine ajouté dans Vercel!

## 5.2 Configurer chez Waneko

### Aller chez Waneko:

1. https://www.waneko.sn
2. Se connecter à votre compte
3. Domaines → **senegal-livres.sn**
4. Gérer domaine → **DNS** ou **Nameservers**

### Deux options:

### **OPTION A: Remplacer les Nameservers (Recommandé)**

Si Waneko vous permet de changer les nameservers:

Remplacer par les nameservers Vercel (que Vercel vous a donnés):
```
ns1.vercel-dns.com
ns2.vercel-dns.com
ns3.vercel-dns.com
ns4.vercel-dns.com
```

Sauvegarder.

**Attendre 5-15 minutes** (propagation DNS)

### **OPTION B: Ajouter CNAME (Si nameservers pas possible)**

Si vous ne pouvez pas changer les nameservers:

Ajouter un enregistrement DNS:
```
Type: CNAME
Name: senegal-livres.sn (ou @)
Value: cname.vercel.com (ou ce que Vercel vous donne)
TTL: 3600
```

Sauvegarder.

**Attendre 5-15 minutes** (propagation DNS)

✅ Domaine pointé vers Vercel!

---

# ÉTAPE 6️⃣: CONFIGURER PAYDUNYA WEBHOOK

## 6.1 Aller sur PayDunya

1. https://www.paydunya.com/dashboard
2. Se connecter

## 6.2 Ajouter Callback URL

1. **Settings** (ou **Configuration**)
2. Trouver: **API Configuration** ou **Webhooks**
3. Trouver: **Callback URL** ou **Webhook URL**
4. Coller:
   ```
   https://senegal-livres.sn/api/paydunya/callback
   ```
5. **SAVE**

✅ PayDunya webhook configurée!

---

# ÉTAPE 7️⃣: TESTER PAIEMENT SUR senegal-livres.sn

## 7.1 Vérifier que le domaine fonctionne

Ouvrir dans navigateur:
```
https://senegal-livres.sn
```

Vous devez voir:
- ✅ Page d'accueil Senegal Livres
- ✅ Pas d'erreur 404 ou 502
- ✅ Cadenas vert (HTTPS)

Si ça marche pas:
- Attendre 5 minutes de plus (DNS propagation)
- Vider cache navigateur (Ctrl+F5)
- Essayer avec https://www.senegal-livres.sn (avec www)

## 7.2 Tester un paiement complet

1. Ouvrir: `https://senegal-livres.sn/books`
2. Cliquer sur un livre (ou plusieurs)
3. Cliquer: **Add to Cart**
4. Cliquer: **Checkout**
5. Voir la page checkout
6. Sélectionner: **💳 PayDunya**
7. Cliquer: **Pay Now**
8. Vous êtes redirigé vers PayDunya
9. Sélectionner méthode: **Wave** ou **Orange Money**
10. Compléter paiement (utiliser numéro test si disponible)
11. Vous être redirigé vers: **Payment Successful**

✅ Paiement fonctionne!

## 7.3 Vérifications finales

**Sur PayDunya Dashboard:**
- Nouvelle transaction créée?
- Statut: "Completed" ou "Validated"?

**Sur votre PC (fichier data/market.json):**
- Transaction enregistrée dans le fichier?
- Status: "validated"?

✅ **TOUT FONCTIONNE = LIVE! 🚀**

---

# 📋 CHECKLIST FINALE

- [ ] Compte GitHub créé
- [ ] Code pushé sur GitHub
- [ ] Compte Vercel créé
- [ ] Projet importé dans Vercel
- [ ] 8 variables .env ajoutées dans Vercel
- [ ] App redeployée
- [ ] Domaine senegal-livres.sn ajouté dans Vercel
- [ ] DNS Waneko pointé vers Vercel
- [ ] Webhook PayDunya configurée
- [ ] https://senegal-livres.sn fonctionne
- [ ] Test paiement complet réussi
- [ ] ✅ LIVE!

---

# 🆘 EN CAS DE PROBLÈME

| Problème | Solution |
|----------|----------|
| "Domain not found" | Attendre 10-15 min, vider cache (Ctrl+F5) |
| "502 Bad Gateway" | Vérifier logs Vercel → Deployments |
| "Cannot find module" | Vérifier variables .env |
| "Paiement échoue" | Vérifier Callback URL exacte dans PayDunya |
| "Transaction pas enregistrée" | Vérifier logs Vercel → Deployments |

---

# ✅ C'EST TOUT!

Vous avez 7 étapes simples:

1. ✅ GitHub
2. ✅ Vercel
3. ✅ Import
4. ✅ Variables
5. ✅ Domaine
6. ✅ PayDunya
7. ✅ Test

Chaque étape = 5-10 minutes

**Total: 1h maximum!**

**Demain → LIVE! 🚀**

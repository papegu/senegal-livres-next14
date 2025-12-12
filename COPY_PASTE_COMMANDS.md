# 🔧 COPY-PASTE COMMANDS - Déployer en 1-2 heures

## ⭐ CHEMIN RECOMMANDÉ: Vercel + Planetscale

### Étape 1: Préparer GitHub (10 minutes)

**1.1 Créer GitHub account**
```
Aller sur: https://github.com
Sign up avec votre email
Confirmer l'email
```

**1.2 Créer un Personal Access Token**
```
Aller sur: https://github.com/settings/tokens
Click: "Generate new token (classic)"
Name: senegal-livres-deploy
Expiration: 90 days
Scopes: Check "repo"
Click: "Generate token"
👉 COPIER LE TOKEN (unique fois, ne le partager pas!)
```

**1.3 Créer un dépôt GitHub**
```
Aller sur: https://github.com/new
Repository name: senegal-livres
Description: E-commerce de livres sénégalais
Public: ✅ Checked
Create repository
```

---

### Étape 2: Push le code sur GitHub (15 minutes)

**2.1 Ouvrir PowerShell**

Copier-coller dans PowerShell:
```powershell
cd "C:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"
```

**2.2 Configurer Git**

```powershell
git config --global user.name "Serigne Babacar Gueye"
git config --global user.email "papeabdoulaye.gueye@uadb.edu.sn"
```

**2.3 Initialiser le dépôt local**

```powershell
git init
git add .
git commit -m "Initial commit: senegal-livres production ready"
```

**2.4 Connecter à GitHub et push**

Remplacer `YOUR_USERNAME` par votre username GitHub:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/senegal-livres.git
git branch -M main
git push -u origin main
```

À la demande:
- Username: `YOUR_USERNAME`
- Password: Le token que vous avez copié en 1.2

**2.5 Vérifier sur GitHub**

Aller sur: `https://github.com/YOUR_USERNAME/senegal-livres`

Vous devriez voir tous vos fichiers ✅

---

### Étape 3: Créer Planetscale Database (10 minutes)

**3.1 Créer Planetscale account**
```
Aller sur: https://planetscale.com
Sign up avec email ou GitHub
Vérifier email
```

**3.2 Créer une database**
```
Click: "Create a database"
Name: senegal_livres
Region: Europe - Frankfurt (ou Paris)
Plan: Free
Create database
⏳ Attendre ~2 minutes
```

**3.3 Obtenir la connection string**
```
Dans Planetscale dashboard:
Click: senegal_livres database
Click: Connect
Select: Node.js
👉 COPIER la DATABASE_URL complète
(Elle commence par: mysql://...)
```

**3.4 Importer le schéma**

Dans Planetscale:
```
Click: senegal_livres database
Click: Connect
Click: SQL Editor
```

Copier le contenu de `prisma/mysql-init.sql` et coller dans SQL Editor.
Click: Execute

**3.5 Créer un utilisateur admin**

Dans Planetscale SQL Editor, copier-coller:
```sql
CREATE USER 'papeabdoulaye'@'%' IDENTIFIED BY 'pape1982';
GRANT ALL PRIVILEGES ON senegal_livres.* TO 'papeabdoulaye'@'%';
FLUSH PRIVILEGES;
```

Click: Execute

---

### Étape 4: Déployer sur Vercel (10 minutes)

**4.1 Créer Vercel account**
```
Aller sur: https://vercel.com
Sign up avec GitHub
Confirmer email
```

**4.2 Importer le projet**
```
Click: "Import Project"
Paste URL: https://github.com/YOUR_USERNAME/senegal-livres
Click: Import
Sélectionner: Framework = Next.js
Click: Deploy
⏳ Attendre le premier build (~5-10 min)
```

---

### Étape 5: Ajouter Environment Variables (10 minutes)

**5.1 Dans Vercel Dashboard**

```
Go to: Settings > Environment Variables
```

**5.2 Ajouter les variables**

Copier-coller chaque variable une par une:

```
DATABASE_URL
(Copier de Planetscale)

NEXT_PUBLIC_BASE_URL
https://senegal-livres.sn

NODE_ENV
production

NEXT_PUBLIC_PAYDUNYA_SANDBOX_API_KEY
(Votre clé PayDunya sandbox)

NEXT_PUBLIC_PAYDUNYA_PRODUCTION_API_KEY
(Votre clé PayDunya production)

PAYDUNYA_PRIVATE_API_KEY
(Votre clé privée PayDunya)

PAYDUNYA_CALLBACK_URL
https://senegal-livres.sn/api/paydunya/callback

PAYDUNYA_USE_MOCK
false

JWT_SECRET
(Générer un secret fort: https://generate-secret.vercel.app/32)

ADMIN_TOKEN
(Générer un token)
```

Chaque fois:
- Paste la clé
- Click: Add
- Vercel va déclencher un redéploiement

**5.3 Vérifier le déploiement**

Dans Vercel Dashboard, voir:
```
Deployments > voir le dernier
Status: 🟢 Ready
```

---

### Étape 6: Configurer le Domaine (5 minutes)

**6.1 Dans Vercel**

```
Go to: Settings > Domains
Click: Add Domain
Enter: senegal-livres.sn
Click: Add
```

Vercel va vous montrer les nameservers à utiliser.

**6.2 Changer les nameservers chez votre registrar**

(Chez votre fournisseur de domaine)

Remplacer les nameservers existants par ceux de Vercel.

**⏳ ATTENDRE 24-48h pour la propagation DNS**

---

### Étape 7: Tester après propagation DNS (10 minutes)

**7.1 Vérifier la propagation**
```
Aller sur: https://mxtoolbox.com/
Entrer: senegal-livres.sn
Check: Propagation complète ✅
```

**7.2 Tester votre site**
```
Aller sur: https://senegal-livres.sn
Voir votre app ✅
```

**7.3 Configurer PayDunya Webhook**

Dashboard PayDunya:
```
Go to: Settings > Webhooks
Add Webhook:
URL: https://senegal-livres.sn/api/paydunya/callback
Save
```

**7.4 Tester les paiements**
```
Aller sur: https://senegal-livres.sn/payment-sandbox
Suivre le flow de paiement
Vérifier les logs

Vercel Dashboard > Deployments > Latest > View Function Logs
```

---

## 🎯 RÉSUMÉ DES COMMANDES (Copy-Paste)

### Partie 1: GitHub (PowerShell)

```powershell
# Aller dans le dossier du projet
cd "C:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

# Configurer Git
git config --global user.name "Serigne Babacar Gueye"
git config --global user.email "papeabdoulaye.gueye@uadb.edu.sn"

# Initialiser et commit
git init
git add .
git commit -m "Initial commit: senegal-livres production ready"

# Push (remplacer YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/senegal-livres.git
git branch -M main
git push -u origin main
```

### Partie 2: Planetscale (Web)

```
1. Créer account: https://planetscale.com
2. Créer database: senegal_livres
3. Region: Europe - Frankfurt
4. Plan: Free
5. Connect > Node.js > Copier DATABASE_URL
6. SQL Editor > Importer prisma/mysql-init.sql
7. Exécuter les CREATE USER commands
```

### Partie 3: Vercel (Web)

```
1. Créer account: https://vercel.com
2. Import Project > sélectionner GitHub repo
3. Deploy
4. Settings > Environment Variables > Ajouter toutes les vars
5. Settings > Domains > Ajouter senegal-livres.sn
```

### Partie 4: Propagation DNS (Attendre)

```
Attendre 24-48 heures que le domaine se propage
Vérifier: https://mxtoolbox.com/
Tester: https://senegal-livres.sn
```

---

## ✅ CHECKLIST RAPIDE

```
Pre-Deployment:
☑ GitHub account créé
☑ GitHub token généré
☑ GitHub repo créé
☑ Code poussé sur GitHub

Database:
☑ Planetscale account créé
☑ Database senegal_livres créée
☑ Schéma importé
☑ User admin créé
☑ DATABASE_URL copié

Vercel:
☑ Vercel account créé
☑ Project importé depuis GitHub
☑ Environment variables ajoutées
☑ Premier build réussi

Domain:
☑ Nameservers changés chez registrar
☑ DNS propagation attendue (24-48h)
☑ Site accessible sur senegal-livres.sn ✅

PayDunya:
☑ Webhook configuré
☑ Payment test réussi
☑ Admin peut se connecter

Post-Deploy:
☑ Site en ligne ✅
☑ Paiements fonctionnels ✅
☑ PDFs livrables ✅
☑ ETA calculable ✅
☑ Admin accessible ✅
```

---

## 🔄 FUTURES MISES À JOUR (super simple!)

```powershell
# À chaque fois que vous changez le code:

cd "C:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

git add .
git commit -m "Fix: description du changement"
git push origin main

# Vercel redéploie automatiquement! 🚀
# (Pas besoin de rien faire d'autre)
```

---

## 🆘 COMMANDES D'URGENCE

### Si le domaine ne fonctionne pas après 24h:

```powershell
# Vérifier la propagation
# Aller sur: https://mxtoolbox.com/
# Entrer: senegal-livres.sn
```

### Si Vercel build failed:

```
1. Vercel Dashboard > Deployments > voir le failed
2. Click sur le deployment
3. Lire les logs d'erreur
4. Corriger localement
5. git push à nouveau
```

### Si database connection error:

```
1. Vérifier DATABASE_URL exact dans Vercel
2. Settings > Environment Variables > Copier/Paste correct
3. Redéployer depuis Vercel
```

### Si PayDunya webhook not called:

```
1. Vercel logs: https://vercel.com/dashboard > Logs
2. Vérifier PAYDUNYA_CALLBACK_URL
3. Vérifier PayDunya Dashboard > Webhook URL correct
4. Test payment à nouveau
```

---

## 📞 SUPPORT

Si problème:

1. **Lire le guide complet:** `DEPLOYER_SENEGAL_LIVRES.md`
2. **Voir les logs:** Vercel Dashboard > Deployments > View Logs
3. **Consulter FAQ:** `QUICK_REFERENCE.md`
4. **Débugage:** `DATABASE_MANAGEMENT.md`

---

**C'est tout! Avec ces commandes, vous avez un déploiement complet en 1-2 heures.** 🎉

Besoin d'aide? Voir les guides détaillés listés ci-dessus.


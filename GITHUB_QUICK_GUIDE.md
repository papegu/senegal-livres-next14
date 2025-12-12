# 📤 Guide Rapide - Déployer sur GitHub

## 5 Minutes pour mettre votre code sur GitHub

### Étape 1: Créer un compte GitHub (si pas existant)
```
1. Aller sur https://github.com
2. Click "Sign up"
3. Email: votre email
4. Password: fort et unique
5. Confirmer email
```

### Étape 2: Créer un nouveau dépôt

**Via site GitHub:**
```
1. Aller sur https://github.com/new
2. Repository name: senegal-livres
3. Description: E-commerce de livres sénégalais
4. Public (pour Vercel can access) ✅
5. Click "Create repository"
6. Copier l'URL (exemple: https://github.com/YOUR_USERNAME/senegal-livres.git)
```

### Étape 3: Configurer Git localement

**Ouvrir PowerShell:**
```powershell
cd "C:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

# Si c'est le premier use de Git, configurer:
git config --global user.name "Serigne Babacar Gueye"
git config --global user.email "papeabdoulaye.gueye@uadb.edu.sn"

# Vérifier si repo existe déjà
git status

# Si erreur "not a git repository", initialiser:
git init
```

### Étape 4: Ajouter tout le code

```powershell
# Vérifier les fichiers
git status

# Ajouter tous les fichiers
git add .

# Vérifier quoi va être uploadé
git status

# Créer le premier commit
git commit -m "Initial commit: senegal-livres e-commerce platform"

# Si erreur, refaire config:
git config user.name "Serigne Babacar Gueye"
git config user.email "papeabdoulaye.gueye@uadb.edu.sn"
git commit -m "Initial commit: senegal-livres e-commerce platform"
```

### Étape 5: Connecter à GitHub

```powershell
# Ajouter le remote GitHub
git remote add origin https://github.com/YOUR_USERNAME/senegal-livres.git

# Renommer branch en "main" (si nécessaire)
git branch -M main

# Envoyer sur GitHub
git push -u origin main

# Vous allez être demandé:
# - Username: YOUR_USERNAME
# - Password: Votre token GitHub (voir ci-dessous)
```

### Authentification GitHub

**Pour l'authentification, utiliser un Personal Access Token:**

```
1. Aller sur https://github.com/settings/tokens
2. Click "Generate new token" > "Generate new token (classic)"
3. Token name: "senegal-livres-deploy"
4. Expiration: 90 days (ou No expiration)
5. Scopes: Cocher "repo"
6. Click "Generate token"
7. Copier le token (affiché une seule fois!)
8. Utiliser ce token comme "password" dans git push
```

### Étape 6: Vérifier sur GitHub

```
1. Aller sur https://github.com/YOUR_USERNAME/senegal-livres
2. Voir vos fichiers uploadés ✅
3. Branch: main
4. Commits: voir l'historique
```

---

## Pour les mises à jour futures

```powershell
# Après chaque modification:
cd "C:\Users\HP\Desktop\projet Serigne Babacar Gueye Senegal Livre\senegal-livres-next14"

# Voir les fichiers modifiés
git status

# Ajouter les modifications
git add .

# Commit avec message descriptif
git commit -m "Fix: description du changement"

# Envoyer sur GitHub
git push origin main
```

---

## Commandes utiles

```powershell
# Voir l'historique des commits
git log

# Voir les différences
git diff

# Revert le dernier commit (avant push)
git reset --soft HEAD~1

# Voir la branche actuelle
git branch

# Changer de branche
git checkout -b feature/nouvelle-feature

# Retourner à main
git checkout main

# Supprimer une branche
git branch -d feature/old-feature
```

---

## 🚨 Éviter les erreurs courantes

```
❌ Ne PAS commit:
- .env.local (secrets!)
- node_modules (too large)
- .next (build output)
- .DS_Store (macOS files)

✅ Ces fichiers sont ignorés par .gitignore (normalement)
```

---

## Après GitHub: Deployer sur Vercel

```
1. Aller sur https://vercel.com
2. Click "Import Project"
3. Sélectionner GitHub repository: senegal-livres
4. Click "Import"
5. Vercel va créer un deployment automatique!
6. À chaque git push, Vercel redéploie automatiquement
```

---

## ✅ Checklist

- [ ] Compte GitHub créé
- [ ] Dépôt créé sur GitHub
- [ ] Git configuré localement
- [ ] Code committé
- [ ] Code poussé sur GitHub
- [ ] Repository visible sur github.com
- [ ] Token généré pour Vercel (optionnel, direct via OAuth)

---

C'est tout! Votre code est maintenant sur GitHub et prêt pour Vercel. 🎉


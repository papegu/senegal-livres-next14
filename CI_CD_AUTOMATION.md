# 🔄 CI/CD - Mises à Jour Automatiques avec GitHub & Vercel

## Vue d'ensemble

Une fois sur GitHub + Vercel, vos mises à jour sont **automatiques**:

```
Workflow:
1. Vous modifiez le code localement
2. Vous faites: git push origin main
3. GitHub reçoit le code
4. Vercel voit le changement
5. Vercel rebuild automatiquement
6. Votre site se met à jour en ~5-10 minutes

❌ Pas besoin de:
- FTP/SFTP
- SSH dans le serveur
- Redémarrer manuellement
- Gérer les fichiers
```

---

## 🚀 Workflow Quotidien

### Chaque fois que vous faites un changement:

```bash
# 1. Faire le changement dans VS Code
# (Exemple: modifier app/page.tsx)

# 2. Vérifier localement
npm run dev
# (Aller sur http://localhost:3000 pour tester)

# 3. Une fois satisfait, commit et push:
git add .
git commit -m "Feature: ajouter la section FAQ"
git push origin main

# 4. C'est tout! ✅
# Vercel va builder et déployer automatiquement

# 5. Vérifier le status:
# Aller sur https://vercel.com/dashboard
# Voir le deployment en progress
```

---

## 📊 Voir le Status du Déploiement

### Option 1: Dashboard Vercel

```
1. Aller sur https://vercel.com/dashboard
2. Cliquer sur: senegal-livres (votre projet)
3. Voir la liste des deployments
4. Status:
   - 🟢 Ready = En ligne
   - 🟡 Building = En cours de construction
   - 🔴 Failed = Erreur (cliquer pour voir les logs)
5. Cliquer sur un deployment pour les détails
```

### Option 2: GitHub Actions (Logs détaillés)

```
1. Aller sur https://github.com/YOUR_USERNAME/senegal-livres
2. Click: Actions
3. Voir la liste des builds
4. Cliquer sur le build pour voir les logs détaillés
```

### Option 3: Command line (Vercel CLI)

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Voir les deployments
vercel ls

# Voir les logs du dernier deployment
vercel logs

# Rollback à une version précédente
vercel rollback
```

---

## 🔧 Configurer le CI/CD

### GitHub Actions (Gratuit, automatique)

**Fichier:** `.github/workflows/vercel.yaml`

```yaml
name: Vercel Production Deployment

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

on:
  push:
    branches:
      - main

jobs:
  Deploy-Production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install Vercel CLI
        run: npm install --global vercel@latest

      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}

      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**Setup:**
```
1. Aller sur: Settings > Secrets and variables > Actions
2. Ajouter ces secrets:
   - VERCEL_ORG_ID (de Vercel Dashboard)
   - VERCEL_PROJECT_ID (de Vercel Dashboard)
   - VERCEL_TOKEN (généré dans Vercel Settings)
3. À partir d'ici, chaque push triggère le build automatiquement
```

---

## 🧪 Tester avant de déployer

### Best practices:

```bash
# 1. Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# 2. Faire les changements
# (Éditer les fichiers dans VS Code)

# 3. Tester localement
npm run build  # Vérifier que le build passe
npm run dev    # Tester l'app

# 4. Si OK, merger vers main
git checkout main
git merge feature/nouvelle-fonctionnalite
git push origin main

# 5. Vercel déploie automatiquement

# 6. Tester en production
# Aller sur https://senegal-livres.sn
```

### Utiliser les Preview Deployments

```
1. Créer un Pull Request sur GitHub
2. Vercel crée automatiquement une Preview Deployment
3. Lien disponible dans le PR
4. Tester la preview avant de merger
5. Si OK, merger le PR
6. Vercel déploie en production

Avantages:
✅ Tester en production-like sans toucher main
✅ Collaborer avec d'autres
✅ Review avant de déployer
✅ Rollback facile
```

---

## 🚨 Gérer les Erreurs de Déploiement

### Si le build échoue:

```
1. Vercel Dashboard > voir le deployment 🔴
2. Click sur le deployment
3. Voir les logs d'erreur
4. Corriger le code localement
5. git push
6. Vercel retry automatiquement

Erreurs courantes:
- TypeError: Typo dans le code (corriger)
- Module not found: Package manquant (npm install + commit)
- Environment variable missing: Ajouter dans Vercel Settings
- Database connection failed: Vérifier DATABASE_URL
```

### Rollback rapide (revenir à version précédente):

```bash
# Via Vercel CLI
vercel rollback

# Via Dashboard:
1. Vercel Dashboard > Deployments
2. Cliquer sur un ancien deployment "Ready"
3. Click: "Promote to Production"
```

---

## 🔐 Variables d'Environnement

### Ajouter une nouvelle variable:

```
1. Vercel Dashboard > Settings > Environment Variables
2. Ajouter: KEY = VALUE
3. Sélectionner les environnements: Production / Preview / Development
4. Click "Add"
5. Déclencher un nouveau deployment (git push)
```

### Environment-specific variables:

```env
# Production (senegal-livres.sn)
DATABASE_URL=mysql://prod...
NEXT_PUBLIC_BASE_URL=https://senegal-livres.sn
NODE_ENV=production
PAYDUNYA_USE_MOCK=false

# Preview (staging.vercel.app)
DATABASE_URL=mysql://test...
NEXT_PUBLIC_BASE_URL=https://senegal-livres-preview.vercel.app
NODE_ENV=staging
PAYDUNYA_USE_MOCK=true

# Development (local)
DATABASE_URL=mysql://local...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
PAYDUNYA_USE_MOCK=true
```

---

## 📈 Monitoring & Logs

### Vercel Analytics:

```
Dashboard > Analytics:
- Real-time: Visiteurs actuels
- Traffic: Requêtes par seconde
- Performance: Response time moyenne
- Errors: Taux d'erreur
```

### Logs détaillés:

```bash
# Via CLI
vercel logs --tail  # Voir en temps réel

# Via Dashboard
# Settings > Logs & Monitoring
# Voir tous les accès et erreurs
```

### Alertes (premium):

```
Vercel Project Settings > Alerts
- Setup alerts si:
  - Build fails
  - Deployment fails
  - Error rate > 1%
  - Response time > 1000ms
```

---

## 🌿 Branching Strategy

### Recommended:

```
main (production)
  ↓ (merge PRs)
feature/xxx (développement)
  ↓ (PR créé, preview déploiement)

Workflow:
1. git checkout -b feature/ma-feature
2. Faire les changements
3. git push origin feature/ma-feature
4. Créer PR sur GitHub
5. Vercel crée preview deployment
6. Tester la preview
7. Si OK, merger le PR
8. Main branche redéploie en production
```

---

## 📝 Exemples de Commit Messages

```bash
# Features
git commit -m "feat: ajouter panier pour les utilisateurs"
git commit -m "feature: implémenter notification email"

# Bug fixes
git commit -m "fix: corriger la pagination des livres"
git commit -m "fix: admin ne pouvait pas se connecter"

# Documentation
git commit -m "docs: ajouter guide de déploiement"

# Performance
git commit -m "perf: optimiser la requête de recherche"

# Refactoring
git commit -m "refactor: simplifier le composant BookCard"

# Tests
git commit -m "test: ajouter tests pour PayDunya"
```

---

## ⏱️ Timings

```
Après git push origin main:

0-30 sec    → GitHub reçoit le code
30-60 sec   → Vercel détecte le changement
1-2 min     → Installation des dépendances
2-5 min     → Build du projet
5-10 min    → Upload des assets
10-15 min   → Déploiement en ligne
15-20 min   → Propagation CDN global

Total: ~15 minutes en général
(Peut être plus rapide si peu de changements)
```

---

## 🎯 Optimisations

### Réduire le temps de build:

```
1. Utiliser next/image pour optimiser images
2. Lazy load les dépendances
3. Utiliser incremental static regeneration
4. Minifier le CSS/JS
5. Utiliser tree-shaking

Configuration next.config.mjs:
export default {
  swcMinify: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

### Réduire la taille du bundle:

```bash
# Analyser le bundle
npm run build
npm install -g @next/bundle-analyzer

# Voir quoi prend de la place
npm run analyze
```

---

## 🔄 Rollback & Recovery

### Scénarios:

```
❌ Déploiement cassé (data lost)?
→ Vercel sauvegarde automatiquement
→ Rollback facile via Dashboard

❌ Database corrompue?
→ Planetscale: automatic backups
→ Restaurer depuis backup console

❌ PayDunya keys exposées?
→ Changer immédiatement dans PayDunya Dashboard
→ Nouveau secret dans Vercel Settings
→ Redéployer

✅ Toujours avoir:
- Code sur GitHub (backup)
- Database backups (Planetscale auto)
- Vercel deployments history (30 jours)
```

---

## 📊 Checklist

- [ ] Code sur GitHub avec main branch
- [ ] Vercel connecté à GitHub
- [ ] Auto-deployments activés
- [ ] Environment variables configurées
- [ ] Domaine senegal-livres.sn pointant vers Vercel
- [ ] CI/CD workflows en place
- [ ] Monitoring activé
- [ ] Alerts configurées
- [ ] Backup strategy définie
- [ ] Rollback testé

---

**Résumé:** Une fois sur GitHub + Vercel, tout est automatique. Vous committez, GitHub le reçoit, Vercel rebuild et déploie. C'est le workflow moderne! 🚀


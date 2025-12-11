# 📋 GUIDE DE DÉPLOIEMENT - SENEGAL LIVRES

## ✅ ÉTAT ACTUEL (12 Décembre 2025)

Le système de paiement PayDunya est **FONCTIONNEL EN MODE COMPLET**:

- ✅ API de création de facture: `/api/paydunya/create-invoice`
- ✅ Webhook de confirmation: `/api/paydunya/callback`
- ✅ Page de succès: `/payment-success?orderId=...`
- ✅ Flux complet: Création → Redirection PayDunya → Webhook → Confirmation

**Test de flux complet RÉUSSI:**
```
[1/4] Creating invoice ✅
[2/4] Transaction creation ✅
[3/4] Webhook simulation ✅
[4/4] Payment validation ✅
```

---

## 🚀 DÉPLOIEMENT EN PRODUCTION (Demain)

### Étape 1: Préparer l'environnement de production

Mettez à jour `.env.local` sur votre serveur de production:

```env
# Base URL de production
NEXT_PUBLIC_BASE_URL=https://www.senegallivres.sn

# Clés PayDunya (demander les clés PRODUCTION à PayDunya)
PAYDUNYA_MASTER_KEY=prod_master_key_xxxxx
PAYDUNYA_PUBLIC_KEY=prod_public_key_xxxxx
PAYDUNYA_PRIVATE_KEY=prod_private_key_xxxxx
PAYDUNYA_TOKEN=prod_token_xxxxx

# Callback URL pointant vers votre domaine production
PAYDUNYA_CALLBACK_URL=https://www.senegallivres.sn/api/paydunya/callback

# DÉSACTIVER le mode MOCK en production
PAYDUNYA_USE_MOCK=false

# Environnement
NODE_ENV=production
```

### Étape 2: Configurer PayDunya

1. **Se connecter au Dashboard PayDunya** (https://www.paydunya.com)
2. **Valider KYC** (Know Your Customer):
   - Fournir les documents d'identité
   - Informations bancaires
   - Documents de la société
3. **Générer les clés de PRODUCTION**
4. **Configurer l'URL de callback** dans les paramètres PayDunya:
   - Callback URL: `https://www.senegallivres.sn/api/paydunya/callback`
   - Retour URL: `https://www.senegallivres.sn/payment-success`

### Étape 3: Builder et déployer

```bash
# Sur le serveur de production
npm run build
npm start
```

### Étape 4: Tester le paiement réel

1. Aller sur: `https://www.senegallivres.sn/checkout`
2. Sélectionner "PayDunya (Wave, Orange Money, Carte)"
3. Cliquer "Pay Now"
4. Vous serez redirigé vers **PayDunya réel** qui demandera:
   - Wave Money
   - Orange Money
   - Carte Visa/Mastercard

---

## 🔧 ARCHITECTURE TECHNIQUE

### Flow de paiement

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Client clic "Pay Now" sur /checkout                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ 2. POST /api/paydunya/create-invoice                        │
│    - Crée transaction en DB (status: pending)               │
│    - Appelle API PayDunya                                   │
│    - Retourne redirect_url                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ 3. Client redirigé vers PayDunya (paiement réel)            │
│    https://app.paydunya.com/checkout/...                    │
│    - Utilisateur paye par Wave/Orange/Carte                │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ 4. PayDunya webhook POST /api/paydunya/callback             │
│    - Confirme le paiement (response_code: 00)              │
│    - Actualise transaction (status: validated)              │
│    - Redirige client vers /payment-success?orderId=...     │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│ 5. Page /payment-success                                    │
│    - Récupère transaction par orderId                       │
│    - Affiche "✅ Payment Successful"                        │
│    - Crée purchase record                                   │
│    - Accès aux livres téléchargés                          │
└─────────────────────────────────────────────────────────────┘
```

### Fichiers clés du système de paiement

```
app/
├── api/
│   └── paydunya/
│       ├── create-invoice/route.ts    → Crée facture PayDunya
│       └── callback/route.ts           → Webhook PayDunya
├── payment-success/page.tsx            → Page après succès
├── payment-cancel/page.tsx             → Page après annulation
└── checkout/page.tsx                   → Sélection du mode de paiement
```

---

## ⚙️ VARIABLES D'ENVIRONNEMENT

### Configuration actuelle (DÉVELOPPEMENT)

```env
# Mode test avec simulation (localhost)
PAYDUNYA_USE_MOCK=true
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Configuration pour production

```env
# Mode réel avec PayDunya
PAYDUNYA_USE_MOCK=false
NEXT_PUBLIC_BASE_URL=https://www.senegallivres.sn
```

---

## 🧪 TESTS AVANT DÉPLOIEMENT

### Test 1: Vérifier que toutes les routes compilent

```bash
npm run build
```

### Test 2: Tester le flux en mode MOCK (développement)

```bash
# .env.local doit avoir PAYDUNYA_USE_MOCK=true
npm run dev
# Ouvrir http://localhost:3000/checkout
# Sélectionner PayDunya → voir la page mock
```

### Test 3: Tester le flux en mode RÉEL (production)

```bash
# .env.local doit avoir PAYDUNYA_USE_MOCK=false
# Doit avoir les clés PayDunya de production
npm start
# Tester avec une vraie carte/Wave/Orange Money
```

---

## 🆘 DÉPANNAGE

### ❌ Erreur: "PayDunya not configured"

**Cause:** Les clés d'environnement ne sont pas définies

**Solution:** Vérifiez `.env.local` contient:
- `PAYDUNYA_MASTER_KEY`
- `PAYDUNYA_PUBLIC_KEY`
- `PAYDUNYA_PRIVATE_KEY`
- `PAYDUNYA_TOKEN`

### ❌ Erreur: "response_code: 1001" (KYC validation required)

**Cause:** Votre compte PayDunya n'a pas validé KYC

**Solutions:**
1. Valider KYC sur le Dashboard PayDunya
2. OU utiliser `PAYDUNYA_USE_MOCK=true` pour tester en développement

### ❌ Le webhook ne met pas à jour la transaction

**Cause:** L'orderId ne correspond pas

**Vérification:** Regardez les logs du serveur pour voir si l'orderId est reçu correctement dans le webhook

---

## 📊 MONITORING EN PRODUCTION

### Logs à surveiller

```bash
# Logs PayDunya en production
[PayDunya] Create invoice error:
[PayDunya Callback] Payment validated:
[PayDunya Callback] Transaction updated:
```

### Vérifier les transactions

Ouvrir `data/market.json` et regarder l'array `transactions`:

```json
{
  "transactions": [
    {
      "id": "...",
      "orderId": "...",
      "status": "validated",  // ← Doit être "validated" après paiement
      "amount": 5000,
      "paymentMethod": "paydunya",
      "createdAt": "...",
      "updatedAt": "...",
      "paymentConfirmedAt": "..."
    }
  ]
}
```

---

## ✅ CHECKLIST DÉPLOIEMENT

- [ ] Valider KYC sur PayDunya (si pas fait)
- [ ] Obtenir les clés de PRODUCTION de PayDunya
- [ ] Mettre à jour `.env.local` avec domaine `https://www.senegallivres.sn`
- [ ] Configurer callback URL dans PayDunya Dashboard
- [ ] Définir `PAYDUNYA_USE_MOCK=false`
- [ ] `npm run build` - vérifier pas d'erreurs
- [ ] `npm start` - démarrer le serveur
- [ ] Tester un paiement complet avec vraie carte/Wave/Orange
- [ ] Vérifier que la transaction apparaît dans `data/market.json` avec status "validated"
- [ ] Vérifier que l'utilisateur peut télécharger les livres après paiement

---

## 📞 CONTACT

En cas de problème avec PayDunya:
- Dashboard: https://www.paydunya.com
- Support: support@paydunya.com
- Docs: https://paydunya.com/docs

---

**Statut:** ✅ Prêt pour déploiement
**Date:** 12 Décembre 2025
**Système:** Senegal Livres - Next.js 14

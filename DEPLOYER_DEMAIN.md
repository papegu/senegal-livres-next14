# 📦 GUIDE DÉPLOIEMENT - senegal-livres.sn

## ⏰ TIMELINE: DEMAIN 22h-23h

---

## 🔧 PRÉREQUIS

Avant demain 22h, vérifiez:
- ✅ Serveur/VPS loué et accessible
- ✅ Domaine senegal-livres.sn pointant vers votre serveur (IP)
- ✅ Node.js v18+ installé sur le serveur
- ✅ npm/yarn installé
- ✅ Port 80 (HTTP) et 443 (HTTPS) accessibles

---

## 📍 OPTION 1: Déployer sur VPS/Serveur Linux

### **22:00 - Vérifier que le domaine est actif**

Sur votre PC:
```bash
nslookup senegal-livres.sn
# Doit retourner l'IP de votre serveur
```

### **22:05 - Se connecter au serveur**

```bash
ssh root@senegal-livres.sn
# Ou: ssh root@YOUR_SERVER_IP
# Entrer le mot de passe
```

### **22:10 - Cloner le code sur le serveur**

```bash
cd /home
git clone https://github.com/VOTRE_GITHUB/senegal-livres-next14.git
# Ou copier les fichiers avec SCP/SFTP

cd senegal-livres-next14
```

### **22:15 - Installer les dépendances**

```bash
npm install
```

### **22:25 - Créer le fichier .env.local sur le serveur**

```bash
nano .env.local
```

Coller ce contenu:
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

**Pour sauvegarder dans nano:**
- Ctrl + O → Enter
- Ctrl + X

### **22:30 - Builder l'application**

```bash
npm run build
# Attendre ~2 minutes
```

### **22:35 - Démarrer l'application**

**Option A: Avec PM2 (recommandé - persist après fermeture terminal)**
```bash
npm install -g pm2
pm2 start npm --name "senegal-livres" -- start
pm2 save
pm2 startup
```

**Option B: En direct (simple)**
```bash
npm start
# Garder la fenêtre OUVERTE
```

### **22:40 - Vérifier que ça fonctionne**

```bash
curl http://localhost:3000
# Doit retourner du HTML (pas d'erreur)
```

### **22:45 - Configurer HTTPS avec Let's Encrypt**

```bash
apt-get install certbot python3-certbot-nginx -y
certbot certonly --standalone -d senegal-livres.sn
# Répondre aux questions
```

### **22:50 - Mettre en place Nginx reverse proxy**

```bash
apt-get install nginx -y
nano /etc/nginx/sites-available/default
```

Remplacer par:
```nginx
server {
    listen 80;
    server_name senegal-livres.sn;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name senegal-livres.sn;
    
    ssl_certificate /etc/letsencrypt/live/senegal-livres.sn/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/senegal-livres.sn/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Sauvegarder (Ctrl + O, Ctrl + X)

```bash
nginx -t
systemctl restart nginx
```

### **23:00 - TESTER LIVE**

Depuis votre PC:
```bash
https://senegal-livres.sn/checkout
```

✅ Doit charger l'application en HTTPS!

---

## 📍 OPTION 2: Déployer sur Vercel (PLUS SIMPLE)

### **22:00 - Créer compte Vercel**

Aller sur: https://vercel.com/signup

### **22:10 - Configurer le projet**

```bash
npm i -g vercel
vercel login
# Se connecter avec GitHub
```

### **22:15 - Déployer**

```bash
vercel --prod
# Répondre aux questions:
# - Use existing project? No
# - Project name: senegal-livres
# - Framework: Next.js
# - Root: . (point)
```

### **22:30 - Ajouter variables d'environnement**

Sur vercel.com → Project Settings → Environment Variables

Ajouter:
```
PAYDUNYA_MASTER_KEY=8BSOwm5q-07SR-4OXj-lOAs-fe4NixX5DFy1
PAYDUNYA_PUBLIC_KEY=live_public_jrMROAFL1VCYjEJz68dHHf3W8Je
PAYDUNYA_PRIVATE_KEY=live_private_BBM6dh9qZ1ERwIP9ukvjLYhyAbk
PAYDUNYA_TOKEN=nico6girugIfU7x8d1HQ
PAYDUNYA_CALLBACK_URL=https://senegal-livres.sn/api/paydunya/callback
PAYDUNYA_USE_MOCK=false
```

### **22:40 - Pointer le domaine vers Vercel**

1. Sur votre registrar (OVH, Godaddy, etc.):
2. DNS settings
3. Ajouter CNAME:
   ```
   Name: senegal-livres.sn
   Value: cname.vercel.com
   ```

### **23:00 - TESTER**

```
https://senegal-livres.sn/checkout
```

✅ Prêt!

---

## 🔗 CONFIGURATION PAYDUNYA (LES DEUX OPTIONS)

Peu importe où vous déployez, demain à 22h45:

1. Aller sur: https://www.paydunya.com/dashboard
2. Settings → API Configuration
3. Callback URL:
   ```
   https://senegal-livres.sn/api/paydunya/callback
   ```
4. SAVE

---

## ✅ CHECKLIST DEMAIN

### **22:00**
- [ ] Domaine `senegal-livres.sn` actif (vérifier avec nslookup)
- [ ] Serveur accessible

### **22:30**
- [ ] Code sur serveur / Vercel
- [ ] .env.local créé avec clés production
- [ ] npm install terminé
- [ ] npm run build SUCCESS

### **22:45**
- [ ] Application accessible via https://senegal-livres.sn
- [ ] Callback URL configurée dans PayDunya

### **23:00**
- [ ] Tester un paiement réel
- [ ] Vérifier transaction dans PayDunya Dashboard
- [ ] Vérifier données sauvegardées dans data/market.json

---

## 🚨 TROUBLESHOOTING

| Problème | Solution |
|----------|----------|
| "Domain not found" | Attendre 10-15 min, vérifier DNS |
| "Connection refused" | Vérifier que app est lancée (npm start) |
| "HTTPS not working" | Vérifier certificat SSL (Let's Encrypt) |
| "Paiement échoue" | Vérifier clés dans .env.local |
| "Webhook pas appelé" | Vérifier URL exacte dans PayDunya |

---

## 💡 TIPS

- **Backup avant:**
  ```bash
  zip -r backup.zip .
  ```

- **Voir les logs en direct:**
  ```bash
  pm2 logs senegal-livres
  # Ou pour Node direct:
  tail -f /var/log/app.log
  ```

- **Tuer un process:**
  ```bash
  lsof -i :3000
  kill -9 PID
  ```

- **Tester API rapidement:**
  ```bash
  curl -X POST https://senegal-livres.sn/api/paydunya/create-invoice \
    -H "Content-Type: application/json" \
    -d '{"amount":5000,"bookIds":["test"]}'
  ```

---

## 📞 EN CAS DE BLOCAGE

**Vérifier logs:**
```bash
npm run build 2>&1 | tail -50
# Ou:
journalctl -u nginx -n 50
```

**Vérifier connectivité:**
```bash
curl https://senegal-livres.sn
# Doit retourner du HTML
```

**Vérifier PayDunya:**
- Aller sur https://www.paydunya.com/dashboard
- Vérifier clés
- Vérifier Callback URL

---

**VOUS ÊTES PRÊT! 🚀**

Choisissez votre option (VPS = plus de contrôle, Vercel = plus simple), suivez les étapes, et à 23h vous serez LIVE!

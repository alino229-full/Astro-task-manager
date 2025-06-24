# 🚀 Guide de Déploiement VPS Hostinger - Application Astro avec Actions

Ce guide vous permet de déployer votre application Astro avec Actions serveur sur un VPS Hostinger personnel.

## 📋 Prérequis

- Un VPS Hostinger (plan KVM recommandé)
- Un nom de domaine (optionnel mais recommandé)
- Une application Astro avec l'adaptateur Node.js configuré
- Accès SSH à votre VPS

## 🛠️ Étape 1 : Configuration de Base du VPS

### 1.1 Connexion SSH
```bash
ssh root@votre-ip-vps
```

### 1.2 Mise à jour du système
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3 Installation des dépendances essentielles
```bash
# Installation de Git, Curl et autres outils
sudo apt install -y git curl build-essential

# Installation de Node.js (version LTS recommandée)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Installation de PM2 (gestionnaire de processus)
sudo npm install -g pm2

# Installation de Nginx (serveur web/proxy)
sudo apt install -y nginx

# Vérification des versions
node -v
npm -v
pm2 -v
```

## 🏗️ Étape 2 : Préparation de l'Application

### 2.1 Création du répertoire de déploiement
```bash
# Créer le répertoire pour votre application
sudo mkdir -p /var/www/votre-app
sudo chown -R $USER:$USER /var/www/votre-app
cd /var/www/votre-app
```

### 2.2 Clonage du repository
```bash
# Cloner votre repository (remplacez par votre URL)
git clone https://github.com/votre-username/votre-repo.git .

# Ou télécharger les fichiers via SCP/SFTP si pas de Git
```

### 2.3 Installation et build
```bash
# Installation des dépendances
npm install

# Build de l'application Astro (avec base de données locale)
npm run build

# Alternative : Build avec Astro Studio (si configuré)
# npm run build:remote
```

**Note importante pour Astro DB :** Le build utilise une base de données locale (`.astro/content.db`). Pour la production, vous pouvez soit :
- Utiliser la base de données locale (recommandé pour débuter)
- Configurer [Astro Studio](https://docs.astro.build/en/guides/astro-db/) ou [Turso](https://docs.astro.build/en/guides/astro-db/#connect-a-libsql-database-for-production) pour une base de données distante

## ⚙️ Étape 3 : Configuration PM2

### 3.1 Fichier de configuration PM2
Créez un fichier `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [{
    name: 'astro-app',
    script: './dist/server/entry.mjs',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0'
    }
  }]
};
```

### 3.2 Démarrage avec PM2
```bash
# Démarrer l'application
pm2 start ecosystem.config.js --env production

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup
# Suivre les instructions affichées pour exécuter la commande sudo
```

### 3.3 Commandes PM2 utiles
```bash
# Voir le statut des applications
pm2 status

# Voir les logs
pm2 logs astro-app

# Redémarrer l'application
pm2 restart astro-app

# Arrêter l'application
pm2 stop astro-app

# Supprimer l'application de PM2
pm2 delete astro-app
```

## 🌐 Étape 4 : Configuration Nginx

### 4.1 Création du fichier de configuration Nginx
```bash
sudo nano /etc/nginx/sites-available/votre-app
```

Contenu du fichier :
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    
    # Gestion des fichiers statiques
    location /_astro/ {
        alias /var/www/votre-app/dist/client/_astro/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }
    
    location /assets/ {
        alias /var/www/votre-app/dist/client/assets/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy vers l'application Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Gestion des erreurs
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

### 4.2 Activation de la configuration
```bash
# Créer un lien symbolique
sudo ln -s /etc/nginx/sites-available/votre-app /etc/nginx/sites-enabled/

# Supprimer la configuration par défaut si nécessaire
sudo rm /etc/nginx/sites-enabled/default

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Étape 5 : Configuration SSL avec Let's Encrypt (Optionnel)

### 5.1 Installation de Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 5.2 Obtention du certificat SSL
```bash
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

### 5.3 Renouvellement automatique
```bash
# Test du renouvellement
sudo certbot renew --dry-run

# Le renouvellement automatique est configuré via cron
```

## 🛡️ Étape 6 : Configuration du Firewall

### 6.1 Configuration UFW (Ubuntu Firewall)
```bash
# Activer UFW
sudo ufw enable

# Autoriser SSH
sudo ufw allow ssh

# Autoriser HTTP et HTTPS
sudo ufw allow 'Nginx Full'

# Vérifier le statut
sudo ufw status
```

## 💾 Étape 7 : Gestion de la Base de Données

### 7.1 Base de données locale (par défaut)
La base de données SQLite locale est créée automatiquement dans `.astro/content.db` lors du build et est incluse dans le déploiement.

### 7.2 Sauvegarde de la base de données
```bash
# Créer une sauvegarde de la base de données
cp /var/www/votre-app/.astro/content.db /var/www/votre-app/backups/content_$(date +%Y%m%d_%H%M%S).db
```

### 7.3 Migration vers une base de données distante (optionnel)
Pour une base de données partagée ou plus robuste, consultez la [documentation Astro DB](https://docs.astro.build/en/guides/astro-db/#connect-a-libsql-database-for-production) pour configurer Turso ou Astro Studio.

## 🔄 Étape 8 : Script de Déploiement Automatisé

Créez un script `deploy.sh` pour automatiser les mises à jour :

```bash
#!/bin/bash
set -e

echo "🚀 Début du déploiement..."

# Aller dans le répertoire de l'application
cd /var/www/votre-app

# Sauvegarder la version actuelle
echo "📦 Sauvegarde de la version actuelle..."
cp -r dist dist_backup_$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Mise à jour du code
echo "📥 Mise à jour du code..."
git pull origin main

# Installation des nouvelles dépendances
echo "📦 Installation des dépendances..."
npm ci --production

# Build de l'application
echo "🏗️ Build de l'application..."
npm run build

# Redémarrage de l'application
echo "🔄 Redémarrage de l'application..."
pm2 restart astro-app

# Vérification du statut
echo "✅ Vérification du statut..."
pm2 status

echo "🎉 Déploiement terminé avec succès !"
```

Rendre le script exécutable :
```bash
chmod +x deploy.sh
```

## 📊 Étape 9 : Monitoring et Logs

### 9.1 Monitoring avec PM2
```bash
# Interface de monitoring PM2
pm2 monit

# Logs en temps réel
pm2 logs --lines 200
```

### 9.2 Logs Nginx
```bash
# Logs d'accès
sudo tail -f /var/log/nginx/access.log

# Logs d'erreur
sudo tail -f /var/log/nginx/error.log
```

## 🚨 Dépannage

### Problèmes courants et solutions

#### 1. L'application ne démarre pas
```bash
# Vérifier les logs PM2
pm2 logs astro-app

# Vérifier si le port est utilisé
sudo netstat -tlnp | grep :3000

# Redémarrer PM2
pm2 restart astro-app
```

#### 2. Erreur 502 Bad Gateway
```bash
# Vérifier que l'application tourne
pm2 status

# Vérifier la configuration Nginx
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
```

#### 3. Actions Astro ne fonctionnent pas
- Vérifier que `output: 'hybrid'` dans `astro.config.mjs`
- Vérifier que l'adaptateur `@astrojs/node` est installé
- Contrôler les logs pour les erreurs JavaScript

#### 4. Problèmes de permissions
```bash
# Corriger les permissions
sudo chown -R $USER:$USER /var/www/votre-app
chmod -R 755 /var/www/votre-app
```

## 🔧 Variables d'Environnement

### Gestion des variables d'environnement avec PM2
Créez un fichier `.env` :
```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
DATABASE_URL=your_database_url_here
```

Mise à jour du `ecosystem.config.js` :
```javascript
module.exports = {
  apps: [{
    name: 'astro-app',
    script: './dist/server/entry.mjs',
    env_file: '.env',
    // ... reste de la configuration
  }]
};
```

## 📈 Optimisations de Performance

### 1. Compression Gzip dans Nginx
Ajoutez dans votre configuration Nginx :
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### 2. Cache des fichiers statiques
Déjà configuré dans la configuration Nginx ci-dessus.

### 3. Monitoring des ressources
```bash
# Installer htop pour monitoring
sudo apt install htop

# Utiliser htop
htop
```

## ✅ Checklist de Déploiement

- [ ] VPS configuré et mis à jour
- [ ] Node.js et PM2 installés
- [ ] Application clonée et buildée
- [ ] PM2 configuré et application démarrée
- [ ] Nginx configuré et redémarré
- [ ] SSL configuré (si domaine)
- [ ] Firewall configuré
- [ ] Script de déploiement créé
- [ ] Monitoring configuré
- [ ] Tests de fonctionnement effectués

## 🎯 Test Final

1. Visitez votre domaine ou IP
2. Testez les Actions Astro (CRUD des projets)
3. Vérifiez les logs : `pm2 logs astro-app`
4. Testez la performance avec un outil en ligne

---

**🎉 Félicitations ! Votre application Astro avec Actions est maintenant déployée sur votre VPS Hostinger !**

Pour toute question ou problème, consultez les logs et n'hésitez pas à adapter ce guide selon vos besoins spécifiques. 
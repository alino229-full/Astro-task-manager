#!/bin/bash

# Script de déploiement automatisé pour VPS Hostinger
# Usage: ./deploy-to-vps.sh [IP_VPS] [USERNAME] [APP_NAME]

set -e

# Configuration par défaut (modifiez selon vos besoins)
VPS_IP=${1:-"VOTRE_IP_VPS"}
VPS_USER=${2:-"root"}
APP_NAME=${3:-"astro-app"}
APP_PATH="/var/www/$APP_NAME"

echo "🚀 Début du déploiement vers $VPS_USER@$VPS_IP:$APP_PATH"

# Vérification des prérequis
if [ "$VPS_IP" = "VOTRE_IP_VPS" ]; then
    echo "❌ Veuillez spécifier l'IP de votre VPS"
    echo "Usage: ./deploy-to-vps.sh IP_VPS [USERNAME] [APP_NAME]"
    exit 1
fi

# 1. Build local
echo "📦 Build de l'application..."
npm run build

# 2. Création de l'archive (sans node_modules)
echo "📁 Création de l'archive..."
tar --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.astro/cache' \
    --exclude='*.log' \
    -czf deploy.tar.gz \
    dist/ package.json package-lock.json db/ src/ astro.config.mjs tsconfig.json

# 3. Envoi vers le VPS
echo "📤 Envoi vers le VPS..."
scp deploy.tar.gz $VPS_USER@$VPS_IP:/tmp/

# 4. Déploiement sur le VPS
echo "🔧 Déploiement sur le VPS..."
ssh $VPS_USER@$VPS_IP << EOF
    # Créer le répertoire si nécessaire
    sudo mkdir -p $APP_PATH
    sudo chown -R \$USER:\$USER $APP_PATH
    
    # Sauvegarder l'ancienne version
    if [ -d "$APP_PATH/dist" ]; then
        sudo cp -r $APP_PATH/dist $APP_PATH/dist_backup_\$(date +%Y%m%d_%H%M%S) 2>/dev/null || true
    fi
    
    # Extraire la nouvelle version
    cd $APP_PATH
    tar -xzf /tmp/deploy.tar.gz
    
    # Installer les dépendances
    npm ci --production
    
    # Redémarrer l'application avec PM2
    pm2 restart $APP_NAME || pm2 start dist/server/entry.mjs --name "$APP_NAME" --env production
    
    # Nettoyer
    rm /tmp/deploy.tar.gz
    
    echo "✅ Déploiement terminé !"
    pm2 status
EOF

# 5. Nettoyage local
rm deploy.tar.gz

echo "🎉 Déploiement réussi ! Votre application est accessible sur http://$VPS_IP:3000" 
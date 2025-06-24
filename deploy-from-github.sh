#!/bin/bash

# Script de déploiement depuis GitHub vers VPS
# À exécuter directement sur le VPS
# Usage: ./deploy-from-github.sh

set -e

# Configuration
APP_PATH="/var/www/astro-vps-manager"
APP_NAME="astro-vps-manager"
GITHUB_REPO="https://github.com/alino229-full/Astro-task-manager.git"

echo "🚀 Début du déploiement depuis GitHub"

# Vérifier si le répertoire existe
if [ ! -d "$APP_PATH" ]; then
    echo "📁 Création du répertoire d'application..."
    sudo mkdir -p $APP_PATH
    sudo chown -R $USER:$USER $APP_PATH
    
    echo "📥 Clonage du repository..."
    git clone $GITHUB_REPO $APP_PATH
    cd $APP_PATH
else
    echo "📥 Mise à jour du code depuis GitHub..."
    cd $APP_PATH
    
    # Sauvegarder les changements locaux si nécessaire
    git stash
    
    # Tirer les dernières modifications
    git pull origin main
fi

echo "📦 Installation des dépendances..."
npm ci --production

echo "🔨 Build de l'application..."
npm run build

echo "🔄 Redémarrage de l'application avec PM2..."
# Redémarrer ou démarrer l'application
pm2 restart $APP_NAME || pm2 start ecosystem.config.js --env production

# Sauvegarder la configuration PM2
pm2 save

echo "✅ Déploiement terminé !"
echo "📊 Statut de l'application :"
pm2 status

echo "🌐 Application accessible sur http://$(curl -s ifconfig.me):3000" 
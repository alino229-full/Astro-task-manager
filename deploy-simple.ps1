# Script de déploiement simplifié pour diagnostic
param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIP,
    
    [Parameter(Mandatory=$false)]
    [string]$VpsUser = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "astro-app"
)

Write-Host "🚀 Début du déploiement vers $VpsUser@$VpsIP" -ForegroundColor Green

# 1. Test de connexion SSH
Write-Host "🔍 Test de connexion SSH..." -ForegroundColor Yellow
try {
    $testResult = & ssh "$VpsUser@$VpsIP" "echo 'SSH OK'"
    Write-Host "✅ Connexion SSH réussie: $testResult" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de connexion SSH: $_" -ForegroundColor Red
    exit 1
}

# 2. Build local
Write-Host "📦 Build de l'application..." -ForegroundColor Yellow
try {
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE"
    }
    Write-Host "✅ Build réussi" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du build: $_" -ForegroundColor Red
    exit 1
}

# 3. Création de l'archive
Write-Host "📁 Création de l'archive..." -ForegroundColor Yellow
try {
    $TempDir = "temp_deploy"
    if (Test-Path $TempDir) { Remove-Item -Recurse -Force $TempDir }
    New-Item -ItemType Directory -Path $TempDir | Out-Null

    # Copier les fichiers essentiels
    Copy-Item -Path "dist" -Destination "$TempDir/" -Recurse
    Copy-Item -Path "package.json" -Destination "$TempDir/"
    Copy-Item -Path "package-lock.json" -Destination "$TempDir/"
    
    # Créer l'archive
    Compress-Archive -Path "$TempDir\*" -DestinationPath "deploy.zip" -Force
    Write-Host "✅ Archive créée: deploy.zip" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création de l'archive: $_" -ForegroundColor Red
    exit 1
}

# 4. Test SCP
Write-Host "📤 Test de transfert SCP..." -ForegroundColor Yellow
try {
    & scp "deploy.zip" "$VpsUser@$VpsIP":/tmp/
    if ($LASTEXITCODE -ne 0) {
        throw "SCP failed with exit code $LASTEXITCODE"
    }
    Write-Host "✅ Transfert SCP réussi" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur SCP: $_" -ForegroundColor Red
    Write-Host "💡 Vérifiez que SCP est installé et que les clés SSH sont configurées" -ForegroundColor Yellow
    exit 1
}

# 5. Déploiement basique sur le VPS
Write-Host "🔧 Déploiement sur le VPS..." -ForegroundColor Yellow
$AppPath = "/var/www/$AppName"

try {
    # Créer le répertoire
    & ssh "$VpsUser@$VpsIP" "sudo mkdir -p $AppPath && sudo chown -R `$USER:`$USER $AppPath"
    
    # Extraire l'archive
    & ssh "$VpsUser@$VpsIP" "cd $AppPath && unzip -o /tmp/deploy.zip"
    
    # Installer les dépendances
    & ssh "$VpsUser@$VpsIP" "cd $AppPath && npm ci --production"
    
    # Démarrer avec PM2
    & ssh "$VpsUser@$VpsIP" "cd $AppPath && pm2 restart $AppName || pm2 start dist/server/entry.mjs --name '$AppName'"
    
    # Nettoyer
    & ssh "$VpsUser@$VpsIP" "rm /tmp/deploy.zip"
    
    Write-Host "✅ Déploiement terminé" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du déploiement: $_" -ForegroundColor Red
    exit 1
}

# 6. Nettoyage local
Remove-Item -Force "deploy.zip" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force $TempDir -ErrorAction SilentlyContinue

Write-Host "🎉 Déploiement réussi ! Votre application devrait être accessible sur http://$VpsIP`:3000" -ForegroundColor Green 
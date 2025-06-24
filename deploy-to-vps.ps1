# Script de déploiement PowerShell pour VPS Hostinger
# Usage: .\deploy-to-vps.ps1 -VpsIP "IP_VPS" -VpsUser "USERNAME" -AppName "APP_NAME"

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsIP,
    
    [Parameter(Mandatory=$false)]
    [string]$VpsUser = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$AppName = "astro-app"
)

$AppPath = "/var/www/$AppName"

Write-Host "🚀 Début du déploiement vers $VpsUser@$VpsIP`:$AppPath" -ForegroundColor Green

# 1. Build local
Write-Host "📦 Build de l'application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

# 2. Création de l'archive avec PowerShell
Write-Host "📁 Création de l'archive..." -ForegroundColor Yellow

# Créer un dossier temporaire pour l'archive
$TempDir = "temp_deploy"
if (Test-Path $TempDir) { Remove-Item -Recurse -Force $TempDir }
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copier les fichiers nécessaires
Copy-Item -Path "dist" -Destination "$TempDir/" -Recurse
Copy-Item -Path "package.json" -Destination "$TempDir/"
Copy-Item -Path "package-lock.json" -Destination "$TempDir/"
Copy-Item -Path "db" -Destination "$TempDir/" -Recurse
Copy-Item -Path "astro.config.mjs" -Destination "$TempDir/"
Copy-Item -Path "tsconfig.json" -Destination "$TempDir/"

# Créer l'archive
Compress-Archive -Path "$TempDir\*" -DestinationPath "deploy.zip" -Force

# 3. Envoi vers le VPS avec SCP
Write-Host "📤 Envoi vers le VPS..." -ForegroundColor Yellow
& scp "deploy.zip" "$VpsUser@$VpsIP":/tmp/

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de l'envoi vers le VPS. Vérifiez votre connexion SSH." -ForegroundColor Red
    exit 1
}

# 4. Déploiement sur le VPS
Write-Host "🔧 Déploiement sur le VPS..." -ForegroundColor Yellow

# Créer le script de déploiement pour le VPS (syntaxe Bash)
$DeployCommands = @(
    "sudo mkdir -p $AppPath",
    "sudo chown -R `$USER:`$USER $AppPath",
    "if [ -d `"$AppPath/dist`" ]; then sudo cp -r $AppPath/dist $AppPath/dist_backup_`$(date +%Y%m%d_%H%M%S) 2>/dev/null || true; fi",
    "cd $AppPath",
    "unzip -o /tmp/deploy.zip",
    "npm ci --production",
    "pm2 restart $AppName || pm2 start dist/server/entry.mjs --name `"$AppName`" --env production",
    "rm /tmp/deploy.zip",
    "echo `"✅ Déploiement terminé !`"",
    "pm2 status"
)

# Exécuter chaque commande sur le VPS
foreach ($cmd in $DeployCommands) {
    Write-Host "Exécution: $cmd" -ForegroundColor Gray
    & ssh "$VpsUser@$VpsIP" $cmd
    
    if ($LASTEXITCODE -ne 0 -and $cmd -notlike "*pm2 restart*") {
        Write-Host "❌ Erreur lors de l'exécution de: $cmd" -ForegroundColor Red
        exit 1
    }
}

# 5. Nettoyage local
Remove-Item -Force "deploy.zip"
Remove-Item -Recurse -Force $TempDir

Write-Host "🎉 Déploiement réussi ! Votre application est accessible sur http://$VpsIP`:3000" -ForegroundColor Green 
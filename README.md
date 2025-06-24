# 🚀 Gestionnaire de Projets Astro

Une application moderne de gestion de projets construite avec **Astro 5.0**, **React**, **Tailwind CSS**, et **Astro DB**, démontrant les nouvelles **Actions serveur** d'Astro.

## ✨ Fonctionnalités

- **CRUD complet** : Créer, lire, modifier et supprimer des projets
- **Actions Astro** : API type-safe côté serveur
- **Interface moderne** : Design responsive avec Tailwind CSS
- **Base de données intégrée** : Astro DB avec SQLite
- **Statistiques temps réel** : Dashboard avec métriques
- **Filtres dynamiques** : Par statut et priorité
- **Animations fluides** : Transitions CSS modernes

## 🛠️ Technologies Utilisées

- **[Astro 5.0](https://astro.build/)** - Framework web moderne
- **[React 19](https://react.dev/)** - Bibliothèque UI
- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[Astro DB](https://docs.astro.build/en/guides/astro-db/)** - Base de données intégrée
- **[Astro Actions](https://docs.astro.build/en/guides/actions/)** - API serveur type-safe

## 📦 Installation

```bash
# Cloner le repository
git clone <votre-repo-url>
cd astrovps

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

## 🏗️ Scripts Disponibles

```bash
# Développement
npm run dev              # Serveur de développement (http://localhost:4321)

# Build
npm run build           # Build avec base de données locale
npm run build:local     # Build explicite avec DB locale
npm run build:remote    # Build avec Astro Studio (si configuré)

# Production
npm run preview         # Preview du build
npm start              # Démarrer le serveur de production

# Déploiement VPS
npm run deploy:powershell  # Déploiement Windows (PowerShell)
npm run deploy:bash       # Déploiement Linux/Mac (Bash)
```

## 🚀 Déploiement VPS

### Option 1 : Script PowerShell (Windows)

```powershell
# Déploiement automatisé
.\deploy-to-vps.ps1 -VpsIP "VOTRE_IP_VPS" -VpsUser "root" -AppName "astro-app"
```

### Option 2 : Script Bash (Linux/Mac/WSL)

```bash
# Rendre le script exécutable
chmod +x deploy-to-vps.sh

# Déployer
./deploy-to-vps.sh VOTRE_IP_VPS root astro-app
```

### Option 3 : Déploiement Manuel

1. **Build local** :
   ```bash
   npm run build
   ```

2. **Transférer les fichiers** :
   ```bash
   scp -r dist/ package.json package-lock.json db/ astro.config.mjs root@VOTRE_IP_VPS:/var/www/astro-app/
   ```

3. **Sur le VPS** :
   ```bash
   cd /var/www/astro-app
   npm ci --production
   pm2 start dist/server/entry.mjs --name "astro-app"
   ```

## 📋 Prérequis VPS

- **Node.js 18+** installé
- **PM2** pour la gestion des processus
- **Nginx** pour le reverse proxy (optionnel)
- **Accès SSH** configuré

Consultez le guide complet : **[DEPLOIEMENT_VPS.md](./DEPLOIEMENT_VPS.md)**

## 🗄️ Structure de la Base de Données

```sql
-- Table Project
CREATE TABLE Project (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in-progress', 'completed')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## 🎯 Actions Astro Disponibles

- `createProject` - Créer un nouveau projet
- `getProjects` - Récupérer tous les projets avec filtres
- `getProject` - Récupérer un projet par ID
- `updateProject` - Mettre à jour un projet
- `deleteProject` - Supprimer un projet
- `getProjectStats` - Obtenir les statistiques

## 🏗️ Structure du Projet

```
astrovps/
├── db/                    # Configuration base de données
│   ├── config.ts         # Schéma des tables
│   └── seed.ts           # Données de test
├── src/
│   ├── actions/          # Actions Astro (API serveur)
│   ├── components/       # Composants React
│   ├── layouts/          # Layouts Astro
│   ├── pages/           # Pages Astro
│   └── styles/          # Styles CSS globaux
├── deploy-to-vps.ps1    # Script déploiement PowerShell
├── deploy-to-vps.sh     # Script déploiement Bash
└── DEPLOIEMENT_VPS.md   # Guide déploiement détaillé
```

## 🔧 Configuration

### Variables d'Environnement

```bash
# Pour le build local (par défaut)
ASTRO_DATABASE_FILE=./.astro/content.db

# Pour Astro Studio (optionnel)
ASTRO_STUDIO_APP_TOKEN=your_token_here
```

### Configuration VPS

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',        // Mode serveur pour les Actions
  adapter: node({
    mode: 'standalone'     // Mode standalone pour VPS
  })
});
```

## 🚨 Dépannage

### Erreur de Port
```bash
# Arrêter tous les processus Node.js
taskkill /F /IM node.exe  # Windows
pkill node               # Linux/Mac
```

### Erreur de Build DB
```bash
# Build avec base de données locale
npm run build:local

# Ou avec Astro Studio
npm run build:remote
```

### Problèmes de Déploiement
- Vérifier la connexion SSH : `ssh user@ip`
- Vérifier les permissions : `chmod 755 deploy-to-vps.sh`
- Consulter les logs PM2 : `pm2 logs astro-app`

## 📚 Ressources

- [Documentation Astro](https://docs.astro.build/)
- [Guide Astro Actions](https://docs.astro.build/en/guides/actions/)
- [Documentation Astro DB](https://docs.astro.build/en/guides/astro-db/)
- [Adaptateur Node.js](https://docs.astro.build/en/guides/integrations-guide/node/)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé avec ❤️ en utilisant les dernières technologies Astro 5.0**

```sh
npm create astro@latest -- --template basics
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

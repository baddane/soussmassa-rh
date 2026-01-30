# Deploiement AWS Amplify - SoussMassa RH

Guide complet pour deployer l'application sur AWS Amplify via GitHub.

## Pre-requis

- Compte AWS avec acces a AWS Amplify
- Compte GitHub avec un repository configure
- Variables d'environnement preparees (voir `.env.example`)

## Structure du projet pour Amplify

```
soussmassa-rh3/
├── amplify.yml          # Configuration de build Amplify
├── package.json         # Dependances et scripts
├── vite.config.ts       # Configuration Vite
├── public/              # Fichiers statiques
│   ├── _redirects       # Redirections SPA
│   └── robots.txt       # SEO
├── .env.example         # Template des variables d'environnement
└── .gitignore           # Fichiers ignores par Git
```

## Etape 1: Preparer le repository GitHub

### 1.1 Initialiser Git (si pas deja fait)

```bash
git init
git add .
git commit -m "Initial commit - ready for Amplify deployment"
```

### 1.2 Creer le repository sur GitHub

1. Allez sur https://github.com/new
2. Nommez le repository (ex: `soussmassa-rh`)
3. Selectionnez "Private" pour la securite
4. Ne pas initialiser avec README (vous en avez deja un)

### 1.3 Pousser le code

```bash
git remote add origin https://github.com/VOTRE_USERNAME/soussmassa-rh.git
git branch -M main
git push -u origin main
```

## Etape 2: Configurer AWS Amplify

### 2.1 Creer une nouvelle application Amplify

1. Connectez-vous a AWS Console
2. Allez dans **AWS Amplify**
3. Cliquez sur **"Create new app"** > **"Host web app"**
4. Selectionnez **GitHub** comme source
5. Autorisez AWS Amplify a acceder a votre compte GitHub
6. Selectionnez votre repository `soussmassa-rh`
7. Selectionnez la branche `main`

### 2.2 Configuration du build (automatique)

AWS Amplify detectera automatiquement le fichier `amplify.yml` qui contient:
- Installation des dependances
- Build de production avec Vite
- Headers de securite
- Configuration du cache

### 2.3 Configurer les variables d'environnement

Dans la console Amplify:
1. Allez dans **"Environment variables"**
2. Ajoutez les variables suivantes:

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | URL de votre API Gateway |
| `VITE_AWS_REGION` | Region AWS (ex: eu-west-3) |
| `VITE_AWS_S3_BUCKET` | Nom du bucket S3 pour les CV |
| `VITE_AWS_USER_POOL_ID` | ID du User Pool Cognito |
| `VITE_AWS_USER_POOL_CLIENT_ID` | ID du client Cognito |
| `API_KEY` | Cle API Google Gemini |

**IMPORTANT**: Ne jamais commiter ces valeurs dans le code source!

### 2.4 Configurer les rewrites (SPA)

Si les rewrites ne fonctionnent pas automatiquement:
1. Allez dans **"Rewrites and redirects"**
2. Ajoutez cette regle:

| Source | Target | Type |
|--------|--------|------|
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json)$)([^.]+$)/>` | `/index.html` | 200 (Rewrite) |

## Etape 3: Deployer

### 3.1 Deploiement automatique

Une fois configure, chaque push sur `main` declenche automatiquement un deploiement.

### 3.2 Deploiement manuel

1. Dans la console Amplify, cliquez sur **"Redeploy this version"**
2. Ou declenchez un nouveau build depuis **"Build settings"**

## Etape 4: Verification post-deploiement

### 4.1 Verifier l'application

1. Attendez que le build soit termine (statut "Deployed")
2. Cliquez sur l'URL fournie par Amplify
3. Testez les fonctionnalites:
   - [ ] Page d'accueil
   - [ ] Inscription candidat/entreprise
   - [ ] Connexion
   - [ ] Liste des offres
   - [ ] Navigation entre pages

### 4.2 Verifier les logs

En cas de probleme:
1. Allez dans **"Build logs"**
2. Verifiez les erreurs eventuelles
3. Consultez CloudWatch pour les logs d'execution

## Configuration avancee

### Domaine personnalise

1. Dans Amplify, allez dans **"Domain management"**
2. Cliquez sur **"Add domain"**
3. Suivez les instructions pour configurer votre DNS

### Branches de preview

Pour des environnements de staging:
1. Allez dans **"Branch settings"**
2. Activez **"PR previews"** pour tester avant merge

### Protection par mot de passe

Pour restreindre l'acces:
1. Allez dans **"Access control"**
2. Activez la protection par mot de passe

## Securite

### Headers configures automatiquement

Le fichier `amplify.yml` configure ces headers de securite:
- `Strict-Transport-Security`: Force HTTPS
- `X-Content-Type-Options`: Previent le MIME sniffing
- `X-Frame-Options`: Previent le clickjacking
- `X-XSS-Protection`: Protection XSS
- `Referrer-Policy`: Controle les informations de referrer

### Bonnes pratiques

1. **Ne jamais commiter** le fichier `.env.local`
2. **Utiliser les variables d'environnement** d'Amplify
3. **Activer le MFA** sur votre compte AWS
4. **Restreindre les permissions IAM** au minimum necessaire
5. **Verifier regulierement** les dependances avec `npm audit`

## Depannage

### Erreur de build "npm ci failed"

Solution: Verifiez que `package-lock.json` est commit dans le repo.

### Pages 404 sur refresh

Solution: Verifiez que les rewrites SPA sont configures correctement.

### Variables d'environnement non disponibles

Solution: Les variables doivent commencer par `VITE_` pour etre accessibles cote client.

### Erreur CORS

Solution: Verifiez que votre API Gateway autorise l'origine Amplify.

## Support

- Documentation AWS Amplify: https://docs.amplify.aws/
- Console AWS: https://console.aws.amazon.com/amplify/
- Issues GitHub: Votre repository

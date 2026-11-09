# DataShare

DataShare est une application de partage de fichiers composée d’un frontend Angular et d’une API backend Spring Boot. Elle permet de téléverser un fichier, de générer un lien public temporaire, de protéger ce lien par mot de passe et de gérer ses fichiers depuis un espace utilisateur.

## Fonctionnalités

- Téléversement anonyme ou authentifié d’un fichier.
- Limite de taille configurable à 1 Go.
- Durée de validité du lien de 1 à 7 jours.
- Protection facultative par mot de passe chiffré côté backend.
- Téléchargement public via un token de partage.
- Création de compte, connexion et authentification JWT.
- Dashboard utilisateur : liste, filtrage, suppression et accès aux fichiers.
- Interface responsive pour mobile, tablette et ordinateur.
- Tests unitaires frontend avec Jest et tests E2E avec Cypress.
- Tests backend avec JUnit, Spring Boot Test, Testcontainers et JaCoCo.

## Architecture

```text
projet3/
├── datashare/                  # Frontend Angular
│   ├── src/app/core/            # Configuration, modèles, services et guard
│   ├── src/app/pages/           # Pages fonctionnelles
│   ├── src/app/shared/          # Composants et styles partagés
│   └── cypress/                 # Tests E2E
└── datashare_backend/           # API Spring Boot
    ├── src/main/java/           # Contrôleurs, services, sécurité, entités
    ├── src/main/resources/      # Configuration et migrations
    └── src/test/java/           # Tests backend
```

## Composants frontend

Le frontend utilise des composants Angular standalone.

| Composant | Route | Responsabilité |
|---|---|---|
| `AppComponent` | — | Conteneur racine avec le `router-outlet`. |
| `SiteHeaderComponent` | Partagé | Affiche le logo et le bouton « Se connecter » ou « Mon espace » selon la session. |
| `UploadFileComponent` | `/upload` | Sélection, validation et téléversement d’un fichier. |
| `DownloadFileComponent` | `/download/:token` | Affiche les métadonnées, demande le mot de passe et déclenche le téléchargement. |
| `LoginComponent` | `/login` | Connexion avec email et mot de passe. |
| `RegisterComponent` | `/register` | Création d’un compte et validation des mots de passe. |
| `DashboardUserComponent` | `/dashboard` | Liste, filtrage, suppression et accès aux fichiers de l’utilisateur. |

### Routes frontend

- `/` redirige vers `/upload`.
- `/upload` est la page de dépôt.
- `/download/:token` est la page publique de téléchargement.
- `/login` et `/register` gèrent l’authentification.
- `/dashboard` est protégé par `authGuard`.

## Services et éléments frontend

### `AuthService`

Fichier : `src/app/core/service/auth.service.ts`

- appelle `/auth/login` et `/auth/register` ;
- extrait l’email du JWT ;
- conserve l’utilisateur et le token dans `localStorage` ;
- expose l’utilisateur courant avec un signal Angular ;
- gère la déconnexion et la redirection vers `/upload`.

### `FileService`

Fichier : `src/app/core/service/file.service.ts`

- `upload()` envoie le fichier en `multipart/form-data` ;
- `list()` récupère les fichiers du compte connecté ;
- `getDownload()` récupère les métadonnées publiques d’un partage ;
- `download()` récupère le contenu sous forme de `Blob` ;
- `remove()` supprime un fichier appartenant à l’utilisateur ;
- `formatSize()` formate la taille affichée.

### Intercepteur JWT

L’intercepteur défini dans `src/app/app.config.ts` ajoute automatiquement l’en-tête suivant aux requêtes lorsqu’un token est présent :

```http
Authorization: Bearer <jwt>
```

### `authGuard`

Le guard `src/app/core/guards/auth.guard.ts` empêche l’accès à `/dashboard` si le token ou l’utilisateur courant est absent.

## API backend

Le backend est une application Spring Boot stateless. Son context path est `/api` et il écoute par défaut sur le port `8080`.

### Authentification

| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Crée un compte. |
| `POST` | `/api/auth/login` | Public | Vérifie les identifiants et renvoie un JWT. |

### Fichiers de l’utilisateur

| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| `POST` | `/api/files` | Public ou JWT | Téléverse un fichier et renvoie ses métadonnées. |
| `GET` | `/api/files` | JWT | Liste les fichiers du propriétaire connecté. |
| `DELETE` | `/api/files/{fileId}` | JWT | Supprime un fichier appartenant à l’utilisateur. |
| `PUT` | `/api/files/{fileId}` | JWT | Met à jour les tags d’un fichier. |

### Partages et téléchargement

| Méthode | Endpoint | Accès | Description |
|---|---|---|---|
| `GET` | `/api/shares/{token}` | Public | Renvoie les métadonnées avant téléchargement. |
| `POST` | `/api/shares/{token}/download` | Public | Vérifie le token et le mot de passe, puis renvoie le fichier. |

Les routes `/api/shares/**` sont publiques afin qu’un destinataire puisse télécharger un fichier sans compte DataShare.

## Services backend

### `AuthService`

Gère l’inscription, la connexion, le hachage BCrypt des mots de passe et la création des utilisateurs.

### `JwtService` et `JwtAuthenticationFilter`

`JwtService` crée et vérifie les JWT. `JwtAuthenticationFilter` lit l’en-tête `Authorization`, valide le token et place l’utilisateur authentifié dans le contexte Spring Security.

### `FileUploadService`

Service métier principal des fichiers :

- valide le nom et l’extension ;
- applique la durée d’expiration ;
- associe éventuellement le fichier à l’utilisateur connecté ;
- chiffre le mot de passe du fichier avec BCrypt ;
- génère un token de partage aléatoire ;
- vérifie le propriétaire lors de la lecture ou de la suppression ;
- refuse les liens expirés ;
- prépare les métadonnées et la ressource de téléchargement.

### `FileStorageService`

Stocke les octets sur le système de fichiers dans le dossier configuré par `UPLOAD_DIRECTORY`. Le nom original n’est pas utilisé comme chemin physique : le fichier est stocké sous un UUID serveur.

### Persistance

- `User` et `File` sont les entités JPA principales.
- `UserRepository` et `FileRepository` fournissent l’accès PostgreSQL.
- Flyway applique les migrations SQL au démarrage.
- Les fichiers physiques sont séparés des métadonnées stockées en base.

## Prérequis et versions

Les versions utilisées par le projet sont les suivantes :

| Outil | Version utilisée/recommandée |
|---|---|
| Node.js | `24.x` — environnement vérifié avec `24.18.0` |
| npm | `11.x` — environnement vérifié avec `11.17.0` |
| Angular | `21.2.x` |
| TypeScript | `5.9.x` |
| Java | `21 LTS` |
| Spring Boot | `3.4.2` |
| Maven | `3.9.x` — environnement vérifié avec `3.9.16` |
| PostgreSQL | `17` via Docker Compose |
| Docker Desktop | nécessaire pour lancer PostgreSQL localement |
| Jest | `30.5.2` |
| Cypress | `16.2.1` |

Les versions frontend exactes sont déclarées dans `package.json` et `package-lock.json`. Les versions Java et Spring sont déclarées dans `../datashare_backend/pom.xml`.

## Installation et démarrage

### 1. Démarrer Docker Desktop et PostgreSQL

Installer Docker Desktop, le lancer et attendre que le moteur Docker soit indiqué comme démarré avant de continuer.

Depuis `../datashare_backend/` :

```bash
docker compose up -d
```

La base est exposée sur `localhost:5432` avec les valeurs par défaut :

```text
Base          : datashare
Utilisateur   : datashare
Mot de passe  : datashare
```

### 2. Démarrer le backend

Depuis `../datashare_backend/` :

```bash
mvn spring-boot:run
```

L’API est disponible sur `http://localhost:8080/api`.

Swagger/OpenAPI est disponible sur `http://localhost:8080/api/swagger-ui/index.html`.

### 3. Démarrer le frontend

Depuis `datashare/` :

```bash
npm install
npm start
```

L’application est disponible sur `http://localhost:4200`.

L’URL de l’API frontend est configurée dans `src/app/core/config/api.config.ts`.

## Tests et validation

### Tests unitaires Angular/Jest

```bash
npm test
npm run test:coverage
```

Les tests unitaires couvrent notamment `AuthService`, `FileService`, `DashboardUserComponent` et `SiteHeaderComponent`.

### Tests E2E Cypress

Le frontend doit être lancé sur le port `4200` avant l’exécution :

```bash
npm run cypress:run
npm run cypress:open
```

Les scénarios Cypress couvrent la route racine, l’upload, la connexion, l’inscription, le header, le dashboard et le téléchargement public/protégé.

### Tests backend

Depuis `datashare_backend/` :

```bash
mvn test
```

Pour exécuter aussi les tests d’intégration, utiliser la configuration de test adaptée à Docker/Testcontainers. La commande `mvn verify` applique également le contrôle JaCoCo configuré dans le projet.

## Configuration principale

Les propriétés importantes sont dans `../datashare_backend/src/main/resources/application.properties` :

```properties
server.port=8080
server.servlet.contextPath=/api
app.storage.directory=./uploads
app.storage.max-bytes=1000000000
app.public-api-url=http://localhost:8080/api
```

Variables d’environnement utiles :

- `DB_URL`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` ;
- `POSTGRES_PORT` ;
- `JWT_SECRET`, `JWT_ISSUER` ;
- `UPLOAD_DIRECTORY` ;
- `PUBLIC_API_URL` ;
- `CORS_ALLOWED_ORIGINS`.

## Organisation des tests frontend

```text
src/app/**/*.spec.ts             # Tests unitaires Jest
cypress/e2e/*.cy.ts              # Tests E2E Cypress
```

Les tests E2E interceptent les appels API lorsque nécessaire afin de tester l’interface de manière reproductible, sans dépendre de données persistées dans la base.

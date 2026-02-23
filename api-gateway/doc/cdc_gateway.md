# Cahier des Charges - API Gateway

## 1. Rôle et Responsabilités

L'API Gateway est le point d'entrée unique de l'application. Elle assure :

- Routage des requêtes vers les microservices appropriés
- Validation des JWT (Access Tokens) en local pour les endpoints protégés
- Injection des headers d'identité vers les services backend
- Forward transparent des réponses

La Gateway ne gère PAS :
- La génération des tokens (responsabilité du service Auth)
- La logique d'autorisation métier (responsabilité de chaque service)
- Le stockage de données utilisateur

## 2. Stack Technique

- Framework : NestJS + TypeScript
- Communication : REST / HTTP
- Validation JWT : bibliothèque jsonwebtoken (ou équivalent)
- Documentation : Swagger / OpenAPI

## 3. Système d'Authentification

### 3.1 Format des Tokens

**Access Token (JWT) :**
- Format : JWT signé (stateless)
- Durée de vie : 60 minutes
- Payload minimum :
```json
  {
    "uid": "string",
    "login": "string", 
    "roles": ["string ('ROLE_ADMIN'| 'ROLE_USER')"],
    "iat": number,
    "exp": number
  }
```
- Algorithme : HS256 (secret partagé entre Auth et Gateway)

**Refresh Token :**
- Format : UUID opaque (stateful)
- Durée de vie : 120 minutes
- Géré exclusivement par le service Auth

### 3.2 Secret JWT Partagé

La Gateway et le service Auth partagent le même secret de signature JWT pour permettre la validation locale des tokens.

Configuration requise :
- Variable d'environnement : `JWT_SECRET`
- Identique entre Gateway et service Auth
- Rotation du secret coordonnée entre les deux services

## 4. Injection des Headers d'Identité

Pour toute requête protégée validée, la Gateway injecte les headers suivants avant de router vers les services backend :

**Headers obligatoires :**
- `X-User-Id` : UID de l'utilisateur extrait du JWT (type: string)
- `X-User-Role` : Rôle de l'utilisateur (valeurs: "ROLE_ADMIN" | "ROLE_USER")

**Format d'injection :**
```
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
X-User-Role: ROLE_USER
```

Les services backend peuvent se fier à ces headers sans vérification supplémentaire car la Gateway a déjà validé le JWT.

## 5. Endpoints Routés - Service Auth

Préfixe : `/api`

### 5.1 POST /api/account
**Type :** Public (pas d'authentification)

**Description :** Création d'un nouveau compte utilisateur

**Workflow Gateway :**
1. Réception de la requête
2. Forward direct vers Auth sans traitement
3. Retour de la réponse Auth au client

**Comportement attendu Auth :**
- Crée le compte avec statut "open"
- Assigne le rôle "ROLE_USER" par défaut
- Retourne l'objet compte (sans token)

**Requête (creatAccountRequest):**
```json
{
  "login": "string",
  "password": "string",
  "roles": ["ROLE_USER | ROLE_ADMIN"],
  "status": "string"
}
```

**Réponse :**
```json
{
  "uid": "string",
  "login": "string",
  "roles": ["ROLE_USER"],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

---

### 5.2 POST /api/token
**Type :** Public (credentials dans body)

**Description :** Authentification et génération des tokens

**Workflow Gateway :**
1. Réception de la requête avec credentials
2. Forward direct vers Auth
3. Auth génère JWT + refresh token
4. Retour des tokens au client

**Body attendu (createTokenRequest):**
```json
{
  "login": "string",
  "password": "string",
   "from": "string"
}
```

**Réponse :**
```json
{
  "accessToken": "string (JWT)",
   "accessTokenExpiresAt": "ISO8601",
  "refreshToken": "string (UUID)",
  "refreshTokenExpiresAt": "ISO8601"
}
```

---

### 5.3 POST /api/refresh-token/{refresh-token}/token
**Type :** Public (refresh token en paramètre d'URL)

**Description :** Génération d'un nouveau access token

**Workflow Gateway :**
1. Réception de la requête avec refresh token
2. Forward direct vers Auth
3. Auth vérifie le refresh token en BDD
4. Auth génère nouveau JWT + nouveau refresh token si valide
5. Retour des nouveaux tokens au client

**Réponse :** Identique à POST /api/token

---

### 5.4 GET /api/validate/{access-token}
**Type :** Public (token en paramètre d'URL)

**Description :** Validation explicite d'un access token

**Workflow Gateway :**
1. Réception de la requête
2. Forward direct vers Auth
3. Auth vérifie le token
4. Retour de la réponse

**Note importante :**
Cet endpoint est implémenté dans le service Auth pour respecter le contrat d'interface imposé. Cependant, la Gateway n'utilise jamais cet endpoint pour ses propres besoins de routage. La Gateway effectue la validation JWT en local pour des raisons de performance, évitant ainsi un appel réseau systématique sur chaque requête protégée.

**Réponse :**
```json
{
  "accessToken": "string",
  "expiresAt": "ISO8601"
}
```

---

### 5.5 GET /api/account/{uid}
**Type :** Protégé (Bearer Token requis)

**Description :** Récupération des informations d'un compte

**Paramètres :**
- `{uid}` : Identifiant du compte ou alias "me" pour le compte courant

**Workflow Gateway :**
1. Réception de la requête avec header `Authorization: Bearer {JWT}`
2. Validation JWT locale :
   - Vérification de la signature avec JWT_SECRET
   - Vérification de l'expiration
   - Extraction du payload
3. Si JWT invalide → 401 Unauthorized
4. Si JWT valide :
   - Extraction de `uid` et `roles[]` du payload
   - Injection headers : `X-User-Id: {uid}`, `X-User-Role: {roles[0]}`
   - Forward vers Auth avec headers injectés
5. Retour de la réponse Auth

**Logique d'autorisation (gérée par Auth) :**
- ROLE_USER : peut uniquement récupérer son propre compte (uid = "me" ou uid = X-User-Id)
- ROLE_ADMIN : peut récupérer n'importe quel compte

**Réponse :** Identique à POST /api/account

---

### 5.6 PUT /api/account/{uid}
**Type :** Protégé (Bearer Token requis)

**Description :** Modification d'un compte utilisateur

**Workflow Gateway :** Identique à GET /api/account/{uid}

**Logique d'autorisation (gérée par Auth) :**
- ROLE_USER : peut modifier uniquement son propre compte
- ROLE_ADMIN : peut modifier n'importe quel compte + promouvoir ROLE_USER en ROLE_ADMIN

**Body attendu (editAccountRequest):**
```json
{
  "login": "string (optional)",
  "password": "string (optional)",
  "roles": ["ROLE_ADMIN"],
   "status": "string"
}
```

**Réponse :** Objet compte mis à jour

## 6. Validation JWT Locale

### 6.1 Processus de Validation

Pour chaque requête protégée, la Gateway effectue les vérifications suivantes :

1. **Extraction du token**
   - Header `Authorization: Bearer {token}` présent
   - Format valide

2. **Vérification cryptographique**
   - Signature valide avec JWT_SECRET
   - Token non expiré (`exp` > now)
   - Token émis (`iat` <= now)

3. **Extraction du payload**
   - Champs obligatoires présents : `uid`, `login`, `roles`
   - Format valide des rôles : tableau contenant "ROLE_USER" ou "ROLE_ADMIN"

### 6.2 Gestion des Erreurs

**401 Unauthorized - Token invalide :**
```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

**401 Unauthorized - Token manquant :**
```json
{
  "statusCode": 401,
  "message": "Authorization header missing",
  "error": "Unauthorized"
}
```

## 7. Routage vers les Services Backend

### 7.1 Services Connus

- **Auth** : http://auth-service:3001
- **Films** : http://films-service:3002 (à définir)
- **Cinemas** : http://cinemas-service:3003
- **Bookings** : http://bookings-service:3004 (à définir)

### 7.2 Règles de Routage

**Préfixe /api/*** → Service Auth
- Tous les endpoints commençant par /api sont routés vers Auth
- Headers d'identité injectés uniquement si endpoint protégé

**Préfixe /cinemas/*** → Service Cinemas (à compléter)
**Préfixe /films/*** → Service Films (à compléter)
**Préfixe /bookings/*** → Service Bookings (à compléter)

### 7.3 Headers Propagés

**Pour toutes les requêtes :**
- Headers HTTP standards (Content-Type, Accept, etc.)
- Header Authorization original (si présent)

**Pour les requêtes protégées validées :**
- Headers injectés : X-User-Id, X-User-Role
- Suppression possible du header Authorization (optionnel, à définir)

## 8. Sécurité Interne

### 8.1 API Key Partagée (à implémenter)

Bien que non détaillée dans cette version provisoire, une API Key partagée entre la Gateway et les services backend sera implémentée pour sécuriser la communication interne.

Header : `X-Internal-Api-Key: {secret}`

Chaque service vérifiera ce header via un middleware dédié.

## 9. Points en Attente

Les éléments suivants seront complétés lors des prochaines itérations :

1. Routage complet vers services Films, Cinemas, Bookings
2. Endpoints spécifiques à chaque service
3. Configuration des CORS
4. Rate limiting
5. Logs et monitoring
6. Gestion des erreurs exhaustive
7. Health checks des services backend

## 10. Limitations Connues

### 10.1 Révocation de Tokens

Actuellement, les JWT sont validés uniquement via leur signature et expiration. Il n'existe pas de mécanisme de révocation instantanée (blacklist).

Si un utilisateur est banni ou supprimé, son JWT reste valide jusqu'à expiration (max 60 min).

**Solution future possible :**
- Cache Redis avec blacklist de tokens
- Vérification additionnelle avant injection des headers

### 10.2 Refresh Token

La Gateway ne gère pas la logique de refresh automatique. C'est au client (frontend) de détecter l'expiration du token et d'appeler `/api/refresh-token` pour en obtenir un nouveau.

## 11. Endpoints Routés - Service Cinemas

Préfixe : Multiple (`/cinemas`, `/movies`, `/sessions`, `/admin`)

**Service :** http://cinemas-service:3003

### 11.1 GET /cinemas
**Type :** Public (pas d'authentification)

**Description :** Liste de tous les établissements avec filtrage optionnel

**Query Parameters :**
- `city` (optional) : Filtrer par ville
- `postalCode` (optional) : Filtrer par code postal

**Workflow Gateway :**
1. Réception de la requête
2. Forward direct vers Cinemas sans traitement
3. Retour de la réponse Cinemas au client

**Réponse :**
```json
[
  {
    "id": "string",
    "name": "string",
    "address": "string",
    "city": "string",
    "postalCode": "string"
  }
]
```

---

### 11.2 GET /cinemas/:id/catalog
**Type :** Public (pas d'authentification)

**Description :** Programmation complète d'un établissement (UC 4)

**Workflow Gateway :**
1. Réception de la requête
2. Forward direct vers Cinemas
3. Retour de la réponse

**Réponse :**
```json
{
  "cinemaName": "string",
  "sessions": [
    {
      "sessionId": "string",
      "film": {
        "id": "string",
        "title": "string",
        "director": "string",
        "durationMinutes": number,
        "releaseYear": number,
        "posterUrl": "string",
        "synopsis": "string"
      },
      "startTime": "ISO8601",
      "roomName": "string"
    }
  ]
}
```

---

### 11.3 GET /movies/:filmId/sessions
**Type :** Public (pas d'authentification)

**Description :** Liste des séances pour un film donné dans tous les cinémas (UC 3)

**Workflow Gateway :**
1. Réception de la requête
2. Forward direct vers Cinemas
3. Retour de la réponse

**Réponse :**
```json
{
  "film": {
    "id": "string",
    "title": "string",
    "director": "string",
    "durationMinutes": number,
    "releaseYear": number,
    "posterUrl": "string",
    "synopsis": "string"
  },
  "providers": [
    {
      "cinemaId": "string",
      "cinemaName": "string",
      "sessions": [
        {
          "sessionId": "string",
          "startTime": "ISO8601"
        }
      ]
    }
  ]
}
```

---

### 11.4 GET /sessions/:id/seats
**Type :** Public (pas d'authentification)

**Description :** Plan de salle avec disponibilités pour une séance (UC 3 et 4)

**Workflow Gateway :**
1. Réception de la requête
2. Forward direct vers Cinemas
3. Retour de la réponse

**Réponse :**
```json
{
  "sessionId": "string",
  "film": {
    "id": "string",
    "title": "string",
    "director": "string",
    "durationMinutes": number,
    "releaseYear": number,
    "posterUrl": "string",
    "synopsis": "string"
  },
  "rows": [
    {
      "rowName": "string",
      "seats": [
        {
          "seatId": "string",
          "columnNumber": number,
          "status": "FREE" | "OCCUPIED"
        }
      ]
    }
  ]
}
```

---

### 11.5 POST /sessions/:id/book
**Type :** Protégé (Bearer Token requis)

**Description :** Réservation de places pour une séance (UC 3 et 4)

**Workflow Gateway :**
1. Réception de la requête avec header `Authorization: Bearer {JWT}`
2. Validation JWT locale :
   - Vérification de la signature avec JWT_SECRET
   - Vérification de l'expiration
   - Extraction du payload
3. Si JWT invalide → 401 Unauthorized
4. Si JWT valide :
   - Extraction de `uid` et `roles[]` du payload
   - Injection headers : `X-User-Id: {uid}`, `X-User-Role: {roles[0]}`
   - Forward vers Cinemas avec headers injectés
5. Retour de la réponse Cinemas

**Logique d'autorisation (gérée par Cinemas) :**
- ROLE_USER : peut réserver des places
- ROLE_ADMIN : peut réserver des places

**Body attendu :**
```json
{
  "seatIds": ["string"]
}
```

**Réponse :**
```
204 No Content (ou 200 avec body vide)
```

---

### 11.6 GET /admin/rooms/:roomId/availability
**Type :** Protégé (Bearer Token requis)

**Description :** Consultation des séances existantes pour une salle à une date donnée (UC 2)

**Query Parameters :**
- `date` (required) : Date au format YYYY-MM-DD

**Workflow Gateway :**
1. Réception de la requête avec header `Authorization: Bearer {JWT}`
2. Validation JWT locale
3. Vérification du rôle :
   - Si `roles[]` ne contient pas "ROLE_ADMIN" → 403 Forbidden
4. Si autorisé :
   - Injection headers : `X-User-Id: {uid}`, `X-User-Role: ROLE_ADMIN`
   - Forward vers Cinemas avec headers injectés
5. Retour de la réponse Cinemas

**Logique d'autorisation (gérée par Cinemas) :**
- ROLE_ADMIN uniquement
- Aucune restriction par établissement : un administrateur peut consulter n'importe quelle salle

**Réponse :**
```json
{
  "roomId": "string",
  "date": "YYYY-MM-DD",
  "sessions": [
    {
      "sessionId": "string",
      "film": {
        "id": "string",
        "title": "string",
        "director": "string",
        "durationMinutes": number,
        "releaseYear": number,
        "posterUrl": "string",
        "synopsis": "string"
      },
      "startTime": "ISO8601",
      "endTime": "ISO8601"
    }
  ]
}
```

---

### 11.7 POST /admin/sessions
**Type :** Protégé (Bearer Token requis)

**Description :** Création d'une séance (UC 2)

**Workflow Gateway :**
1. Réception de la requête avec header `Authorization: Bearer {JWT}`
2. Validation JWT locale
3. Vérification du rôle :
   - Si `roles[]` ne contient pas "ROLE_ADMIN" → 403 Forbidden
4. Si autorisé :
   - Injection headers : `X-User-Id: {uid}`, `X-User-Role: ROLE_ADMIN`
   - Forward vers Cinemas avec headers injectés
5. Retour de la réponse Cinemas

**Logique d'autorisation (gérée par Cinemas) :**
- ROLE_ADMIN uniquement
- Aucune restriction par établissement : un administrateur peut créer une séance dans n'importe quel cinéma

**Body attendu :**
```json
{
  "filmId": "string",
  "roomId": "string",
  "startTime": "ISO8601",
  "endTime": "ISO8601"
}
```

**Note :** Le `cinemaId` est déduit automatiquement via le `roomId`.

**Réponse :**
```json
{
  "sessionId": "string"
}
```

---

### 11.8 Règles de Routage - Service Cinemas

**Préfixes routés vers Cinemas :**
- `/cinemas/*` → http://cinemas-service:3003
- `/movies/*` → http://cinemas-service:3003
- `/sessions/*` → http://cinemas-service:3003
- `/admin/rooms/*` → http://cinemas-service:3003
- `/admin/sessions` → http://cinemas-service:3003

**Headers propagés :**
- Pour requêtes publiques : Headers HTTP standards + X-Internal-Api-Key
- Pour requêtes protégées : Headers HTTP standards + X-User-Id + X-User-Role + X-Internal-Api-Key

## 12. Endpoints Routés - Service Movies

Préfixe : `/movie`

**Service :** http://movies-service:3002

**Note importante :** Tous les endpoints de ce service sont publics (pas d'authentification requise).

### 12.1 GET /movie
**Type :** Public (pas d'authentification)

**Description :** Recherche de films avec filtrage avancé

**Query Parameters (tous optionnels) :**
- `q` : Terme de recherche (défaut: "movie")
- `type` : Type de contenu ("movie" | "series" | "episode")
- `year` : Année de sortie
- `page` : Numéro de page (1-100, défaut: 1)
- `plot` : Longueur du synopsis ("short" | "full")
- `genre` : Genre (liste séparée par virgules)
- `releasedFrom` : Date de sortie minimale (YYYY ou YYYY-MM-DD)
- `releasedTo` : Date de sortie maximale (YYYY ou YYYY-MM-DD)
- `releasedOn` : Date de sortie exacte (YYYY ou YYYY-MM-DD)
- `minImdbRating` : Note IMDb minimale
- `maxImdbRating` : Note IMDb maximale
- `minRuntime` : Durée minimale (minutes)
- `maxRuntime` : Durée maximale (minutes)
- `director` : Réalisateur (recherche partielle)
- `actor` : Acteur (recherche partielle)
- `language` : Langue (recherche partielle)
- `country` : Pays (recherche partielle)
- `includeDetails` : Inclure détails complets ("true" | "false")

**Workflow Gateway :**
1. Réception de la requête
2. Forward direct vers Movies sans traitement
3. Retour de la réponse Movies au client

**Note :** Si des filtres avancés sont utilisés (genre, dates, ratings, runtime, director, actor, language, country), le service récupère automatiquement les détails complets même si `includeDetails=false`.

**Réponse :**
```json
{
  "page": number,
  "totalResults": number,
  "results": [
    {
      "Title": "string",
      "Year": "string",
      "imdbID": "string",
      "Type": "string",
      "Poster": "string"
    }
  ],
  "filtersApplied": ["string"] // optionnel, liste des filtres appliqués
}
```

**Réponse (avec includeDetails=true ou filtres avancés) :**
```json
{
  "page": number,
  "totalResults": number,
  "results": [
    {
      "Title": "string",
      "Year": "string",
      "Rated": "string",
      "Released": "string",
      "Runtime": "string",
      "Genre": "string",
      "Director": "string",
      "Writer": "string",
      "Actors": "string",
      "Plot": "string",
      "Language": "string",
      "Country": "string",
      "Awards": "string",
      "Poster": "string",
      "Ratings": [
        {
          "Source": "string",
          "Value": "string"
        }
      ],
      "Metascore": "string",
      "imdbRating": "string",
      "imdbVotes": "string",
      "imdbID": "string",
      "Type": "string",
      "DVD": "string",
      "BoxOffice": "string",
      "Production": "string",
      "Website": "string",
      "Response": "True"
    }
  ],
  "filtersApplied": ["string"]
}
```

---

### 12.2 GET /movie/title/:title
**Type :** Public (pas d'authentification)

**Description :** Recherche de films par titre

**Paramètres URL :**
- `title` : Titre du film à rechercher

**Query Parameters :** Identiques à GET /movie (sauf `q` qui est remplacé par le paramètre d'URL)

**Workflow Gateway :** Identique à GET /movie

**Réponse :** Identique à GET /movie

---

### 12.3 GET /movie/title/:title/page/:page
**Type :** Public (pas d'authentification)

**Description :** Recherche paginée de films par titre

**Paramètres URL :**
- `title` : Titre du film à rechercher
- `page` : Numéro de page (1-100)

**Query Parameters :** Identiques à GET /movie (sauf `q` et `page` qui sont remplacés par les paramètres d'URL)

**Workflow Gateway :** Identique à GET /movie

**Réponse :** Identique à GET /movie

---

### 12.4 GET /movie/id/:imdbId
**Type :** Public (pas d'authentification)

**Description :** Récupération des détails complets d'un film par son ID IMDb

**Paramètres URL :**
- `imdbId` : Identifiant IMDb du film (ex: "tt1375666")

**Query Parameters :**
- `plot` (optional) : Longueur du synopsis ("short" | "full", défaut: "short")

**Workflow Gateway :**
1. Réception de la requête
2. Forward direct vers Movies
3. Retour de la réponse Movies au client

**Réponse :**
```json
{
  "Title": "string",
  "Year": "string",
  "Rated": "string",
  "Released": "string",
  "Runtime": "string",
  "Genre": "string",
  "Director": "string",
  "Writer": "string",
  "Actors": "string",
  "Plot": "string",
  "Language": "string",
  "Country": "string",
  "Awards": "string",
  "Poster": "string",
  "Ratings": [
    {
      "Source": "string",
      "Value": "string"
    }
  ],
  "Metascore": "string",
  "imdbRating": "string",
  "imdbVotes": "string",
  "imdbID": "string",
  "Type": "string",
  "DVD": "string",
  "BoxOffice": "string",
  "Production": "string",
  "Website": "string",
  "Response": "True"
}
```

**Erreur (film non trouvé) :**
```json
{
  "statusCode": 400,
  "message": "Movie not found.",
  "error": "Bad Request"
}
```

---

### 12.5 GET /movie/genre/:genre
**Type :** Public (pas d'authentification)

**Description :** Recherche de films par genre

**Paramètres URL :**
- `genre` : Genre à rechercher (ex: "Action", "Comedy")

**Query Parameters :** Identiques à GET /movie (le genre d'URL est ajouté au filtre `genre`)

**Workflow Gateway :** Identique à GET /movie

**Note :** Le paramètre `genre` d'URL est automatiquement utilisé comme filtre. Si `q` n'est pas fourni, il prend la valeur du genre.

**Réponse :** Identique à GET /movie (avec détails complets car filtre appliqué)

---

### 12.6 GET /movie/release/:date
**Type :** Public (pas d'authentification)

**Description :** Recherche de films par date de sortie

**Paramètres URL :**
- `date` : Date de sortie (format YYYY ou YYYY-MM-DD)

**Query Parameters :** Identiques à GET /movie (la date d'URL est utilisée comme `releasedOn`)

**Workflow Gateway :** Identique à GET /movie

**Note :** Le paramètre `date` d'URL est automatiquement utilisé comme filtre `releasedOn`. Si `q` n'est pas fourni, il prend la valeur "movie".

**Réponse :** Identique à GET /movie (avec détails complets car filtre appliqué)

---

### 12.7 Règles de Routage - Service Movies

**Préfixes routés vers Movies :**
- `/movie/*` → http://movies-service:3002

**Headers propagés :**
- Headers HTTP standards (Content-Type, Accept, etc.)
- X-Internal-Api-Key (pour la sécurité interne)

**Note :** Ce service ne nécessite jamais d'authentification. Aucun header X-User-Id ou X-User-Role n'est injecté.

## 13. Endpoints Routés - Service Bookings

Préfixe : `/bookings`

**Service :** http://bookings-service:3004

### 13.1 POST /bookings
**Type :** Protégé (Bearer Token requis)

**Description :** Création d'une réservation (booking) avec places et paiement optionnel

**Workflow Gateway :**
1. Réception de la requête avec header `Authorization: Bearer {JWT}`
2. Validation JWT locale :
   - Vérification de la signature avec JWT_SECRET
   - Vérification de l'expiration
   - Extraction du payload
3. Si JWT invalide → 401 Unauthorized
4. Si JWT valide :
   - Extraction de `uid` et `roles[]` du payload
   - Injection headers : `X-User-Id: {uid}`, `X-User-Role: {roles[0]}`
   - Forward vers Bookings avec headers injectés
5. Retour de la réponse Bookings

**Logique d'autorisation (gérée par Bookings) :**
- ROLE_USER : peut créer un booking pour lui-même (userId = X-User-Id)
- ROLE_ADMIN : peut créer un booking pour lui-même

**Body attendu :**
```json
{
  "sessionId": "string",
  "seatIds": ["string"],
  "payment": {
    "provider": "string",
    "amount": number,
    "currency": "string"
  }
}
```

**Note :**
- Le `userId` est automatiquement extrait du header X-User-Id par le service Bookings
- Le champ `payment` est optionnel. Si absent, le booking est créé en statut PENDING sans paiement
- Les `seatIds` sont dédupliqués automatiquement

**Réponse :**
```json
{
  "id": "string",
  "userId": "string",
  "sessionId": "string",
  "status": "PENDING",
  "seats": [
    {
      "id": "string",
      "bookingId": "string",
      "sessionId": "string",
      "seatId": "string"
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "payment": {
    "id": "string",
    "bookingId": "string",
    "provider": "string",
    "amount": {
      "amount": number,
      "currency": "string"
    },
    "status": "PENDING",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

**Erreurs :**
```json
// 409 Conflict - Siège déjà réservé
{
  "statusCode": 409,
  "message": "Seat already booked for this screening",
  "error": "Conflict"
}
```

---

### 13.2 POST /bookings/:id/confirm
**Type :** Protégé (Bearer Token requis)

**Description :** Confirmation d'un booking (passage de PENDING à CONFIRMED)

**Workflow Gateway :**
1. Réception de la requête avec header `Authorization: Bearer {JWT}`
2. Validation JWT locale
3. Si JWT valide :
   - Injection headers : `X-User-Id: {uid}`, `X-User-Role: {roles[0]}`
   - Forward vers Bookings avec headers injectés
4. Retour de la réponse Bookings

**Logique d'autorisation (gérée par Bookings) :**
- ROLE_USER : peut confirmer uniquement son propre booking
- ROLE_ADMIN : peut confirmer n'importe quel booking

**Réponse :**
```json
{
  "id": "string",
  "userId": "string",
  "sessionId": "string",
  "status": "CONFIRMED",
  "seats": [
    {
      "id": "string",
      "bookingId": "string",
      "sessionId": "string",
      "seatId": "string"
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "payment": {...}
}
```

**Erreurs :**
```json
// 404 Not Found - Booking introuvable
{
  "statusCode": 404,
  "message": "Booking not found",
  "error": "Not Found"
}
```

---

### 13.3 POST /bookings/:id/cancel
**Type :** Protégé (Bearer Token requis)

**Description :** Annulation d'un booking (passage à CANCELLED)

**Workflow Gateway :** Identique à POST /bookings/:id/confirm

**Logique d'autorisation (gérée par Bookings) :**
- ROLE_USER : peut annuler uniquement son propre booking
- ROLE_ADMIN : peut annuler n'importe quel booking

**Réponse :**
```json
{
  "id": "string",
  "userId": "string",
  "sessionId": "string",
  "status": "CANCELLED",
  "seats": [
    {
      "id": "string",
      "bookingId": "string",
      "sessionId": "string",
      "seatId": "string"
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "payment": {...}
}
```

**Erreurs :**
```json
// 404 Not Found - Booking introuvable
{
  "statusCode": 404,
  "message": "Booking not found",
  "error": "Not Found"
}
```

---

### 13.4 GET /bookings/:id
**Type :** Protégé (Bearer Token requis)

**Description :** Récupération des détails d'un booking

**Workflow Gateway :** Identique à POST /bookings/:id/confirm

**Logique d'autorisation (gérée par Bookings) :**
- ROLE_USER : peut récupérer uniquement son propre booking
- ROLE_ADMIN : peut récupérer n'importe quel booking

**Réponse :**
```json
{
  "id": "string",
  "userId": "string",
  "sessionId": "string",
  "status": "PENDING" | "CONFIRMED" | "CANCELLED",
  "seats": [
    {
      "id": "string",
      "bookingId": "string",
      "sessionId": "string",
      "seatId": "string"
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "payment": {
    "id": "string",
    "bookingId": "string",
    "provider": "string",
    "amount": {
      "amount": number,
      "currency": "string"
    },
    "status": "PENDING" | "COMPLETED" | "FAILED",
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

**Note :** Le champ `payment` peut être absent si aucun paiement n'a été associé au booking.

**Erreurs :**
```json
// 404 Not Found - Booking introuvable
{
  "statusCode": 404,
  "message": "Booking not found",
  "error": "Not Found"
}
```

---

### 13.5 Règles de Routage - Service Bookings

**Préfixes routés vers Bookings :**
- `/bookings/*` → http://bookings-service:3004

**Headers propagés :**
- Pour toutes les requêtes protégées : Headers HTTP standards + X-User-Id + X-User-Role + X-Internal-Api-Key

**Note importante :**
- Tous les endpoints de ce service sont protégés et nécessitent une authentification
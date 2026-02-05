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
    "roles": ["ROLE_ADMIN" | "ROLE_USER"],
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

**Body attendu :**
```json
{
  "login": "string",
  "password": "string"
}
```

**Réponse :**
```json
{
  "accessToken": "string (JWT)",
  "refreshToken": "string (UUID)",
  "accessTokenExpiry": "ISO8601",
  "refreshTokenExpiry": "ISO8601"
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

**Body attendu :**
```json
{
  "login": "string (optional)",
  "password": "string (optional)",
  "roles": ["string"] (optional, ROLE_ADMIN uniquement)
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

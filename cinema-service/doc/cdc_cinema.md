# Document de Reference : Microservice Cinema

## 1. Description du Projet

Ce projet consiste en une application de réservation de places de cinéma découpée en quatre micro services : auth, films, cinemas et bookings. Le service Cinema est le pivot central : il gère les infrastructures physiques (cinémas et salles) ainsi que le planning temporel (séances). Il est responsable de la cohérence des disponibilités lors des réservations.

## 2. Use Cases Fonctionnels

### UC 1 : Creation de compte
Action : Un visiteur s'inscrit sur la plateforme.
Parcours :
- Le visiteur accède au formulaire d'inscription.
- Il renseigne ses informations personnelles.
- Il valide la création.
- Il s'identifie via le service d'authentification pour obtenir ses tokens.

### UC 2 : Programmation d'une seance (Admin)
Action : Un administrateur planifie une diffusion dans un établissement.
Parcours :
1. L'admin accède à son espace de gestion.
2. Il sélectionne un établissement et une salle.
3. Il sélectionne un film parmi le catalogue.
4. Il visualise les disponibilités de la salle sur les 4 créneaux fixes (10h, 13h, 16h, 19h).
5. Il valide le créneau libre de son choix pour créer la séance.

### UC 3 : Reservation par film (Client)
Action : Un client réserve une place en choisissant d'abord un film.
Parcours :
1. Le client sélectionne un film sur la page d'accueil.
2. Il consulte la liste des cinémas et les horaires qui proposent ce film.
3. Il sélectionne une séance précise.
4. Il s'identifie ou crée un compte si ce n'est pas déjà fait.
5. Il choisit sa ou ses place(s) sur le plan de salle.
6. Il valide sa réservation.

### UC 4 : Reservation par cinema (Client)
Action : Un client réserve une place en choisissant d'abord un établissement.
Parcours :
1. Le client sélectionne un cinéma sur la page d'accueil.
2. Il consulte la programmation complète (films et horaires) de cet établissement.
3. Il sélectionne une séance.
4. Il s'identifie ou crée un compte si ce n'est pas déjà fait.
5. Il choisit sa ou ses place(s) sur le plan de salle.
6. Il valide sa réservation.

## 3. Architecture et Contraintes Techniques

### Stack Technique
- Framework : NestJS avec TypeScript.
- Base de donnees : PostgreSQL.
- ORM : Prisma.
- Documentation : Swagger / OpenAPI.
- Environnement : Developpement sous Ubuntu.

### Architecture Imposee (Clean Architecture)

Le service suit la structure en quatre couches pour isoler la logique metier de l'infrastructure :

1. Domain (Coeur Metier) : Contient les entites, les value objects et les interfaces des repositories + exceptions. C'est la couche independante des frameworks.
2. Application (Logique Applicative) : Contient les Use Cases (orchestration des actions : admin, booking, catalog), les services et les ports.
3. Infrastructure (Implementations Techniques) : Contient l'implementation des repositories (persistence) avec Prisma (> repositories / > prisma > repositories), les clients HTTP pour la communication inter-services et les adaptateurs.
4. Presentation (Interface HTTP) : Contient les controleurs, les routes, les DTOs et les middlewares.

### Communication et Securite
- Protocoles : REST / JSON pour tous les echanges.
- Gateway : Point d'entree unique qui gere l'authentification et injecte les headers d'identite (X-User-Id, X-User-Role) vers les services.
- Headers injectés par la Gateway :
  - `X-User-Id` : Identifiant unique de l'utilisateur
  - `X-User-Role` : Rôle de l'utilisateur (ROLE_ADMIN | ROLE_USER)
- Securite interne : Verification d'un secret partage (API Key interne) via un middleware dans chaque service.
- Gestion du temps : Utilisation exclusive du format ISO 8601 UTC (suffixe Z). Stockage en base via le type TIMESTAMPTZ de PostgreSQL.

## 4. Entites du Domaine (Domain Layer)

1. Cinema : id, name, address, rooms (Room[]).
2. Room : id, name, cinemaId, seats (Seat[]).
3. Seat : id, row, number (index de colonne), roomId.
4. Session : id, filmId, roomId, date (UTC), slot (10, 13, 16 ou 19).
5. SeatOccupation : sessionId, seatId, userId (nullable), status (FREE ou OCCUPIED).

## 5. Contrat d'Interface Complet (Presentation Layer)

Les DTOs suivants definissent les echanges de la couche Presentation.

### 5.1 Endpoints de Consultation (Publics)

GET /cinemas
- Usage : Lister tous les établissements avec filtrage optionnel.
- Query Parameters :
  - `city` (optional) : Filtrer par ville
  - `postalCode` (optional) : Filtrer par code postal
- Response : CinemaResponseDTO[] { id: string, name: string, address: string, city: string, postalCode: string }

GET /cinemas/:id/catalog
- Usage : Programmation d'un cinema (UC 4).
- Response : CinemaCatalogDTO
  - cinemaName: string
  - sessions: Array<{ sessionId: string, filmId: string, filmTitle: string, startTime: string, roomName: string }>

GET /movies/:filmId/sessions
- Usage : Trouver les seances pour un film (UC 3).
- Response : MovieSessionsDTO
  - filmId: string
  - filmTitle: string
  - providers: Array<{ cinemaId: string, cinemaName: string, sessions: Array<{ sessionId: string, startTime: string }> }>

GET /sessions/:id/seats
- Usage : Plan de salle d'une seance (UC 3 et 4).
- Response : SessionSeatMapDTO
  - sessionId: string
  - filmTitle: string
  - rows: Array<{ rowName: string, seats: Array<{ seatId: string, columnNumber: number, status: 'FREE' | 'OCCUPIED' }> }>

### 5.2 Endpoints d'Administration (Privés)

Requiert le rôle ROLE_ADMIN (vérifié via header X-User-Role).

GET /admin/rooms/:roomId/availability?date=YYYY-MM-DD
- Usage : Consulter les séances existantes pour une salle à une date donnée (UC 2).
- Response : RoomAvailabilityDTO
  - roomId: string
  - date: string (YYYY-MM-DD)
  - sessions: Array<{ sessionId: string, film: FilmInfoDTO, startTime: string, endTime: string }>

POST /admin/sessions
- Usage : Créer une séance (UC 2).
- Request Body : CreateSessionDTO { filmId: string, roomId: string, startTime: string, endTime: string }
- Response : { sessionId: string }
- Note : Le cinemaId est déduit automatiquement via le roomId. Tout administrateur peut créer une séance pour n'importe quel établissement.

### 5.3 Endpoints de Reservation (Metier)

POST /sessions/:id/book
- Usage : Finaliser la reservation de places.
- Request Body : BookSeatsDTO { seatIds: string[] }
- Note : Utilise le header X-User-Id. L'action est atomique.
- Requiert le rôle ROLE_USER ou ROLE_ADMIN (utilisateur authentifié).

## 6. Règles d'Autorisation

### Endpoints Publics
- GET /cinemas
- GET /cinemas/:id/catalog
- GET /movies/:filmId/sessions
- GET /sessions/:id/seats

Aucune authentification requise. Accessibles à tous les visiteurs.

### Endpoints Utilisateur Authentifié
- POST /sessions/:id/book

Requiert un utilisateur authentifié (ROLE_USER ou ROLE_ADMIN).

### Endpoints Administrateur
- GET /admin/rooms/:roomId/availability
- POST /admin/sessions

Requiert le rôle ROLE_ADMIN. Aucune restriction par établissement : un administrateur peut gérer toutes les salles et créer des séances dans tous les cinémas de la plateforme.
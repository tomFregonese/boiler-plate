# Booking Service

Ce microservice gère les **réservations de séances de cinéma** :
- création de réservation (hold ou direct)
- confirmation (avec ou sans paiement)
- annulation
- expiration automatique des réservations temporaires

Il est développé avec **NestJS**, **Prisma** et suit une **Clean Architecture** afin de séparer clairement le métier, la logique applicative et les détails techniques.

---

## Principe général

Le code est organisé par **responsabilité**, pas par technologie.

Chaque couche a un rôle précis :
- le **Domain** contient les règles métier
- l’**Application** orchestre les cas d’usage
- l’**Infrastructure** gère la technique (DB, messaging, APIs)
- la **Presentation** expose l’API HTTP
- le **Shared** contient les outils communs

Les dépendances vont toujours de l’extérieur vers l’intérieur.

---

## Structure globale

booking-service/
├── prisma/
├── src/
│   ├── modules/
│   │   └── bookings/
│   └── shared/
├── test/

---

## Dossier `prisma/`

prisma/
├── schema.prisma
├── migrations/
└── seed.ts


Contient tout ce qui concerne la **base de données** du service Booking.

- `schema.prisma` : modèle de données du microservice
- `migrations/` : historique des migrations
- `seed.ts` : données initiales (optionnel)

👉 Chaque microservice possède son propre schéma Prisma et sa propre base.

---

## Dossier `src/modules/bookings/`

C’est le **cœur du microservice**.  
Toute la logique métier liée aux réservations se trouve ici.

---

### 1. `domain/` — Cœur métier

domain/
├── entities/
├── value-objects/
├── repositories/
├── events/
└── errors/

Contient le **métier pur**, indépendant de NestJS, Prisma ou HTTP.

- `entities/`  
  Objets métier principaux (ex : Booking, Payment).  
  Ils contiennent les règles et comportements métier.

- `value-objects/`  
  Objets immuables représentant des concepts métier (statut, argent, dates).

- `repositories/`  
  Interfaces (contrats) pour accéder aux données  
  → aucune implémentation ici.

- `events/`  
  Événements métier émis par le domaine (booking confirmé, annulé, etc.).

- `errors/`  
  Erreurs métier explicites (transition invalide, siège déjà réservé, etc.).

👉 Cette couche **ne dépend de rien**.

---

### 2. `application/` — Cas d’usage


application/
├── use-cases/
├── dtos/
├── ports/
└── services/


Contient la **logique applicative**, c’est-à-dire ce que fait le système
pour répondre à une intention utilisateur.

- `use-cases/`  
  Un dossier par action métier :
  - créer une réservation
  - confirmer
  - annuler
  - expirer les holds

- `dtos/`  
  Objets d’entrée/sortie internes aux use cases  
  (différents des DTO HTTP).

- `ports/`  
  Interfaces vers l’extérieur :
  - EventBus
  - Service de paiement
  - Horloge (utile pour les tests)

- `services/`  
  Services applicatifs transverses (ex : calcul de prix).

👉 Cette couche orchestre le métier, mais ne connaît pas la technique.

---

### 3. `infrastructure/` — Implémentations techniques

infrastructure/
├── db/
├── messaging/
├── http/
├── adapters/
├── jobs/
└── config/


Contient **le “comment” technique**.

- `db/`  
  Implémentation Prisma :
  - client Prisma
  - repositories concrets
  - mappers DB ↔ Domain

- `messaging/`  
  Event bus (NATS, RabbitMQ…) :
  - publication d’événements
  - handlers d’événements entrants (ex : paiement validé)

- `http/clients/`  
  Clients HTTP vers d’autres microservices si nécessaire.

- `adapters/`  
  Adaptateurs vers des services externes (ex : Stripe).

- `jobs/`  
  Tâches planifiées (expiration automatique des réservations).

- `config/`  
  Configuration spécifique au microservice.

👉 Cette couche dépend des couches internes, jamais l’inverse.

---

### 4. `presentation/` — API HTTP


presentation/
├── controllers/
├── dto/
├── filters/
├── guards/
└── pipes/


Expose l’API HTTP via NestJS.

- `controllers/`  
  Reçoivent les requêtes HTTP et appellent un use case.

- `dto/requests`  
  DTO des requêtes HTTP (validation avec class-validator).

- `dto/responses`  
  DTO des réponses HTTP.

- `filters/`  
  Mapping des erreurs métier vers des réponses HTTP propres.

- `guards/`  
  Authentification / autorisation.

👉 Les controllers sont volontairement **très fins**.

---

## Dossier `src/shared/`

shared/
├── errors/
├── result/
├── constants/
└── utils/

Code utilitaire partagé **uniquement dans ce microservice**.

- erreurs génériques
- type `Result`
- helpers
- constantes d’injection

⚠️ Ne pas y mettre de logique métier.

---

## Dossier `test/`

test/
├── unit/
├── integration/
└── e2e/

- `unit/` : tests du domain et des use cases
- `integration/` : tests Prisma + DB
- `e2e/` : tests HTTP complets

---

## Flux typique d’une requête

1. Une requête HTTP arrive dans un **controller**
2. Le controller appelle un **use case**
3. Le use case utilise :
   - des entités du domain
   - des repositories (interfaces)
4. L’implémentation Prisma est utilisée via l’infrastructure
5. Un événement est éventuellement publié
6. Une réponse HTTP est renvoyée

---

## Objectifs de cette architecture

- Séparer clairement le métier et la technique
- Faciliter les tests
- Être compatible microservices
- Rendre le code lisible et évolutif
- Permettre le changement de DB, broker ou PSP sans casser le métier
# Cahier des Charges Global - Application Réservation Cinéma

## 1. Vision du Projet

Application web de réservation de places de cinéma basée sur une architecture microservices, sur le modele de pathe ou ugc. La plateforme permet aux clients de réserver des places pour des séances de cinéma, et aux gestionnaires d'établissements de programmer leur diffusion.

## 2. Architecture Microservices

L'application est découpée en 4 services autonomes :

- **Auth** : Gestion des comptes utilisateurs et authentification
- **Films** : Catalogue des films disponibles
- **Cinemas** : Gestion des établissements, salles, séances et disponibilités
- **Bookings** : Gestion des réservations et places occupées

Le service **Cinemas** est le pivot central de l'architecture.

## 3. Rôles Utilisateurs

- **Visiteur** : Consultation du catalogue et des séances
- **Client** : Réservation de places (compte requis)
- **Gestionnaire** : Administration d'un établissement (programmation des séances)

## 4. Stack Technique Commune

- **Framework** : NestJS + TypeScript
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Communication** : REST / JSON
- **Documentation** : Swagger / OpenAPI
- **Temps** : ISO 8601 UTC (format TIMESTAMPTZ)

## 5. Architecture de Sécurité

### API Gateway
- Point d'entrée unique pour toutes les requêtes
- Authentification centralisée
- Injection de headers d'identité vers les services :
  - `X-User-Id`
  - `X-User-Role`

### Services Internes
- Vérification d'une API Key partagée entre services
- Pas d'authentification JWT en interne (gérée par la Gateway)

## 6. Principes Architecturaux

- **Clean Architecture** obligatoire pour tous les services
- Isolation stricte entre les couches (Domain, Application, Infrastructure, Presentation)
- Communication synchrone REST uniquement
- Chaque service possède sa propre base de données

# API Gateway

Point d'entree unique de l'application de reservation cinema. Gere le routage, la validation JWT et l'injection des headers d'identite vers les microservices.

## Prerequis

- Node.js >= 20
- Yarn (de préférence)

## Installation

```bash
yarn install
# ou npm install
```

## Configuration

Créer .env à partir de .env.example et renseigner les valeurs :

```bash
cp .env.example .env
```

Variables requises :

```env
PORT=3000
JWT_SECRET=
INTERNAL_API_KEY=

AUTH_SERVICE_URL=http://localhost:3001
FILMS_SERVICE_URL=http://localhost:3002
CINEMA_SERVICE_URL=http://localhost:3003
BOOKINGS_SERVICE_URL=http://localhost:3004
```

`JWT_SECRET` doit etre identique a celui du service Auth.
`INTERNAL_API_KEY` doit etre identique a celui de tous les services backend.

## Demarrage

```bash
yarn start:dev
# ou npm run start:dev
```

La gateway est accessible sur `http://localhost:3000`.  
La doc swagger sur `http://localhost:3000/api/docs`.

## Services cibles

| Prefixe          | Service  | Port par defaut |
|------------------|----------|-----------------|
| `/api/auth`      | Auth     | 3001            |
| `/api/movies`    | Films    | 3002            |
| `/api/cinemas`   | Cinemas  | 3003            |
| `/api/bookings`  | Bookings | 3004            |
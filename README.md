# Tchicket - Lancement du projet

## Prerequis

- Docker et Docker Compose installes
- Node.js >= 20
- `fuser` disponible (`sudo apt install psmisc` si absent)
- .env à setup dans chaque service, modèles disponibles à la racine de chaque projet

## Structure des services

| Service | Port | Swagger |
|---|---|---|
| API Gateway | 3000 | http://localhost:3000/api |
| Auth Service | 3001 | http://localhost:3001/api |
| Movie Service | 3002 | http://localhost:3002/api |
| Cinema Service | 3003 | http://localhost:3003/api |
| Booking Service | 3004 | http://localhost:3004/api |

## Documentation

| Service | Port | Swagger                    |
|---|---|----------------------------|
| API Gateway | 3000 | http://localhost:3000/docs |
| Auth Service | 3001 | http://localhost:3001/docs  |
| Movie Service | 3002 | http://localhost:3002/docs  |
| Cinema Service | 3003 | http://localhost:3003/docs  |
| Booking Service | 3004 | http://localhost:3004/docs  |

## Prisma Studio

| Service | URL |
|---|---|
| Auth | http://localhost:5555 |
| Cinema | http://localhost:5556 |
| Booking | http://localhost:5557 |

---

## Cinematique complete - premier demarrage

```bash
# 1. Installer les dependances de tous les services
make install

# 2. Demarrer les bases de donnees (Docker)
make db

# 3. Generer les clients Prisma et appliquer les migrations
make setup

# 4. (Optionnel) Alimenter les bases avec des donnees de test
make seed

# 5. Lancer tous les services en mode developpement
make dev

# 6. Monitorer les bdd
make studio
```

## Demarrage quotidien

Les bases de donnees et les migrations sont deja en place :

```bash
# 1. Installer les dependances de tous les services
make install

# 2. Demarrer les bases de donnees (Docker)
make db
```

---

## Arret des services


```bash
# Stoper tous les services
make stop

# Stoper les processus de monitoring db
make stop-studio

# Stoper et supprimer les containers db (les données sont sauvegardées dans leurs volumes sont conservées)
make stop-db

#  ! Nettoyer tous les processus Nest !
make panic
```
### Alternatives Mac pour stop-studio et panic

`fuser` n'est pas disponible sur Mac. Utiliser `lsof` a la place pour liberer les ports Prisma Studio :

```bash
lsof -ti :5555 | xargs kill -9
lsof -ti :5556 | xargs kill -9
lsof -ti :5557 | xargs kill -9
```
---

## Reference des commandes

### Dependances

| Commande | Description |
|---|---|
| `make install` | npm install dans tous les services |

### Bases de donnees

| Commande | Description |
|---|---|
| `make db` | Demarre les 3 conteneurs PostgreSQL |
| `make db-stop` | Arrete les conteneurs PostgreSQL |

### Prisma

| Commande | Description |
|---|---|
| `make generate` | Genere les clients Prisma (auth, cinema, booking) |
| `make migrate` | Cree et applique les migrations en dev (`--name init`) |
| `make migrate-deploy` | Applique les migrations existantes sans les recreer |
| `make seed` | Alimente les bases avec les donnees de seed |
| `make setup` | Raccourci : `generate` + `migrate` |

### Services

| Commande | Description |
|---|---|
| `make dev` | Lance tous les services en watch mode (logs dans `.logs/`) |
| `make gateway` | Lance uniquement l'API Gateway (logs dans le terminal) |
| `make auth` | Lance uniquement le service Auth |
| `make cinema` | Lance uniquement le service Cinema |
| `make booking` | Lance uniquement le service Booking |
| `make movie` | Lance uniquement le service Movie |
| `make logs` | Suit en temps reel les logs de tous les services |
| `make stop` | Arrete proprement tous les services via les PIDs stockes |

### Prisma Studio

| Commande | Description |
|---|---|
| `make studio` | Lance les 3 interfaces Prisma Studio en arriere-plan |

### Urgence

| Commande | Description |
|---|---|
| `make panic` | Tue tous les process Nest et Prisma Studio sans condition |

---

## Fonctionnement interne

`make dev` lance chaque service en arriere-plan et stocke les PIDs dans un fichier `.pids` a la racine. `make stop` lit ce fichier pour tuer chaque service individuellement.

Si `make stop` ne fonctionne pas (fichier `.pids` absent ou corrompu), utiliser `make panic` en dernier recours.

---

## Fichiers a ne pas commiter

Les fichiers suivants sont generes automatiquement et ne doivent pas etre commites.

``` bash
.logs/ #contenu
.pids
```

Le dossier `.logs/` contient les sorties de tous les services en mode `make dev` ainsi que les logs Prisma Studio. Ces fichiers peuvent contenir des donnees sensibles.

# FinFreelance — Backend

API REST costruita con NestJS + TypeORM + MySQL.

## Setup Locale

```bash
npm install
cp .env.example .env   # configura DB, JWT, ecc.

# Avvia MySQL e Redis con Docker (dalla root del progetto)
cd .. && docker compose up -d && cd backend

npm run migration:run
npm run start:dev      # http://localhost:3000/api/v1
```

Swagger: http://localhost:3000/api/docs

## Struttura

```
src/
├── modules/
│   ├── auth/          # Login, register, JWT (passport-local + passport-jwt)
│   ├── users/         # Profilo e dati fiscali utente
│   ├── transactions/  # CRUD transazioni (entrate/uscite)
│   ├── categories/    # CRUD categorie con flag isTaxable
│   ├── clients/       # CRUD clienti
│   ├── tax/           # Calcolo tasse (forfettario/ordinario, IRPEF, INPS)
│   └── dashboard/     # Statistiche aggregate per la dashboard
├── config/
│   └── typeorm.config.ts
├── database/
│   ├── migrations/
│   └── seeds/
├── app.module.ts
└── main.ts
```

Ogni modulo segue il pattern: `module` → `controller` → `service` → `entities/` → `dto/`.

## Endpoint Principali

### Auth
```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/profile        # JWT richiesto
```

### Users
```
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Transactions
```
GET    /api/v1/transactions       # supporta filtri: type, categoryId, clientId, dateFrom, dateTo
POST   /api/v1/transactions
GET    /api/v1/transactions/:id
PATCH  /api/v1/transactions/:id
DELETE /api/v1/transactions/:id
```

### Categories
```
GET    /api/v1/categories
POST   /api/v1/categories
PATCH  /api/v1/categories/:id
DELETE /api/v1/categories/:id
```

### Clients
```
GET    /api/v1/clients
POST   /api/v1/clients
GET    /api/v1/clients/:id
PATCH  /api/v1/clients/:id
DELETE /api/v1/clients/:id
```

### Tax
```
GET /api/v1/tax/summary?year=2024
```

### Dashboard
```
GET /api/v1/dashboard
```

Tutti gli endpoint (tranne register e login) richiedono `Authorization: Bearer <token>`.

## Variabili d'Ambiente

```env
NODE_ENV=development
PORT=3000

DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=finfreelance
DB_USERNAME=...
DB_PASSWORD=...
DB_SYNCHRONIZE=false
DB_LOGGING=false

JWT_SECRET=...
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=...

CORS_ORIGIN=http://localhost:5173
```

## Migrazioni

```bash
# Esegui migrations pendenti
npm run migration:run

# Crea una nuova migration (dal diff entità)
npm run migration:generate -- src/database/migrations/NomeMigrazione

# Rollback ultima migration
npm run migration:revert

# In produzione (dentro il container Docker)
docker exec finfreelance_backend npx typeorm migration:run -d dist/config/typeorm.config.js
```

## Seed

```bash
npm run seed    # crea categorie predefinite e utente di test
```

## Convenzioni

- Path alias: `@/` → `src/`, `@modules/`, `@config/`, `@common/`
- PK: UUID su tutte le entità
- Valori monetari: `decimal(10,2)`
- Strict mode: OFF (`noImplicitAny: false`, `strictNullChecks: false`)
- Validazione: `ValidationPipe` globale con `whitelist: true` e `forbidNonWhitelisted: true`
- I DTO di update non devono includere `id`, `createdAt`, `updatedAt` (il frontend deve stripparli prima dell'invio)

## Deploy (produzione)

Il backend gira in Docker. Per aggiornarlo:

```bash
git pull
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend
docker exec finfreelance_backend npx typeorm migration:run -d dist/config/typeorm.config.js
```

Log: `docker logs finfreelance_backend -f`

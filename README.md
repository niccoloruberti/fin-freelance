# FinFreelance

App di contabilità per freelance italiani. Gestisce transazioni, clienti, calcolo tasse in regime forfettario/ordinario e dashboard finanziaria.

## Stack

| Layer | Tecnologia |
|---|---|
| Frontend | Vue 3 + TypeScript + Tailwind CSS + Pinia + Vite |
| Backend | NestJS + TypeScript + TypeORM |
| Database | MySQL 8.0 |
| Auth | JWT (passport-jwt) + bcrypt |
| Infra dev | Docker Compose (MySQL + phpMyAdmin + Redis) |

## Struttura

```
finfreelance/
├── frontend/              # Vue 3 SPA
│   └── src/
│       ├── views/         # Pagine (auth/, Dashboard, Transactions, Clients, ...)
│       ├── components/    # Componenti riutilizzabili (crud/)
│       ├── layouts/       # AppLayout.vue (sidebar + contenuto)
│       ├── stores/        # Pinia (auth.ts)
│       ├── services/      # Axios API client (api.ts)
│       ├── types/         # Interfacce TypeScript (index.ts)
│       └── router/        # Vue Router con auth guards
├── backend/               # NestJS API
│   └── src/
│       ├── modules/       # auth, users, transactions, categories, clients, tax, dashboard
│       ├── config/        # TypeORM config
│       └── database/      # migrations/, seeds/
├── docker-compose.yml     # Sviluppo locale
├── docker-compose.prod.yml# Produzione
└── CLAUDE.md              # Istruzioni per AI assistant
```

## Setup Locale

### Prerequisiti

- Node.js 18+
- Docker + Docker Compose

### 1. Avvia i servizi Docker

```bash
docker compose up -d
# MySQL :3306, phpMyAdmin :8080, Redis :6379
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env    # configura le variabili (DB, JWT, ecc.)
npm run migration:run
npm run start:dev        # http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Il frontend proxia `/api` → `localhost:3000` tramite Vite.

## URL Sviluppo

| Servizio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api/v1 |
| Swagger | http://localhost:3000/api/docs |
| phpMyAdmin | http://localhost:8080 |

## Database

Tabelle principali (UUID come PK, timestamp su tutte):

- **users** — email, password (bcrypt), dati anagrafici, regime fiscale (forfettario/ordinario), coefficienti IRPEF/INPS
- **transactions** — type (income/expense), amount, date, description, invoiceNumber → appartiene a user, category, client
- **categories** — name, type (income/expense/both), icon, color, isDefault, isTaxable (flag per includere nel calcolo tasse)
- **clients** — anagrafica completa → appartiene a user

Cascade delete: eliminare un utente rimuove le sue transazioni e i suoi clienti.

## Migrazioni

```bash
# In sviluppo (dall'host, con .env configurato)
cd backend
npm run migration:run

# In produzione (dentro il container)
docker exec finfreelance_backend npx typeorm migration:run -d dist/config/typeorm.config.js

# Creare una nuova migrazione
npm run migration:generate -- src/database/migrations/NomeMigrazione
```

## Funzionalità Implementate

- Autenticazione (register, login, JWT, profilo)
- Gestione transazioni (CRUD completo, filtri per tipo/categoria/cliente/data)
- Gestione categorie (CRUD, flag isTaxable per calcolo tasse)
- Gestione clienti (CRUD completo)
- Dashboard finanziaria (entrate/uscite/saldo, grafici mensili)
- Calcolo tasse automatico (regime forfettario e ordinario, INPS, IRPEF)
- Impostazioni utente (dati fiscali, regime, coefficienti)

## Architettura Backend

- **Prefisso API**: `api/v1`
- **Pattern moduli**: ogni feature ha `module`, `controller`, `service`, `entities/`, `dto/`
- **Validazione**: `ValidationPipe` globale con `whitelist: true` e `forbidNonWhitelisted: true`
- **Auth**: passport-local login → JWT → `JwtAuthGuard` sulle route protette
- **Valori monetari**: colonne `decimal(10,2)`

## Architettura Frontend

- `<script setup>` (Composition API)
- Axios con interceptor: aggiunge Bearer token automaticamente, redirect `/login` su 401
- Route guards via meta `requiresAuth` / `requiresGuest`
- Path alias `@/` → `src/`

## Deploy (VPS)

### Architettura produzione

```
Internet → Nginx :80
  ├── /       → file statici  /var/www/finfreelance/frontend/dist
  └── /api    → proxy         → Docker backend :3000
```

Il backend (NestJS), MySQL e Redis girano in Docker. Il frontend è servito da Nginx come file statici.

### Procedura di deploy

```bash
# Sul VPS, dalla root del progetto
git pull

# 1. Rebuilda e aggiorna il frontend
cd frontend
npm ci
npm run build
cd ..

# 2. Rebuilda e riavvia il container backend
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend

# 3. Esegui le migrazioni (se presenti)
docker exec finfreelance_backend npx typeorm migration:run -d dist/config/typeorm.config.js
```

### Config Nginx (attuale)

```nginx
server {
    listen 80;
    server_name <IP_VPS>;

    location / {
        root /var/www/finfreelance/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Comandi utili sul VPS

```bash
# Stato container
docker ps

# Log backend
docker logs finfreelance_backend -f

# Accesso MySQL diretto
docker exec finfreelance_mysql mysql -uroot -p<DB_ROOT_PASSWORD> finfreelance

# Riavvio nginx
systemctl restart nginx
```

## Convenzioni

- File: `kebab-case` (es. `auth.service.ts`, `tax-summary.vue`)
- Classi/Interfacce: `PascalCase`
- Variabili: `camelCase`
- Lingua: codice in inglese, testo UI in italiano
- Backend: strict mode OFF (`noImplicitAny: false`)
- Frontend: strict mode ON

## Variabili d'Ambiente

**Backend** (`.env`): `NODE_ENV`, `PORT`, `DB_*`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`

**Frontend** (`.env`): `VITE_API_URL`, `VITE_APP_TITLE`

I file `.env` sono in `.gitignore` — non commitarli mai.

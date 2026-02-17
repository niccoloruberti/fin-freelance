# CLAUDE.md - FinFreelance

## Role

Comportati da **Tech Lead** del progetto. Quando l'utente propone una feature o un approccio implementativo:

1. **Valuta** se la soluzione proposta è corretta e adeguata al contesto del progetto
2. **Confronta** con alternative migliori in termini di scalabilità, manutenibilità, performance e best practice
3. **Consiglia** l'approccio migliore, spiegando brevemente il perché
4. **Segnala** eventuali rischi, trade-off o problemi architetturali prima di procedere

Non limitarti ad eseguire: ragiona criticamente su ogni richiesta e proponi la soluzione ottimale. Se l'approccio dell'utente è già buono, confermalo e procedi.

## Project Overview

FinFreelance is a full-stack accounting management app for Italian freelancers. It provides automatic tax calculations (regime forfettario/ordinario), financial dashboards, transaction tracking, and client management.

## Tech Stack

- **Frontend**: Vue 3 (Composition API) + TypeScript + Tailwind CSS + Pinia + Vite
- **Backend**: NestJS + TypeScript + TypeORM
- **Database**: MySQL 8.0
- **Auth**: JWT (passport-jwt) + bcrypt
- **Infra**: Docker Compose (MySQL, phpMyAdmin, Redis)

## Project Structure

```
finfreelance/
├── frontend/              # Vue 3 SPA
│   ├── src/
│   │   ├── views/         # Page components (auth/, Dashboard, Transactions, etc.)
│   │   ├── components/    # Reusable components (crud/)
│   │   ├── layouts/       # AppLayout.vue (sidebar + main content)
│   │   ├── stores/        # Pinia stores (auth.ts)
│   │   ├── services/      # Axios API client (api.ts)
│   │   ├── types/         # TypeScript interfaces (index.ts)
│   │   └── router/        # Vue Router with auth guards
│   └── tailwind.config.js # Custom primary color palette
├── backend/               # NestJS API
│   ├── src/
│   │   ├── modules/       # Feature modules (auth, users, transactions, categories, clients, tax, recurring, dashboard)
│   │   ├── config/        # TypeORM config
│   │   └── database/      # Migrations and seeds
│   └── .env.example       # Environment template
└── docker-compose.yml     # MySQL + phpMyAdmin + Redis
```

## Development Commands

```bash
# Backend (from /backend)
npm run start:dev          # Dev server on :3000
npm run build              # Compile to dist/
npm run migration:run      # Run DB migrations
npm run test               # Unit tests (Jest)
npm run test:e2e           # E2E tests

# Frontend (from /frontend)
npm run dev                # Dev server on :5173 (proxies /api to :3000)
npm run build              # Production build
npm run preview            # Preview production build

# Docker (from root)
docker-compose up -d       # Start MySQL, phpMyAdmin, Redis
```

## Key URLs (Development)

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs
- phpMyAdmin: http://localhost:8080

## Architecture & Patterns

### Backend
- **Module pattern**: each feature has module, controller, service, entities/, dto/
- **API prefix**: `api/v1` (global)
- **Validation**: global ValidationPipe with whitelist + transform
- **Auth flow**: passport-local login → JWT token → JwtAuthGuard on protected routes
- **Path aliases**: `@/`, `@config/`, `@modules/`, `@common/`
- **Entities use UUIDs** as primary keys
- **Monetary values**: `decimal(10,2)` columns

### Frontend
- **Composition API** with `<script setup>` syntax
- **Pinia** for state management (auth store persists token in localStorage)
- **Axios interceptors**: auto-attach Bearer token, redirect to /login on 401
- **Route guards**: `requiresAuth` and `requiresGuest` meta fields
- **Path alias**: `@/` → `src/`
- **Tailwind** with custom primary color palette (teal/blue tones)
- **Headless UI** + **Heroicons** for accessible components
- **Chart.js** via vue-chartjs for data visualization
- **vee-validate** + **yup** for form validation
- **date-fns** for date formatting

## Database Schema

Four main tables, all with UUID PKs and timestamps:

- **users**: email, password (bcrypt), firstName, lastName, vatNumber, fiscalCode, taxRegime (forfettario|ordinario), taxCoefficientIncome, taxRateSubstitutive
- **transactions**: type (income|expense), amount, description, date, invoiceNumber, isRecurring → belongs to user, category, client
- **categories**: name, type (income|expense|both), icon, color, isDefault
- **clients**: name, email, phone, vatNumber, fiscalCode, address fields, notes → belongs to user

Cascade delete: user deletion removes their transactions and clients.

## Implementation Status

### Complete
- Auth module (login, register, JWT, profile)
- Users CRUD
- Database schema & migrations
- Frontend auth flow (login, register, route guards)
- App layout with sidebar navigation

### Partial / Skeleton
- Transactions (GET only, missing POST/PATCH/DELETE)
- Categories, Clients, Tax, Recurring, Dashboard modules (entity/module setup only)
- Frontend views exist as skeletons

## Conventions

- **File naming**: kebab-case (e.g., `auth.service.ts`, `tax-summary.vue`)
- **Classes/Interfaces**: PascalCase
- **Variables**: camelCase
- **Language**: Code in English, UI text in Italian
- **Formatting**: Prettier + ESLint (both frontend and backend)
- **Backend strict mode**: OFF (noImplicitAny: false, strictNullChecks: false)
- **Frontend strict mode**: ON (strict: true in tsconfig)

## Environment Variables

Backend (.env): NODE_ENV, PORT, DB_*, JWT_SECRET, JWT_EXPIRES_IN, JWT_REFRESH_SECRET, CORS_ORIGIN
Frontend (.env): VITE_API_URL, VITE_APP_TITLE

Never commit .env files (they're in .gitignore).

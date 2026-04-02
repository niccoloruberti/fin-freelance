# FinFreelance — Frontend

SPA Vue 3 + TypeScript + Tailwind CSS.

## Setup Locale

```bash
npm install
npm run dev    # http://localhost:5173
```

Il dev server proxia `/api` → `http://localhost:3000` tramite Vite (configurato in `vite.config.ts`).

## Struttura

```
src/
├── views/
│   ├── auth/              # Login.vue, Register.vue
│   ├── Dashboard.vue
│   ├── TransactionsView.vue
│   ├── ClientsView.vue
│   ├── CategoriesView.vue
│   ├── TaxSummaryView.vue
│   └── SettingsView.vue
├── components/
│   └── crud/              # CrudTable.vue, CrudModal.vue — componenti generici per CRUD
├── layouts/
│   └── AppLayout.vue      # Sidebar + contenuto principale
├── stores/
│   └── auth.ts            # Pinia: token JWT in localStorage
├── services/
│   └── api.ts             # Axios: attach Bearer token, redirect /login su 401
├── types/
│   └── index.ts           # Interfacce TypeScript (User, Transaction, Category, Client, ...)
├── router/
│   └── index.ts           # Route guards: requiresAuth / requiresGuest
├── App.vue
└── main.ts
```

## Rotte

| Path | Vista | Auth |
|---|---|---|
| `/login` | Login.vue | guest only |
| `/register` | Register.vue | guest only |
| `/dashboard` | Dashboard.vue | richiede auth |
| `/transactions` | TransactionsView.vue | richiede auth |
| `/clients` | ClientsView.vue | richiede auth |
| `/categories` | CategoriesView.vue | richiede auth |
| `/tax-summary` | TaxSummaryView.vue | richiede auth |
| `/settings` | SettingsView.vue | richiede auth |
| `/` | redirect → `/dashboard` | — |

## Pattern Principali

### Componente CRUD generico

`CrudTable` + `CrudModal` in `components/crud/` gestiscono lista, creazione e modifica per tutte le entità (categorie, clienti, ecc.).

Quando si usa `CrudModal` in modifica, il form viene inizializzato con l'oggetto completo ma **bisogna strippare `id`, `createdAt`, `updatedAt` prima di inviare la PUT** — il backend li rifiuta con 400.

```typescript
const { id, createdAt, updatedAt, ...payload } = data
await api.put(`/categories/${editingItem.value.id}`, payload)
```

### Auth flow

1. Login → backend ritorna JWT
2. Token salvato in `localStorage` via Pinia store
3. Axios interceptor aggiunge `Authorization: Bearer <token>` ad ogni richiesta
4. Su risposta 401 → redirect automatico a `/login`

### Axios

Configurato in `src/services/api.ts`. Base URL da `VITE_API_URL` (`.env`).

## Variabili d'Ambiente

```env
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_TITLE=FinFreelance
```

In produzione (`frontend/.env.production`) punta all'IP/dominio del VPS.

## Build Produzione

```bash
npm run build    # output in dist/
```

I file `dist/` vengono serviti da Nginx sul VPS. Dopo ogni modifica al frontend fare `npm run build` sul VPS e ricaricare Nginx se necessario.

## Tecnologie

- **Vue 3** — Composition API con `<script setup>`
- **Pinia** — state management
- **Vue Router** — routing con guards
- **Axios** — HTTP client
- **Tailwind CSS** — styling (colori primari personalizzati in `tailwind.config.js`)
- **Headless UI** + **Heroicons** — componenti accessibili e icone
- **Chart.js** via vue-chartjs — grafici dashboard
- **vee-validate** + **yup** — validazione form
- **date-fns** — formattazione date

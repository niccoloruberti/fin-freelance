# FinFreelance Frontend

Frontend web application costruita con Vue 3, TypeScript e Tailwind CSS.

## 🚀 Quick Start

### 1. Installazione Dipendenze

```bash
npm install
```

### 2. Configurazione Environment

```bash
cp .env.example .env
# Modifica VITE_API_URL se necessario
```

### 3. Avvio Development Server

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## 🏗️ Build per Produzione

```bash
npm run build
npm run preview  # Preview build locale
```

I file di build saranno in `dist/`

## 📁 Struttura del Progetto

```
frontend/
├── public/               # Asset statici
├── src/
│   ├── assets/          # CSS, immagini, fonts
│   ├── components/      # Componenti riutilizzabili
│   ├── views/           # Pagine/Route
│   ├── router/          # Vue Router config
│   ├── stores/          # Pinia stores (state management)
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.vue          # Root component
│   └── main.ts          # Entry point
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 🎨 Tecnologie Utilizzate

- **Vue 3** - Framework JavaScript progressivo
- **TypeScript** - Type safety
- **Vite** - Build tool veloce
- **Pinia** - State management
- **Vue Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Chart.js** - Grafici
- **VeeValidate** - Form validation

## 🗺️ Rotte

- `/` - Redirect a dashboard
- `/login` - Login
- `/register` - Registrazione
- `/dashboard` - Dashboard principale
- `/transactions` - Gestione transazioni
- `/clients` - Gestione clienti
- `/tax-summary` - Riassunto fiscale
- `/settings` - Impostazioni utente

## 🎯 Funzionalità Principali

### Dashboard
- Overview finanziaria
- Grafici andamento
- Statistiche rapide

### Transazioni
- Lista entrate/uscite
- Filtri e ricerca
- Form inserimento
- Export PDF

### Clienti
- Anagrafica completa
- Storico transazioni
- Gestione contatti

### Riassunto Fiscale
- Calcolo tasse automatico
- Visualizzazione regime forfettario
- Export per commercialista

### Impostazioni
- Profilo utente
- Configurazione fiscale
- Preferenze app

## 🔐 Autenticazione

L'app utilizza JWT per l'autenticazione. Il token viene salvato in `localStorage` e incluso automaticamente nelle richieste API tramite interceptor Axios.

## 🎨 Personalizzazione Styling

### Tailwind Config

Colori primari personalizzabili in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Modifica questi valori
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
      }
    }
  }
}
```

### CSS Utilities

Classi custom in `src/assets/main.css`:
- `.btn` - Bottoni base
- `.btn-primary` - Bottone primario
- `.btn-secondary` - Bottone secondario
- `.card` - Card container
- `.input` - Input base

## 📊 State Management

Utilizza Pinia per gestione dello stato:

```typescript
// Esempio uso store
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
authStore.login(credentials)
```

## 🔌 API Service

Configurato in `src/services/api.ts` con:
- Base URL da env
- Interceptor per auth token
- Gestione errori automatica
- Redirect su 401

## 🧪 Testing

```bash
# Unit tests (TODO)
npm run test

# E2E tests (TODO)
npm run test:e2e
```

## 🚀 Deploy su Digital Ocean

### Con Nginx

1. **Build applicazione**
```bash
npm run build
```

2. **Upload `dist/` su server**
```bash
scp -r dist/* user@your-server:/var/www/finfreelance
```

3. **Configura Nginx**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/finfreelance;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Con Vercel/Netlify

1. Collega repository GitHub
2. Configura build command: `npm run build`
3. Directory output: `dist`
4. Deploy automatico!

## 🔧 Configurazione Proxy

In development, Vite proxy le richieste API:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

## 📝 Best Practices

### Composables

Crea composables riutilizzabili in `src/composables/`:
```typescript
// useTransactions.ts
export function useTransactions() {
  const transactions = ref([])
  
  async function fetchTransactions() {
    // Logic
  }
  
  return { transactions, fetchTransactions }
}
```

### Type Safety

Definisci sempre i tipi in `src/types/`:
```typescript
export interface Transaction {
  id: string
  amount: number
  // ...
}
```

## 🐛 Troubleshooting

### Hot Reload non funziona
- Riavvia dev server
- Controlla file watcher limits (Linux)

### Errori CORS
- Verifica configurazione backend
- Controlla proxy Vite

### Build errors
- Cancella `node_modules` e reinstalla
- Controlla TypeScript errors

## 📚 Risorse

- [Vue 3 Documentation](https://vuejs.org)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Pinia Documentation](https://pinia.vuejs.org)

## 🤝 Contributi

TODO: Guidelines per contribuire

## 📄 Licenza

MIT

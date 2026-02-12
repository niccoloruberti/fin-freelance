# FinFreelance - Contabilità Smart

Applicazione di gestione contabile per freelance con calcolo automatico delle tasse e dashboard analitica.

## 🚀 Stack Tecnologico

- **Frontend**: Vue 3 (Composition API) + TypeScript + Tailwind CSS
- **Backend**: NestJS + TypeScript
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Autenticazione**: JWT
- **Deploy**: Digital Ocean

## 📁 Struttura Progetto

```
finfreelance/
├── frontend/          # Applicazione Vue 3
├── backend/           # API NestJS
├── docker-compose.yml # Configurazione Docker per sviluppo locale
└── README.md
```

## 🛠️ Setup Locale

### Prerequisiti

- Node.js 18+
- npm o yarn
- MySQL 8.0 (o Docker)
- Git

### 1. Clone del Repository

```bash
git clone <your-repo-url>
cd finfreelance
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Configura le variabili d'ambiente in .env
npm run start:dev
```

Il backend sarà disponibile su `http://localhost:3000`

### 3. Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configura le variabili d'ambiente in .env
npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`

### 4. Setup Database (con Docker)

```bash
# Dalla root del progetto
docker-compose up -d
```

Oppure installa MySQL localmente e crea il database:

```sql
CREATE DATABASE finfreelance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 🗄️ Migrazioni Database

```bash
cd backend
npm run migration:run
npm run seed  # (opzionale) per dati di test
```

## 🚢 Deploy su Digital Ocean

### Preparazione

1. Crea un Droplet Ubuntu 22.04
2. Installa Node.js, MySQL e Nginx
3. Configura il firewall e SSL con Let's Encrypt

### Build

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

### Deploy

Segui la guida in `docs/deploy.md` per il deploy completo su Digital Ocean.

## 📝 Funzionalità Principali

- ✅ Dashboard finanziaria con grafici
- ✅ Gestione transazioni (entrate/uscite)
- ✅ Calcolo automatico tasse (regime forfettario)
- ✅ Riassunto fiscale annuale
- ✅ Gestione clienti
- ✅ Ricorrenze automatiche
- ✅ Export PDF per commercialista
- ✅ Multi-utente con autenticazione
- ✅ Backup automatico dati

## 🔐 Sicurezza

- Autenticazione JWT con refresh token
- Password hashate con bcrypt
- Validazione input con class-validator
- Rate limiting su API
- CORS configurato
- SQL injection prevention (TypeORM)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📚 Documentazione

- [API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Database Schema](./docs/database.md)
- [Deploy Guide](./docs/deploy.md)

## 🤝 Contributi

Contributions are welcome! Please read our contributing guidelines first.

## 📄 Licenza

MIT License - vedi [LICENSE](LICENSE) per dettagli.

## 👨‍💻 Autore

Il tuo nome - [GitHub](https://github.com/tuousername)

## 🐛 Bug e Richieste

Usa [GitHub Issues](https://github.com/tuousername/finfreelance/issues) per segnalare bug o richiedere nuove funzionalità.

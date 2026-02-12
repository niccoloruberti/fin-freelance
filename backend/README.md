# FinFreelance Backend

Backend API costruito con NestJS, TypeORM e MySQL per la gestione contabile freelance.

## 🚀 Quick Start

### 1. Installazione Dipendenze

```bash
npm install
```

### 2. Configurazione Environment

```bash
cp .env.example .env
# Modifica .env con le tue configurazioni
```

### 3. Avvio Database (Docker)

```bash
# Dalla root del progetto
cd ..
docker-compose up -d mysql
```

### 4. Esecuzione Migrazioni

```bash
npm run migration:run
```

### 5. Avvio Server

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

L'API sarà disponibile su `http://localhost:3000/api/v1`

Documentazione Swagger: `http://localhost:3000/api/docs`

## 📁 Struttura del Progetto

```
backend/
├── src/
│   ├── modules/          # Moduli funzionali
│   │   ├── auth/         # Autenticazione JWT
│   │   ├── users/        # Gestione utenti
│   │   ├── transactions/ # Transazioni
│   │   ├── categories/   # Categorie
│   │   ├── clients/      # Clienti
│   │   ├── tax/          # Calcoli fiscali
│   │   ├── dashboard/    # Dashboard analytics
│   │   └── recurring/    # Transazioni ricorrenti
│   ├── common/           # Utilities comuni
│   ├── config/           # Configurazioni
│   ├── database/         # Migrations e seeds
│   ├── app.module.ts     # Modulo principale
│   └── main.ts           # Entry point
├── test/                 # Test E2E
├── .env.example          # Template variabili ambiente
└── package.json
```

## 🔌 API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Registrazione utente
- `POST /api/v1/auth/login` - Login utente
- `GET /api/v1/auth/profile` - Profilo utente (richiede JWT)

### Users

- `GET /api/v1/users` - Lista utenti
- `GET /api/v1/users/:id` - Dettaglio utente
- `PATCH /api/v1/users/:id` - Aggiorna utente
- `DELETE /api/v1/users/:id` - Elimina utente

### Transactions

- `GET /api/v1/transactions` - Lista transazioni
- `POST /api/v1/transactions` - Crea transazione
- `GET /api/v1/transactions/:id` - Dettaglio transazione
- `PATCH /api/v1/transactions/:id` - Aggiorna transazione
- `DELETE /api/v1/transactions/:id` - Elimina transazione

*Altri endpoint in sviluppo...*

## 🗄️ Schema Database

### Users
- Informazioni utente
- Regime fiscale (forfettario/ordinario)
- Coefficienti fiscali personalizzabili

### Transactions
- Entrate/Uscite
- Collegamento a categoria e cliente
- Supporto fatture e ricorrenze

### Categories
- Categorie personalizzabili
- Icone e colori
- Categorie di sistema vs utente

### Clients
- Anagrafica clienti completa
- P.IVA e Codice Fiscale
- Storico transazioni

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🔐 Autenticazione

L'API utilizza JWT (JSON Web Tokens) per l'autenticazione.

Header richiesto per endpoint protetti:
```
Authorization: Bearer <your-jwt-token>
```

## 📝 Migrazioni Database

```bash
# Genera nuova migration
npm run migration:generate -- src/database/migrations/MigrationName

# Esegui migrations
npm run migration:run

# Rollback ultima migration
npm run migration:revert
```

## 🌱 Seed Data

```bash
npm run seed
```

Crea dati di esempio per lo sviluppo:
- Utente di test
- Categorie predefinite
- Transazioni esempio

## 🚀 Deploy su Digital Ocean

1. **Crea Droplet Ubuntu 22.04**

2. **Installa Node.js e MySQL**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server
```

3. **Clone e Build**
```bash
git clone <your-repo>
cd finfreelance/backend
npm install
npm run build
```

4. **Configura PM2**
```bash
npm install -g pm2
pm2 start dist/main.js --name finfreelance-api
pm2 startup
pm2 save
```

5. **Configura Nginx come reverse proxy**

## 📚 Risorse

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [MySQL Documentation](https://dev.mysql.com/doc)

## 🐛 Troubleshooting

### Errore connessione database
- Verifica che MySQL sia in esecuzione
- Controlla credenziali in `.env`
- Verifica che il database esista

### Errore JWT
- Verifica `JWT_SECRET` in `.env`
- Controlla scadenza token

## 🤝 Contributi

TODO: Aggiungi guidelines per contribuire

## 📄 Licenza

MIT

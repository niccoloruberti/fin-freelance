# 🚀 FinFreelance - Guida Rapida

## Cosa hai ricevuto

Un progetto full-stack completo per la gestione contabile freelance con:

### Backend (NestJS + MySQL)
✅ Autenticazione JWT completa
✅ Entità database (Users, Transactions, Categories, Clients)
✅ Moduli base implementati
✅ Swagger documentation setup
✅ TypeORM configurato
✅ Validazione input
✅ CORS configurato

### Frontend (Vue 3 + TypeScript + Tailwind)
✅ Routing configurato
✅ State management (Pinia)
✅ Autenticazione UI
✅ Dashboard layout
✅ API service con interceptors
✅ Design responsive
✅ Componenti base

### Infrastructure
✅ Docker Compose per MySQL
✅ Script di setup automatico
✅ Configurazioni complete
✅ README dettagliati

## 📦 Installazione Veloce

### Metodo 1: Script Automatico (Raccomandato)

```bash
cd finfreelance
chmod +x setup.sh
./setup.sh
```

Lo script:
- Verifica prerequisiti
- Installa dipendenze backend e frontend
- Avvia MySQL con Docker
- Esegue le migrations
- Ti guida sui prossimi passi

### Metodo 2: Manuale

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env
# Modifica .env con le tue credenziali MySQL
npm run start:dev
```

**2. Database**
```bash
# Dalla root
docker-compose up -d mysql
# Oppure installa MySQL manualmente

# Migrations
cd backend
npm run migration:run
```

**3. Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 🌐 Accesso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **API Docs**: http://localhost:3000/api/docs
- **phpMyAdmin**: http://localhost:8080 (se usi Docker)

## 🎯 Prossimi Passi

### Per iniziare subito:

1. **Prova l'autenticazione**
   - Vai su http://localhost:5173/register
   - Crea un account
   - Accedi con le credenziali

2. **Esplora la Dashboard**
   - Visualizza il layout base
   - Controlla i widget delle statistiche

3. **Testa le API**
   - Vai su http://localhost:3000/api/docs
   - Prova gli endpoint di autenticazione
   - Testa le transazioni

### Per completare l'applicazione:

Consulta `TODO.md` per una lista completa delle funzionalità da implementare. Le priorità principali sono:

**Backend (1-2 giorni)**
- Completare CRUD Transactions (POST, PATCH, DELETE)
- Implementare Tax Calculator
- Creare Dashboard Analytics endpoint
- Aggiungere Categories e Clients CRUD

**Frontend (2-3 giorni)**
- Completare form Transazioni
- Implementare lista transazioni con filtri
- Creare gestione Clienti
- Implementare Riassunto Fiscale con grafici
- Completare Impostazioni

## 📚 Documentazione

- **README principale**: Panoramica progetto
- **backend/README.md**: Dettagli API e database
- **frontend/README.md**: Dettagli frontend e componenti
- **TODO.md**: Roadmap completa

## 🔧 Configurazioni Importanti

### Backend (.env)
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=finfreelance_user
DB_PASSWORD=finfreelance_pass
DB_DATABASE=finfreelance

JWT_SECRET=your-secret-key-change-in-production
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🎨 Personalizzazione

### Colori
Modifica `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#TUO_COLORE',
    600: '#TUO_COLORE',
    // ...
  }
}
```

### Logo e Branding
- Sostituisci logo in `frontend/public/`
- Modifica titoli in `frontend/index.html`
- Aggiorna nome app nei vari README

## 🚀 Deploy su Digital Ocean

### Droplet Setup
```bash
# Sul server
git clone <your-repo>
cd finfreelance

# Backend
cd backend
npm install --production
npm run build
pm2 start dist/main.js --name finfreelance-api

# Frontend
cd ../frontend
npm install
npm run build
# Copia dist/ in /var/www/finfreelance
```

### Nginx Config
```nginx
# Frontend
server {
    server_name your-domain.com;
    root /var/www/finfreelance;
    
    location / {
        try_files $uri /index.html;
    }
}

# Backend API
server {
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
    }
}
```

## 🐛 Problemi Comuni

### "Cannot connect to database"
- Verifica che MySQL sia in esecuzione
- Controlla credenziali in backend/.env
- Se usi Docker: `docker-compose logs mysql`

### "Port 3000 already in use"
- Cambia porta in backend/.env: `PORT=3001`
- Aggiorna VITE_API_URL nel frontend

### "Module not found"
- Cancella node_modules: `rm -rf node_modules`
- Reinstalla: `npm install`

### CORS errors
- Verifica CORS_ORIGIN in backend/.env
- Deve corrispondere all'URL frontend

## 💻 Comandi Utili

**Backend**
```bash
npm run start:dev      # Development
npm run build          # Build
npm run start:prod     # Production
npm run migration:run  # Run migrations
npm run test           # Run tests
```

**Frontend**
```bash
npm run dev      # Development
npm run build    # Build production
npm run preview  # Preview build
npm run lint     # Lint code
```

**Docker**
```bash
docker-compose up -d        # Start services
docker-compose down         # Stop services
docker-compose logs mysql   # View MySQL logs
```

## 📊 Database

### Accesso MySQL
**Via Docker:**
```bash
docker exec -it finfreelance_mysql mysql -u finfreelance_user -p
```

**Via phpMyAdmin:**
http://localhost:8080

### Schema Principale
- `users` - Utenti e configurazione fiscale
- `transactions` - Entrate e uscite
- `categories` - Categorie transazioni
- `clients` - Anagrafica clienti

## 🤝 Support

Per domande o problemi:
1. Controlla i README dettagliati
2. Consulta la sezione Troubleshooting
3. Cerca negli issue GitHub (se disponibile)
4. Apri un nuovo issue

## 📝 Note Finali

Questo è un progetto di base funzionante che richiede ulteriore sviluppo per essere production-ready. Consulta TODO.md per la lista completa delle feature da implementare.

Le funzionalità core (auth, database, routing, API base) sono già implementate e testate. Puoi procedere con lo sviluppo delle feature specifiche in base alle tue priorità.

Buon coding! 🚀

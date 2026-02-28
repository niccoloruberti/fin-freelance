# FinFreelance - TODO List

Questo file contiene le funzionalità da implementare per completare l'applicazione.

## 🔥 Priorità Alta

### Backend

- [ ] **Completare CRUD Transactions**
  - [x] Create endpoint (POST /transactions)
  - [x] Update endpoint (PATCH /transactions/:id)
  - [x] Delete endpoint (DELETE /transactions/:id)
  - [ ] Filtri avanzati (per data, tipo, categoria, cliente)
  - [ ] Paginazione

- [ ] **Completare CRUD Categories**
  - [x] Tutti gli endpoint CRUD (GET, POST, PUT, DELETE)
  - [ ] Categorie custom per utente (attualmente le categorie sono globali)

- [ ] **Completare CRUD Clients**
  - [x] Tutti gli endpoint CRUD (GET, POST, PATCH, DELETE)
  - [ ] Ricerca clienti

- [ ] **Tax Calculator Service**
  - [ ] Calcolo automatico tasse regime forfettario
  - [ ] Calcolo tasse regime ordinario
  - [ ] Endpoint GET /tax/summary/:year
  - [ ] Previsioni fiscali

- [ ] **Dashboard Analytics**
  - [ ] Endpoint GET /dashboard/stats
  - [ ] Aggregazioni per periodo
  - [ ] Statistiche clienti
  - [ ] Grafici andamento

- [ ] **Recurring Transactions**
  - [ ] Entity per ricorrenze
  - [ ] Cron job per creazione automatica
  - [ ] Gestione ricorrenze (mensili, trimestrali, annuali)

### Frontend

- [ ] **Completare Registrazione**
  - [ ] Form completo
  - [ ] Validazione
  - [ ] Gestione errori

- [ ] **Dashboard Completa**
  - [ ] Integrazione API
  - [ ] Grafici interattivi (Chart.js)
  - [ ] Widget configurabili
  - [ ] Export dati

- [ ] **Gestione Transazioni**
  - [ ] Lista con tabella
  - [ ] Form creazione/modifica
  - [ ] Modal dettaglio
  - [ ] Filtri avanzati
  - [ ] Ricerca
  - [ ] Ordinamento colonne
  - [ ] Paginazione
  - [ ] Azioni bulk (selezione multipla)

- [ ] **Gestione Clienti**
  - [x] Lista clienti
  - [x] Form anagrafica completa (CRUD modal)
  - [ ] Dettaglio cliente con storico transazioni
  - [ ] Ricerca e filtri

- [ ] **Riassunto Fiscale**
  - [ ] Vista annuale
  - [ ] Dettaglio calcoli
  - [ ] Simulatore ("Cosa succederebbe se...")
  - [ ] Export PDF per commercialista
  - [ ] Timeline scadenze fiscali

- [ ] **Impostazioni**
  - [ ] Profilo utente
  - [ ] Configurazione fiscale (coefficienti, aliquote)
  - [ ] Preferenze app
  - [ ] Gestione password
  - [ ] Backup/Export dati

## 🎯 Priorità Media

### Features Aggiuntive

- [ ] **Generazione Ricevute/Fatture**
  - [ ] Template ricevuta/fattura in PDF (logo, dati freelancer, dati cliente, importo, IVA/ritenuta)
  - [ ] Backend: endpoint POST /invoices/generate → restituisce PDF
  - [ ] Libreria suggerita: `@nestjs/pdf` con Puppeteer o `pdfmake`
  - [ ] Numerazione automatica progressiva per anno
  - [ ] Collegamento ricevuta → transazione (1:1)
  - [ ] Frontend: pulsante "Genera ricevuta" dal dettaglio transazione
  - [ ] Download PDF e/o invio via email al cliente
  - [ ] Storico ricevute emesse per cliente

- [ ] **Calendario Scadenze & Appuntamenti**
  - [ ] Vista calendario integrata (mensile/settimanale) nel frontend
  - [ ] Libreria suggerita: `FullCalendar` con vue3 adapter
  - [ ] Backend: entity `events` (title, date, type, relatedTransactionId?)
  - [ ] Tipi evento: scadenza fiscale, pagamento atteso, appuntamento cliente
  - [ ] **Integrazione Google Calendar** (OAuth2 + Google Calendar API)
    - [ ] Flusso OAuth2 per connettere account Google dell'utente
    - [ ] Sync bidirezionale: eventi app → Google Calendar e viceversa
    - [ ] Webhook per aggiornamenti in tempo reale
  - [ ] **Integrazione iCloud Calendar** (CalDAV)
  - [ ] **Integrazione Outlook/Microsoft Calendar** (Microsoft Graph API)
  - [ ] Export ICS (standard universale, compatibile con tutti i calendari)
  - [ ] Notifiche/reminder per scadenze imminenti

- [ ] **Conformità GDPR**
  - [ ] **Diritto all'oblio**: endpoint DELETE /users/me che cancella account + tutti i dati correlati (già cascade sul DB, da esporre)
  - [ ] **Portabilità dati**: endpoint GET /users/me/export → ZIP con JSON di transazioni, clienti, categorie
  - [ ] **Privacy policy** da mostrare al primo accesso (accettazione esplicita con timestamp)
  - [ ] Registrazione consenso in DB (campo `gdprAcceptedAt` su `users`)
  - [ ] **DPA (Data Processing Agreement)** da accettare per utenti business
  - [ ] Log degli accessi ai dati sensibili (codice fiscale, P.IVA clienti)
  - [ ] Configurazione data retention (es. auto-cancellazione dati dopo X anni)
  - [ ] Indicare nella documentazione la geolocalizzazione dei server (server UE obbligatorio o SCCs)
  - [ ] Cookie banner se si usano analytics

- [ ] **Import/Export**
  - [ ] Import CSV transazioni
  - [ ] Import da Excel
  - [ ] Export CSV/Excel
  - [ ] Export PDF completo anno fiscale

- [ ] **Notifiche**
  - [ ] Sistema notifiche in-app
  - [ ] Email per scadenze importanti
  - [ ] Reminder versamenti F24

- [ ] **Multi-lingua**
  - [ ] i18n setup
  - [ ] Italiano e Inglese

- [ ] **Report Avanzati**
  - [ ] Report personalizzabili
  - [ ] Salvataggio report preferiti
  - [ ] Comparazione periodi

- [ ] **Gestione Documenti**
  - [ ] Upload fatture/ricevute
  - [ ] Storage S3 o equivalente
  - [ ] Visualizzazione allegati

## 💡 Priorità Bassa / Nice to Have

- [ ] **Mobile App**
  - [ ] React Native o Flutter
  - [ ] Sync con web app

- [ ] **Integrazione Banche**
  - [ ] API bancarie per import automatico movimenti
  - [ ] Riconciliazione transazioni

- [ ] **AI Features**
  - [ ] Categorizzazione automatica transazioni
  - [ ] Suggerimenti basati su pattern
  - [ ] Previsioni entrate/uscite

- [ ] **Collaboration**
  - [ ] Condivisione dati con commercialista
  - [ ] Multi-user per aziende

- [ ] **White Label**
  - [ ] Personalizzazione brand
  - [ ] Multi-tenant

## 🐛 Bug Fix & Miglioramenti

- [ ] Gestione errori API migliorata
- [ ] Loading states consistenti
- [ ] Validazione form avanzata
- [ ] Ottimizzazione performance
- [ ] SEO optimization
- [ ] Accessibility (WCAG)
- [ ] Error boundaries React
- [ ] Rate limiting API
- [ ] Input sanitization
- [ ] SQL injection prevention (già coperto da TypeORM)

## 🧪 Testing

- [ ] Unit tests backend (Jest)
- [ ] E2E tests backend (Supertest)
- [ ] Unit tests frontend (Vitest)
- [ ] E2E tests frontend (Cypress/Playwright)
- [ ] Test coverage >80%

## 📝 Documentazione

- [ ] API documentation completa (Swagger)
- [ ] User guide
- [ ] Video tutorial
- [ ] FAQ
- [ ] Changelog

## 🚀 Deploy & DevOps

- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated tests in CI
- [ ] Docker production images
- [ ] Monitoring (Sentry, DataDog)
- [ ] Logging centralizzato
- [ ] Backup automatici database
- [ ] SSL/HTTPS setup guide
- [ ] Performance monitoring
- [ ] Health checks

## 🔐 Sicurezza

- [ ] Rate limiting completo
- [ ] Input validation stringente
- [ ] CSRF protection
- [ ] XSS protection
- [ ] Secure headers
- [ ] Password strength requirements
- [ ] 2FA (Two-Factor Authentication)
- [ ] Password reset flow
- [ ] Email verification
- [ ] Security audit

---

**Note**: Questa lista è in continua evoluzione. Sentiti libero di aggiungere, rimuovere o riorganizzare le priorità in base alle tue esigenze!

Per contribuire, scegli un task, crea un branch, implementa, testa e apri una PR.

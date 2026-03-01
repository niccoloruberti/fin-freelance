# FinFreelance - TODO List

> Aggiornato al 2026-03-01 dopo analisi completa del codice.

## Stato reale del progetto

| Modulo | Backend | Frontend | Pronto? |
|---|---|---|---|
| Auth (login) | ✅ | ✅ | ✅ |
| Auth (register) | ✅ | ❌ skeleton | ⚠️ |
| Users | ✅ | — | ✅ |
| Transactions CRUD | ✅ | ✅ | ✅ |
| Categories CRUD | ✅ | ✅ | ✅ |
| Clients CRUD | ✅ | ✅ | ✅ |
| Tax Summary | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ |
| Dashboard | ❌ skeleton | ⚠️ shell grafica | ❌ |
| Recurring | ❌ skeleton | ❌ assente | ❌ |

---

## 🔥 Priorità 1 — Blockers per il primo deploy

### [BE] Dashboard backend
Il `dashboard.module.ts` esiste ma è vuoto. Mancano service e controller.
- [ ] Aggiungere provider/controller in `dashboard.module.ts`
- [ ] Creare `dashboard.service.ts` con `getSummary(userId, year)`:
  - Totale entrate e uscite anno corrente
  - Tasse stimate (delegare a TaxService)
  - Ultime 5 transazioni (con relazioni categoria e cliente)
  - Breakdown mensile entrate/uscite (12 mesi, per il grafico)
- [ ] Creare `dashboard.controller.ts`: `GET /dashboard/summary?year=YYYY`

### [FE] RegisterView
Completamente vuota. Senza registrazione nessun utente può creare un account.
- [ ] Implementare `frontend/src/views/auth/RegisterView.vue`
  - Campi: firstName, lastName, email, password, conferma password
  - Validazione con vee-validate + yup (stesso pattern di LoginView)
  - Chiamata `authStore.register(data)` (già implementata nello store)
  - Redirect a /dashboard dopo successo
  - Gestione errori (es. email già registrata → 409)

### [FE] Dashboard frontend
La `DashboardView.vue` ha 4 KPI cards hardcoded a 0 e nessuna logica.
- [ ] Fetch `GET /dashboard/summary` all'`onMounted`
- [ ] Collegare KPI cards (Fatturato, Spese, Tasse Stimate, Utile Netto)
- [ ] Popolare tabella "Ultime Transazioni"
- [ ] Collegare grafico "Andamento Mensile" (riusare il pattern da `TaxSummaryView.vue`)
- [ ] Loading skeleton mentre carica

---

## 🎯 Priorità Alta (già avanzata — riepilogo stato)

### Backend ✅

- [x] **CRUD Transactions** — tutti gli endpoint (GET, POST, PATCH, DELETE), scoped per user
- [x] **CRUD Categories** — tutti gli endpoint (GET, POST, PUT, DELETE)
- [x] **CRUD Clients** — tutti gli endpoint (GET, POST, PATCH, DELETE), scoped per user
- [x] **Tax Calculator Service** — calcolo automatico regime forfettario, endpoint `GET /tax/summary?year=YYYY`, contributi INPS (3 gestioni), acconti giugno/novembre
- [ ] **Dashboard Analytics** — vedi Priorità 1
- [ ] **Recurring Transactions** — vedi Priorità 4

### Frontend ✅

- [x] **Gestione Transazioni** — lista, form creazione/modifica, CRUD completo
- [x] **Gestione Clienti** — lista, form anagrafica completa (CRUD modal)
- [x] **Gestione Categorie** — lista, CRUD completo
- [x] **Riassunto Fiscale** — vista annuale, dettaglio calcoli, acconti, grafico mensile, year selector
- [x] **Impostazioni** — profilo utente, configurazione fiscale (coefficienti, aliquote, gestione INPS)
- [ ] **Registrazione** — vedi Priorità 1
- [ ] **Dashboard Completa** — vedi Priorità 1

---

## 🔧 Priorità 2 — Qualità e consistenza

- [ ] **Uniformare HTTP methods (PUT → PATCH)**
  - `backend/src/modules/categories/categories.controller.ts`: `@Put` → `@Patch`
  - `frontend/src/views/CategoriesView.vue`: chiamata update da `PUT` a `PATCH`
  - `frontend/src/views/ClientsView.vue`: chiamata update da `PUT` a `PATCH`

- [ ] **Filtri Transactions**
  - Filtro per tipo (entrata/uscita), periodo (mese/anno), categoria
  - Ricerca per descrizione

- [ ] **Categorie custom per utente**
  - Attualmente le categorie sono globali (non associate a un utente)
  - Decidere se mantenere le default globali e aggiungere custom per-user

---

## 🚀 Priorità 3 — Deploy

- [ ] Scegliere hosting (Railway per semplicità, o Hetzner VPS €4/mese)
- [ ] Adattare `docker-compose.yml` per produzione (rimuovere phpMyAdmin, aggiungere Nginx/Caddy)
- [ ] `Dockerfile` per backend e build statica frontend
- [ ] Variabili d'ambiente di produzione
- [ ] SSL con Let's Encrypt o Caddy (automatico)
- [ ] Dominio
- [ ] Rate limiting su route di auth (`@nestjs/throttler`)
- [ ] `CORS_ORIGIN` ristretto al dominio di produzione
- [ ] Disabilitare Swagger in produzione

---

## 💡 Priorità 4 — Features post-deploy

- [ ] **Recurring Transactions** — entity, CRUD backend, cron job (`@nestjs/schedule`), frontend view
- [ ] **Paginazione e ordinamento** — lista transazioni, clienti
- [ ] **Export dati** — CSV transazioni, PDF riepilogo tasse per commercialista
- [ ] **Dettaglio cliente** — vista con storico transazioni associate
- [ ] **Password reset** — flusso email con token
- [ ] **Riassunto Fiscale — Simulatore** — previsione "cosa succederebbe se guadagnassi X in più"
- [ ] **Timeline scadenze fiscali** — acconto giugno, acconto novembre, saldo marzo

---

## 🎯 Priorità Media (originale — medium-term)

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
- [ ] Accessibility (WCAG)
- [ ] Rate limiting API (vedi Priorità 3 - deploy)
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

**Note**: Le priorità 1–3 sono necessarie per un primo deploy utilizzabile da un amico. Le priorità 4+ sono iterazioni successive.

# Guida all'Installazione - Agenda Personale

Questa guida ti aiuterà a configurare e avviare la tua agenda personale.

## Prerequisiti

- Node.js versione 18 o superiore
- Un account Firebase (gratuito)

## Passo 1: Setup Firebase

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Clicca su "Aggiungi progetto" e segui la procedura guidata
3. Una volta creato il progetto:

### Abilita Authentication

1. Nel menu laterale, vai su "Authentication"
2. Clicca su "Inizia"
3. Nella tab "Sign-in method", abilita "Email/Password"

### Crea Database Firestore

1. Nel menu laterale, vai su "Firestore Database"
2. Clicca su "Crea database"
3. Scegli "Inizia in modalità test" (per sviluppo)
4. Seleziona una località vicina a te

### Ottieni le credenziali

1. Vai su Impostazioni progetto (icona ingranaggio)
2. Scorri fino a "Le tue app"
3. Clicca sull'icona web `</>`
4. Registra l'app (puoi chiamarla "Personal Calendar")
5. Copia le credenziali di configurazione

## Passo 2: Configurazione Locale

1. Clona o estrai il progetto
2. Apri il terminale nella cartella `frontend`
3. Installa le dipendenze:

```bash
npm install
```

4. Crea il file `.env` nella cartella `frontend`:

```bash
cp .env.example .env
```

5. Apri il file `.env` e inserisci le tue credenziali Firebase:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=tuo-progetto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tuo-progetto
VITE_FIREBASE_STORAGE_BUCKET=tuo-progetto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Passo 3: Regole di Sicurezza Firestore

Prima di usare l'app in produzione, aggiorna le regole di sicurezza Firestore:

1. Vai su Firestore Database nella Console Firebase
2. Clicca sulla tab "Regole"
3. Incolla queste regole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events collection
    match /events/{eventId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Event overrides collection
    match /eventOverrides/{overrideId} {
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && 
                       request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && 
                               resource.data.userId == request.auth.uid;
    }
  }
}
```

4. Clicca su "Pubblica"

## Passo 4: Avvio dell'Applicazione

```bash
npm run dev
```

L'app si aprirà automaticamente su `http://localhost:3000`

## Primo Utilizzo

1. Clicca su "Registrati"
2. Inserisci:
   - Nome
   - Email
   - Password (minimo 6 caratteri)
3. Accedi all'applicazione
4. Inizia a creare i tuoi eventi!

## Creazione Eventi

### Evento Singolo
1. Clicca su "Nuovo evento"
2. Inserisci nome e descrizione
3. Scegli un colore
4. Lascia deselezionato "Evento ricorrente"
5. Seleziona data e orario
6. Clicca "Crea evento"

### Evento Ricorrente
1. Clicca su "Nuovo evento"
2. Inserisci nome e descrizione
3. Scegli un colore
4. Seleziona "Evento ricorrente"
5. Aggiungi gli slot settimanali (es: Lunedì 9:00-10:00, Mercoledì 14:00-15:00)
6. Clicca "Crea evento"

## Build per Produzione

Quando sei pronto per il deployment:

```bash
npm run build
```

I file verranno generati nella cartella `dist/` e potranno essere caricati su:
- Firebase Hosting
- Vercel
- Netlify
- Qualsiasi servizio di hosting statico

### Deploy su Firebase Hosting (opzionale)

```bash
# Installa Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inizializza hosting
firebase init hosting

# Deploy
firebase deploy
```

## Risoluzione Problemi

### Errore "Firebase not configured"
- Verifica che il file `.env` sia nella cartella `frontend`
- Controlla che tutte le variabili inizino con `VITE_`
- Riavvia il server di sviluppo

### Errore "Permission denied" su Firestore
- Verifica che le regole di sicurezza siano configurate correttamente
- Assicurati di essere autenticato

### L'app non si carica
- Controlla che Node.js sia installato: `node --version`
- Elimina `node_modules` e reinstalla: `rm -rf node_modules && npm install`
- Pulisci la cache: `npm run build -- --force`

## Supporto

Per problemi o domande, consulta:
- [Documentazione Firebase](https://firebase.google.com/docs)
- [Documentazione React](https://react.dev)
- [Documentazione Vite](https://vitejs.dev)

## Prossimi Passi

Alcune idee per estendere l'applicazione:
- Aggiungere notifiche push
- Esportare eventi in formato iCal
- Integrare con Google Calendar
- Aggiungere categorie per gli eventi
- Creare viste mensili/annuali
- Implementare la ricerca eventi
- Aggiungere allegati agli eventi

# Agenda Personale

Un'applicazione calendario personale stile Google Calendar, costruita con React e Firebase.

## Funzionalità

- ✅ Visualizzazione calendario settimanale
- ✅ Creazione eventi ricorrenti (settimanali)
- ✅ Creazione eventi singoli (one-time)
- ✅ Modifica ed eliminazione eventi
- ✅ Dashboard reminder per eventi di oggi
- ✅ Pagina riepilogo utente con statistiche
- ✅ Supporto multiutente (profili separati)
- ✅ Codice colore per eventi
- ✅ Gestione orari personalizzati

## Struttura del Progetto

```
personal-calendar/
├── frontend/
│   ├── src/
│   │   ├── components/     # Componenti UI riutilizzabili
│   │   ├── contexts/       # Context per autenticazione
│   │   ├── lib/           # Utilità e funzioni helper
│   │   ├── pages/         # Pagine principali dell'app
│   │   └── stores/        # State management con Zustand
│   └── ...
└── README.md
```

## Tecnologie Utilizzate

- **React 18** - Framework UI
- **Vite** - Build tool
- **Firebase** - Backend (Authentication + Firestore)
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **date-fns** - Gestione date
- **Lucide React** - Icone

## Setup

1. Clona il repository
2. Installa le dipendenze:
   ```bash
   cd frontend
   npm install
   ```

3. Configura Firebase:
   - Crea un progetto su [Firebase Console](https://console.firebase.google.com/)
   - Abilita Authentication (Email/Password **E** Google)
   - Crea un database Firestore
   - Copia le credenziali in `frontend/.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Avvia il server di sviluppo:
   ```bash
   npm run dev
   ```

**Nota**: Per abilitare il login con Google, segui la guida in `GOOGLE_SIGNIN.md`

## Struttura Dati Firebase

### Collection: events

```javascript
{
  name: string,           // Nome evento
  description: string,    // Descrizione
  color: string,         // Colore hex (#rrggbb)
  userId: string,        // ID utente proprietario
  isRecurring: boolean,  // Se è ricorrente
  
  // Per eventi ricorrenti:
  schedule: [{
    dayOfWeek: number,   // 0-6 (Domenica-Sabato)
    startTime: string,   // "HH:mm"
    endTime: string      // "HH:mm"
  }],
  
  // Per eventi singoli:
  date: string,          // "YYYY-MM-DD"
  startTime: string,     // "HH:mm"
  endTime: string,       // "HH:mm"
  
  createdAt: Timestamp
}
```

### Collection: eventOverrides

```javascript
{
  eventId: string,       // ID evento ricorrente
  originalDate: string,  // "YYYY-MM-DD"
  newStartTime: string | null,
  newEndTime: string | null,
  cancelled: boolean,
  userId: string
}
```

### Collection: users

```javascript
{
  email: string,
  displayName: string,
  createdAt: Timestamp
}
```

## Utilizzo

### Calendario Principale
- Visualizza gli eventi della settimana corrente e successiva
- Click su un evento per vedere dettagli
- Crea nuovi eventi con il pulsante "+" 

### Dashboard Reminder
- Mostra tutti gli eventi di oggi
- Ordine cronologico per orario
- Evidenzia eventi in corso

### Gestione Eventi

**Eventi Ricorrenti:**
- Specificare giorni della settimana e orari
- Modificare singole occorrenze senza alterare la ricorrenza
- Cancellare occorrenze specifiche

**Eventi Singoli:**
- Specificare data e orario
- Modificare o eliminare direttamente

### Profilo Utente
- Visualizza statistiche eventi
- Cambia informazioni account

## Differenze dal Progetto Originale

- ❌ Rimossa gestione prenotazioni (capacità, posti disponibili)
- ❌ Rimossa gestione pagamenti
- ❌ Rimosso ruolo "user" - solo admin/proprietario
- ✅ Aggiunto supporto eventi singoli
- ✅ Aggiunta dashboard reminder giornaliera
- ✅ Semplificata gestione utenti (un utente = un'agenda)

## Licenza

MIT

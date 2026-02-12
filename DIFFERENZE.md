# Differenze dal Progetto Originale

Questo documento descrive le modifiche apportate al progetto HoopLab per trasformarlo in un'agenda personale.

## Modifiche Principali

### 1. Sistema di Eventi (prima: Corsi)

**Prima (HoopLab):**
- Collection: `corsi`
- Ogni corso aveva una capacità massima
- Gli utenti prenotavano i posti disponibili
- Sistema di prenotazioni con gestione posti

**Dopo (Agenda Personale):**
- Collection: `events`
- Eventi personali senza limite di partecipanti
- Ogni evento appartiene a un singolo utente (`userId`)
- Due tipi di eventi:
  - **Ricorrenti**: con schedule settimanale
  - **Singoli**: con data e orario specifici

```javascript
// Struttura evento ricorrente
{
  name: "Riunione Team",
  description: "Riunione settimanale",
  color: "#3b82f6",
  userId: "user123",
  isRecurring: true,
  schedule: [
    { dayOfWeek: 1, startTime: "09:00", endTime: "10:00" }, // Lunedì
    { dayOfWeek: 4, startTime: "14:00", endTime: "15:00" }  // Giovedì
  ]
}

// Struttura evento singolo
{
  name: "Dentista",
  description: "Controllo semestrale",
  color: "#ef4444",
  userId: "user123",
  isRecurring: false,
  date: "2024-03-15",
  startTime: "10:30",
  endTime: "11:00"
}
```

### 2. Rimozione Sistema Prenotazioni

**Rimosso:**
- Collection `prenotazioni`
- Logica di gestione posti disponibili
- Contatore partecipanti
- Visualizzazione "chi ha prenotato"
- Pulsanti prenota/cancella prenotazione

**Motivo:**
Un'agenda personale non necessita di gestire prenotazioni multiple - ogni evento è personale.

### 3. Rimozione Sistema Pagamenti

**Rimosso completamente:**
- Collection `users/{userId}/payments`
- Campi `lessonsAttended`, `lessonsPaid`
- Logica mensile/per-lezione
- Tutti i componenti UI relativi ai pagamenti
- Funzioni Firestore per gestione pagamenti

**File eliminati:**
- `AdminBookings.jsx` (gestione pagamenti)
- Sezioni pagamenti in `ProfilePage.jsx`

### 4. Semplificazione Gestione Utenti

**Prima:**
- Ruolo "admin" con permessi speciali
- Ruolo "user" normale
- Gestione multi-utente con AdminUsers
- Sistema di approvazione utenti

**Dopo:**
- Un solo tipo di utente (proprietario)
- Ogni utente vede solo i propri eventi
- Rimossa pagina AdminUsers
- Struttura utente semplificata:

```javascript
{
  email: "user@example.com",
  displayName: "Mario Rossi",
  createdAt: Timestamp
}
```

### 5. Nuove Funzionalità

#### Dashboard Reminder (`RemindersPage.jsx`)
Una nuova pagina che mostra:
- Tutti gli eventi di oggi
- Ordinamento cronologico
- Evidenziazione eventi in corso
- Badge "In corso" per eventi attivi
- Statistiche rapide

#### Eventi Singoli
Possibilità di creare eventi non ricorrenti:
- Data specifica
- Orario singolo
- Nessuna ripetizione

#### Gestione Migliorata
- Modifica eventi semplificata
- Eliminazione diretta
- UI più pulita e focalizzata

### 6. Modifiche al Routing

**Prima:**
```javascript
/login
/
/bookings (differente per admin/user)
/profile
/admin
/admin/corsi
```

**Dopo:**
```javascript
/login
/              (Calendario)
/reminders     (Dashboard oggi)
/profile       (Statistiche personali)
```

### 7. Modifiche ai Componenti UI

#### Layout
- Rimossa distinzione admin/user
- Semplificata navigazione
- 3 sezioni principali: Calendario, Reminder, Profilo

#### CalendarPage
- Rimosso contatore posti
- Rimosso badge "Pieno"
- Aggiunto supporto eventi singoli
- Semplificato modal dettagli
- Migliorata creazione eventi

#### ProfilePage
- Rimossa sezione pagamenti
- Aggiunte statistiche eventi (totali, ricorrenti, singoli)
- Lista eventi recenti
- Focus su utilizzo personale

### 8. Store (Zustand)

**Rimosso:**
- `prenotazioni` state
- Funzioni `book()`, `cancelBooking()`
- Gestione bookings utenti

**Aggiunto/Modificato:**
- `events` al posto di `corsi`
- Funzioni semplificate: `addEvent()`, `editEvent()`, `removeEvent()`
- Gestione overrides mantenuta per eventi ricorrenti

### 9. Funzioni Calendar Helper

**Modificato:**
```javascript
// Prima
generateLessons(corsi, overrides, weekStart, weekEnd)

// Dopo
generateEvents(events, overrides, weekStart, weekEnd)
```

**Aggiunto:**
```javascript
getTodayEvents(events)    // Per dashboard reminder
isEventNow(event)         // Verifica se evento in corso
```

### 10. Firestore Functions

**File: `lib/firestore.js`**

Prima (156 righe):
- Funzioni corsi
- Funzioni prenotazioni
- Funzioni pagamenti (mensili e per-lezione)
- Gestione utenti complessa

Dopo (115 righe):
- Funzioni eventi
- Event overrides
- Gestione utenti base
- Codice più pulito e focalizzato

## Mantenuto dal Progetto Originale

✅ Sistema autenticazione Firebase
✅ Event overrides per modifiche singole occorrenze
✅ Visualizzazione calendario settimanale
✅ Gestione colori eventi
✅ Componenti UI riutilizzabili (Button, Card, Modal, Input, Badge)
✅ Logica schedule ricorrenti
✅ Layout responsive
✅ Tailwind CSS styling

## Benefici delle Modifiche

1. **Semplicità**: Codice ridotto del ~40%
2. **Focus**: Funzionalità chiare e mirate
3. **Manutenibilità**: Meno componenti da gestire
4. **Velocità**: Meno query Firestore
5. **UX**: Interfaccia più intuitiva per uso personale
6. **Scalabilità**: Facile aggiungere nuove funzionalità

## Potenziali Estensioni Future

- 📱 App mobile React Native
- 🔔 Notifiche push
- 📅 Export iCal/Google Calendar
- 🏷️ Categorie/tag eventi
- 🔍 Ricerca avanzata
- 📊 Grafici utilizzo tempo
- 🌙 Modalità dark
- 🌍 Multi-timezone support
- 📎 Allegati agli eventi
- 🔁 Template eventi ricorrenti complessi (es: "ogni 2 settimane", "primo lunedì del mese")

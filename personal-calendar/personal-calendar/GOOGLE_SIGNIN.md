# 🔐 Configurazione Google Sign-In

## Passaggi per Abilitare il Login con Google

### 1. Abilita Google Sign-In in Firebase Console

1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il tuo progetto **calendar-6f0f2**
3. Nel menu laterale, clicca su **Authentication**
4. Vai alla tab **Sign-in method**
5. Clicca su **Google** nella lista dei provider
6. Attiva l'interruttore **Enable**
7. Inserisci un **email di supporto** (la tua email)
8. Clicca **Save**

✅ Fatto! Il Google Sign-In è ora abilitato.

### 2. Configurazione Domini Autorizzati (per Deploy)

Se hai già fatto il deploy su Vercel, aggiungi il dominio autorizzato:

1. Sempre in **Authentication** → **Sign-in method**
2. Scorri fino a **Authorized domains**
3. Clicca **Add domain**
4. Aggiungi il tuo dominio Vercel (es: `tua-app.vercel.app`)
5. Salva

**Domini già autorizzati di default:**
- `localhost` (per sviluppo locale)
- `calendar-6f0f2.firebaseapp.com` (Firebase Hosting)

### 3. Test in Locale

```bash
cd frontend
npm run dev
```

Vai su `http://localhost:3000/login` e prova il pulsante **"Continua con Google"**

### 4. Funzionalità Implementate

✅ **Login con Google** - Click unico per accedere
✅ **Creazione automatica profilo** - Al primo login viene creato il profilo Firestore
✅ **Foto profilo** - Salva automaticamente la foto Google (opzionale per uso futuro)
✅ **Gestione sicura** - Popup per selezione account Google
✅ **Fallback email/password** - Mantiene il login classico come opzione

### 5. Come Funziona

Quando l'utente clicca su "Continua con Google":

1. Si apre un popup Google per selezione account
2. L'utente sceglie o accede al suo account Google
3. Firebase autentica l'utente
4. L'app verifica se esiste già un profilo Firestore
5. Se è nuovo, crea il profilo con:
   - Email da Google
   - Nome da Google
   - Foto profilo da Google (salvata per uso futuro)
6. Redirect alla dashboard

### 6. Regole Firestore (già configurate)

Le regole esistenti supportano già il Google Sign-In:

```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && request.auth.uid == userId;
  allow update: if isOwner(userId);
}
```

### 7. Struttura Profilo Utente

Dopo il login con Google, il profilo Firestore conterrà:

```javascript
{
  email: "user@gmail.com",
  displayName: "Mario Rossi",
  photoURL: "https://lh3.googleusercontent.com/...",  // Opzionale
  createdAt: Timestamp
}
```

### 8. Possibili Errori e Soluzioni

#### Errore: "popup_closed_by_user"
**Causa**: L'utente ha chiuso il popup prima di completare il login
**Soluzione**: Nessuna azione richiesta, è comportamento normale

#### Errore: "auth/unauthorized-domain"
**Causa**: Il dominio non è autorizzato in Firebase
**Soluzione**: Aggiungi il dominio in Authentication → Settings → Authorized domains

#### Errore: "auth/popup-blocked"
**Causa**: Il browser ha bloccato il popup
**Soluzione**: L'utente deve consentire i popup per il sito

### 9. Estensioni Future (Opzionali)

Se vuoi mostrare la foto profilo Google:

**In Layout.jsx:**
```jsx
{currentUser?.photoURL ? (
  <img 
    src={currentUser.photoURL} 
    alt={currentUser.displayName}
    className="w-8 h-8 rounded-full"
  />
) : (
  <User size={20} />
)}
```

**In ProfilePage.jsx:**
```jsx
{currentUser?.photoURL ? (
  <img 
    src={currentUser.photoURL} 
    alt={currentUser.displayName}
    className="w-16 h-16 rounded-full object-cover"
  />
) : (
  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
    <User size={32} className="text-brand-600" />
  </div>
)}
```

### 10. Privacy e Sicurezza

- ✅ Firebase gestisce in modo sicuro l'autenticazione OAuth
- ✅ Non memorizziamo password (gestite da Google)
- ✅ Token di accesso gestiti automaticamente da Firebase
- ✅ Logout sicuro sia per Google che per email/password

### 11. Checklist Finale

Prima di andare in produzione:

- [ ] Google Sign-In abilitato in Firebase Console
- [ ] Email di supporto configurata
- [ ] Domini autorizzati configurati (localhost + dominio produzione)
- [ ] Testato login Google in locale
- [ ] Testato login Google in produzione
- [ ] Regole Firestore pubblicate
- [ ] Verificato che i profili si creano correttamente

---

✨ **Il Google Sign-In è ora completamente configurato e funzionante!**

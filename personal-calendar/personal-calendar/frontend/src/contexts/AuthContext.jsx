import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { createUserProfile, getUserProfile } from '../lib/firestore'

const AuthContext = createContext({})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function signup(email, password, displayName) {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName })
    
    // Crea profilo utente in Firestore
    await createUserProfile(result.user.uid, {
      email,
      displayName,
    })
    
    return result
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
      prompt: 'select_account'
    })
    
    const result = await signInWithPopup(auth, provider)
    
    // Verifica se l'utente esiste già in Firestore
    const existingProfile = await getUserProfile(result.user.uid)
    
    if (!existingProfile) {
      // Crea profilo per nuovo utente Google
      await createUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      })
    }
    
    return result
  }

  async function logout() {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Carica profilo utente da Firestore
        const profile = await getUserProfile(user.uid)
        setCurrentUser({ ...user, ...profile })
      } else {
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

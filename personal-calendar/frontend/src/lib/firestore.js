import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Eventi ───────────────────────────────────────────────

/**
 * Event shape:
 * {
 *   name: string,
 *   description: string,
 *   color: string (hex),
 *   userId: string,
 *   isRecurring: boolean,
 *   
 *   // Per eventi ricorrenti:
 *   schedule: [{ dayOfWeek: 0-6, startTime: "HH:mm", endTime: "HH:mm" }],
 *   
 *   // Per eventi singoli:
 *   date: "YYYY-MM-DD",
 *   startTime: "HH:mm",
 *   endTime: "HH:mm",
 *   
 *   createdAt: Timestamp,
 * }
 */

export async function createEvent(data) {
  return addDoc(collection(db, 'events'), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

export async function updateEvent(eventId, data) {
  return updateDoc(doc(db, 'events', eventId), data)
}

export async function deleteEvent(eventId) {
  return deleteDoc(doc(db, 'events', eventId))
}

export async function getEvents(userId) {
  const snap = await getDocs(
    query(
      collection(db, 'events'),
      where('userId', '==', userId),
      orderBy('name')
    )
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getEvent(eventId) {
  const snap = await getDoc(doc(db, 'events', eventId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

// ─── Event Overrides (per eventi ricorrenti) ─────────

/**
 * EventOverride shape:
 * {
 *   eventId: string,
 *   originalDate: "YYYY-MM-DD",
 *   newStartTime: "HH:mm" | null,
 *   newEndTime: "HH:mm" | null,
 *   cancelled: boolean,
 *   userId: string,
 * }
 */

export async function getEventOverrides(userId) {
  const snap = await getDocs(
    query(collection(db, 'eventOverrides'), where('userId', '==', userId))
  )
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function setEventOverride(data) {
  const q = query(
    collection(db, 'eventOverrides'),
    where('eventId', '==', data.eventId),
    where('originalDate', '==', data.originalDate),
    where('userId', '==', data.userId)
  )
  const snap = await getDocs(q)
  if (snap.empty) {
    return addDoc(collection(db, 'eventOverrides'), data)
  } else {
    return updateDoc(snap.docs[0].ref, data)
  }
}

export async function deleteEventOverride(overrideId) {
  return deleteDoc(doc(db, 'eventOverrides', overrideId))
}

// ─── Users ───────────────────────────────────────────────

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function updateUserProfile(userId, data) {
  return updateDoc(doc(db, 'users', userId), data)
}

export async function createUserProfile(userId, data) {
  return setDoc(doc(db, 'users', userId), {
    ...data,
    createdAt: serverTimestamp(),
  })
}

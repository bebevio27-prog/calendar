import { create } from 'zustand'
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventOverrides,
  setEventOverride,
  deleteEventOverride,
  getAllUsers,
} from '../lib/firestore'

export const useAppStore = create((set, get) => ({
  events: [],
  overrides: [],
  users: [],
  loaded: false,

  // Carica tutti i dati (calendario condiviso)
  async loadData() {
    try {
      const [events, overrides, users] = await Promise.all([
        getEvents(),
        getEventOverrides(),
        getAllUsers(),
      ])
      
      set({ events, overrides, users, loaded: true })
    } catch (error) {
      console.error('Error loading data:', error)
      set({ loaded: true })
    }
  },

  // Eventi
  async addEvent(data) {
    const ref = await createEvent(data)
    const newEvent = { id: ref.id, ...data }
    set((state) => ({ events: [...state.events, newEvent] }))
  },

  async editEvent(eventId, data) {
    await updateEvent(eventId, data)
    set((state) => ({
      events: state.events.map((e) => (e.id === eventId ? { ...e, ...data } : e)),
    }))
  },

  async removeEvent(eventId) {
    await deleteEvent(eventId)
    set((state) => ({
      events: state.events.filter((e) => e.id !== eventId),
      overrides: state.overrides.filter((o) => o.eventId !== eventId),
    }))
  },

  // Overrides
  async addOverride(data) {
    await setEventOverride(data)
    const existing = get().overrides.find(
      (o) =>
        o.eventId === data.eventId &&
        o.originalDate === data.originalDate &&
        o.userId === data.userId
    )
    
    if (existing) {
      set((state) => ({
        overrides: state.overrides.map((o) =>
          o.eventId === data.eventId &&
          o.originalDate === data.originalDate &&
          o.userId === data.userId
            ? { ...o, ...data }
            : o
        ),
      }))
    } else {
      set((state) => ({ overrides: [...state.overrides, data] }))
    }
  },

  async removeOverride(overrideId) {
    await deleteEventOverride(overrideId)
    set((state) => ({
      overrides: state.overrides.filter((o) => o.id !== overrideId),
    }))
  },

  // Reset (per logout)
  reset() {
    set({ events: [], overrides: [], users: [], loaded: false })
  },
}))

import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, Edit, Trash2 } from 'lucide-react'
import { addWeeks, startOfWeek, endOfWeek, format, isToday, isBefore } from 'date-fns'
import { it } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import { useAppStore } from '../stores/appStore'
import {
  generateEvents,
  formatDate,
  getWeekDays,
  timeToMinutes,
  getCalendarHours,
} from '../lib/calendar'
import { COLORS, DAYS_OF_WEEK, getRandomColor } from '../lib/utils'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import { cn } from '../lib/utils'

export default function CalendarPage() {
  const { currentUser } = useAuth()
  const { events, overrides, loaded, addEvent, editEvent, removeEvent, loadData } = useAppStore()
  
  const [weekOffset, setWeekOffset] = useState(0)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (currentUser && !loaded) {
      loadData(currentUser.uid)
    }
  }, [currentUser, loaded, loadData])

  const referenceDate = addWeeks(new Date(), weekOffset)
  const weekDays = getWeekDays(referenceDate)
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 })

  const generatedEvents = useMemo(
    () => generateEvents(events, overrides, weekStart, weekEnd),
    [events, overrides, weekStart, weekEnd]
  )

  const hours = useMemo(() => getCalendarHours(generatedEvents), [generatedEvents])

  function handleEventClick(event) {
    setSelectedEvent(event)
  }

  function handleCreateNew() {
    setShowCreateModal(true)
  }

  function handleEdit(event) {
    setShowEditModal(true)
  }

  async function handleDelete(eventId) {
    if (confirm('Sei sicuro di voler eliminare questo evento?')) {
      await removeEvent(eventId)
      setSelectedEvent(null)
    }
  }

  // Solo mostra domenica se ci sono eventi domenica questa settimana
  const sundayDateStr = formatDate(weekDays[6])
  const hasSundayEvents = generatedEvents.some((e) => e.date === sundayDateStr)
  const visibleDays = hasSundayEvents ? weekDays : weekDays.slice(0, 6)
  const colCount = visibleDays.length

  const totalHourHeight = 64

  function eventStyle(event) {
    const startMin = timeToMinutes(event.startTime)
    const endMin = timeToMinutes(event.endTime)
    const top = (startMin - hours.start * 60) * (totalHourHeight / 60)
    const height = (endMin - startMin) * (totalHourHeight / 60)
    return { top: `${top}px`, height: `${height}px` }
  }

  const canGoBack = weekOffset > -4
  const canGoForward = weekOffset < 4

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-brand-300 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => canGoBack && setWeekOffset((w) => w - 1)}
            disabled={!canGoBack}
            className="p-2 rounded-xl hover:bg-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800">
              {format(weekStart, 'd MMM', { locale: it })} – {format(weekEnd, 'd MMM yyyy', { locale: it })}
            </p>
            {weekOffset === 0 && (
              <p className="text-xs text-brand-500 font-medium">Questa settimana</p>
            )}
          </div>
          <button
            onClick={() => canGoForward && setWeekOffset((w) => w + 1)}
            disabled={!canGoForward}
            className="p-2 rounded-xl hover:bg-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus size={18} />
          Nuovo evento
        </Button>
      </div>

      {/* Calendar grid */}
      <Card className="p-0 overflow-hidden">
        {/* Day headers */}
        <div
          className="border-b border-gray-100"
          style={{ display: 'grid', gridTemplateColumns: `60px repeat(${colCount}, 1fr)` }}
        >
          <div />
          {visibleDays.map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                'text-center py-3 text-sm font-medium border-l border-gray-50',
                isToday(day) ? 'text-brand-500' : 'text-gray-500'
              )}
            >
              <div className="uppercase">{format(day, 'EEE', { locale: it })}</div>
              <div
                className={cn(
                  'w-8 h-8 mx-auto mt-1 rounded-full flex items-center justify-center font-semibold',
                  isToday(day) ? 'bg-brand-500 text-white' : 'text-gray-700'
                )}
              >
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div
          className="relative"
          style={{ display: 'grid', gridTemplateColumns: `60px repeat(${colCount}, 1fr)` }}
        >
          {/* Hour labels */}
          <div className="relative border-r border-gray-100">
            {Array.from({ length: hours.end - hours.start }, (_, i) => (
              <div
                key={i}
                className="text-xs text-gray-400 text-right pr-2"
                style={{ height: `${totalHourHeight}px`, lineHeight: `${totalHourHeight}px` }}
              >
                {hours.start + i}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {visibleDays.map((day) => {
            const dateStr = formatDate(day)
            const dayEvents = generatedEvents.filter((e) => e.date === dateStr)
            const isPast = isBefore(day, new Date()) && !isToday(day)

            return (
              <div
                key={day.toISOString()}
                className={cn('relative border-l border-gray-50', isPast && 'opacity-40')}
                style={{ height: `${(hours.end - hours.start) * totalHourHeight}px` }}
              >
                {/* Hour grid lines */}
                {Array.from({ length: hours.end - hours.start }, (_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-gray-50"
                    style={{ top: `${i * totalHourHeight}px` }}
                  />
                ))}

                {/* Event blocks */}
                {dayEvents.map((event, idx) => (
                  <button
                    key={`${event.eventId}-${idx}`}
                    onClick={() => handleEventClick(event)}
                    className="absolute inset-x-1 rounded-lg px-2 py-1.5 text-left transition-all overflow-hidden hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      ...eventStyle(event),
                      backgroundColor: `${event.color}30`,
                      borderLeft: `3px solid ${event.color}`,
                    }}
                  >
                    <div
                      className="text-xs font-bold leading-tight truncate"
                      style={{ color: '#374151' }}
                    >
                      {event.eventName}
                    </div>
                    <div className="text-[10px] text-gray-600 leading-tight flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {event.startTime} - {event.endTime}
                    </div>
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Event detail modal */}
      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create event modal */}
      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        userId={currentUser?.uid}
      />

      {/* Edit event modal */}
      {selectedEvent && (
        <EditEventModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          event={events.find((e) => e.id === selectedEvent.eventId)}
          userId={currentUser?.uid}
        />
      )}
    </div>
  )
}

// Event Detail Modal
function EventDetailModal({ event, onClose, onEdit, onDelete }) {
  if (!event) return null

  return (
    <Modal open={!!event} onClose={onClose} title={event.eventName}>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: event.color }} />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {format(new Date(event.date), 'EEEE d MMMM yyyy', { locale: it })}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Clock size={14} />
              {event.startTime} – {event.endTime}
            </p>
          </div>
        </div>

        {event.description && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Descrizione
            </p>
            <p className="text-sm text-gray-700">{event.description}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="secondary"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => {
              onEdit(event)
              onClose()
            }}
          >
            <Edit size={16} />
            Modifica
          </Button>
          <Button
            variant="danger"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={() => onDelete(event.eventId)}
          >
            <Trash2 size={16} />
            Elimina
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// Continua con i modali Create e Edit nella prossima parte...

// Create Event Modal
function CreateEventModal({ open, onClose, userId }) {
  const { addEvent } = useAppStore()
  const [isRecurring, setIsRecurring] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(getRandomColor())
  
  // Per eventi singoli
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  
  // Per eventi ricorrenti
  const [schedule, setSchedule] = useState([])
  
  const [loading, setLoading] = useState(false)

  function addScheduleSlot() {
    setSchedule([...schedule, { dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }])
  }

  function removeScheduleSlot(index) {
    setSchedule(schedule.filter((_, i) => i !== index))
  }

  function updateScheduleSlot(index, field, value) {
    setSchedule(
      schedule.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const eventData = {
        name,
        description,
        color,
        userId,
        isRecurring,
      }

      if (isRecurring) {
        eventData.schedule = schedule
      } else {
        eventData.date = date
        eventData.startTime = startTime
        eventData.endTime = endTime
      }

      await addEvent(eventData)
      onClose()
      resetForm()
    } catch (error) {
      console.error('Error creating event:', error)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setName('')
    setDescription('')
    setColor(getRandomColor())
    setIsRecurring(false)
    setDate(format(new Date(), 'yyyy-MM-dd'))
    setStartTime('09:00')
    setEndTime('10:00')
    setSchedule([])
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuovo evento" className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome evento
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es: Riunione, Allenamento..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrizione (opzionale)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            rows={2}
            placeholder="Aggiungi dettagli..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colore</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-8 h-8 rounded-full transition-transform',
                  color === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 text-brand-500 rounded focus:ring-brand-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Evento ricorrente (settimanale)
            </span>
          </label>
        </div>

        {isRecurring ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Programma settimanale
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={addScheduleSlot}>
                <Plus size={16} />
              </Button>
            </div>

            {schedule.length === 0 && (
              <p className="text-sm text-gray-500">
                Nessun orario impostato. Clicca + per aggiungere.
              </p>
            )}

            {schedule.map((slot, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <select
                  value={slot.dayOfWeek}
                  onChange={(e) =>
                    updateScheduleSlot(index, 'dayOfWeek', Number(e.target.value))
                  }
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm"
                >
                  {DAYS_OF_WEEK.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(e) => updateScheduleSlot(index, 'startTime', e.target.value)}
                  className="w-28"
                />
                <span className="text-gray-400">-</span>
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(e) => updateScheduleSlot(index, 'endTime', e.target.value)}
                  className="w-28"
                />
                <button
                  type="button"
                  onClick={() => removeScheduleSlot(index)}
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora inizio
              </label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora fine
              </label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Annulla
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={loading || (isRecurring && schedule.length === 0)}
          >
            {loading ? 'Creazione...' : 'Crea evento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

// Edit Event Modal
function EditEventModal({ open, onClose, event, userId }) {
  const { editEvent } = useAppStore()
  const [name, setName] = useState(event?.name || '')
  const [description, setDescription] = useState(event?.description || '')
  const [color, setColor] = useState(event?.color || getRandomColor())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (event) {
      setName(event.name)
      setDescription(event.description || '')
      setColor(event.color)
    }
  }, [event])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!event) return

    setLoading(true)
    try {
      await editEvent(event.id, { name, description, color })
      onClose()
    } catch (error) {
      console.error('Error updating event:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!event) return null

  return (
    <Modal open={open} onClose={onClose} title="Modifica evento">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome evento
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrizione
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Colore</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-8 h-8 rounded-full transition-transform',
                  color === c && 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Annulla
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Salvataggio...' : 'Salva modifiche'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}



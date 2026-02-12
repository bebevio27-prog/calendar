import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addDays,
  isSameDay,
  parseISO,
  isAfter,
  isBefore,
} from 'date-fns'

export function formatDate(date) {
  return format(date, 'yyyy-MM-dd')
}

export function getWeekDays(referenceDate) {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 }) // Lunedì
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + m
}

export function generateEvents(events, overrides, weekStart, weekEnd) {
  const result = []
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  for (const event of events) {
    if (event.isRecurring) {
      // Eventi ricorrenti
      for (const day of days) {
        const dow = day.getDay()
        const schedule = event.schedule?.find((s) => s.dayOfWeek === dow)
        
        if (schedule) {
          const dateStr = formatDate(day)
          const override = overrides.find(
            (o) => o.eventId === event.id && o.originalDate === dateStr
          )

          if (override?.cancelled) continue

          result.push({
            eventId: event.id,
            eventName: event.name,
            description: event.description,
            color: event.color,
            date: dateStr,
            startTime: override?.newStartTime || schedule.startTime,
            endTime: override?.newEndTime || schedule.endTime,
            isRecurring: true,
            originalEvent: event, // Mantieni riferimento all'evento originale
          })
        }
      }
    } else {
      // Eventi singoli
      const eventDate = parseISO(event.date)
      if (
        (isSameDay(eventDate, weekStart) || isAfter(eventDate, weekStart)) &&
        (isSameDay(eventDate, weekEnd) || isBefore(eventDate, weekEnd))
      ) {
        result.push({
          eventId: event.id,
          eventName: event.name,
          description: event.description,
          color: event.color,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime,
          isRecurring: false,
          originalEvent: event, // Mantieni riferimento all'evento originale
        })
      }
    }
  }

  return result
}

export function getCalendarHours(events) {
  if (events.length === 0) return { start: 8, end: 20 }

  const times = events.flatMap((e) => [e.startTime, e.endTime])
  const minutes = times.map(timeToMinutes)
  const minMinutes = Math.min(...minutes)
  const maxMinutes = Math.max(...minutes)

  const startHour = Math.floor(minMinutes / 60)
  const endHour = Math.ceil(maxMinutes / 60)

  return {
    start: Math.max(0, startHour - 1),
    end: Math.min(24, endHour + 1),
  }
}

export function getTodayEvents(events) {
  const today = formatDate(new Date())
  return events
    .filter((e) => e.date === today)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))
}

export function isEventNow(event) {
  const now = new Date()
  const today = formatDate(now)
  
  if (event.date !== today) return false
  
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const startMinutes = timeToMinutes(event.startTime)
  const endMinutes = timeToMinutes(event.endTime)
  
  return currentMinutes >= startMinutes && currentMinutes <= endMinutes
}

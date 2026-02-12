import { useEffect, useMemo } from 'react'
import { Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import { useAppStore } from '../stores/appStore'
import { formatDate, getTodayEvents, isEventNow } from '../lib/calendar'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { cn } from '../lib/utils'

export default function RemindersPage() {
  const { currentUser } = useAuth()
  const { events, overrides, loaded, loadData } = useAppStore()

  useEffect(() => {
    if (currentUser && !loaded) {
      loadData(currentUser.uid)
    }
  }, [currentUser, loaded, loadData])

  const todayDate = useMemo(() => new Date(), [])
  const todayStr = useMemo(() => formatDate(todayDate), [todayDate])

  const todayEvents = useMemo(() => {
    const allEvents = []
    
    // Eventi singoli di oggi
    const singleEvents = events
      .filter((e) => !e.isRecurring && e.date === todayStr)
      .map((e) => ({
        eventId: e.id,
        eventName: e.name,
        description: e.description,
        color: e.color,
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
        isRecurring: false,
      }))

    allEvents.push(...singleEvents)

    // Eventi ricorrenti di oggi
    const dow = todayDate.getDay()
    const recurringEvents = events
      .filter((e) => e.isRecurring)
      .flatMap((e) => {
        const schedules = e.schedule?.filter((s) => s.dayOfWeek === dow) || []
        return schedules.map((schedule) => {
          const override = overrides.find(
            (o) => o.eventId === e.id && o.originalDate === todayStr
          )

          if (override?.cancelled) return null

          return {
            eventId: e.id,
            eventName: e.name,
            description: e.description,
            color: e.color,
            date: todayStr,
            startTime: override?.newStartTime || schedule.startTime,
            endTime: override?.newEndTime || schedule.endTime,
            isRecurring: true,
          }
        })
      })
      .filter(Boolean)

    allEvents.push(...recurringEvents)

    // Ordina per orario
    return allEvents.sort((a, b) => {
      const aMin = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1])
      const bMin = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1])
      return aMin - bMin
    })
  }, [events, overrides, todayStr, todayDate])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-brand-300 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reminder di oggi</h1>
        <p className="text-gray-600 mt-1">
          {format(todayDate, "EEEE d MMMM yyyy", { locale: it })}
        </p>
      </div>

      {/* Events list */}
      {todayEvents.length === 0 ? (
        <Card className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Nessun evento oggi
          </h3>
          <p className="text-gray-600">Goditi la giornata libera! 🎉</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {todayEvents.map((event, index) => {
            const isNow = isEventNow(event)
            
            return (
              <Card
                key={`${event.eventId}-${index}`}
                className={cn(
                  'transition-all',
                  isNow && 'ring-2 ring-brand-400 shadow-lg'
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-1 h-full rounded-full flex-shrink-0"
                    style={{ backgroundColor: event.color }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.eventName}
                        </h3>
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {event.description}
                          </p>
                        )}
                      </div>
                      {isNow && <Badge variant="success">In corso</Badge>}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        <span>
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                      {event.isRecurring && (
                        <Badge variant="info">Ricorrente</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-100 rounded-lg">
              <CalendarIcon size={24} className="text-brand-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Eventi oggi</p>
              <p className="text-2xl font-bold text-gray-900">{todayEvents.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Eventi totali</p>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

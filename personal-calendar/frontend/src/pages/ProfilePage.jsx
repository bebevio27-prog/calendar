import { useEffect, useMemo } from 'react'
import { User, Mail, Calendar, Repeat } from 'lucide-react'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'
import { useAuth } from '../contexts/AuthContext'
import { useAppStore } from '../stores/appStore'
import Card from '../components/ui/Card'

export default function ProfilePage() {
  const { currentUser } = useAuth()
  const { events, loaded, loadData } = useAppStore()

  useEffect(() => {
    if (currentUser && !loaded) {
      loadData(currentUser.uid)
    }
  }, [currentUser, loaded, loadData])

  const stats = useMemo(() => {
    const recurringEvents = events.filter((e) => e.isRecurring).length
    const singleEvents = events.filter((e) => !e.isRecurring).length
    
    return {
      total: events.length,
      recurring: recurringEvents,
      single: singleEvents,
    }
  }, [events])

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-brand-300 border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profilo</h1>
        <p className="text-gray-600 mt-1">Gestisci il tuo account e visualizza le statistiche</p>
      </div>

      {/* User info */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center">
            <User size={32} className="text-brand-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentUser?.displayName || 'Utente'}
            </h2>
            <p className="text-gray-600 flex items-center gap-1.5">
              <Mail size={14} />
              {currentUser?.email}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Membro da</dt>
              <dd className="text-sm font-medium text-gray-900">
                {currentUser?.metadata?.creationTime
                  ? format(new Date(currentUser.metadata.creationTime), 'd MMMM yyyy', {
                      locale: it,
                    })
                  : '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Ultimo accesso</dt>
              <dd className="text-sm font-medium text-gray-900">
                {currentUser?.metadata?.lastSignInTime
                  ? format(new Date(currentUser.metadata.lastSignInTime), "d MMM yyyy 'alle' HH:mm", {
                      locale: it,
                    })
                  : '-'}
              </dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Statistics */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiche eventi</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-100 rounded-lg">
                <Calendar size={24} className="text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Eventi totali</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Repeat size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Ricorrenti</p>
                <p className="text-2xl font-bold text-gray-900">{stats.recurring}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar size={24} className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Singoli</p>
                <p className="text-2xl font-bold text-gray-900">{stats.single}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent events */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Eventi recenti</h2>
        
        {events.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-600">Nessun evento creato ancora</p>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {events.slice(0, 10).map((event) => (
                <div key={event.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {event.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {event.isRecurring
                          ? `Ricorrente • ${event.schedule?.length || 0} slot settimanali`
                          : `${format(new Date(event.date), 'd MMM yyyy', { locale: it })} • ${event.startTime} - ${event.endTime}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

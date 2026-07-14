import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, MapPin, CheckCircle2, ToggleLeft, ToggleRight, ChevronRight, Clock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Card, StatusBadge, SectionHeader, EmptyState, PageLoader, Button } from '../../components/ui'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export default function RiderDashboard() {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [available, setAvailable] = useState(user?.is_available || false)
  const [toggling, setToggling] = useState(false)
  const [deliveries, setDeliveries] = useState([])
  const [available_jobs, setAvailableJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/deliveries/rider'),
      api.get('/deliveries/available'),
    ]).then(([mine, avail]) => {
      setDeliveries(mine.data.deliveries || [])
      setAvailableJobs(avail.data.deliveries || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggleAvail = async () => {
    setToggling(true)
    try {
      const { data } = await api.patch('/riders/availability')
      setAvailable(data.is_available)
    } catch {}
    setToggling(false)
  }

  const active = deliveries.filter(d => ['assigned','picked_up','in_transit'].includes(d.status))
  const completed = deliveries.filter(d => d.status === 'delivered')

  if (loading) return <PageLoader />

  return (
    <div className="page-content">
      {/* Header */}
      <div className="mb-5">
        <p className="text-brand-gray-500 text-sm">Welcome back,</p>
        <h1 className="font-display font-bold text-brand-black text-2xl">{user?.full_name?.split(' ')[0]}</h1>
      </div>

      {/* Availability toggle */}
      <Card className="p-4 mb-5 flex items-center justify-between">
        <div>
          <p className="font-display font-semibold text-brand-black">Availability</p>
          <p className={clsx('text-sm font-medium mt-0.5', available ? 'text-green-600' : 'text-brand-gray-500')}>
            {available ? '● Online — accepting jobs' : '○ Offline'}
          </p>
        </div>
        <button
          onClick={toggleAvail}
          disabled={toggling}
          className="transition-all active:scale-95"
        >
          {available
            ? <ToggleRight size={44} className="text-green-500" />
            : <ToggleLeft  size={44} className="text-brand-gray-300" />
          }
        </button>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active',    value: active.length,    color: 'bg-amber-500' },
          { label: 'Completed', value: completed.length, color: 'bg-green-500' },
          { label: 'Available', value: available_jobs.length, color: 'bg-blue-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-brand-gray-100 shadow-soft p-4 text-center">
            <p className={`text-2xl font-display font-bold text-brand-black`}>{value}</p>
            <p className="text-brand-gray-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Active jobs */}
      {active.length > 0 && (
        <div className="mb-6">
          <SectionHeader title="Active jobs" subtitle="Currently assigned to you" />
          <div className="space-y-3">
            {active.map(d => (
              <Card key={d.id} onClick={() => navigate('/app/active', { state: { delivery: d } })} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-semibold text-brand-black text-sm">{d.tracking_code}</p>
                    <p className="text-brand-gray-500 text-xs">{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-xs text-brand-gray-600">
                    <div className="w-2 h-2 rounded-full bg-brand-red flex-shrink-0" />
                    <span className="truncate">{d.pickup_address}</span>
                  </div>
                  <div className="ml-1 w-px h-2 bg-brand-gray-200" />
                  <div className="flex items-center gap-2 text-xs text-brand-gray-600">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="truncate">{d.delivery_address}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-brand-gray-500">Recipient: <span className="font-semibold">{d.recipient_name}</span></span>
                  <ChevronRight size={16} className="text-brand-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available jobs */}
      <div>
        <SectionHeader
          title="Available jobs"
          subtitle={`${available_jobs.length} jobs waiting`}
          action={<button onClick={() => navigate('/app/jobs')} className="text-brand-red text-sm font-semibold">View all →</button>}
        />
        {available_jobs.length === 0 ? (
          <EmptyState icon={Package} title="No jobs available" description="Check back soon — new requests are added frequently." />
        ) : (
          <div className="space-y-3">
            {available_jobs.slice(0, 3).map(d => (
              <Card key={d.id} onClick={() => navigate('/app/jobs')} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-display font-semibold text-brand-black text-sm">{d.tracking_code}</p>
                  {d.priority === 'urgent' && (
                    <span className="bg-red-50 text-brand-red text-xs font-bold px-2 py-0.5 rounded-full">Urgent</span>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-brand-gray-600">
                    <MapPin size={11} className="text-brand-red flex-shrink-0" />
                    <span className="truncate">{d.pickup_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-brand-gray-600">
                    <MapPin size={11} className="text-green-500 flex-shrink-0" />
                    <span className="truncate">{d.delivery_address}</span>
                  </div>
                </div>
                <p className="text-brand-gray-400 text-xs mt-2">{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

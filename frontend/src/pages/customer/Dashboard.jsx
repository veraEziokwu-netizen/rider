import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, MapPin, Plus, ChevronRight, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Card, StatusBadge, SectionHeader, EmptyState, PageLoader } from '../../components/ui'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-2xl border border-brand-gray-100 shadow-soft p-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-2xl font-display font-bold text-brand-black">{value}</p>
    <p className="text-brand-gray-500 text-xs mt-0.5">{label}</p>
  </div>
)

export default function CustomerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/deliveries/my').then(r => setDeliveries(r.data.deliveries || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const counts = {
    total:    deliveries.length,
    active:   deliveries.filter(d => ['pending','assigned','picked_up','in_transit'].includes(d.status)).length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
  }

  const recent = deliveries.slice(0, 5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return <PageLoader />

  return (
    <div className="page-content">
      {/* Greeting */}
      <div className="mb-6">
        <p className="text-brand-gray-500 text-sm">{greeting},</p>
        <h1 className="font-display font-bold text-brand-black text-2xl mt-0.5">
          {user?.full_name?.split(' ')[0]} 👋
        </h1>
      </div>

      {/* Quick action */}
      <button
        onClick={() => navigate('/app/request')}
        className="w-full bg-brand-red rounded-2xl p-5 flex items-center justify-between mb-6 active:scale-[0.98] transition-transform shadow-card"
      >
        <div>
          <p className="text-white/70 text-xs font-medium mb-0.5">Ready to send?</p>
          <p className="text-white font-display font-bold text-lg">New delivery request</p>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <Plus size={24} className="text-white" />
        </div>
      </button>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard icon={Package}     label="Total"     value={counts.total}     color="bg-brand-black" />
        <StatCard icon={Truck}       label="Active"    value={counts.active}    color="bg-amber-500" />
        <StatCard icon={CheckCircle2}label="Delivered" value={counts.delivered} color="bg-green-500" />
      </div>

      {/* Active deliveries */}
      {counts.active > 0 && (
        <div className="mb-6">
          <SectionHeader
            title="Active deliveries"
            subtitle={`${counts.active} in progress`}
            action={
              <Link to="/app/track" className="text-brand-red text-sm font-semibold">Track →</Link>
            }
          />
          <div className="space-y-3">
            {deliveries.filter(d => ['pending','assigned','picked_up','in_transit'].includes(d.status)).map(d => (
              <Card key={d.id} onClick={() => navigate('/app/track', { state: { code: d.tracking_code } })} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-display font-semibold text-brand-black text-sm">{d.tracking_code}</p>
                    <p className="text-brand-gray-500 text-xs mt-0.5">To: {d.recipient_name}</p>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="space-y-1.5">
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
                {d.rider_name && (
                  <div className="mt-3 pt-3 border-t border-brand-gray-100 flex items-center justify-between">
                    <p className="text-xs text-brand-gray-500">Rider: <span className="font-semibold text-brand-black">{d.rider_name}</span></p>
                    <ChevronRight size={14} className="text-brand-gray-400" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent deliveries */}
      <div>
        <SectionHeader
          title="Recent deliveries"
          action={deliveries.length > 5 ? <Link to="/app/history" className="text-brand-red text-sm font-semibold">See all →</Link> : null}
        />
        {recent.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No deliveries yet"
            description="Create your first delivery request and track it in real time."
            action={
              <button onClick={() => navigate('/app/request')} className="btn-primary text-sm px-5 py-3 rounded-xl">
                Make a request
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {recent.map(d => (
              <Card key={d.id} className="p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  d.status === 'delivered' ? 'bg-green-50' : d.status === 'cancelled' ? 'bg-red-50' : 'bg-amber-50'
                }`}>
                  {d.status === 'delivered' ? <CheckCircle2 size={18} className="text-green-600" /> :
                   d.status === 'cancelled'  ? <AlertCircle  size={18} className="text-red-500" />   :
                                               <Clock         size={18} className="text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-brand-black text-sm truncate">{d.tracking_code}</p>
                  <p className="text-brand-gray-500 text-xs truncate">{d.delivery_address}</p>
                  <p className="text-brand-gray-400 text-xs mt-0.5">
                    {formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

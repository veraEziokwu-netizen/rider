import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Users, Bike, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Card, StatusBadge, SectionHeader, PageLoader } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <Card className="p-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-2xl font-display font-bold text-brand-black">{value}</p>
    <p className="text-brand-gray-500 text-xs mt-0.5">{label}</p>
    {sub && <p className="text-brand-gray-400 text-[10px] mt-1">{sub}</p>}
  </Card>
)

export default function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/deliveries/stats'),
      api.get('/deliveries?limit=6'),
    ]).then(([s, d]) => {
      setStats(s.data.stats)
      setRecent(d.data.deliveries || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="page-content">
      <div className="mb-6">
        <p className="text-brand-gray-500 text-sm">Admin overview</p>
        <h1 className="font-display font-bold text-brand-black text-2xl">Dashboard</h1>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Package}     label="Total deliveries"  value={stats?.totalDeliveries || 0} color="bg-brand-black" />
        <StatCard icon={Clock}       label="Pending"           value={stats?.pending || 0}         color="bg-amber-500" />
        <StatCard icon={TrendingUp}  label="In progress"       value={stats?.inTransit || 0}       color="bg-blue-500" />
        <StatCard icon={CheckCircle2}label="Delivered"         value={stats?.delivered || 0}       color="bg-green-500" />
      </div>

      {/* Riders & Users */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4 flex items-center gap-3 cursor-pointer hover:border-brand-red/30 transition-colors" onClick={() => navigate('/app/riders')}>
          <div className="w-10 h-10 bg-brand-red-light rounded-xl flex items-center justify-center flex-shrink-0">
            <Bike size={18} className="text-brand-red" />
          </div>
          <div>
            <p className="font-display font-bold text-brand-black text-xl">{stats?.totalRiders || 0}</p>
            <p className="text-brand-gray-500 text-xs">Riders</p>
            <p className="text-green-600 text-[10px] font-semibold">{stats?.activeRiders || 0} online</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 cursor-pointer hover:border-brand-red/30 transition-colors" onClick={() => navigate('/app/users')}>
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-display font-bold text-brand-black text-xl">{stats?.totalUsers || 0}</p>
            <p className="text-brand-gray-500 text-xs">Customers</p>
          </div>
        </Card>
      </div>

      {/* Recent deliveries */}
      <div>
        <SectionHeader
          title="Recent deliveries"
          action={<button onClick={() => navigate('/app/deliveries')} className="text-brand-red text-sm font-semibold flex items-center gap-1">All <ArrowRight size={14} /></button>}
        />
        <div className="space-y-3">
          {recent.map(d => (
            <Card key={d.id} className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                d.status === 'delivered' ? 'bg-green-50' : d.status === 'pending' ? 'bg-amber-50' : 'bg-blue-50'
              }`}>
                {d.status === 'delivered'
                  ? <CheckCircle2 size={18} className="text-green-600" />
                  : d.status === 'pending'
                  ? <Clock size={18} className="text-amber-600" />
                  : <Package size={18} className="text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-brand-black text-sm">{d.tracking_code}</p>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-brand-gray-500 text-xs truncate">{d.customer_name} → {d.delivery_address}</p>
                <p className="text-brand-gray-400 text-[10px] mt-0.5">{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

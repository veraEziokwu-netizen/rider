import { useState, useEffect } from 'react'
import { Search, Package, Filter } from 'lucide-react'
import { Card, StatusBadge, PriorityBadge, PageLoader, EmptyState } from '../../components/ui'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'

const STATUSES = ['all', 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled']

export default function AdminDeliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetch = (status) => {
    setLoading(true)
    const q = status && status !== 'all' ? `?status=${status}` : ''
    api.get(`/deliveries${q}`).then(r => setDeliveries(r.data.deliveries || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch(filter) }, [filter])

  const filtered = search
    ? deliveries.filter(d =>
        d.tracking_code.includes(search.toUpperCase()) ||
        d.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        d.rider_name?.toLowerCase().includes(search.toLowerCase()) ||
        d.delivery_address?.toLowerCase().includes(search.toLowerCase())
      )
    : deliveries

  return (
    <div className="page-content">
      <div className="mb-5">
        <h1 className="font-display font-bold text-brand-black text-2xl">Deliveries</h1>
        <p className="text-brand-gray-500 text-sm">{deliveries.length} total</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400" />
        <input
          className="w-full bg-white border border-brand-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          placeholder="Search tracking code, customer, address..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-4 px-4 scrollbar-none">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); setSearch('') }}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
              filter === s ? 'bg-brand-black text-white' : 'bg-white border border-brand-gray-200 text-brand-gray-600 hover:bg-brand-gray-50'
            }`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-24 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Package} title="No deliveries found" description="Try changing the filter or search term." />
      ) : (
        <div className="space-y-3">
          {filtered.map(d => (
            <Card key={d.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-display font-bold text-brand-black text-sm font-mono">{d.tracking_code}</p>
                  <p className="text-brand-gray-400 text-xs">{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={d.priority} />
                  <StatusBadge status={d.status} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-brand-gray-400 font-semibold uppercase tracking-wide text-[10px]">Customer</p>
                  <p className="text-brand-black font-medium truncate">{d.customer_name || '—'}</p>
                </div>
                <div>
                  <p className="text-brand-gray-400 font-semibold uppercase tracking-wide text-[10px]">Rider</p>
                  <p className="text-brand-black font-medium truncate">{d.rider_name || 'Unassigned'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-brand-gray-400 font-semibold uppercase tracking-wide text-[10px]">Destination</p>
                  <p className="text-brand-black truncate">{d.delivery_address}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

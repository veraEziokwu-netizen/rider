import { useState, useEffect } from 'react'
import { Search, Bike, Star, ToggleLeft, ToggleRight } from 'lucide-react'
import { Card, PageLoader, EmptyState } from '../../components/ui'
import api from '../../services/api'
import clsx from 'clsx'

export default function AdminRiders() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toggling, setToggling] = useState(null)

  const fetch = () => {
    setLoading(true)
    api.get('/riders').then(r => setRiders(r.data.riders || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const toggleStatus = async (id) => {
    setToggling(id)
    try {
      await api.patch(`/riders/users/${id}/toggle`)
      setRiders(prev => prev.map(r => r.id === id ? { ...r, is_active: r.is_active ? 0 : 1 } : r))
    } catch {}
    setToggling(null)
  }

  const filtered = search
    ? riders.filter(r =>
        r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.email?.toLowerCase().includes(search.toLowerCase()) ||
        r.phone?.includes(search)
      )
    : riders

  const online = riders.filter(r => r.is_available).length

  return (
    <div className="page-content">
      <div className="mb-5">
        <h1 className="font-display font-bold text-brand-black text-2xl">Riders</h1>
        <p className="text-brand-gray-500 text-sm">{riders.length} total · <span className="text-green-600 font-semibold">{online} online</span></p>
      </div>

      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400" />
        <input
          className="w-full bg-white border border-brand-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          placeholder="Search riders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Bike} title="No riders found" description="Riders who register will appear here." />
      ) : (
        <div className="space-y-3">
          {filtered.map(r => (
            <Card key={r.id} className={clsx('p-4', !r.is_active && 'opacity-60')}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-brand-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-brand-black">{r.full_name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-display font-semibold text-brand-black">{r.full_name}</p>
                      <p className="text-brand-gray-500 text-xs">{r.email}</p>
                      <p className="text-brand-gray-500 text-xs">{r.phone}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={clsx(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        r.is_available ? 'bg-green-50 text-green-700' : 'bg-brand-gray-100 text-brand-gray-500'
                      )}>
                        {r.is_available ? '● Online' : '○ Offline'}
                      </span>
                      <span className={clsx(
                        'text-[10px] font-bold px-2 py-0.5 rounded-full',
                        r.is_active ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-brand-red'
                      )}>
                        {r.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3">
                    <div className="text-center">
                      <p className="font-bold text-brand-black text-sm">{r.total_deliveries}</p>
                      <p className="text-brand-gray-400 text-[10px]">Deliveries</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-0.5">
                        <Star size={11} className="text-amber-500 fill-amber-500" />
                        <p className="font-bold text-brand-black text-sm">{r.rating?.toFixed(1)}</p>
                      </div>
                      <p className="text-brand-gray-400 text-[10px]">Rating</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-brand-black text-sm capitalize">{r.vehicle_type || '—'}</p>
                      <p className="text-brand-gray-400 text-[10px]">Vehicle</p>
                    </div>
                    <div className="ml-auto">
                      <button
                        onClick={() => toggleStatus(r.id)}
                        disabled={toggling === r.id}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
                        style={{ borderColor: r.is_active ? '#fca5a5' : '#bbf7d0', color: r.is_active ? '#dc2626' : '#16a34a', background: r.is_active ? '#fef2f2' : '#f0fdf4' }}
                      >
                        {toggling === r.id ? '...' : r.is_active ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

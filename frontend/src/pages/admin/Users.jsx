import { useState, useEffect } from 'react'
import { Search, Users, ShoppingBag, Bike } from 'lucide-react'
import { Card, PageLoader, EmptyState } from '../../components/ui'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [toggling, setToggling] = useState(null)

  const fetch = () => {
    setLoading(true)
    api.get('/riders/users').then(r => setUsers(r.data.users || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const toggleStatus = async (id) => {
    setToggling(id)
    try {
      await api.patch(`/riders/users/${id}/toggle`)
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: u.is_active ? 0 : 1 } : u))
    } catch {}
    setToggling(null)
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchSearch = !search ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search)
    return matchRole && matchSearch
  })

  return (
    <div className="page-content">
      <div className="mb-5">
        <h1 className="font-display font-bold text-brand-black text-2xl">Users</h1>
        <p className="text-brand-gray-500 text-sm">{users.length} registered users</p>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400" />
        <input
          className="w-full bg-white border border-brand-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Role filter */}
      <div className="flex gap-2 mb-5">
        {['all', 'customer', 'rider'].map(r => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={clsx(
              'px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all',
              roleFilter === r ? 'bg-brand-black text-white' : 'bg-white border border-brand-gray-200 text-brand-gray-600'
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="space-y-3">
          {filtered.map(u => (
            <Card key={u.id} className={clsx('p-4 flex items-center gap-3', !u.is_active && 'opacity-60')}>
              <div className="w-11 h-11 bg-brand-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="font-display font-bold text-brand-black text-sm">{u.full_name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-brand-black text-sm truncate">{u.full_name}</p>
                  <span className={clsx(
                    'text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0',
                    u.role === 'customer' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'
                  )}>
                    {u.role}
                  </span>
                </div>
                <p className="text-brand-gray-500 text-xs truncate">{u.email} · {u.phone}</p>
                <p className="text-brand-gray-400 text-[10px] mt-0.5">
                  Joined {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                </p>
              </div>
              <button
                onClick={() => toggleStatus(u.id)}
                disabled={toggling === u.id}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border flex-shrink-0 transition-all"
                style={{
                  borderColor: u.is_active ? '#fca5a5' : '#bbf7d0',
                  color: u.is_active ? '#dc2626' : '#16a34a',
                  background: u.is_active ? '#fef2f2' : '#f0fdf4'
                }}
              >
                {toggling === u.id ? '...' : u.is_active ? 'Suspend' : 'Restore'}
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

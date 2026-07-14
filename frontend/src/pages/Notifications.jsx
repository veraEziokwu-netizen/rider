import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import { Card, PageLoader, EmptyState, Button } from '../components/ui'
import api from '../services/api'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const TYPE_CONFIG = {
  info:    { icon: Info,          cls: 'bg-blue-50 text-blue-600' },
  success: { icon: CheckCircle2,  cls: 'bg-green-50 text-green-600' },
  warning: { icon: AlertTriangle, cls: 'bg-amber-50 text-amber-600' },
  error:   { icon: XCircle,       cls: 'bg-red-50 text-brand-red' },
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const fetch = () => {
    setLoading(true)
    api.get('/notifications').then(r => setNotifications(r.data.notifications || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const markAll = async () => {
    setMarking(true)
    try {
      await api.patch('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })))
    } catch {}
    setMarking(false)
  }

  const markOne = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {})
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n))
  }

  const unread = notifications.filter(n => !n.is_read).length

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-brand-black text-2xl">Notifications</h1>
          {unread > 0 && <p className="text-brand-gray-500 text-sm">{unread} unread</p>}
        </div>
        {unread > 0 && (
          <Button variant="ghost" size="sm" loading={marking} onClick={markAll} className="flex items-center gap-1.5">
            <CheckCheck size={15} /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="Updates about your deliveries will appear here." />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
            const Icon = cfg.icon
            return (
              <div
                key={n.id}
                onClick={() => !n.is_read && markOne(n.id)}
                className={clsx(
                  'flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer',
                  n.is_read
                    ? 'bg-white border-brand-gray-100'
                    : 'bg-brand-gray-50 border-brand-gray-200 hover:border-brand-red/30'
                )}
              >
                <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', cfg.cls)}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={clsx('text-sm font-semibold font-display', n.is_read ? 'text-brand-gray-700' : 'text-brand-black')}>
                      {n.title}
                    </p>
                    {!n.is_read && <div className="w-2 h-2 bg-brand-red rounded-full flex-shrink-0 mt-1" />}
                  </div>
                  <p className="text-brand-gray-500 text-xs mt-0.5 leading-relaxed">{n.message}</p>
                  <p className="text-brand-gray-400 text-[10px] mt-1.5">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

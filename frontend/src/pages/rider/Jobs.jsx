import { useState, useEffect } from 'react'
import { MapPin, Clock, Package, ChevronRight, AlertCircle } from 'lucide-react'
import { Card, StatusBadge, EmptyState, PageLoader, Button } from '../../components/ui'
import api from '../../services/api'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export default function RiderJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [msg, setMsg] = useState('')

  const fetch = () => {
    setLoading(true)
    api.get('/deliveries/available').then(r => setJobs(r.data.deliveries || [])).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetch() }, [])

  const accept = async (id) => {
    setAccepting(id); setMsg('')
    try {
      await api.patch(`/deliveries/${id}/accept`)
      setMsg('Job accepted! Check your active jobs.')
      setJobs(j => j.filter(d => d.id !== id))
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not accept job')
    } finally { setAccepting(null) }
  }

  if (loading) return <PageLoader />

  return (
    <div className="page-content">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-brand-black text-2xl">Available jobs</h1>
          <p className="text-brand-gray-500 text-sm">{jobs.length} requests waiting</p>
        </div>
        <button onClick={fetch} className="text-brand-red text-sm font-semibold">Refresh</button>
      </div>

      {msg && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3.5 mb-4">
          <AlertCircle size={16} className="text-green-600" />
          <p className="text-green-700 text-sm font-medium">{msg}</p>
        </div>
      )}

      {jobs.length === 0 ? (
        <EmptyState icon={Package} title="No available jobs" description="New dispatch requests will appear here. Refresh to check." action={<Button onClick={fetch} variant="secondary">Refresh</Button>} />
      ) : (
        <div className="space-y-4">
          {jobs.map(d => (
            <Card key={d.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-bold text-brand-black">{d.tracking_code}</p>
                  <p className="text-brand-gray-400 text-xs mt-0.5">{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</p>
                </div>
                {d.priority === 'urgent'
                  ? <span className="bg-red-50 text-brand-red text-xs font-bold px-2.5 py-1 rounded-full">Urgent</span>
                  : <span className="bg-brand-gray-100 text-brand-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full">Normal</span>
                }
              </div>

              <div className="space-y-2 mb-4 bg-brand-gray-50 rounded-xl p-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-brand-red mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-brand-gray-400 text-[10px] font-semibold uppercase tracking-wide">Pickup</p>
                    <p className="text-brand-black text-sm">{d.pickup_address}</p>
                  </div>
                </div>
                <div className="ml-0.5 w-px h-3 bg-brand-gray-200 ml-1" />
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-brand-gray-400 text-[10px] font-semibold uppercase tracking-wide">Delivery</p>
                    <p className="text-brand-black text-sm">{d.delivery_address}</p>
                  </div>
                </div>
              </div>

              {d.package_description && (
                <p className="text-brand-gray-500 text-xs mb-3">
                  <span className="font-semibold">Package:</span> {d.package_description}
                </p>
              )}

              <Button
                size="md"
                className="w-full"
                loading={accepting === d.id}
                onClick={() => accept(d.id)}
              >
                Accept this job
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

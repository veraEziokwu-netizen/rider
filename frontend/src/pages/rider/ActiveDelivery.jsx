import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MapPin, Phone, Navigation, CheckCircle2, Package } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Card, Button, StatusBadge, EmptyState } from '../../components/ui'
import { getSocket } from '../../services/socket'
import api from '../../services/api'

const riderIcon = L.divIcon({
  html: `<div style="width:38px;height:38px;background:#141414;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px">🏍️</div>`,
  iconSize: [38, 38], iconAnchor: [19, 19], className: ''
})

function RecenterMap({ position }) {
  const map = useMap()
  useEffect(() => { if (position) map.panTo(position) }, [position])
  return null
}

const STATUS_FLOW = {
  assigned:   { next: 'picked_up',  label: 'Mark as picked up',  color: 'bg-purple-600' },
  picked_up:  { next: 'in_transit', label: 'Start delivery',      color: 'bg-indigo-600' },
  in_transit: { next: 'delivered',  label: 'Mark as delivered',   color: 'bg-green-600' },
}

export default function ActiveDelivery() {
  const location = useLocation()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState(location.state?.delivery || null)
  const [myPos, setMyPos] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [msg, setMsg] = useState('')
  const watchRef = useRef(null)
  const socketRef = useRef(getSocket())

  // Fetch active delivery if not passed via state
  useEffect(() => {
    if (!delivery) {
      api.get('/deliveries/rider').then(r => {
        const active = (r.data.deliveries || []).find(d => ['assigned','picked_up','in_transit'].includes(d.status))
        if (active) setDelivery(active)
      })
    }
  }, [])

  // GPS watch — send location to server + socket
  useEffect(() => {
    if (!delivery || !navigator.geolocation) return
    const socket = socketRef.current

    watchRef.current = navigator.geolocation.watchPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setMyPos([lat, lng])
        // Emit via socket for real-time push to customer
        if (socket) socket.emit('rider:location', { lat, lng, delivery_id: delivery.id })
        // Also REST update
        api.patch('/riders/location', { lat, lng, delivery_id: delivery.id }).catch(() => {})
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    )

    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [delivery?.id])

  const advanceStatus = async () => {
    if (!delivery || !STATUS_FLOW[delivery.status]) return
    setUpdating(true)
    const next = STATUS_FLOW[delivery.status].next
    try {
      await api.patch(`/deliveries/${delivery.id}/status`, { status: next })
      setDelivery(d => ({ ...d, status: next }))
      setMsg(next === 'delivered' ? 'Delivery completed! Great job.' : `Status updated to ${next.replace('_', ' ')}.`)
      if (next === 'delivered') {
        if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
        setTimeout(() => navigate('/app/dashboard'), 2500)
      }
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed')
    } finally { setUpdating(false) }
  }

  if (!delivery) {
    return (
      <div className="page-content">
        <h1 className="font-display font-bold text-brand-black text-2xl mb-6">Active delivery</h1>
        <EmptyState
          icon={Package}
          title="No active delivery"
          description="Accept a job from the available jobs list to start delivering."
          action={<Button onClick={() => navigate('/app/jobs')}>View available jobs</Button>}
        />
      </div>
    )
  }

  const actionBtn = STATUS_FLOW[delivery.status]
  const defaultCenter = [6.4527, 7.5174]

  return (
    <div className="page-content">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-brand-black text-2xl">Active delivery</h1>
          <p className="text-brand-gray-500 text-sm">{delivery.tracking_code}</p>
        </div>
        <StatusBadge status={delivery.status} />
      </div>

      {/* Map */}
      <Card className="mb-4 overflow-hidden">
        <div className="h-56">
          <MapContainer center={myPos || defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
            {myPos && <Marker position={myPos} icon={riderIcon}><Popup>You are here</Popup></Marker>}
            {myPos && <RecenterMap position={myPos} />}
          </MapContainer>
        </div>
        <div className="px-4 py-3 border-t border-brand-gray-100 flex items-center gap-2">
          <Navigation size={14} className={myPos ? 'text-green-500' : 'text-brand-gray-400'} />
          <span className="text-xs text-brand-gray-500 font-medium">
            {myPos ? 'GPS active — customer can see your location' : 'Waiting for GPS signal...'}
          </span>
        </div>
      </Card>

      {/* Delivery details */}
      <Card className="p-4 mb-4">
        <p className="font-display font-semibold text-brand-black text-sm mb-3">Delivery details</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={13} className="text-brand-red" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-wide">Pickup</p>
              <p className="text-brand-black text-sm font-medium">{delivery.pickup_address}</p>
            </div>
          </div>
          <div className="ml-3.5 w-px h-4 bg-brand-gray-200" />
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <MapPin size={13} className="text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-wide">Delivery</p>
              <p className="text-brand-black text-sm font-medium">{delivery.delivery_address}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Recipient */}
      <Card className="p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-wide mb-1">Recipient</p>
          <p className="font-display font-semibold text-brand-black">{delivery.recipient_name}</p>
          <p className="text-brand-gray-500 text-sm">{delivery.recipient_phone}</p>
        </div>
        <a href={`tel:${delivery.recipient_phone}`} className="w-11 h-11 bg-green-50 rounded-xl flex items-center justify-center">
          <Phone size={20} className="text-green-700" />
        </a>
      </Card>

      {msg && (
        <div className={`rounded-xl p-3.5 mb-4 text-sm font-medium ${delivery.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
          {msg}
        </div>
      )}

      {/* Action button */}
      {actionBtn && delivery.status !== 'delivered' && (
        <Button
          size="lg"
          className={`w-full ${actionBtn.color} hover:opacity-90`}
          loading={updating}
          onClick={advanceStatus}
        >
          {actionBtn.next === 'delivered' ? <CheckCircle2 size={18} /> : null}
          {actionBtn.label}
        </Button>
      )}

      {delivery.status === 'delivered' && (
        <div className="flex flex-col items-center py-8 text-center">
          <CheckCircle2 size={48} className="text-green-500 mb-3" />
          <p className="font-display font-bold text-brand-black text-xl">Delivery complete!</p>
          <p className="text-brand-gray-500 text-sm mt-1">Great work. Redirecting to dashboard...</p>
        </div>
      )}
    </div>
  )
}

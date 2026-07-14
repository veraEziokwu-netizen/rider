import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, MapPin, Phone, Bike, Package, RefreshCw } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Button, Card, StatusBadge, InputField, PageLoader } from '../../components/ui'
import { getSocket } from '../../services/socket'
import api from '../../services/api'

// Custom marker icons
const makeIcon = (color) => L.divIcon({
  html: `<div style="width:32px;height:32px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [32, 32], iconAnchor: [16, 32], className: ''
})
const riderIcon = L.divIcon({
  html: `<div style="width:38px;height:38px;background:#141414;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px">🏍️</div>`,
  iconSize: [38, 38], iconAnchor: [19, 19], className: ''
})
const pickupIcon = makeIcon('#E03131')
const deliveryIcon = makeIcon('#22c55e')

function FlyTo({ position }) {
  const map = useMap()
  useEffect(() => { if (position) map.flyTo(position, 14, { duration: 1.5 }) }, [position])
  return null
}

export default function TrackDelivery() {
  const location = useLocation()
  const [code, setCode] = useState(location.state?.code || '')
  const [inputCode, setInputCode] = useState(location.state?.code || '')
  const [delivery, setDelivery] = useState(null)
  const [riderPos, setRiderPos] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const socketRef = useRef(getSocket())

  const fetchDelivery = async (c) => {
    if (!c?.trim()) return
    setLoading(true); setError('')
    try {
      const { data } = await api.get(`/deliveries/track/${c.trim().toUpperCase()}`)
      setDelivery(data.delivery)
      if (data.delivery.current_lat) setRiderPos([data.delivery.current_lat, data.delivery.current_lng])
    } catch {
      setError('Delivery not found. Check the tracking code.')
    } finally { setLoading(false) }
  }

  useEffect(() => {
    if (code) fetchDelivery(code)
  }, [code])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!delivery?.id) return
    const socket = socketRef.current
    if (!socket) return
    socket.emit('watch:delivery', { delivery_id: delivery.id })
    socket.on('delivery:location', ({ lat, lng }) => setRiderPos([lat, lng]))
    socket.on('delivery:status_update', ({ status }) => setDelivery(d => ({ ...d, status })))
    return () => {
      socket.emit('unwatch:delivery', { delivery_id: delivery.id })
      socket.off('delivery:location')
      socket.off('delivery:status_update')
    }
  }, [delivery?.id])

  const defaultCenter = [6.4527, 7.5174] // Enugu
  const pickupPos = delivery?.pickup_lat  ? [delivery.pickup_lat,  delivery.pickup_lng]  : null
  const dropPos   = delivery?.delivery_lat? [delivery.delivery_lat,delivery.delivery_lng]: null
  const mapCenter = riderPos || pickupPos || defaultCenter

  const STATUS_STEPS = ['pending','assigned','picked_up','in_transit','delivered']

  return (
    <div className="page-content">
      <div className="mb-5">
        <h1 className="font-display font-bold text-brand-black text-2xl">Track delivery</h1>
        <p className="text-brand-gray-500 text-sm">Enter your tracking code below</p>
      </div>

      {/* Search */}
      <div className="flex gap-2 mb-5">
        <div className="flex-1">
          <input
            className="input-field uppercase placeholder-shown:normal-case"
            placeholder="e.g. DNG-7F3KX9AB"
            value={inputCode}
            onChange={e => setInputCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && setCode(inputCode)}
          />
        </div>
        <Button onClick={() => setCode(inputCode)} loading={loading}>
          <Search size={18} />
        </Button>
      </div>

      {error && <p className="text-brand-red text-sm font-medium mb-4">{error}</p>}

      {delivery && (
        <>
          {/* Map */}
          <Card className="mb-4 overflow-hidden">
            <div className="h-56 sm:h-72">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                {riderPos   && <Marker position={riderPos}   icon={riderIcon}><Popup>Rider is here</Popup></Marker>}
                {pickupPos  && <Marker position={pickupPos}  icon={pickupIcon}><Popup>Pickup: {delivery.pickup_address}</Popup></Marker>}
                {dropPos    && <Marker position={dropPos}    icon={deliveryIcon}><Popup>Delivery: {delivery.delivery_address}</Popup></Marker>}
                {riderPos && pickupPos  && <Polyline positions={[riderPos, pickupPos]}  color="#E03131" weight={2} dashArray="6" />}
                {riderPos && dropPos    && <Polyline positions={[riderPos, dropPos]}    color="#22c55e" weight={2} dashArray="6" />}
                {riderPos && <FlyTo position={riderPos} />}
              </MapContainer>
            </div>
          </Card>

          {/* Status timeline */}
          <Card className="p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-display font-bold text-brand-black">{delivery.tracking_code}</p>
                <p className="text-brand-gray-500 text-xs">To: {delivery.recipient_name}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={delivery.status} />
                <button onClick={() => fetchDelivery(code)} className="p-1.5 rounded-lg hover:bg-brand-gray-100 text-brand-gray-500">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-4">
              {STATUS_STEPS.map((s, i) => {
                const current = STATUS_STEPS.indexOf(delivery.status)
                return (
                  <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= current ? 'bg-brand-red' : 'bg-brand-gray-100'}`} />
                )
              })}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-brand-red" />
                <span className="text-brand-gray-500 text-xs">From:</span>
                <span className="text-brand-black text-xs font-medium truncate">{delivery.pickup_address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-brand-gray-500 text-xs">To:</span>
                <span className="text-brand-black text-xs font-medium truncate">{delivery.delivery_address}</span>
              </div>
            </div>
          </Card>

          {/* Rider info */}
          {delivery.rider_name && (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Bike size={22} className="text-brand-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-brand-black">{delivery.rider_name}</p>
                  <p className="text-brand-gray-500 text-xs">{delivery.vehicle_type || 'Motorcycle'} · {delivery.plate_number || '—'}</p>
                </div>
                <a href={`tel:${delivery.rider_phone}`} className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center hover:bg-green-100">
                  <Phone size={18} className="text-green-700" />
                </a>
              </div>
            </Card>
          )}
        </>
      )}

      {!delivery && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-brand-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Package size={28} className="text-brand-gray-400" />
          </div>
          <p className="font-display font-semibold text-brand-black">Enter a tracking code</p>
          <p className="text-brand-gray-500 text-sm mt-1">Your tracking code is on the confirmation screen.</p>
        </div>
      )}
    </div>
  )
}

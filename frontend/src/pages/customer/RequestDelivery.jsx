import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, User, Phone, Package, FileText, AlertCircle, CheckCircle2, Navigation } from 'lucide-react'
import { Button, InputField, Card } from '../../components/ui'
import api from '../../services/api'

const steps = ['Pickup & delivery', 'Recipient', 'Review']

export default function RequestDelivery() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)
  const [locating, setLocating] = useState(false)

  const [form, setForm] = useState({
    pickup_address: '', pickup_lat: null, pickup_lng: null,
    delivery_address: '', delivery_lat: null, delivery_lng: null,
    recipient_name: '', recipient_phone: '',
    package_description: '', priority: 'normal', notes: '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const getLocation = (type) => {
    if (!navigator.geolocation) { setError('Geolocation not supported'); return }
    setLocating(type)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        if (type === 'pickup') setForm(f => ({ ...f, pickup_lat: lat, pickup_lng: lng }))
        else setForm(f => ({ ...f, delivery_lat: lat, delivery_lng: lng }))
        setLocating(false)
      },
      () => { setError('Could not get location. Enter address manually.'); setLocating(false) },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const validateStep = () => {
    if (step === 0) {
      if (!form.pickup_address.trim()) return 'Enter a pickup address'
      if (!form.delivery_address.trim()) return 'Enter a delivery address'
    }
    if (step === 1) {
      if (!form.recipient_name.trim()) return 'Enter recipient name'
      if (!form.recipient_phone.trim()) return 'Enter recipient phone'
    }
    return null
  }

  const next = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/deliveries', form)
      setSuccess(data.delivery)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create request')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="page-content flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={40} className="text-green-600" />
        </div>
        <h2 className="font-display font-bold text-brand-black text-2xl mb-2">Request sent!</h2>
        <p className="text-brand-gray-500 text-sm mb-2">Your delivery request is pending assignment.</p>
        <div className="bg-brand-gray-50 rounded-2xl px-6 py-4 mb-6 border border-brand-gray-200">
          <p className="text-xs text-brand-gray-500 mb-1 uppercase tracking-wide font-semibold">Tracking code</p>
          <p className="font-display font-bold text-brand-black text-xl font-mono">{success.tracking_code}</p>
        </div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button onClick={() => navigate('/app/track', { state: { code: success.tracking_code } })}>
            Track this delivery
          </Button>
          <Button variant="secondary" onClick={() => { setSuccess(null); setStep(0); setForm({ pickup_address:'',pickup_lat:null,pickup_lng:null,delivery_address:'',delivery_lat:null,delivery_lng:null,recipient_name:'',recipient_phone:'',package_description:'',priority:'normal',notes:'' }) }}>
            New request
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-content">
      <div className="mb-6">
        <h1 className="font-display font-bold text-brand-black text-2xl">New request</h1>
        <p className="text-brand-gray-500 text-sm mt-0.5">Fill in delivery details below</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-brand-black text-white' : 'bg-brand-gray-200 text-brand-gray-500'
            }`}>
              {i < step ? <CheckCircle2 size={14} /> : i + 1}
            </div>
            <span className={`text-xs font-semibold truncate ${i === step ? 'text-brand-black' : 'text-brand-gray-400'}`}>{s}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-brand-gray-200 ml-1" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4">
          <AlertCircle size={16} className="text-brand-red flex-shrink-0" />
          <p className="text-brand-red text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Step 0 */}
      {step === 0 && (
        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-xs font-bold text-brand-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-brand-red" /> Pickup location
            </p>
            <InputField
              placeholder="Enter pickup address"
              value={form.pickup_address}
              onChange={set('pickup_address')}
            />
            <button
              type="button"
              onClick={() => getLocation('pickup')}
              className="mt-2 flex items-center gap-2 text-brand-red text-xs font-semibold hover:underline"
              disabled={locating === 'pickup'}
            >
              <Navigation size={12} />
              {locating === 'pickup' ? 'Getting location...' : form.pickup_lat ? '✓ GPS location set' : 'Use my current location'}
            </button>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-bold text-brand-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" /> Delivery location
            </p>
            <InputField
              placeholder="Enter delivery address"
              value={form.delivery_address}
              onChange={set('delivery_address')}
            />
            <button
              type="button"
              onClick={() => getLocation('delivery')}
              className="mt-2 flex items-center gap-2 text-brand-red text-xs font-semibold hover:underline"
              disabled={locating === 'delivery'}
            >
              <Navigation size={12} />
              {locating === 'delivery' ? 'Getting location...' : form.delivery_lat ? '✓ GPS location set' : 'Use my current location'}
            </button>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-bold text-brand-gray-600 uppercase tracking-wide mb-3">Priority</p>
            <div className="grid grid-cols-2 gap-2">
              {[['normal', 'Normal'], ['urgent', 'Urgent']].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, priority: val }))}
                  className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                    form.priority === val
                      ? val === 'urgent' ? 'bg-brand-red text-white border-brand-red' : 'bg-brand-black text-white border-brand-black'
                      : 'bg-brand-gray-50 text-brand-gray-600 border-brand-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <Button size="lg" onClick={next} className="w-full">Continue</Button>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            <InputField label="Recipient name" placeholder="Full name of recipient" value={form.recipient_name} onChange={set('recipient_name')} icon={User} />
            <InputField label="Recipient phone" type="tel" placeholder="080XXXXXXXX" value={form.recipient_phone} onChange={set('recipient_phone')} icon={Phone} />
            <InputField label="Package description" placeholder="e.g. Documents, phone, clothing..." value={form.package_description} onChange={set('package_description')} icon={Package} />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-600 uppercase tracking-wide">Additional notes</label>
              <textarea
                placeholder="Any special instructions for the rider..."
                value={form.notes}
                onChange={set('notes')}
                rows={3}
                className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-xl px-4 py-3.5 text-brand-black placeholder-brand-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent resize-none transition-all"
              />
            </div>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => { setStep(0); setError('') }}>Back</Button>
            <Button onClick={next}>Review</Button>
          </div>
        </div>
      )}

      {/* Step 2 — Review */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <p className="font-display font-semibold text-brand-black text-sm">Order summary</p>
            {[
              ['Pickup', form.pickup_address],
              ['Delivery', form.delivery_address],
              ['Recipient', `${form.recipient_name} · ${form.recipient_phone}`],
              ['Priority', form.priority === 'urgent' ? 'Urgent' : 'Normal'],
              form.package_description && ['Package', form.package_description],
              form.notes && ['Notes', form.notes],
            ].filter(Boolean).map(([label, value]) => (
              <div key={label} className="flex gap-3">
                <p className="text-brand-gray-400 text-xs font-semibold w-20 flex-shrink-0 pt-0.5">{label}</p>
                <p className="text-brand-black text-sm flex-1">{value}</p>
              </div>
            ))}
          </Card>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => { setStep(1); setError('') }}>Back</Button>
            <Button onClick={submit} loading={loading}>Send request</Button>
          </div>
        </div>
      )}
    </div>
  )
}

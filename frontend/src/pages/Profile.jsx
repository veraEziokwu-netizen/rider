import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, LogOut, Shield, Bike, ShoppingBag, ChevronRight, Bell, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Card, Button } from '../components/ui'
import clsx from 'clsx'

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-3 border-b border-brand-gray-100 last:border-0">
    <div className="w-8 h-8 bg-brand-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
      <Icon size={15} className="text-brand-gray-500" />
    </div>
    <div className="flex-1">
      <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-brand-black text-sm font-medium mt-0.5">{value || '—'}</p>
    </div>
  </div>
)

const roleConfig = {
  customer: { icon: ShoppingBag, label: 'Customer',      color: 'bg-blue-50 text-blue-700' },
  rider:    { icon: Bike,        label: 'Dispatch Rider', color: 'bg-green-50 text-green-700' },
  admin:    { icon: Shield,      label: 'Administrator',  color: 'bg-brand-red-light text-brand-red' },
}

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)

  const cfg = roleConfig[user?.role] || roleConfig.customer
  const RoleIcon = cfg.icon

  const handleLogout = () => {
    if (!confirming) { setConfirming(true); return }
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="page-content">
      {/* Avatar & name */}
      <div className="flex flex-col items-center text-center py-6 mb-6">
        <div className="w-20 h-20 bg-brand-black rounded-3xl flex items-center justify-center mb-4 shadow-card">
          <span className="font-display font-bold text-white text-3xl">
            {user?.full_name?.[0]?.toUpperCase()}
          </span>
        </div>
        <h1 className="font-display font-bold text-brand-black text-2xl">{user?.full_name}</h1>
        <div className={clsx('flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full text-xs font-semibold', cfg.color)}>
          <RoleIcon size={12} />
          {cfg.label}
        </div>
      </div>

      {/* Account info */}
      <Card className="p-4 mb-4">
        <p className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide mb-1">Account details</p>
        <InfoRow icon={User}  label="Full name" value={user?.full_name} />
        <InfoRow icon={Mail}  label="Email"     value={user?.email} />
        <InfoRow icon={Phone} label="Phone"     value={user?.phone} />
      </Card>

      {/* Rider stats */}
      {user?.role === 'rider' && (
        <Card className="p-4 mb-4">
          <p className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide mb-3">Rider stats</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-display font-bold text-brand-black text-xl">{user?.total_deliveries ?? 0}</p>
              <p className="text-brand-gray-500 text-xs">Deliveries</p>
            </div>
            <div>
              <p className="font-display font-bold text-brand-black text-xl">{user?.rating?.toFixed(1) ?? '5.0'}</p>
              <p className="text-brand-gray-500 text-xs">Rating</p>
            </div>
            <div>
              <p className={clsx('font-display font-bold text-xl', user?.is_available ? 'text-green-600' : 'text-brand-gray-400')}>
                {user?.is_available ? 'On' : 'Off'}
              </p>
              <p className="text-brand-gray-500 text-xs">Status</p>
            </div>
          </div>
        </Card>
      )}

      {/* App info */}
      <Card className="p-4 mb-6">
        <p className="text-xs font-bold text-brand-gray-500 uppercase tracking-wide mb-1">App info</p>
        {[
          { icon: Bell,  label: 'Notifications', sub: 'Enabled' },
          { icon: Lock,  label: 'Privacy & security', sub: 'Standard' },
          { icon: Shield,label: 'App version', sub: '1.0.0' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 py-3 border-b border-brand-gray-100 last:border-0">
            <div className="w-8 h-8 bg-brand-gray-50 rounded-lg flex items-center justify-center">
              <Icon size={15} className="text-brand-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-brand-black text-sm font-medium">{label}</p>
              <p className="text-brand-gray-400 text-xs">{sub}</p>
            </div>
            <ChevronRight size={16} className="text-brand-gray-300" />
          </div>
        ))}
      </Card>

      {/* Logout */}
      <Button
        variant={confirming ? 'danger' : 'secondary'}
        size="lg"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut size={18} />
        {confirming ? 'Tap again to confirm sign out' : 'Sign out'}
      </Button>
      {confirming && (
        <p className="text-center text-xs text-brand-gray-400 mt-2">
          <button onClick={() => setConfirming(false)} className="underline">Cancel</button>
        </p>
      )}

      <p className="text-center text-brand-gray-400 text-xs mt-8">
        DispatchNG · Caritas University Final Year Project
      </p>
    </div>
  )
}

import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Package, MapPin, Bell, User,
  LogOut, Menu, X, ChevronRight, Bike, Users, BarChart3, Settings
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const NAV_ITEMS = {
  customer: [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Home' },
    { to: '/app/request',   icon: Package,         label: 'Request' },
    { to: '/app/track',     icon: MapPin,           label: 'Track' },
    { to: '/app/notifications', icon: Bell,         label: 'Alerts' },
    { to: '/app/profile',   icon: User,             label: 'Profile' },
  ],
  rider: [
    { to: '/app/dashboard', icon: LayoutDashboard,  label: 'Home' },
    { to: '/app/jobs',      icon: Package,          label: 'Jobs' },
    { to: '/app/active',    icon: MapPin,           label: 'Active' },
    { to: '/app/notifications', icon: Bell,         label: 'Alerts' },
    { to: '/app/profile',   icon: User,             label: 'Profile' },
  ],
  admin: [
    { to: '/app/dashboard', icon: BarChart3,        label: 'Overview' },
    { to: '/app/deliveries',icon: Package,          label: 'Deliveries' },
    { to: '/app/riders',    icon: Bike,             label: 'Riders' },
    { to: '/app/users',     icon: Users,            label: 'Users' },
    { to: '/app/profile',   icon: Settings,         label: 'Settings' },
  ],
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const items = NAV_ITEMS[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const roleLabel = { customer: 'Customer', rider: 'Rider', admin: 'Administrator' }[user?.role]
  const roleColor = { customer: 'bg-blue-50 text-blue-700', rider: 'bg-green-50 text-green-700', admin: 'bg-brand-red-light text-brand-red' }[user?.role]

  return (
    <div className="min-h-screen bg-brand-offwhite flex">

      {/* ── DESKTOP SIDEBAR (lg+) ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-brand-black min-h-screen fixed left-0 top-0 bottom-0 z-30">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-red rounded-xl flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight">DispatchNG</span>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-gray-700 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{user?.full_name?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.full_name}</p>
              <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', roleColor)}>{roleLabel}</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-red text-white'
                  : 'text-brand-gray-400 hover:text-white hover:bg-white/10'
              )}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-brand-gray-400 hover:text-white hover:bg-white/10 transition-all duration-150"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── TABLET SIDEBAR (md, collapsible) ── */}
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          </div>
        )}
        <aside className={clsx(
          'fixed left-0 top-0 bottom-0 z-50 w-72 bg-brand-black flex flex-col transition-transform duration-300 lg:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-red rounded-xl flex items-center justify-center">
                <Package size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-white">DispatchNG</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-brand-gray-400 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-gray-700 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">{user?.full_name?.[0]?.toUpperCase()}</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{user?.full_name}</p>
                <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', roleColor)}>{roleLabel}</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {items.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive ? 'bg-brand-red text-white' : 'text-brand-gray-400 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon size={18} />
                {label}
                <ChevronRight size={14} className="ml-auto opacity-40" />
              </NavLink>
            ))}
          </nav>

          <div className="px-3 py-4 border-t border-white/10">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-brand-gray-400 hover:text-white hover:bg-white/10 transition-all">
              <LogOut size={18} />
              Sign out
            </button>
          </div>
        </aside>
      </>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col lg:ml-64 min-h-screen">

        {/* Mobile / Tablet top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-brand-offwhite/95 backdrop-blur-md border-b border-brand-gray-100">
          <div className="flex items-center justify-between px-4 h-14">
            <button onClick={() => setSidebarOpen(true)} className="md:flex hidden p-2 rounded-xl hover:bg-brand-gray-100">
              <Menu size={20} className="text-brand-black" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-7 h-7 bg-brand-red rounded-lg flex items-center justify-center">
                <Package size={14} className="text-white" />
              </div>
              <span className="font-display font-bold text-brand-black text-base">DispatchNG</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', roleColor)}>{roleLabel}</span>
              <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-brand-gray-100">
                <Menu size={20} className="text-brand-black" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV (< md) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-brand-gray-100 bottom-nav shadow-nav">
        <div className="flex items-center justify-around h-16">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[56px] touch-manipulation',
                isActive ? 'text-brand-red' : 'text-brand-gray-400'
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={clsx('p-1.5 rounded-xl transition-all', isActive && 'bg-brand-red-light')}>
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  </div>
                  <span className="text-[10px] font-semibold leading-none">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

export const Button = ({ children, variant = 'primary', size = 'md', loading, className, ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-display font-semibold rounded-xl transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 touch-manipulation'
  const variants = {
    primary:   'bg-brand-red text-white hover:bg-brand-red-dark focus:ring-brand-red',
    secondary: 'bg-white text-brand-black border border-brand-gray-200 hover:bg-brand-gray-50 focus:ring-brand-gray-300',
    ghost:     'text-brand-gray-600 hover:bg-brand-gray-100 focus:ring-brand-gray-200',
    danger:    'bg-brand-red-light text-brand-red hover:bg-red-100 focus:ring-brand-red',
    dark:      'bg-brand-black text-white hover:bg-brand-gray-800 focus:ring-brand-gray-600',
  }
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3.5 text-sm',
    lg: 'px-6 py-4 text-base w-full',
  }
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} disabled={loading || props.disabled} {...props}>
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  )
}

export const Card = ({ children, className, onClick, ...props }) => (
  <div
    onClick={onClick}
    className={clsx('bg-white rounded-2xl border border-brand-gray-100 shadow-soft', onClick && 'cursor-pointer active:scale-[0.99] transition-transform', className)}
    {...props}
  >
    {children}
  </div>
)

const STATUS_MAP = {
  pending:    { label: 'Pending',    cls: 'bg-amber-50 text-amber-700' },
  assigned:   { label: 'Assigned',   cls: 'bg-blue-50 text-blue-700' },
  picked_up:  { label: 'Picked up',  cls: 'bg-purple-50 text-purple-700' },
  in_transit: { label: 'In transit', cls: 'bg-indigo-50 text-indigo-700' },
  delivered:  { label: 'Delivered',  cls: 'bg-green-50 text-green-700' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-50 text-red-700' },
}

export const StatusBadge = ({ status }) => {
  const { label, cls } = STATUS_MAP[status] || { label: status, cls: 'bg-gray-50 text-gray-700' }
  return <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold', cls)}>{label}</span>
}

export const PriorityBadge = ({ priority }) => (
  <span className={clsx(
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
    priority === 'urgent' ? 'bg-red-50 text-brand-red' : 'bg-brand-gray-100 text-brand-gray-600'
  )}>
    {priority === 'urgent' ? 'Urgent' : 'Normal'}
  </span>
)

export const Spinner = ({ size = 20, className }) => (
  <Loader2 size={size} className={clsx('animate-spin text-brand-red', className)} />
)

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-3">
      <Spinner size={32} />
      <p className="text-sm text-brand-gray-500 font-medium">Loading...</p>
    </div>
  </div>
)

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-16 h-16 bg-brand-gray-100 rounded-2xl flex items-center justify-center mb-4">
      <Icon size={28} className="text-brand-gray-400" />
    </div>
    <h3 className="font-display font-semibold text-brand-black text-base mb-1">{title}</h3>
    {description && <p className="text-brand-gray-500 text-sm mb-4 max-w-xs">{description}</p>}
    {action}
  </div>
)

export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-4">
    <div>
      <h2 className="font-display font-bold text-brand-black text-lg leading-tight">{title}</h2>
      {subtitle && <p className="text-brand-gray-500 text-sm mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
)

export const InputField = ({ label, error, icon: Icon, ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-semibold text-brand-gray-600 uppercase tracking-wide">{label}</label>}
    <div className="relative">
      {Icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400"><Icon size={16} /></div>}
      <input
        className={clsx(
          'w-full bg-brand-gray-50 border rounded-xl px-4 py-3.5 text-brand-black placeholder-brand-gray-400 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent',
          Icon && 'pl-10',
          error ? 'border-red-400 bg-red-50' : 'border-brand-gray-200'
        )}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-brand-red font-medium">{error}</p>}
  </div>
)

export const Divider = ({ label }) => (
  <div className="flex items-center gap-3 my-2">
    <div className="flex-1 h-px bg-brand-gray-200" />
    {label && <span className="text-xs text-brand-gray-400 font-medium">{label}</span>}
    <div className="flex-1 h-px bg-brand-gray-200" />
  </div>
)

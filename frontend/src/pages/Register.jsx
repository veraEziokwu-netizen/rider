import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Package, Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, Bike, ShoppingBag } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, InputField } from '../components/ui'
import clsx from 'clsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '',
    role: params.get('role') === 'rider' ? 'rider' : 'customer'
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form)
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col">
      <div className="px-5 pt-5">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-gray-600 hover:text-brand-black text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={26} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-brand-black text-2xl">Create account</h1>
            <p className="text-brand-gray-500 text-sm mt-1">Join DispatchNG today</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-brand-gray-100 rounded-2xl">
            {[
              { val: 'customer', icon: ShoppingBag, label: 'Customer' },
              { val: 'rider',    icon: Bike,         label: 'Rider' },
            ].map(({ val, icon: Icon, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => setForm(f => ({ ...f, role: val }))}
                className={clsx(
                  'flex flex-col items-center gap-1.5 py-3.5 rounded-xl text-sm font-semibold transition-all font-display',
                  form.role === val
                    ? 'bg-white text-brand-black shadow-soft'
                    : 'text-brand-gray-500 hover:text-brand-gray-700'
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5">
              <p className="text-brand-red text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField label="Full name" type="text" placeholder="Chukwuemeka Obi" value={form.full_name} onChange={set('full_name')} icon={User} required />
            <InputField label="Email address" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} icon={Mail} required autoComplete="email" />
            <InputField label="Phone number" type="tel" placeholder="080XXXXXXXX" value={form.phone} onChange={set('phone')} icon={Phone} required />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-600 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400"><Lock size={16} /></div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={set('password')}
                  required
                  autoComplete="new-password"
                  className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-xl pl-10 pr-12 py-3.5 text-brand-black placeholder-brand-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600 p-1">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Create {form.role === 'rider' ? 'rider' : ''} account
            </Button>
          </form>

          <p className="text-center text-sm text-brand-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-red font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

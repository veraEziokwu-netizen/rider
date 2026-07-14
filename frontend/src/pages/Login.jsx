import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Package, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, InputField } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate('/app/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-offwhite flex flex-col">
      {/* Back */}
      <div className="px-5 pt-5">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-gray-600 hover:text-brand-black text-sm font-medium transition-colors">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-black rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={26} className="text-white" />
            </div>
            <h1 className="font-display font-bold text-brand-black text-2xl">Welcome back</h1>
            <p className="text-brand-gray-500 text-sm mt-1">Sign in to your DispatchNG account</p>
          </div>

          {/* Demo creds */}
          <div className="bg-brand-gray-50 rounded-2xl p-4 mb-6 border border-brand-gray-200">
            <p className="text-xs font-bold text-brand-gray-600 uppercase tracking-wide mb-2">Demo credentials</p>
            <div className="space-y-1 text-xs text-brand-gray-600 font-mono">
              <p>Admin: admin@dispatchng.com / Admin@123</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5">
              <p className="text-brand-red text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              icon={Mail}
              required
              autoComplete="email"
            />
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-brand-gray-600 uppercase tracking-wide">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400"><Lock size={16} /></div>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  required
                  autoComplete="current-password"
                  className="w-full bg-brand-gray-50 border border-brand-gray-200 rounded-xl pl-10 pr-12 py-3.5 text-brand-black placeholder-brand-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-gray-600 p-1">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" loading={loading} className="w-full mt-2">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-brand-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-red font-semibold hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

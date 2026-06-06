import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import API_URL from '../utils/api'

export default function Login() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      localStorage.setItem('token', data.token)
      localStorage.setItem('userName', data.name)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-950 via-green-800 to-emerald-600 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-300 shadow-lg bg-white">
            <img src="/logo.png" alt="Trupti Yoga" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-tight">Trupti Yoga</p>
            <p className="text-green-300 text-xs leading-tight">& Nature Cure</p>
          </div>
        </Link>

        {/* Main content */}
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Welcome Back to<br />
            <span className="text-green-300">Your Wellness</span>
          </h2>
          <p className="text-green-200 text-lg mb-10">
            Join live yoga sessions with Dr. Vishwa Hiremath every day.
          </p>
          <div className="flex flex-col gap-4">
            {[
              { icon: '🌅', text: '3 live sessions daily: 6 AM, 8 AM and 11 AM IST' },
              { icon: '🎓', text: 'BNYS certified expert guidance' },
              { icon: '🌍', text: 'Practice from anywhere in the world' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-green-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-green-300/60 text-xs relative z-10">
          "Yoga is not exercise. It is Medicine." - Dr. Vishwa
        </p>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-600 bg-white">
              <img src="/logo.png" alt="Trupti Yoga" className="w-full h-full object-cover scale-110" />
            </div>
            <div className="text-left">
              <p className="text-green-800 font-bold text-sm leading-tight">Trupti Yoga</p>
              <p className="text-green-600 text-xs leading-tight">& Nature Cure</p>
            </div>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Sign In</h1>
            <p className="text-gray-500 mt-1">Access your sessions and membership</p>
          </div>

          {params.get('from') === 'signup' && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-2xl px-4 py-3 mb-6 flex items-center gap-2">
              <span>✅</span> Account created! Please sign in to continue.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-6 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</label>
              <input
                name="email" type="email" value={form.email} onChange={handle} required
                placeholder="you@email.com"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-green-500 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
              <input
                name="password" type="password" value={form.password} onChange={handle} required
                placeholder="Your password"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-green-500 transition-colors bg-white"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="mt-1 w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              New to Trupti Yoga?{' '}
              <Link to="/signup" className="text-green-600 font-bold hover:underline">Create Free Account</Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <a
              href="https://wa.me/918088943510"
              target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-green-600 text-xs transition-colors"
            >
              Need help? WhatsApp us →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

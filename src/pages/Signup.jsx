import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API_URL from '../utils/api'
import TermsModal from '../components/TermsModal'

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', email: '', location: '', password: '', confirm: '' })
  const [terms, setTerms] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (!terms) return setError('Please accept the Terms and Conditions')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          location: form.location,
          password: form.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Signup failed')
      navigate('/login?from=signup')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-green-950 via-green-800 to-emerald-600 flex-col justify-between p-12 relative overflow-hidden">
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
            Begin Your<br />
            <span className="text-green-300">Healing Journey</span>
          </h2>
          <p className="text-green-200 text-lg mb-10">
            Join Dr. Vishwa Hiremath's live yoga community today.
          </p>
          <div className="flex flex-col gap-5">
            {[
              { icon: '🧘', title: 'All Levels Welcome', desc: 'Whether you are a beginner or advanced practitioner' },
              { icon: '💊', title: 'Yoga as Medicine', desc: 'Science-backed therapeutic yoga for real health results' },
              { icon: '📱', title: 'Live on Google Meet', desc: 'Interactive sessions with real-time guidance' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{item.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{item.title}</p>
                  <p className="text-green-300/80 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 relative z-10">
          <p className="text-green-100 text-sm font-medium">Starting at ₹2,000 / month</p>
          <p className="text-green-300/70 text-xs mt-1">Individual · Couple · Family · One-to-One plans available</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 py-10 bg-gray-50 overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-6 text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-green-600 bg-white">
              <img src="/logo.png" alt="Trupti Yoga" className="w-full h-full object-cover scale-110" />
            </div>
            <div className="text-left">
              <p className="text-green-800 font-bold text-sm leading-tight">Trupti Yoga</p>
              <p className="text-green-600 text-xs leading-tight">& Nature Cure</p>
            </div>
          </Link>
        </div>

        <div className="w-full max-w-lg mx-auto">
          <div className="mb-7">
            <h1 className="text-3xl font-extrabold text-gray-900">Create Account</h1>
            <p className="text-gray-500 mt-1">Join Trupti Yoga and start your healing journey</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Full Name</label>
                <input
                  name="name" value={form.name} onChange={handle} required
                  placeholder="Your full name"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors bg-white"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Phone Number</label>
                <input
                  name="phone" value={form.phone} onChange={handle} required
                  placeholder="+91 98765 43210"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors bg-white"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email Address</label>
              <input
                name="email" type="email" value={form.email} onChange={handle} required
                placeholder="you@email.com"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors bg-white"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Location (City / Country)</label>
              <input
                name="location" value={form.location} onChange={handle} required
                placeholder="e.g. Bangalore, India"
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
                <input
                  name="password" type="password" value={form.password} onChange={handle} required
                  placeholder="Create a password"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors bg-white"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Confirm Password</label>
                <input
                  name="confirm" type="password" value={form.confirm} onChange={handle} required
                  placeholder="Re-enter password"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors bg-white"
                />
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer bg-white rounded-2xl border-2 border-gray-200 p-4 hover:border-green-400 transition-colors">
              <input
                type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
                className="mt-0.5 accent-green-600 w-4 h-4 flex-shrink-0"
              />
              <span className="text-sm text-gray-600">
                I agree to the{' '}
                <span
                  onClick={(e) => { e.preventDefault(); setShowTerms(true) }}
                  className="text-green-600 font-semibold underline cursor-pointer"
                >
                  Terms and Conditions
                </span>
                {' '}of Trupti Yoga & Nature Cure
              </span>
            </label>

            <button
              type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-base"
            >
              {loading ? 'Creating Account...' : 'Create My Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

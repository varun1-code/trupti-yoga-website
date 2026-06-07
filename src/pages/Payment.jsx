import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import API_URL from '../utils/api'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || ''

const PLAN_LABELS = {
  individual_1m: 'Individual · 1 Month',   individual_3m: 'Individual · 3 Months',
  individual_6m: 'Individual · 6 Months',  individual_12m: 'Individual · 12 Months',
  couple_1m:     'Couple · 1 Month',        couple_3m:     'Couple · 3 Months',
  couple_6m:     'Couple · 6 Months',       couple_12m:    'Couple · 12 Months',
  family_1m:     'Family · 1 Month',        family_3m:     'Family · 3 Months',
  family_6m:     'Family · 6 Months',       family_12m:    'Family · 12 Months',
  '1to1_1m':     'One-to-One · 1 Month',   '1to1_3m':     'One-to-One · 3 Months',
  '1to1_6m':     'One-to-One · 6 Months',
}

const CATEGORIES = [
  { key: 'individual', label: 'Individual',   desc: '1 person',         emoji: '🧘' },
  { key: 'couple',     label: 'Couple',        desc: '2 persons',        emoji: '👫' },
  { key: 'family',     label: 'Family',        desc: 'Up to 4 persons',  emoji: '👨‍👩‍👧‍👦' },
  { key: '1to1',       label: 'One-to-One',   desc: 'Private sessions', emoji: '🎯' },
]

const DURATIONS = [
  { key: '1m',  label: '1 Month'   },
  { key: '3m',  label: '3 Months'  },
  { key: '6m',  label: '6 Months'  },
  { key: '12m', label: '12 Months' },
]

const DURATIONS_1TO1 = [
  { key: '1m', label: '1 Month',  sub: '12 Sessions' },
  { key: '3m', label: '3 Months', sub: '36 Sessions' },
  { key: '6m', label: '6 Months', sub: '72 Sessions' },
]

const PRICES_INR = {
  individual: { '1m': 2000, '3m': 5000,  '6m': 8500,  '12m': 15000 },
  couple:     { '1m': 3000, '3m': 8000,  '6m': 15000, '12m': 25000 },
  family:     { '1m': 5000, '3m': 12000, '6m': 20000, '12m': 40000 },
  '1to1':     { '1m': 6000, '3m': 15000, '6m': 30000 },
}

const PRICES_USD = {
  individual: { '1m': 35,  '3m': 105, '6m': 165, '12m': 265 },
  couple:     { '1m': 55,  '3m': 150, '6m': 265, '12m': 425 },
  family:     { '1m': 85,  '3m': 235, '6m': 475, '12m': 800 },
  '1to1':     { '1m': 127, '3m': 320, '6m': 587 },
}

// INR equivalents shown alongside USD for international users
const PRICES_INR_EQUIV = {
  individual: { '1m': 2000,  '3m': 5000,  '6m': 8500,  '12m': 15000 },
  couple:     { '1m': 3000,  '3m': 8000,  '6m': 15000, '12m': 25000 },
  family:     { '1m': 5000,  '3m': 12000, '6m': 20000, '12m': 40000 },
  '1to1':     { '1m': 6000,  '3m': 15000, '6m': 30000 },
}

export default function Payment() {
  const navigate = useNavigate()
  const params   = new URLSearchParams(window.location.search)

  const initialIsUpgrade = params.get('upgrade') === '1'
  const [isUpgrade, setIsUpgrade]       = useState(initialIsUpgrade)
  const [upgradeChecked, setUpgradeChecked] = useState(!initialIsUpgrade)
  const [currentPlan, setCurrentPlan]   = useState(null)

  const [country, setCountry]   = useState(null)
  const [category, setCategory] = useState('individual')
  const [duration, setDuration] = useState('1m')
  const [txnId, setTxnId]       = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (!initialIsUpgrade) return
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetch(`${API_URL}/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { setCurrentPlan(d.payment?.plan || null); setUpgradeChecked(true) })
      .catch(() => setUpgradeChecked(true))
  }, [])

  useEffect(() => {
    if (initialIsUpgrade) return
    const preview = params.get('preview')
    if (preview === 'intl') return setCountry('INTL')
    if (preview === 'in')   return setCountry('IN')
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((d) => setCountry(d.country_code === 'IN' ? 'IN' : 'INTL'))
      .catch(() => setCountry('IN'))
  }, [])

  useEffect(() => {
    if (category === '1to1' && duration === '12m') setDuration('1m')
  }, [category])

  const isIntl   = country === 'INTL'
  const prices   = isIntl ? PRICES_USD : PRICES_INR
  const symbol   = isIntl ? '$' : '₹'
  const durations = category === '1to1' ? DURATIONS_1TO1 : DURATIONS
  const price    = prices[category]?.[duration] ?? 0
  const planKey  = category === '1to1' ? `1to1_${duration}` : `${category}_${duration}`
  const catLabel = CATEGORIES.find((c) => c.key === category)?.label ?? ''
  const durLabel = durations.find((d) => d.key === duration)?.label ?? ''

  const submitUpgrade = async (e) => {
    e.preventDefault()
    setError('')
    if (!txnId.trim()) return setError('Please enter your Transaction ID')
    const token = localStorage.getItem('token')
    if (!token) return navigate('/login')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planKey, transaction_id: txnId.trim(), currency: 'INR', is_upgrade: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Submission failed')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const submitINR = async (e) => {
    e.preventDefault()
    setError('')
    if (!txnId.trim()) return setError('Please enter your UPI Transaction ID')
    const token = localStorage.getItem('token')
    if (!token) return navigate('/login')
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planKey, transaction_id: txnId.trim(), currency: 'INR' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Submission failed')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!upgradeChecked) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400 animate-pulse">Loading...</p>
    </div>
  )

  if (isUpgrade) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-8">
            <span className="text-purple-600 font-semibold text-sm uppercase tracking-widest">Plan Upgrade</span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Upgrade Your Membership</h1>
            {currentPlan && (
              <p className="text-gray-500 text-sm mt-2">
                Current plan: <strong>{PLAN_LABELS[currentPlan] || currentPlan}</strong>
              </p>
            )}
          </div>

          {/* Contact banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
            <p className="text-blue-800 font-semibold text-sm mb-1">📞 Contact Admin for Upgrade Pricing</p>
            <p className="text-blue-700 text-sm mb-4">
              Select your desired plan below, then contact Dr. Vishwa's team to get the upgrade price.
              After you make the payment, enter your transaction ID here to submit the upgrade request.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="https://wa.me/918088943510" target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                💬 WhatsApp
              </a>
              <a href="mailto:Truptiyoganaturecure@gmail.com"
                className="flex items-center justify-center gap-2 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
                📧 Email Us
              </a>
            </div>
          </div>

          {/* Plan type picker — no prices */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Step 1 — Select new plan type</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {CATEGORIES.map((c) => (
              <button key={c.key} onClick={() => setCategory(c.key)}
                className={`rounded-2xl border-2 p-4 text-center transition-all ${
                  category === c.key ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:border-purple-300'
                }`}>
                <div className="text-2xl mb-1">{c.emoji}</div>
                <p className="font-bold text-gray-800 text-sm">{c.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{c.desc}</p>
              </button>
            ))}
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Step 2 — Select duration</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {durations.map((d) => (
              <button key={d.key} onClick={() => setDuration(d.key)}
                className={`rounded-2xl border-2 p-4 text-center transition-all ${
                  duration === d.key ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-200 bg-white hover:border-purple-300'
                }`}>
                <p className="font-bold text-gray-800 text-sm">{d.label}</p>
                {d.sub && <p className="text-gray-400 text-xs">{d.sub}</p>}
                <p className="text-purple-500 text-xs font-medium mt-1">Contact for price</p>
              </button>
            ))}
          </div>

          {/* Selected plan summary */}
          <div className="bg-purple-50 border border-purple-200 rounded-2xl px-6 py-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-purple-700 font-semibold text-sm">Upgrading To</p>
              <p className="text-gray-800 font-bold">{catLabel} · {durLabel}</p>
            </div>
            <span className="text-purple-600 font-semibold text-sm">Contact admin for price →</span>
          </div>

          {/* Transaction ID form */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Step 3 — Enter Transaction ID</h2>
            <p className="text-gray-500 text-sm mb-6">
              After contacting admin and completing the payment, enter your UPI transaction ID below.
            </p>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
            )}
            <form onSubmit={submitUpgrade} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">UPI Transaction ID</label>
                <input
                  value={txnId} onChange={(e) => setTxnId(e.target.value)} required
                  placeholder="e.g. T2506031234567890"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <p className="text-xs text-gray-400 mt-1">Find this in your UPI app under payment history</p>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3.5 rounded-xl transition-all">
                {loading ? 'Submitting...' : 'Submit Upgrade Request'}
              </button>
            </form>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            Fees once paid are not returnable, refundable or transferable.
          </p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Membership</span>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Choose Your Plan</h1>
            {country === null && (
              <p className="text-gray-400 text-sm mt-2 animate-pulse">Detecting your location...</p>
            )}
            {country === 'IN' && (
              <p className="text-gray-500 text-sm mt-2">Prices shown in Indian Rupees (INR)</p>
            )}
            {country === 'INTL' && (
              <p className="text-gray-500 text-sm mt-2">Prices shown in US Dollars (USD) for international members</p>
            )}
          </div>

          {/* Category picker */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Step 1 — Select plan type</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`rounded-2xl border-2 p-4 text-center transition-all ${
                  category === c.key
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-2xl mb-1">{c.emoji}</div>
                <p className="font-bold text-gray-800 text-sm">{c.label}</p>
                <p className="text-gray-400 text-xs mt-0.5">{c.desc}</p>
              </button>
            ))}
          </div>

          {/* Duration picker */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Step 2 — Select duration</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {durations.map((d) => {
              const p    = prices[category]?.[d.key]
              const inrP = isIntl ? PRICES_INR_EQUIV[category]?.[d.key] : null
              return (
                <button
                  key={d.key}
                  onClick={() => setDuration(d.key)}
                  className={`rounded-2xl border-2 p-4 text-center transition-all ${
                    duration === d.key
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-green-300'
                  }`}
                >
                  <p className="font-bold text-gray-800 text-sm">{d.label}</p>
                  {d.sub && <p className="text-gray-400 text-xs">{d.sub}</p>}
                  <p className="text-green-600 font-extrabold text-lg mt-1">
                    {symbol}{p?.toLocaleString()}
                  </p>
                  {inrP && (
                    <p className="text-gray-400 text-xs mt-0.5">₹{inrP.toLocaleString()}</p>
                  )}
                </button>
              )
            })}
          </div>

          {/* Selected plan summary */}
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-8 flex items-center justify-between">
            <div>
              <p className="text-green-700 font-semibold text-sm">Selected Plan</p>
              <p className="text-gray-800 font-bold">{catLabel} · {durLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-green-600">{symbol}{price.toLocaleString()}</p>
              {isIntl && PRICES_INR_EQUIV[category]?.[duration] && (
                <p className="text-gray-400 text-xs mt-0.5">₹{PRICES_INR_EQUIV[category][duration].toLocaleString()} INR</p>
              )}
            </div>
          </div>

          {/* ── Indian users: UPI payment ── */}
          {(country === 'IN' || country === null) && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Pay via UPI</h2>

              <div className="flex flex-col sm:flex-row gap-8 items-center mb-8">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-gray-200 shadow-md">
                    <img src="/qr.jpg" alt="PhonePe QR Code" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs text-gray-500 text-center">Scan with any UPI app</p>
                </div>

                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-gray-400 text-sm font-medium">OR</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">UPI ID</p>
                    <p className="font-bold text-gray-800 text-lg tracking-wide">8088943510@ybl</p>
                    <p className="text-xs text-gray-400 mt-1">VISHWANATHAYYA BASAV</p>
                  </div>
                  <div className="text-sm text-gray-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <strong>Amount to pay: ₹{price.toLocaleString()}</strong><br />
                    Pay → Note the Transaction ID → Enter it below
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={submitINR} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">UPI Transaction ID</label>
                  <input
                    value={txnId} onChange={(e) => setTxnId(e.target.value)} required
                    placeholder="e.g. T2506031234567890"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <p className="text-xs text-gray-400 mt-1">Find this in your UPI app under payment history</p>
                </div>
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3.5 rounded-xl transition-all"
                >
                  {loading ? 'Submitting...' : 'Submit Payment'}
                </button>
              </form>
            </div>
          )}

          {/* ── International users: PayPal ── */}
          {country === 'INTL' && (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <h2 className="text-lg font-bold text-gray-800 mb-1">International Payment</h2>
              <p className="text-gray-500 text-sm mb-6">
                {catLabel} · {durLabel} —{' '}
                <strong className="text-gray-800">${price} USD</strong>
                {PRICES_INR_EQUIV[category]?.[duration] && (
                  <span className="text-gray-400"> · ₹{PRICES_INR_EQUIV[category][duration].toLocaleString()} INR</span>
                )}
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
              )}

              {PAYPAL_CLIENT_ID ? (
                <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
                  <PayPalButtons
                    style={{ layout: 'vertical', shape: 'pill', label: 'pay' }}
                    createOrder={(_data, actions) =>
                      actions.order.create({
                        purchase_units: [{
                          amount: { value: price.toString(), currency_code: 'USD' },
                          description: `Trupti Yoga — ${catLabel} ${durLabel}`,
                        }],
                      })
                    }
                    onApprove={async (_data, actions) => {
                      setLoading(true)
                      setError('')
                      try {
                        const order = await actions.order.capture()
                        const token = localStorage.getItem('token')
                        if (!token) return navigate('/login')
                        const res = await fetch(`${API_URL}/payment`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ plan: planKey, currency: 'USD', paypal_order_id: order.id }),
                        })
                        const d = await res.json()
                        if (!res.ok) throw new Error(d.detail || 'Failed to record payment')
                        navigate('/dashboard')
                      } catch (err) {
                        setError(err.message)
                      } finally {
                        setLoading(false)
                      }
                    }}
                    onError={() => setError('PayPal encountered an error. Please try again or contact us on WhatsApp.')}
                  />
                </PayPalScriptProvider>
              ) : (
                <div className="flex flex-col items-center gap-5">
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-sm text-blue-800 max-w-sm w-full">
                    <p className="font-semibold text-base mb-2">Contact Us to Enroll</p>
                    <p className="text-blue-700">International enrollment via WhatsApp. Our team will confirm your plan and share payment details within a few hours.</p>
                  </div>
                  <a href="https://wa.me/918088943510" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all">
                    <span>💬</span> WhatsApp Us
                  </a>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-gray-400 text-xs mt-6">
            Fees once paid are not returnable, refundable or transferable.
          </p>
        </div>
      </div>
    </div>
  )
}

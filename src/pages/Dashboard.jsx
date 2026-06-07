import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { SESSION_INFO, WINDOW_BEFORE, getISTMinutes, sessionStatus, getSessionBanner } from '../utils/sessionUtils'
import API_URL from '../utils/api'

const PLAN_LABELS = {
  individual_1m:  'Individual · 1 Month',
  individual_3m:  'Individual · 3 Months',
  individual_6m:  'Individual · 6 Months',
  individual_12m: 'Individual · 12 Months',
  couple_1m:      'Couple · 1 Month',
  couple_3m:      'Couple · 3 Months',
  couple_6m:      'Couple · 6 Months',
  couple_12m:     'Couple · 12 Months',
  family_1m:      'Family · 1 Month',
  family_3m:      'Family · 3 Months',
  family_6m:      'Family · 6 Months',
  family_12m:     'Family · 12 Months',
  '1to1_1m':      'One-to-One · 1 Month',
  '1to1_3m':      'One-to-One · 3 Months',
  '1to1_6m':      'One-to-One · 6 Months',
}

const fmtDT = (dt) => {
  if (!dt) return '—'
  const [date, time] = dt.split('T')
  if (!date) return dt
  const [y, m, d] = date.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  if (!time) return `${d} ${months[parseInt(m)-1]} ${y}`
  const [h, min] = time.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12  = hour % 12 || 12
  return `${d} ${months[parseInt(m)-1]} ${y}, ${h12}:${min} ${ampm} IST`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData]             = useState(null)
  const [error, setError]           = useState('')
  const [nowMinutes, setNowMinutes] = useState(getISTMinutes)
  const [schedules, setSchedules]   = useState([])
  const [proposing, setProposing]   = useState(false)
  const [proposeTime, setProposeTime] = useState('')
  const [proposeNotes, setProposeNotes] = useState('')
  const [scheduleMsg, setScheduleMsg]   = useState('')

  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getISTMinutes()), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return navigate('/login')
    fetch(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.detail) throw new Error(d.detail)
        setData(d)
      })
      .catch((err) => setError(err.message))
    fetch(`${API_URL}/schedule`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSchedules(d))
      .catch(() => {})
  }, [navigate])

  const refreshSchedules = () => {
    const token = localStorage.getItem('token')
    fetch(`${API_URL}/schedule`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setSchedules(d))
      .catch(() => {})
  }

  const proposeSession = async (e) => {
    e.preventDefault()
    setScheduleMsg('')
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/schedule/propose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ proposed_time: proposeTime, notes: proposeNotes }),
    })
    const d = await res.json()
    if (res.ok) {
      setProposing(false)
      setProposeTime('')
      setProposeNotes('')
      setScheduleMsg('success:Your session time has been proposed. Awaiting admin confirmation.')
      refreshSchedules()
    } else {
      setScheduleMsg(`error:${d.detail || 'Failed to propose time'}`)
    }
  }

  const respondSchedule = async (id, action) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${API_URL}/schedule/${action}/${id}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) refreshSchedules()
  }

  const logout = async () => {
    const token = localStorage.getItem('token')
    await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    navigate('/')
  }

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/login" className="text-green-600 font-semibold">Go to Login</Link>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-400">Loading your dashboard...</p>
    </div>
  )

  const payment        = data.payment
  const pendingUpgrade = data.pending_upgrade
  const currency = payment?.currency || 'INR'
  const symbol   = currency === 'USD' ? '$' : '₹'
  const amount   = payment?.amount?.toLocaleString() ?? ''

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-green-600 font-semibold text-sm uppercase tracking-widest">My Dashboard</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">Welcome, {data.name}</h1>
            </div>
            <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium">
              Log Out
            </button>
          </div>

          {/* No payment yet */}
          {!payment && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10 text-center">
              <span className="text-5xl">🧘</span>
              <h2 className="text-xl font-bold text-gray-800 mt-4 mb-2">You have not enrolled yet</h2>
              <p className="text-gray-500 mb-6">Choose a plan and complete payment to get access to all live sessions.</p>
              <Link
                to="/payment"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-full transition-all"
              >
                Enroll Now
              </Link>
            </div>
          )}

          {/* Pending */}
          {payment?.status === 'pending' && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center mb-6">
              <span className="text-4xl">⏳</span>
              <h2 className="text-lg font-bold text-amber-800 mt-3 mb-1">Payment Under Review</h2>
              <p className="text-amber-700 text-sm">
                Your payment has been received. Dr. Vishwa's team will verify and activate your account within a few hours.
              </p>
              <div className="mt-4 bg-white rounded-xl p-4 text-left inline-block text-sm text-gray-600">
                <p><span className="font-medium">Plan:</span> {PLAN_LABELS[payment.plan] || payment.plan}</p>
                <p><span className="font-medium">Amount:</span> {symbol}{amount}</p>
                <p><span className="font-medium">Status:</span> <span className="text-amber-600 font-semibold">Pending Approval</span></p>
              </div>
            </div>
          )}

          {/* Rejected */}
          {payment?.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center mb-6">
              <span className="text-4xl">❌</span>
              <h2 className="text-lg font-bold text-red-800 mt-3 mb-1">Payment Not Verified</h2>
              <p className="text-red-600 text-sm mb-4">
                We could not verify your transaction. Please contact us on WhatsApp or try again.
              </p>
              <a
                href="https://wa.me/918088943510"
                target="_blank" rel="noopener noreferrer"
                className="inline-block bg-green-600 text-white font-semibold px-6 py-2.5 rounded-full text-sm"
              >
                Contact on WhatsApp
              </a>
            </div>
          )}

          {/* Expired */}
          {payment?.status === 'approved' && payment?.is_expired && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-center mb-6">
              <span className="text-4xl">⏰</span>
              <h2 className="text-lg font-bold text-red-800 mt-3 mb-1">Subscription Expired</h2>
              <p className="text-red-600 text-sm mb-1">
                Your {PLAN_LABELS[payment.plan] || payment.plan} plan expired on{' '}
                <strong>{new Date(payment.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
              </p>
              <p className="text-red-500 text-sm mb-5">Renew your membership to regain access to all live sessions.</p>
              <Link
                to="/payment"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-full transition-all"
              >
                Renew Membership
              </Link>
            </div>
          )}

          {/* Approved & active */}
          {payment?.status === 'approved' && !payment?.is_expired && (() => {
            const expiryDate = payment.expires_at
              ? new Date(payment.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
              : null
            return (
              <>
                <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-green-800">Membership Active</p>
                      <p className="text-green-600 text-sm">
                        {PLAN_LABELS[payment.plan] || payment.plan}
                        {!payment.is_upgrade && amount > 0 && ` · ${symbol}${amount}`}
                        {expiryDate && <span className="text-green-500"> · Expires {expiryDate}</span>}
                      </p>
                    </div>
                  </div>
                  {!pendingUpgrade && (
                    <Link
                      to="/payment?upgrade=1"
                      className="flex-shrink-0 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-3 py-2 rounded-xl transition-all"
                    >
                      Upgrade Plan
                    </Link>
                  )}
                </div>

                {pendingUpgrade && (
                  <div className="bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3 mb-4 flex items-center gap-3">
                    <span className="text-lg">⬆️</span>
                    <p className="text-purple-700 text-sm">
                      <span className="font-semibold">Upgrade request pending</span> — upgrading to{' '}
                      {PLAN_LABELS[pendingUpgrade.plan] || pendingUpgrade.plan}. Admin will activate once verified.
                    </p>
                  </div>
                )}

                {/* One-to-One private session */}
                {payment.is_1to1 && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-4">
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">🎯</span>
                        <div>
                          <h2 className="text-lg font-bold text-gray-800">Your Private Sessions</h2>
                          <p className="text-gray-500 text-sm">One-to-One with Dr. Vishwa Hiremath</p>
                        </div>
                      </div>
                      {!proposing && (
                        <button
                          onClick={() => { setProposing(true); setScheduleMsg('') }}
                          className="text-sm bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition-all flex-shrink-0"
                        >
                          + Propose Time
                        </button>
                      )}
                    </div>

                    {/* Feedback message */}
                    {scheduleMsg && (() => {
                      const [type, msg] = scheduleMsg.split(':')
                      return (
                        <div className={`rounded-2xl px-4 py-3 text-sm mb-4 ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                          {msg}
                        </div>
                      )
                    })()}

                    {/* Propose a time form */}
                    {proposing && (
                      <form onSubmit={proposeSession} className="bg-purple-50 border border-purple-200 rounded-2xl p-5 mb-5">
                        <p className="font-semibold text-purple-800 text-sm mb-3">Propose a Session Time</p>
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Preferred Date & Time (IST)</label>
                            <input
                              type="datetime-local"
                              value={proposeTime}
                              onChange={(e) => setProposeTime(e.target.value)}
                              required
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 bg-white"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">Notes (optional)</label>
                            <input
                              type="text"
                              value={proposeNotes}
                              onChange={(e) => setProposeNotes(e.target.value)}
                              placeholder="e.g. Health concerns, focus area..."
                              className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400 bg-white"
                            />
                          </div>
                          <div className="flex gap-3">
                            <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-all">
                              Submit Proposal
                            </button>
                            <button type="button" onClick={() => setProposing(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-all">
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    )}

                    {/* Admin-proposed times waiting for client response */}
                    {schedules.filter(s => s.proposed_by === 'admin' && s.status === 'pending').map(s => (
                      <div key={s.id} className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-3">
                        <p className="text-blue-700 font-semibold text-sm mb-1">📅 Dr. Vishwa proposed a time</p>
                        <p className="text-gray-800 font-bold">{fmtDT(s.proposed_time)}</p>
                        {s.notes && <p className="text-gray-500 text-xs mt-1">{s.notes}</p>}
                        <div className="flex gap-3 mt-3">
                          <button
                            onClick={() => respondSchedule(s.id, 'accept')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl text-sm transition-all"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => respondSchedule(s.id, 'reject')}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 rounded-xl text-sm transition-all"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Confirmed sessions */}
                    {schedules.filter(s => s.status === 'confirmed').map(s => (
                      <div key={s.id} className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-green-700 font-semibold text-sm">✅ Confirmed Session</p>
                            <p className="text-gray-800 font-bold mt-0.5">{fmtDT(s.proposed_time)}</p>
                            {s.notes && <p className="text-gray-500 text-xs mt-1">{s.notes}</p>}
                          </div>
                          {payment.client_meet_link && (
                            <a
                              href={payment.client_meet_link}
                              target="_blank" rel="noopener noreferrer"
                              className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                            >
                              Join
                            </a>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Client proposals waiting for admin */}
                    {schedules.filter(s => s.proposed_by === 'client' && s.status === 'pending').map(s => (
                      <div key={s.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3">
                        <p className="text-amber-700 font-semibold text-sm">⏳ Awaiting admin confirmation</p>
                        <p className="text-gray-800 font-medium mt-0.5">{fmtDT(s.proposed_time)}</p>
                        {s.notes && <p className="text-gray-400 text-xs mt-1">{s.notes}</p>}
                      </div>
                    ))}

                    {/* Declined/Rejected sessions */}
                    {schedules.filter(s => s.status === 'declined' || s.status === 'rejected').map(s => (
                      <div key={s.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-3">
                        <p className="text-gray-500 text-sm">
                          {s.status === 'declined' ? '✗ Admin declined:' : '✗ You rejected:'} {fmtDT(s.proposed_time)}
                        </p>
                      </div>
                    ))}

                    {schedules.length === 0 && !proposing && (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">No sessions scheduled yet. Click "Propose Time" to get started.</p>
                      </div>
                    )}

                    {!payment.client_meet_link && schedules.filter(s => s.status === 'confirmed').length === 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-400">
                        <span>Need help?</span>
                        <a href="https://wa.me/918088943510" target="_blank" rel="noopener noreferrer" className="text-green-600 font-semibold hover:underline">
                          💬 WhatsApp Us
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Group sessions */}
                {!payment.is_1to1 && (() => {
                  const banner = getSessionBanner(nowMinutes)
                  return (
                    <>
                      {banner.type === 'live' && (
                        <div className="bg-green-600 text-white rounded-2xl px-5 py-3 mb-4 flex items-center gap-3">
                          <span className="text-xl animate-pulse">🔴</span>
                          <p className="font-semibold text-sm">The {banner.time} session is live right now. Join below!</p>
                        </div>
                      )}
                      {banner.type === 'next' && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl px-5 py-3 mb-4 flex items-center gap-3">
                          <span className="text-xl">🕐</span>
                          <p className="text-sm font-medium">Next session opens at <span className="font-bold">{banner.time} IST</span>. Join 5 minutes before.</p>
                        </div>
                      )}
                      {banner.type === 'done' && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-5 py-3 mb-4 flex items-center gap-3">
                          <span className="text-xl">🌙</span>
                          <p className="text-sm font-medium">All sessions for today are complete. Please join tomorrow's session.</p>
                        </div>
                      )}

                      <h2 className="text-lg font-bold text-gray-800 mb-4">Your Live Sessions</h2>
                      <div className="grid gap-4">
                        {SESSION_INFO.map((s) => {
                          const status  = sessionStatus(s.h, s.m, nowMinutes)
                          const hasLink = !!payment[s.key]
                          return (
                            <div key={s.key} className={`${s.color} border rounded-2xl p-5 flex items-center justify-between gap-4`}>
                              <div className="flex items-center gap-4">
                                <span className="text-3xl">{s.emoji}</span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-gray-800">{s.time} IST</p>
                                    {status === 'live' && (
                                      <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
                                    )}
                                  </div>
                                  <p className="text-gray-500 text-sm">{s.label} Session, Daily Live</p>
                                  {status === 'upcoming' && (
                                    <p className="text-xs text-gray-400 mt-0.5">Opens {WINDOW_BEFORE} min before session</p>
                                  )}
                                  {status === 'ended' && (
                                    <p className="text-xs text-red-400 mt-0.5">Session ended</p>
                                  )}
                                </div>
                              </div>

                              {status === 'live' && hasLink ? (
                                <a
                                  href={payment[s.key]}
                                  target="_blank" rel="noopener noreferrer"
                                  className={`${s.btn} text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all flex-shrink-0`}
                                >
                                  Join Session
                                </a>
                              ) : status === 'live' && !hasLink ? (
                                <span className="text-gray-400 text-sm flex-shrink-0">Link coming soon</span>
                              ) : status === 'upcoming' ? (
                                <span className="bg-gray-100 text-gray-400 text-xs font-medium px-4 py-2.5 rounded-xl flex-shrink-0 cursor-not-allowed">
                                  Not yet open
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-400 text-xs font-medium px-4 py-2.5 rounded-xl flex-shrink-0 cursor-not-allowed">
                                  Session over
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )
                })()}
              </>
            )
          })()}

          {/* Profile card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mt-6">
            <p className="font-semibold text-gray-700 mb-4">Your Profile</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400">Name</p><p className="font-medium text-gray-800">{data.name}</p></div>
              <div><p className="text-gray-400">Phone</p><p className="font-medium text-gray-800">{data.phone}</p></div>
              <div><p className="text-gray-400">Email</p><p className="font-medium text-gray-800">{data.email}</p></div>
              <div><p className="text-gray-400">Location</p><p className="font-medium text-gray-800">{data.location}</p></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

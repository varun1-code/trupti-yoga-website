import { useState, useEffect } from 'react'
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

const STATUS_BADGE = {
  approved: 'bg-green-100 text-green-700',
  pending:  'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-600',
}
const STATUS_LABEL = {
  approved: 'Active',
  pending:  'Pending',
  rejected: 'Rejected',
  none:     'No Payment',
}

export default function AdminPanel() {
  // ── Auth ──
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [token, setToken]         = useState(localStorage.getItem('adminToken') || '')
  const [authError, setAuthError] = useState('')

  // ── Data ──
  const [users, setUsers]             = useState([])
  const [loading, setLoading]         = useState(false)
  const [meetLinks, setMeetLinks]     = useState({ meet_6am: '', meet_8am: '', meet_11am: '' })
  const [linksSaved, setLinksSaved]   = useState(false)
  const [linksSaving, setLinksSaving] = useState(false)

  // ── Navigation ──
  const [view, setView]                 = useState('home')
  const [selectedUser, setSelectedUser] = useState(null)

  // ── 1:1 Meet Link ──
  const [clientLink, setClientLink]             = useState('')
  const [clientLinkSaved, setClientLinkSaved]   = useState(false)
  const [clientLinkSaving, setClientLinkSaving] = useState(false)

  // ── Schedules ──
  const [allSchedules, setAllSchedules]       = useState([])
  const [adminProposeTime, setAdminProposeTime] = useState('')
  const [adminProposeNotes, setAdminProposeNotes] = useState('')
  const [scheduleMsg, setScheduleMsg]         = useState('')

  const authHeader = { Authorization: `Bearer ${token}` }

  const login = async (e) => {
    e.preventDefault()
    setAuthError('')
    const res  = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return setAuthError(data.detail || 'Login failed')
    localStorage.setItem('adminToken', data.token)
    setToken(data.token)
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setToken('')
    setUsers([])
    setView('home')
  }

  const fetchUsers = async () => {
    setLoading(true)
    const res  = await fetch(`${API_URL}/admin/users`, { headers: authHeader })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setToken(''); localStorage.removeItem('adminToken'); return }
    setUsers(data)
  }

  const fetchSchedules = async () => {
    const res  = await fetch(`${API_URL}/admin/schedules`, { headers: authHeader })
    if (!res.ok) return
    const data = await res.json()
    setAllSchedules(data)
  }

  const approveSchedule = async (id) => {
    await fetch(`${API_URL}/admin/schedule/approve/${id}`, { method: 'POST', headers: authHeader })
    fetchSchedules()
  }

  const declineSchedule = async (id) => {
    await fetch(`${API_URL}/admin/schedule/decline/${id}`, { method: 'POST', headers: authHeader })
    fetchSchedules()
  }

  const proposeSchedule = async (userId, paymentId) => {
    setScheduleMsg('')
    if (!adminProposeTime) return setScheduleMsg('error:Please select a date and time')
    const res = await fetch(`${API_URL}/admin/schedule/propose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ user_id: userId, payment_id: paymentId, proposed_time: adminProposeTime, notes: adminProposeNotes }),
    })
    if (res.ok) {
      setAdminProposeTime('')
      setAdminProposeNotes('')
      setScheduleMsg('success:Time proposed to client successfully')
      fetchSchedules()
    } else {
      const d = await res.json()
      setScheduleMsg(`error:${d.detail || 'Failed'}`)
    }
  }

  const fetchMeetLinks = async () => {
    const res  = await fetch(`${API_URL}/admin/meet-links`, { headers: authHeader })
    if (!res.ok) return
    const data = await res.json()
    setMeetLinks({ meet_6am: data.meet_6am || '', meet_8am: data.meet_8am || '', meet_11am: data.meet_11am || '' })
  }

  const saveMeetLinks = async () => {
    setLinksSaving(true)
    setLinksSaved(false)
    const res = await fetch(`${API_URL}/admin/meet-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify(meetLinks),
    })
    setLinksSaving(false)
    if (res.ok) setLinksSaved(true)
  }

  const saveClientLink = async (paymentId) => {
    setClientLinkSaving(true)
    setClientLinkSaved(false)
    const res = await fetch(`${API_URL}/admin/client-meet-link/${paymentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader },
      body: JSON.stringify({ link: clientLink }),
    })
    setClientLinkSaving(false)
    if (res.ok) {
      setClientLinkSaved(true)
      setSelectedUser((prev) => ({ ...prev, client_meet_link: clientLink }))
    }
  }

  const approve = async (paymentId) => {
    const res = await fetch(`${API_URL}/admin/approve/${paymentId}`, {
      method: 'POST', headers: authHeader,
    })
    if (res.ok) {
      await fetchUsers()
      setSelectedUser((prev) => ({ ...prev, status: 'approved' }))
    }
  }

  const reject = async (paymentId) => {
    if (!window.confirm('Reject this payment?')) return
    const res = await fetch(`${API_URL}/admin/reject/${paymentId}`, {
      method: 'POST', headers: authHeader,
    })
    if (res.ok) {
      await fetchUsers()
      setSelectedUser((prev) => ({ ...prev, status: 'rejected' }))
    }
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

  useEffect(() => {
    if (token) { fetchUsers(); fetchMeetLinks(); fetchSchedules() }
  }, [token])

  // ── Derived ──
  const active          = users.filter((u) => u.status === 'approved' && !u.is_expired)
  const inactive        = users.filter((u) => u.status !== 'approved' || u.is_expired)
  const pending         = users.filter((u) => u.status === 'pending')
  const oneTo1          = active.filter((u) => u.plan?.startsWith('1to1'))
  const pendingSchedules = allSchedules.filter((s) => s.status === 'pending')

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const expiringIn7 = (iso) => {
    if (!iso) return false
    const diff = new Date(iso) - new Date()
    return diff > 0 && diff < 7 * 24 * 3600 * 1000
  }

  const currencySymbol = (u) => u.currency === 'USD' ? '$' : '₹'

  // ════════════════════════════════════════════
  // LOGIN SCREEN
  // ════════════════════════════════════════════
  if (!token) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-950 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-8 py-6 text-white">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🔐</span>
            <h1 className="text-xl font-bold">Admin Portal</h1>
          </div>
          <p className="text-green-100 text-sm">Trupti Yoga & Nature Cure</p>
        </div>
        <div className="p-8">
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl px-4 py-3 mb-5 flex items-center gap-2">
              <span>⚠️</span> {authError}
            </div>
          )}
          <form onSubmit={login} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Admin Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@truptiyoga.com" required
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password" required
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <button type="submit" className="mt-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-2xl transition-all shadow-md">
              Login to Admin Panel
            </button>
          </form>
          <p className="text-center text-gray-400 text-xs mt-6">
            <a href="/" className="hover:text-green-600 transition-colors">← Back to website</a>
          </p>
        </div>
      </div>
    </div>
  )

  // ── Shared header ──
  const Header = ({ title, back }) => (
    <div className="bg-green-700 text-white px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={back} className="text-green-200 hover:text-white transition-colors mr-1">←</button>
        )}
        <div>
          <h1 className="font-bold text-lg">{title}</h1>
          <p className="text-green-200 text-xs">Trupti Yoga Admin</p>
        </div>
      </div>
      <button onClick={logout} className="text-sm bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all">
        Logout
      </button>
    </div>
  )

  // ════════════════════════════════════════════
  // HOME VIEW
  // ════════════════════════════════════════════
  if (view === 'home') return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Admin Dashboard" />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Users',      value: users.length,   color: 'text-gray-800' },
            { label: 'Active Members',   value: active.length,  color: 'text-green-600' },
            { label: 'Pending Approval', value: pending.length, color: 'text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow-sm p-5 text-center">
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {pending.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-6 flex items-center gap-3">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-amber-700 text-sm font-medium">
              {pending.length} payment{pending.length > 1 ? 's' : ''} waiting for your approval.
            </p>
            <button onClick={() => setView('users')} className="ml-auto text-amber-700 font-bold text-sm underline">
              Review
            </button>
          </div>
        )}

        {pendingSchedules.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3 mb-4 flex items-center gap-3">
            <span className="text-purple-500 text-lg">📅</span>
            <p className="text-purple-700 text-sm font-medium">
              {pendingSchedules.length} session request{pendingSchedules.length > 1 ? 's' : ''} awaiting your response.
            </p>
            <button onClick={() => setView('users')} className="ml-auto text-purple-700 font-bold text-sm underline">
              Review
            </button>
          </div>
        )}

        {oneTo1.length > 0 && pendingSchedules.length === 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-2xl px-5 py-3 mb-6 flex items-center gap-3">
            <span className="text-purple-500 text-lg">🎯</span>
            <p className="text-purple-700 text-sm font-medium">
              {oneTo1.length} active One-to-One client{oneTo1.length > 1 ? 's' : ''}.
            </p>
            <button onClick={() => setView('users')} className="ml-auto text-purple-700 font-bold text-sm underline">
              View
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          <button
            onClick={() => setView('users')}
            className="bg-white rounded-3xl shadow-sm p-8 text-left hover:shadow-md transition-all group border border-transparent hover:border-green-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl mb-5 group-hover:bg-green-200 transition-colors">👥</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">User Management</h2>
            <p className="text-gray-500 text-sm">View all users, approve or reject payments, and set private session links for 1:1 clients.</p>
            <p className="mt-4 text-green-600 font-semibold text-sm">Open →</p>
          </button>

          <button
            onClick={() => setView('links')}
            className="bg-white rounded-3xl shadow-sm p-8 text-left hover:shadow-md transition-all group border border-transparent hover:border-blue-200"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-5 group-hover:bg-blue-200 transition-colors">🔗</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Group Session Links</h2>
            <p className="text-gray-500 text-sm">Set the Google Meet links for the 6 AM, 8 AM and 11 AM group sessions. All group members see these.</p>
            <p className="mt-4 text-blue-600 font-semibold text-sm">Manage →</p>
          </button>
        </div>
      </div>
    </div>
  )

  // ════════════════════════════════════════════
  // SESSION LINKS VIEW
  // ════════════════════════════════════════════
  if (view === 'links') return (
    <div className="min-h-screen bg-gray-100">
      <Header title="Group Session Links" back={() => { setView('home'); setLinksSaved(false) }} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <p className="text-gray-500 text-sm mb-6">
            These Google Meet links are shown to all approved group members on their dashboard.
          </p>
          <div className="flex flex-col gap-5">
            {[
              { key: 'meet_6am',  label: '6:00 AM Session',  emoji: '🌅' },
              { key: 'meet_8am',  label: '8:00 AM Session',  emoji: '🌿' },
              { key: 'meet_11am', label: '11:00 AM Session', emoji: '☀️' },
            ].map((s) => (
              <div key={s.key}>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <span>{s.emoji}</span> {s.label}
                </label>
                <input
                  value={meetLinks[s.key]}
                  onChange={(e) => { setMeetLinks({ ...meetLinks, [s.key]: e.target.value }); setLinksSaved(false) }}
                  placeholder="https://meet.google.com/..."
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {linksSaved
              ? <span className="text-green-600 font-medium text-sm">✓ Links saved successfully</span>
              : <span className="text-gray-400 text-sm">Unsaved changes</span>
            }
            <button
              onClick={saveMeetLinks} disabled={linksSaving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold px-8 py-3 rounded-2xl transition-all"
            >
              {linksSaving ? 'Saving...' : 'Save Links'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ════════════════════════════════════════════
  // USERS LIST VIEW
  // ════════════════════════════════════════════
  if (view === 'users') return (
    <div className="min-h-screen bg-gray-100">
      <Header title="User Management" back={() => setView('home')} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading && <p className="text-gray-400 text-center py-8">Loading...</p>}

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
            <h2 className="font-bold text-gray-800">Active Members ({active.length})</h2>
          </div>
          {active.length === 0
            ? <p className="text-gray-400 text-sm bg-white rounded-2xl p-5">No active members yet.</p>
            : (
              <div className="flex flex-col gap-3">
                {active.sort((a, b) => a.name.localeCompare(b.name)).map((u) => (
                  <button
                    key={u.payment_id || u.id}
                    onClick={() => { setSelectedUser(u); setClientLink(u.client_meet_link || ''); setClientLinkSaved(false); setView('user-detail') }}
                    className="bg-white rounded-2xl shadow-sm border border-green-100 p-4 flex items-center justify-between hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm flex-shrink-0">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                        {u.plan && <p className="text-gray-400 text-xs">{PLAN_LABELS[u.plan] || u.plan}</p>}
                        {u.expires_at && (
                          <p className={`text-xs mt-0.5 ${expiringIn7(u.expires_at) ? 'text-amber-500 font-semibold' : 'text-gray-400'}`}>
                            Expires {fmtDate(u.expires_at)}{expiringIn7(u.expires_at) ? ' ⚠️' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {u.plan?.startsWith('1to1') && (
                        <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">1:1</span>
                      )}
                      <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Active</span>
                      <span className="text-gray-300 text-sm">›</span>
                    </div>
                  </button>
                ))}
              </div>
            )
          }
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block" />
            <h2 className="font-bold text-gray-800">Inactive Accounts ({inactive.length})</h2>
          </div>
          {inactive.length === 0
            ? <p className="text-gray-400 text-sm bg-white rounded-2xl p-5">No inactive accounts.</p>
            : (
              <div className="flex flex-col gap-3">
                {inactive.sort((a, b) => a.name.localeCompare(b.name)).map((u) => {
                  const statusKey = u.is_expired ? 'expired' : (u.status || 'none')
                  const badge = u.is_expired
                    ? 'bg-orange-100 text-orange-600'
                    : (STATUS_BADGE[statusKey] || 'bg-gray-100 text-gray-500')
                  const label = u.is_expired ? 'Expired' : (STATUS_LABEL[statusKey] || 'No Payment')
                  return (
                    <button
                      key={u.payment_id || u.id}
                      onClick={() => { setSelectedUser(u); setClientLink(u.client_meet_link || ''); setClientLinkSaved(false); setView('user-detail') }}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{u.name}</p>
                          <p className="text-gray-400 text-xs">{u.email}</p>
                          {u.plan && <p className="text-gray-400 text-xs">{PLAN_LABELS[u.plan] || u.plan}</p>}
                          {u.is_expired && u.expires_at && (
                            <p className="text-orange-400 text-xs mt-0.5">Expired {fmtDate(u.expires_at)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge}`}>{label}</span>
                        <span className="text-gray-300 text-sm">›</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          }
        </section>
      </div>
    </div>
  )

  // ════════════════════════════════════════════
  // USER DETAIL VIEW
  // ════════════════════════════════════════════
  if (view === 'user-detail' && selectedUser) {
    const u = selectedUser
    const statusKey = u.status || 'none'
    const is1to1 = u.plan?.startsWith('1to1')

    return (
      <div className="min-h-screen bg-gray-100">
        <Header title="User Details" back={() => setView('users')} />

        <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-5">

          {/* Identity card */}
          <div className="bg-white rounded-3xl shadow-sm p-7">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-extrabold text-2xl flex-shrink-0">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{u.name}</h2>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[statusKey] || 'bg-gray-100 text-gray-500'}`}>
                  {STATUS_LABEL[statusKey]}
                </span>
                {is1to1 && (
                  <span className="ml-2 text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">One-to-One</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-400 text-xs mb-0.5">Email</p><p className="font-medium text-gray-800">{u.email}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Phone</p><p className="font-medium text-gray-800">{u.phone}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Location</p><p className="font-medium text-gray-800">{u.location}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Registered On</p><p className="font-medium text-gray-800">{fmtDate(u.created_at)}</p></div>
            </div>
          </div>

          {/* Payment card */}
          {u.payment_id ? (
            <div className="bg-white rounded-3xl shadow-sm p-7">
              <h3 className="font-bold text-gray-800 mb-5">Payment Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Plan</p>
                  <p className="font-medium text-gray-800">{PLAN_LABELS[u.plan] || u.plan}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-0.5">Amount</p>
                  <p className="font-medium text-gray-800">{currencySymbol(u)}{u.amount?.toLocaleString()}</p>
                </div>
                {u.transaction_id && (
                  <div className="col-span-2">
                    <p className="text-gray-400 text-xs mb-0.5">Transaction ID</p>
                    <p className="font-mono font-medium text-gray-800 break-all">{u.transaction_id}</p>
                  </div>
                )}
                {u.paid_at && (
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Submitted On</p>
                    <p className="font-medium text-gray-800">{fmtDate(u.paid_at)}</p>
                  </div>
                )}
                {u.approved_at && (
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Approved On</p>
                    <p className="font-medium text-gray-800">{fmtDate(u.approved_at)}</p>
                  </div>
                )}
                {u.expires_at && (
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">Expires On</p>
                    <p className={`font-medium ${u.is_expired ? 'text-orange-500' : expiringIn7(u.expires_at) ? 'text-amber-500' : 'text-gray-800'}`}>
                      {fmtDate(u.expires_at)}{u.is_expired ? ' (Expired)' : expiringIn7(u.expires_at) ? ' (Expiring soon)' : ''}
                    </p>
                  </div>
                )}
              </div>

              {u.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => approve(u.payment_id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-2xl transition-all"
                  >
                    Approve Payment
                  </button>
                  <button
                    onClick={() => reject(u.payment_id)}
                    className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-3 rounded-2xl transition-all"
                  >
                    Reject
                  </button>
                </div>
              )}

              {u.status === 'approved' && !u.is_expired && !is1to1 && (
                <div className="bg-green-50 rounded-2xl px-4 py-3 flex items-center gap-2 text-green-700 text-sm font-medium">
                  <span>✓</span> Active — member has access to all group sessions.
                </div>
              )}

              {u.status === 'rejected' && (
                <div className="bg-red-50 rounded-2xl px-4 py-3 flex items-center gap-2 text-red-600 text-sm font-medium">
                  <span>✗</span> Payment was rejected.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm p-7 text-center">
              <p className="text-gray-400 text-sm">This user has not submitted a payment yet.</p>
            </div>
          )}

          {/* 1:1 Session Scheduling */}
          {is1to1 && u.status === 'approved' && !u.is_expired && (() => {
            const userSchedules = allSchedules.filter(s => s.user_id === u.id)
            const userPending   = userSchedules.filter(s => s.status === 'pending')
            return (
              <div className="bg-white rounded-3xl shadow-sm p-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">📅</span>
                  <h3 className="font-bold text-gray-800">Session Scheduling</h3>
                </div>

                {scheduleMsg && (() => {
                  const [type, msg] = scheduleMsg.split(':')
                  return (
                    <div className={`rounded-2xl px-4 py-3 text-sm mb-4 ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                      {msg}
                    </div>
                  )
                })()}

                {/* Pending requests from client */}
                {userPending.filter(s => s.proposed_by === 'client').map(s => (
                  <div key={s.id} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-3">
                    <p className="text-amber-700 font-semibold text-sm mb-1">Client proposed a time</p>
                    <p className="text-gray-800 font-bold">{fmtDT(s.proposed_time)}</p>
                    {s.notes && <p className="text-gray-500 text-xs mt-1">Note: {s.notes}</p>}
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => approveSchedule(s.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => declineSchedule(s.id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-semibold py-2 rounded-xl text-sm"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}

                {/* Admin-proposed pending (waiting for client) */}
                {userPending.filter(s => s.proposed_by === 'admin').map(s => (
                  <div key={s.id} className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-3">
                    <p className="text-blue-700 font-semibold text-sm">Waiting for client to accept</p>
                    <p className="text-gray-800 font-medium mt-0.5">{fmtDT(s.proposed_time)}</p>
                    {s.notes && <p className="text-gray-400 text-xs mt-1">{s.notes}</p>}
                  </div>
                ))}

                {/* Confirmed sessions */}
                {userSchedules.filter(s => s.status === 'confirmed').map(s => (
                  <div key={s.id} className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-3">
                    <p className="text-green-700 font-semibold text-sm">✅ Confirmed</p>
                    <p className="text-gray-800 font-medium mt-0.5">{fmtDT(s.proposed_time)}</p>
                    {s.notes && <p className="text-gray-400 text-xs mt-1">{s.notes}</p>}
                  </div>
                ))}

                {/* Propose a time to client */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Propose a Time to Client</p>
                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Date & Time (IST)</label>
                      <input
                        type="datetime-local"
                        value={adminProposeTime}
                        onChange={(e) => { setAdminProposeTime(e.target.value); setScheduleMsg('') }}
                        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Notes (optional)</label>
                      <input
                        type="text"
                        value={adminProposeNotes}
                        onChange={(e) => setAdminProposeNotes(e.target.value)}
                        placeholder="e.g. Please join 5 min early"
                        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <button
                      onClick={() => proposeSchedule(u.id, u.payment_id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-2xl text-sm transition-all"
                    >
                      Propose This Time
                    </button>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* 1:1 Private Meet Link */}
          {is1to1 && u.status === 'approved' && !u.is_expired && (
            <div className="bg-white rounded-3xl shadow-sm p-7">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-bold text-gray-800">Private Session Link</h3>
                  <p className="text-gray-500 text-xs">This link is shown only to this client on their dashboard.</p>
                </div>
              </div>
              <input
                value={clientLink}
                onChange={(e) => { setClientLink(e.target.value); setClientLinkSaved(false) }}
                placeholder="https://meet.google.com/..."
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-purple-400 transition-colors mb-4"
              />
              <div className="flex items-center justify-between">
                {clientLinkSaved
                  ? <span className="text-green-600 font-medium text-sm">✓ Link saved</span>
                  : <span className="text-gray-400 text-sm">{clientLink ? 'Unsaved changes' : 'No link set yet'}</span>
                }
                <button
                  onClick={() => saveClientLink(u.payment_id)}
                  disabled={clientLinkSaving}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold px-6 py-2.5 rounded-2xl transition-all text-sm"
                >
                  {clientLinkSaving ? 'Saving...' : 'Save Link'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    )
  }

  return null
}

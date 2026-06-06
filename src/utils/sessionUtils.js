export const WINDOW_BEFORE = 5
export const WINDOW_AFTER  = 15

export const SESSION_INFO = [
  { key: 'meet_6am',  time: '6:00 AM',  h: 6,  m: 0,  emoji: '🌅', label: 'Early Morning', color: 'bg-orange-50 border-orange-200', btn: 'bg-orange-500 hover:bg-orange-600' },
  { key: 'meet_8am',  time: '8:00 AM',  h: 8,  m: 0,  emoji: '☀️', label: 'Morning',        color: 'bg-green-50 border-green-200',   btn: 'bg-green-600 hover:bg-green-700' },
  { key: 'meet_11am', time: '11:00 AM', h: 11, m: 0,  emoji: '🌿', label: 'Late Morning',   color: 'bg-teal-50 border-teal-200',     btn: 'bg-teal-600 hover:bg-teal-700' },
]

export function getISTMinutes() {
  const now = new Date()
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const ist = new Date(utc + 5.5 * 3600000)
  return ist.getHours() * 60 + ist.getMinutes()
}

export function sessionStatus(h, m, nowMinutes) {
  const mid = h * 60 + m
  if (nowMinutes < mid - WINDOW_BEFORE) return 'upcoming'
  if (nowMinutes <= mid + WINDOW_AFTER)  return 'live'
  return 'ended'
}

export function getSessionBanner(nowMinutes) {
  for (const s of SESSION_INFO) {
    const mid = s.h * 60 + s.m
    if (nowMinutes < mid - WINDOW_BEFORE) return { type: 'next', time: s.time }
    if (nowMinutes <= mid + WINDOW_AFTER)  return { type: 'live', time: s.time }
  }
  return { type: 'done' }
}

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  sessionStatus,
  getSessionBanner,
  getISTMinutes,
  WINDOW_BEFORE,
  WINDOW_AFTER,
} from '../utils/sessionUtils'

// Session windows (in IST minutes from midnight):
//   6 AM  → opens at 355 (5:55 AM), closes at 375 (6:15 AM)
//   8 AM  → opens at 475 (7:55 AM), closes at 495 (8:15 AM)
//   11 AM → opens at 655 (10:55 AM), closes at 675 (11:15 AM)

describe('sessionStatus', () => {
  it('returns upcoming well before the window', () => {
    expect(sessionStatus(6, 0, 300)).toBe('upcoming') // 5:00 AM
  })

  it('returns upcoming one minute before window opens', () => {
    expect(sessionStatus(6, 0, 354)).toBe('upcoming') // 5:54 AM, window opens at 5:55
  })

  it('returns live exactly at window open (5 min before session)', () => {
    expect(sessionStatus(6, 0, 355)).toBe('live') // 5:55 AM
  })

  it('returns live exactly at session time', () => {
    expect(sessionStatus(6, 0, 360)).toBe('live') // 6:00 AM
  })

  it('returns live exactly at window close (15 min after session)', () => {
    expect(sessionStatus(6, 0, 375)).toBe('live') // 6:15 AM
  })

  it('returns ended one minute after window closes', () => {
    expect(sessionStatus(6, 0, 376)).toBe('ended') // 6:16 AM
  })

  it('returns ended long after session', () => {
    expect(sessionStatus(6, 0, 480)).toBe('ended') // 8:00 AM
  })

  it('works correctly for 8 AM session', () => {
    expect(sessionStatus(8, 0, 474)).toBe('upcoming') // 7:54 AM
    expect(sessionStatus(8, 0, 475)).toBe('live')     // 7:55 AM
    expect(sessionStatus(8, 0, 480)).toBe('live')     // 8:00 AM
    expect(sessionStatus(8, 0, 495)).toBe('live')     // 8:15 AM
    expect(sessionStatus(8, 0, 496)).toBe('ended')    // 8:16 AM
  })

  it('works correctly for 11 AM session', () => {
    expect(sessionStatus(11, 0, 654)).toBe('upcoming') // 10:54 AM
    expect(sessionStatus(11, 0, 655)).toBe('live')     // 10:55 AM
    expect(sessionStatus(11, 0, 660)).toBe('live')     // 11:00 AM
    expect(sessionStatus(11, 0, 675)).toBe('live')     // 11:15 AM
    expect(sessionStatus(11, 0, 676)).toBe('ended')    // 11:16 AM
  })
})

describe('getSessionBanner', () => {
  it('shows next session (6 AM) before any sessions', () => {
    const banner = getSessionBanner(0) // midnight
    expect(banner.type).toBe('next')
    expect(banner.time).toBe('6:00 AM')
  })

  it('shows next session (6 AM) just before its window', () => {
    const banner = getSessionBanner(354) // 5:54 AM
    expect(banner.type).toBe('next')
    expect(banner.time).toBe('6:00 AM')
  })

  it('shows live when 6 AM session is active', () => {
    const banner = getSessionBanner(360) // 6:00 AM
    expect(banner.type).toBe('live')
    expect(banner.time).toBe('6:00 AM')
  })

  it('shows next (8 AM) after 6 AM session ends', () => {
    const banner = getSessionBanner(400) // 6:40 AM
    expect(banner.type).toBe('next')
    expect(banner.time).toBe('8:00 AM')
  })

  it('shows live when 8 AM session is active', () => {
    const banner = getSessionBanner(480) // 8:00 AM
    expect(banner.type).toBe('live')
    expect(banner.time).toBe('8:00 AM')
  })

  it('shows next (11 AM) after 8 AM session ends', () => {
    const banner = getSessionBanner(540) // 9:00 AM
    expect(banner.type).toBe('next')
    expect(banner.time).toBe('11:00 AM')
  })

  it('shows live when 11 AM session is active', () => {
    const banner = getSessionBanner(660) // 11:00 AM
    expect(banner.type).toBe('live')
    expect(banner.time).toBe('11:00 AM')
  })

  it('shows done after all sessions end', () => {
    const banner = getSessionBanner(700) // 11:40 AM
    expect(banner.type).toBe('done')
  })

  it('shows done at end of day', () => {
    const banner = getSessionBanner(1439) // 11:59 PM
    expect(banner.type).toBe('done')
  })
})

describe('getISTMinutes', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns 360 when IST time is 6:00 AM', () => {
    // 2024-01-01 00:30:00 UTC = 06:00:00 IST
    vi.setSystemTime(new Date('2024-01-01T00:30:00.000Z'))
    expect(getISTMinutes()).toBe(360)
  })

  it('returns 0 when IST time is midnight', () => {
    // 2023-12-31 18:30:00 UTC = 2024-01-01 00:00:00 IST
    vi.setSystemTime(new Date('2023-12-31T18:30:00.000Z'))
    expect(getISTMinutes()).toBe(0)
  })

  it('returns 480 when IST time is 8:00 AM', () => {
    // 2024-01-01 02:30:00 UTC = 08:00:00 IST
    vi.setSystemTime(new Date('2024-01-01T02:30:00.000Z'))
    expect(getISTMinutes()).toBe(480)
  })

  it('returns 660 when IST time is 11:00 AM', () => {
    // 2024-01-01 05:30:00 UTC = 11:00:00 IST
    vi.setSystemTime(new Date('2024-01-01T05:30:00.000Z'))
    expect(getISTMinutes()).toBe(660)
  })

  it('returns correct value at 11:59 PM IST', () => {
    // 2024-01-01 18:29:00 UTC = 23:59:00 IST
    vi.setSystemTime(new Date('2024-01-01T18:29:00.000Z'))
    expect(getISTMinutes()).toBe(1439) // 23 * 60 + 59
  })
})

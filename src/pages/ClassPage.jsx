import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const sessions = {
  '6am': {
    time: '6:00 AM IST',
    label: 'Early Morning Session',
    emoji: '🌅',
    tagline: 'Awaken',
    color: 'from-orange-400 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    btn: 'bg-orange-500 hover:bg-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    description: 'The 6 AM session is ideal for those who want to start their day with purpose. You will do breathing exercises, sun salutations, and energizing postures that wake up your body completely. Many students say this session sets a positive tone for their entire day.',
    highlights: [
      'Energizing yoga postures to wake up the body',
      'Pranayama and breathing exercises',
      'Surya Namaskar sequences',
      'Helps build a strong morning routine',
      'Great for working professionals and students',
    ],
    duration: '60 minutes',
    level: 'All levels welcome',
  },
  '8am': {
    time: '8:00 AM IST',
    label: 'Morning Session',
    emoji: '☀️',
    tagline: 'Shine',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    btn: 'bg-green-600 hover:bg-green-700',
    badge: 'bg-green-100 text-green-700',
    description: 'The 8 AM session is suitable for everyone. It covers yoga postures, pranayama, and some mindfulness practice in a balanced way. Whether you are a complete beginner or have been doing yoga for years, you will feel right at home in this class.',
    highlights: [
      'Balanced yoga practice for all levels',
      'Mindfulness and meditation included',
      'Focus on flexibility, strength and alignment',
      'Naturopathy tips for everyday lifestyle',
      'Great for families and beginners',
    ],
    duration: '60 minutes',
    level: 'Beginner to Intermediate',
  },
  '11am': {
    time: '11:00 AM IST',
    label: 'Late Morning Session',
    emoji: '🌿',
    tagline: 'Balance',
    color: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    btn: 'bg-teal-600 hover:bg-teal-700',
    badge: 'bg-teal-100 text-teal-700',
    description: 'The 11 AM session is focused on healing. If you have back pain, joint problems, diabetes, stress, or any other health condition, this is the right session for you. Dr. Vishwa uses his naturopathy background to address your specific health needs through yoga.',
    highlights: [
      'Therapeutic yoga for health conditions',
      'Deep relaxation and restorative postures',
      'Targets back pain, joint issues and stress',
      'Naturopathy-based healing practices',
      'Recommended for seniors and those with health concerns',
    ],
    duration: '60 minutes',
    level: 'All levels, therapeutic focus',
  },
}

export default function ClassPage() {
  const { time } = useParams()
  const navigate = useNavigate()
  const s = sessions[time]

  if (!s) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Session not found</p>
        <Link to="/" className="text-green-600 font-semibold">Back to Home</Link>
      </div>
    </div>
  )

  const handleEnroll = () => {
    const token = localStorage.getItem('token')
    if (token) navigate('/payment')
    else navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className={`relative pt-32 pb-20 ${s.bg} border-b ${s.border}`}>
        <div className="max-w-4xl mx-auto px-6">
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${s.badge} mb-4`}>
            IST  {s.label}
          </span>
          <div className="flex items-center gap-5 mb-4">
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-4xl shadow-lg`}>
              {s.emoji}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">{s.time}</h1>
              <p className="text-gray-500 text-lg font-medium">{s.tagline}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 mt-2">
            <span className="bg-white/70 px-3 py-1 rounded-full border border-gray-200">Duration: {s.duration}</span>
            <span className="bg-white/70 px-3 py-1 rounded-full border border-gray-200">Level: {s.level}</span>
            <span className="bg-white/70 px-3 py-1 rounded-full border border-gray-200">Live via Google Meet</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-12">

          {/* Left */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Session</h2>
            <p className="text-gray-600 leading-relaxed mb-8">{s.description}</p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">What You Will Learn</h2>
            <ul className="flex flex-col gap-3">
              {s.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-gray-600">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right - Enroll card */}
          <div>
            <div className="bg-gray-50 rounded-3xl border border-gray-200 p-8 sticky top-28">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Enroll Now</h3>
              <p className="text-gray-500 text-sm mb-5">
                Group membership gives access to all 3 daily sessions. Private 1:1 plans also available.
              </p>

              {/* Group plan pricing — starting prices */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Group Sessions (from 1 month)</p>
              <div className="flex flex-col gap-2 mb-4">
                {[
                  { label: 'Individual',  price: '₹2,000' },
                  { label: 'Couple (2)',  price: '₹3,000' },
                  { label: 'Family (4)', price: '₹5,000' },
                ].map((p) => (
                  <div key={p.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-gray-200">
                    <span className="text-gray-700 font-medium text-sm">{p.label}</span>
                    <span className="font-bold text-gray-900 text-sm">{p.price}<span className="text-gray-400 font-normal text-xs"> / month</span></span>
                  </div>
                ))}
              </div>

              {/* 1:1 plan */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-800 text-sm">🎯 One-to-One (Private)</p>
                    <p className="text-purple-600 text-xs mt-0.5">Personal sessions with Dr. Vishwa</p>
                  </div>
                  <span className="font-bold text-purple-800 text-sm">₹6,000<span className="text-purple-400 font-normal text-xs"> / month</span></span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center mb-4">3, 6 &amp; 12 month plans available · Full pricing on enrollment page</p>

              <button
                onClick={handleEnroll}
                className={`w-full ${s.btn} text-white font-bold py-4 rounded-2xl transition-all text-lg`}
              >
                Enroll Now
              </button>

              <p className="text-center text-gray-400 text-xs mt-4">
                Secure. Manual payment verification. Access within a few hours.
              </p>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <a
                  href="https://wa.me/918088943510"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-green-600 font-semibold text-sm hover:underline"
                >
                  Have questions? WhatsApp us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-emerald-600">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to Get Started?</h2>
          <p className="text-green-100 mb-6">Choose a group plan or enroll in private One-to-One sessions with Dr. Vishwa.</p>
          <button
            onClick={handleEnroll}
            className="bg-white text-green-700 font-bold px-8 py-4 rounded-full hover:bg-green-50 transition-all shadow-lg"
          >
            Enroll Now
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

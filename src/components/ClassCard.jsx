import { useNavigate } from 'react-router-dom'

const classData = {
  '6am': {
    time: '6:00 AM',
    label: 'Early Morning',
    emoji: '🌅',
    tagline: 'Awaken',
    description: 'Start fresh. Breathe deep. Rise into your best self.',
    color: 'from-orange-400 to-amber-500',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    btn: 'bg-orange-500 hover:bg-orange-600',
    badge: 'bg-orange-100 text-orange-700',
  },
  '8am': {
    time: '8:00 AM',
    label: 'Morning',
    emoji: '☀️',
    tagline: 'Shine',
    description: 'Move with strength. Flow with confidence.',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    btn: 'bg-green-600 hover:bg-green-700',
    badge: 'bg-green-100 text-green-700',
  },
  '11am': {
    time: '11:00 AM',
    label: 'Late Morning',
    emoji: '🌿',
    tagline: 'Balance',
    description: 'Pause. Align. Reset your energy.',
    color: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    btn: 'bg-teal-600 hover:bg-teal-700',
    badge: 'bg-teal-100 text-teal-700',
  },
}

export default function ClassCard({ timeKey }) {
  const navigate = useNavigate()
  const cls = classData[timeKey]

  return (
    <div
      className={`relative rounded-3xl border ${cls.border} ${cls.bg} p-8 flex flex-col gap-5 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer group`}
      onClick={() => navigate(`/class/${timeKey}`)}
    >
      {/* Gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-3xl bg-gradient-to-r ${cls.color}`} />

      {/* Badge */}
      <span className={`self-start text-xs font-semibold px-3 py-1 rounded-full ${cls.badge}`}>
        IST  {cls.label}
      </span>

      {/* Emoji & Time */}
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cls.color} flex items-center justify-center text-3xl shadow-md`}>
          {cls.emoji}
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-800">{cls.time}</p>
          <p className="text-gray-500 font-medium">{cls.tagline}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">{cls.description}</p>

      {/* CTA */}
      <button
        className={`mt-auto w-full ${cls.btn} text-white font-semibold py-3 rounded-2xl transition-all duration-200 group-hover:scale-105`}
      >
        View Session Details
      </button>
    </div>
  )
}

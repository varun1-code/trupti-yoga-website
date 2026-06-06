import Navbar from '../components/Navbar'
import ClassCard from '../components/ClassCard'
import Footer from '../components/Footer'

const stats = [
  { value: '5+',   label: 'Years of Clinical Practice' },
  { value: '500+', label: 'Patients Guided' },
  { value: '3',    label: 'Live Sessions Daily' },
  { value: '🌍',   label: 'Global Participants' },
]

const services = [
  {
    icon: '🧘', title: 'Online Yoga Therapy',
    accent: 'from-green-500 to-emerald-600', light: 'bg-green-50', iconBg: 'bg-green-100',
    items: [
      'Therapeutic yoga for lifestyle disorders',
      'Weight management and metabolic health',
      'Musculoskeletal flexibility and mobility',
      'Stress reduction and nervous system regulation',
      'Senior citizen and rehabilitative programmes',
    ],
  },
  {
    icon: '🌐', title: 'Global Yoga Programmes',
    accent: 'from-blue-500 to-cyan-600', light: 'bg-blue-50', iconBg: 'bg-blue-100',
    items: [
      'Live interactive sessions for international participants',
      'Cross-timezone wellness access',
      'Corporate wellness and group programmes',
      'Beginner to advanced level instruction',
      'Culturally inclusive holistic practices',
    ],
  },
  {
    icon: '💬', title: 'Online Consultation',
    accent: 'from-purple-500 to-violet-600', light: 'bg-purple-50', iconBg: 'bg-purple-100',
    items: [
      'Lifestyle disorder assessment and management',
      'Stress and psychosomatic health counselling',
      'Sleep dysfunction and circadian health',
      'Diet, nutrition, and detoxification guidance',
      'Preventive healthcare and wellness planning',
    ],
  },
  {
    icon: '📋', title: 'Customised Wellness Plans',
    accent: 'from-orange-500 to-amber-600', light: 'bg-orange-50', iconBg: 'bg-orange-100',
    items: [
      'Personalised asana and pranayama protocols',
      'Naturopathic dietary modification',
      'Meditation and mindfulness-based stress reduction',
      'Natural hydrotherapy and lifestyle therapies',
      'Long-term health and preventive care strategies',
    ],
  },
]

const benefits = [
  { icon: '🩺', color: 'bg-green-100 text-green-700',   title: 'Evidence-Based Natural Therapy',   desc: 'Sessions are grounded in naturopathic science and traditional yogic principles, designed to address lifestyle disorders, not just physical fitness.' },
  { icon: '🌍', color: 'bg-blue-100 text-blue-700',     title: 'Global Wellness Community',          desc: 'Participants from multiple countries attend the same live sessions, creating a diverse and supportive healing environment.' },
  { icon: '🎓', color: 'bg-purple-100 text-purple-700', title: 'Qualified BNYS Practitioner',        desc: 'Dr. Vishwa holds a Bachelor of Naturopathy and Yogic Sciences (BNYS), bringing clinical knowledge and therapeutic precision to every session.' },
  { icon: '🕐', color: 'bg-orange-100 text-orange-700', title: 'Three Daily Live Sessions',          desc: 'Structured morning sessions at 6 AM, 8 AM, and 11 AM IST, designed to accommodate different schedules and therapeutic needs.' },
  { icon: '🏠', color: 'bg-teal-100 text-teal-700',     title: 'Accessible from Anywhere',           desc: 'Delivered via Google Meet — no equipment, no commute, and no studio infrastructure required. Your wellness, on your terms.' },
  { icon: '🌿', color: 'bg-emerald-100 text-emerald-700', title: 'Integrated Holistic Approach',   desc: 'Each session integrates asana practice, pranayama, and evidence-based naturopathic lifestyle guidance for comprehensive well-being.' },
]

const steps = [
  { step: '01', icon: '📝', title: 'Create Account',   desc: 'Sign up with your name, email and location. Takes less than a minute.',                              color: 'bg-green-500',  ring: 'ring-green-200'  },
  { step: '02', icon: '💳', title: 'Choose & Pay',     desc: 'Select Individual, Couple, Family or One-to-One plan and complete payment via UPI or PayPal.',        color: 'bg-blue-500',   ring: 'ring-blue-200'   },
  { step: '03', icon: '✅', title: 'Get Approved',     desc: "Dr. Vishwa's team verifies your payment and activates your account within a few hours.",              color: 'bg-purple-500', ring: 'ring-purple-200' },
  { step: '04', icon: '🧘', title: 'Join Live Sessions', desc: 'Access your personalised Google Meet link on your dashboard and join sessions from anywhere.',       color: 'bg-orange-500', ring: 'ring-orange-200' },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-950 via-green-800 to-emerald-600">
        <div className="absolute top-20 left-10 w-72 h-72 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-green-400/20 border border-green-400/30 text-green-200 px-5 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            <span className="text-base">🧘</span>
            Online Yoga &amp; Naturopathy Classes
          </div>
          <div className="flex items-center gap-2 justify-center mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-300 text-xs font-medium tracking-widest uppercase">Live Daily at 6 AM · 8 AM · 11 AM IST</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Heal Through<br />
            <span className="bg-gradient-to-r from-green-300 to-emerald-200 bg-clip-text text-transparent">
              Yoga &amp; Nature
            </span>
          </h1>
          <p className="text-xl text-green-100 font-light mb-3 max-w-2xl mx-auto">
            Live therapeutic yoga sessions with{' '}
            <span className="font-semibold text-white">Dr. Vishwa Hiremath, BNYS</span>{' '}
            — Naturopathy &amp; Lifestyle Medicine
          </p>
          <p className="text-green-200/80 text-base mb-2 italic">"One Breath. One Step. Slowly but Surely."</p>
          <p className="text-green-300/70 text-sm max-w-xl mx-auto mb-10">
            Evidence-based yoga therapy for preventive healthcare, lifestyle disorders, and sustainable well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5">
            <a href="/signup" className="bg-white text-green-800 font-bold px-10 py-4 rounded-full text-lg hover:bg-green-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Begin Your Journey
            </a>
            <a href="#classes" className="border-2 border-white/50 text-white font-semibold px-10 py-4 rounded-full text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
              Explore Sessions
            </a>
          </div>
          <p className="text-green-200/70 text-sm mb-16">
            Already a member?{' '}
            <a href="/login" className="text-green-300 font-semibold underline hover:text-white transition-colors">Sign in</a>
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 text-center">
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-green-200 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,80 C360,0 1080,80 1440,20 L1440,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-white relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 opacity-60" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Photo with floating badges */}
            <div className="relative">
              <div className="w-full aspect-square max-w-md mx-auto rounded-3xl relative overflow-hidden shadow-2xl">
                <img src="/doctor.jpg" alt="Dr. Vishwa Hiremath" className="w-full h-full object-cover object-top" />
                <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-green-900/80 to-transparent flex items-end p-5">
                  <div>
                    <p className="text-white font-bold text-lg leading-tight">Dr. Vishwa Hiremath</p>
                    <p className="text-green-200 text-sm">BNYS · Wellness & Lifestyle Consultant</p>
                  </div>
                </div>
              </div>

              {/* Floating achievement badges */}
              <div className="absolute -bottom-4 -right-4 bg-green-600 text-white px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm">
                Practising Online Since 2020
              </div>
              <div className="absolute -top-4 -left-4 bg-white border border-green-100 shadow-lg px-4 py-2.5 rounded-2xl flex items-center gap-2">
                <span className="text-xl">🎓</span>
                <div>
                  <p className="text-xs text-gray-400 leading-none">Qualification</p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">BNYS Certified</p>
                </div>
              </div>
              <div className="absolute top-1/2 -right-6 -translate-y-1/2 bg-white border border-blue-100 shadow-lg px-4 py-2.5 rounded-2xl flex items-center gap-2">
                <span className="text-xl">👥</span>
                <div>
                  <p className="text-xs text-gray-400 leading-none">Students</p>
                  <p className="text-sm font-bold text-gray-800 leading-tight">500+ Guided</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-6">
              <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">About the Physician</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Dr. Vishwa<br /><span className="text-green-600">Hiremath</span>
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
              <p className="text-gray-600 text-lg leading-relaxed">
                Dr. Vishwa Hiremath is a qualified Yoga and Naturopathy physician committed to promoting holistic health through <strong>evidence-based natural therapies</strong> and traditional yogic practices. He holds a <strong>Bachelor of Naturopathy and Yogic Sciences (BNYS)</strong> and practises as a Wellness and Lifestyle Consultant.
              </p>
              <p className="text-gray-600 leading-relaxed">
                With extensive experience in yoga therapy, naturopathy, preventive healthcare, and wellness coaching, Dr. Vishwa has guided individuals from diverse backgrounds toward healthier and more balanced lives.
              </p>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-100">
                <p className="text-green-800 font-bold text-sm mb-3 uppercase tracking-wide">Qualifications</p>
                <ul className="flex flex-col gap-2">
                  {[
                    'Bachelor of Naturopathy and Yogic Sciences (BNYS)',
                    'Wellness & Lifestyle Consultant',
                    'Yoga Therapy & Naturopathic Medicine Practitioner',
                  ].map((q) => (
                    <li key={q} className="flex items-start gap-2 text-gray-700 text-sm">
                      <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">✓</span> {q}
                    </li>
                  ))}
                </ul>
              </div>
              <a href="https://wa.me/918088943510" target="_blank" rel="noopener noreferrer"
                className="self-start bg-green-600 hover:bg-green-700 text-white font-semibold px-7 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Book a Free Consultation
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-green-950 via-green-900 to-emerald-800 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-emerald-300/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-16">
            <span className="text-green-300 font-semibold text-sm uppercase tracking-widest">Simple Process</span>
            <h2 className="text-4xl font-bold text-white mt-2">How It Works</h2>
            <p className="text-green-200/80 mt-3 max-w-xl mx-auto">
              Getting started with Trupti Yoga is quick and easy. Follow these four simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-green-500 via-blue-500 via-purple-500 to-orange-500 opacity-30" />

            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center relative">
                {/* Step circle */}
                <div className={`w-20 h-20 rounded-full ${s.color} ring-4 ${s.ring} flex flex-col items-center justify-center mb-5 shadow-lg relative z-10`}>
                  <span className="text-2xl">{s.icon}</span>
                  <span className="text-white text-xs font-bold opacity-80">{s.step}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-green-200/80 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a href="/signup"
              className="inline-block bg-white text-green-800 font-bold px-10 py-4 rounded-full text-lg hover:bg-green-50 transition-all shadow-xl hover:-translate-y-1">
              Get Started Now
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────────────── */}
      <section id="services" className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-green-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-40" />

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">What We Offer</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Our Services</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              A comprehensive range of holistic wellness programmes designed to support preventive healthcare, therapeutic recovery, and long-term lifestyle transformation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((s) => (
              <div key={s.title} className={`${s.light} rounded-2xl overflow-hidden border border-white shadow-sm hover:shadow-xl transition-all hover:-translate-y-1`}>
                {/* Colored top bar */}
                <div className={`h-1.5 bg-gradient-to-r ${s.accent}`} />
                <div className="p-7">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-14 h-14 rounded-2xl ${s.iconBg} flex items-center justify-center text-3xl shadow-sm flex-shrink-0`}>
                      {s.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">{s.title}</h3>
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {s.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-600 text-sm">
                        <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLINICAL ADVANTAGE ───────────────────────────────────── */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Large faded background text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <p className="text-[180px] font-extrabold text-gray-50 tracking-widest leading-none">HEAL</p>
        </div>

        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Why Trupti Yoga</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Our Clinical Advantage</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              What distinguishes Dr. Vishwa's therapeutic approach from conventional online yoga instruction.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <div key={b.title} className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl border border-gray-100 transition-all hover:-translate-y-1 group">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${b.color} flex items-center justify-center text-2xl flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                    {b.icon}
                  </div>
                  <span className="text-5xl font-extrabold text-gray-50 leading-none mt-1 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{b.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CLASSES ──────────────────────────────────────────────── */}
      <section id="classes" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Live Sessions</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Choose Your Session Type</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Three daily group sessions for Individual, Couple, and Family plans — plus private One-to-One sessions with Dr. Vishwa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <ClassCard timeKey="6am" />
            <ClassCard timeKey="8am" />
            <ClassCard timeKey="11am" />
          </div>

          <div className="bg-gradient-to-r from-purple-700 to-violet-600 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl flex-shrink-0">🎯</div>
              <div>
                <span className="text-purple-200 text-xs font-semibold uppercase tracking-widest">Private Sessions</span>
                <h3 className="text-2xl font-bold text-white mt-1">One-to-One with Dr. Vishwa</h3>
                <p className="text-purple-100 text-sm mt-1 max-w-md">
                  Personalised yoga therapy and naturopathy consultation — tailored entirely to your health condition, goals, and schedule.
                </p>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-purple-200">
                  <span>✓ 12 sessions / month</span>
                  <span>✓ From ₹6,000 / month</span>
                  <span>✓ Private Meet link</span>
                </div>
              </div>
            </div>
            <a href="/payment"
              className="flex-shrink-0 bg-white text-purple-700 font-bold px-8 py-3.5 rounded-full hover:bg-purple-50 transition-all shadow-lg text-base">
              Enroll in 1:1
            </a>
          </div>

          <p className="text-center text-gray-400 text-sm mt-6">
            All sessions conducted live via Google Meet · IST timings · Open to participants worldwide
          </p>
        </div>
      </section>

      {/* ── VISION ───────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-green-50 via-white to-emerald-50 relative overflow-hidden">
        {/* Large decorative quote mark */}
        <div className="absolute top-8 left-8 text-[160px] font-serif leading-none text-green-100 select-none pointer-events-none">"</div>
        <div className="absolute bottom-8 right-8 text-[160px] font-serif leading-none text-green-100 select-none pointer-events-none rotate-180">"</div>

        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <span className="text-green-600 font-semibold text-sm uppercase tracking-widest">Our Vision</span>
          <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-6">A Healthier World, Naturally</h2>
          <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full mx-auto mb-10" />

          <div className="bg-white rounded-3xl shadow-lg border border-green-100 p-10">
            <p className="text-gray-600 text-xl leading-relaxed mb-8">
              To inspire individuals worldwide to embrace a healthier lifestyle through yoga, natural healing, mindful living, and preventive healthcare — making holistic wellness accessible regardless of geography, background, or physical condition.
            </p>
            <div className="w-16 h-0.5 bg-green-300 mx-auto mb-6" />
            <p className="text-green-700 font-bold text-2xl italic">
              "One Breath. One Step. Slowly but Surely."
            </p>
            <p className="text-green-500 text-sm mt-2">— Dr. Vishwa Hiremath, BNYS</p>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-r from-green-700 to-emerald-600 relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl" />

        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="text-4xl font-bold text-white mb-4">Begin Your Wellness Journey</h2>
          <p className="text-green-100 text-lg mb-2">Take the first step toward sustainable health, balance, and inner well-being.</p>
          <p className="text-green-200/80 text-base mb-10">
            Join Dr. Vishwa Hiremath's live therapeutic sessions and experience the difference of medically informed yoga practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/signup"
              className="bg-white text-green-700 font-bold px-10 py-4 rounded-full hover:bg-green-50 transition-all shadow-lg hover:-translate-y-1 text-lg">
              Enrol Now
            </a>
            <a href="https://wa.me/918088943510" target="_blank" rel="noopener noreferrer"
              className="border-2 border-white/60 text-white font-semibold px-10 py-4 rounded-full hover:bg-white/10 transition-all text-lg">
              💬 WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

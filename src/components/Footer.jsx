export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-green-400 shadow-lg flex-shrink-0 bg-white">
              <img src="/logo.png" alt="Trupti Yoga" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <p className="font-bold text-white">Trupti Yoga & Nature Cure</p>
              <p className="text-green-400 text-sm">Yoga · Naturopathy · Lifestyle Medicine</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Holistic wellness platform led by Dr. Vishwa Hiremath, BNYS — delivering evidence-based yoga therapy and naturopathic healthcare to global participants since 2020.
          </p>
          <p className="text-green-400/70 text-xs italic mt-1">"One Breath. One Step. Slowly but Surely."</p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-white mb-1">Quick Links</p>
          <a href="#about" className="text-gray-400 hover:text-green-400 transition-colors text-sm">About Dr. Vishwa</a>
          <a href="#services" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Our Services</a>
          <a href="#classes" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Live Sessions</a>
          <a href="#contact" className="text-gray-400 hover:text-green-400 transition-colors text-sm">Contact Us</a>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <p className="font-semibold text-white mb-1">Contact</p>
          <a
            href="tel:+918088943510"
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors text-sm"
          >
            <span>📞</span> +91 80889 43510
          </a>
          <a
            href="mailto:Truptiyoganaturecure@gmail.com"
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors text-sm"
          >
            <span>✉️</span> Truptiyoganaturecure@gmail.com
          </a>
          <a
            href="https://wa.me/918088943510"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors text-sm"
          >
            <span>💬</span> WhatsApp Us
          </a>
        </div>
      </div>

      <div className="border-t border-gray-800 py-6 px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-gray-500 text-sm">© 2025 Trupti Yoga & Nature Cure. Dr. Vishwa Hiremath. All rights reserved.</p>
        <a href="/admin" className="text-gray-600 hover:text-gray-400 text-xs transition-colors">Admin Login</a>
      </div>
    </footer>
  )
}

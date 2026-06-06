import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const isLoggedIn = !!localStorage.getItem('token')
  const userName = localStorage.getItem('userName')

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-green-600 shadow-md flex-shrink-0 bg-white">
            <img src="/logo.png" alt="Trupti Yoga" className="w-full h-full object-cover scale-110" />
          </div>
          <div>
            <p className="text-green-800 font-bold text-sm leading-tight">Trupti Yoga</p>
            <p className="text-green-600 text-xs leading-tight">& Nature Cure</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="/#about" className="text-gray-600 hover:text-green-700 font-medium transition-colors text-sm">About</a>
          <a href="/#classes" className="text-gray-600 hover:text-green-700 font-medium transition-colors text-sm">Sessions</a>
          <a href="/#contact" className="text-gray-600 hover:text-green-700 font-medium transition-colors text-sm">Contact</a>
          <Link to="/admin" className="text-gray-400 hover:text-gray-600 transition-colors text-xs font-medium border border-gray-200 px-3 py-1.5 rounded-full">
            Admin
          </Link>

          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-green-700 transition-colors text-sm shadow-sm"
            >
              <span className="w-6 h-6 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
                {userName?.[0]?.toUpperCase() || 'U'}
              </span>
              My Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-green-700 font-semibold px-4 py-2 rounded-full border-2 border-green-600 hover:bg-green-50 transition-colors text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-green-700 transition-colors text-sm shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-green-800 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 flex flex-col gap-4">
          <a href="/#about" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">About</a>
          <a href="/#classes" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">Sessions</a>
          <a href="/#contact" onClick={() => setMenuOpen(false)} className="text-gray-700 font-medium">Contact</a>
          <Link to="/admin" onClick={() => setMenuOpen(false)} className="text-gray-400 font-medium text-sm">Admin Login</Link>
          <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="bg-green-600 text-white px-5 py-3 rounded-full font-semibold text-center"
              >
                My Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="border-2 border-green-600 text-green-700 px-5 py-3 rounded-full font-semibold text-center"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="bg-green-600 text-white px-5 py-3 rounded-full font-semibold text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

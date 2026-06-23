import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const links = [
  { to: '/', label: 'Home' },
  { to: '/order', label: 'Order' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/70 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14 sm:h-16">
        <Link to="/" className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-blue-400 to-sky-300 bg-clip-text text-transparent tracking-tight">
          Shen pa Print
        </Link>

        <button
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:bg-white/5 active:bg-white/10 transition"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? '✕' : '☰'}
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === l.to
                  ? 'bg-sky-500/10 text-sky-300'
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      {open && (
        <div className="sm:hidden border-t border-white/5 bg-slate-900/90 backdrop-blur-lg px-4 pb-4 pt-2 flex flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block w-full px-4 py-3 rounded-lg text-sm font-medium transition active:scale-[0.98] ${
                pathname === l.to ? 'bg-sky-500/10 text-sky-300' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

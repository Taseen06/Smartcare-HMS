import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/doctors', label: 'Doctors' },
    { to: '/tests', label: 'Tests' },
    { to: '/contact', label: 'Contact' },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    logout()
    navigate('/')
    setMenuOpen(false)
  }

  const getDashboardLink = () => {
    if (!user) return '/auth'
    return `/${user.role}/dashboard`
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-teal-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-heading font-bold text-xl text-gray-900">Smartcare <span className="text-primary-600">HMS</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.to) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link to={getDashboardLink()} className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">
                  <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  {user.name?.split(' ')[0]}
                </Link>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500 transition-colors font-medium">Logout</button>
              </div>
            ) : (
              <>
                <Link to="/auth" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
                <Link to="/auth" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fade-in">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isActive(link.to) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <>
                  <Link to={getDashboardLink()} onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-primary-600">Dashboard</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-500">Logout</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-primary-600">Login / Sign Up</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

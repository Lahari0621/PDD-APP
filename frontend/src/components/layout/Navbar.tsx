import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Menu, X, Zap, LogOut, User, BarChart3, BookOpen, Swords, Shuffle, Mic } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { NAV_LINKS } from '../../constants'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setUserMenuOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-dark shadow-glass py-3' : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center shadow-glow-blue group-hover:shadow-glow-indigo transition-all duration-300">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success animate-pulse" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-white">AI Debate</span>
              <span className="font-display font-bold text-lg gradient-text"> Partner</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {isLanding && (
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 glass px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-indigo-500 flex items-center justify-center text-sm font-bold text-white">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-white">{user?.username}</span>
                  <div className="flex items-center gap-1 text-xs text-warning font-semibold">
                    <Zap className="w-3 h-3" />
                    {user?.xp?.toLocaleString()}
                  </div>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-dark rounded-xl overflow-hidden shadow-glass border border-white/10"
                    >
                      <Link to="/dashboard" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <BarChart3 className="w-4 h-4" /> Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/learn" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <BookOpen className="w-4 h-4" /> Learning Hub
                      </Link>
                      <Link to="/ai-vs-ai" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Swords className="w-4 h-4" /> AI vs AI
                      </Link>
                      <Link to="/topics" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Shuffle className="w-4 h-4" /> Topic Generator
                      </Link>
                      <Link to="/voice-debate" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors">
                        <Mic className="w-4 h-4" /> Voice Debate
                      </Link>
                      <div className="border-t border-white/10" />
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-error hover:bg-error/10 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-300 hover:text-white transition-colors font-medium px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register"
                  className="btn-primary text-sm px-5 py-2.5 rounded-xl flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Start Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden glass p-2 rounded-lg text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/10 mt-3"
          >
            <div className="px-4 py-4 space-y-2">
              {isLanding && NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  {link.label}
                </a>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5">Dashboard</Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5">Profile</Link>
                  <Link to="/learn" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5">Learn</Link>
                  <Link to="/ai-vs-ai" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5">AI vs AI</Link>
                  <Link to="/topics" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5">Topics</Link>
                  <Link to="/voice-debate" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5">Voice Debate</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-error rounded-lg hover:bg-error/10">Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5">Sign In</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-4 py-2 bg-primary-600 text-white rounded-xl text-center font-semibold">Start Free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

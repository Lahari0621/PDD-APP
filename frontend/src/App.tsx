import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, lazy } from 'react'
import Navbar from './components/layout/Navbar'
import ProtectedRoute from './routes/ProtectedRoute'
import LoadingScreen from './components/common/LoadingScreen'

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const DebatePage = lazy(() => import('./pages/DebatePage'))
const LearnPage = lazy(() => import('./pages/LearnPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const AiVsAiPage = lazy(() => import('./pages/AiVsAiPage'))
const TopicGeneratorPage = lazy(() => import('./pages/TopicGeneratorPage'))
const DebateReplayPage = lazy(() => import('./pages/DebateReplayPage'))
const VoiceDebatePage = lazy(() => import('./pages/VoiceDebatePage'))

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

// Pages that don't need the navbar
const NO_NAVBAR_ROUTES = ['/login', '/register', '/forgot-password', '/debate', '/ai-vs-ai', '/replay', '/voice-debate']

export default function App() {
  const location = useLocation()
  const showNavbar = !NO_NAVBAR_ROUTES.some(r => location.pathname.startsWith(r))

  return (
    <div className="min-h-screen bg-dark">
      {showNavbar && <Navbar />}
      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><LandingPage /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
            <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute><PageWrapper><DashboardPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/debate" element={
              <ProtectedRoute><PageWrapper><DebatePage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/learn" element={
              <ProtectedRoute><PageWrapper><LearnPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute><PageWrapper><AnalyticsPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><PageWrapper><ProfilePage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/ai-vs-ai" element={
              <ProtectedRoute><PageWrapper><AiVsAiPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/topics" element={
              <ProtectedRoute><PageWrapper><TopicGeneratorPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/replay/:id" element={
              <ProtectedRoute><PageWrapper><DebateReplayPage /></PageWrapper></ProtectedRoute>
            } />
            <Route path="/voice-debate" element={
              <ProtectedRoute><PageWrapper><VoiceDebatePage /></PageWrapper></ProtectedRoute>
            } />

            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen bg-dark flex items-center justify-center text-center px-4">
                <div>
                  <div className="text-8xl font-black gradient-text mb-4">404</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
                  <p className="text-slate-400 mb-6">The page you're looking for doesn't exist.</p>
                  <a href="/" className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-500 transition-all">
                    Go Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  )
}

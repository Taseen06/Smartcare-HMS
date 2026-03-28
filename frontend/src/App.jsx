import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Tests from './pages/Tests'
import Contact from './pages/Contact'
import AuthPage from './pages/auth/AuthPage'
import PatientDashboard from './pages/patient/Dashboard'
import DoctorDashboard from './pages/doctor/Dashboard'
import AdminDashboard from './pages/admin/Dashboard'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"/></div>
  if (!user) return <Navigate to="/auth" replace />
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={<><Navbar /><Home /></>} />
      <Route path="/doctors" element={<><Navbar /><Doctors /></>} />
      <Route path="/tests" element={<><Navbar /><Tests /></>} />
      <Route path="/contact" element={<><Navbar /><Contact /></>} />
      <Route path="/auth" element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <><Navbar /><AuthPage /></>} />
      <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

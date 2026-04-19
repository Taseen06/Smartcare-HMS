import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const ROLES = [
  { key: 'patient', label: 'Patient', icon: '🧑‍🦱', desc: 'Book appointments & track health', color: 'from-blue-500 to-primary-600' },
  { key: 'doctor', label: 'Doctor', icon: '👨‍⚕️', desc: 'Manage your schedule & patients', color: 'from-teal-500 to-green-600' },
  { key: 'admin', label: 'Admin', icon: '🔐', desc: 'Manage hospital operations', color: 'from-purple-500 to-pink-600' },
]

export default function AuthPage() {
  const [selectedRole, setSelectedRole] = useState(null)
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({})
  const [verifyingEmail, setVerifyingEmail] = useState(null)
  const [otp, setOtp] = useState('')
  const { login, register, verifyOTP } = useAuth()
  const navigate = useNavigate()

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setForm({})
    setMode('login')
  }

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password)
        toast.success(`Welcome back!`)
        navigate(`/${user.role}/dashboard`)
      } else {
        await register(selectedRole.key, { ...form })
        toast.success('Verification code sent!')
        setVerifyingEmail(form.email) // Triggers the OTP UI
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await verifyOTP(verifyingEmail, otp)
      toast.success(`Welcome, ${user.name}!`)
      navigate(`/${user.role}/dashboard`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl animate-fade-in">
        {!selectedRole ? (
          // Role Selection
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">Welcome to Smartcare</h1>
            <p className="text-gray-500 mb-10">Choose your role to continue</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ROLES.map((role, i) => (
                <button key={role.key} onClick={() => handleRoleSelect(role)}
                  className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-left group animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                    {role.icon}
                  </div>
                  <h3 className="font-heading font-bold text-xl text-gray-900 mb-1">{role.label}</h3>
                  <p className="text-gray-500 text-sm">{role.desc}</p>
                  <div className="mt-4 flex items-center text-primary-600 text-sm font-semibold">
                    Continue as {role.label} <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : verifyingEmail ? (
          // OTP Verification Form
          <div className="max-w-md mx-auto">
            <div className="card animate-slide-up text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                📧
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
              <p className="text-gray-500 mb-6 text-sm">
                We've sent a code to <span className="font-semibold text-gray-700">{verifyingEmail}</span>
              </p>
              
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="input text-center text-2xl tracking-[0.5em] font-mono"
                  required
                />
                <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full py-3">
                  {loading ? 'Verifying...' : 'Verify Account'}
                </button>
              </form>
              <button onClick={() => setVerifyingEmail(null)} className="mt-6 text-sm text-gray-500 hover:text-primary-600">
                ← Back to registration
              </button>
            </div>
          </div>
        ) : (
          // Auth Form
          <div className="max-w-md mx-auto">
            <button onClick={() => setSelectedRole(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
              ← Back to role selection
            </button>

            <div className="card animate-slide-up">
              {/* Role indicator */}
              <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${selectedRole.color} text-white px-4 py-2 rounded-xl text-sm font-semibold mb-6`}>
                <span>{selectedRole.icon}</span> {selectedRole.label} Portal
              </div>

              {/* Mode tabs */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                {['login', 'signup'].map(m => (
                  <button key={m} onClick={() => { setMode(m); setForm({}) }}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${mode === m ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                    {m === 'login' ? 'Login' : 'Sign Up'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Common fields for signup */}
                {mode === 'signup' && (
                  <div>
                    <label className="label">Full Name <span className="text-red-400">*</span></label>
                    <input type="text" value={form.name || ''} onChange={set('name')} placeholder="Dr. John Doe" className="input" required />
                  </div>
                )}

                <div>
                  <label className="label">Email Address <span className="text-red-400">*</span></label>
                  <input type="email" value={form.email || ''} onChange={set('email')} placeholder="your@email.com" className="input" required />
                </div>

                <div>
                  <label className="label">Password <span className="text-red-400">*</span></label>
                  <input type="password" value={form.password || ''} onChange={set('password')} placeholder="••••••••" className="input" required minLength={6} />
                </div>

                {/* Patient-specific fields */}
                {mode === 'signup' && selectedRole.key === 'patient' && (
                  <>
                    <div>
                      <label className="label">Phone Number</label>
                      <input type="tel" value={form.phone || ''} onChange={set('phone')} placeholder="01XXXXXXXXX" className="input" />
                    </div>
                    <div>
                      <label className="label">Date of Birth</label>
                      <input type="date" value={form.dateOfBirth || ''} onChange={set('dateOfBirth')} className="input" />
                    </div>
                    <div>
                      <label className="label">Address</label>
                      <input type="text" value={form.address || ''} onChange={set('address')} placeholder="Your full address" className="input" />
                    </div>
                  </>
                )}

                {/* Doctor-specific fields */}
                {mode === 'signup' && selectedRole.key === 'doctor' && (
                  <>
                    <div>
                      <label className="label">Phone Number</label>
                      <input type="tel" value={form.phone || ''} onChange={set('phone')} placeholder="01XXXXXXXXX" className="input" />
                    </div>
                    <div>
                      <label className="label">Specialization <span className="text-red-400">*</span></label>
                      <select value={form.specialization || ''} onChange={set('specialization')} className="input" required>
                        <option value="">Select specialization</option>
                        {['Cardiology','Neurology','Pediatrics','Orthopedics','Dermatology','Oncology','General Medicine','Psychiatry','ENT'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label">Experience (years) <span className="text-red-400">*</span></label>
                        <input type="number" value={form.experience || ''} onChange={set('experience')} placeholder="5" className="input" required min={0} />
                      </div>
                      <div>
                        <label className="label">Consultation Fee (৳) <span className="text-red-400">*</span></label>
                        <input type="number" value={form.consultationFee || ''} onChange={set('consultationFee')} placeholder="500" className="input" required min={0} />
                      </div>
                    </div>
                    <div>
                      <label className="label">Qualifications</label>
                      <input type="text" value={form.qualifications || ''} onChange={set('qualifications')} placeholder="MBBS, MD, etc." className="input" />
                    </div>
                  </>
                )}

                {/* Admin-specific fields */}
                {mode === 'signup' && selectedRole.key === 'admin' && (
                  <>
                    <div>
                      <label className="label">Phone Number</label>
                      <input type="tel" value={form.phone || ''} onChange={set('phone')} placeholder="01XXXXXXXXX" className="input" />
                    </div>
                    <div>
                      <label className="label">Admin Key <span className="text-red-400">*</span></label>
                      <input type="password" value={form.adminKey || ''} onChange={set('adminKey')} placeholder="Enter admin secret key" className="input" required />
                      <p className="text-xs text-gray-400 mt-1">Contact system administrator for the admin key</p>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/> Processing...</>
                  ) : mode === 'login' ? 'Login' : 'Create Account'}
                </button>
              </form>

              <div className="mt-4 text-center text-sm text-gray-500">
                {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setForm({}) }}
                  className="text-primary-600 font-semibold hover:text-primary-700">
                  {mode === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

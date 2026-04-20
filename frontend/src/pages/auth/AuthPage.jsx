import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Stethoscope, Shield, Eye, EyeOff,
  ArrowLeft, CheckCircle2, Heart, Lock
} from 'lucide-react'
import toast from 'react-hot-toast'

const ROLES = [
  { key: 'patient', label: 'Patient',       Icon: User,        desc: 'Book appointments & track health',    ring: 'ring-blue-400',   grad: 'from-blue-500 to-indigo-600'    },
  { key: 'doctor',  label: 'Doctor',        Icon: Stethoscope, desc: 'Manage your schedule & patients',     ring: 'ring-teal-400',   grad: 'from-teal-500 to-emerald-600'   },
  { key: 'admin',   label: 'Administrator', Icon: Shield,      desc: 'Manage hospital operations',          ring: 'ring-violet-400', grad: 'from-violet-500 to-purple-600'  },
]

export default function AuthPage() {
  const [role, setRole]         = useState(null)
  const [mode, setMode]         = useState('login')
  const [loading, setLoading]   = useState(false)
  const [form, setForm]         = useState({})
  const [verifyEmail, setVerify] = useState(null)
  const [otp, setOtp]           = useState('')
  const [showPw, setShowPw]     = useState(false)
  const { login, register, verifyOTP } = useAuth()
  const navigate = useNavigate()

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password)
        toast.success('Welcome back!')
        navigate(`/${user.role}/dashboard`)
      } else {
        await register(role.key, { ...form })
        toast.success('Verification code sent!')
        setVerify(form.email)
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed') }
    finally { setLoading(false) }
  }

  const handleVerify = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      const user = await verifyOTP(verifyEmail, otp)
      toast.success(`Welcome, ${user.name}!`)
      navigate(`/${user.role}/dashboard`)
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid code') }
    finally { setLoading(false) }
  }

  /* ── role selection ── */
  if (!role) return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="text-center mb-10">
          <div className="w-14 h-14 bg-[#0F2744] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-teal-400 fill-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to Smartcare</h1>
          <p className="text-slate-500">Choose your role to continue</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {ROLES.map(({ key, label, Icon, desc, grad }, i) => (
            <motion.button key={key} onClick={() => { setRole(ROLES.find(r => r.key === key)); setMode('login'); setForm({}) }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group card-hover text-left hover:-translate-y-1 transition-all duration-200">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-4
                              group-hover:scale-110 transition-transform`}>
                <Icon size={22} className="text-white" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">{label}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center text-teal-600 text-sm font-semibold">
                Continue as {label} <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )

  /* ── OTP verification ── */
  if (verifyEmail) return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card text-center">
        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={26} className="text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify your email</h2>
        <p className="text-slate-500 text-sm mb-7">
          We've sent a 6-digit code to <span className="font-semibold text-slate-700">{verifyEmail}</span>
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input type="text" value={otp}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="input text-center text-2xl tracking-[0.6em] font-mono" required />
          <button type="submit" disabled={loading || otp.length !== 6} className="btn-primary w-full">
            {loading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
        <button onClick={() => setVerify(null)}
          className="mt-5 flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-600 mx-auto transition-colors">
          <ArrowLeft size={14} /> Back to registration
        </button>
      </motion.div>
    </div>
  )

  /* ── auth form ── */
  const DOCTOR_SPECS = ['Cardiology','Neurology','Pediatrics','Orthopedics','Dermatology','Oncology','General Medicine','Psychiatry','ENT']

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onClick={() => setRole(null)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-700 mb-5 text-sm transition-colors">
          <ArrowLeft size={15} /> Back to role selection
        </motion.button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }} className="card">
          {/* Role pill */}
          <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${role.grad}
                          text-white px-4 py-2 rounded-xl text-sm font-semibold mb-6`}>
            <role.Icon size={15} /> {role.label} Portal
          </div>

          {/* Mode tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            {['login','signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setForm({}) }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${
                  mode === m ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {m === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            {mode === 'signup' && (
              <div>
                <label className="label">Full Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name || ''} onChange={set('name')}
                  placeholder="Your full name" className="input" required />
              </div>
            )}

            <div>
              <label className="label">Email Address <span className="text-red-400">*</span></label>
              <input type="email" value={form.email || ''} onChange={set('email')}
                placeholder="your@email.com" className="input" required />
            </div>

            <div>
              <label className="label">Password <span className="text-red-400">*</span></label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={form.password || ''} onChange={set('password')}
                  placeholder="••••••••" className="input pr-11" required minLength={6} />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Patient extra fields */}
            {mode === 'signup' && role.key === 'patient' && (
              <>
                <div>
                  <label className="label">Phone</label>
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

            {/* Doctor extra fields */}
            {mode === 'signup' && role.key === 'doctor' && (
              <>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" value={form.phone || ''} onChange={set('phone')} placeholder="01XXXXXXXXX" className="input" />
                </div>
                <div>
                  <label className="label">Specialization <span className="text-red-400">*</span></label>
                  <select value={form.specialization || ''} onChange={set('specialization')} className="input" required>
                    <option value="">Select specialization</option>
                    {DOCTOR_SPECS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Experience (yrs) <span className="text-red-400">*</span></label>
                    <input type="number" value={form.experience || ''} onChange={set('experience')} placeholder="5" className="input" required min={0} />
                  </div>
                  <div>
                    <label className="label">Fee (৳) <span className="text-red-400">*</span></label>
                    <input type="number" value={form.consultationFee || ''} onChange={set('consultationFee')} placeholder="500" className="input" required min={0} />
                  </div>
                </div>
                <div>
                  <label className="label">Qualifications</label>
                  <input type="text" value={form.qualifications || ''} onChange={set('qualifications')} placeholder="MBBS, MD…" className="input" />
                </div>
              </>
            )}

            {/* Admin extra fields */}
            {mode === 'signup' && role.key === 'admin' && (
              <>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" value={form.phone || ''} onChange={set('phone')} placeholder="01XXXXXXXXX" className="input" />
                </div>
                <div>
                  <label className="label">Admin Key <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" value={form.adminKey || ''} onChange={set('adminKey')}
                      placeholder="Enter admin secret key" className="input pl-10" required />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Contact system administrator for this key</p>
                </div>
              </>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full mt-2">
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing...</>
                : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setForm({}) }}
              className="text-teal-600 font-semibold hover:text-teal-700 transition-colors">
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

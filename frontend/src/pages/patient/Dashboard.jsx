import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_COLORS = { pending: 'badge-pending', confirmed: 'badge-confirmed', completed: 'badge-completed', cancelled: 'badge-cancelled' }

export default function PatientDashboard() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('appointments')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    fetchAppointments()
    setProfile({ name: user?.name, phone: user?.phone, address: user?.address, dateOfBirth: user?.dateOfBirth?.slice(0, 10) })
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/appointments/patient')
      setAppointments(res.data.appointments || [])
    } catch { toast.error('Failed to load appointments') }
    finally { setLoading(false) }
  }

  const cancelAppointment = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await api.delete(`/appointments/${id}`)
      toast.success('Appointment cancelled')
      fetchAppointments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    }
  }

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await api.put('/auth/profile', profile)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update profile') }
    finally { setSavingProfile(false) }
  }

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status))
  const history = appointments.filter(a => ['completed', 'cancelled'].includes(a.status))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
                <div className="text-xs text-gray-400 capitalize">{user?.role} Dashboard</div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/')} className="btn-secondary text-sm py-1.5 px-3">← Home</button>
              <button onClick={() => { logout(); navigate('/') }} className="text-sm text-red-500 hover:text-red-600 font-medium">Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: appointments.length, color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'Upcoming', value: upcoming.length, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Completed', value: appointments.filter(a => a.status === 'completed').length, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 animate-slide-up`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className={`text-2xl font-heading font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-600 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'appointments', label: 'Upcoming' },
            { key: 'history', label: 'History' },
            { key: 'profile', label: 'Profile' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Upcoming Appointments */}
        {tab === 'appointments' && (
          <div className="space-y-4 animate-fade-in">
            {loading ? <LoadingSkeleton /> : upcoming.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-semibold text-gray-900 mb-1">No upcoming appointments</h3>
                <p className="text-gray-500 text-sm mb-4">Book a doctor or test to get started</p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => navigate('/doctors')} className="btn-primary text-sm py-2 px-4">Find Doctor</button>
                  <button onClick={() => navigate('/tests')} className="btn-secondary text-sm py-2 px-4">Book Test</button>
                </div>
              </div>
            ) : upcoming.map(apt => (
              <AppointmentCard key={apt._id} apt={apt} onCancel={cancelAppointment} showCancel />
            ))}
          </div>
        )}

        {/* History */}
        {tab === 'history' && (
          <div className="space-y-4 animate-fade-in">
            {history.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500">No appointment history yet</p>
              </div>
            ) : history.map(apt => (
              <AppointmentCard key={apt._id} apt={apt} />
            ))}
          </div>
        )}

        {/* Profile */}
        {tab === 'profile' && (
          <div className="card max-w-lg animate-fade-in">
            <h2 className="font-heading font-semibold text-lg mb-6">Edit Profile</h2>
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input type="text" value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Phone</label>
                <input type="tel" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input type="date" value={profile.dateOfBirth || ''} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Address</label>
                <textarea value={profile.address || ''} onChange={e => setProfile({ ...profile, address: e.target.value })} className="input" rows={2} />
              </div>
              <div>
                <label className="label">Email (cannot change)</label>
                <input type="email" value={user?.email || ''} className="input bg-gray-50" disabled />
              </div>
              <button type="submit" disabled={savingProfile} className="btn-primary w-full">
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

function AppointmentCard({ apt, onCancel, showCancel }) {
  const dateStr = apt.date ? format(new Date(apt.date), 'EEE, dd MMM yyyy') : '—'
  const isDoctor = apt.appointmentType === 'doctor'
  return (
    <div className="card hover:shadow-md transition-all animate-slide-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${isDoctor ? 'bg-blue-50' : 'bg-teal-50'}`}>
            {isDoctor ? '👨‍⚕️' : '🔬'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {isDoctor ? apt.doctor?.name : apt.test?.name}
            </h3>
            <p className="text-sm text-gray-500">
              {isDoctor ? apt.doctor?.specialization : `${apt.test?.duration || '—'} min`}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-gray-600">📅 {dateStr}</span>
              <span className="text-sm text-gray-600">⏰ {apt.timeSlot}</span>
              <span className="text-sm font-semibold text-primary-600">
                ৳{isDoctor ? apt.doctor?.consultationFee : apt.test?.price}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={STATUS_COLORS[apt.status] || 'badge bg-gray-100 text-gray-600'}>{apt.status}</span>
          {showCancel && ['pending', 'confirmed'].includes(apt.status) && (
            <button onClick={() => onCancel(apt._id)} className="text-xs text-red-500 hover:text-red-600 font-medium">Cancel</button>
          )}
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="card animate-pulse">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"/>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"/>
              <div className="h-3 bg-gray-200 rounded w-1/4"/>
              <div className="h-3 bg-gray-200 rounded w-1/2"/>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

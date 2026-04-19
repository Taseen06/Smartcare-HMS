import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_COLORS = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled'
}

export default function DoctorDashboard() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('today')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [profile, setProfile] = useState({})
  const [savingProfile, setSavingProfile] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => { fetchAppointments() }, [dateFilter])

  useEffect(() => {
    setProfile({
      name: user?.name, phone: user?.phone, specialization: user?.specialization,
      experience: user?.experience, consultationFee: user?.consultationFee,
      qualifications: user?.qualifications, bio: user?.bio
    })
    setImagePreview(user?.profileImage || null)
  }, [user])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = {}
      if (tab === 'today' || dateFilter) params.date = dateFilter
      const res = await api.get('/appointments/doctor', { params })
      setAppointments(res.data.appointments || [])
    } catch { toast.error('Failed to load appointments') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (tab === 'today') { setDateFilter(format(new Date(), 'yyyy-MM-dd')) }
    else if (tab === 'all') { setDateFilter(''); loadAllAppointments() }
  }, [tab])

  const loadAllAppointments = async () => {
    setLoading(true)
    try {
      const res = await api.get('/appointments/doctor')
      setAppointments(res.data.appointments || [])
    } catch { toast.error('Failed to load appointments') }
    finally { setLoading(false) }
  }

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status })
      toast.success(`Appointment ${status}`)
      tab === 'all' ? loadAllAppointments() : fetchAppointments()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update') }
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleImageUpload = async () => {
    if (!imagePreview || imagePreview === user?.profileImage) {
      toast('No new image selected', { icon: 'ℹ️' }); return
    }
    setUploadingImage(true)
    try {
      console.log('Starting image upload, data size:', imagePreview.length)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout
      
      const res = await api.put('/auth/profile-image', { profileImage: imagePreview }, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      console.log('Upload success:', res.data)
      console.log('Received user with profileImage:', !!res.data.user?.profileImage)
      console.log('Profile image data length:', res.data.user?.profileImage?.length)
      
      // Update context - this will trigger useEffect to update imagePreview
      updateUser(res.data.user)
      
      // Explicitly set preview to the returned image to ensure it displays
      if (res.data.user?.profileImage) {
        setImagePreview(res.data.user.profileImage)
        console.log('✅ Image preview updated with server data')
      }
      
      // Clear file input
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      toast.success('Profile picture updated!')
    } catch (err) { 
      console.error('Upload error:', err.message, err.response?.data)
      if (err.name === 'AbortError') {
        toast.error('Upload timed out. Image too large or network too slow.')
      } else {
        toast.error(err.response?.data?.message || err.message || 'Upload failed') 
      }
    }
    finally { setUploadingImage(false) }
  }

  const removeImage = async () => {
    setUploadingImage(true)
    try {
      const res = await api.put('/auth/profile-image', { profileImage: '' })
      updateUser(res.data.user)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      toast.success('Profile picture removed')
    } catch { toast.error('Failed to remove image') }
    finally { setUploadingImage(false) }
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }
  const hasNewImage = imagePreview && imagePreview !== user?.profileImage

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-teal-200" />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold">{user?.name?.charAt(0)}</div>
              )}
              <div>
                <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
                <div className="text-xs text-teal-600 font-medium">{user?.specialization}</div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <span className="hidden sm:inline text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">● Online</span>
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
            { label: 'Shown', value: stats.total, color: 'text-primary-600', bg: 'bg-primary-50', icon: '📋' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⏳' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
            { label: 'Completed', value: stats.completed, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🏥' },
          ].map((s, i) => (
            <div key={i} className={`${s.bg} rounded-2xl p-4 animate-slide-up`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xl">{s.icon}</span>
                <span className={`text-2xl font-heading font-bold ${s.color}`}>{s.value}</span>
              </div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'today', label: "Today's Schedule" },
            { key: 'filter', label: 'Filter by Date' },
            { key: 'all', label: 'All Appointments' },
            { key: 'profile', label: 'My Profile' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.key ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-teal-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'filter' && (
          <div className="flex items-center gap-3 mb-6 animate-fade-in">
            <label className="text-sm font-medium text-gray-700">Select Date:</label>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input max-w-xs" />
            <button onClick={fetchAppointments} className="btn-primary text-sm py-2 px-4">Search</button>
          </div>
        )}

        {/* Appointment Lists */}
        {(tab === 'today' || tab === 'filter' || tab === 'all') && (
          <div className="animate-fade-in">
            {loading ? <LoadingSkeleton /> : appointments.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-semibold text-gray-900 mb-1">No appointments found</h3>
                <p className="text-gray-500 text-sm">{tab === 'today' ? 'No appointments scheduled for today.' : 'No appointments match your criteria.'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt, i) => (
                  <div key={apt._id} className="card hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-teal-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-lg flex-shrink-0">
                          {apt.patient?.name?.charAt(0) || '?'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900">{apt.patient?.name}</h3>
                          <p className="text-sm text-gray-500">{apt.patient?.email}</p>
                          {apt.patient?.phone && <p className="text-sm text-gray-500">📞 {apt.patient.phone}</p>}
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="text-sm text-gray-600">📅 {apt.date ? format(new Date(apt.date), 'dd MMM yyyy') : '—'}</span>
                            <span className="text-sm font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-lg">⏰ {apt.timeSlot}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className={STATUS_COLORS[apt.status] || 'badge bg-gray-100 text-gray-600'}>{apt.status}</span>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {apt.status === 'pending' && (
                            <><button onClick={() => updateStatus(apt._id, 'confirmed')} className="btn-success text-xs py-1 px-3">Confirm</button>
                              <button onClick={() => updateStatus(apt._id, 'cancelled')} className="btn-danger text-xs py-1 px-3">Reject</button></>
                          )}
                          {apt.status === 'confirmed' && (
                            <button onClick={() => updateStatus(apt._id, 'completed')} className="btn-primary text-xs py-1 px-3">Mark Done</button>
                          )}
                          <button onClick={() => setSelectedPatient(apt.patient)} className="btn-secondary text-xs py-1 px-3">View Patient</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Profile Tab ── */}
        {tab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">

            {/* Profile Picture Card */}
            <div className="lg:col-span-1">
              <div className="card flex flex-col items-center">
                <h2 className="font-heading font-semibold text-base text-gray-900 mb-5 self-start w-full">Profile Picture</h2>

                {/* Avatar with hover overlay */}
                <div className="relative mb-5 group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="w-36 h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-teal-100 to-green-100 flex items-center justify-center ring-4 ring-offset-2 ring-teal-200 transition-all group-hover:ring-teal-400">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-6xl font-heading font-bold text-teal-600 select-none">{user?.name?.charAt(0)}</span>
                    )}
                  </div>
                  {/* Camera icon overlay */}
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-8 h-8 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-white text-xs font-semibold">Click to Change</span>
                  </div>

                  {/* "New" badge when pending save */}
                  {hasNewImage && (
                    <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">NEW</div>
                  )}
                </div>

                <p className="font-semibold text-gray-900 text-center">{user?.name}</p>
                <p className="text-sm text-teal-600 mb-5 text-center">{user?.specialization}</p>

                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleImageSelect} className="hidden" />

                <div className="w-full space-y-2.5">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="btn-secondary w-full text-sm flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Choose Photo
                  </button>

                  {hasNewImage && (
                    <button onClick={handleImageUpload} disabled={uploadingImage}
                      className="w-full text-sm font-semibold py-2.5 px-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                      style={{ background: 'linear-gradient(to right, #0d9488, #16a34a)' }}>
                      {uploadingImage
                        ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading...</>
                        : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Save Picture</>
                      }
                    </button>
                  )}

                  {(imagePreview || user?.profileImage) && !hasNewImage && (
                    <button onClick={removeImage} disabled={uploadingImage}
                      className="btn-danger w-full text-sm flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove Photo
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-4">JPG, PNG, GIF, WebP · Max 2MB</p>

                {hasNewImage && (
                  <div className="mt-3 w-full bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                    ⚠️ Preview shown — click <strong>Save Picture</strong> to apply changes
                  </div>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="font-heading font-semibold text-base text-gray-900 mb-5">Profile Information</h2>
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
                    <label className="label">Specialization</label>
                    <input type="text" value={profile.specialization || ''} onChange={e => setProfile({ ...profile, specialization: e.target.value })} className="input" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Experience (years)</label>
                      <input type="number" value={profile.experience || ''} onChange={e => setProfile({ ...profile, experience: e.target.value })} className="input" min={0} />
                    </div>
                    <div>
                      <label className="label">Consultation Fee (৳)</label>
                      <input type="number" value={profile.consultationFee || ''} onChange={e => setProfile({ ...profile, consultationFee: e.target.value })} className="input" min={0} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Qualifications</label>
                    <input type="text" value={profile.qualifications || ''} onChange={e => setProfile({ ...profile, qualifications: e.target.value })} className="input" placeholder="MBBS, MD, etc." />
                  </div>
                  <div>
                    <label className="label">Bio</label>
                    <textarea value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} className="input resize-none" rows={3} placeholder="Brief professional bio..." />
                  </div>
                  <div>
                    <label className="label">Email (cannot change)</label>
                    <input type="email" value={user?.email || ''} className="input bg-gray-50" disabled />
                  </div>
                  <button type="submit" disabled={savingProfile}
                    className="w-full font-semibold py-2.5 px-4 rounded-xl text-white flex items-center justify-center gap-2 transition-all"
                    style={{ background: 'linear-gradient(to right, #0d9488, #16a34a)' }}>
                    {savingProfile ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : 'Save Changes'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-heading font-bold text-lg">Patient Details</h2>
              <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                  {selectedPatient.name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{selectedPatient.name}</h3>
                  <p className="text-gray-500 text-sm">{selectedPatient.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Phone', value: selectedPatient.phone || 'Not provided' },
                  { label: 'Date of Birth', value: selectedPatient.dateOfBirth ? format(new Date(selectedPatient.dateOfBirth), 'dd MMM yyyy') : 'Not provided' },
                  { label: 'Address', value: selectedPatient.address || 'Not provided' },
                ].map((item, i) => (
                  <div key={i} className={item.label === 'Address' ? 'col-span-2' : ''}>
                    <div className="text-xs text-gray-400 uppercase font-semibold mb-1">{item.label}</div>
                    <div className="text-gray-900 text-sm">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 pt-0">
              <button onClick={() => setSelectedPatient(null)} className="btn-secondary w-full">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="card animate-pulse">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
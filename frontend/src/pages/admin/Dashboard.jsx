import { useState, useEffect } from 'react'
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

const CATEGORY_OPTS = ['blood', 'imaging', 'cardiac', 'urine', 'other']
const CATEGORY_ICONS = { blood: '🩸', imaging: '📷', cardiac: '❤️', urine: '🧪', other: '🔬' }

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState({})
  const [tests, setTests] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTest, setSelectedTest] = useState(null)
  const [testAppointments, setTestAppointments] = useState([])
  const [loadingApts, setLoadingApts] = useState(false)
  const [aptDateFilter, setAptDateFilter] = useState('')
  const [aptStatusFilter, setAptStatusFilter] = useState('')
  const [showTestForm, setShowTestForm] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [testForm, setTestForm] = useState({ name: '', description: '', price: '', duration: '', category: 'other', preparationInstructions: '' })
  const [savingTest, setSavingTest] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [showAdminKey, setShowAdminKey] = useState(false)
  const [updatingKey, setUpdatingKey] = useState(false)
  const [keyForm, setKeyForm] = useState({ currentPassword: '', newAdminKey: '', confirmKey: '' })

  useEffect(() => {
    loadStats()
  }, [])

  useEffect(() => {
    if (tab === 'tests') loadTests()
    if (tab === 'doctors') loadDoctors()
    if (tab === 'stats') loadStats()
    if (tab === 'settings') loadAdminKey()
  }, [tab])

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/stats')
      setStats(res.data.stats || {})
    } catch { toast.error('Failed to load stats') }
    finally { setLoading(false) }
  }

  const loadTests = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/tests')
      setTests(res.data.tests || [])
    } catch { toast.error('Failed to load tests') }
    finally { setLoading(false) }
  }

  const loadDoctors = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/doctors')
      setDoctors(res.data.doctors || [])
    } catch { toast.error('Failed to load doctors') }
    finally { setLoading(false) }
  }

  const loadAdminKey = async () => {
    try {
      console.log('Loading admin key...')
      const res = await api.get('/admin/admin-key')
      console.log('Admin key response:', res.data)
      setAdminKey(res.data.adminKey || '')
    } catch (err) {
      console.error('Failed to load admin key:', err)
      toast.error('Failed to load admin key')
    }
  }

  const updateAdminKey = async (e) => {
    e.preventDefault()
    if (keyForm.newAdminKey !== keyForm.confirmKey) {
      toast.error('New admin key and confirmation do not match')
      return
    }
    if (keyForm.newAdminKey.length < 8) {
      toast.error('Admin key must be at least 8 characters')
      return
    }
    setUpdatingKey(true)
    try {
      await api.put('/admin/update-admin-key', {
        currentPassword: keyForm.currentPassword,
        newAdminKey: keyForm.newAdminKey
      })
      toast.success('Admin key updated successfully!')
      setKeyForm({ currentPassword: '', newAdminKey: '', confirmKey: '' })
      loadAdminKey()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update admin key')
    } finally {
      setUpdatingKey(false)
    }
  }

  const loadTestAppointments = async (test) => {
    setSelectedTest(test)
    setLoadingApts(true)
    setTestAppointments([])
    try {
      const params = {}
      if (aptDateFilter) params.date = aptDateFilter
      if (aptStatusFilter) params.status = aptStatusFilter
      const res = await api.get(`/admin/tests/${test._id}/requests`, { params })
      setTestAppointments(res.data.appointments || [])
    } catch { toast.error('Failed to load appointments') }
    finally { setLoadingApts(false) }
  }

  const openCreateForm = () => {
    setEditingTest(null)
    setTestForm({ name: '', description: '', price: '', duration: '', category: 'other', preparationInstructions: '' })
    setShowTestForm(true)
  }

  const openEditForm = (test) => {
    setEditingTest(test)
    setTestForm({ name: test.name, description: test.description, price: test.price, duration: test.duration, category: test.category, preparationInstructions: test.preparationInstructions || '' })
    setShowTestForm(true)
    setSelectedTest(null)
  }

  const handleSaveTest = async (e) => {
    e.preventDefault()
    setSavingTest(true)
    try {
      if (editingTest) {
        await api.put(`/tests/${editingTest._id}`, testForm)
        toast.success('Test updated!')
      } else {
        await api.post('/tests', testForm)
        toast.success('Test created!')
      }
      setShowTestForm(false)
      loadTests()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save test')
    } finally {
      setSavingTest(false)
    }
  }

  const deleteTest = async (id) => {
    if (!confirm('Deactivate this test? Patients won\'t be able to book it.')) return
    try {
      await api.delete(`/tests/${id}`)
      toast.success('Test deactivated')
      loadTests()
      if (selectedTest?._id === id) setSelectedTest(null)
    } catch { toast.error('Failed to delete test') }
  }

  const verifyDoctor = async (id, isVerified) => {
    try {
      await api.put(`/admin/doctors/${id}/verify`, { isVerified })
      toast.success(isVerified ? 'Doctor verified' : 'Doctor unverified')
      loadDoctors()
    } catch { toast.error('Failed to update doctor') }
  }

  const removeDoctor = async (id) => {
    if (!confirm('Remove this doctor from the system?')) return
    try {
      await api.delete(`/admin/doctors/${id}`)
      toast.success('Doctor removed')
      loadDoctors()
    } catch { toast.error('Failed to remove doctor') }
  }

  const updateAptStatus = async (id, status) => {
    try {
      await api.put(`/admin/appointments/${id}`, { status })
      toast.success(`Status updated to ${status}`)
      loadTestAppointments(selectedTest)
    } catch { toast.error('Failed to update status') }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{user?.name}</div>
                <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide">Admin Dashboard</div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={() => navigate('/')} className="btn-secondary text-sm py-1.5 px-3">← Home</button>
              <button onClick={() => { logout(); navigate('/') }} className="text-sm text-red-500 hover:text-red-600 font-medium">Logout</button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { key: 'stats', label: '📊 Overview' },
            { key: 'tests', label: '🔬 Tests' },
            { key: 'doctors', label: '👨‍⚕️ Doctors' },
            { key: 'settings', label: '⚙️ Settings' },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setSelectedTest(null) }}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === t.key ? 'bg-purple-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── STATS TAB ── */}
        {tab === 'stats' && (
          <div className="animate-fade-in">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-6">Hospital Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Doctors', value: stats.totalDoctors || 0, icon: '👨‍⚕️', bg: 'bg-blue-50', color: 'text-blue-600' },
                { label: 'Patients', value: stats.totalPatients || 0, icon: '🧑‍🦱', bg: 'bg-green-50', color: 'text-green-600' },
                { label: 'Tests', value: stats.totalTests || 0, icon: '🔬', bg: 'bg-teal-50', color: 'text-teal-600' },
                { label: 'Total Bookings', value: stats.totalAppointments || 0, icon: '📋', bg: 'bg-purple-50', color: 'text-purple-600' },
                { label: 'Pending', value: stats.pendingAppointments || 0, icon: '⏳', bg: 'bg-yellow-50', color: 'text-yellow-600' },
              ].map((s, i) => (
                <div key={i} className={`${s.bg} rounded-2xl p-5 animate-slide-up`} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="text-2xl mb-2">{s.icon}</div>
                  <div className={`text-3xl font-heading font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="font-heading font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button onClick={() => setTab('tests')} className="w-full flex items-center gap-3 p-3 bg-teal-50 hover:bg-teal-100 rounded-xl transition-colors text-left">
                    <span className="text-xl">🔬</span>
                    <div>
                      <div className="font-semibold text-sm text-teal-800">Manage Tests</div>
                      <div className="text-xs text-teal-600">Create, edit or view test bookings</div>
                    </div>
                    <span className="ml-auto text-teal-500">→</span>
                  </button>
                  <button onClick={() => setTab('doctors')} className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors text-left">
                    <span className="text-xl">👨‍⚕️</span>
                    <div>
                      <div className="font-semibold text-sm text-blue-800">Manage Doctors</div>
                      <div className="text-xs text-blue-600">Verify, view or remove doctors</div>
                    </div>
                    <span className="ml-auto text-blue-500">→</span>
                  </button>
                </div>
              </div>
              <div className="card">
                <h3 className="font-heading font-semibold text-gray-900 mb-4">System Info</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Working Hours', value: '8:00 AM – 10:00 PM' },
                    { label: 'Working Days', value: 'Saturday – Thursday' },
                    { label: 'Slot Duration', value: '15 minutes each' },
                    { label: 'Booking Policy', value: '1 slot per person per service/day' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
                      <span className="text-gray-500">{item.label}</span>
                      <span className="font-medium text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TESTS TAB ── */}
        {tab === 'tests' && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading font-bold text-xl text-gray-900">
                {selectedTest ? (
                  <button onClick={() => setSelectedTest(null)} className="flex items-center gap-2 text-base text-purple-600 hover:text-purple-700">
                    ← All Tests
                  </button>
                ) : 'Test Management'}
              </h2>
              {!selectedTest && (
                <button onClick={openCreateForm} className="btn-primary text-sm py-2 px-4" style={{ background: 'linear-gradient(to right, #7c3aed, #db2777)' }}>
                  + Create New Test
                </button>
              )}
            </div>

            {!selectedTest ? (
              /* Tests Grid */
              loading ? <LoadingSkeleton /> : tests.length === 0 ? (
                <div className="card text-center py-12">
                  <div className="text-4xl mb-3">🔬</div>
                  <h3 className="font-semibold text-gray-900 mb-1">No tests created yet</h3>
                  <p className="text-gray-500 text-sm mb-4">Create your first diagnostic test</p>
                  <button onClick={openCreateForm} className="btn-primary">Create Test</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {tests.map((test, i) => (
                    <div key={test._id} className={`card hover:shadow-lg transition-all cursor-pointer animate-slide-up ${!test.isActive ? 'opacity-60' : ''}`}
                      style={{ animationDelay: `${i * 0.04}s` }}
                      onClick={() => loadTestAppointments(test)}>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-2xl">{CATEGORY_ICONS[test.category] || '🔬'}</span>
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => openEditForm(test)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => deleteTest(test._id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <h3 className="font-heading font-semibold text-gray-900 mb-1 hover:text-purple-600 transition-colors">{test.name}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{test.description}</p>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div>
                          <span className="text-lg font-bold text-gray-900">৳{test.price}</span>
                          <span className="text-gray-400 text-sm ml-2">• {test.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold">
                            {test.appointmentCount || 0} bookings
                          </span>
                          {!test.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold">Inactive</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* Test Appointments Detail View */
              <div className="animate-fade-in">
                <div className="card mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{CATEGORY_ICONS[selectedTest.category] || '🔬'}</span>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-gray-900">{selectedTest.name}</h3>
                        <p className="text-gray-500 text-sm">৳{selectedTest.price} · {selectedTest.duration} min</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => openEditForm(selectedTest)} className="btn-secondary text-sm py-2 px-3">Edit Test</button>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <input type="date" value={aptDateFilter} onChange={e => setAptDateFilter(e.target.value)} className="input max-w-xs text-sm py-2" />
                  <select value={aptStatusFilter} onChange={e => setAptStatusFilter(e.target.value)} className="input max-w-xs text-sm py-2">
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <button onClick={() => loadTestAppointments(selectedTest)} className="btn-primary text-sm py-2 px-4">Filter</button>
                </div>

                {loadingApts ? <LoadingSkeleton /> : testAppointments.length === 0 ? (
                  <div className="card text-center py-10">
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-gray-500">No appointments found for this test</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-500 mb-2 font-medium">{testAppointments.length} appointment(s) found</div>
                    {testAppointments.map((apt, i) => (
                      <div key={apt._id} className="card hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${i * 0.04}s` }}>
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 font-bold flex-shrink-0">
                              {apt.patient?.name?.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{apt.patient?.name}</div>
                              <div className="text-sm text-gray-500">{apt.patient?.email}</div>
                              {apt.patient?.phone && <div className="text-sm text-gray-500">📞 {apt.patient.phone}</div>}
                              <div className="flex gap-3 mt-1.5 flex-wrap">
                                <span className="text-sm text-gray-600">📅 {apt.date ? format(new Date(apt.date), 'dd MMM yyyy') : '—'}</span>
                                <span className="text-sm font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg">⏰ {apt.timeSlot}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={STATUS_COLORS[apt.status] || 'badge bg-gray-100 text-gray-600'}>{apt.status}</span>
                            <div className="flex gap-1.5 flex-wrap justify-end">
                              {apt.status === 'pending' && (
                                <button onClick={() => updateAptStatus(apt._id, 'confirmed')} className="btn-success text-xs py-1 px-2.5">Confirm</button>
                              )}
                              {['pending', 'confirmed'].includes(apt.status) && (
                                <button onClick={() => updateAptStatus(apt._id, 'completed')} className="btn-primary text-xs py-1 px-2.5">Complete</button>
                              )}
                              {['pending', 'confirmed'].includes(apt.status) && (
                                <button onClick={() => updateAptStatus(apt._id, 'cancelled')} className="btn-danger text-xs py-1 px-2.5">Cancel</button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── DOCTORS TAB ── */}
        {tab === 'doctors' && (
          <div className="animate-fade-in">
            <h2 className="font-heading font-bold text-xl text-gray-900 mb-6">Doctor Management</h2>
            {loading ? <LoadingSkeleton /> : doctors.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">👨‍⚕️</div>
                <p className="text-gray-500">No doctors registered yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {doctors.map((doc, i) => (
                  <div key={doc._id} className={`card hover:shadow-md transition-all animate-slide-up ${!doc.isActive ? 'opacity-50' : ''}`}
                    style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                        {doc.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-heading font-semibold text-gray-900">{doc.name}</h3>
                          {doc.isVerified
                            ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>
                            : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">Unverified</span>}
                          {!doc.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Removed</span>}
                        </div>
                        <div className="text-primary-600 text-sm font-medium">{doc.specialization}</div>
                        <div className="text-gray-500 text-sm">{doc.experience} yrs · {doc.qualifications}</div>
                        <div className="text-gray-500 text-sm">{doc.email} · {doc.phone}</div>
                        <div className="font-semibold text-gray-900 text-sm mt-1">৳{doc.consultationFee}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      {doc.isVerified ? (
                        <button onClick={() => verifyDoctor(doc._id, false)} className="btn-secondary text-xs py-1.5 px-3 flex-1">Unverify</button>
                      ) : (
                        <button onClick={() => verifyDoctor(doc._id, true)} className="btn-success text-xs py-1.5 px-3 flex-1">Verify</button>
                      )}
                      {doc.isActive && (
                        <button onClick={() => removeDoctor(doc._id)} className="btn-danger text-xs py-1.5 px-3">Remove</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Test Create/Edit Modal ── */}
      {showTestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-heading font-bold text-lg">{editingTest ? 'Edit Test' : 'Create New Test'}</h2>
              <button onClick={() => setShowTestForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveTest} className="p-6 space-y-4">
              <div>
                <label className="label">Test Name <span className="text-red-400">*</span></label>
                <input type="text" value={testForm.name} onChange={e => setTestForm({ ...testForm, name: e.target.value })}
                  placeholder="e.g. Complete Blood Count" className="input" required />
              </div>
              <div>
                <label className="label">Description <span className="text-red-400">*</span></label>
                <textarea value={testForm.description} onChange={e => setTestForm({ ...testForm, description: e.target.value })}
                  placeholder="Brief description of the test" className="input resize-none" rows={3} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Price (৳) <span className="text-red-400">*</span></label>
                  <input type="number" value={testForm.price} onChange={e => setTestForm({ ...testForm, price: e.target.value })}
                    placeholder="500" className="input" required min={0} />
                </div>
                <div>
                  <label className="label">Duration (min) <span className="text-red-400">*</span></label>
                  <input type="number" value={testForm.duration} onChange={e => setTestForm({ ...testForm, duration: e.target.value })}
                    placeholder="30" className="input" required min={1} />
                </div>
              </div>
              <div>
                <label className="label">Category</label>
                <select value={testForm.category} onChange={e => setTestForm({ ...testForm, category: e.target.value })} className="input">
                  {CATEGORY_OPTS.map(c => <option key={c} value={c} className="capitalize">{CATEGORY_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Preparation Instructions</label>
                <textarea value={testForm.preparationInstructions} onChange={e => setTestForm({ ...testForm, preparationInstructions: e.target.value })}
                  placeholder="e.g. Fast for 8 hours before the test" className="input resize-none" rows={2} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTestForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={savingTest}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(to right, #7c3aed, #db2777)' }}>
                  {savingTest ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving...</> : editingTest ? 'Save Changes' : 'Create Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab === 'settings' && (
        <div className="animate-fade-in">
          <h2 className="font-heading font-bold text-xl text-gray-900 mb-6">System Settings</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Admin Key Management */}
            <div className="card">
              <h3 className="font-heading font-semibold text-gray-900 mb-4">Admin Key Management</h3>
              <p className="text-sm text-gray-600 mb-4">
                The admin key is required for new admin account registration. Keep it secure and update regularly.
              </p>

              {/* Current Admin Key Display */}
              <div className="mb-6">
                <label className="label">Current Admin Key</label>
                <div className="flex gap-2">
                  <input
                    type={showAdminKey ? "text" : "password"}
                    value={adminKey}
                    readOnly
                    className="input flex-1 bg-gray-50"
                    placeholder="Loading..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {showAdminKey ? (
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Click the eye icon to reveal/hide the key
                </p>
              </div>

              {/* Update Admin Key Form */}
              <form onSubmit={updateAdminKey} className="space-y-4">
                <div>
                  <label className="label">Current Password <span className="text-red-400">*</span></label>
                  <input
                    type="password"
                    value={keyForm.currentPassword}
                    onChange={e => setKeyForm({ ...keyForm, currentPassword: e.target.value })}
                    placeholder="Enter your current password"
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">New Admin Key <span className="text-red-400">*</span></label>
                  <input
                    type="password"
                    value={keyForm.newAdminKey}
                    onChange={e => setKeyForm({ ...keyForm, newAdminKey: e.target.value })}
                    placeholder="Enter new admin key (min 8 characters)"
                    className="input"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label className="label">Confirm New Admin Key <span className="text-red-400">*</span></label>
                  <input
                    type="password"
                    value={keyForm.confirmKey}
                    onChange={e => setKeyForm({ ...keyForm, confirmKey: e.target.value })}
                    placeholder="Confirm new admin key"
                    className="input"
                    required
                    minLength={8}
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingKey}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(to right, #7c3aed, #db2777)' }}
                >
                  {updatingKey ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating...</>
                  ) : (
                    <>🔑 Update Admin Key</>
                  )}
                </button>
              </form>

              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div className="text-xs text-amber-800">
                    <strong>Important:</strong> Remember to update your <code>.env</code> file with the new admin key to persist changes across server restarts.
                  </div>
                </div>
              </div>
            </div>

            {/* System Information */}
            <div className="card">
              <h3 className="font-heading font-semibold text-gray-900 mb-4">System Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">System Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    🟢 Online
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    🗄️ Connected
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Working Hours</span>
                  <span className="text-sm font-medium text-gray-900">8:00 AM – 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Working Days</span>
                  <span className="text-sm font-medium text-gray-900">Sat – Thu</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Slot Duration</span>
                  <span className="text-sm font-medium text-gray-900">15 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map(i => (
        <div key={i} className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-1" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  )
}

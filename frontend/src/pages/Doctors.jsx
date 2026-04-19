import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import BookingModal from '../components/common/BookingModal'
import toast from 'react-hot-toast'

const SPECIALIZATIONS = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Oncology', 'General Medicine']

export default function Doctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSpec, setSelectedSpec] = useState('All')
  const [bookingDoctor, setBookingDoctor] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const spec = searchParams.get('specialization')
    if (spec) setSelectedSpec(spec)
  }, [searchParams])

  useEffect(() => {
    fetchDoctors()
  }, [selectedSpec, search])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (selectedSpec !== 'All') params.specialization = selectedSpec
      const res = await api.get('/doctors', { params })
      setDoctors(res.data.doctors || [])
    } catch {
      toast.error('Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleBookClick = (doctor) => {
    if (!user) {
      toast.error('Please login to book an appointment')
      navigate('/auth')
      return
    }
    if (user.role !== 'patient') {
      toast.error('Only patients can book appointments')
      return
    }
    setBookingDoctor(doctor)
  }

  const avatarColors = ['from-blue-500 to-primary-600', 'from-teal-500 to-green-600', 'from-purple-500 to-pink-500', 'from-orange-500 to-red-500']

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in">
        <h1 className="section-title">Our Doctors</h1>
        <p className="text-gray-500">Find and book appointments with our expert specialists</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SPECIALIZATIONS.slice(0, 5).map(spec => (
            <button key={spec} onClick={() => setSelectedSpec(spec)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedSpec === spec ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
              {spec}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl"/>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"/>
                  <div className="h-3 bg-gray-200 rounded w-1/2"/>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"/>
                <div className="h-3 bg-gray-200 rounded w-2/3"/>
              </div>
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">👨‍⚕️</div>
          <h3 className="font-heading font-semibold text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor, i) => (
            <div key={doctor._id} className="card hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${(i % 6) * 0.05}s` }}>
              <div className="flex gap-4 mb-4">
                <div className={`w-16 h-16 rounded-xl overflow-hidden ${doctor.profileImage ? 'bg-transparent' : `bg-gradient-to-br ${avatarColors[i % 4]}`} flex items-center justify-center text-white font-heading font-bold text-xl flex-shrink-0`}>
                  {doctor.profileImage ? (
                    <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    doctor.name.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-gray-900 leading-tight">{doctor.name}</h3>
                  <span className="inline-block bg-primary-100 text-primary-700 text-xs font-semibold px-2 py-0.5 rounded-full mt-1">{doctor.specialization}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  {doctor.qualifications || 'MBBS'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {doctor.experience} years experience
                </div>
                {doctor.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {doctor.phone}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-400">Consultation Fee</div>
                  <div className="text-xl font-bold text-gray-900">৳{doctor.consultationFee}</div>
                </div>
                <button onClick={() => handleBookClick(doctor)}
                  className={`btn-primary py-2 px-4 text-sm ${!user ? 'opacity-75' : ''}`}>
                  {user ? 'Book Slot' : 'Login to Book'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookingModal
        isOpen={!!bookingDoctor}
        onClose={() => setBookingDoctor(null)}
        item={bookingDoctor}
        type="doctor"
        onSuccess={fetchDoctors}
      />
    </div>
  )
}

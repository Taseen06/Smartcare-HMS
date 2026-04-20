import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import {
  Search, Stethoscope, Clock, GraduationCap, Phone,
  CalendarCheck, Star, SlidersHorizontal, ChevronRight
} from 'lucide-react'
import api from '../utils/api'
import BookingModal from '../components/common/BookingModal'
import toast from 'react-hot-toast'

const FU = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
})

const SPECS = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Oncology', 'General Medicine']
const GRAD = ['from-blue-600 to-indigo-700', 'from-teal-500 to-emerald-600', 'from-violet-600 to-purple-700', 'from-rose-500 to-pink-600']

export default function Doctors() {
  const [doctors, setDoctors]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [selectedSpec, setSpec]     = useState('All')
  const [bookingDoctor, setBooking] = useState(null)
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [params]  = useSearchParams()

  useEffect(() => {
    const s = params.get('specialization')
    if (s) setSpec(s)
  }, [params])

  useEffect(() => { fetchDoctors() }, [selectedSpec, search])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const p = {}
      if (search) p.search = search
      if (selectedSpec !== 'All') p.specialization = selectedSpec
      const res = await api.get('/doctors', { params: p })
      setDoctors(res.data.doctors || [])
    } catch { toast.error('Failed to load doctors') }
    finally { setLoading(false) }
  }

  const handleBook = (doc) => {
    if (!user) { toast.error('Please login to book an appointment'); navigate('/auth'); return }
    if (user.role !== 'patient') { toast.error('Only patients can book appointments'); return }
    setBooking(doc)
  }

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div {...FU(0)} className="mb-8">
        <p className="section-label">Our Physicians</p>
        <h1 className="section-title">Find a Doctor</h1>
        <p className="text-slate-500 text-sm mt-1">Book appointments with our expert specialists</p>
      </motion.div>

      {/* Filters */}
      <motion.div {...FU(0.07)} className="flex flex-col sm:flex-row gap-3 mb-7">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search doctors by name..." value={search}
            onChange={e => setSearch(e.target.value)} className="input pl-10 text-sm" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SPECS.slice(0, 5).map(s => (
            <button key={s} onClick={() => setSpec(s)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                selectedSpec === s
                  ? 'bg-[#0F2744] text-white border-[#0F2744]'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="flex gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
              <div className="h-9 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={24} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">No doctors found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc, i) => (
            <motion.div key={doc._id} {...FU((i % 6) * 0.05)}
              className="card-hover group flex flex-col">
              <div className="flex gap-4 mb-4">
                <div className={`w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center
                                text-white font-bold text-2xl overflow-hidden
                                ${doc.profileImage ? '' : `bg-gradient-to-br ${GRAD[i % 4]}`}`}>
                  {doc.profileImage
                    ? <img src={doc.profileImage} alt={doc.name} className="w-full h-full object-cover" />
                    : doc.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 leading-tight truncate">{doc.name}</h3>
                  <span className="inline-block bg-teal-50 text-teal-700 border border-teal-200
                                   text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                    {doc.specialization}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <GraduationCap size={14} className="text-slate-400 flex-shrink-0" />
                  {doc.qualifications || 'MBBS'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Clock size={14} className="text-slate-400 flex-shrink-0" />
                  {doc.experience} years experience
                </div>
                {doc.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone size={14} className="text-slate-400 flex-shrink-0" />
                    {doc.phone}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <div className="text-xs text-slate-400">Consultation Fee</div>
                  <div className="text-xl font-bold text-slate-900">৳{doc.consultationFee}</div>
                </div>
                <button onClick={() => handleBook(doc)}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl
                              transition-all ${user
                    ? 'bg-[#0F2744] group-hover:bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {user ? 'Book Slot' : 'Login to Book'}
                  <ChevronRight size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <BookingModal isOpen={!!bookingDoctor} onClose={() => setBooking(null)}
        item={bookingDoctor} type="doctor" onSuccess={fetchDoctors} />
    </div>
  )
}

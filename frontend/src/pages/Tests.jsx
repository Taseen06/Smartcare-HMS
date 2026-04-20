import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import {
  Search, Droplets, ScanLine, HeartPulse, FlaskConical,
  Microscope, Clock, ChevronRight, AlertTriangle
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

const CATS = ['all', 'blood', 'imaging', 'cardiac', 'urine', 'other']

const CAT_META = {
  blood:   { Icon: Droplets,   label: 'Blood',   bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200',    cardBg: 'bg-red-50/60'    },
  imaging: { Icon: ScanLine,   label: 'Imaging', bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200',   cardBg: 'bg-blue-50/60'   },
  cardiac: { Icon: HeartPulse, label: 'Cardiac', bg: 'bg-pink-50',   text: 'text-pink-600',   border: 'border-pink-200',   cardBg: 'bg-pink-50/60'   },
  urine:   { Icon: FlaskConical,label:'Urine',   bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-200',  cardBg: 'bg-amber-50/60'  },
  other:   { Icon: Microscope, label: 'Other',   bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', cardBg: 'bg-violet-50/60' },
}

export default function Tests() {
  const [tests, setTests]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('all')
  const [booking, setBooking]   = useState(null)
  const { user }  = useAuth()
  const navigate  = useNavigate()

  useEffect(() => { fetchTests() }, [search, category])

  const fetchTests = async () => {
    setLoading(true)
    try {
      const p = {}
      if (search) p.search = search
      if (category !== 'all') p.category = category
      const res = await api.get('/tests', { params: p })
      setTests(res.data.tests || [])
    } catch { toast.error('Failed to load tests') }
    finally { setLoading(false) }
  }

  const handleBook = (test) => {
    if (!user) { toast.error('Please login to book a test'); navigate('/auth'); return }
    if (user.role !== 'patient') { toast.error('Only patients can book tests'); return }
    setBooking(test)
  }

  return (
    <div className="page-container py-12"> {/* Increased vertical padding for the whole page */}
      <motion.div {...FU(0)} className="mb-12"> {/* Increased bottom margin from 8 to 12 */}
        <p className="section-label mb-2">Laboratory & Diagnostics</p>
        <h1 className="section-title text-3xl">Diagnostic Tests</h1>
        <p className="text-slate-500 text-base mt-3">Book from our wide range of medical diagnostic services</p>
      </motion.div>

      {/* Filters */}
      <motion.div {...FU(0.07)} className="flex flex-col sm:flex-row gap-6 mb-12"> {/* Increased gap and margin */}
        <div className="relative flex-1 max-w-md"> {/* Expanded max-width slightly */}
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search tests..." value={search}
            onChange={e => setSearch(e.target.value)} className="input pl-12 py-3 text-sm" />
        </div>
        <div className="flex gap-3 flex-wrap"> {/* Increased gap between category buttons */}
          {CATS.map(cat => {
            const meta = CAT_META[cat]
            const Icon = meta?.Icon
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold
                            transition-all border capitalize ${
                  category === cat
                    ? 'bg-[#0F2744] text-white border-[#0F2744] shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700'
                }`}>
                {Icon && <Icon size={14} />}
                {cat === 'all' ? 'All Tests' : meta.label}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Increased grid gap */}
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card p-8 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-5" />
              <div className="h-4 bg-slate-200 rounded mb-3" />
              <div className="h-4 bg-slate-200 rounded w-2/3 mb-8" />
              <div className="h-12 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="card text-center py-24"> {/* Increased vertical padding for empty state */}
          <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Microscope size={32} className="text-slate-400" />
          </div>
          <h3 className="font-bold text-xl text-slate-900 mb-2">No tests found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Increased grid gap from 5 to 8 */}
          {tests.map((test, i) => {
            const meta = CAT_META[test.category] || CAT_META.other
            const { Icon } = meta
            return (
              <motion.div key={test._id} {...FU((i % 6) * 0.05)}
                className="card-hover group flex flex-col p-6"> {/* Added internal card padding */}
                
                <div className="flex items-center justify-between mb-6"> {/* Increased bottom margin */}
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold border ${meta.bg} ${meta.text} ${meta.border}`}>
                    <Icon size={14} />
                    {meta.label}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Clock size={14} />
                    {test.duration} min
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 mb-3 group-hover:text-teal-700 transition-colors">
                  {test.name}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2 flex-1">
                  {test.description}
                </p>

                {test.preparationInstructions && (
                  <div className="flex gap-3 items-start bg-amber-50 border border-amber-200
                                  rounded-xl p-4 mb-6 text-xs text-amber-700"> {/* Increased padding and margin */}
                    <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-normal">{test.preparationInstructions}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-100"> {/* Increased top padding */}
                  <div>
                    <div className="text-xs text-slate-400 mb-1">Test Price</div>
                    <div className="text-2xl font-bold text-slate-900">৳{test.price}</div>
                  </div>
                  <button onClick={() => handleBook(test)}
                    className="flex items-center gap-2 bg-[#0F2744] group-hover:bg-teal-600
                               text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-sm">
                    {user ? 'Book Now' : 'Login to Book'}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <BookingModal isOpen={!!booking} onClose={() => setBooking(null)}
        item={booking} type="test" onSuccess={fetchTests} />
    </div>
  )
}
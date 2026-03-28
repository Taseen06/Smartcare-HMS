import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import BookingModal from '../components/common/BookingModal'
import toast from 'react-hot-toast'

const CATEGORIES = ['all', 'blood', 'imaging', 'cardiac', 'urine', 'other']
const CATEGORY_ICONS = { blood: '🩸', imaging: '📷', cardiac: '❤️', urine: '🧪', other: '🔬' }
const CATEGORY_COLORS = { blood: 'bg-red-50 text-red-600 border-red-200', imaging: 'bg-blue-50 text-blue-600 border-blue-200', cardiac: 'bg-pink-50 text-pink-600 border-pink-200', urine: 'bg-yellow-50 text-yellow-700 border-yellow-200', other: 'bg-purple-50 text-purple-600 border-purple-200' }

export default function Tests() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [bookingTest, setBookingTest] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { fetchTests() }, [search, category])

  const fetchTests = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (category !== 'all') params.category = category
      const res = await api.get('/tests', { params })
      setTests(res.data.tests || [])
    } catch {
      toast.error('Failed to load tests')
    } finally {
      setLoading(false)
    }
  }

  const handleBookClick = (test) => {
    if (!user) {
      toast.error('Please login to book a test')
      navigate('/auth')
      return
    }
    if (user.role !== 'patient') {
      toast.error('Only patients can book tests')
      return
    }
    setBookingTest(test)
  }

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in">
        <h1 className="section-title">Diagnostic Tests</h1>
        <p className="text-gray-500">Book from our wide range of medical diagnostic services</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search tests..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${category === cat ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'}`}>
              {cat === 'all' ? 'All Tests' : `${CATEGORY_ICONS[cat]} ${cat}`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"/>
              <div className="h-3 bg-gray-200 rounded mb-2"/>
              <div className="h-3 bg-gray-200 rounded w-2/3"/>
            </div>
          ))}
        </div>
      ) : tests.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔬</div>
          <h3 className="font-heading font-semibold text-gray-900 mb-2">No tests found</h3>
          <p className="text-gray-500">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test, i) => (
            <div key={test._id} className="card hover:shadow-md transition-all group animate-slide-up" style={{ animationDelay: `${(i % 6) * 0.05}s` }}>
              {/* Category Badge */}
              <div className="flex items-start justify-between mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${CATEGORY_COLORS[test.category] || CATEGORY_COLORS.other}`}>
                  {CATEGORY_ICONS[test.category] || '🔬'} {test.category}
                </span>
                <span className="text-gray-400 text-sm">{test.duration} min</span>
              </div>

              <h3 className="font-heading font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{test.name}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">{test.description}</p>

              {test.preparationInstructions && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <div className="flex gap-2 text-xs text-amber-700">
                    <span>⚠️</span>
                    <span className="line-clamp-2">{test.preparationInstructions}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <div className="text-xs text-gray-400">Test Price</div>
                  <div className="text-xl font-bold text-gray-900">৳{test.price}</div>
                </div>
                <button onClick={() => handleBookClick(test)}
                  className="btn-primary py-2 px-4 text-sm">
                  {user ? 'Book Now' : 'Login to Book'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BookingModal
        isOpen={!!bookingTest}
        onClose={() => setBookingTest(null)}
        item={bookingTest}
        type="test"
        onSuccess={fetchTests}
      />
    </div>
  )
}

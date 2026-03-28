import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { format, addDays, isFriday, isToday, isPast, startOfDay } from 'date-fns'

export default function BookingModal({ isOpen, onClose, item, type, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)

  // Generate next 14 days (skip Fridays)
  const availableDates = []
  let d = new Date()
  while (availableDates.length < 14) {
    if (!isFriday(d)) {
      availableDates.push(new Date(d))
    }
    d = addDays(d, 1)
  }

  useEffect(() => {
    if (selectedDate && item?._id) {
      fetchSlots()
    }
  }, [selectedDate, item])

  const fetchSlots = async () => {
    setLoadingSlots(true)
    setSelectedSlot('')
    try {
      const res = await api.get(`/appointments/available-slots`, {
        params: { date: selectedDate, type, id: item._id }
      })
      setSlots(res.data.slots || [])
    } catch {
      toast.error('Failed to load slots')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error('Please select date and time slot')
      return
    }
    setBooking(true)
    try {
      const endpoint = type === 'doctor' ? '/appointments/doctor' : '/appointments/test'
      const payload = type === 'doctor'
        ? { doctorId: item._id, date: selectedDate, timeSlot: selectedSlot }
        : { testId: item._id, date: selectedDate, timeSlot: selectedSlot }
      await api.post(endpoint, payload)
      toast.success('Appointment booked successfully!')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if (!isOpen) return null

  // Group slots by hour for display
  const groupedSlots = {}
  slots.forEach(slot => {
    const hour = slot.time.split(':')[0]
    if (!groupedSlots[hour]) groupedSlots[hour] = []
    groupedSlots[hour].push(slot)
  })

  const formatHour = (h) => {
    const n = parseInt(h)
    return n < 12 ? `${n} AM` : n === 12 ? '12 PM' : `${n - 12} PM`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900">Book Appointment</h2>
            <p className="text-sm text-gray-500 mt-0.5">{item?.name || `Dr. ${item?.name}`}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Item info */}
          <div className="bg-primary-50 rounded-xl p-4">
            {type === 'doctor' ? (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Specialization: <strong>{item?.specialization}</strong></span>
                <span className="text-primary-700 font-semibold">৳{item?.consultationFee}</span>
              </div>
            ) : (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Duration: <strong>{item?.duration} min</strong></span>
                <span className="text-primary-700 font-semibold">৳{item?.price}</span>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label className="label">Select Date <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {availableDates.map((date, i) => {
                const dateStr = format(date, 'yyyy-MM-dd')
                const isSelected = selectedDate === dateStr
                return (
                  <button key={i} onClick={() => setSelectedDate(dateStr)}
                    className={`p-2 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300'}`}>
                    <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
                    <div className="font-semibold text-sm">{format(date, 'dd')}</div>
                    <div className="text-xs text-gray-400">{format(date, 'MMM')}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slot Grid */}
          {selectedDate && (
            <div>
              <label className="label">Select Time Slot <span className="text-red-400">*</span></label>
              {loadingSlots ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin"/>
                </div>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {Object.entries(groupedSlots).map(([hour, hourSlots]) => (
                    <div key={hour}>
                      <div className="text-xs font-semibold text-gray-400 uppercase mb-1.5">{formatHour(hour)}</div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {hourSlots.map(slot => (
                          <button key={slot.time} disabled={slot.isBooked}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                              slot.isBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : selectedSlot === slot.time ? 'bg-primary-500 text-white shadow-sm'
                              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                            }`}>
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-100 border border-green-200 rounded"/><span className="text-gray-500">Available</span></span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 rounded"/><span className="text-gray-500">Booked</span></span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-primary-500 rounded"/><span className="text-gray-500">Selected</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleBook} disabled={!selectedDate || !selectedSlot || booking}
            className="btn-primary flex-1 flex items-center justify-center gap-2">
            {booking ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Booking...</> : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}

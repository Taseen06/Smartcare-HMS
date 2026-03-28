import { useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/contact', form)
      toast.success('Message sent successfully! We\'ll be in touch soon.')
      setForm({ name: '', email: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page-container">
      <div className="mb-8 animate-fade-in">
        <h1 className="section-title">Contact Us</h1>
        <p className="text-gray-500">We're here to help. Get in touch with us.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6 animate-slide-up">
          <div className="card">
            <h2 className="font-heading font-semibold text-xl mb-6">Get In Touch</h2>
            <div className="space-y-4">
              {[
                { icon: '📍', title: 'Address', info: 'Smartcare Hospital, Zindabazar, Sylhet-3100, Bangladesh' },
                { icon: '📞', title: 'Phone', info: '+880-1700-000000, +880-821-000000' },
                { icon: '✉️', title: 'Email', info: 'info@smartcarehms.com, support@smartcarehms.com' },
                { icon: '⏰', title: 'Working Hours', info: 'Saturday–Thursday: 8:00 AM – 10:00 PM\nFriday: Closed' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <span className="text-2xl mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                    <div className="text-gray-500 text-sm whitespace-pre-line">{item.info}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-gradient-to-br from-primary-50 to-teal-50 border-primary-100">
            <h3 className="font-heading font-semibold text-gray-900 mb-3">Emergency?</h3>
            <p className="text-gray-600 text-sm mb-3">For medical emergencies, please call our 24/7 emergency line.</p>
            <div className="text-2xl font-heading font-bold text-primary-600">+880-1700-911</div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h2 className="font-heading font-semibold text-xl mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name <span className="text-red-400">*</span></label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name" className="input" required />
            </div>
            <div>
              <label className="label">Email Address <span className="text-red-400">*</span></label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com" className="input" required />
            </div>
            <div>
              <label className="label">Message <span className="text-red-400">*</span></label>
              <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="How can we help you?" rows={5} className="input resize-none" required />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

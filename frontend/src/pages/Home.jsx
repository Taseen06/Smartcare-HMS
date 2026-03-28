import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Home() {
  const [stats, setStats] = useState({ doctors: 0, tests: 0, patients: 1200 })
  const [featuredDoctors, setFeaturedDoctors] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/doctors').then(res => {
      setFeaturedDoctors(res.data.doctors?.slice(0, 3) || [])
      setStats(s => ({ ...s, doctors: res.data.doctors?.length || 0 }))
    }).catch(() => {})
    api.get('/tests').then(res => {
      setStats(s => ({ ...s, tests: res.data.tests?.length || 0 }))
    }).catch(() => {})
  }, [])

  const specializations = ['Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Oncology']

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-64 h-64 bg-teal-400 rounded-full blur-3xl"/>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary-300 rounded-full blur-2xl"/>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="max-w-2xl animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
              <span>Accepting new patients</span>
            </div>
            <h1 className="text-5xl font-heading font-bold leading-tight mb-4">
              Your Health, <br/><span className="text-teal-300">Our Priority</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              World-class healthcare at your fingertips. Book appointments with top specialists and schedule diagnostic tests easily.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/doctors" className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl">
                Find a Doctor
              </Link>
              <Link to="/tests" className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-all">
                Book a Test
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { value: `${stats.doctors}+`, label: 'Expert Doctors' },
                { value: `${stats.tests}+`, label: 'Diagnostic Tests' },
                { value: '5000+', label: 'Patients Served' },
              ].map((stat, i) => (
                <div key={i} className="animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="text-3xl font-heading font-bold text-teal-300">{stat.value}</div>
                  <div className="text-primary-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Why Choose Smartcare?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Experience healthcare designed around your needs — convenient, reliable, and compassionate.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🏥', title: 'Expert Specialists', desc: 'Access top-rated doctors across all major specializations with verified credentials.' },
              { icon: '⏰', title: 'Easy Scheduling', desc: 'Book 15-minute slots online, 6 days a week, 8AM to 10PM. No waiting in queues.' },
              { icon: '🔬', title: 'Comprehensive Tests', desc: 'From blood work to MRI scans — all diagnostic services under one roof.' },
            ].map((f, i) => (
              <div key={i} className="card hover:shadow-md transition-shadow text-center animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-heading font-semibold text-lg text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-8">Our Specializations</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {specializations.map((s, i) => (
              <Link key={i} to={`/doctors?specialization=${s}`}
                className="bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 rounded-xl p-4 text-center text-sm font-medium text-gray-700 hover:text-primary-700 transition-all cursor-pointer">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      {featuredDoctors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title mb-0">Featured Doctors</h2>
              <Link to="/doctors" className="text-primary-600 hover:text-primary-700 font-medium text-sm">View All →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredDoctors.map((doc, i) => (
                <DoctorCard key={doc._id} doctor={doc} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-teal-600 text-white">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-heading font-bold mb-4">Ready to take care of your health?</h2>
          <p className="text-primary-100 mb-8">Join thousands of patients who trust Smartcare HMS for their healthcare needs.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth" className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-xl hover:bg-primary-50 transition-all">
              Get Started Free
            </Link>
            <Link to="/contact" className="border-2 border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-all">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-teal-500 rounded-lg"/>
              <span className="text-white font-heading font-bold">Smartcare HMS</span>
            </div>
            <p className="text-sm">© 2024 Smartcare Hospital Management System. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <Link to="/doctors" className="hover:text-white transition-colors">Doctors</Link>
              <Link to="/tests" className="hover:text-white transition-colors">Tests</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DoctorCard({ doctor, index }) {
  const colors = ['from-blue-500 to-primary-600', 'from-teal-500 to-green-600', 'from-purple-500 to-pink-500']
  return (
    <div className="card hover:shadow-md transition-all animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colors[index % 3]} flex items-center justify-center text-white font-heading font-bold text-xl mb-4`}>
        {doctor.name.charAt(0)}
      </div>
      <h3 className="font-heading font-semibold text-gray-900">{doctor.name}</h3>
      <p className="text-primary-600 text-sm font-medium mb-1">{doctor.specialization}</p>
      <p className="text-gray-500 text-sm">{doctor.experience} years experience</p>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-lg font-bold text-gray-900">৳{doctor.consultationFee}</span>
        <Link to="/doctors" className="btn-primary py-1.5 px-3 text-sm">Book Now</Link>
      </div>
    </div>
  )
}

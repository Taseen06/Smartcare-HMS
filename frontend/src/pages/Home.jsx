import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Stethoscope, Clock, Microscope, ArrowRight, ChevronRight,
  Heart, Brain, Baby, Bone, Sparkles, Ribbon, Users,
  FlaskConical, Star, Shield, Phone, Building2, Activity,
  CalendarCheck, BadgeCheck, MapPin, Mail, CheckCircle2
} from 'lucide-react'
import api from '../utils/api'

/* ── shared animation helpers ── */
const FU = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
})
const stagger = { initial: {}, whileInView: {}, viewport: { once: true } }

const SPECS = [
  { label: 'Cardiology',   Icon: Heart,    bg: 'bg-rose-50',   icon: 'text-rose-500',   border: 'hover:border-rose-300'   },
  { label: 'Neurology',    Icon: Brain,    bg: 'bg-violet-50', icon: 'text-violet-500', border: 'hover:border-violet-300' },
  { label: 'Pediatrics',   Icon: Baby,     bg: 'bg-sky-50',    icon: 'text-sky-500',    border: 'hover:border-sky-300'    },
  { label: 'Orthopedics',  Icon: Bone,     bg: 'bg-amber-50',  icon: 'text-amber-500',  border: 'hover:border-amber-300'  },
  { label: 'Dermatology',  Icon: Sparkles, bg: 'bg-pink-50',   icon: 'text-pink-500',   border: 'hover:border-pink-300'   },
  { label: 'Oncology',     Icon: Ribbon,   bg: 'bg-teal-50',   icon: 'text-teal-500',   border: 'hover:border-teal-300'   },
]

const FEATURES = [
  { Icon: Stethoscope,  title: 'Expert Specialists',   desc: 'Access top-rated doctors across all major specializations with verified credentials.', iconBg: 'bg-teal-50 text-teal-600'   },
  { Icon: CalendarCheck, title: 'Easy Scheduling',     desc: 'Book 15-minute slots online, 6 days a week, 8 AM – 10 PM. Zero queues.', iconBg: 'bg-blue-50 text-blue-600'      },
  { Icon: FlaskConical,  title: 'Comprehensive Tests', desc: 'From blood panels to MRI scans — all diagnostic services streamlined under one roof.', iconBg: 'bg-violet-50 text-violet-600' },
]

const DOCTOR_GRADS = ['from-blue-600 to-indigo-700', 'from-teal-500 to-emerald-600', 'from-violet-600 to-purple-700']

export default function Home() {
  const [stats, setStats] = useState({ doctors: 0, tests: 0 })
  const [doctors, setDoctors] = useState([])

  useEffect(() => {
    api.get('/doctors').then(r => {
      setDoctors(r.data.doctors?.slice(0, 3) || [])
      setStats(s => ({ ...s, doctors: r.data.doctors?.length || 0 }))
    }).catch(() => {})
    api.get('/tests').then(r => {
      setStats(s => ({ ...s, tests: r.data.tests?.length || 0 }))
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-[#F0F4F8]">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative bg-[#0F2744] text-white overflow-hidden">
        {/* grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* glow orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-teal-500/15 blur-[80px]" />
        <div className="absolute bottom-0 left-[15%] w-72 h-72 rounded-full bg-blue-500/10 blur-[70px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20
                        grid lg:grid-cols-2 gap-14 items-center">
          {/* left copy */}
          <div>
            <motion.div {...FU(0)}
              className="inline-flex items-center gap-2 border border-teal-500/40 bg-teal-500/10
                         text-teal-300 text-xs font-semibold tracking-widest uppercase rounded-full px-4 py-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Accepting New Patients
            </motion.div>

            <motion.h1 {...FU(0.07)}
              className="text-[clamp(2.4rem,4.5vw,3.8rem)] font-bold leading-[1.1] mb-5">
              Your Health,{' '}
              <span className="text-teal-400">Our Priority.</span>
            </motion.h1>

            <motion.p {...FU(0.14)}
              className="text-slate-400 text-lg leading-relaxed mb-9 max-w-md">
              World-class healthcare at your fingertips. Book appointments with top specialists
              and schedule diagnostic tests — all in one place.
            </motion.p>

            <motion.div {...FU(0.2)} className="flex flex-wrap gap-4">
              <Link to="/doctors"
                className="group flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-white
                           font-semibold px-7 py-3.5 rounded-xl transition-all
                           shadow-lg shadow-teal-500/25 hover:-translate-y-0.5">
                Find a Doctor
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/tests"
                className="flex items-center gap-2 border border-white/20 bg-white/5
                           hover:bg-white/10 text-white font-semibold px-7 py-3.5
                           rounded-xl transition-all backdrop-blur-sm">
                <FlaskConical size={15} />
                Book a Test
              </Link>
            </motion.div>

            {/* trust row */}
            <motion.div {...FU(0.27)}
              className="flex flex-wrap items-center gap-6 mt-9 pt-8 border-t border-white/10">
              {[
                { Icon: Shield,     text: 'Verified Doctors' },
                { Icon: BadgeCheck, text: 'ISO Certified'    },
                { Icon: Star,       text: '4.9 / 5 Rating'  },
              ].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Icon size={14} className="text-teal-400" />
                  {text}
                </div>
              ))}
            </motion.div>
          </div>

          {/* right — stat cards */}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { Icon: Users,        value: `${stats.doctors}+`, label: 'Expert Doctors',   sub: 'Across 12 specializations', grad: 'from-teal-500 to-emerald-600'   },
              { Icon: FlaskConical, value: `${stats.tests}+`,   label: 'Diagnostic Tests', sub: 'In-house & outsourced',     grad: 'from-blue-500 to-indigo-600'    },
              { Icon: Activity,     value: '5 000+',            label: 'Patients Served',  sub: 'And counting',              grad: 'from-violet-500 to-purple-600'  },
              { Icon: CalendarCheck,value: '6 Days',            label: 'Open Weekly',      sub: '8 AM – 10 PM slots',        grad: 'from-rose-500 to-pink-600'      },
            ].map(({ Icon, value, label, sub, grad }, i) => (
              <motion.div key={i} {...FU(0.08 * i)}
                className={`rounded-2xl p-6 bg-white/6 border border-white/10 backdrop-blur-sm
                            hover:bg-white/10 transition-all ${i === 1 ? 'mt-6' : ''}`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center mb-4`}>
                  <Icon size={17} className="text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-0.5">{value}</div>
                <div className="text-slate-300 font-semibold text-sm">{label}</div>
                <div className="text-slate-500 text-xs mt-0.5">{sub}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* bottom fade */}
        <div className="h-10 bg-gradient-to-t from-[#F0F4F8] to-transparent" />
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-16 bg-[#F0F4F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <motion.div {...FU(0)}>
              <p className="section-label">Why Smartcare</p>
              <h2 className="section-title">Designed around your wellbeing.</h2>
            </motion.div>
            <motion.p {...FU(0.1)} className="text-slate-500 text-sm max-w-xs leading-relaxed md:text-right">
              Convenient, reliable, and compassionate — healthcare the way it should feel.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map(({ Icon, title, desc, iconBg }, i) => (
              <motion.div key={i} {...FU(i * 0.08)}
                className="group card-hover cursor-default">
                <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-5
                                group-hover:scale-110 transition-transform`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SPECIALIZATIONS ═══════════════ */}
      <section className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...FU(0)} className="mb-8">
            <p className="section-label">Our Expertise</p>
            <h2 className="section-title">Browse by Specialization</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SPECS.map(({ label, Icon, bg, icon, border }, i) => (
              <motion.div key={i} {...FU(i * 0.05)}>
                <Link to={`/doctors?specialization=${label}`}
                  className={`group flex flex-col items-center gap-3 bg-white border border-slate-200
                              ${border} rounded-xl p-5 text-center transition-all
                              hover:-translate-y-0.5 hover:shadow-md`}>
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center
                                  group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className={icon} />
                  </div>
                  <span className="text-slate-700 text-xs font-semibold leading-tight">{label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED DOCTORS ═══════════════ */}
      {doctors.length > 0 && (
        <section className="py-16 bg-[#F0F4F8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-9">
              <motion.div {...FU(0)}>
                <p className="section-label">Our Team</p>
                <h2 className="section-title">Featured Doctors</h2>
              </motion.div>
              <motion.div {...FU(0.1)}>
                <Link to="/doctors"
                  className="group flex items-center gap-1.5 text-teal-600 font-semibold text-sm
                             hover:text-teal-700 transition-colors">
                  View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {doctors.map((doc, i) => (
                <DoctorCard key={doc._id} doctor={doc} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="relative py-20 bg-[#0F2744] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-40px] left-[20%] w-96 h-96 rounded-full bg-teal-500/10 blur-[80px]" />
          <div className="absolute bottom-[-30px] right-[15%] w-72 h-72 rounded-full bg-blue-500/8 blur-[70px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center px-4">
          <motion.div {...FU(0)}>
            <p className="text-xs font-bold tracking-widest uppercase text-teal-400 mb-4">Get Started</p>
          </motion.div>
          <motion.h2 {...FU(0.07)} className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
            Ready to take care<br />of your health?
          </motion.h2>
          <motion.p {...FU(0.14)} className="text-slate-400 mb-10 text-lg">
            Join thousands of patients who trust Smartcare HMS for their healthcare journey.
          </motion.p>
          <motion.div {...FU(0.2)} className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth"
              className="bg-teal-500 hover:bg-teal-400 text-white font-semibold px-8 py-4
                         rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:-translate-y-0.5">
              Get Started Free
            </Link>
            <Link to="/contact"
              className="flex items-center gap-2 border border-white/20 text-white font-semibold
                         px-8 py-4 rounded-xl hover:bg-white/8 transition-all">
              <Phone size={15} /> Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="bg-[#070F1C] text-slate-500 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center">
                <Heart size={15} className="text-white fill-white" />
              </div>
              <span className="text-white font-bold">Smartcare HMS</span>
            </Link>
            <p className="text-xs">© 2024 Smartcare Hospital Management System. All rights reserved.</p>
            <div className="flex gap-7 text-sm">
              {['/doctors', '/tests', '/contact'].map((to, i) => (
                <Link key={to} to={to} className="hover:text-white transition-colors capitalize">
                  {to.replace('/', '')}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function DoctorCard({ doctor, index }) {
  return (
    <motion.div {...FU(index * 0.08)} className="card-hover group">
      <div className="flex items-start gap-4 mb-4">
        {/* Profile Image or Placeholder matching Doctors.jsx logic */}
        <div className={`w-14 h-14 rounded-xl flex-shrink-0 flex items-center justify-center
                        text-white font-bold text-xl overflow-hidden shadow-sm border border-slate-100
                        ${doctor.profileImage ? '' : `bg-gradient-to-br ${DOCTOR_GRADS[index % 3]}`}`}>
          {doctor.profileImage ? (
            <img 
              src={doctor.profileImage} 
              alt={doctor.name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }} // Optional: hide if broken
            />
          ) : (
            doctor.name.charAt(0)
          )}
        </div>

        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
            {doctor.name}
          </h3>
          <p className="text-teal-600 text-sm font-medium mt-0.5">
            {doctor.specialization}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">
            <Stethoscope size={11} className="inline mr-1" />
            {doctor.experience} yrs experience
          </p>
        </div>
      </div>

      {/* Adding a bit of gapping before the footer */}
      <div className="flex items-center gap-1 mb-5">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={11} className={i < 4 ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
        ))}
        <span className="text-slate-400 text-xs ml-1 font-medium">4.8</span>
      </div>

      <div className="flex items-center justify-between pt-5 border-t border-slate-100 mt-auto">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Consultation</span>
          <div className="text-xl font-bold text-slate-900">৳{doctor.consultationFee}</div>
        </div>
        <Link to="/doctors"
          className="flex items-center gap-1.5 bg-[#0F2744] group-hover:bg-teal-600 text-white
                     text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm">
          Book <ArrowRight size={13} />
        </Link>
      </div>
    </motion.div>
  )
}



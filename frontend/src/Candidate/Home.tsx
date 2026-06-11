import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Star, MapPin, Users, Shield,
  Zap, Award, ChevronRight, Phone, Mail, Globe,
  Briefcase, UserCheck, Building2, Clock3,
} from 'lucide-react';

// ─── Brand tokens ──────────────────────────────────────────────────────────────
// Navy   : #0b3d6b  |  Mid navy : #1a5490  |  Teal : #0e8c7a
// Green  : #2fb852  |  Dark green : #1f8f3e
// Off-white: #f4f8fb

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { num: '5,000+',  label: 'Candidates Placed'       },
  { num: '300+',    label: 'Partner Companies'        },
  { num: '98%',     label: 'Client Satisfaction'      },
  { num: '< 7 days',label: 'Average Time-to-Fill'     },
];

const HOW_STEPS = [
  {
    num: '01',
    icon: <UserCheck size={22} />,
    title: 'Candidates Register',
    desc:  'Professionals join our talent pool by completing a detailed profile — skills, experience, availability and salary expectations.',
    from:  '#0b3d6b', to: '#1a5490',
  },
  {
    num: '02',
    icon: <Shield size={22} />,
    title: 'WHS Screens & Verifies',
    desc:  'Our team personally reviews, interviews and background-checks every candidate before they enter our active pool.',
    from:  '#0e8c7a', to: '#1f8f3e',
  },
  {
    num: '03',
    icon: <Building2 size={22} />,
    title: 'We Match to Companies',
    desc:  'When a company needs talent, we hand-pick the best-fit candidates from our pool and present them — ready to interview.',
    from:  '#1f8f3e', to: '#2fb852',
  },
];

const FOR_CANDIDATES = [
  { icon: '🎯', title: 'Get Discovered',      desc: 'Top companies come to us when they need talent. Your profile puts you in front of the right people.' },
  { icon: '✅', title: 'Zero Job Hunting',     desc: 'No need to browse listings. We match you to opportunities that fit your skills and expectations.'     },
  { icon: '🤝', title: 'Personal Support',     desc: 'Our team guides you through every step — from profile setup to offer negotiation.'                   },
  { icon: '🔒', title: 'Confidential Process', desc: 'Your information is never shared publicly. We only present you to companies with your consent.'       },
];

const FOR_COMPANIES = [
  { icon: <UserCheck size={18} />,  title: 'Pre-Vetted Talent',     desc: 'Every candidate is screened, interviewed and reference-checked by our team before you meet them.'  },
  { icon: <Clock3 size={18} />,     title: 'Fast Turnaround',       desc: 'Receive a curated shortlist within days — not weeks. We do the heavy lifting so you don\'t have to.' },
  { icon: <Briefcase size={18} />,  title: 'Any Role, Any Level',   desc: 'From entry-level to C-suite, across all industries — we have the depth to fill any position.'       },
  { icon: <Award size={18} />,      title: 'Quality Guaranteed',    desc: 'Not the right fit? We source a replacement at no additional cost. Your satisfaction is our priority.' },
];

const TESTIMONIALS = [
  {
    quote:    'WHS delivered three exceptional candidates within a week. The screening they do is thorough — every person we interviewed was genuinely the right fit.',
    name:     'Ashan Kumarasinghe',
    role:     'CTO — TechCorp Lanka',
    initials: 'AK',
    from:     '#2fb852', to: '#0e8c7a',
  },
  {
    quote:    'I registered on a Tuesday. By Friday I had two interview invitations for roles I actually wanted. The process was smooth and completely stress-free.',
    name:     'Nilmini Perera',
    role:     'Senior Data Analyst',
    initials: 'NP',
    from:     '#1a5490', to: '#2fb852',
  },
  {
    quote:    'As a small business we don\'t have an HR department. WHS acts as our recruitment team — and they\'re better than any agency we\'ve used before.',
    name:     'Ravin Jayawardena',
    role:     'Founder — StartupHQ',
    initials: 'RJ',
    from:     '#0e8c7a', to: '#0b3d6b',
  },
];

const FOOTER_COLS = [
  { heading: 'Company',     links: ['About Us','Our Team','Careers','Blog','Contact'] },
  { heading: 'Candidates',  links: ['Join Talent Pool','How It Works','Career Tips','FAQ'] },
  { heading: 'Companies',   links: ['Find Talent','Our Process','Industries We Serve','Contact Sales'] },
  { heading: 'Legal',       links: ['Privacy Policy','Terms of Service','Cookie Policy'] },
];

const FIELDS = [
  'Software Development','UI/UX Design','Data Science','Digital Marketing',
  'Finance & Accounting','HR & Recruitment','DevOps & Cloud','Sales',
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="font-sans text-gray-800 antialiased overflow-x-hidden">

      {/* ══════════════════════════════ NAV ══════════════════════════════════ */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_24px_rgba(11,61,107,0.10)] border-b border-gray-100'
          : 'bg-white/70 backdrop-blur-md'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-md overflow-hidden border border-white/60">
              <img src="assets/logo.png" alt="WHS Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-[17px] tracking-tight text-[#0b3d6b]">
              Workforce<span className="text-[#2fb852]">Hiring</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-gray-600">
            {['How It Works','For Candidates','For Companies','About Us'].map(l => (
              <a key={l} href="#" className="hover:text-[#0b3d6b] transition-colors">{l}</a>
            ))}
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-2.5">
            <Link to="/signin"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-[14px] font-semibold text-[#0b3d6b] border border-[#0b3d6b]/30 hover:border-[#0b3d6b] hover:bg-[#0b3d6b]/5 transition-all">
              Sign In
            </Link>
            <Link to="/candidate/registration/basic"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-[#0b3d6b] to-[#1a5490] hover:from-[#1a5490] hover:to-[#0e8c7a] shadow-md hover:shadow-lg transition-all">
              Join Talent Pool <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════ HERO ═════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-[68px] bg-[#061e35] overflow-hidden">
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize:'72px 72px' }} />
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(47,184,82,0.09) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(14,140,122,0.10) 0%, transparent 65%)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-24 grid lg:grid-cols-2 gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2fb852]/40 bg-[#2fb852]/10 text-[#5fda7e] text-[12px] font-semibold tracking-wide mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2fb852] animate-pulse" />
              Sri Lanka's Premier Talent Acquisition Partner
            </div>

            <h1 className="text-[clamp(36px,4.8vw,62px)] font-black text-white leading-[1.07] tracking-tight mb-6">
              We Find the{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#2fb852]">Right Talent</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#2fb852]/40 rounded-full" />
              </span>
              <br />For Your Business.
            </h1>

            <p className="text-[17px] text-white/55 leading-relaxed max-w-[480px] mb-8 font-light">
              Workforce Hiring Solutions connects companies with pre-screened, interview-ready
              professionals — so you spend time hiring, not searching.
            </p>

            {/* Two audience CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link to="/candidate/registration/basic"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#2fb852] to-[#0e8c7a] text-white font-bold text-[15px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <UserCheck size={18} /> Join as Candidate
              </Link>
              <a href="#companies"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border-2 border-white/20 text-white font-bold text-[15px] hover:bg-white/10 hover:border-white/40 transition-all">
                <Building2 size={18} /> Hire Through Us
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="text-[22px] font-black text-white leading-none">{s.num}</p>
                  <p className="text-[11px] text-white/40 mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — visual */}
          <div className="hidden lg:flex flex-col gap-4 items-center">
            {/* Central badge */}
            <div className="relative flex items-center justify-center">
              <div className="w-52 h-52 rounded-full border border-[#2fb852]/20" />
              <div className="absolute w-36 h-36 rounded-full border border-[#1a5490]/20" />
              <div className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-[#0b3d6b] to-[#0e8c7a] flex flex-col items-center justify-center shadow-2xl">
                <img src="assets/logo.png" alt="WHS" className="w-16 h-16 object-contain rounded-full" />
              </div>
              {/* Orbit items */}
              {[
                { label:'5K+ Candidates', top:'-20px', left:'50%', translate:'-50%', bg:'#dbeafe', color:'#1d4ed8' },
                { label:'300+ Companies',  top:'50%', right:'-90px', translate:'translateY(-50%)', bg:'#dcfce7', color:'#166534' },
                { label:'98% Satisfaction',bottom:'-20px', left:'50%', translate:'-50%', bg:'#fce7f3', color:'#9d174d' },
                { label:'< 7 day fill',   top:'50%', left:'-90px', translate:'translateY(-50%)', bg:'#fef9c3', color:'#854d0e' },
              ].map((o, i) => (
                <div key={i}
                  className="absolute text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md whitespace-nowrap"
                  style={{ background: o.bg, color: o.color, top: o.top, left: o.left, right: (o as any).right, bottom: (o as any).bottom, transform: o.translate.startsWith('translateY') ? o.translate : `translateX(${o.translate})` }}
                >
                  {o.label}
                </div>
              ))}
            </div>

            {/* Fields we cover */}
            <div className="mt-8 bg-white/[0.07] border border-white/10 rounded-2xl p-5 w-full max-w-sm">
              <p className="text-[11px] font-bold uppercase tracking-[2px] text-white/40 mb-3">Fields we cover</p>
              <div className="flex flex-wrap gap-2">
                {FIELDS.map(f => (
                  <span key={f} className="text-[11px] px-2.5 py-1 rounded-full border border-white/15 text-white/60">{f}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS ═══════════════════════════════ */}
      <section id="how" className="py-28 px-6 lg:px-10 bg-[#f4f8fb] relative overflow-hidden">
        <div className="absolute right-0 top-10 text-[160px] font-black text-[#0b3d6b]/[0.03] select-none pointer-events-none leading-none">WHS</div>
        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#1f8f3e] mb-3">The WHS Process</p>
            <h2 className="text-[clamp(26px,3vw,42px)] font-black text-[#061e35] leading-tight mb-4">
              How we connect talent<br />with opportunity
            </h2>
            <p className="text-[16px] text-gray-500 leading-relaxed font-light">
              We manage the entire recruitment pipeline — from candidate discovery to final placement.
              Companies get vetted talent. Candidates get matched opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-[28px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px border-t-2 border-dashed border-[#0b3d6b]/20 z-0" />
            {HOW_STEPS.map((s, i) => (
              <div key={s.num} className="relative z-10 group">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white shadow-md group-hover:scale-105 transition-transform"
                  style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
                  {s.icon}
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm group-hover:shadow-md group-hover:border-[#0b3d6b]/20 transition-all">
                  <span className="text-[11px] font-black text-[#0b3d6b]/30 tracking-widest mb-2 block">{s.num}</span>
                  <h3 className="text-[16px] font-bold text-[#061e35] mb-2">{s.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed font-light">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOR CANDIDATES ═════════════════════════════ */}
      <section id="candidates" className="py-28 px-6 lg:px-10 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — content */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#1f8f3e] mb-3">For Candidates</p>
            <h2 className="text-[clamp(26px,3vw,42px)] font-black text-[#061e35] leading-tight mb-5">
              Let us find the right<br />
              <span className="text-[#0b3d6b]">job for you</span>
            </h2>
            <p className="text-[15px] text-gray-500 leading-relaxed mb-8 font-light">
              Stop sending CVs into the void. Join our talent pool once and let WHS match you
              to companies that are actively looking for someone like you.
            </p>

            <ul className="space-y-5 mb-10">
              {FOR_CANDIDATES.map(item => (
                <li key={item.title} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-[#f4f8fb] flex items-center justify-center text-[18px] flex-shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-[#061e35] mb-0.5">{item.title}</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <Link to="/candidate/registration/basic"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-[#0b3d6b] to-[#0e8c7a] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              Register as a Candidate <ArrowRight size={15} />
            </Link>
            <p className="text-[12px] text-gray-400 mt-3">Free to join · No commitment · Confidential</p>
          </div>

          {/* Right — visual card */}
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-[#061e35] via-[#0b3d6b] to-[#0e4a3a] p-8 lg:p-10 shadow-[0_24px_80px_rgba(6,30,53,0.35)]">
              <div className="absolute -top-3 -right-3 bg-[#2fb852] rounded-2xl px-4 py-2.5 shadow-xl shadow-green-500/25">
                <p className="text-white font-black text-[18px] leading-none">Free</p>
                <p className="text-white/80 text-[10px] font-semibold">to register</p>
              </div>

              <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#5fda7e] mb-5">What you get</p>
              <div className="space-y-3">
                {[
                  'Access to 300+ hiring companies',
                  'Personal talent manager assigned to you',
                  'Interview coaching and CV review',
                  'Salary benchmarking insights',
                  'Confidential profile — only shared with consent',
                  'Zero cost to candidates, ever',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 size={15} className="text-[#2fb852] flex-shrink-0" />
                    <span className="text-[13px] text-white/75 font-light">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-3 gap-4">
                {[{ num:'5K+', label:'Active Candidates' }, { num:'300+', label:'Partner Cos.' }, { num:'92%', label:'Placement Rate' }].map(m => (
                  <div key={m.label}>
                    <p className="font-black text-white text-[22px] leading-none">{m.num}</p>
                    <p className="text-white/40 text-[10px] mt-1 leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ FOR COMPANIES ══════════════════════════════ */}
      <section id="companies" className="py-28 px-6 lg:px-10 bg-[#f4f8fb]">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl mb-14">
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#1f8f3e] mb-3">For Companies</p>
            <h2 className="text-[clamp(26px,3vw,42px)] font-black text-[#061e35] leading-tight mb-4">
              Stop searching. Start hiring.
            </h2>
            <p className="text-[16px] text-gray-500 leading-relaxed font-light">
              Tell us what you need. We present you with pre-vetted, interview-ready candidates —
              typically within 3–7 business days. No job boards. No screening. No wasted time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
            {FOR_COMPANIES.map(f => (
              <div key={f.title}
                className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#0b3d6b]/20 hover:shadow-[0_12px_40px_rgba(11,61,107,0.10)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-10 h-10 rounded-xl bg-[#e8f0f9] text-[#0b3d6b] flex items-center justify-center mb-4 group-hover:bg-[#0b3d6b] group-hover:text-white transition-all">
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-bold text-[#061e35] mb-2">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-[#0b3d6b] to-[#0e8c7a] rounded-3xl p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-[20px] font-black text-white mb-2">Ready to find your next great hire?</h3>
              <p className="text-[14px] text-white/60 font-light">Speak to our team and get a curated shortlist within days.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <a href="mailto:hire@workforcehs.com"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0b3d6b] text-[14px] font-bold hover:bg-gray-50 transition whitespace-nowrap">
                <Mail size={15} /> Email Us
              </a>
              <a href="tel:+94112345678"
                className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/30 text-white text-[14px] font-bold hover:bg-white/10 transition whitespace-nowrap">
                <Phone size={15} /> Call Us
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════ TESTIMONIALS ═══════════════════════════════ */}
      <section className="py-28 px-6 lg:px-10 bg-[#061e35] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background:'radial-gradient(circle, rgba(47,184,82,0.07) 0%, transparent 65%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#5fda7e] mb-3">What People Say</p>
              <h2 className="text-[clamp(26px,3vw,42px)] font-black text-white leading-tight">
                Trusted by candidates<br />and companies alike
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div key={t.name}
                className="group bg-white/[0.06] border border-white/10 rounded-2xl p-7 hover:bg-white/[0.10] hover:border-white/20 transition-all duration-300 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex gap-0.5 mb-5">
                  {Array(5).fill(null).map((_, i) => (
                    <Star key={i} size={13} className="fill-[#2fb852] text-[#2fb852]" />
                  ))}
                </div>
                <p className="text-[14px] text-white/70 leading-[1.8] mb-6 font-light">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-black flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-white">{t.name}</p>
                    <p className="text-[11px] text-white/40">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FINAL CTA ═══════════════════════════════════ */}
      <section className="relative py-24 px-6 lg:px-10 text-center overflow-hidden"
        style={{ background:'linear-gradient(135deg, #1f8f3e 0%, #0e8c7a 50%, #0b3d6b 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize:'50px 50px' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-white/60 mb-4">Get Started Today</p>
          <h2 className="text-[clamp(28px,4vw,50px)] font-black text-white leading-tight mb-5">
            Are you ready to take<br />the next step?
          </h2>
          <p className="text-[16px] text-white/70 mb-10 font-light">
            Whether you're a professional looking for your next role or a company in need of great talent —
            WHS is here to make it happen.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/candidate/registration/basic"
              className="px-8 py-4 rounded-xl bg-white text-[#0b3d6b] text-[15px] font-black hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all">
              Join as a Candidate
            </Link>
            <a href="mailto:hire@workforcehs.com"
              className="px-8 py-4 rounded-xl border-2 border-white/40 text-white text-[15px] font-bold hover:bg-white/10 hover:border-white/70 transition-all">
              Contact Our Team →
            </a>
          </div>
          <p className="text-[12px] text-white/40 mt-6">Candidate registration is free · No obligation</p>
        </div>
      </section>

      {/* ══════════════════════════ FOOTER ═══════════════════════════════════ */}
      <footer className="bg-[#04111e] pt-16 pb-8 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 mb-12 pb-12 border-b border-white/[0.07]">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20">
                  <img src="assets/logo.png" alt="WHS" className="w-full h-full object-cover" />
                </div>
                <span className="text-white font-bold text-[15px]">Workforce<span className="text-[#2fb852]">Hiring</span></span>
              </div>
              <p className="text-[12px] text-white/30 leading-relaxed mb-5 font-light">
                Sri Lanka's most trusted talent acquisition partner — connecting professionals with opportunities since 2018.
              </p>
              <div className="flex gap-2">
                {[Mail, Phone, Globe].map((Icon, i) => (
                  <button key={i}
                    className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-[#2fb852] hover:border-[#2fb852]/40 transition-all">
                    <Icon size={13} />
                  </button>
                ))}
              </div>
            </div>

            {/* Columns */}
            {FOOTER_COLS.map(col => (
              <div key={col.heading}>
                <h4 className="text-[11px] font-bold uppercase tracking-[2px] text-white mb-4">{col.heading}</h4>
                <ul className="space-y-2.5">
                  {col.links.map(link => (
                    <li key={link}
                      className="text-[12px] text-white/30 hover:text-[#2fb852] cursor-pointer transition-colors font-light">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 text-[12px] text-white/20">
            <span>© 2026 Workforce Hiring Solutions (Pvt) Ltd. All rights reserved.</span>
            <div className="flex gap-5">
              {['Privacy Policy','Terms of Service','Cookie Policy'].map(l => (
                <span key={l} className="hover:text-[#2fb852] cursor-pointer transition-colors">{l}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

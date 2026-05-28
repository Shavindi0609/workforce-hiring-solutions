import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Users,
  Shield,
  Zap,
  Award,
  ArrowRight,
  Star,
  MapPin,
  CheckCircle2,
  Building2,
  Clock3,
  ChevronRight,
  Phone,
  Mail,
  Globe,
} from 'lucide-react';



// ─── Brand tokens ─────────────────────────────────────────────────────────────
// Primary navy  : #0b3d6b   Mid navy : #1a5490   Teal bridge : #0e8c7a
// Brand green   : #2fb852   Dark green: #1f8f3e
// Off-white bg  : #f4f8fb   Light navy surface: #e8f0f9

// ─── Types ───────────────────────────────────────────────────────────────────
interface JobCard   { id:number; company:string; location:string; role:string; tags:string[]; salary:string; logoText:string; logoBg:string; logoText_:string; }
interface Feature   { icon:React.ReactNode; title:string; desc:string; accent:string; iconBg:string; }
interface Stat      { num:string; label:string; }
interface Step      { num:string; title:string; desc:string; }
interface WhyItem   { title:string; desc:string; }
interface Testi     { quote:string; name:string; role:string; initials:string; avatarFrom:string; avatarTo:string; }
interface FooterCol { heading:string; links:string[]; }

// ─── Static data ──────────────────────────────────────────────────────────────
const JOB_CARDS: JobCard[] = [
  { id:1, company:'TechCorp Lanka',    location:'Colombo · Remote',  role:'Senior UX Designer',  tags:['Remote','Full-time'],   salary:'LKR 180K – 230K', logoText:'TC', logoBg:'#dbeafe', logoText_:'#1d4ed8' },
  { id:2, company:'FinServ Global',    location:'Kandy · Hybrid',    role:'Data Analyst',         tags:['Hybrid','3 yrs exp'],   salary:'LKR 150K – 190K', logoText:'FG', logoBg:'#fce7f3', logoText_:'#9d174d' },
  { id:3, company:'Workforce Solutions', location:'Remote · Global', role:'Backend Engineer',     tags:['Remote','Senior'],      salary:'LKR 250K – 320K', logoText:'WS', logoBg:'#d1fae5', logoText_:'#065f46' },
];

const FEATURES: Feature[] = [
  { icon:<Users size={20}/>,  title:'Talent at Scale',      desc:'50,000+ pre-screened professionals across every domain — ready to hire.',           accent:'#1a5490', iconBg:'#e8f0f9' },
  { icon:<Shield size={20}/>, title:'Verified Profiles',    desc:'Background-checked, skill-tested, reference-verified. Zero guesswork.',              accent:'#1f8f3e', iconBg:'#dcfce7' },
  { icon:<Zap size={20}/>,    title:'Hire in 24 Hours',     desc:'AI-powered matching delivers a curated shortlist the same day you post.',            accent:'#0e8c7a', iconBg:'#ccfbf1' },
  { icon:<Award size={20}/>,  title:'Quality Guarantee',    desc:"Not the right fit? We'll source a replacement — free of charge, no questions asked.", accent:'#7c3aed', iconBg:'#ede9fe' },
];

const HERO_STATS: Stat[] = [
  { num:'50K+', label:'Verified Candidates' },
  { num:'2,400+', label:'Hiring Companies'  },
  { num:'98%',  label:'Client Satisfaction' },
  { num:'24 hr', label:'Average Time-to-Hire' },
];

const STEPS: Step[] = [
  { num:'01', title:'Post Your Role',        desc:'Describe the position in minutes using our smart intake form — we handle the rest.'           },
  { num:'02', title:'Receive Top Matches',   desc:'Within 24 hours, get a curated shortlist of pre-vetted candidates ranked by fit score.'     },
  { num:'03', title:'Interview & Hire',      desc:'Schedule, evaluate, and onboard entirely within the platform — with expert support throughout.' },
];

const WHY_ITEMS: WhyItem[] = [
  { title:'Trusted by 2M+ Businesses',          desc:'From early-stage startups to listed enterprises, companies across Sri Lanka depend on us.'           },
  { title:'Secure End-to-End Payments',          desc:'Milestone-based escrow with full dispute resolution — your money is always protected.'               },
  { title:'24 / 7 Dedicated Support',            desc:'Reach a real human any time. Our team averages a 4-minute first response.'                          },
  { title:'Integrated Collaboration Suite',      desc:'Video interviews, scorecards, offer letters, and onboarding checklists — all in one place.'          },
];

const TESTIMONIALS: Testi[] = [
  { quote:'We filled a critical engineering role in under 48 hours. The candidate quality was unlike anything we had seen on competing platforms.',       name:'Ashan Kumarasinghe', role:'CTO — TechCorp Lanka',  initials:'AK', avatarFrom:'#2fb852', avatarTo:'#0e8c7a' },
  { quote:'Pre-vetted profiles cut our screening time by 70%. Every person we interviewed was genuinely qualified and aligned with our culture.',         name:'Nilmini Perera',      role:'HR Director — FinServ Global', initials:'NP', avatarFrom:'#1a5490', avatarTo:'#2fb852' },
  { quote:"Twelve hires this year, twelve still with us. The support team held our hand the whole way — I can't recommend them highly enough.",           name:'Ravin Jayawardena',   role:'Founder — StartupHQ',          initials:'RJ', avatarFrom:'#0e8c7a', avatarTo:'#0b3d6b' },
];

const FOOTER_COLS: FooterCol[] = [
  { heading:'Company',    links:['About Us','Careers','Blog','Press','Partners']         },
  { heading:'Employers',  links:['Post a Job','Find Talent','Pricing','Enterprise','API'] },
  { heading:'Job Seekers',links:['Browse Jobs','My Profile','Salary Guide','Career Tips','Resume Builder'] },
  { heading:'Support',    links:['Help Center','Contact Us','Status','Community','Legal'] },
];

const TRUSTED = ['DIALOG','HAYLEYS','SLT MOBITEL','CARGILLS','MAS HOLDINGS','JOHN KEELLS'];

// ─── Floating job card ────────────────────────────────────────────────────────
function JobPill({ card, style }: { card: JobCard; style: React.CSSProperties }) {
  return (
    <div
      className="absolute bg-white rounded-2xl p-4 shadow-[0_8px_40px_rgba(0,0,0,0.18)] border border-white/80"
      style={style}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0"
          style={{ background: card.logoBg, color: card.logoText_ }}
        >
          {card.logoText}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-gray-800 truncate">{card.company}</p>
          <p className="text-[11px] text-gray-400 flex items-center gap-1 truncate">
            <MapPin size={9} className="flex-shrink-0" /> {card.location}
          </p>
        </div>
      </div>
      <p className="text-[14px] font-bold text-[#0b3d6b] mb-2 leading-tight">{card.role}</p>
      <div className="flex gap-1.5 flex-wrap mb-3">
        {card.tags.map(t => (
          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8f0f9] text-[#1a5490] font-medium">{t}</span>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[12px] font-bold text-[#1f8f3e]">{card.salary}</span>
        <button className="text-[11px] px-3 py-1 rounded-lg bg-[#0b3d6b] text-white font-semibold hover:bg-[#1a5490] transition-colors">
          Apply →
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div className="font-sans text-gray-800 antialiased overflow-x-hidden">

      {/* ════════════════════════════════ NAV ════════════════════════════════ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-[0_1px_24px_rgba(11,61,107,0.10)] border-b border-gray-100'
            : 'bg-white/70 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[68px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0b3d6b] to-[#2fb852] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-black text-[15px]">W</span>
            </div>
            <span className="font-bold text-[17px] tracking-tight text-[#0b3d6b]">
              Workforce<span className="text-[#2fb852]">Hiring</span>
            </span>
          </Link>

          {/* Nav links (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-7 text-[14px] font-medium text-gray-600">
            {['Find Talent','Browse Jobs','Pricing','Resources'].map(l => (
              <a key={l} href="#" className="hover:text-[#0b3d6b] transition-colors">{l}</a>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/signin"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl text-[14px] font-semibold text-[#0b3d6b] border border-[#0b3d6b]/30 hover:border-[#0b3d6b] hover:bg-[#0b3d6b]/5 transition-all"
            >
              Sign Up
            </Link>
            <Link
              to="/signin"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-[14px] font-semibold text-white bg-gradient-to-r from-[#0b3d6b] to-[#1a5490] hover:from-[#1a5490] hover:to-[#0e8c7a] shadow-md hover:shadow-lg transition-all"
            >
              Sign In <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════ HERO ════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-[68px] bg-[#061e35] overflow-hidden">

        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)',
            backgroundSize: '72px 72px',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(47,184,82,0.09) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(14,140,122,0.10) 0%, transparent 65%)' }} />
        {/* Diagonal accent strip */}
        <div className="absolute right-0 inset-y-0 w-[45%] hidden lg:block"
             style={{ background: 'linear-gradient(135deg, rgba(26,84,144,0.18) 0%, rgba(14,140,122,0.12) 100%)' }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 py-24 grid lg:grid-cols-2 gap-20 items-center">

          {/* ── Left ── */}
          <div>
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#2fb852]/40 bg-[#2fb852]/10 text-[#5fda7e] text-[12px] font-semibold tracking-wide mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2fb852] animate-pulse" />
              Sri Lanka's #1 Talent Marketplace
            </div>

            <h1 className="text-[clamp(38px,5vw,64px)] font-black text-white leading-[1.07] tracking-tight mb-6">
              Find the{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-[#2fb852]">Right Talent</span>
                <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#2fb852]/40 rounded-full" />
              </span>
              ,<br />
              Faster Than Ever.
            </h1>

            <p className="text-[17px] text-white/55 leading-relaxed max-w-[480px] mb-9 font-light">
              Connect with thousands of pre-vetted professionals. Our intelligent matching
              platform cuts time-to-hire by up to 70%.
            </p>

            {/* Search */}
            <div className="flex bg-white rounded-2xl overflow-hidden shadow-[0_12px_60px_rgba(0,0,0,0.35)] mb-8 ring-1 ring-white/20">
              <div className="flex items-center pl-5 text-gray-400">
                <Search size={18} />
              </div>
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                type="text"
                placeholder='Try "Senior React Developer"'
                className="flex-1 px-4 py-4 text-[15px] text-gray-700 outline-none placeholder-gray-400 bg-transparent"
              />
              <button className="m-1.5 px-7 py-3 rounded-xl bg-gradient-to-r from-[#2fb852] to-[#0e8c7a] text-white text-[14px] font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow">
                Find Talent
              </button>
            </div>

            {/* Quick pills */}
            <div className="flex flex-wrap gap-2 mb-10">
              <span className="text-[12px] text-white/40 self-center mr-1">Popular:</span>
              {['Product Manager','DevOps','UI Designer','Data Engineer','Finance Lead'].map(role => (
                <button
                  key={role}
                  onClick={() => setSearchVal(role)}
                  className="text-[12px] px-3 py-1 rounded-full border border-white/15 text-white/60 hover:border-[#2fb852]/60 hover:text-[#5fda7e] transition-all"
                >
                  {role}
                </button>
              ))}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
              {HERO_STATS.map(s => (
                <div key={s.label}>
                  <p className="text-[22px] font-black text-white leading-none">{s.num}</p>
                  <p className="text-[11px] text-white/40 mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right — floating cards ── */}
          <div className="relative h-[480px] hidden lg:block">
            <style>{`
              @keyframes f1{0%,100%{transform:rotate(-4deg) translateY(0)}50%{transform:rotate(-4deg) translateY(-12px)}}
              @keyframes f2{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
              @keyframes f3{0%,100%{transform:rotate(3deg) translateY(0)}50%{transform:rotate(3deg) translateY(-10px)}}
            `}</style>
            <JobPill card={JOB_CARDS[0]} style={{ width:300, left:0,   top:40,  animation:'f1 6s ease-in-out infinite' }} />
            <JobPill card={JOB_CARDS[1]} style={{ width:285, right:0,  top:110, animation:'f2 7.5s ease-in-out infinite', zIndex:10 }} />
            <JobPill card={JOB_CARDS[2]} style={{ width:275, left:30,  bottom:20, animation:'f3 8.5s ease-in-out infinite' }} />

            {/* Decorative ring */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-[#2fb852]/10 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-[#1a5490]/10 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ TRUSTED BY ══════════════════════════════ */}
      <div className="bg-[#f4f8fb] border-y border-[#dde8f0] py-5 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          <span className="text-[11px] font-bold uppercase tracking-[2px] text-gray-400 mr-2">Trusted by</span>
          {TRUSTED.map(name => (
            <span key={name} className="text-[13px] font-bold text-gray-400/70 hover:text-[#0b3d6b] transition-colors cursor-default tracking-wide">
              {name}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════ FEATURES ════════════════════════════════ */}
      <section className="py-28 px-6 lg:px-10 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="max-w-2xl mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#1f8f3e] mb-3">What you get</p>
            <h2 className="text-[clamp(28px,3.2vw,44px)] font-black text-[#061e35] leading-tight mb-4">
              Everything you need<br />to hire smarter, not harder
            </h2>
            <p className="text-[16px] text-gray-500 leading-relaxed font-light">
              From first search to signed offer — our platform handles every stage of your hiring journey with precision.
            </p>
          </div>

          {/* Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-gray-100 bg-white p-7 hover:border-transparent hover:shadow-[0_12px_48px_rgba(11,61,107,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden"
              >
                {/* Top accent bar */}
                <div
                  className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, ${f.accent}, transparent)` }}
                />
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                  style={{ background: f.iconBg, color: f.accent }}
                >
                  {f.icon}
                </div>
                <h3 className="text-[15px] font-bold text-[#061e35] mb-2">{f.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed font-light">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS ═══════════════════════════════ */}
      <section className="py-28 px-6 lg:px-10 bg-[#f4f8fb] relative overflow-hidden">
        {/* Decorative large number bg */}
        <div className="absolute right-0 top-10 text-[180px] font-black text-[#0b3d6b]/[0.03] select-none pointer-events-none leading-none">
          HOW
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="max-w-xl mb-16">
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#1f8f3e] mb-3">How it works</p>
            <h2 className="text-[clamp(28px,3.2vw,44px)] font-black text-[#061e35] leading-tight mb-4">
              Three steps to your<br />next great hire
            </h2>
            <p className="text-[16px] text-gray-500 leading-relaxed font-light">
              We've stripped away the complexity. Great hiring should take days, not months.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Dashed connector */}
            <div className="hidden md:block absolute top-[28px] left-[calc(16.67%+28px)] right-[calc(16.67%+28px)] h-px border-t-2 border-dashed border-[#0b3d6b]/20 z-0" />

            {STEPS.map((s, i) => (
              <div key={s.num} className="relative z-10 group">
                {/* Step bubble */}
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                     style={{ background: `linear-gradient(135deg, #0b3d6b ${i===0?'':'30%'}, ${i===0?'#1a5490':i===1?'#0e8c7a':'#2fb852'})` }}>
                  <span className="text-white font-black text-[15px] tracking-tighter">{s.num}</span>
                </div>
                {/* Card */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm group-hover:shadow-md group-hover:border-[#0b3d6b]/20 transition-all duration-300">
                  <h3 className="text-[16px] font-bold text-[#061e35] mb-2">{s.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed font-light">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════ WHY CHOOSE US ══════════════════════════════ */}
      <section className="py-28 px-6 lg:px-10 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">

          {/* ── Metric panel ── */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#061e35] via-[#0b3d6b] to-[#0e4a3a] p-10 lg:p-12 min-h-[440px] flex flex-col justify-between shadow-[0_24px_80px_rgba(6,30,53,0.45)]">
              {/* Inner glow */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
                   style={{ background: 'radial-gradient(circle, rgba(47,184,82,0.15) 0%, transparent 65%)' }} />

              <div className="relative z-10">
                <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#5fda7e] mb-4">Our Impact</p>
                <p className="font-black text-white leading-none mb-2" style={{ fontSize: 'clamp(52px,6vw,80px)' }}>
                  2M<span className="text-[#2fb852]">+</span>
                </p>
                <p className="text-white/45 text-[14px]">Professionals placed worldwide</p>
              </div>

              <div className="relative z-10 grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
                {[
                  { num:'98%',  label:'Satisfaction'      },
                  { num:'24hr', label:'Avg Time-to-Hire'  },
                  { num:'4.9',  label:'App Store Rating'  },
                ].map(m => (
                  <div key={m.label}>
                    <p className="font-black text-white text-[28px] leading-none">{m.num}</p>
                    <p className="text-white/40 text-[11px] mt-1 leading-tight">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-[#2fb852] rounded-2xl px-4 py-3 shadow-xl shadow-green-500/25">
              <p className="text-white font-black text-[20px] leading-none">★ 4.9</p>
              <p className="text-white/80 text-[10px] font-semibold">Trustpilot</p>
            </div>
          </div>

          {/* ── Content ── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#1f8f3e] mb-3">Why choose us</p>
            <h2 className="text-[clamp(26px,3vw,42px)] font-black text-[#061e35] leading-tight mb-8">
              Built for businesses<br />that can't afford a<br />
              <span className="text-[#0b3d6b]">wrong hire</span>
            </h2>

            <ul className="space-y-6 mb-10">
              {WHY_ITEMS.map(item => (
                <li key={item.title} className="flex gap-4 group">
                  <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[#dcfce7] flex items-center justify-center group-hover:bg-[#2fb852] transition-colors">
                    <CheckCircle2 size={14} className="text-[#1f8f3e] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[#061e35] mb-1">{item.title}</h4>
                    <p className="text-[13px] text-gray-500 leading-relaxed font-light">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold text-white bg-gradient-to-r from-[#0b3d6b] to-[#0e8c7a] shadow-lg shadow-blue-900/25 hover:shadow-xl hover:shadow-blue-900/35 hover:-translate-y-0.5 transition-all"
              >
                Get Started Free <ArrowRight size={15} />
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold text-[#0b3d6b] border-2 border-[#0b3d6b]/25 hover:border-[#0b3d6b] hover:bg-[#0b3d6b]/5 transition-all">
                Watch Demo <span className="text-[16px]">▶</span>
              </button>
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
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[3px] text-[#5fda7e] mb-3">Client Stories</p>
              <h2 className="text-[clamp(28px,3.2vw,44px)] font-black text-white leading-tight">
                Trusted by industry<br />leaders across Sri Lanka
              </h2>
            </div>
            <button className="self-start md:self-auto inline-flex items-center gap-2 text-[13px] font-semibold text-[#5fda7e] border border-[#2fb852]/30 px-4 py-2 rounded-xl hover:bg-[#2fb852]/10 transition-colors whitespace-nowrap">
              Read All Stories <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                className="group relative bg-white/[0.06] border border-white/10 rounded-2xl p-7 hover:bg-white/[0.10] hover:border-white/20 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="flex gap-0.5 mb-5">
                  {Array(5).fill(null).map((_, i) => (
                    <Star key={i} size={13} className="fill-[#2fb852] text-[#2fb852]" />
                  ))}
                </div>
                <p className="text-[14px] text-white/70 leading-[1.8] mb-6 font-light">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-white/10">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[12px] font-black flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.avatarFrom}, ${t.avatarTo})` }}
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

      {/* ═══════════════════════ CTA BANNER ══════════════════════════════════ */}
      <section className="relative py-24 px-6 lg:px-10 text-center overflow-hidden"
               style={{ background:'linear-gradient(135deg, #1f8f3e 0%, #0e8c7a 50%, #0b3d6b 100%)' }}>
        <div className="absolute inset-0 opacity-[0.06]"
             style={{ backgroundImage:'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize:'50px 50px' }} />
        <div className="relative z-10 max-w-3xl mx-auto">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-white/60 mb-4">Start Today</p>
          <h2 className="text-[clamp(30px,4vw,52px)] font-black text-white leading-tight mb-5">
            Ready to build your<br />dream team?
          </h2>
          <p className="text-[17px] text-white/70 mb-10 font-light">
            Join 2,400+ companies already hiring smarter on Workforce Hiring Solutions.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-xl bg-white text-[#0b3d6b] text-[15px] font-black hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] transition-all"
            >
              Post a Job — It's Free
            </Link>
            <button className="px-8 py-4 rounded-xl border-2 border-white/40 text-white text-[15px] font-bold hover:bg-white/10 hover:border-white/70 transition-all">
              Browse Talent →
            </button>
          </div>
          <p className="text-[12px] text-white/40 mt-6">No credit card required · Cancel any time</p>
        </div>
      </section>

      {/* ═══════════════════════════ FOOTER ══════════════════════════════════ */}
      <footer className="bg-[#04111e] pt-16 pb-8 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">

          {/* Top row */}
          <div className="grid md:grid-cols-6 gap-10 mb-12 pb-12 border-b border-white/[0.07]">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0b3d6b] to-[#2fb852] flex items-center justify-center shadow">
                  <span className="text-white font-black text-[14px]">W</span>
                </div>
                <span className="text-white font-bold text-[16px]">
                  Workforce<span className="text-[#2fb852]">Hiring</span>
                </span>
              </div>
              <p className="text-[13px] text-white/35 leading-relaxed mb-6 max-w-[220px] font-light">
                Sri Lanka's most trusted talent marketplace. Connecting great companies with exceptional professionals since 2018.
              </p>
              {/* Social icons */}
              <div className="flex gap-3">
                {[Star, Globe].map((Icon, i) => (
                  <button key={i} className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-[#2fb852] hover:border-[#2fb852]/40 transition-all">
                    <Icon size={14} />
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
                        className="text-[13px] text-white/35 hover:text-[#2fb852] cursor-pointer transition-colors font-light">
                      {link}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div className="flex flex-wrap justify-between items-center gap-4 text-[12px] text-white/25">
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

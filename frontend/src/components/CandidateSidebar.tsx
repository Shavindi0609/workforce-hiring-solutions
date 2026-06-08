import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Upload,
} from 'lucide-react';

interface CandidateProfile {
  name: string;
  email: string;
  interested_field: string;
  status: string;
  cv_url: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const navItems = [
  { label: 'Dashboard',   to: '/candidate/candidate-dashboard',  icon: LayoutDashboard },
  { label: 'My Profile',  to: '/candidate/profile',    icon: User },
  { label: 'My CV', to: '/candidate/cv', icon: Upload },
  { label: 'Jobs',        to: '/candidate/jobs',       icon: Briefcase },
//   { label: 'Documents',   to: '/candidate/documents',  icon: FileText },
//   { label: 'Notifications', to: '/candidate/notifications', icon: Bell },
  { label: 'Settings',    to: '/candidate/edit-profile',             icon: Settings },
];

export default function CandidateSidebar() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('candidates')
        .select('name, email, interested_field, status, cv_url')
        .eq('id', user.id)
        .single();
      if (data) setProfile(data);
    }
    load();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/signin');
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-white border-r border-slate-200 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          : <ChevronLeft  className="w-3.5 h-3.5 text-slate-500" />}
      </button>

      {/* Brand */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center px-0' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Briefcase className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-slate-800 leading-tight">
            Workforce<br />
            <span className="text-blue-600 font-bold">Hiring</span>
          </span>
        )}
      </div>

      {/* Profile mini card */}
      <div className={`px-3 py-4 border-b border-slate-100 ${collapsed ? 'flex justify-center' : ''}`}>
        {profile ? (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {getInitials(profile.name)}
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{profile.name}</p>
                <p className="text-xs text-slate-400 truncate">{profile.interested_field || profile.email}</p>
                <span className={`inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                  profile.status === 'Actively Looking'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {profile.status || 'Active'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse flex-shrink-0" />
            {!collapsed && <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />}
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Menu
          </p>
        )}
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} strokeWidth={1.8} />
                {!collapsed && <span>{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* CV status hint */}
      {!collapsed && profile && !profile.cv_url && (
        <div className="mx-3 mb-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <p className="text-xs font-medium text-amber-700">CV not uploaded</p>
          <p className="text-[10px] text-amber-500 mt-0.5">Upload your CV to improve visibility</p>
          <button
            onClick={() => navigate('/candidate/registration/upload')}
            className="mt-2 text-[10px] font-bold text-amber-700 hover:underline"
          >
            Upload now →
          </button>
        </div>
      )}

      {/* Sign out */}
      <div className={`p-3 border-t border-slate-100 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleSignOut}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" strokeWidth={1.8} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

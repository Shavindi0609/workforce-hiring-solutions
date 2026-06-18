// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../supabaseClient';

// interface CandidateProfile {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   country_code: string;
//   dob: string;
//   linkedin: string;
//   age: number;
//   interested_field: string;
//   years_of_experience: string;
//   skills: string[];
//   status: string;
//   availability: string;
//   willing_to_contact: boolean;
//   salary_range: string;
//   cv_url: string;
//   cv_filename: string;
//   created_at: string;
// }

// function getInitials(name: string): string {
//   return name
//     .split(' ')
//     .map((n) => n[0])
//     .join('')
//     .toUpperCase()
//     .slice(0, 2);
// }

// function getAvailabilityColor(availability: string): string {
//   const map: Record<string, string> = {
//     Immediate: 'bg-purple-100 text-purple-700',
//     '2 Weeks': 'bg-blue-100 text-blue-700',
//     '1 Month': 'bg-yellow-100 text-yellow-700',
//     '2 Months': 'bg-orange-100 text-orange-700',
//     '3 Months': 'bg-red-100 text-red-700',
//   };
//   return map[availability] || 'bg-gray-100 text-gray-600';
// }

// export default function CandidateDashboard() {
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState<CandidateProfile | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchProfile() {
//       try {
//         const {
//           data: { user },
//           error: authError,
//         } = await supabase.auth.getUser();

//         if (authError || !user) {
//           navigate('/signin');
//           return;
//         }

//         const { data, error: dbError } = await supabase
//           .from('candidates')
//           .select('*')
//           .eq('id', user.id)
//           .single();

//         if (dbError) throw dbError;
//         setProfile(data);
//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchProfile();
//   }, [navigate]);

//   if (loading) return <div>Loading...</div>;
//   if (error || !profile) return <div>Error...</div>;

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-slate-500">Loading your dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !profile) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="text-center">
//           <p className="text-slate-600 mb-4">{error || 'Profile not found.'}</p>
//           <button
//             onClick={() => navigate('/candidate/registration/basic')}
//             className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
//           >
//             Complete Registration
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const completionFields = [
//     profile.name,
//     profile.email,
//     profile.phone,
//     profile.dob,
//     profile.linkedin,
//     profile.interested_field,
//     profile.years_of_experience,
//     profile.skills?.length > 0,
//     profile.status,
//     profile.availability,
//     profile.salary_range,
//     profile.cv_url,
//   ];
//   const completionScore = Math.round(
//     (completionFields.filter(Boolean).length / completionFields.length) * 100
//   );

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans">
//       {/* <Header 
//         userName={profile.name} 
//         userEmail={profile.email} 
//       /> */}
//       <div className="max-w-6xl mx-auto">

//         {/* ===== TOP BAR ===== */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-xl font-semibold text-slate-800">
//               Good day, {profile.name.split(' ')[0]} 👋
//             </h1>
//             <p className="text-sm text-slate-500 mt-0.5">
//               Here's an overview of your candidate profile
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <button
//               onClick={() => navigate('/candidate/edit-profile')}
//               className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
//             >
//               ✏️ Edit Profile
//             </button>
//             {profile.cv_url && (
//               <a
//                 href={profile.cv_url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
//               >
//                 📄 View CV
//               </a>
//             )}
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

//           {/* ===== LEFT COLUMN ===== */}
//           <div className="flex flex-col gap-5">

//             {/* Profile Card */}
//             <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
//               <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-semibold mx-auto mb-3">
//                 {getInitials(profile.name)}
//               </div>
//               <h2 className="text-base font-semibold text-slate-800">{profile.name}</h2>
//               <p className="text-sm text-slate-500 mt-0.5">{profile.interested_field || '—'}</p>

//               {/* Status badge */}
//               <div className="mt-3 flex justify-center">
//                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
//                   profile.status === 'Actively Looking'
//                     ? 'bg-green-100 text-green-700'
//                     : 'bg-orange-100 text-orange-700'
//                 }`}>
//                   <span className={`w-1.5 h-1.5 rounded-full ${
//                     profile.status === 'Actively Looking' ? 'bg-green-500' : 'bg-orange-500'
//                   }`} />
//                   {profile.status || 'Not set'}
//                 </span>
//               </div>

//               <hr className="my-4 border-slate-100" />

//               {/* Profile details */}
//               <div className="text-left space-y-2.5">
//                 {[
//                   { icon: '✉️', value: profile.email },
//                   { icon: '📞', value: `${profile.country_code || ''} ${profile.phone || ''}`.trim() || '—' },
//                   { icon: '🎂', value: profile.dob ? `Born ${profile.dob}` : '—' },
//                   { icon: '⏱️', value: profile.years_of_experience || '—' },
//                   { icon: '💰', value: profile.salary_range || '—' },
//                   {
//                     icon: '📅',
//                     value: profile.availability
//                       ? `Available: ${profile.availability}`
//                       : '—',
//                   },
//                 ].map((item, i) => (
//                   <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
//                     <span className="text-base">{item.icon}</span>
//                     <span className="truncate">{item.value}</span>
//                   </div>
//                 ))}

//                 {profile.linkedin && (
//                   <a
//                     href={profile.linkedin}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
//                   >
//                     <svg width="15" height="15" viewBox="0 0 24 24" fill="#0077b5">
//                       <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
//                     </svg>
//                     LinkedIn Profile
//                   </a>
//                 )}
//               </div>

//               <hr className="my-4 border-slate-100" />

//               {/* Profile completion */}
//               <div>
//                 <div className="flex justify-between text-xs text-slate-500 mb-1.5">
//                   <span>Profile completeness</span>
//                   <span className="font-medium text-slate-700">{completionScore}%</span>
//                 </div>
//                 <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-blue-500 rounded-full transition-all"
//                     style={{ width: `${completionScore}%` }}
//                   />
//                 </div>
//                 {completionScore < 100 && (
//                   <p className="text-xs text-slate-400 mt-1.5">
//                     {completionScore < 80
//                       ? 'Complete your profile to get noticed by recruiters'
//                       : 'Almost there! A few more details to go'}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Skills Card */}
//             <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
//               <h3 className="text-sm font-semibold text-slate-700 mb-3">Skills</h3>
//               {profile.skills && profile.skills.length > 0 ? (
//                 <div className="flex flex-wrap gap-2">
//                   {profile.skills.map((skill) => (
//                     <span
//                       key={skill}
//                       className="px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200"
//                     >
//                       {skill}
//                     </span>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-sm text-slate-400">No skills added yet.</p>
//               )}
//             </div>
//           </div>

//           {/* ===== RIGHT COLUMNS ===== */}
//           <div className="lg:col-span-2 flex flex-col gap-5">

//             {/* Stats Row */}
//             <div className="grid grid-cols-3 gap-4">
//               {[
//                 { label: 'Profile views', value: '—', sub: 'Coming soon' },
//                 { label: 'Days active', value: profile.created_at
//                     ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / 86400000)
//                     : '—',
//                   sub: 'Since joining' },
//                 { label: 'CV uploaded', value: profile.cv_url ? '✓' : '✗', sub: profile.cv_filename || 'No CV' },
//               ].map((stat, i) => (
//                 <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
//                   <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
//                   <p className="text-2xl font-semibold text-slate-800">{stat.value}</p>
//                   <p className="text-xs text-slate-400 mt-1 truncate">{stat.sub}</p>
//                 </div>
//               ))}
//             </div>

//             {/* Professional Summary */}
//             <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
//               <h3 className="text-sm font-semibold text-slate-700 mb-4">Professional summary</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 {[
//                   { label: 'Interested field', value: profile.interested_field || '—', icon: '💼' },
//                   { label: 'Experience', value: profile.years_of_experience || '—', icon: '⏱️' },
//                   { label: 'Availability', value: profile.availability || '—', icon: '📅' },
//                   { label: 'Salary range', value: profile.salary_range || '—', icon: '💰' },
//                 ].map((item, i) => (
//                   <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
//                     <span className="text-lg">{item.icon}</span>
//                     <div>
//                       <p className="text-xs text-slate-500">{item.label}</p>
//                       <p className="text-sm font-medium text-slate-800 mt-0.5">{item.value}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Availability & Preferences */}
//             <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
//               <h3 className="text-sm font-semibold text-slate-700 mb-4">Preferences</h3>
//               <div className="flex flex-wrap gap-3">
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs text-slate-500">Availability:</span>
//                   <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getAvailabilityColor(profile.availability)}`}>
//                     {profile.availability || 'Not set'}
//                   </span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <span className="text-xs text-slate-500">Open to contact:</span>
//                   <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
//                     profile.willing_to_contact
//                       ? 'bg-green-100 text-green-700'
//                       : 'bg-slate-100 text-slate-600'
//                   }`}>
//                     {profile.willing_to_contact ? 'Yes' : 'No'}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* CV Section */}
//             <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
//               <h3 className="text-sm font-semibold text-slate-700 mb-4">Curriculum Vitae</h3>
//               {profile.cv_url ? (
//                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-lg">
//                       📄
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-700 truncate max-w-xs">
//                         {profile.cv_filename || 'My CV'}
//                       </p>
//                       <p className="text-xs text-slate-400">Uploaded successfully</p>
//                     </div>
//                   </div>
//                   <a
//                     href={profile.cv_url}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
//                   >
//                     View
//                   </a>
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
//                   <p className="text-sm text-slate-500">No CV uploaded yet.</p>
//                   <button
//                     onClick={() => navigate('/candidate/registration/upload')}
//                     className="px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
//                   >
//                     Upload CV
//                   </button>
//                 </div>
//               )}
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { UserPlus, ArrowRight, CheckCircle } from 'lucide-react';

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  dob: string;
  linkedin: string;
  age: number;
  interested_field: string;
  years_of_experience: string;
  skills: string[];
  status: string;
  availability: string;
  willing_to_contact: boolean;
  salary_range: string;
  cv_url: string;
  cv_filename: string;
  created_at: string;
}

function getInitials(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvailabilityColor(availability: string): string {
  const map: Record<string, string> = {
    Immediate:  'bg-purple-100 text-purple-700',
    '2 Weeks':  'bg-blue-100 text-blue-700',
    '1 Month':  'bg-yellow-100 text-yellow-700',
    '2 Months': 'bg-orange-100 text-orange-700',
    '3 Months': 'bg-red-100 text-red-700',
  };
  return map[availability] || 'bg-gray-100 text-gray-600';
}

// ─── No-profile prompt ───────────────────────────────────────────────────────
function NoProfilePrompt({ userName }: { userName: string }) {
  const navigate = useNavigate();

  const steps = [
    { label: 'Basic Information',    desc: 'Your name, email, date of birth' },
    { label: 'Professional Info',    desc: 'Field of interest and experience' },
    { label: 'Skills & Experience',  desc: 'Your technical and soft skills' },
    { label: 'Additional Details',   desc: 'Availability, salary range, status' },
    { label: 'Upload CV',            desc: 'Attach your latest CV' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Welcome, {userName || 'there'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-2 px-2">
            You're signed in but haven't created a candidate profile yet.
            Complete your profile to join our talent pool.
          </p>
        </div>

        {/* Steps preview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm mb-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Profile setup — 5 steps
          </p>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] sm:text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{step.label}</p>
                  <p className="text-xs text-slate-400 truncate">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-6">
          <p className="text-xs font-semibold text-blue-700 mb-3">Why complete your profile?</p>
          <div className="space-y-2">
            {[
              'Get discovered by top recruiters',
              'Receive matched job opportunities',
              'Showcase your skills and experience',
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-blue-800">
                <CheckCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span className="truncate">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/candidate/registration/basic')}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition text-sm shadow-md"
        >
          Register as Candidate
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-center text-xs text-slate-400 mt-3">
          Takes about 5 minutes to complete
        </p>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile]   = useState<CandidateProfile | null>(null);
  const [authName, setAuthName] = useState('');
  const [loading, setLoading]   = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) { navigate('/signin'); return; }

        setAuthName(
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          ''
        );

        const { data, error: dbError } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (dbError) throw dbError;

        if (data) {
          setProfile(data);
          setHasProfile(true);
        } else {
          setHasProfile(false);
        }
      } catch (err: any) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [navigate]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ── No candidate profile ──
  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <NoProfilePrompt userName={authName} />
      </div>
    );
  }

  // ── Profile exists ──
  const completionFields = [
    profile!.name, profile!.email, profile!.phone, profile!.dob,
    profile!.linkedin, profile!.interested_field, profile!.years_of_experience,
    profile!.skills?.length > 0, profile!.status, profile!.availability,
    profile!.salary_range, profile!.cv_url,
  ];
  const completionScore = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">

        {/* TOP BAR - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-800">
              Good day, {profile!.name.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Here's an overview of your candidate profile
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate('/candidate/edit-profile')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              ✏️ <span className="hidden xs:inline">Edit Profile</span>
              <span className="xs:hidden">Edit</span>
            </button>
            {profile!.cv_url && (
              <a
                href={profile!.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition"
              >
                📄 <span className="hidden xs:inline">View CV</span>
                <span className="xs:hidden">CV</span>
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4 sm:gap-5">

            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 text-center shadow-sm">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg sm:text-xl font-semibold mx-auto mb-3">
                {getInitials(profile!.name)}
              </div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">{profile!.name}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{profile!.interested_field || '—'}</p>

              <div className="mt-3 flex justify-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                  profile!.status === 'Actively Looking'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    profile!.status === 'Actively Looking' ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  {profile!.status || 'Not set'}
                </span>
              </div>

              <hr className="my-4 border-slate-100" />

              <div className="text-left space-y-2.5">
                {[
                  { icon: '✉️', value: profile!.email },
                  { icon: '📞', value: `${profile!.country_code || ''} ${profile!.phone || ''}`.trim() || '—' },
                  { icon: '🎂', value: profile!.dob ? `Born ${profile!.dob}` : '—' },
                  { icon: '⏱️', value: profile!.years_of_experience || '—' },
                  { icon: '💰', value: profile!.salary_range || '—' },
                  { icon: '📅', value: profile!.availability ? `Available: ${profile!.availability}` : '—' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-base flex-shrink-0">{item.icon}</span>
                    <span className="truncate">{item.value}</span>
                  </div>
                ))}

                {profile!.linkedin && (
                  <a
                    href={profile!.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline truncate"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="#0077b5" className="flex-shrink-0">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
                    </svg>
                    <span className="truncate">LinkedIn Profile</span>
                  </a>
                )}
              </div>

              <hr className="my-4 border-slate-100" />

              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Profile completeness</span>
                  <span className="font-medium text-slate-700">{completionScore}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
                {completionScore < 100 && (
                  <p className="text-xs text-slate-400 mt-1.5">
                    {completionScore < 80
                      ? 'Complete your profile to get noticed by recruiters'
                      : 'Almost there! A few more details to go'}
                  </p>
                )}
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Skills</h3>
              {profile!.skills && profile!.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile!.skills.map((skill) => (
                    <span key={skill} className="px-2.5 sm:px-3 py-1 bg-slate-100 text-slate-700 text-xs rounded-full border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No skills added yet.</p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMNS */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-5">

            {/* Stats Row - Responsive Grid */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Profile views', value: '—', sub: 'Coming soon' },
                {
                  label: 'Days active',
                  value: profile!.created_at
                    ? Math.floor((Date.now() - new Date(profile!.created_at).getTime()) / 86400000)
                    : '—',
                  sub: 'Since joining',
                },
                {
                  label: 'CV uploaded',
                  value: profile!.cv_url ? '✓' : '✗',
                  sub: profile!.cv_filename || 'No CV',
                },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-sm">
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-1">{stat.label}</p>
                  <p className="text-xl sm:text-2xl font-semibold text-slate-800">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-1 truncate">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Professional Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Professional summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: 'Interested field', value: profile!.interested_field || '—', icon: '💼' },
                  { label: 'Experience',        value: profile!.years_of_experience || '—', icon: '⏱️' },
                  { label: 'Availability',      value: profile!.availability || '—',        icon: '📅' },
                  { label: 'Salary range',      value: profile!.salary_range || '—',        icon: '💰' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Preferences</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500">Availability:</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getAvailabilityColor(profile!.availability)}`}>
                    {profile!.availability || 'Not set'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500">Open to contact:</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    profile!.willing_to_contact ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {profile!.willing_to_contact ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* CV Section - Responsive */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Curriculum Vitae</h3>
              {profile!.cv_url ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-lg flex-shrink-0">📄</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate max-w-[150px] sm:max-w-xs">
                        {profile!.cv_filename || 'My CV'}
                      </p>
                      <p className="text-xs text-slate-400">Uploaded successfully</p>
                    </div>
                  </div>
                  <a
                    href={profile!.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto text-center px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    View
                  </a>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                  <p className="text-sm text-slate-500">No CV uploaded yet.</p>
                  <button
                    onClick={() => navigate('/candidate/cv')}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Upload CV
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
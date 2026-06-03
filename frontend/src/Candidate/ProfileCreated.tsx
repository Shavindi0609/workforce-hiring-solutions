import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiMail, FiUser, FiFileText, FiDatabase, FiHeadphones, FiCopy } from "react-icons/fi";
import { supabase } from "../supabaseClient";

interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  dob: string;
  age: number;
  linkedin: string;
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
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function generateCandidateId(id: string, createdAt: string): string {
  const year = new Date(createdAt).getFullYear();
  const shortId = id.replace(/-/g, "").slice(0, 4).toUpperCase();
  return `WHS-${year}-${shortId}`;
}

function calcCompletion(p: CandidateProfile): number {
  const fields = [
    p.name, p.email, p.phone, p.dob, p.linkedin,
    p.interested_field, p.years_of_experience,
    p.skills?.length > 0, p.status, p.availability,
    p.salary_range, p.cv_url,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export default function ProfileCreated() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/signin"); return; }

      const { data } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    fetchProfile();
  }, [navigate]);

  const candidateId = profile
    ? generateCandidateId(profile.id, profile.created_at)
    : "WHS-2026-????";

  const completion = profile ? calcCompletion(profile) : 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(candidateId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-screen w-full bg-[#f8f9fc] font-sans">

      {/* ===== SIDEBAR — unchanged ===== */}
      <aside className="w-[30%] bg-gradient-to-br from-[#0b5d90] to-[#39a75f] text-white p-10 flex flex-col justify-between">
        <div className="font-bold tracking-widest text-sm">WORKFORCE HIRING SOLUTIONS</div>
        <div>
          <h1 className="text-4xl font-bold leading-tight">
            You're Now Part of Our <br />
            <span className="text-[#9ce44b]">Global Talent Network!</span>
          </h1>
          <p className="mt-4 text-sm text-white/90">
            We're excited to have you with us. Your profile helps our hiring partners discover the right talent for future opportunities.
          </p>
          <div className="mt-8 p-6 bg-white/10 rounded-2xl border border-white/20 text-sm">
            🔒 Your information is safe, secure and will never be shared publicly.
          </div>
        </div>
        <div />
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="w-[70%] p-10 flex flex-col gap-6 overflow-y-auto">

        <div className="flex justify-end items-center text-sm text-gray-500 gap-2">
          <FiHeadphones /> Need Help?{" "}
          <span className="font-semibold text-gray-800">support@workforcehs.com</span>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border p-10 flex flex-col gap-8">

          {/* Header */}
          <div className="text-center">
            <FiCheckCircle className="text-[#39a75f] text-6xl mx-auto" />
            <h2 className="text-3xl font-bold text-gray-800 mt-4">Welcome to Our Talent Network!</h2>
            <p className="text-gray-500 mt-2">Your profile has been successfully added to our candidate pool.</p>
          </div>

          {/* Email confirmation banner */}
          {profile && (
            <div className="bg-[#f0f7ff] text-[#0b5d90] p-4 rounded-xl flex items-center justify-center gap-2 text-sm border border-blue-100">
              <FiMail />
              A confirmation has been sent to <b>{profile.email}</b>
            </div>
          )}

          {/* Status cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: FiUser,     label: "Profile Submitted",       desc: "Your details have been successfully submitted." },
              { icon: FiFileText, label: "CV Uploaded",              desc: "Your CV has been uploaded successfully." },
              { icon: FiDatabase, label: "Candidate Record Created", desc: "Your profile is now added to our secure database." },
            ].map((item, i) => (
              <div key={i} className="border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
                <item.icon className="mx-auto text-[#39a75f] mb-3 text-2xl" />
                <p className="font-bold text-sm text-gray-800">{item.label}</p>
                <p className="text-[10px] text-gray-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* ===== REAL CANDIDATE DATA ===== */}
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-7 h-7 border-2 border-[#0b5d90] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profile ? (
            <>
              {/* Candidate ID + Completion */}
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-gray-100 rounded-2xl p-6">
                  <p className="text-xs text-gray-500 mb-1">Your Candidate ID</p>
                  <div className="flex justify-between items-center">
                    <b className="text-xl text-[#0b5d90]">{candidateId}</b>
                    <button onClick={handleCopy} title="Copy ID">
                      <FiCopy className={`cursor-pointer transition ${copied ? "text-green-500" : "text-gray-400"}`} />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-500 mt-1">Copied!</p>}
                </div>
                <div className="border border-gray-100 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500">Profile Strength</p>
                    <b className="text-xl text-[#39a75f]">{completion}%</b>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#39a75f] rounded-full"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/settings")}
                    className="text-xs font-bold text-[#0b5d90] hover:underline"
                  >
                    Update Profile →
                  </button>
                </div>
              </div>

              {/* Profile summary */}
              <div className="border border-gray-100 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-[#e0f0ff] text-[#0b5d90] flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {getInitials(profile.name)}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">{profile.name}</p>
                    <p className="text-sm text-gray-500">{profile.interested_field || "—"}</p>
                    <span className={`inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      profile.status === "Actively Looking"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}>
                      {profile.status || "Not set"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Email",       value: profile.email },
                    { label: "Phone",       value: `${profile.country_code || ""} ${profile.phone || ""}`.trim() || "—" },
                    { label: "Date of birth", value: profile.dob || "—" },
                    { label: "Age",         value: profile.age ? `${profile.age} years` : "—" },
                    { label: "Experience",  value: profile.years_of_experience || "—" },
                    { label: "Availability", value: profile.availability || "—" },
                    { label: "Salary range", value: profile.salary_range || "—" },
                    { label: "Open to contact", value: profile.willing_to_contact ? "Yes" : "No" },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl px-4 py-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-0.5 truncate">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                {profile.skills && profile.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-[#e0f0ff] text-[#0b5d90] px-3 py-1 rounded-full font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CV */}
                {profile.cv_url && (
                  <div className="mt-4 flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FiFileText className="text-[#0b5d90]" />
                      <span className="text-sm text-gray-700 truncate max-w-xs">
                        {profile.cv_filename || "My CV"}
                      </span>
                    </div>
                    <a
                      href={profile.cv_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-[#0b5d90] hover:underline"
                    >
                      View CV →
                    </a>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-gray-400">Could not load profile data.</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/candidate/candidate-dashboard")}
              className="flex-1 bg-[#0b5d90] text-white py-4 rounded-xl font-bold hover:bg-[#094d7a] transition"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="flex-1 border py-4 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-8 text-center">What happens next?</h3>
          <div className="flex justify-between items-start relative">
            <div className="absolute top-[20px] left-[10%] right-[10%] h-[2px] bg-gray-100 -z-0" />
            {[
              { step: "1", label: "Profile Created" },
              { step: "2", label: "Under Review" },
              { step: "3", label: "Opportunity Matching" },
              { step: "4", label: "Recruiter Contact" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-[#0b5d90] text-white flex items-center justify-center font-bold shadow-md">
                  {item.step}
                </div>
                <p className="text-xs font-bold text-gray-600 text-center w-24">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}

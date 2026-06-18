import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, Check, Save, X, FileText, Upload } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileForm {
  // Basic
  name: string;
  email: string;
  phone: string;
  country_code: string;
  dob: string;
  linkedin: string;
  // Professional
  interested_field: string;
  years_of_experience: string;
  salary_range: string;
  // Skills & prefs
  skills: string[];
  status: string;
  availability: string;
  willing_to_contact: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELDS_OPTIONS = [
  'Software Engineering', 'Data Science', 'Product Management',
  'UX/UI Design', 'Marketing', 'Finance', 'Human Resources',
  'Sales', 'Operations', 'Other',
];

const EXPERIENCE_OPTIONS = [
  'Less than 1 year', '1-2 years', '3-5 years',
  '5-10 years', '10+ years',
];

const AVAILABILITY_OPTIONS = [
  'Immediate', '2 Weeks', '1 Month', '2 Months', '3 Months',
];

const SALARY_OPTIONS = [
  'Below $30k', '$30k–$50k', '$50k–$80k',
  '$80k–$120k', '$120k–$180k', '$180k+', 'Negotiable',
];

const STATUS_OPTIONS = ['Actively Looking', 'Open to Opportunities', 'Not Looking'];

const COUNTRY_CODES = ['+94', '+1', '+44', '+61', '+91', '+971', '+65'];

// ─── Skill pill input ─────────────────────────────────────────────────────────

function SkillInput({ skills, onChange }: { skills: string[]; onChange: (s: string[]) => void }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) onChange([...skills, trimmed]);
    setInput('');
  };

  const remove = (skill: string) => onChange(skills.filter((s) => s !== skill));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[36px]">
        {skills.map((s) => (
          <span key={s} className="flex items-center gap-1 px-3 py-1 bg-lime-100 text-lime-800 text-xs font-medium rounded-full border border-lime-200">
            {s}
            <button type="button" onClick={() => remove(s)} className="hover:text-red-500 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Type a skill and press Enter"
          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 bg-slate-50"
        />
        <button
          type="button"
          onClick={add}
          className="w-full sm:w-auto px-4 py-2 bg-lime-600 text-white text-sm font-medium rounded-xl hover:bg-lime-700 transition"
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50/60">
        <h3 className="text-sm font-semibold text-slate-700 tracking-tight">{title}</h3>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 bg-slate-50 transition";
const selectCls = inputCls + " cursor-pointer";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EditProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>({
    name: '', email: '', phone: '', country_code: '+94', dob: '', linkedin: '',
    interested_field: '', years_of_experience: '', salary_range: '',
    skills: [], status: '', availability: '', willing_to_contact: false,
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [currentCvFilename, setCurrentCvFilename] = useState<string | null>(null);
  const [currentCvUrl, setCurrentCvUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // ── Fetch existing profile ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) { navigate('/signin'); return; }

      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) { navigate('/candidate/candidate-dashboard'); return; }

      setForm({
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        country_code: data.country_code ?? '+94',
        dob: data.dob ?? '',
        linkedin: data.linkedin ?? '',
        interested_field: data.interested_field ?? '',
        years_of_experience: data.years_of_experience ?? '',
        salary_range: data.salary_range ?? '',
        skills: data.skills ?? [],
        status: data.status ?? '',
        availability: data.availability ?? '',
        willing_to_contact: data.willing_to_contact ?? false,
      });
      setCurrentCvFilename(data.cv_filename ?? null);
      setCurrentCvUrl(data.cv_url ?? null);
      setLoading(false);
    })();
  }, [navigate]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const set = (field: keyof ProfileForm, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── CV upload handler ──────────────────────────────────────────────────────
  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(file.type)) {
      showToast('error', 'PDF or DOCX files only.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File must be under 5 MB.');
      return;
    }
    setCvFile(file);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Not authenticated');

      let cv_url = currentCvUrl;
      let cv_filename = currentCvFilename;

      // Upload new CV if selected
      if (cvFile) {
        const ext = cvFile.name.split('.').pop();
        const path = `${user.id}/cv_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('cvs')
          .upload(path, cvFile, { upsert: true });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(path);
        cv_url = urlData.publicUrl;
        cv_filename = cvFile.name;
      }

      const { error: updateError } = await supabase
        .from('candidates')
        .update({
          name: form.name,
          email: form.email,
          phone: form.phone,
          country_code: form.country_code,
          dob: form.dob,
          linkedin: form.linkedin,
          interested_field: form.interested_field,
          years_of_experience: form.years_of_experience,
          salary_range: form.salary_range,
          skills: form.skills,
          status: form.status,
          availability: form.availability,
          willing_to_contact: form.willing_to_contact,
          ...(cv_url && { cv_url, cv_filename }),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      showToast('success', 'Profile updated successfully!');
      setTimeout(() => navigate('/candidate/candidate-dashboard'), 1200);
    } catch (err: any) {
      showToast('error', err.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-lime-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">

      {/* Toast - Responsive */}
      {toast && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 flex items-center gap-2 px-4 sm:px-5 py-3 rounded-2xl shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success'
            ? 'bg-lime-600 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <X className="w-4 h-4 flex-shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-10">

        {/* Header - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate('/candidate/candidate-dashboard')}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Edit Profile</h1>
              <p className="text-sm text-slate-500">Update your candidate information</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 bg-lime-600 hover:bg-lime-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md transition"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">

          {/* ── 1. Basic Information ── */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name">
                <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Jane Doe" />
              </Field>
              <Field label="Email">
                <input className={inputCls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="jane@example.com" />
              </Field>
              <Field label="Phone">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select className="px-2 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-lime-400 w-full sm:w-auto" value={form.country_code} onChange={(e) => set('country_code', e.target.value)}>
                    {COUNTRY_CODES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <input className={inputCls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="77 123 4567" />
                </div>
              </Field>
              <Field label="Date of Birth">
                <input className={inputCls} type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} />
              </Field>
              <Field label="LinkedIn URL">
                <input className={inputCls + ' sm:col-span-2'} value={form.linkedin} onChange={(e) => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/yourname" />
              </Field>
            </div>
          </Section>

          {/* ── 2. Professional Info ── */}
          <Section title="Professional Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Interested Field">
                <select className={selectCls} value={form.interested_field} onChange={(e) => set('interested_field', e.target.value)}>
                  <option value="">Select field</option>
                  {FIELDS_OPTIONS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Years of Experience">
                <select className={selectCls} value={form.years_of_experience} onChange={(e) => set('years_of_experience', e.target.value)}>
                  <option value="">Select experience</option>
                  {EXPERIENCE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Expected Salary Range">
                <select className={selectCls} value={form.salary_range} onChange={(e) => set('salary_range', e.target.value)}>
                  <option value="">Select range</option>
                  {SALARY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Job Search Status">
                <select className={selectCls} value={form.status} onChange={(e) => set('status', e.target.value)}>
                  <option value="">Select status</option>
                  {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          {/* ── 3. Skills ── */}
          <Section title="Skills">
            <SkillInput skills={form.skills} onChange={(s) => set('skills', s)} />
          </Section>

          {/* ── 4. Availability & Preferences ── */}
          <Section title="Availability & Preferences">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Availability">
                <select className={selectCls} value={form.availability} onChange={(e) => set('availability', e.target.value)}>
                  <option value="">Select availability</option>
                  {AVAILABILITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Open to Contact">
                <label className="flex items-center gap-3 cursor-pointer mt-1">
                  <div
                    onClick={() => set('willing_to_contact', !form.willing_to_contact)}
                    className={`w-11 h-6 rounded-full transition-colors flex items-center px-0.5 flex-shrink-0 ${
                      form.willing_to_contact ? 'bg-lime-500' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      form.willing_to_contact ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="text-sm text-slate-600">
                    {form.willing_to_contact ? 'Yes, contact me' : 'Not at this time'}
                  </span>
                </label>
              </Field>
            </div>
          </Section>

          {/* ── 5. CV ── */}
          <Section title="Curriculum Vitae">
            {/* Current CV */}
            {(currentCvFilename || currentCvUrl) && !cvFile && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-9 h-9 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-lime-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate max-w-[150px] sm:max-w-xs">{currentCvFilename ?? 'Current CV'}</p>
                    <p className="text-xs text-slate-400">Currently uploaded</p>
                  </div>
                </div>
                {currentCvUrl && (
                  <a href={currentCvUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-medium text-blue-600 hover:underline w-full sm:w-auto text-center sm:text-left">
                    View
                  </a>
                )}
              </div>
            )}

            {/* New file selected */}
            {cvFile && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-lime-50 rounded-xl border border-lime-200 mb-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="w-9 h-9 bg-lime-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-lime-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate max-w-[150px] sm:max-w-xs">{cvFile.name}</p>
                    <p className="text-xs text-slate-400">{(cvFile.size / 1024 / 1024).toFixed(2)} MB — ready to upload</p>
                  </div>
                </div>
                <button type="button" onClick={() => { setCvFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="p-1 hover:bg-red-50 rounded-lg transition w-full sm:w-auto text-center">
                  <X className="w-4 h-4 text-red-500 inline" />
                  <span className="sm:hidden text-xs text-red-500 ml-1">Remove</span>
                </button>
              </div>
            )}

            {/* Upload button */}
            <input ref={fileInputRef} type="file" accept=".pdf,.docx" onChange={handleCvChange} className="hidden" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 border-2 border-dashed border-slate-300 hover:border-lime-400 hover:bg-lime-50/30 text-slate-600 hover:text-lime-700 text-sm font-medium rounded-xl transition w-full justify-center text-center"
            >
              <Upload className="w-4 h-4 flex-shrink-0" />
              <span>{currentCvFilename ? 'Replace CV' : 'Upload CV'} (PDF or DOCX, max 5 MB)</span>
            </button>
          </Section>

        </div>

        {/* Bottom Save - Responsive */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/candidate/candidate-dashboard')}
            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-50 transition shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 bg-lime-600 hover:bg-lime-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl shadow-md transition"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
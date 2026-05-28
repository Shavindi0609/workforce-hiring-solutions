import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { User, Mail, Calendar, Link, Info, ArrowRight } from 'lucide-react';

// ===================== TYPES =====================
export interface BasicInfoData {
  fullName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  dob: string;           // YYYY-MM-DD format
  linkedin: string;
  age: string | number;  // displayed as string '--' or number
}

interface BasicInformationProps {
  onNext: (data: BasicInfoData) => void;
  initialData?: Partial<BasicInfoData>;
}

// ===================== MAIN COMPONENT =====================
export default function BasicInformation({ onNext, initialData }: BasicInformationProps) {
  // Form state
  const [formData, setFormData] = useState<BasicInfoData>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    countryCode: initialData?.countryCode || '+91',
    mobileNumber: initialData?.mobileNumber || '',
    dob: initialData?.dob || '',
    linkedin: initialData?.linkedin || '',
    age: initialData?.age || '--',
  });

  // Local age state for reactive display
  const [displayAge, setDisplayAge] = useState<string | number>('--');

  // Auto-calculate age when DOB changes
  useEffect(() => {
    if (!formData.dob) {
      setDisplayAge('--');
      return;
    }

    const birthDate = new Date(formData.dob);
    const today = new Date();
    
    // Basic validation: if invalid date, show --
    if (isNaN(birthDate.getTime())) {
      setDisplayAge('--');
      return;
    }

    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      calculatedAge--;
    }

    const finalAge = calculatedAge >= 0 ? calculatedAge : '--';
    setDisplayAge(finalAge);
    // sync age into formData for final submission
    setFormData(prev => ({ ...prev, age: finalAge }));
  }, [formData.dob]);

  // Handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Pass complete data up to parent
    onNext({ ...formData, age: displayAge });
  };

  // Country code options with flag images
  const countryOptions = [
    { code: '+91', country: 'India', flagCode: 'in' },
    { code: '+1', country: 'USA', flagCode: 'us' },
    { code: '+44', country: 'UK', flagCode: 'gb' },
    { code: '+61', country: 'Australia', flagCode: 'au' },
    { code: '+86', country: 'China', flagCode: 'cn' },
    { code: '+81', country: 'Japan', flagCode: 'jp' },
    { code: '+49', country: 'Germany', flagCode: 'de' },
    { code: '+33', country: 'France', flagCode: 'fr' },
    { code: '+39', country: 'Italy', flagCode: 'it' },
    { code: '+34', country: 'Spain', flagCode: 'es' },
    { code: '+55', country: 'Brazil', flagCode: 'br' },
    { code: '+52', country: 'Mexico', flagCode: 'mx' },
    { code: '+82', country: 'South Korea', flagCode: 'kr' },
    { code: '+65', country: 'Singapore', flagCode: 'sg' },
    { code: '+60', country: 'Malaysia', flagCode: 'my' },
    { code: '+31', country: 'Netherlands', flagCode: 'nl' },
    { code: '+46', country: 'Sweden', flagCode: 'se' },
    { code: '+47', country: 'Norway', flagCode: 'no' },
    { code: '+45', country: 'Denmark', flagCode: 'dk' },
    { code: '+358', country: 'Finland', flagCode: 'fi' },
    { code: '+41', country: 'Switzerland', flagCode: 'ch' },
    { code: '+32', country: 'Belgium', flagCode: 'be' },
    { code: '+351', country: 'Portugal', flagCode: 'pt' },
    { code: '+30', country: 'Greece', flagCode: 'gr' },
    { code: '+27', country: 'South Africa', flagCode: 'za' },
  ];

  // Get current selected country
  const selectedCountry = countryOptions.find(c => c.code === formData.countryCode);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* ===== HEADER & STEPPER - ABOVE CONTAINER ===== */}
      <div className="w-full max-w-6xl mb-6">
        <div className="px-12 pt-4 pb-2">
          
          {/* Stepper row */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-xs font-medium text-slate-500">
            {/* Step 1 - active */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lime-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">1</div>
              <span className="text-gray-900 font-semibold tracking-tight">Basic Information</span>
            </div>
            <div className="w-16 h-px bg-slate-300"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-gray-500 text-slate-500 flex items-center justify-center text-sm font-medium">2</div>
              <span className="text-gray-900">Professional Info</span>
            </div>
            <div className="w-16 h-px bg-slate-300"></div>

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-gray-500 text-slate-500 flex items-center justify-center text-sm font-medium">3</div>
              <span className="text-gray-900">Skills & Experience</span>
            </div>
            <div className="w-16 h-px bg-slate-300"></div>

            {/* Step 4 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-gray-500 text-slate-500 flex items-center justify-center text-sm font-medium">4</div>
              <span className="text-gray-900">Additional Details</span>
            </div>
            <div className="w-16 h-px bg-slate-300"></div>

            {/* Step 5 */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full border border-gray-500 text-slate-500 flex items-center justify-center text-sm font-medium">5</div>
              <span className="text-gray-900">Upload CV</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden transition-all duration-300">
        
        {/* ===== FORM SECTION ===== */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 pt-6 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Basic Information</h2>
            <p className="text-slate-500 text-md mt-1">Let's start with your basic details</p>
          </div>

          <div className="px-8 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
              
              {/* LEFT COLUMN — main inputs */}
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Mobile Number with country code */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-blue-200 transition-all bg-white">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 border-r border-slate-200">
                      {/* Country flag */}
                      {selectedCountry && (
                        <img
                          src={`https://flagcdn.com/w20/${selectedCountry.flagCode}.png`}
                          srcSet={`https://flagcdn.com/w40/${selectedCountry.flagCode}.png 2x`}
                          width="20"
                          height="15"
                          alt={`${selectedCountry.country} flag`}
                          className="rounded-sm shadow-sm"
                          style={{ width: '20px', height: '15px', objectFit: 'cover' }}
                        />
                      )}
                      <select
                        name="countryCode"
                        value={formData.countryCode}
                        onChange={handleInputChange}
                        className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer py-3 pr-2 min-w-[70px]"
                      >
                        {countryOptions.map(opt => (
                          <option key={opt.code} value={opt.code}>
                            {opt.country} ({opt.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="tel"
                      name="mobileNumber"
                      required
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-3 text-sm focus:outline-none bg-white"
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                    <input
                      type="date"
                      name="dob"
                      required
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 ml-1">Format: DD/MM/YYYY (shown as YYYY-MM-DD)</p>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-6 flex flex-col">
                {/* Age Card */}
                <div className="bg-slate-50/90 rounded-2xl border border-slate-100 p-6 shadow-sm transition-all hover:shadow-md">
                  <span className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Age
                  </span>
                  <div className="text-5xl font-extrabold text-slate-800 my-2 tracking-tight">
                    {displayAge}
                  </div>
                  <span className="text-sm font-medium text-slate-400 bg-white/60 px-2 py-0.5 rounded-full">Years</span>
                </div>

                {/* LinkedIn Profile with Logo */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                    {/* LinkedIn Logo SVG */}
                    
                    <span>LinkedIn Profile</span>
                    <span className="text-xs font-normal text-slate-400">(optional)</span>
                  </label>
                  <div className="relative group">
                    {/* LinkedIn icon inside input */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="18" 
                        height="18" 
                        viewBox="0 0 24 24" 
                        fill="#0077b5"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z"/>
                      </svg>
                    </div>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-slate-700 placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 ml-1 flex items-center gap-1">
                    <span>🔗</span> Add your LinkedIn profile URL to increase visibility
                  </p>
                </div>

                {/* Info Notice */}
                <div className="mt-2 flex gap-3 bg-blue-50/80 border border-blue-100 rounded-xl p-4">
                  <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
                    Your age will be calculated automatically based on your date of birth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER BUTTON */}
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/40 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm tracking-wide group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
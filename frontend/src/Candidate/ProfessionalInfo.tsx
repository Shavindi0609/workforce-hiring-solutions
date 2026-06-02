import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ChangeEvent, FormEvent } from 'react';
import { Briefcase, Clock, ArrowLeft, ArrowRight, Check, ChevronDown } from 'lucide-react';
// නිවැරදි:
import type { BasicInfoData, ProfessionalInfoData } from '../types/candidate';
import manImage from '../assets/OIP.webp';

interface ProfessionalInfoProps {
  onNext: (data: ProfessionalInfoData) => void;
  onBack: () => void;
  initialData?: ProfessionalInfoData;
}

export default function ProfessionalInfo({ onNext, onBack, initialData }: ProfessionalInfoProps) {
  const [formData, setFormData] = useState<ProfessionalInfoData>({
    currentRole: initialData?.currentRole || '',
    company: initialData?.company || '',
    experience: initialData?.experience || 0,
    noticePeriod: initialData?.noticePeriod || '',
    currentCtc: initialData?.currentCtc || '',
    expectedCtc: initialData?.expectedCtc || '',
    primarySkills: initialData?.primarySkills || [],
    jobType: initialData?.jobType || 'Full-time',
    interestedField: initialData?.interestedField || '',
    yearsOfExperience: initialData?.yearsOfExperience || '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  // Interested Field options
  const interestedFields = [
    'Software Development',
    'Data Science & AI',
    'Cloud Computing',
    'DevOps & SRE',
    'Cybersecurity',
    'Product Management',
    'UI/UX Design',
    'Quality Assurance',
    'Technical Writing',
    'IT Support',
    'Network Engineering',
    'Database Administration',
  ];

  // Years of Experience options
  const yearsOptions = [
    'Fresher (0-1 years)',
    '1-3 years',
    '3-5 years',
    '5-8 years',
    '8-10 years',
    '10+ years',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* ===== HEADER & STEPPER - ABOVE CONTAINER ===== */}
      <div className="w-full max-w-6xl mb-6">
        <div className="px-12 pt-4 pb-2">
          
          {/* Stepper row */}
          <div className="flex flex-wrap items-center gap-y-3 gap-x-5 text-xs font-medium text-slate-500">
            {/* Step 1 - completed */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lime-500 text-white flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4" strokeWidth={4} />
              </div>
              <span className="text-gray-900">Basic Information</span>
            </div>
            <div className="w-16 h-px bg-slate-300"></div>

            {/* Step 2 - active */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lime-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">2</div>
              <span className="text-gray-900 font-semibold tracking-tight">Professional Info</span>
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
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden transition-all duration-300 px-4 pt-4">
        
        {/* ===== FORM SECTION ===== */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 pt-6 pb-12">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Professional Information</h2>
            <p className="text-slate-500 text-md mt-1">Tell us about your professional background</p>
          </div>

          <div className="px-8 pb-6">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* LEFT COLUMN - Form Fields - 2/3 width */}
              <div className="w-full lg:w-2/3 space-y-12">
                {/* Interested Field */}
                <div>
                  <label className="block text-md font-semibold text-slate-700 mb-4">
                    Interested Field <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-lime-500" />
                    <select
                      name="interestedField"
                      required
                      value={formData.interestedField}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-md focus:border-lime-400 focus:ring-2 focus:ring-lime-100 outline-none transition-all appearance-none cursor-pointer text-slate-600"
                    >
                      <option value="">Select your interested field</option>
                      {interestedFields.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-md font-semibold text-slate-700 mb-4">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-lime-500" />
                    <select
                      name="yearsOfExperience"
                      required
                      value={formData.yearsOfExperience}
                      onChange={handleChange}
                      className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-md focus:border-lime-400 focus:ring-2 focus:ring-lime-100 outline-none transition-all appearance-none cursor-pointer text-slate-600"
                    >
                      <option value="">Select years of experience</option>
                      {yearsOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Illustration Image - 1/3 width - No background */}
              <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <div className="w-full flex items-center justify-center">
                  <img 
                    src={manImage}
                    alt="Professional man teaching illustration"
                    className="w-full h-auto max-w-[180px] object-contain rounded-lg "
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'text-center';
                        fallback.innerHTML = `
                          <svg class="w-24 h-24 mx-auto text-lime-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                          </svg>
                          <p class="text-sm font-medium text-slate-600 mt-2">Professional Image</p>
                        `;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                </div>

                {/* Info Notice - Below the image */}
                <div className="flex gap-3 bg-blue-50/80 border border-blue-100 rounded-xl p-4">
                  <svg className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-gray-800/80 leading-relaxed font-medium">
                    Your selected field will help us show relevant skills options in the next step.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/40 flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-8 rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 text-sm group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl..."
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
import { Link } from 'react-router-dom'; 
import type { FormEvent } from 'react';
import { AlertCircle, DollarSign, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { FormComponentProps } from '../types/candidate';

export default function AdditionalDetails({
  formData,
  updateFormData,
  onNext,
  onBack,
}: FormComponentProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const selectClass =
    'w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer text-slate-700';

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

            {/* Step 2 - completed */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lime-500 text-white flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4" strokeWidth={4} />
              </div>
              <span className="text-gray-900">Professional Info</span>
            </div>
            <div className="w-16 h-px bg-slate-300"></div>

            {/* Step 3 - completed */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lime-500 text-white flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4" strokeWidth={4} />
              </div>
              <span className="text-gray-900">Skills & Experience</span>
            </div>
            <div className="w-16 h-px bg-slate-300"></div>

            {/* Step 4 - active */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lime-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">4</div>
              <span className="text-gray-900 font-semibold tracking-tight">Additional Details</span>
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
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Additional Details</h2>
            <p className="text-slate-500 text-md mt-1">A few more details to complete your profile</p>
          </div>

          <div className="px-8 pb-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-6">
              
              {/* LEFT COLUMN - Status, Availability, Willing to be Contacted */}
              <div className="space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <select
                      required
                      value={formData.status || ''}
                      onChange={(e) => updateFormData({ status: e.target.value })}
                      className={selectClass}
                    >
                      <option value="" disabled>Select status</option>
                      <option value="Active">Looking for opportunities</option>
                      <option value="Passive">Open to offers</option>
                      <option value="Unavailable">Not available</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Availability <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <select
                      required
                      value={formData.availability || ''}
                      onChange={(e) => updateFormData({ availability: e.target.value })}
                      className={selectClass}
                    >
                      <option value="" disabled>Select availability</option>
                      <option value="Immediate">Immediate (1-2 weeks)</option>
                      <option value="1Month">1 Month Notice</option>
                      <option value="2Months">2 Month Notice</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Willing to be Contacted */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Willing to be Contacted <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <select
                      required
                      value={formData.willingToContact || ''}
                      onChange={(e) => updateFormData({ willingToContact: e.target.value })}
                      className={selectClass}
                    >
                      <option value="" disabled>Select an option</option>
                      <option value="Yes">Yes, directly by email/phone</option>
                      <option value="No">No, keep anonymous</option>
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Salary Range with Info Notice */}
              <div className="space-y-10">
                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Salary Range (Next 2 Years) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., 80000-120000"
                      value={formData.salaryRange || ''}
                      onChange={(e) => updateFormData({ salaryRange: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 ml-1">
                    Example: 80000-120000
                  </p>
                </div>

                {/* Info Notice - Below Salary Range */}
                <div className="flex gap-3 bg-amber-50/80 border border-amber-100 rounded-xl p-4">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                    Please enter expected salary range for the next 2 years.
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
            <Link to="/candidate/registration/upload">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm tracking-wide group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Continue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
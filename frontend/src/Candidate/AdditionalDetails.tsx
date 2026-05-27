import type { FormEvent } from 'react';
import { AlertCircle, DollarSign, ArrowLeft, ArrowRight } from 'lucide-react';
import type { FormComponentProps } from '../types/candidate';

export default function AdditionalDetails({
  formData,
  updateFormData,
  onNext,
  onBack,
  basicData,
}: FormComponentProps) {
  const pageTitle = basicData?.fullName
    ? `${basicData.fullName}'s Profile`
    : 'Join Our Candidate Pool';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const selectClass =
    'w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 appearance-none cursor-pointer';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-5xl card">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
        

          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 overflow-x-auto py-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-completed">✓</span>
              <span className="text-green-600">Basic Information</span>
            </div>
            <div className="progress-line-active" />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-completed">✓</span>
              <span className="text-green-600">Professional Info</span>
            </div>
            <div className="progress-line-active" />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-completed">✓</span>
              <span className="text-green-600">Skills & Experience</span>
            </div>
            <div className="progress-line-active" />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-active">4</span>
              <span className="text-blue-600 font-semibold">Additional Details</span>
            </div>
            <div className="progress-line" />
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-inactive">5</span>
              <span>Upload CV</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Additional Details</h2>
            <p className="text-sm text-slate-500">A few more details to complete your profile</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.status || ''}
                  onChange={(e) => updateFormData({ status: e.target.value })}
                  className={selectClass}
                >
                  <option value="" disabled>
                    Select status
                  </option>
                  <option value="Active">Looking for opportunities</option>
                  <option value="Passive">Open to offers</option>
                  <option value="Unavailable">Not available</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Availability <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.availability || ''}
                  onChange={(e) => updateFormData({ availability: e.target.value })}
                  className={selectClass}
                >
                  <option value="" disabled>
                    Select availability
                  </option>
                  <option value="Immediate">Immediate (1-2 weeks)</option>
                  <option value="1Month">1 Month Notice</option>
                  <option value="2Months">2 Month Notice</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Willing to be Contacted <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.willingToContact || ''}
                  onChange={(e) => updateFormData({ willingToContact: e.target.value })}
                  className={selectClass}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option value="Yes">Yes, directly by email/phone</option>
                  <option value="No">No, keep anonymous</option>
                </select>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Salary Range (Next 2 Years) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g., 80000-120000"
                    value={formData.salaryRange || ''}
                    onChange={(e) => updateFormData({ salaryRange: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                  />
                </div>
                <span className="block text-xs text-slate-400 mt-1.5">
                  Example: 80000-120000
                </span>
              </div>

              <div className="flex gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                  Please enter expected salary range for the next 2 years.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-6 py-2.5 rounded-lg transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button type="submit" className="btn-primary group">
              Save Profile
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
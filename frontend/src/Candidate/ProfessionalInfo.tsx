import { useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';
import { Briefcase, Building, DollarSign, Clock, Tag, ArrowLeft, ArrowRight } from 'lucide-react';
import type { ProfessionalInfoData, BasicInfoData } from './types';

interface ProfessionalInfoProps {
  onNext: (data: ProfessionalInfoData) => void;
  onBack: () => void;
  initialData?: ProfessionalInfoData;
  basicData?: BasicInfoData;
}

export default function ProfessionalInfo({ onNext, onBack, initialData, basicData }: ProfessionalInfoProps) {
  const [formData, setFormData] = useState<ProfessionalInfoData>({
    currentRole: initialData?.currentRole || '',
    company: initialData?.company || '',
    experience: initialData?.experience || 0,
    noticePeriod: initialData?.noticePeriod || '',
    currentCtc: initialData?.currentCtc || '',
    expectedCtc: initialData?.expectedCtc || '',
    primarySkills: initialData?.primarySkills || [],
    jobType: initialData?.jobType || 'Full-time',
  });

  const [skillInput, setSkillInput] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.primarySkills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        primarySkills: [...prev.primarySkills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      primarySkills: prev.primarySkills.filter(s => s !== skill)
    }));
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-5xl card">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
          
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 overflow-x-auto py-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-completed">✓</span>
              <span className="text-green-600">Basic Information</span>
            </div>
            <div className="progress-line-active"></div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-active">2</span>
              <span className="text-blue-600 font-semibold">Professional Info</span>
            </div>
            <div className="progress-line"></div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-inactive">3</span>
              <span>Skills & Experience</span>
            </div>
            <div className="progress-line"></div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-inactive">4</span>
              <span>Additional Details</span>
            </div>
            <div className="progress-line"></div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-inactive">5</span>
              <span>Upload CV</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Professional Information</h2>
            <p className="text-sm text-slate-500">Tell us about your work experience</p>
          </div>

          <div className="space-y-6">
            {/* Current Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Current Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="currentRole"
                    required
                    value={formData.currentRole}
                    onChange={handleChange}
                    placeholder="e.g., Senior Software Engineer"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Company <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g., Google, Amazon, Startup"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Experience & Notice Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Total Experience (Years) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="experience"
                  required
                  min="0"
                  max="50"
                  step="0.5"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Notice Period <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    name="noticePeriod"
                    required
                    value={formData.noticePeriod}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 appearance-none cursor-pointer"
                  >
                    <option value="">Select notice period</option>
                    <option value="Immediate">Immediate (15 days)</option>
                    <option value="30 days">30 days</option>
                    <option value="45 days">45 days</option>
                    <option value="60 days">60 days</option>
                    <option value="90 days">90 days</option>
                  </select>
                </div>
              </div>
            </div>

            {/* CTC Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Current CTC (₹/year)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="currentCtc"
                    value={formData.currentCtc}
                    onChange={handleChange}
                    placeholder="e.g., 15,00,000"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Expected CTC (₹/year) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="expectedCtc"
                    required
                    value={formData.expectedCtc}
                    onChange={handleChange}
                    placeholder="e.g., 20,00,000"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Preferred Job Type <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {(['Full-time', 'Part-time', 'Contract', 'Remote'] as const).map((type) => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="jobType"
                      value={type}
                      checked={formData.jobType === type}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Primary Skills <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type skill and press Enter (e.g., React, Python, AWS)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                />
              </div>
              
              {/* Skills Tags */}
              {formData.primarySkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.primarySkills.map((skill) => (
                    <span
                      key={skill}
                      onClick={() => removeSkill(skill)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      {skill}
                      <span className="text-xs">✕</span>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1.5">Click on skill to remove</p>
            </div>
          </div>

          {/* Action Buttons */}
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
              Continue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
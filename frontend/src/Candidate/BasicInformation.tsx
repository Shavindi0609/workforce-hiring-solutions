import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { User, Mail, Calendar, Link, Info, ArrowRight } from 'lucide-react';
import type { BasicInfoData } from './types';

interface BasicInformationProps {
  onNext: (data: BasicInfoData) => void;
  initialData?: BasicInfoData;
}

export default function BasicInformation({ onNext, initialData }: BasicInformationProps) {
  const [formData, setFormData] = useState<BasicInfoData>({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    countryCode: initialData?.countryCode || '+91',
    mobileNumber: initialData?.mobileNumber || '',
    dob: initialData?.dob || '',
    linkedin: initialData?.linkedin || '',
    age: initialData?.age || '--',
  });

  const [age, setAge] = useState<number | string>('--');

  useEffect(() => {
    if (!formData.dob) {
      setAge('--');
      return;
    }

    const birthDate = new Date(formData.dob);
    const today = new Date();
    
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }

    const finalAge = calculatedAge >= 0 ? calculatedAge : '--';
    setAge(finalAge);
    setFormData(prev => ({ ...prev, age: finalAge }));
  }, [formData.dob]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onNext({ ...formData, age });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-5xl card">
        
        {/* Header & Progress Stepper */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
          {/* Progress Steps */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-400 overflow-x-auto py-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-active">1</span>
              <span className="text-blue-600 font-semibold">Basic Information</span>
            </div>
            <div className="progress-line"></div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-inactive">2</span>
              <span>Professional Info</span>
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

        {/* Form Content */}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Basic Information</h2>
            <p className="text-sm text-slate-500">Let's start with your basic details</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column */}
            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-3 border-r border-slate-200">
                    <span className="text-base">🇮🇳</span>
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="+91">+91 (India)</option>
                      <option value="+1">+1 (USA)</option>
                      <option value="+44">+44 (UK)</option>
                      <option value="+61">+61 (Australia)</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    name="mobileNumber"
                    required
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    className="w-full px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* DOB */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="date"
                    name="dob"
                    required
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                {/* Age Display */}
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                  <span className="block text-sm font-semibold text-slate-700 mb-1">Age</span>
                  <div className="text-3xl font-bold text-slate-800 my-1">{age}</div>
                  <span className="text-xs text-slate-400 font-medium">Years</span>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    LinkedIn Profile
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://www.linkedin.com/in/yourprofile"
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 text-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="flex gap-3 bg-blue-50/60 border border-blue-100/80 rounded-xl p-4 mt-auto">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700/90 leading-relaxed font-medium">
                  Your age will be calculated automatically based on your date of birth.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8 border-t border-slate-100 pt-6">
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
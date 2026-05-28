import { useState } from 'react';
import type { KeyboardEvent, FormEvent } from 'react';
import { Tag, Info, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import type { FormComponentProps } from '../types/candidate';

export default function SkillsExperience({
  formData,
  updateFormData,
  onNext,
  onBack,
}: FormComponentProps) {
  const [skillInput, setSkillInput] = useState('');

  const defaultSkills: string[] = ['React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript'];
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    formData.skills.length > 0 ? formData.skills : defaultSkills
  );

  const handleAddSkill = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(skillInput.trim())) {
        const updatedSkills = [...selectedSkills, skillInput.trim()];
        setSelectedSkills(updatedSkills);
        updateFormData({ skills: updatedSkills });
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = selectedSkills.filter((skill) => skill !== skillToRemove);
    setSelectedSkills(updatedSkills);
    updateFormData({ skills: updatedSkills });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateFormData({ skills: selectedSkills });
    onNext();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4 font-sans ">
      
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

            {/* Step 3 - active */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lime-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">3</div>
              <span className="text-gray-900 font-semibold tracking-tight">Skills & Experience</span>
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
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden transition-all duration-300 px-4">
        
        {/* ===== FORM SECTION ===== */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 pt-6 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Skills & Experience</h2>
            <p className="text-slate-500 text-md mt-1">Add your key skills and experience details</p>
          </div>

          <div className="px-8 pb-6">
            <div className="space-y-6">
              {/* Skills Input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Key Skills <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 transition-colors group-focus-within:text-blue-500" />
                  <input
                    type="text"
                    placeholder="Type a skill and press Enter (e.g., React, Python, AWS)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleAddSkill}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Selected Skills Tags */}
              {selectedSkills.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Selected Skills
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <span
                        key={skill}
                        onClick={() => handleRemoveSkill(skill)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg cursor-pointer hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                      >
                        {skill}
                        <span className="text-xs font-bold">✕</span>
                      </span>
                    ))}
                  </div>

                </div>
              )}

              {/* Info Notice */}
              <div className="flex gap-3 bg-blue-50/80 border border-blue-100 rounded-xl p-4">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
                  Tip: Add skills that best describe your expertise. You can add or remove skills at any time.
                </p>
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm tracking-wide group focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2"
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
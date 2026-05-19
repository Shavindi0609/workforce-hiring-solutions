import { useState } from 'react';
import type { FC, KeyboardEvent } from 'react';
import type { FormComponentProps } from '../types/candidate';

const SkillsExperienceForm: FC<FormComponentProps> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
}) => {
  const [skillInput, setSkillInput] = useState<string>('');
  
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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Title Header Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Skills & Experience</h2>
        <p className="text-sm text-gray-500 mt-1">Add your key skills and experience details</p>
      </div>

      <form onSubmit={handleNext} className="space-y-6">
        {/* Input Wrapper Field */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-800">
            Key Skills <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Search and select skills"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm placeholder-gray-400 transition-all"
          />
        </div>

        {/* Selected Skill Elements Generation Array */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Selected Skills
          </label>
          <div className="flex flex-wrap gap-2.5 min-h-[44px]">
            {selectedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EFF6FF] text-[#2563EB] text-sm font-medium rounded-lg border border-[#BFDBFE]/60"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-blue-800 font-bold focus:outline-none text-base cursor-pointer leading-none ml-1 transition-colors"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Informational Blue Box Alert Banner */}
        <div className="flex items-start gap-3 p-4 bg-[#EFF6FF]/60 rounded-xl border border-[#BFDBFE]/40">
          <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-[#2563EB] text-[#2563EB] font-bold text-xs shrink-0 mt-0.5">
            i
          </div>
          <p className="text-sm text-[#1E40AF] leading-normal font-medium">
            Tip: Add skills that best describe your expertise. You can add or remove skills at any time.
          </p>
        </div>

        {/* Dynamic Action Interaction Row */}
        <div className="flex justify-between items-center pt-6 mt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all shadow-sm cursor-pointer"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SkillsExperienceForm;
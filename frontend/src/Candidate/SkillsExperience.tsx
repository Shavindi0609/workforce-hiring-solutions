import { useState } from 'react';
import type { KeyboardEvent, FormEvent } from 'react';
import { Tag, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import type { FormComponentProps } from '../types/candidate';

export default function SkillsExperience({
  formData,
  updateFormData,
  onNext,
  onBack,
  basicData,
}: FormComponentProps) {
  const [skillInput, setSkillInput] = useState('');

  const defaultSkills: string[] = ['React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript'];
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    formData.skills.length > 0 ? formData.skills : defaultSkills
  );

  const pageTitle = basicData?.fullName
    ? `${basicData.fullName}'s Profile`
    : 'Join Our Candidate Pool';

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
              <span className="step-completed">✓</span>
              <span className="text-green-600">Professional Info</span>
            </div>
            <div className="progress-line-active"></div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="step-active">3</span>
              <span className="text-blue-600 font-semibold">Skills & Experience</span>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Skills & Experience</h2>
            <p className="text-sm text-slate-500">Add your key skills and experience details</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Key Skills <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Type a skill and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500"
                />
              </div>
            </div>

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
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg cursor-pointer hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      {skill}
                      <span className="text-xs">✕</span>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Click on a skill to remove</p>
              </div>
            )}

            <div className="flex gap-3 bg-blue-50/60 border border-blue-100/80 rounded-xl p-4">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700/90 leading-relaxed font-medium">
                Tip: Add skills that best describe your expertise. You can add or remove skills at any time.
              </p>
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
              Continue
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState, useRef } from 'react';
import type { FormEvent, DragEvent } from 'react';
import { ArrowLeft, Check, FileText, X } from 'lucide-react';
import { BsCloudArrowUp } from 'react-icons/bs';
import { supabase } from '../supabaseClient';
import type { FormComponentProps } from '../types/candidate'; 
import { saveCandidate } from '../Candidate/candidateService';

export default function UploadCV({
  formData,
  updateFormData,
  onNext,
  onBack,
  basicData,
}: FormComponentProps) {  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [agreeToContact, setAgreeToContact] = useState(false);
   const [loading, setLoading] = useState(false);  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
        updateFormData({ cv: file });
      } else {
        alert('Please upload PDF or DOCX file only');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setSelectedFile(file);
        updateFormData({ cv: file });
      } else {
        alert('Please upload PDF or DOCX file only');
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    updateFormData({ cv: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // const handleSubmit = (e: FormEvent) => {
  //   e.preventDefault();
  //   if (selectedFile && agreeToContact) {
  //     onNext();
  //   } else if (!selectedFile) {
  //     alert('Please upload your CV');
  //   } else if (!agreeToContact) {
  //     alert('Please agree to be contacted');
  //   }
  // };
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  if (!selectedFile) {
    alert('Please upload your CV');
    return;
  }
  if (!agreeToContact) {
    alert('Please agree to be contacted');
    return;
  }

  try {
    setLoading(true); 

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Not authenticated');

    await saveCandidate(
      {
        basicData: basicData!,
        professionalData: {
          interestedField: formData.interestedField,
          yearsOfExperience: formData.yearsOfExperience,
        },
        formData,
        cvFile: selectedFile,
      },
      user.id
    );

    onNext(); // Dashboard එකට redirect
  } catch (error: any) {
    console.error(error);
    alert(`Submission failed: ${error.message}`);
  } finally {
    setLoading(false);
  }
};
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

            {/* Step 4 - completed */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lime-500 text-white flex items-center justify-center shadow-sm">
                <Check className="w-4 h-4" strokeWidth={4} />
              </div>
              <span className="text-gray-900">Additional Details</span>
            </div>
            <div className="w-16 h-px bg-slate-300"></div>

            {/* Step 5 - active */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-lime-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">5</div>
              <span className="text-gray-900 font-semibold tracking-tight">Upload CV</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTAINER ===== */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden transition-all duration-300">
        
        {/* ===== FORM SECTION ===== */}
        <form onSubmit={handleSubmit}>
          {/* Title Section - Left Aligned */}
          <div className="px-8 pt-6 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Upload Your CV</h2>
            <p className="text-slate-500 text-md mt-1">Upload your CV to complete your profile</p>
          </div>

          <div className="px-8 pb-6">
            {/* Drag & Drop Area - No background color, increased icon size */}
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer ${
                dragActive
                  ? 'border-lime-500 bg-lime-50/30'
                  : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/10'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {!selectedFile ? (
                <>
                  {/* Increased icon size from w-8 h-8 to w-16 h-16, removed background circle */}
                  <BsCloudArrowUp className="w-20 h-20 text-blue-800 mx-auto mb-4" />
                  <p className="text-blue-800 font-medium text-xl">Drag & drop your CV here</p>
                  <p className="text-md text-slate-500 my-2">or</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-8 py-2 border-2 border-gray-300 hover:bg-lime-600 text-blue-800 text-sm font-medium rounded-lg transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    Browse File
                  </button>
                  <p className="text-sm text-slate-500 mt-4">
                    Accepted formats: PDF, DOCX (Max 5MB)
                  </p>
                </>
              ) : (
                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-lime-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-lime-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
                      <p className="text-xs text-slate-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Agreement Checkbox */}
            <div className="mt-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToContact}
                  onChange={(e) => setAgreeToContact(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-lime-500 focus:ring-lime-500 border-slate-300 rounded"
                />
                <span className="text-sm text-slate-600">
                  I agree to be contacted regarding opportunities from
                  <span className="font-semibold text-slate-800"> Workforce Hiring Solutions</span>
                  and its hiring partners.
                </span>
              </label>
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
              className="bg-lime-600 hover:bg-lime-700 text-white font-semibold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm tracking-wide group focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2"
            >
              Join Talent Pool
              <Check className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={3} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
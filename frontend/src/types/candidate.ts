//This file is for shared Type Definitions

export interface CandidateFormData {
  skills: string[];
  status: string;
  salaryRange: string;
  availability: string;
  willingToContact: string;
}

export interface FormComponentProps {
  formData: CandidateFormData;
  updateFormData: (newData: Partial<CandidateFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}
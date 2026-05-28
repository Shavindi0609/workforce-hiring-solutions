export interface CandidateFormData {
  skills: string[];
  status?: string;
  availability?: string;
  willingToContact?: string;
  salaryRange?: string;
  cv?: File | null;
}

import type { BasicInfoData } from '../Candidate/types';

export interface FormComponentProps {
  formData: CandidateFormData;
  updateFormData: (data: Partial<CandidateFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  basicData?: BasicInfoData;
}
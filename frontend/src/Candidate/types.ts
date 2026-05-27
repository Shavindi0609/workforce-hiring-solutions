// Common types for both pages
export interface BasicInfoData {
  fullName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  dob: string;
  linkedin: string;
  age: number | string;
}

export interface ProfessionalInfoData {
  currentRole: string;
  company: string;
  experience: number;
  noticePeriod: string;
  currentCtc: string;
  expectedCtc: string;
  primarySkills: string[];
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
}

export type Step = 1 | 2 | 3 | 4 | 5;
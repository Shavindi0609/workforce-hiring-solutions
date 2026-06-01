// src/types/candidate.ts

// ============================================
// Form Data Types (for registration flow)
// ============================================

export interface CandidateFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  dob: string;
  linkedin: string;
  age: string | number;
  interestedField: string;
  yearsOfExperience: string;
  skills: string[];
  status?: string;
  availability?: string;
  willingToContact?: string;
  salaryRange?: string;
  cv?: File | null;
}
// src/types/candidate.ts - TOP හි add කරන්න
export interface BasicInfoData {
  fullName: string;
  email: string;
  countryCode: string;
  mobileNumber: string;
  dob: string;
  linkedin: string;
  age: string | number;
}

export interface ProfessionalInfoData {
  currentRole?: string;
  company?: string;
  experience?: number;
  noticePeriod?: string;
  currentCtc?: string;
  expectedCtc?: string;
  primarySkills?: string[];
  jobType?: string;
  interestedField: string;
  yearsOfExperience: string;
}

// Import BasicInfoData from Candidate types


export interface FormComponentProps {
  formData: CandidateFormData;
  updateFormData: (data: Partial<CandidateFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  basicData?: BasicInfoData;
}

// ============================================
// API/Supabase Database Types
// ============================================

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  field: string;
  experience: string;
  status: 'Actively Looking' | 'Open to Opportunities';
  availability: string;
  salary_min: number;
  salary_max: number;
  salary_range: string;
  joined: string;
  created_at: string;
  updated_at: string;
  // Extended fields for complete profile
  skills?: string[];
  willing_to_contact?: boolean;
  cv_url?: string;
}

export interface CreateCandidateDto {
  name: string;
  email: string;
  phone: string;
  field: string;
  experience: string;
  status: 'Actively Looking' | 'Open to Opportunities';
  availability: string;
  salary_min: number;
  salary_max: number;
  salary_range: string;
  skills?: string[];
  willing_to_contact?: boolean;
  cv_url?: string;
}

export interface UpdateCandidateDto extends Partial<CreateCandidateDto> {
  id?: string;
}

// ============================================
// Combined Types (for complete candidate profile)
// ============================================

export interface CompleteCandidateProfile {
  // Basic Info
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  
  // Professional Info
  field?: string;
  experience?: string;
  currentRole?: string;
  company?: string;
  
  // Skills & Experience
  skills?: string[];
  certifications?: string[];
  languages?: string[];
  
  // Additional Details
  status?: 'Actively Looking' | 'Open to Opportunities';
  availability?: 'Immediate' | '2 Weeks' | '1 Month' | '2 Months' | '3 Months';
  willing_to_contact?: boolean;
  salary_min?: number;
  salary_max?: number;
  salary_range?: string;
  
  // Documents
  cv?: File | null;
  cv_url?: string;
  portfolio_url?: string;
  linkedin_url?: string;
  
  // Metadata
  avatar_url?: string;
  joined?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================
// Statistics and Filters
// ============================================

export interface CandidateStatistics {
  total: number;
  activelyLooking: number;
  openToOpportunities: number;
  availableImmediate: number;
  activelyLookingPercentage: number;
  openToOpportunitiesPercentage: number;
  availableImmediatePercentage: number;
  byField: Record<string, number>;
  byExperience: Record<string, number>;
  byAvailability: Record<string, number>;
}

export interface CandidateFilters {
  search?: string;
  field?: string;
  status?: string;
  availability?: string;
  experience?: string;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CandidateResponse {
  data: Candidate[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// Helper Functions
// ============================================

// Generate salary range string from min and max values
export const generateSalaryRange = (min: number, max: number): string => {
  return `${min.toLocaleString()} - ${max.toLocaleString()}`;
};

// Parse salary range string to get min and max values
export const parseSalaryRange = (salaryRange: string): { min: number; max: number } => {
  const [min, max] = salaryRange.split(' - ').map(s => parseInt(s.replace(/,/g, '')));
  return { min, max };
};

// Get status badge color based on status
export const getStatusColor = (status: Candidate['status']): string => {
  return status === 'Actively Looking' 
    ? 'bg-green-100 text-green-700' 
    : 'bg-orange-100 text-orange-700';
};

// Get availability badge color
export const getAvailabilityColor = (availability: string): string => {
  const colors: Record<string, string> = {
    'Immediate': 'bg-purple-100 text-purple-700',
    '2 Weeks': 'bg-blue-100 text-blue-700',
    '1 Month': 'bg-yellow-100 text-yellow-700',
    '2 Months': 'bg-orange-100 text-orange-700',
    '3 Months': 'bg-red-100 text-red-700',
  };
  return colors[availability] || 'bg-gray-100 text-gray-700';
};

// Get field icon
export const getFieldIcon = (field: string): string => {
  const icons: Record<string, string> = {
    'Web Development': '💻',
    'UI/UX Design': '🎨',
    'Data Science': '📊',
    'Digital Marketing': '📱',
    'Mobile Development': '📲',
    'HR & Recruitment': '👥',
    'DevOps': '⚙️',
    'AI / ML': '🤖',
  };
  return icons[field] || '💼';
};

// Convert form data to API data
export const formDataToApiData = (formData: CandidateFormData, basicData?: any): CreateCandidateDto => {
  // Parse salary range if exists
  let salary_min = 0;
  let salary_max = 0;
  if (formData.salaryRange) {
    const { min, max } = parseSalaryRange(formData.salaryRange);
    salary_min = min;
    salary_max = max;
  }
  
  return {
    name: basicData?.name || '',
    email: basicData?.email || '',
    phone: basicData?.phone || '',
    field: basicData?.field || '',
    experience: basicData?.experience || '',
    status: (formData.status as 'Actively Looking' | 'Open to Opportunities') || 'Actively Looking',
    availability: formData.availability || 'Immediate',
    salary_min,
    salary_max,
    salary_range: formData.salaryRange || '0 - 0',
    skills: formData.skills,
    willing_to_contact: formData.willingToContact === 'yes',
  };
};

// Convert API data to form data
export const apiDataToFormData = (candidate: Candidate): CandidateFormData => {
  return {
    skills: candidate.skills || [],
    status: candidate.status,
    availability: candidate.availability,
    willingToContact: candidate.willing_to_contact ? 'yes' : 'no',
    salaryRange: candidate.salary_range,
    cv: null,
  };
};

// Validation functions
export const validateCandidateForm = (data: Partial<Candidate>): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  if (!data.name || data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Valid email is required';
  }
  
  if (data.salary_min && data.salary_max && data.salary_min > data.salary_max) {
    errors.salary = 'Minimum salary cannot be greater than maximum salary';
  }
  
  return errors;
};

// Default values
export const defaultCandidateFormData: CandidateFormData = {
  skills: [],
  status: 'Actively Looking',
  availability: 'Immediate',
  willingToContact: 'no',
  salaryRange: '0 - 0',
  cv: null,
};

export const defaultCandidate: Partial<Candidate> = {
  status: 'Actively Looking',
  availability: 'Immediate',
  salary_min: 0,
  salary_max: 0,
  salary_range: '0 - 0',
};

// Constants
export const CANDIDATE_STATUSES = ['Actively Looking', 'Open to Opportunities'] as const;
export const CANDIDATE_AVAILABILITIES = ['Immediate', '2 Weeks', '1 Month', '2 Months', '3 Months'] as const;
export const CANDIDATE_FIELDS = [
  'Web Development',
  'UI/UX Design',
  'Data Science',
  'Digital Marketing',
  'Mobile Development',
  'HR & Recruitment',
  'DevOps',
  'AI / ML',
  'Cloud Computing',
  'Cybersecurity',
  'Project Management',
  'Business Analysis'
] as const;
export const CANDIDATE_EXPERIENCE_LEVELS = [
  '0-1 Years',
  '1-2 Years',
  '2-3 Years',
  '3-4 Years',
  '4-5 Years',
  '5+ Years'
] as const;

// Type guards
export const isActivelyLooking = (status: string): status is 'Actively Looking' => {
  return status === 'Actively Looking';
};

export const isOpenToOpportunities = (status: string): status is 'Open to Opportunities' => {
  return status === 'Open to Opportunities';
};

export const isValidAvailability = (availability: string): availability is Candidate['availability'] => {
  return CANDIDATE_AVAILABILITIES.includes(availability as any);
};
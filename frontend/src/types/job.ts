// src/types/job.ts
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  field: string;
  experience_level: string;
  salary_range: string;
  location: string;
  job_type: string;
  status: 'Open' | 'Closed' | 'On Hold';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobDto {
  title: string;
  description: string;
  requirements: string;
  field: string;
  experience_level: string;
  salary_range: string;
  location: string;
  job_type: string;
  status?: 'Open' | 'Closed' | 'On Hold';
}

export interface UpdateJobDto {
  title?: string;
  description?: string;
  requirements?: string;
  field?: string;
  experience_level?: string;
  salary_range?: string;
  location?: string;
  job_type?: string;
  status?: 'Open' | 'Closed' | 'On Hold';
}
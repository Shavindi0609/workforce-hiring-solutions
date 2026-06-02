// src/services/candidateService.ts
import { supabase } from '../supabaseClient';
import type { CandidateFormData, BasicInfoData, ProfessionalInfoData } from '../types/candidate';

export interface FullCandidateData {
  basicData: BasicInfoData;
  professionalData: ProfessionalInfoData;
  formData: CandidateFormData;
  cvFile: File;
}

// CV upload — 
export async function uploadCV(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error } = await supabase.storage
    .from('cv-uploads')
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error(`CV upload failed: ${error.message}`);

  // Signed URL (private bucket )
  const { data } = await supabase.storage
    .from('cv-uploads')
    .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

  if (!data?.signedUrl) throw new Error('Could not get signed URL');
  return data.signedUrl;
}

// Full candidate profile save
export async function saveCandidate(
  data: FullCandidateData,
  userId: string
): Promise<void> {
  const { basicData, professionalData, formData, cvFile } = data;

  // 1. Upload CV
  const cvUrl = await uploadCV(cvFile, userId);

  // 2. Insert candidate record
  const { error } = await supabase
    .from('candidates')
    .upsert({
      id: userId,
      name: basicData.fullName,
      email: basicData.email,
      phone: basicData.mobileNumber,
      country_code: basicData.countryCode,
      dob: basicData.dob,
      linkedin: basicData.linkedin,
      age: typeof basicData.age === 'number' ? basicData.age : null,

      interested_field: professionalData.interestedField,
      years_of_experience: professionalData.yearsOfExperience,

      skills: formData.skills,
      status: formData.status,
      availability: formData.availability,
      willing_to_contact: formData.willingToContact === 'yes',
      salary_range: formData.salaryRange,

      cv_url: cvUrl,
      cv_filename: cvFile.name,
    });

  if (error) throw new Error(`Profile save failed: ${error.message}`);
}

// Fetch candidate profile (dashboard use)
export async function getCandidateProfile(userId: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
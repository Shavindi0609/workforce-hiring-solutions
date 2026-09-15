// // src/services/candidateService.ts
// import { supabase } from '../supabaseClient';
// import type { CandidateFormData, BasicInfoData, ProfessionalInfoData } from '../types/candidate';

// export interface FullCandidateData {
//   basicData: BasicInfoData;
//   professionalData: ProfessionalInfoData;
//   formData: CandidateFormData;
//   cvFile: File;
//   cvText?: string; 
// }

// // CV upload — 
// export async function uploadCV(file: File, userId: string): Promise<string> {
//   const fileExt = file.name.split('.').pop();
//   const fileName = `${userId}/${Date.now()}.${fileExt}`;

//   const { error } = await supabase.storage
//     .from('cv-uploads')
//     .upload(fileName, file, { upsert: true });

//   if (error) throw new Error(`CV upload failed: ${error.message}`);

//   // Signed URL (private bucket )
//   const { data } = await supabase.storage
//     .from('cv-uploads')
//     .createSignedUrl(fileName, 60 * 60 * 24 * 365); // 1 year

//   if (!data?.signedUrl) throw new Error('Could not get signed URL');
//   return data.signedUrl;
// }

// // Full candidate profile save
// export async function saveCandidate(
//   data: FullCandidateData,
//   userId: string
// ): Promise<void> {
//   const { basicData, professionalData, formData, cvFile, cvText } = data;
//   console.log('📝 cvText received:', cvText?.substring(0, 200));

//   // 1. Upload CV
//   const cvUrl = await uploadCV(cvFile, userId);

//   // 2. Insert candidate record
//   const { error } = await supabase
//     .from('candidates')
//     .upsert({
//       id: userId,
//       name: basicData.fullName,
//       email: basicData.email,
//       phone: basicData.mobileNumber,
//       country_code: basicData.countryCode,
//       dob: basicData.dob,
//       linkedin: basicData.linkedin,
//       age: typeof basicData.age === 'number' ? basicData.age : null,

//       interested_field: professionalData.interestedField,
//       years_of_experience: professionalData.yearsOfExperience,

//       skills: formData.skills,
//       status: formData.status,
//       availability: formData.availability,
//       willing_to_contact: formData.willingToContact === 'yes',
//       salary_range: formData.salaryRange,

//       cv_url: cvUrl,
//       cv_filename: cvFile.name,
//     ...(cvText ? { cv_text: cvText } : {}),  
//     });

//   // if (error) throw new Error(`Profile save failed: ${error.message}`);
//    if (error) {
//     console.error('❌ Upsert error:', error);   // 👈 DEBUG LINE
//     throw new Error(`Profile save failed: ${error.message}`);
//   }
// }

// // Fetch candidate profile (dashboard use)
// export async function getCandidateProfile(userId: string) {
//   const { data, error } = await supabase
//     .from('candidates')
//     .select('*')
//     .eq('id', userId)
//     .single();

//   if (error) throw new Error(error.message);
//   return data;
// }

// src/candidateService.ts
import { supabase } from '../supabaseClient';
import type { CandidateFormData, BasicInfoData, ProfessionalInfoData } from '../types/candidate';

export interface FullCandidateData {
  basicData: BasicInfoData;
  professionalData: ProfessionalInfoData;
  formData: CandidateFormData;
  cvFile: File;
  cvText?: string;
}

// -------------------------------------------------------------
// CV upload — SAME bucket 'cvs' for both auth & guest users
// -------------------------------------------------------------
export async function uploadCV(
  file: File,
  userId: string | null
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = userId
    ? `user-cvs/${userId}/${Date.now()}.${fileExt}`
    : `guest-cvs/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error } = await supabase.storage
    .from('cvs')
    .upload(fileName, file, { upsert: true });

  if (error) throw new Error(`CV upload failed: ${error.message}`);

  // Public URL (bucket is public)
  const { data } = supabase.storage
    .from('cvs')
    .getPublicUrl(fileName);

  if (!data?.publicUrl) throw new Error('Could not get public URL');
  return data.publicUrl;
}

// -------------------------------------------------------------
// Save candidate — routes to correct table based on auth state
// -------------------------------------------------------------
export async function saveCandidate(
  data: FullCandidateData,
  userId: string | null
): Promise<void> {
  const { basicData, professionalData, formData, cvFile, cvText } = data;
  console.log('📝 cvText received:', cvText?.substring(0, 200));

  // 1. Upload CV
  const cvUrl = await uploadCV(cvFile, userId);

  // 2. Build common payload
  const commonPayload = {
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
    ...(cvText ? { cv_text: cvText } : {}),
  };

  // 3. Route to the correct table
  if (userId) {
    // ✅ Authenticated → 'candidates' table
    const { error } = await supabase
      .from('candidates')
      .upsert({
        id: userId,
        ...commonPayload,
      });

    if (error) {
      console.error('❌ Upsert error:', error);
      throw new Error(`Profile save failed: ${error.message}`);
    }
  } else {
    // ✅ Guest → 'guest_candidates' table
    const { error } = await supabase
      .from('guest_candidates')
      .insert([
        {
          ...commonPayload,
          agree_to_contact: formData.willingToContact === 'yes',
          created_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('❌ Guest insert error:', error);
      throw new Error(`Guest save failed: ${error.message}`);
    }
  }
}

// -------------------------------------------------------------
// Fetch candidate profile (dashboard use)
// -------------------------------------------------------------
export async function getCandidateProfile(userId: string) {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
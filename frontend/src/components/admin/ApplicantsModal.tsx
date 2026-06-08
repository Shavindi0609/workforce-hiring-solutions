// src/components/ApplicantsModal.tsx
import { useState, useEffect } from 'react';
import { X, Download, Mail, Briefcase, GraduationCap } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import toast from 'react-hot-toast';

interface Candidate {
  name: string;
  email: string;
  interested_field: string;
  experience_level: string;
  cv_url: string;
}

interface Applicant {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  applied_at: string;
  candidates?: Candidate;
}

interface ApplicantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

export const ApplicantsModal = ({ isOpen, onClose, jobId, jobTitle }: ApplicantsModalProps) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && jobId) {
      fetchApplicants();
    }
  }, [isOpen, jobId]);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      
      // Fetch applications with candidate details
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          id,
          job_id,
          candidate_id,
          status,
          applied_at,
          candidates (
            name,
            email,
            interested_field,
            experience_level,
            cv_url
          )
        `)
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to ensure candidates is an object, not an array
      const transformedData: Applicant[] = (data || []).map((item: any) => ({
        ...item,
        candidates: Array.isArray(item.candidates) ? item.candidates[0] : item.candidates
      }));
      
      setApplicants(transformedData);
    } catch (error) {
      console.error('Error fetching applicants:', error);
      toast.error('Failed to load applicants');
      
      // Fallback method
      await fetchApplicantsFallback();
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicantsFallback = async () => {
    try {
      // First get all applications for this job
      const { data: applications, error: appError } = await supabase
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .order('applied_at', { ascending: false });

      if (appError) throw appError;

      if (!applications || applications.length === 0) {
        setApplicants([]);
        return;
      }

      // Then get candidate details for each application
      const candidateIds = applications.map(app => app.candidate_id);
      const { data: candidates, error: candError } = await supabase
        .from('candidates')
        .select('id, name, email, interested_field, experience_level, cv_url')
        .in('id', candidateIds);

      if (candError) throw candError;

      // Create a map of candidate by id
      const candidateMap = new Map();
      candidates?.forEach(candidate => {
        candidateMap.set(candidate.id, candidate);
      });

      // Merge the data
      const mergedData: Applicant[] = applications.map(app => ({
        id: app.id,
        job_id: app.job_id,
        candidate_id: app.candidate_id,
        status: app.status,
        applied_at: app.applied_at,
        candidates: candidateMap.get(app.candidate_id)
      }));

      setApplicants(mergedData);
    } catch (error) {
      console.error('Fallback fetch error:', error);
      toast.error('Failed to load applicants');
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string) => {
    try {
      setUpdatingStatus(applicationId);
      const { error } = await supabase
        .from('job_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', applicationId);

      if (error) throw error;
      
      toast.success(`Application ${status.toLowerCase()} successfully`);
      await fetchApplicants(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const downloadCV = (cvUrl: string) => {
    if (!cvUrl) {
      toast.error('No CV available for this candidate');
      return;
    }
    
    window.open(cvUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Applicants for: {jobTitle}</h2>
            <p className="text-sm text-gray-500 mt-1">{applicants.length} candidate(s) applied</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No applicants yet for this position.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applicants.map((applicant) => (
                <div key={applicant.id} className="border rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-lg">
                            {applicant.candidates?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{applicant.candidates?.name || 'Unknown'}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Mail size={14} />
                            <span>{applicant.candidates?.email || 'No email'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {applicant.candidates?.interested_field && (
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase size={14} className="text-gray-400" />
                            <span>Field: <strong>{applicant.candidates.interested_field}</strong></span>
                          </div>
                        )}
                        {applicant.candidates?.experience_level && (
                          <div className="flex items-center gap-2 text-sm">
                            <GraduationCap size={14} className="text-gray-400" />
                            <span>Experience: <strong>{applicant.candidates.experience_level}</strong></span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <span>Applied: {new Date(applicant.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <select
                        value={applicant.status}
                        onChange={(e) => updateApplicationStatus(applicant.id, e.target.value)}
                        disabled={updatingStatus === applicant.id}
                        className="px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Reviewed">Reviewed</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      
                      {applicant.candidates?.cv_url && (
                        <button
                          onClick={() => downloadCV(applicant.candidates!.cv_url)}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
                        >
                          <Download size={14} />
                          Download CV
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="mt-3 pt-3 border-t">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      applicant.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      applicant.status === 'Reviewed' ? 'bg-blue-100 text-blue-700' :
                      applicant.status === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {applicant.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
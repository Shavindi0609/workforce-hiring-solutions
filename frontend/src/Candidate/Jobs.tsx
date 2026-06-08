// src/pages/candidate/Jobs.tsx
import { useState, useEffect } from 'react';
import { MapPin, Briefcase, Clock, DollarSign, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useJobs } from '../hooks/useJobs';
import toast from 'react-hot-toast';

export default function CandidateJobs() {
  const { jobs, loading, refetch } = useJobs();
  const [selectedField, setSelectedField] = useState('All');
  const [candidateProfile, setCandidateProfile] = useState<any>(null);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingForJob, setApplyingForJob] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedJobTitle, setSelectedJobTitle] = useState('');

  const fields = ['All', 'Software Development', 'Data Science', 'UI/UX Design', 'Marketing', 'Sales', 'HR'];

  useEffect(() => {
    loadCandidateProfile();
    loadAppliedJobs();
  }, []);

  useEffect(() => {
    refetch(selectedField);
  }, [selectedField, refetch]);

  const loadCandidateProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Select only columns that exist in your table
        const { data, error } = await supabase
          .from('candidates')
          .select('interested_field, name, email') // Removed experience_level if it doesn't exist
          .eq('id', user.id)
          .maybeSingle();
      
        if (error) {
          console.error('Error loading profile:', error);
        } else if (data) {
          setCandidateProfile(data);
        }
      }
    } catch (error) {
      console.error('Error in loadCandidateProfile:', error);
    }
  };

  const loadAppliedJobs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('job_applications')
          .select('job_id')
          .eq('candidate_id', user.id);
      
        if (error) {
          console.error('Error loading applied jobs:', error);
        } else if (data) {
          setAppliedJobs(new Set(data.map(app => app.job_id)));
        }
      }
    } catch (error) {
      console.error('Error in loadAppliedJobs:', error);
    }
  };

  const handleApplyClick = (jobId: string, jobTitle: string) => {
    if (appliedJobs.has(jobId)) {
      toast.error('You have already applied for this job');
      return;
    }
    
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setShowConfirmModal(true);
  };

  const confirmApply = async () => {
    if (!selectedJobId) return;
    
    setApplyingForJob(selectedJobId);
    setShowConfirmModal(false);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please login to apply');
      setApplyingForJob(null);
      return;
    }

    // Check if candidate profile exists
    if (!candidateProfile) {
      toast.error('Please complete your profile before applying');
      setApplyingForJob(null);
      return;
    }

    const { error } = await supabase
      .from('job_applications')
      .insert([{
        job_id: selectedJobId,
        candidate_id: user.id,
        status: 'Pending',
        applied_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Application error:', error);
      if (error.code === '23505') {
        toast.error('You have already applied for this job');
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } else {
      toast.success(`Successfully applied for "${selectedJobTitle}"!`);
      setAppliedJobs(prev => new Set(prev).add(selectedJobId));
    }
    
    setApplyingForJob(null);
    setSelectedJobId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Available Jobs</h1>
        <p className="text-gray-600">Find your next career opportunity</p>
      </div>

      {/* Profile Completion Warning */}
      {!candidateProfile && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Profile Not Found</p>
              <p className="text-sm text-yellow-700">Please complete your candidate profile before applying for jobs.</p>
              <a href="/candidate/registration" className="text-sm text-yellow-800 font-medium hover:underline mt-1 inline-block">
                Complete Profile →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-500" />
          <span className="text-sm font-medium">Filter by Field</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {fields.map(field => (
            <button
              key={field}
              onClick={() => setSelectedField(field)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                selectedField === field
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {field}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended based on profile */}
      {candidateProfile && candidateProfile.interested_field && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            📌 Based on your interest in <strong>{candidateProfile.interested_field}</strong>, 
            we've highlighted relevant jobs for you.
          </p>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{jobs.length}</p>
          <p className="text-xs text-gray-500">Available Jobs</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{appliedJobs.size}</p>
          <p className="text-xs text-gray-500">Applied Jobs</p>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {jobs.filter(j => candidateProfile?.interested_field === j.field).length}
          </p>
          <p className="text-xs text-gray-500">Recommended</p>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map((job) => {
          const isRelevant = candidateProfile?.interested_field === job.field;
          const isApplied = appliedJobs.has(job.id);
          const isApplying = applyingForJob === job.id;
          
          return (
            <div
              key={job.id}
              className={`bg-white rounded-xl border p-6 hover:shadow-lg transition ${
                isRelevant ? 'border-blue-300 bg-blue-50/30' : ''
              } ${isApplied ? 'opacity-75' : ''}`}
            >
              {isRelevant && (
                <div className="mb-3">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Recommended for you
                  </span>
                </div>
              )}
              
              {isApplied && (
                <div className="mb-3">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full inline-flex items-center gap-1">
                    <CheckCircle size={12} />
                    Applied
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold mb-2">{job.title}</h3>
              
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Briefcase size={16} />
                  <span>{job.job_type}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={16} />
                  <span>{job.location || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Clock size={16} />
                  <span>{job.experience_level}</span>
                </div>
                {job.salary_range && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <DollarSign size={16} />
                    <span>{job.salary_range}</span>
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

              {job.requirements && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Requirements:</p>
                  <p className="text-sm text-gray-600">{job.requirements}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-xs text-gray-500">
                  Posted: {new Date(job.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleApplyClick(job.id, job.title)}
                  disabled={isApplied || isApplying}
                  className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                    isApplied
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isApplying
                      ? 'bg-gray-400 text-white cursor-wait'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isApplying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Applying...
                    </>
                  ) : isApplied ? (
                    <>
                      <CheckCircle size={16} />
                      Applied
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No jobs available at the moment.</p>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">Confirm Application</h2>
              <p className="text-gray-600">
                Are you sure you want to apply for <strong className="text-blue-600">{selectedJobTitle}</strong>?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Your application will include:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Your name: {candidateProfile?.name || 'Not provided'}</li>
                <li>✓ Your email: {candidateProfile?.email || 'Not provided'}</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmApply}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
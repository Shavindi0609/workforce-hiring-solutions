import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Users, UserPlus, Sparkles, Search, Filter } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useJobs } from '../hooks/useJobs';
import { ApplicantsModal } from '../components/admin/ApplicantsModal';
import type { Job } from '../types/job';

export default function JobsManagement() {
  const { jobs, loading, createJob, updateJob, deleteJob } = useJobs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showCandidateBasedForm, setShowCandidateBasedForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    field: '',
    experience_level: '',
    salary_range: '',
    location: '',
    job_type: 'Full-time',
    status: 'Open' as 'Open' | 'Closed' | 'On Hold'
  });

  const fields = ['Software Development', 'Data Science', 'UI/UX Design', 'Marketing', 'Sales', 'HR'];
  const experienceLevels = ['Fresher (0-1 years)', '1-3 years', '3-5 years', '5+ years'];
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];
  const statuses: Array<'Open' | 'Closed' | 'On Hold'> = ['Open', 'Closed', 'On Hold'];

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fetch candidates
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id, name, email, interested_field, experience_level, availability, salary_range')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedJob) {
      await updateJob(selectedJob.id, formData);
    } else {
      await createJob(formData);
    }
    setIsModalOpen(false);
    setShowCandidateBasedForm(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedJob(null);
    setSelectedCandidate(null);
    setFormData({
      title: '',
      description: '',
      requirements: '',
      field: '',
      experience_level: '',
      salary_range: '',
      location: '',
      job_type: 'Full-time',
      status: 'Open'
    });
  };

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements || '',
      field: job.field,
      experience_level: job.experience_level,
      salary_range: job.salary_range || '',
      location: job.location || '',
      job_type: job.job_type,
      status: job.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      await deleteJob(id);
    }
  };

  const handleViewApplicants = (job: Job) => {
    setSelectedJobForApplicants(job);
    setShowApplicantsModal(true);
  };

  const handleCreateJobForCandidate = (candidate: any) => {
    setSelectedCandidate(candidate);
    // Auto-fill form with candidate's profile
    setFormData({
      title: `${candidate.interested_field} Specialist`,
      description: `We are looking for a talented ${candidate.interested_field} professional to join our team.\n\n**About the Role:**\nThis is an excellent opportunity for someone with ${candidate.experience_level || 'relevant'} experience in ${candidate.interested_field}.\n\n**What We Offer:**\n- Competitive salary (${candidate.salary_range || 'negotiable'})\n- Flexible work arrangements\n- Professional development opportunities\n- Great team environment\n\n**Start Date:** ${candidate.availability === 'Immediate' ? 'Immediate start available' : 'Flexible start date'}\n\nIf you're passionate about ${candidate.interested_field} and ready to make an impact, we want to hear from you!`,
      requirements: `${candidate.experience_level || 'Relevant'} experience in ${candidate.interested_field}\nStrong problem-solving and analytical skills\nExcellent communication and teamwork abilities\nBachelor's degree in related field (preferred)\nPortfolio or project examples (if applicable)\nAbility to work independently and in a team`,
      field: candidate.interested_field || '',
      experience_level: candidate.experience_level || '',
      salary_range: candidate.salary_range || '',
      location: 'Remote',
      job_type: 'Full-time',
      status: 'Open'
    });
    setShowCandidateBasedForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Jobs Management</h1>
          <p className="text-sm text-gray-500">Create and manage job postings</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Job</span>
            <span className="sm:hidden">Add</span>
          </button>
          <button
            onClick={() => setShowCandidateBasedForm(true)}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-700"
          >
            <UserPlus size={16} /> <span className="hidden sm:inline">Create Job for Candidate</span>
            <span className="sm:hidden">For Candidate</span>
          </button>
        </div>
      </div>

      {/* Search and Filter - Responsive */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Closed">Closed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Jobs Table - Horizontally scrollable on mobile */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] sm:min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 sm:p-4 text-sm font-medium text-gray-600">Title</th>
                <th className="text-left p-3 sm:p-4 text-sm font-medium text-gray-600 hidden sm:table-cell">Field</th>
                <th className="text-left p-3 sm:p-4 text-sm font-medium text-gray-600 hidden md:table-cell">Experience</th>
                <th className="text-left p-3 sm:p-4 text-sm font-medium text-gray-600 hidden lg:table-cell">Location</th>
                <th className="text-left p-3 sm:p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-3 sm:p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No jobs found
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 sm:p-4">
                      <div>
                        <p className="font-medium text-sm">{job.title}</p>
                        <p className="text-xs text-gray-500 mt-1 sm:hidden">{job.field}</p>
                        <p className="text-xs text-gray-500 sm:hidden">{job.job_type}</p>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 hidden sm:table-cell">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs whitespace-nowrap">
                        {job.field}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-sm hidden md:table-cell">{job.experience_level}</td>
                    <td className="p-3 sm:p-4 text-sm hidden lg:table-cell">{job.location || 'Remote'}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        job.status === 'Open' ? 'bg-green-100 text-green-700' :
                        job.status === 'Closed' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex gap-1 sm:gap-2">
                        <button
                          onClick={() => handleEdit(job)}
                          className="p-1.5 sm:p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Job"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleViewApplicants(job)}
                          className="p-1.5 sm:p-1 text-green-600 hover:bg-green-50 rounded"
                          title="View Applicants"
                        >
                          <Users size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="p-1.5 sm:p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Job"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regular Job Modal - Responsive */}
      {isModalOpen && !showCandidateBasedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {selectedJob ? 'Edit Job' : 'Add New Job'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Field/Category *</label>
                  <select
                    required
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select field</option>
                    {fields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Requirements</label>
                  <textarea
                    rows={3}
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="List the requirements for this position..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Experience Level *</label>
                    <select
                      required
                      value={formData.experience_level}
                      onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select experience</option>
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Job Type</label>
                    <select
                      value={formData.job_type}
                      onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Salary Range</label>
                    <input
                      type="text"
                      value={formData.salary_range}
                      onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                      placeholder="e.g., 50000-80000"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., Colombo or Remote"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Open' | 'Closed' | 'On Hold' })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full sm:flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {selectedJob ? 'Update' : 'Create'} Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Candidate-Based Job Creation Modal - Responsive */}
      {showCandidateBasedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-bold">Create Job for Candidate</h2>
                <p className="text-sm text-gray-500">Select a candidate to create a personalized job posting</p>
              </div>
              <button onClick={() => {
                setShowCandidateBasedForm(false);
                resetForm();
              }} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {/* Candidate Selection */}
              {!selectedCandidate ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select a Candidate</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {candidates.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No candidates found</p>
                      </div>
                    ) : (
                      candidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="border rounded-lg p-4 hover:shadow-md cursor-pointer transition"
                          onClick={() => handleCreateJobForCandidate(candidate)}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg truncate">{candidate.name || 'Anonymous'}</h4>
                              <p className="text-sm text-gray-600 truncate">{candidate.email}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                  {candidate.interested_field || 'No field'}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                  {candidate.experience_level || 'No experience'}
                                </span>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                                  {candidate.availability || 'Availability unknown'}
                                </span>
                              </div>
                            </div>
                            <Sparkles className="text-yellow-500 flex-shrink-0" size={20} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                // Job Creation Form Pre-filled with Candidate Data
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <h3 className="font-semibold mb-2">Creating job for: {selectedCandidate.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <p><strong>Field:</strong> {selectedCandidate.interested_field}</p>
                      <p><strong>Experience:</strong> {selectedCandidate.experience_level}</p>
                      <p><strong>Availability:</strong> {selectedCandidate.availability}</p>
                      <p><strong>Expected Salary:</strong> {selectedCandidate.salary_range}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Field/Category *</label>
                    <select
                      required
                      value={formData.field}
                      onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select field</option>
                      {fields.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Requirements</label>
                    <textarea
                      rows={3}
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="List the requirements for this position..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Experience Level *</label>
                      <select
                        required
                        value={formData.experience_level}
                        onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select experience</option>
                        {experienceLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Job Type</label>
                      <select
                        value={formData.job_type}
                        onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {jobTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Salary Range</label>
                      <input
                        type="text"
                        value={formData.salary_range}
                        onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                        placeholder="e.g., 50000-80000"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="e.g., Colombo or Remote"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Open' | 'Closed' | 'On Hold' })}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedCandidate(null)}
                      className="w-full sm:flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      Back to Candidate List
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Create Job
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Applicants Modal */}
      {showApplicantsModal && selectedJobForApplicants && (
        <ApplicantsModal
          isOpen={showApplicantsModal}
          onClose={() => setShowApplicantsModal(false)}
          jobId={selectedJobForApplicants.id}
          jobTitle={selectedJobForApplicants.title}
        />
      )}
    </div>
  );
}
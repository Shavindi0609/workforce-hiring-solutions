// src/Admin/CandidateDetailsModal.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { X, Download, Eye, FileText, Mail, Phone, Calendar, Briefcase, Clock, DollarSign, MapPin } from 'lucide-react';

interface CandidateDetailsModalProps {
    candidateId: string;
    onClose: () => void;
}

interface CandidateFullDetails {
    id: string;
    name: string;
    email: string;
    phone: string;
    country_code: string;
    dob: string;
    linkedin: string;
    interested_field: string;
    years_of_experience: string;
    skills: string[];
    status: string;
    availability: string;
    willing_to_contact: boolean;
    salary_range: string;
    cv_url: string;
    cv_filename: string;
    created_at: string;
}

export default function CandidateDetailsModal({ candidateId, onClose }: CandidateDetailsModalProps) {
    const [candidate, setCandidate] = useState<CandidateFullDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCandidateDetails();
    }, [candidateId]);

    const fetchCandidateDetails = async () => {
        try {
            setLoading(true);
            const { data, error: fetchError } = await supabase
                .from('candidates')
                .select('*')
                .eq('id', candidateId)
                .single();

            if (fetchError) throw fetchError;
            setCandidate(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleViewCV = () => {
        if (candidate?.cv_url) {
            window.open(candidate.cv_url, '_blank');
        } else {
            alert('No CV uploaded yet.');
        }
    };

    const handleDownloadCV = () => {
        if (candidate?.cv_url) {
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = candidate.cv_url;
            link.download = candidate.cv_filename || 'cv.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('No CV uploaded yet.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Candidate Details</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading candidate details...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-600">
                        <p>Error: {error}</p>
                    </div>
                ) : candidate ? (
                    <div className="p-6">
                        {/* Profile Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{candidate.name}</h3>
                                <p className="text-gray-600 mt-1">{candidate.interested_field || 'No field specified'}</p>
                            </div>
                            <div className="flex gap-2">
                                {candidate.cv_url && (
                                    <>
                                        <button
                                            onClick={handleViewCV}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <Eye size={16} />
                                            View CV
                                        </button>
                                        <button
                                            onClick={handleDownloadCV}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            <Download size={16} />
                                            Download
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText size={20} />
                                    Personal Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail size={16} />
                                        <span>{candidate.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone size={16} />
                                        <span>{candidate.country_code} {candidate.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Calendar size={16} />
                                        <span>DOB: {candidate.dob || 'Not specified'}</span>
                                    </div>
                                    {candidate.linkedin && (
                                        <div className="flex items-center gap-3">
                                            <Briefcase size={16} />
                                            <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" 
                                               className="text-blue-600 hover:underline">
                                                LinkedIn Profile
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Briefcase size={20} />
                                    Professional Information
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Clock size={16} />
                                        <span>Experience: {candidate.years_of_experience || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <DollarSign size={16} />
                                        <span>Salary Range: {candidate.salary_range || 'Not specified'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            candidate.status === 'Actively Looking'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {candidate.status || 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600">Availability:</span>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                            {candidate.availability || 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-gray-600">Open to Contact:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            candidate.willing_to_contact
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {candidate.willing_to_contact ? 'Yes' : 'No'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="mt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills && candidate.skills.length > 0 ? (
                                    candidate.skills.map((skill) => (
                                        <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No skills listed</p>
                                )}
                            </div>
                        </div>

                        {/* CV Section */}
                        {candidate.cv_url && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">CV / Resume</h4>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText size={24} className="text-blue-600" />
                                        <div>
                                            <p className="font-medium">{candidate.cv_filename || 'CV Document'}</p>
                                            <p className="text-sm text-gray-500">Uploaded on {new Date(candidate.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleViewCV}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                                        >
                                            View CV
                                        </button>
                                        <button
                                            onClick={handleDownloadCV}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                        >
                                            Download
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
}
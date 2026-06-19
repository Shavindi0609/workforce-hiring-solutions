import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Candidate, CreateCandidateDto } from '../types/candidate';

interface CandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCandidateDto | Partial<Candidate>) => Promise<void>;
    candidate?: Candidate | null;
    title: string;
    fields?: Array<{ id: string; name: string; status: string }>; // Add fields prop
}

const STATUSES = ['Actively Looking', 'Open to Opportunities'];
const AVAILABILITY = ['Immediate', '2 Weeks', '1 Month', '2 Months', '3 Months'];
const EXPERIENCE = ['0-1 Years', '1-2 Years', '2-3 Years', '3-4 Years', '4-5 Years', '5+ Years'];

export const CandidateModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    candidate, 
    title,
    fields = [] 
}: CandidateModalProps) => {
    const [formData, setFormData] = useState<CreateCandidateDto | Partial<Candidate>>({
        name: '',
        email: '',
        phone: '',
        field: '',
        experience: EXPERIENCE[0],
        status: 'Actively Looking',
        availability: AVAILABILITY[0],
        salary_min: 0,
        salary_max: 0,
        salary_range: '',
        skills: [],
    });
    const [loading, setLoading] = useState(false);

    // Get active fields (only show active fields in dropdown)
    const activeFields = fields.filter(field => field.status === 'Active');

    useEffect(() => {
        if (candidate) {
            setFormData({
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone || '',
                field: candidate.field,
                experience: candidate.experience || EXPERIENCE[0],
                status: candidate.status || 'Actively Looking',
                availability: candidate.availability || AVAILABILITY[0],
                salary_min: candidate.salary_min || 0,
                salary_max: candidate.salary_max || 0,
                salary_range: candidate.salary_range || '',
                skills: candidate.skills || [],
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                field: activeFields.length > 0 ? activeFields[0].name : '',
                experience: EXPERIENCE[0],
                status: 'Actively Looking',
                availability: AVAILABILITY[0],
                salary_min: 0,
                salary_max: 0,
                salary_range: '',
                skills: [],
            });
        }
    }, [candidate, isOpen, activeFields]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate that a field is selected
        if (!formData.field) {
            alert('Please select a field');
            return;
        }

        setLoading(true);
        try {
            // Auto-generate salary_range from min/max
            if (formData.salary_min && formData.salary_max) {
                formData.salary_range = `${formData.salary_min.toLocaleString()} - ${formData.salary_max.toLocaleString()}`;
            }
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Field *</label>
                            {activeFields.length === 0 ? (
                                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                                    No active fields available. Please add fields in the Fields management page first.
                                </div>
                            ) : (
                                <select
                                    required
                                    value={formData.field}
                                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select a field</option>
                                    {activeFields.map(field => (
                                        <option key={field.id} value={field.name}>
                                            {field.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                            <select
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {EXPERIENCE.map(exp => (
                                    <option key={exp} value={exp}>{exp}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                            <select
                                value={formData.availability}
                                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {AVAILABILITY.map(avail => (
                                    <option key={avail} value={avail}>{avail}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary</label>
                                <input
                                    type="number"
                                    value={formData.salary_min}
                                    onChange={(e) => setFormData({ ...formData, salary_min: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                                <input
                                    type="number"
                                    value={formData.salary_max}
                                    onChange={(e) => setFormData({ ...formData, salary_max: parseInt(e.target.value) || 0 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || activeFields.length === 0}
                            className={`w-full sm:flex-1 px-4 py-2 rounded-lg transition-colors
                                ${loading || activeFields.length === 0 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700'} 
                                text-white`}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
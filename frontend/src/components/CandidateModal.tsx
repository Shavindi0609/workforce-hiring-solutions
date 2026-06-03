// src/components/CandidateModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Candidate, CreateCandidateDto } from '../types/candidate';

interface CandidateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateCandidateDto | Partial<Candidate>) => Promise<void>;
    candidate?: Candidate | null;
    title: string;
}

const FIELDS = ['Web Development', 'UI/UX Design', 'Data Science', 'Digital Marketing', 'Mobile Development', 'HR & Recruitment', 'DevOps', 'AI / ML'];
const STATUSES = ['Actively Looking', 'Open to Opportunities'];
const AVAILABILITY = ['Immediate', '2 Weeks', '1 Month', '2 Months', '3 Months'];
const EXPERIENCE = ['0-1 Years', '1-2 Years', '2-3 Years', '3-4 Years', '4-5 Years', '5+ Years'];

export const CandidateModal = ({ isOpen, onClose, onSubmit, candidate, title }: CandidateModalProps) => {
    const [formData, setFormData] = useState<CreateCandidateDto | Partial<Candidate>>({
        name: '',
        email: '',
        phone: '',
        field: FIELDS[0],
        experience: EXPERIENCE[0],
        status: 'Actively Looking',
        availability: AVAILABILITY[0],
        salary_min: 0,
        salary_max: 0,
        salary_range: '',
        skills: [],
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (candidate) {
            setFormData({
                name: candidate.name,
                email: candidate.email,
                phone: candidate.phone,
                field: candidate.field,
                experience: candidate.experience,
                status: candidate.status,
                availability: candidate.availability,
                salary_min: candidate.salary_min,
                salary_max: candidate.salary_max,
                salary_range: candidate.salary_range,
                skills: candidate.skills || [],
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                field: FIELDS[0],
                experience: EXPERIENCE[0],
                status: 'Actively Looking',
                availability: AVAILABILITY[0],
                salary_min: 0,
                salary_max: 0,
                salary_range: '',
                skills: [],
            });
        }
    }, [candidate, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
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
                            <select
                                value={formData.field}
                                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {FIELDS.map(field => (
                                    <option key={field} value={field}>{field}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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

                    <div className="grid grid-cols-2 gap-4">
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
                                    onChange={(e) => setFormData({ ...formData, salary_min: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Salary</label>
                                <input
                                    type="number"
                                    value={formData.salary_max}
                                    onChange={(e) => setFormData({ ...formData, salary_max: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
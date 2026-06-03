// src/components/SkillModal.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Skill, CreateSkillDto } from '../types/skill';

interface SkillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateSkillDto | Partial<Skill>) => Promise<void>;
    skill?: Skill | null;
    title: string;
}

const FIELDS = [
    'Web Development',
    'UI/UX Design',
    'Digital Marketing',
    'Data Science',
    'Mobile Development',
    'DevOps',
    'AI / ML',
    'HR & Recruitment',
    'Content Writing'
];

export const SkillModal = ({ isOpen, onClose, onSubmit, skill, title }: SkillModalProps) => {
    const [formData, setFormData] = useState<CreateSkillDto | Partial<Skill>>({
        name: '',
        field: FIELDS[0],
        status: 'Active',
        candidates_count: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (skill) {
            setFormData({
                name: skill.name,
                field: skill.field,
                status: skill.status,
                candidates_count: skill.candidates_count,
            });
        } else {
            setFormData({
                name: '',
                field: FIELDS[0],
                status: 'Active',
                candidates_count: 0,
            });
        }
    }, [skill, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
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
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Skill Name *
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter skill name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Field *
                        </label>
                        <select
                            required
                            value={formData.field}
                            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {FIELDS.map(field => (
                                <option key={field} value={field}>{field}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Candidates Count
                        </label>
                        <input
                            type="number"
                            value={formData.candidates_count}
                            onChange={(e) => setFormData({ ...formData, candidates_count: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Number of candidates"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
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
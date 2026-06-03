// src/Admin/Skills.tsx
import { useState } from 'react';
import { Search, Edit2, Trash2, MoreVertical, Plus, Award, TrendingUp, Archive, Filter } from 'lucide-react';
import { useSkills } from '../hooks/useSkills';
import { SkillModal } from '../components/SkillModal';
import type { Skill, CreateSkillDto } from '../types/skill';

export default function Skills() {
    const [searchTerm, setSearchTerm] = useState('');
    const [fieldFilter, setFieldFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
    const [modalTitle, setModalTitle] = useState('');

    const { skills, loading, createSkill, updateSkill, deleteSkill, fetchSkills, getStatistics } = useSkills();
    const stats = getStatistics();

    // Get unique fields for filter
    const uniqueFields = ['All', ...new Set(skills.map(skill => skill.field))];

    const filteredSkills = skills.filter(skill => {
        const matchesSearch = skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              skill.field.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesField = fieldFilter === 'All' || skill.field === fieldFilter;
        const matchesStatus = statusFilter === 'All' || skill.status === statusFilter;
        return matchesSearch && matchesField && matchesStatus;
    });

    const handleAddSkill = () => {
        setSelectedSkill(null);
        setModalTitle('Add New Skill');
        setIsModalOpen(true);
    };

    const handleEditSkill = (skill: Skill) => {
        setSelectedSkill(skill);
        setModalTitle('Edit Skill');
        setIsModalOpen(true);
    };

    const handleDeleteSkill = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this skill?')) {
            await deleteSkill(id);
        }
    };

    const handleSubmit = async (data: CreateSkillDto | Partial<Skill>) => {
        if (selectedSkill) {
            await updateSkill(selectedSkill.id, data);
        } else {
            await createSkill(data as CreateSkillDto);
        }
    };

    const handleApplyFilters = () => {
        fetchSkills({
            search: searchTerm,
            field: fieldFilter,
            status: statusFilter
        });
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setFieldFilter('All');
        setStatusFilter('All');
        fetchSkills();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading skills...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Skills</h1>
                    <p className="text-sm text-gray-500">Manage candidate skills</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} /> Add Skill
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-8 mb-8">
                <StatCard
                    title="Total Skills" 
                    value={stats.total.toString()} 
                    sub="100% of total" 
                    icon={<Award size={28} className="text-blue-500" />}
                    bgColor="bg-blue-50"
                />
                <StatCard 
                    title="Active Skills" 
                    value={stats.active.toString()} 
                    sub={`${stats.activePercentage.toFixed(1)}% of total`} 
                    color="text-green-600"
                    icon={<TrendingUp size={28} className="text-green-500" />}
                    bgColor="bg-green-50"
                />
                <StatCard 
                    title="Inactive Skills" 
                    value={stats.inactive.toString()} 
                    sub={`${stats.inactivePercentage.toFixed(1)}% of total`} 
                    color="text-orange-500"
                    icon={<Archive size={28} className="text-orange-500" />}
                    bgColor="bg-orange-50"
                />
            </div>

            {/* Search and Filters Section */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 flex flex-wrap items-center gap-4">
                <div className="relative flex-grow min-w-[250px]">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by skill name or field..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <select 
                    className="px-4 py-2 border rounded-xl text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={fieldFilter}
                    onChange={(e) => setFieldFilter(e.target.value)}
                >
                    {uniqueFields.map(field => (
                        <option key={field} value={field}>{field === 'All' ? 'All Fields' : field}</option>
                    ))}
                </select>

                <select 
                    className="px-4 py-2 border rounded-xl text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>

                <button 
                    onClick={handleApplyFilters}
                    className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    Apply Filters
                </button>

                <button 
                    onClick={handleClearFilters}
                    className="bg-white text-gray-600 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors border border-gray-200 flex items-center gap-2"
                >
                    <Filter size={16} /> Clear
                </button>
            </div>

            {/* Skills Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase border-b bg-gray-50">
                            <th className="p-4 w-12 text-center">#</th>
                            <th className="p-4">Skill Name</th>
                            <th className="p-4">Field</th>
                            <th className="p-4 text-center">Candidates</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredSkills.map((skill, index) => (
                            <tr key={skill.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-center text-gray-700 font-medium">{index + 1}</td>
                                <td className="p-4 font-medium text-gray-900">{skill.name}</td>
                                <td className="p-4 text-gray-500">{skill.field}</td>
                                <td className="p-4 text-center font-medium">{skill.candidates_count.toLocaleString()}</td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-medium ${
                                        skill.status === 'Active' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {skill.status}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handleEditSkill(skill)}
                                            className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteSkill(skill.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors" title="More">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredSkills.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No skills found</p>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-500 bg-gray-50">
                    <p>Showing {filteredSkills.length} of {skills.length} skills</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
                        <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors">2</button>
                        <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors">3</button>
                        <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors">Next</button>
                    </div>
                </div>
            </div>

            {/* Skill Modal */}
            <SkillModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                skill={selectedSkill}
                title={modalTitle}
            />
        </div>
    );
}

const StatCard = ({ title, value, sub, color = "text-gray-900", icon, bgColor = "bg-gray-50" }: { 
    title: string; 
    value: string; 
    sub: string; 
    color?: string; 
    icon?: React.ReactNode; 
    bgColor?: string;
}) => (
    <div className="bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md">
        <div className="flex items-start gap-4">
            {icon && (
                <div className={`p-3 rounded-xl ${bgColor}`}>
                    {icon}
                </div>
            )}
            <div className="flex-1">
                <p className="text-gray-400 text-xs uppercase tracking-wider">{title}</p>
                <h3 className={`text-3xl font-bold ${color} mt-2`}>{value}</h3>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
            </div>
        </div>
    </div>
);
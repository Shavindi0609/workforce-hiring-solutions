// src/Admin/Fields.tsx
import { useState } from 'react';
import { Search, Edit2, Trash2, MoreVertical, Plus, Briefcase, TrendingUp, Archive } from 'lucide-react';
import { useFields } from '../hooks/useFields';
import { FieldModal } from '../components/FieldModal';
import type { Field, CreateFieldDto } from '../types/field';

export default function Fields() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [modalTitle, setModalTitle] = useState('');

    const { fields, loading, createField, updateField, deleteField, fetchFields, getStatistics } = useFields();
    const stats = getStatistics();

    const filteredFields = fields.filter(field => {
        const matchesSearch = field.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              field.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const handleAddField = () => {
        setSelectedField(null);
        setModalTitle('Add New Field');
        setIsModalOpen(true);
    };

    const handleEditField = (field: Field) => {
        setSelectedField(field);
        setModalTitle('Edit Field');
        setIsModalOpen(true);
    };

    const handleDeleteField = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this field?')) {
            await deleteField(id);
        }
    };

    const handleSubmit = async (data: CreateFieldDto | Partial<Field>) => {
        if (selectedField) {
            await updateField(selectedField.id, data);
        } else {
            await createField(data as CreateFieldDto);
        }
    };

    const handleSearch = () => {
        fetchFields(searchTerm);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading fields...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Fields</h1>
                    <p className="text-sm text-gray-500">Manage candidate fields</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleAddField}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={16} /> Add Field
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-8 mb-8">
                <StatCard 
                    title="Total Fields" 
                    value={stats.total.toString()} 
                    sub="100% of total" 
                    icon={<Briefcase size={28} className="text-blue-500" />}
                    bgColor="bg-blue-50"
                />
                <StatCard 
                    title="Active Fields" 
                    value={stats.active.toString()} 
                    sub={`${stats.activePercentage.toFixed(1)}% of total`} 
                    color="text-green-600"
                    icon={<TrendingUp size={28} className="text-green-500" />}
                    bgColor="bg-green-50"
                />
                <StatCard 
                    title="Inactive Fields" 
                    value={stats.inactive.toString()} 
                    sub={`${stats.inactivePercentage.toFixed(1)}% of total`} 
                    color="text-orange-500"
                    icon={<Archive size={28} className="text-orange-500" />}
                    bgColor="bg-orange-50"
                />
            </div>

            {/* Search Section */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6">
                <div className="flex gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by field name or description..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Fields Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase border-b bg-gray-50">
                            <th className="p-4 w-12 text-center">#</th>
                            <th className="p-4">Field Name</th>
                            <th className="p-4">Description</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-center">Candidates</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredFields.map((field, index) => (
                            <tr key={field.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4 text-center text-gray-700 font-medium">{index + 1}</td>
                                <td className="p-4 font-medium text-gray-900">{field.name}</td>
                                <td className="p-4 text-gray-500">{field.description}</td>
                                <td className="p-4 text-center">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-medium ${
                                        field.status === 'Active' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {field.status}
                                    </span>
                                </td>
                                <td className="p-4 text-center font-medium">{field.candidates_count}</td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handleEditField(field)}
                                            className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteField(field.id)}
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
                
                {filteredFields.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No fields found</p>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-500 bg-gray-50">
                    <p>Showing {filteredFields.length} of {fields.length} fields</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
                        <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors">2</button>
                        <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors">Next</button>
                    </div>
                </div>
            </div>

            {/* Field Modal */}
            <FieldModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                field={selectedField}
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
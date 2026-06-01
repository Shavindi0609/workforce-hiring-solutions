// src/pages/CandidatesPage.tsx
import { useState } from 'react';
import { Search, Filter, ChevronDown, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useCandidates } from '../hooks/useCandidates';
import { CandidateModal } from '../components/CandidateModal';
import toast from 'react-hot-toast';
import type { Candidate, CreateCandidateDto } from '../types/candidate';

export default function CandidatesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [fieldFilter, setFieldFilter] = useState('All Fields');
    const [statusFilter, setStatusFilter] = useState('All');
    const [availabilityFilter, setAvailabilityFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [modalTitle, setModalTitle] = useState('');

    const { 
        candidates, 
        loading, 
        createCandidate, 
        updateCandidate, 
        deleteCandidate,
        fetchCandidates,
        getStatistics 
    } = useCandidates();

    const stats = getStatistics();

    // Get unique filters
    const uniqueFields = ['All Fields', ...new Set(candidates.map(c => c.field))];
    const uniqueStatuses = ['All', ...new Set(candidates.map(c => c.status))];
    const uniqueAvailability = ['All', ...new Set(candidates.map(c => c.availability))];

    // Apply filters
    const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             candidate.field.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesField = fieldFilter === 'All Fields' || candidate.field === fieldFilter;
        const matchesStatus = statusFilter === 'All' || candidate.status === statusFilter;
        const matchesAvailability = availabilityFilter === 'All' || candidate.availability === availabilityFilter;
        return matchesSearch && matchesField && matchesStatus && matchesAvailability;
    });

    const handleAddCandidate = () => {
        setSelectedCandidate(null);
        setModalTitle('Add New Candidate');
        setIsModalOpen(true);
    };

    const handleEditCandidate = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setModalTitle('Edit Candidate');
        setIsModalOpen(true);
    };

    const handleDeleteCandidate = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this candidate?')) {
            await deleteCandidate(id);
        }
    };

    const handleSubmit = async (data: CreateCandidateDto | Partial<Candidate>) => {
        if (selectedCandidate) {
            await updateCandidate(selectedCandidate.id, data);
        } else {
            await createCandidate(data as CreateCandidateDto);
        }
    };

    const handleApplyFilters = () => {
        fetchCandidates({
            search: searchTerm,
            field: fieldFilter,
            status: statusFilter,
            availability: availabilityFilter
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading candidates...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Candidates</h1>
                    <p className="text-sm text-gray-500">Dashboard / Candidates</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">
                        Export
                    </button>
                    <button 
                        onClick={handleAddCandidate}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700"
                    >
                        <Plus size={16} /> Add Candidate
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Candidates" value={stats.total.toLocaleString()} sub="100% of total" />
                <StatCard title="Actively Looking" value={stats.activelyLooking.toLocaleString()} sub={`${stats.activelyLookingPercentage.toFixed(1)}% of total`} color="text-green-600" />
                <StatCard title="Open to Opportunities" value={stats.openToOpportunities.toLocaleString()} sub={`${stats.openToOpportunitiesPercentage.toFixed(1)}% of total`} color="text-orange-500" />
                <StatCard title="Available Immediately" value={stats.availableImmediately.toLocaleString()} sub={`${stats.availableImmediatelyPercentage.toFixed(1)}% of total`} color="text-blue-600" />
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative flex-grow min-w-[250px]">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email, skill..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <select
                        value={fieldFilter}
                        onChange={(e) => setFieldFilter(e.target.value)}
                        className="px-4 py-2 border rounded-xl text-sm text-gray-600"
                    >
                        {uniqueFields.map(field => (
                            <option key={field} value={field}>{field}</option>
                        ))}
                    </select>
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded-xl text-sm text-gray-600"
                    >
                        {uniqueStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    
                    <select
                        value={availabilityFilter}
                        onChange={(e) => setAvailabilityFilter(e.target.value)}
                        className="px-4 py-2 border rounded-xl text-sm text-gray-600"
                    >
                        {uniqueAvailability.map(availability => (
                            <option key={availability} value={availability}>{availability}</option>
                        ))}
                    </select>
                    
                    <button 
                        onClick={handleApplyFilters}
                        className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Candidates Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase border-b bg-gray-50">
                            <th className="p-4 w-12">
                                <input type="checkbox" className="rounded" />
                            </th>
                            <th className="p-4">Candidate</th>
                            <th className="p-4">Field</th>
                            <th className="p-4">Experience</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Availability</th>
                            <th className="p-4">Salary Range</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {filteredCandidates.map((candidate, index) => (
                            <tr key={candidate.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <input type="checkbox" className="rounded" />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <img src={candidate.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                                        <div>
                                            <p className="font-medium text-gray-900">{candidate.name}</p>
                                            <p className="text-xs text-gray-400">{candidate.email}</p>
                                            <p className="text-xs text-gray-400">{candidate.phone}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 font-medium">{candidate.field}</td>
                                <td className="p-4">{candidate.experience}</td>
                                <td className="p-4">
                                    <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-medium ${
                                        candidate.status === 'Actively Looking' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-orange-100 text-orange-700'
                                    }`}>
                                        {candidate.status}
                                    </span>
                                </td>
                                <td className="p-4">{candidate.availability}</td>
                                <td className="p-4">{candidate.salary_range}</td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button 
                                            onClick={() => handleEditCandidate(candidate)}
                                            className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteCandidate(candidate.id)}
                                            className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        <button 
                                            className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                                            title="View Details"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {filteredCandidates.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No candidates found</p>
                    </div>
                )}

                {/* Pagination Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-500 bg-gray-50 flex-wrap gap-4">
                    <p>Showing {filteredCandidates.length} of {candidates.length} candidates</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
                        <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors">Next</button>
                    </div>
                </div>
            </div>

            {/* Candidate Modal */}
            <CandidateModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                candidate={selectedCandidate}
                title={modalTitle}
            />
        </div>
    );
}

const StatCard = ({ title, value, sub, color = "text-gray-900" }: any) => (
    <div className="bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md">
        <p className="text-gray-400 text-xs uppercase tracking-wider">{title}</p>
        <h3 className={`text-3xl font-bold ${color} mt-2`}>{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
);
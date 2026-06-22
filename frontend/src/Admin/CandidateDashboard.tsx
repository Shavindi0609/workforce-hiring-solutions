import { useState, useEffect,useMemo, useCallback } from 'react';
import { Search, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useCandidates } from '../hooks/useCandidates';
import { useFields } from '../hooks/useFields';
import { CandidateModal } from '../components/CandidateModal';
import type { Candidate, CreateCandidateDto } from '../types/candidate';
import CandidateDetailsModal from '../components/admin/CandidateDetailsModal';

export default function CandidatesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [fieldFilter, setFieldFilter] = useState('All Fields');
    const [statusFilter, setStatusFilter] = useState('All');
    const [availabilityFilter, setAvailabilityFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [modalTitle, setModalTitle] = useState('');
    
    // State for candidate details modal
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const { 
        candidates, 
        loading, 
        createCandidate, 
        updateCandidate, 
        deleteCandidate,
        fetchCandidates,
        getStatistics 
    } = useCandidates();

    const { fields, fetchFields } = useFields();
    
    // Fetch fields when component mounts
    useEffect(() => {
        fetchFields();
    }, [fetchFields]);

    const stats = useMemo(() => getStatistics(), [getStatistics]);

    // Get unique filters from candidates
    const uniqueFields = useMemo(() => ['All Fields', ...new Set(candidates.map(c => c.field))],[candidates]);
    const uniqueStatuses = useMemo(() => ['All', ...new Set(candidates.map(c => c.status))],[candidates]);
    const uniqueAvailability = useMemo(() => ['All', ...new Set(candidates.map(c => c.availability))],[candidates]);

    // Apply filters
    const filteredCandidates = useMemo(() => {
        return candidates.filter(candidate => {
            const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                 candidate.field.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesField = fieldFilter === 'All Fields' || candidate.field === fieldFilter;
            const matchesStatus = statusFilter === 'All' || candidate.status === statusFilter;
            const matchesAvailability = availabilityFilter === 'All' || candidate.availability === availabilityFilter;
            return matchesSearch && matchesField && matchesStatus && matchesAvailability;
        });
    }, [candidates, searchTerm, fieldFilter, statusFilter, availabilityFilter]);

    const handleAddCandidate = useCallback(() => {
        setSelectedCandidate(null);
        setModalTitle('Add New Candidate');
        setIsModalOpen(true);
    }, []);

    const handleEditCandidate = useCallback((candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setModalTitle('Edit Candidate');
        setIsModalOpen(true);
    }, []);

    const handleDeleteCandidate = useCallback(async (id: string) => {
        if (window.confirm('Are you sure you want to delete this candidate?')) {
            await deleteCandidate(id);
        }
    }, [deleteCandidate]);

    const handleSubmit = useCallback(async (data: CreateCandidateDto | Partial<Candidate>) => {
        if (selectedCandidate) {
            await updateCandidate(selectedCandidate.id, data);
        } else {
            await createCandidate(data as CreateCandidateDto);
        }
    }, [selectedCandidate, updateCandidate, createCandidate]);

    const handleApplyFilters = useCallback(() => {
        fetchCandidates({
            search: searchTerm,
            field: fieldFilter,
            status: statusFilter,
            availability: availabilityFilter
        });
    }, [fetchCandidates, searchTerm, fieldFilter, statusFilter, availabilityFilter]);

    const handleViewCandidate = useCallback((candidateId: string) => {
        setSelectedCandidateId(candidateId);
        setIsDetailsModalOpen(true);
    }, []);

    const handleCloseDetailsModal = useCallback(() => {
        setIsDetailsModalOpen(false);
        setSelectedCandidateId(null);
    }, []);

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
        <>
            <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
                {/* Header Section - Responsive */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">Candidates</h1>
                        <p className="text-sm text-gray-500">Dashboard / Candidates</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">
                            Export
                        </button>
                        <button 
                            onClick={handleAddCandidate}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700"
                        >
                            <Plus size={16} /> <span className="hidden sm:inline">Add Candidate</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards - Responsive Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                    <StatCard title="Total Candidates" value={stats.total.toLocaleString()} sub="100% of total" />
                    <StatCard title="Actively Looking" value={stats.activelyLooking.toLocaleString()} sub={`${stats.activelyLookingPercentage.toFixed(1)}%`} color="text-green-600" />
                    <StatCard title="Open to Opportunities" value={stats.openToOpportunities.toLocaleString()} sub={`${stats.openToOpportunitiesPercentage.toFixed(1)}%`} color="text-orange-500" />
                    <StatCard title="Available Immediately" value={stats.availableImmediately.toLocaleString()} sub={`${stats.availableImmediatelyPercentage.toFixed(1)}%`} color="text-blue-600" />
                </div>

                {/* Search and Filters - Responsive */}
                <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 mb-6">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4">
                        <div className="relative flex-grow">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by name, email, skill..." 
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-1 gap-2 sm:gap-3">
                            <select
                                value={fieldFilter}
                                onChange={(e) => setFieldFilter(e.target.value)}
                                className="px-3 sm:px-4 py-2 border rounded-xl text-sm text-gray-600 bg-white"
                            >
                                {uniqueFields.map(field => (
                                    <option key={field} value={field}>{field}</option>
                                ))}
                            </select>
                            
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 sm:px-4 py-2 border rounded-xl text-sm text-gray-600 bg-white"
                            >
                                {uniqueStatuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            
                            <select
                                value={availabilityFilter}
                                onChange={(e) => setAvailabilityFilter(e.target.value)}
                                className="px-3 sm:px-4 py-2 border rounded-xl text-sm text-gray-600 bg-white col-span-2 sm:col-span-1"
                            >
                                {uniqueAvailability.map(availability => (
                                    <option key={availability} value={availability}>{availability}</option>
                                ))}
                            </select>
                            
                            <button 
                                onClick={handleApplyFilters}
                                className="bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 col-span-2 sm:col-span-1"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Candidates Table - Horizontally scrollable on mobile */}
                <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-full">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase border-b bg-gray-50">
                                    <th className="p-3 sm:p-4 w-12">
                                        <input type="checkbox" className="rounded" />
                                    </th>
                                    <th className="p-3 sm:p-4">Candidate</th>
                                    <th className="p-3 sm:p-4 hidden sm:table-cell">Field</th>
                                    <th className="p-3 sm:p-4 hidden md:table-cell">Experience</th>
                                    <th className="p-3 sm:p-4">Status</th>
                                    <th className="p-3 sm:p-4 hidden lg:table-cell">Availability</th>
                                    <th className="p-3 sm:p-4 hidden xl:table-cell">Salary</th>
                                    <th className="p-3 sm:p-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {filteredCandidates.map((candidate) => (
                                    <tr key={candidate.id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-3 sm:p-4">
                                            <input type="checkbox" className="rounded" />
                                        </td>
                                        <td className="p-3 sm:p-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <img src={candidate.avatar_url} className="w-8 h-8 rounded-full object-cover flex-shrink-0" alt="" />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">{candidate.name}</p>
                                                    <p className="text-xs text-gray-400 truncate">{candidate.email}</p>
                                                    <p className="text-xs text-gray-400 hidden sm:block truncate">{candidate.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 sm:p-4 font-medium hidden sm:table-cell">{candidate.field}</td>
                                        <td className="p-3 sm:p-4 hidden md:table-cell">{candidate.experience}</td>
                                        <td className="p-3 sm:p-4">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                                                candidate.status === 'Actively Looking' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {candidate.status === 'Actively Looking' ? 'Active' : 'Open'}
                                            </span>
                                        </td>
                                        <td className="p-3 sm:p-4 hidden lg:table-cell">{candidate.availability}</td>
                                        <td className="p-3 sm:p-4 hidden xl:table-cell">{candidate.salary_range}</td>
                                        <td className="p-3 sm:p-4">
                                            <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                <button 
                                                    onClick={() => handleEditCandidate(candidate)}
                                                    className="p-1.5 sm:p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteCandidate(candidate.id)}
                                                    className="p-1.5 sm:p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleViewCandidate(candidate.id)}
                                                    className="p-1.5 sm:p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
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
                    </div>
                    
                    {filteredCandidates.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No candidates found</p>
                        </div>
                    )}

                    {/* Pagination Footer - Responsive */}
                    <div className="px-4 sm:px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 bg-gray-50">
                        <p className="text-xs sm:text-sm">Showing {filteredCandidates.length} of {candidates.length} candidates</p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors disabled:opacity-50 text-xs sm:text-sm" disabled>Previous</button>
                            <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs sm:text-sm">1</button>
                            <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors text-xs sm:text-sm">Next</button>
                        </div>
                    </div>
                </div>

                {/* Candidate Modal (Add/Edit) */}
                <CandidateModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    candidate={selectedCandidate}
                    title={modalTitle}
                    fields={fields}
                />
            </div>

            {/* Candidate Details Modal (View) */}
            {isDetailsModalOpen && selectedCandidateId && (
                <CandidateDetailsModal
                    candidateId={selectedCandidateId}
                    onClose={handleCloseDetailsModal}
                />
            )}
        </>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    sub: string;
    color?: string;
}

const StatCard = ({ 
    title, 
    value, 
    sub, 
    color = "text-gray-900" 
}: StatCardProps) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md">
        <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wider">{title}</p>
        <h3 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${color} mt-1 sm:mt-2`}>{value}</h3>
        <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{sub}</p>
    </div>
);
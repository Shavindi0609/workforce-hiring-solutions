import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, Download } from 'lucide-react';
import { useCandidates } from '../hooks/useCandidates';
import { useFields } from '../hooks/useFields';
import { CandidateModal } from '../components/CandidateModal';
import type { Candidate, CreateCandidateDto } from '../types/candidate';
import CandidateDetailsModal from '../components/admin/CandidateDetailsModal';
import toast from 'react-hot-toast';

function generateCandidateId(id: string, createdAt: string): string {
    const year = new Date(createdAt).getFullYear();
    const shortId = id.replace(/-/g, "").slice(0, 4).toUpperCase();
    return `WHS-${year}-${shortId}`;
}

export default function CandidatesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [fieldFilter, setFieldFilter] = useState('All Fields');
    const [statusFilter, setStatusFilter] = useState('All');
    const [availabilityFilter, setAvailabilityFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [showExportOptions, setShowExportOptions] = useState(false);
    
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
    
    useEffect(() => {
        fetchFields();
    }, [fetchFields]);

    const stats = useMemo(() => getStatistics(), [getStatistics]);

    const uniqueFields = useMemo(() => ['All Fields', ...new Set(candidates.map(c => c.field))],[candidates]);
    const uniqueStatuses = useMemo(() => ['All', ...new Set(candidates.map(c => c.status))],[candidates]);
    const uniqueAvailability = useMemo(() => ['All', ...new Set(candidates.map(c => c.availability))],[candidates]);

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

    const exportToCSV = useCallback((data: Candidate[]) => {
        const headers = ['Candidate ID', 'Name', 'Email', 'Phone', 'Field', 'Experience', 'Status', 'Availability', 'Salary Range'];
        const csvRows = data.map(c => [
            `"${generateCandidateId(c.id, c.created_at || new Date().toISOString())}"`,
            `"${c.name}"`,
            `"${c.email}"`,
            `"${c.phone}"`,
            `"${c.field}"`,
            `"${c.experience}"`,
            `"${c.status}"`,
            `"${c.availability}"`,
            `"${c.salary_range}"`
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvRows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, []);

    const exportToPDF = useCallback(async (data: Candidate[]) => {
        try {
            const { default: jsPDF } = await import('jspdf');
            const { default: autoTable } = await import('jspdf-autotable');

            const doc = new jsPDF('landscape', 'mm', 'a4');
            
            doc.setFontSize(22);
            doc.setTextColor(59, 130, 246);
            doc.text('Candidates Report', 14, 22);
            
            doc.setFontSize(12);
            doc.setTextColor(100, 116, 139);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);
            doc.text(`Total Candidates: ${data.length}`, 14, 40);
            
            doc.setDrawColor(200, 200, 200);
            doc.line(14, 44, 290, 44);

            const tableData = data.map(c => [
                generateCandidateId(c.id, c.created_at || new Date().toISOString()),
                c.name || 'N/A',
                c.email || 'N/A',
                c.phone || 'N/A',
                c.field || 'N/A',
                c.experience || 'N/A',
                c.status || 'N/A',
                c.availability || 'N/A',
                c.salary_range || 'N/A'
            ]);

            autoTable(doc, {
                head: [['Candidate ID', 'Name', 'Email', 'Phone', 'Field', 'Experience', 'Status', 'Availability', 'Salary Range']],
                body: tableData,
                startY: 50,
                styles: {
                    fontSize: 9,
                    cellPadding: 3,
                    lineColor: [200, 200, 200],
                    lineWidth: 0.5,
                },
                headStyles: {
                    fillColor: [59, 130, 246],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'center',
                    cellPadding: 4,
                },
                alternateRowStyles: {
                    fillColor: [243, 244, 246],
                },
                columnStyles: {
                    0: { cellWidth: 32, halign: 'center' },  // Candidate ID - increased
                    1: { cellWidth: 32, halign: 'left' },    // Name - increased
                    2: { cellWidth: 42, halign: 'left' },    // Email - increased
                    3: { cellWidth: 26, halign: 'left' },    // Phone - increased
                    4: { cellWidth: 28, halign: 'left' },    // Field - increased
                    5: { cellWidth: 28, halign: 'center' },  // Experience - increased
                    6: { cellWidth: 25, halign: 'center' },  // Status - increased
                    7: { cellWidth: 28, halign: 'center' },  // Availability - increased
                    8: { cellWidth: 34, halign: 'left' },    // Salary Range - increased
                },
                margin: { left: 10, right: 10 }, 
                tableWidth: 'auto',
                showHead: 'everyPage',
                didParseCell: function(data) {
                   
                    // Style Candidate ID with blue color
                    if (data.section === 'body' && data.column.index === 0) {
                        data.cell.styles.textColor = [37, 99, 235];
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            const pageCount = doc.internal.pages.length - 1;
            
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(9);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.width - 30,
                    doc.internal.pageSize.height - 10
                );
                doc.text(
                    `Candidates Report - ${new Date().toLocaleDateString()}`,
                    14,
                    doc.internal.pageSize.height - 10
                );
            }

            doc.save(`candidates_export_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF. Please make sure jspdf and jspdf-autotable are installed.');
            throw error;
        }
    }, []);

    const handleExport = useCallback(async (format: 'csv' | 'pdf') => {
        if (isExporting) return;
        
        setIsExporting(true);
        setShowExportOptions(false);
        
        try {
            const dataToExport = filteredCandidates.length > 0 ? filteredCandidates : candidates;
            
            if (dataToExport.length === 0) {
                toast.error('No candidates to export');
                return;
            }

            if (format === 'csv') {
                exportToCSV(dataToExport);
                toast.success(`Exported ${dataToExport.length} candidates as CSV`);
            } else if (format === 'pdf') {
                await exportToPDF(dataToExport);
                toast.success(`Exported ${dataToExport.length} candidates as PDF`);
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export candidates');
        } finally {
            setIsExporting(false);
        }
    }, [filteredCandidates, candidates, isExporting, exportToCSV, exportToPDF]);

    const toggleExportOptions = useCallback(() => {
        setShowExportOptions(!showExportOptions);
    }, [showExportOptions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showExportOptions) {
                const target = event.target as HTMLElement;
                if (!target.closest('.export-dropdown')) {
                    setShowExportOptions(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExportOptions]);

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
                        {/* Export Button with Dropdown */}
                        <div className="relative flex-1 sm:flex-none export-dropdown">
                            <button 
                                onClick={toggleExportOptions}
                                disabled={isExporting}
                                className="w-full px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={16} />
                                {isExporting ? 'Exporting...' : 'Export'}
                            </button>
                            
                           {/* Export Options Dropdown */}
                            {showExportOptions && !isExporting && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                  <button
                                   onClick={() => handleExport('csv')}
                                   className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                                  >
                                   <img 
                                  src="https://img.icons8.com/color/48/000000/csv.png" 
                                  alt="CSV" 
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                 e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%2343A047" stroke-width="2"%3E%3Crect x="2" y="2" width="20" height="20" rx="2"/%3E%3Cpath d="M7 7h10M7 11h10M7 15h6"/%3E%3C/svg%3E';
                                    }}
                                    />
                                    <span>Export as CSV</span>
                                  </button>
                                  <button
                                     onClick={() => handleExport('pdf')}
                                     className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3"
                                   >
                                   <img 
                                      src="https://cdn-icons-png.flaticon.com/512/337/337946.png" 
                                      alt="PDF" 
                                      className="w-6 h-6 object-contain"
                                      onError={(e) => {
                                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23E53935" stroke-width="2"%3E%3Crect x="2" y="2" width="20" height="20" rx="2"/%3E%3Cpath d="M7 7h10M7 11h10M7 15h6"/%3E%3C/svg%3E';
                                    }}
                                    />
                                    <span>Export as PDF</span>
                                  </button>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={handleAddCandidate}
                            className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
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
                                className="bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 col-span-2 sm:col-span-1 transition-colors"
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
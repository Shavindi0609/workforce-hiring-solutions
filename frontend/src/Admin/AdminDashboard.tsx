import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye } from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import { useNavigate } from 'react-router-dom';
import CandidateDetailsModal from '../components/admin/CandidateDetailsModal';

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { dashboardData, loading, error, refetch } = useDashboard();
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewCandidate = (candidateId: string) => {
        setSelectedCandidateId(candidateId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCandidateId(null);
    };

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <h3 className="font-bold">Error loading dashboard</h3>
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold">Dashboard</h2>
                        <p className="text-gray-500 text-sm">Overview of your candidate pool</p>
                    </div>
                    <button 
                        onClick={() => refetch()}
                        className="bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 w-full sm:w-auto"
                    >
                        Refresh Data
                    </button>
                </div>

                {/* Stats - Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <StatCard 
                        title="Total Candidates" 
                        value={dashboardData.totalCandidates.toLocaleString()} 
                    />
                    <StatCard 
                        title="Actively Looking" 
                        value={dashboardData.activelyLooking.toLocaleString()} 
                        color="text-green-600" 
                    />
                    <StatCard 
                        title="Open to Opportunities" 
                        value={dashboardData.openToOpportunities.toLocaleString()} 
                        color="text-orange-500" 
                    />
                </div>

                {/* Row 1: Bar & Pie Charts - Mobile: 1 column, Desktop: 3 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <ChartCard title="Candidates by Field">
                        <div className="w-full h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardData.fieldData}>
                                    <XAxis dataKey="name" fontSize={10} interval={0} angle={-45} textAnchor="end" height={60} />
                                    <YAxis width={30} />
                                    <Tooltip />
                                    <Bar dataKey="v" fill="#2563eb" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    
                    <ChartCard title="Candidates by Availability">
                        <div className="w-full h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={dashboardData.availabilityData} 
                                        innerRadius={40} 
                                        outerRadius={60} 
                                        dataKey="v"
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        {dashboardData.availabilityData.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    
                    <ChartCard title="Candidates by Status">
                        <div className="w-full h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={dashboardData.statusData} 
                                        innerRadius={40} 
                                        outerRadius={60} 
                                        dataKey="v"
                                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                                        labelLine={false}
                                    >
                                        <Cell fill="#22c55e" />
                                        <Cell fill="#eab308" />
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* Row 2: Salary & Skills - Mobile: 1 column, Desktop: 2 columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <ChartCard title="Salary Distribution">
                        <div className="w-full h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dashboardData.salaryData}>
                                    <XAxis dataKey="range" fontSize={10} interval={0} angle={-45} textAnchor="end" height={60} />
                                    <YAxis width={30} />
                                    <Tooltip />
                                    <Bar dataKey="v" fill="#84cc16" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    
                    <ChartCard title="Most Common Skills">
                        <div className="w-full h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                    layout="vertical" 
                                    data={dashboardData.skillsData} 
                                    margin={{ left: 20, right: 10 }}
                                >
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" fontSize={10} width={80} />
                                    <Tooltip />
                                    <Bar dataKey="v" fill="#2563eb" barSize={15} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* Recent Candidates - Horizontally scrollable on mobile */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border shadow-sm overflow-hidden">
                    <h3 className="font-bold mb-4">Recent Candidates</h3>
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full text-left text-sm min-w-[600px] sm:min-w-full">
                            <thead className="text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="pb-4 px-4 sm:px-0">Name</th>
                                    <th className="pb-4 px-4 sm:px-0">Field</th>
                                    <th className="pb-4 px-4 sm:px-0">Status</th>
                                    <th className="pb-4 px-4 sm:px-0">CV</th>
                                    <th className="pb-4 px-4 sm:px-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardData.recentCandidates.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-gray-500">
                                            No candidates found
                                        </td>
                                    </tr>
                                ) : (
                                    dashboardData.recentCandidates.map((candidate, index) => (
                                        <tr key={index} className="border-t">
                                            <td className="py-4 font-medium px-4 sm:px-0 text-sm">{candidate.name}</td>
                                            <td className="py-4 px-4 sm:px-0 text-sm">{candidate.field}</td>
                                            <td className="py-4 px-4 sm:px-0">
                                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                                    candidate.status === 'Actively Looking' 
                                                        ? 'bg-green-100 text-green-700' 
                                                        : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                    {candidate.status === 'Actively Looking' ? 'ACTIVE' : 'OPEN'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 sm:px-0">
                                                {candidate.cv_url ? (
                                                    <span className="text-green-600 text-xs font-medium whitespace-nowrap">✓ Uploaded</span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs whitespace-nowrap">No CV</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 sm:px-0">
                                                <button 
                                                    onClick={() => handleViewCandidate(candidate.id)}
                                                    className="text-blue-600 cursor-pointer flex items-center gap-1 hover:text-blue-800 whitespace-nowrap"
                                                >
                                                    <Eye size={16}/> <span className="hidden sm:inline">View</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Candidate Details Modal */}
            {isModalOpen && selectedCandidateId && (
                <CandidateDetailsModal
                    candidateId={selectedCandidateId}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
}

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border shadow-sm">
        <h3 className="font-bold mb-4 text-xs uppercase text-gray-500">{title}</h3>
        {children}
    </div>
);

const StatCard = ({ title, value, color = "text-blue-900" }: { title: string; value: string; color?: string }) => (
    <div className="bg-white p-4 sm:p-6 rounded-2xl border shadow-sm">
        <p className="text-gray-400 text-xs uppercase">{title}</p>
        <h3 className={`text-2xl sm:text-3xl font-bold ${color} mt-2`}>{value}</h3>
    </div>
);
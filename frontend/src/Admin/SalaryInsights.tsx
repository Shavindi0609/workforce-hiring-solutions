import { useMemo, useState } from "react";
import { 
   Filter, ChevronDown, XCircle, Calendar, Briefcase, Clock, 
} from 'lucide-react';
import { useSalaryInsights } from '../hooks/useSalaryInsights';

type SalaryFilters = {
  field: string;
  experience: string;
  fromDate: string;
  toDate: string;
};

const initialFilters: SalaryFilters = {
  field: "All Fields",
  experience: "All Experience",
  fromDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
  toDate: new Date().toISOString().split('T')[0],
};

const fieldOptions = ["All Fields", "Web Development", "Data Science", "UI/UX Design", "DevOps", "HR & Recruitment", "Quality Assurance"];
const experienceOptions = ["All Experience", "0-2 Years", "2-4 Years", "4-6 Years", "6+ Years"];

const isDateRangeValid = (fromDate: string, toDate: string) => {
  return fromDate && toDate && new Date(fromDate) <= new Date(toDate);
};

const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];

export default function SalaryInsights() {
  const [draftFilters, setDraftFilters] = useState<SalaryFilters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<SalaryFilters>(initialFilters);
  const dateRangeValid = isDateRangeValid(draftFilters.fromDate, draftFilters.toDate);

  const { 
    salaryDistribution, 
    salaryOverview, 
    salaryRangeDistribution, 
    salaryByExperience,
    loading 
  } = useSalaryInsights();

  // Transform salary distribution for chart
  const salaryDistributionFields = useMemo(() => {
    return salaryDistribution.map(item => ({
      field: item.field.substring(0, 15),
      minSalary: item.min_salary,
      maxSalary: item.max_salary,
      count: item.candidate_count
    }));
  }, [salaryDistribution]);

  const maxSalary = Math.max(...salaryDistributionFields.map(d => d.maxSalary), 1);

  const hasActiveFilters = draftFilters.field !== "All Fields" || 
                          draftFilters.experience !== "All Experience";

  const clearAllFilters = () => {
    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading salary insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Salary Insights</h1>
          <p className="text-sm text-gray-500">Insights about salary ranges</p>
        </div>
      </div>

      {/* Search and Filters Section - Responsive */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200 mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* First row: Field and Experience filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[150px]">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white">
                <Briefcase size={16} className="text-gray-400 flex-shrink-0" />
                <select 
                  className="bg-transparent focus:outline-none cursor-pointer w-full"
                  value={draftFilters.field}
                  onChange={(e) => setDraftFilters({ ...draftFilters, field: e.target.value })}
                >
                  {fieldOptions.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              </div>
            </div>

            <div className="flex-1 min-w-[150px]">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white">
                <Clock size={16} className="text-gray-400 flex-shrink-0" />
                <select 
                  className="bg-transparent focus:outline-none cursor-pointer w-full"
                  value={draftFilters.experience}
                  onChange={(e) => setDraftFilters({ ...draftFilters, experience: e.target.value })}
                >
                  {experienceOptions.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
              </div>
            </div>
          </div>

          {/* Second row: Date filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-white">
                <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                <input 
                  type="date" 
                  className="bg-transparent focus:outline-none w-full sm:w-32"
                  value={draftFilters.fromDate}
                  onChange={(e) => setDraftFilters({ ...draftFilters, fromDate: e.target.value })}
                />
                <span className="text-gray-400 flex-shrink-0">to</span>
                <input 
                  type="date" 
                  className="bg-transparent focus:outline-none w-full sm:w-32"
                  value={draftFilters.toDate}
                  onChange={(e) => setDraftFilters({ ...draftFilters, toDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Third row: Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button 
              className="flex-1 sm:flex-none bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setAppliedFilters(draftFilters)}
              disabled={!dateRangeValid}
            >
              <Filter size={16} /> Apply Filters
            </button>

            {hasActiveFilters && (
              <button 
                className="flex-1 sm:flex-none bg-white text-red-500 px-4 sm:px-5 py-2 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors border border-gray-200 flex items-center justify-center gap-2"
                onClick={clearAllFilters}
              >
                <XCircle size={16} /> Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Salary Distribution and Overview - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Salary Distribution Section - Takes full width on mobile, 2 columns on desktop */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Salary Distribution by Field</h2>
            <span className="text-xs text-gray-400">Minimum to Maximum Range</span>
          </div>
          <p className="text-sm text-gray-500 mb-4 sm:mb-6">Salary Range by Field (YTD)</p>
          
          <div className="h-64 sm:h-80 overflow-x-auto">
            <div className="flex items-end gap-2 sm:gap-3 h-48 sm:h-64 min-w-[500px]">
              {salaryDistributionFields.map((item, idx) => {
                const height = (item.maxSalary / maxSalary) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 sm:gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500 cursor-pointer relative group"
                      style={{ height: `${Math.max(height, 10)}%`, minHeight: '20px' }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {item.count} candidates
                      </div>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-500 text-center">{item.field}</span>
                    <span className="text-[8px] sm:text-xs font-medium text-gray-700 text-center">
                      Rs.{(item.minSalary / 1000).toFixed(0)}K - Rs.{(item.maxSalary / 1000).toFixed(0)}K
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Overview Section - Full width on mobile, 1 column on desktop */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            <div className="border-b border-gray-100 pb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Avg. Min Salary</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">Rs.{salaryOverview.avg_min_salary.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">per year</p>
            </div>
            <div className="border-b border-gray-100 pb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Avg. Max Salary</p>
              <p className="text-lg sm:text-xl font-bold text-green-600">Rs.{salaryOverview.avg_max_salary.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">per year</p>
            </div>
            <div className="border-b border-gray-100 pb-3">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Highest Salary Range</p>
              <p className="text-lg sm:text-xl font-bold text-purple-600">{salaryOverview.highest_range}</p>
              <p className="text-xs text-gray-400 mt-1">per year</p>
            </div>
            <div className="pb-2">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Candidates</p>
              <p className="text-lg sm:text-xl font-bold text-orange-600">{salaryOverview.total_candidates.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">across all ranges</p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates by Salary Range and Salary Range by Experience - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Candidates by Salary Range - Donut Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Candidates by Salary Range</h2>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="relative flex justify-center w-full sm:w-auto">
              <div className="w-40 h-40 sm:w-48 sm:h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let currentAngle = 0;
                    const total = salaryRangeDistribution.reduce((sum, d) => sum + d.candidate_count, 0);
                    return salaryRangeDistribution.map((item, idx) => {
                      const angle = (item.candidate_count / total) * 360;
                      const startAngle = currentAngle;
                      const endAngle = currentAngle + angle;
                      currentAngle = endAngle;
                      
                      const startRad = (startAngle * Math.PI) / 180;
                      const endRad = (endAngle * Math.PI) / 180;
                      
                      const x1 = 50 + 40 * Math.cos(startRad);
                      const y1 = 50 + 40 * Math.sin(startRad);
                      const x2 = 50 + 40 * Math.cos(endRad);
                      const y2 = 50 + 40 * Math.sin(endRad);
                      
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      return (
                        <path
                          key={idx}
                          d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                          fill={colors[idx % colors.length]}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      );
                    });
                  })()}
                  <circle cx="50" cy="50" r="25" fill="white" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1 w-full sm:w-auto">
              {salaryRangeDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                    <span className="text-gray-600 truncate">{item.salary_range}</span>
                  </div>
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0 ml-2">
                    <span className="font-medium text-gray-700">{item.candidate_count.toLocaleString()}</span>
                    <span className="text-gray-400">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Range by Experience Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Salary Range by Experience</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <thead>
                <tr className="text-gray-400 text-xs uppercase border-b border-gray-100 bg-gray-50">
                  <th className="p-3 sm:p-4">Experience</th>
                  <th className="p-3 sm:p-4 text-center">Avg. Min</th>
                  <th className="p-3 sm:p-4 text-center">Avg. Max</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {salaryByExperience.map((item, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-3 sm:p-4 font-medium text-gray-900">{item.experience_level}</td>
                    <td className="p-3 sm:p-4 text-center text-green-600 font-medium">Rs.{item.avg_min_salary.toLocaleString()}</td>
                    <td className="p-3 sm:p-4 text-center text-blue-600 font-medium">Rs.{item.avg_max_salary.toLocaleString()}</td>
                  </tr>
                ))}
                {salaryByExperience.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">
                      No experience data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer - Responsive */}
          <div className="px-4 sm:px-6 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 bg-gray-50">
            <p className="text-xs sm:text-sm">Showing {salaryByExperience.length} of {salaryByExperience.length}</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-white transition-colors disabled:opacity-50 text-xs sm:text-sm" disabled>Previous</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs sm:text-sm">1</button>
              <button className="px-3 py-1 border border-gray-200 rounded-md hover:bg-white transition-colors text-xs sm:text-sm">Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
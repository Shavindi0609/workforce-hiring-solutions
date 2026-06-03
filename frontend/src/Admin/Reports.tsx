// src/Admin/Reports.tsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  BriefcaseBusiness,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
} from 'lucide-react';
import { useReports } from '../hooks/useReports';
import type { ReportFormat } from '../types/report';

const reportDefinitions = [
  { name: 'Candidate Summary', description: 'Overview of candidate statistics and metrics' },
  { name: 'Salary Insights', description: 'Salary distribution by field and experience' },
  { name: 'Field Distribution', description: 'Candidates grouped by their interested fields' },
  { name: 'Status Report', description: 'Candidates by status and availability' },
];

const summaryIcons: Record<string, React.ReactNode> = {
  blue: <Users size={26} />,
  green: <Users size={26} />,
  orange: <BriefcaseBusiness size={26} />,
  purple: <CalendarDays size={26} />,
};

function Reports() {
  const [reportType, setReportType] = useState<string>('Select Report');
  const [fromDate, setFromDate] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [fieldFilter, setFieldFilter] = useState<string>('All Fields');
  const [statusFilter, setStatusFilter] = useState<string>('All Status');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All Availability');
  const [isGenerating, setIsGenerating] = useState(false);

  const { 
    generatedReports, 
    summaryMetrics, 
    loading, 
    generateReportData, 
    downloadReport,
    refetch 
  } = useReports();

  // Prevent date validation from causing re-renders
  useEffect(() => {
    if (fromDate && toDate && toDate < fromDate) {
      setToDate(fromDate);
    }
  }, [fromDate, toDate]);

  const dateRangeLabel = useMemo(() => {
    const from = fromDate ? formatDateLabel(fromDate) : 'From Date';
    const to = toDate ? formatDateLabel(toDate) : 'To Date';
    return `${from} - ${to}`;
  }, [fromDate, toDate]);

  const handleDownload = useCallback(async (reportName: string, format: ReportFormat) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    const filters = {
      reportType,
      fromDate,
      toDate,
      field: fieldFilter,
      status: statusFilter,
      availability: availabilityFilter
    };
    
    try {
      await generateReportData(reportName, format, filters);
      downloadReport(reportName, format);
    } catch (error) {
      console.error('Download error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [reportType, fromDate, toDate, fieldFilter, statusFilter, availabilityFilter, generateReportData, downloadReport, isGenerating]);

  const handleGenerateReport = useCallback(async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    const selectedReportName = reportType === 'Select Report' ? reportDefinitions[0].name : reportType;
    const filters = {
      reportType: selectedReportName,
      fromDate,
      toDate,
      field: fieldFilter,
      status: statusFilter,
      availability: availabilityFilter
    };
    
    try {
      await generateReportData(selectedReportName, 'PDF', filters);
      await refetch();
    } catch (error) {
      console.error('Generate error:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [reportType, fromDate, toDate, fieldFilter, statusFilter, availabilityFilter, generateReportData, refetch, isGenerating]);

  // Prepare summary metrics for display
  const summaryMetricsList = [
    { label: 'Total Candidates', value: summaryMetrics.totalCandidates.toLocaleString(), tone: 'blue' },
    { label: 'Actively Looking', value: summaryMetrics.activelyLooking.toLocaleString(), tone: 'green' },
    { label: 'Open to Opportunities', value: summaryMetrics.openToOpportunities.toLocaleString(), tone: 'orange' },
    { label: 'Available Immediately', value: summaryMetrics.availableImmediate.toLocaleString(), tone: 'purple' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="assigned-page reports-page">
      <section className="assigned-heading">
        <h1>Reports</h1>
        <p>Generate and view reports</p>
      </section>

      <section className="assigned-filter-panel reports-filter-panel" aria-label="Report filters">
        <FilterSelect
          label="Report Type"
          value={reportType}
          options={['Select Report', 'Candidate Summary', 'Salary Insights', 'Field Distribution', 'Status Report']}
          onChange={setReportType}
        />
        <FilterSelect 
          label="Field" 
          value={fieldFilter} 
          options={['All Fields', 'Web Development', 'UI/UX Design', 'Data Science', 'Digital Marketing', 'Mobile Development', 'DevOps', 'AI / ML']}
          onChange={setFieldFilter}
        />
        <FilterSelect 
          label="Status" 
          value={statusFilter} 
          options={['All Status', 'Actively Looking', 'Open to Opportunities']}
          onChange={setStatusFilter}
        />
        <FilterSelect 
          label="Availability" 
          value={availabilityFilter} 
          options={['All Availability', 'Immediate', '2 Weeks', '1 Month', '2 Months', '3 Months']}
          onChange={setAvailabilityFilter}
        />
        <div className="assigned-date-filter" aria-label={dateRangeLabel}>
          <CalendarDays size={15} />
          <input
            aria-label="From Date"
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
          <span>to</span>
          <input
            aria-label="To Date"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(event) => setToDate(event.target.value)}
          />
        </div>
        <button 
          className="assigned-primary-action" 
          type="button" 
          onClick={handleGenerateReport}
          disabled={isGenerating}
        >
          <FileText size={14} />
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </button>
      </section>

      <section className="reports-summary-grid">
        {summaryMetricsList.map((metric) => (
          <article className={`reports-summary-card ${metric.tone}`} key={metric.label}>
            <div className="reports-summary-icon">{summaryIcons[metric.tone] ?? <Users size={26} />}</div>
            <div>
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="assigned-card reports-list-card">
        <h2>Reports</h2>
        <div className="reports-list">
          {reportDefinitions.map((report) => (
            <article className="reports-row" key={report.name}>
              <div className="reports-title-group">
                <div className="reports-row-icon">
                  <FileText size={19} />
                </div>
                <div>
                  <h3>{report.name}</h3>
                  <p>{report.description}</p>
                </div>
              </div>
              <div className="reports-actions">
                <button 
                  type="button" 
                  onClick={() => handleDownload(report.name, 'PDF')}
                  disabled={isGenerating}
                >
                  <FileText size={14} />
                  PDF
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDownload(report.name, 'Excel')}
                  disabled={isGenerating}
                >
                  <FileSpreadsheet size={14} />
                  Excel
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="assigned-card reports-recent-card">
        <h2>Recent Generated Reports</h2>
        <div className="assigned-table-wrap">
          <table className="assigned-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Type</th>
                <th>Generated On</th>
                <th>Generated By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {generatedReports.map((report) => (
                <tr key={report.id || `${report.name}-${report.generatedOn}`}>
                  <td>{report.name}</td>
                  <td>{report.type}</td>
                  <td>{report.generatedOn}</td>
                  <td>{report.generatedBy}</td>
                  <td>
                    <button
                      className="reports-download-icon"
                      type="button"
                      aria-label={`Download ${report.name}`}
                      onClick={() => downloadReport(report.name, report.type)}
                      disabled={isGenerating}
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {generatedReports.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    No reports generated yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange?: (value: string) => void;
}) {
  return (
    <label className="assigned-filter-control">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange?.(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export default Reports;
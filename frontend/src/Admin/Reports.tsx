import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BriefcaseBusiness,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  Users,
} from 'lucide-react';
import {
  recentReports,
  reportDefinitions,
  summaryMetrics,
  type ReportFormat,
} from '../data/reportsData';

const summaryIcons: Record<string, ReactNode> = {
  blue: <Users size={26} />,
  green: <Users size={26} />,
  orange: <BriefcaseBusiness size={26} />,
  purple: <CalendarDays size={26} />,
};

function Reports() {
  const [reportType, setReportType] = useState<string>('Select Report');
  const [fromDate, setFromDate] = useState<string>('2026-05-20');
  const [toDate, setToDate] = useState<string>('2026-06-20');
  const [generatedReports, setGeneratedReports] = useState(recentReports);

  useEffect(() => {
    if (fromDate && toDate && toDate < fromDate) {
      const timeoutId = window.setTimeout(() => setToDate(''), 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [fromDate, toDate]);

  const dateRangeLabel = useMemo(() => {
    const from = fromDate ? formatDateLabel(fromDate) : 'From Date';
    const to = toDate ? formatDateLabel(toDate) : 'To Date';
    return `${from} - ${to}`;
  }, [fromDate, toDate]);

  const handleDownload = (reportName: string, format: ReportFormat) => {
    downloadMockReport(reportName, format);
  };

  const handleGenerateReport = () => {
    const selectedReportName = reportType === 'Select Report' ? reportDefinitions[0].name : reportType;

    setGeneratedReports((reports) => [
      {
        name: selectedReportName,
        type: 'PDF',
        generatedOn: new Date().toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        generatedBy: 'Admin',
      },
      ...reports,
    ]);
  };

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
          options={['Select Report', 'Candidate Summary', 'Salary Insights']}
          onChange={setReportType}
        />
        <FilterSelect label="Field" value="All Fields" options={['All Fields', 'Engineering', 'Design', 'Marketing']} />
        <FilterSelect label="Status" value="All Status" options={['All Status', 'Active', 'Shortlisted', 'Rejected']} />
        <FilterSelect label="Availability" value="All Availability" options={['All Availability', 'Immediate', 'Two Weeks', 'One Month']} />
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
        <button className="assigned-primary-action" type="button" onClick={handleGenerateReport}>
          <FileText size={14} />
          Generate Report
        </button>
      </section>

      <section className="reports-summary-grid">
        {summaryMetrics.map((metric) => (
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
                <button type="button" onClick={() => handleDownload(report.name, 'PDF')}>
                  <FileText size={14} />
                  PDF
                </button>
                <button type="button" onClick={() => handleDownload(report.name, 'Excel')}>
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
                <tr key={`${report.name}-${report.generatedOn}`}>
                  <td>{report.name}</td>
                  <td>{report.type}</td>
                  <td>{report.generatedOn}</td>
                  <td>{report.generatedBy}</td>
                  <td>
                    <button
                      className="reports-download-icon"
                      type="button"
                      aria-label={`Download ${report.name}`}
                      onClick={() => handleDownload(report.name, report.type as ReportFormat)}
                    >
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
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
      <select defaultValue={value} onChange={(event) => onChange?.(event.target.value)}>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function downloadMockReport(reportName: string, format: ReportFormat) {
  const rows = [
    ['Report Name', 'Type', 'Generated On', 'Generated By'],
    [reportName, format, new Date().toLocaleString(), 'Admin'],
    ['Total Candidates', '2458', 'Actively Looking', '1245'],
    ['Average Minimum Salary', '$72,500', 'Average Maximum Salary', '$125,300'],
  ];
  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const isPdf = format === 'PDF';
  const blob = new Blob([isPdf ? `Mock PDF Report\n\n${csvContent}` : csvContent], {
    type: isPdf ? 'application/pdf' : 'application/vnd.ms-excel',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.${isPdf ? 'pdf' : 'xls'}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export default Reports;
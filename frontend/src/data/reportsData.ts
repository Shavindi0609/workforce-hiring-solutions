export type ReportFormat = 'PDF' | 'Excel';

export type ReportDefinition = {
  name: string;
  description: string;
};

export type RecentReport = {
  name: string;
  type: ReportFormat;
  generatedOn: string;
  generatedBy: string;
};

export type SummaryMetric = {
  label: string;
  value: string;
  tone: 'blue' | 'green' | 'orange' | 'purple';
};

export const reportDefinitions: ReportDefinition[] = [
  {
    name: 'Candidate Summary Report',
    description: 'Overview of total candidates and status wise count',
  },
  {
    name: 'Candidates by Field Report',
    description: 'Detailed report of candidates grouped by fields',
  },
  {
    name: 'Candidates by Availability Report',
    description: 'Detailed report of candidates by availability',
  },
  {
    name: 'Salary Insights Report',
    description: 'Salary distribution and insights report',
  },
  {
    name: 'Skills Insights Report',
    description: 'Most common skills and demand report',
  },
];

export const recentReports: RecentReport[] = [
  {
    name: 'Candidates Summary Report',
    type: 'PDF',
    generatedOn: 'Jun 20, 2034 10:30 AM',
    generatedBy: 'Admin',
  },
  {
    name: 'Candidates by Field Report',
    type: 'Excel',
    generatedOn: 'Jun 20, 2034 10:29 AM',
    generatedBy: 'Admin',
  },
  {
    name: 'Salary Insights Report',
    type: 'PDF',
    generatedOn: 'Jun 20, 2034 10:25 PM',
    generatedBy: 'Admin',
  },
  {
    name: 'Skills Insights Report',
    type: 'Excel',
    generatedOn: 'Jun 20, 2034 10:22 AM',
    generatedBy: 'Admin',
  },
];

export const summaryMetrics: SummaryMetric[] = [
  { label: 'Total Candidates', value: '2,458', tone: 'blue' },
  { label: 'Actively Looking', value: '1,245', tone: 'green' },
  { label: 'Open to Opportunities', value: '1,213', tone: 'orange' },
  { label: 'Available Immediately', value: '798', tone: 'purple' },
];

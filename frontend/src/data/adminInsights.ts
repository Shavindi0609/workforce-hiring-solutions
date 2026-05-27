export type ReportFormat = "PDF" | "Excel";

export type ReportCategory = "Candidates" | "Salary" | "Skills";

export type ReportDefinition = {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
};

export type RecentReport = {
  id: string;
  name: string;
  type: ReportCategory;
  format: ReportFormat;
  generatedAt: string;
  records: number;
};

export type AdminCandidate = {
  id: string;
  name: string;
  field: string;
  status: string;
  availability: string;
  updatedAt: string;
};

export const fieldOptions = [
  "All Fields",
  "Software Engineering",
  "Data Analytics",
  "Product Design",
  "Quality Assurance",
  "DevOps",
  "Human Resources",
];

export const statusOptions = ["All Statuses", "Actively Looking", "Open to Opportunities"];

export const availabilityOptions = ["All Availability", "Immediately", "2 Weeks", "1 Month"];

export const experienceOptions = ["All Experience", "0-2 Years", "3-5 Years", "6-8 Years", "9+ Years"];

export const reportDefinitions: ReportDefinition[] = [
  {
    id: "candidate-summary",
    name: "Candidates Summary Report",
    description: "Overview of total candidates and status wise count",
    category: "Candidates",
  },
  {
    id: "candidates-by-field",
    name: "Candidates by Field Report",
    description: "Detailed report of candidates grouped by fields",
    category: "Candidates",
  },
  {
    id: "candidates-by-availability",
    name: "Candidates by Availability Report",
    description: "Detailed report of candidates by availability",
    category: "Candidates",
  },
  {
    id: "salary-insights",
    name: "Salary Insights Report",
    description: "Salary distribution and insights report",
    category: "Salary",
  },
  {
    id: "skills-insights",
    name: "Skills Insights Report",
    description: "Most common skills and demand report",
    category: "Skills",
  },
];

export const adminCandidates: AdminCandidate[] = [
  { id: "C-001", name: "Maya Chen", field: "Software Engineering", status: "Actively Looking", availability: "Immediately", updatedAt: "2026-05-16" },
  { id: "C-002", name: "Daniel Wright", field: "Data Analytics", status: "Open to Opportunities", availability: "2 Weeks", updatedAt: "2026-05-11" },
  { id: "C-003", name: "Sara Patel", field: "Product Design", status: "Actively Looking", availability: "1 Month", updatedAt: "2026-04-28" },
  { id: "C-004", name: "Omar Silva", field: "DevOps", status: "Open to Opportunities", availability: "Immediately", updatedAt: "2026-05-17" },
  { id: "C-005", name: "Leah Kim", field: "Quality Assurance", status: "Actively Looking", availability: "2 Weeks", updatedAt: "2026-05-07" },
];

export const initialRecentReports: RecentReport[] = [
  {
    id: "recent-1",
    name: "Candidates Summary Report",
    type: "Candidates",
    format: "PDF",
    generatedAt: "2026-05-19 10:30",
    records: 2458,
  },
  {
    id: "recent-2",
    name: "Salary Insights Report",
    type: "Salary",
    format: "Excel",
    generatedAt: "2026-05-19 10:25",
    records: 2458,
  },
];

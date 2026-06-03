// src/types/report.ts
export interface ReportDefinition {
    name: string;
    description: string;
}

export interface GeneratedReport {
    id?: string;
    name: string;
    type: 'PDF' | 'Excel';
    generatedOn: string;
    generatedBy: string;
    filters?: any;
}

export interface SummaryMetrics {
    totalCandidates: number;
    activelyLooking: number;
    openToOpportunities: number;
    availableImmediate: number;
    avgMinSalary: number;
    avgMaxSalary: number;
}

export interface SalaryInsight {
    field: string;
    avgMinSalary: number;
    avgMaxSalary: number;
    candidateCount: number;
}

export type ReportFormat = 'PDF' | 'Excel';
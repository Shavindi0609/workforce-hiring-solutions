// src/hooks/useReports.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SummaryMetrics, SalaryInsight, GeneratedReport, ReportFormat } from '../types/report';

export const useReports = () => {
    const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
    const [summaryMetrics, setSummaryMetrics] = useState<SummaryMetrics>({
        totalCandidates: 0,
        activelyLooking: 0,
        openToOpportunities: 0,
        availableImmediate: 0,
        avgMinSalary: 0,
        avgMaxSalary: 0
    });
    const [salaryInsights, setSalaryInsights] = useState<SalaryInsight[]>([]);
    const [fieldDistribution, setFieldDistribution] = useState<any[]>([]);
    const [statusReport, setStatusReport] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    // Helper function to parse salary range
    const parseSalaryRange = (salaryRange: string): { min: number; max: number } => {
        if (!salaryRange) return { min: 0, max: 0 };
        
        // Remove any spaces and replace multiple dots
        let cleaned = salaryRange.replace(/\s/g, '');
        
        // Split by '-' or '–' or '—'
        let parts = cleaned.split(/[-–—]/);
        
        if (parts.length === 2) {
            // Parse min and max
            let min = parseFloat(parts[0].replace(/[^0-9.]/g, ''));
            let max = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
            
            // If min is greater than max, swap them
            if (min > max) {
                [min, max] = [max, min];
            }
            
            // Handle case where min might be 0 or invalid
            if (isNaN(min)) min = 0;
            if (isNaN(max)) max = 0;
            
            return { min, max };
        }
        
        return { min: 0, max: 0 };
    };

    // Helper function to format currency
    const formatCurrency = (value: number): string => {
        if (!value || isNaN(value) || value === 0) return '0';
        const rounded = Math.round(value);
        return rounded.toLocaleString('en-IN');
    };

    // Helper function to format number
    const formatNumber = (value: number): string => {
        if (!value || isNaN(value)) return '0';
        return value.toLocaleString('en-IN');
    };

    // Fetch summary metrics from database
    const fetchSummaryMetrics = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('candidates')
                .select('status, availability, salary_range');
            
            if (fetchError) throw fetchError;
            
            const total = data?.length || 0;
            const activelyLooking = data?.filter(c => c.status === 'Actively Looking').length || 0;
            const openOpportunities = data?.filter(c => c.status === 'Open to Opportunities').length || 0;
            const availableImmediate = data?.filter(c => c.availability === 'Immediate').length || 0;
            
            // Calculate average salaries with better parsing
            let totalMin = 0, totalMax = 0, count = 0;
            data?.forEach(c => {
                if (c.salary_range) {
                    const { min, max } = parseSalaryRange(c.salary_range);
                    if (min > 0 && max > 0 && min <= max) {
                        totalMin += min;
                        totalMax += max;
                        count++;
                    }
                }
            });
            
            setSummaryMetrics({
                totalCandidates: total,
                activelyLooking,
                openToOpportunities: openOpportunities,
                availableImmediate,
                avgMinSalary: count > 0 ? totalMin / count : 0,
                avgMaxSalary: count > 0 ? totalMax / count : 0
            });
        } catch (err: any) {
            console.error('Error fetching summary metrics:', err);
        }
    }, []);

    // Fetch salary insights by field
    const fetchSalaryInsights = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('candidates')
                .select('interested_field, salary_range')
                .not('interested_field', 'is', null)
                .not('salary_range', 'is', null);
            
            if (fetchError) throw fetchError;
            
            const fieldMap = new Map();
            data?.forEach(c => {
                const field = c.interested_field;
                if (!fieldMap.has(field)) {
                    fieldMap.set(field, { totalMin: 0, totalMax: 0, count: 0 });
                }
                
                const { min, max } = parseSalaryRange(c.salary_range);
                if (min > 0 && max > 0 && min <= max) {
                    const existing = fieldMap.get(field);
                    existing.totalMin += min;
                    existing.totalMax += max;
                    existing.count++;
                    fieldMap.set(field, existing);
                }
            });
            
            const insights = Array.from(fieldMap.entries())
                .map(([field, data]) => ({
                    field,
                    avgMinSalary: data.count > 0 ? data.totalMin / data.count : 0,
                    avgMaxSalary: data.count > 0 ? data.totalMax / data.count : 0,
                    candidateCount: data.count
                }))
                .filter(insight => insight.candidateCount > 0)
                .sort((a, b) => b.avgMaxSalary - a.avgMaxSalary);
            
            setSalaryInsights(insights);
        } catch (err: any) {
            console.error('Error fetching salary insights:', err);
        }
    }, []);

    // Fetch field distribution
    const fetchFieldDistribution = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('candidates')
                .select('interested_field')
                .not('interested_field', 'is', null);
            
            if (fetchError) throw fetchError;
            
            const fieldMap = new Map();
            data?.forEach(c => {
                const field = c.interested_field;
                fieldMap.set(field, (fieldMap.get(field) || 0) + 1);
            });
            
            const distribution = Array.from(fieldMap.entries())
                .map(([field, count]) => ({ field, count }))
                .sort((a, b) => b.count - a.count);
            
            setFieldDistribution(distribution);
        } catch (err: any) {
            console.error('Error fetching field distribution:', err);
        }
    }, []);

    // Fetch status report
    const fetchStatusReport = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('candidates')
                .select('status')
                .not('status', 'is', null);
            
            if (fetchError) throw fetchError;
            
            const total = data?.length || 0;
            const statusMap = new Map();
            data?.forEach(c => {
                const status = c.status;
                statusMap.set(status, (statusMap.get(status) || 0) + 1);
            });
            
            const report = Array.from(statusMap.entries()).map(([status, count]) => ({
                status,
                count,
                percentage: total > 0 ? (count / total) * 100 : 0
            }));
            
            setStatusReport(report);
        } catch (err: any) {
            console.error('Error fetching status report:', err);
        }
    }, []);

    // Fetch generated reports history
    const fetchGeneratedReports = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .from('report_logs')
                .select('*')
                .order('generated_at', { ascending: false })
                .limit(10);
            
            if (fetchError) throw fetchError;
            
            const reports = data?.map(report => ({
                id: report.id,
                name: report.report_name,
                type: report.report_type as 'PDF' | 'Excel',
                generatedOn: new Date(report.generated_at).toLocaleString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                }),
                generatedBy: report.generated_by,
                filters: report.filters
            })) || [];
            
            setGeneratedReports(reports);
        } catch (err: any) {
            console.error('Error fetching generated reports:', err);
        }
    }, []);

    // Generate PDF Report
    const generatePDFReport = (reportName: string) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Add header
        doc.setFontSize(20);
        doc.setTextColor(37, 99, 235);
        doc.text(reportName, 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Generated by: Admin`, 14, 36);
        
        let startY = 50;
        
        switch (reportName) {
            case 'Candidate Summary':
                const summaryData = [
                    ['Total Candidates', formatNumber(summaryMetrics.totalCandidates)],
                    ['Actively Looking', formatNumber(summaryMetrics.activelyLooking)],
                    ['Open to Opportunities', formatNumber(summaryMetrics.openToOpportunities)],
                    ['Available Immediately', formatNumber(summaryMetrics.availableImmediate)],
                    ['Average Minimum Salary', `Rs. ${formatCurrency(summaryMetrics.avgMinSalary)}`],
                    ['Average Maximum Salary', `Rs. ${formatCurrency(summaryMetrics.avgMaxSalary)}`]
                ];
                
                autoTable(doc, {
                    head: [['Metric', 'Value']],
                    body: summaryData,
                    startY: startY,
                    theme: 'striped',
                    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
                    styles: { fontSize: 11, cellPadding: 6 },
                    columnStyles: {
                        0: { cellWidth: 70 },
                        1: { cellWidth: 70 }
                    }
                });
                break;
                
            case 'Salary Insights':
                if (salaryInsights.length === 0) {
                    doc.text('No salary data available', 14, startY);
                } else {
                    const salaryTableData = salaryInsights.map(insight => [
                        insight.field,
                        `Rs. ${formatCurrency(insight.avgMinSalary)}`,
                        `Rs. ${formatCurrency(insight.avgMaxSalary)}`,
                        formatNumber(insight.candidateCount)
                    ]);
                    
                    autoTable(doc, {
                        head: [['Field', 'Avg Min Salary', 'Avg Max Salary', 'Candidates']],
                        body: salaryTableData,
                        startY: startY,
                        theme: 'striped',
                        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
                        styles: { fontSize: 10, cellPadding: 5 },
                        columnStyles: {
                            0: { cellWidth: 55 },
                            1: { cellWidth: 35 },
                            2: { cellWidth: 35 },
                            3: { cellWidth: 30 }
                        }
                    });
                }
                break;
                
            case 'Field Distribution':
                if (fieldDistribution.length === 0) {
                    doc.text('No field data available', 14, startY);
                } else {
                    const fieldData = fieldDistribution.map(f => [f.field, formatNumber(f.count)]);
                    
                    autoTable(doc, {
                        head: [['Field', 'Candidate Count']],
                        body: fieldData,
                        startY: startY,
                        theme: 'striped',
                        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
                        styles: { fontSize: 11, cellPadding: 6 },
                        columnStyles: {
                            0: { cellWidth: 100 },
                            1: { cellWidth: 50 }
                        }
                    });
                }
                break;
                
            case 'Status Report':
                if (statusReport.length === 0) {
                    doc.text('No status data available', 14, startY);
                } else {
                    const statusData = statusReport.map(s => [s.status, formatNumber(s.count), `${s.percentage.toFixed(1)}%`]);
                    
                    autoTable(doc, {
                        head: [['Status', 'Count', 'Percentage']],
                        body: statusData,
                        startY: startY,
                        theme: 'striped',
                        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] },
                        styles: { fontSize: 11, cellPadding: 6 },
                        columnStyles: {
                            0: { cellWidth: 70 },
                            1: { cellWidth: 40 },
                            2: { cellWidth: 40 }
                        }
                    });
                }
                break;
        }
        
        // Add footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(
                `Page ${i} of ${pageCount} - Generated from Candidate Pool System`,
                doc.internal.pageSize.getWidth() / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }
        
        // Save PDF
        const fileName = `${reportName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        toast.success(`${reportName} PDF downloaded successfully`);
    };
    
    // Generate Excel Report
    const generateExcelReport = (reportName: string) => {
        let rows: any[][] = [];
        let headers: string[] = [];
        
        switch (reportName) {
            case 'Candidate Summary':
                headers = ['Metric', 'Value'];
                rows = [
                    ['Total Candidates', formatNumber(summaryMetrics.totalCandidates)],
                    ['Actively Looking', formatNumber(summaryMetrics.activelyLooking)],
                    ['Open to Opportunities', formatNumber(summaryMetrics.openToOpportunities)],
                    ['Available Immediately', formatNumber(summaryMetrics.availableImmediate)],
                    ['Average Minimum Salary', `Rs. ${formatCurrency(summaryMetrics.avgMinSalary)}`],
                    ['Average Maximum Salary', `Rs. ${formatCurrency(summaryMetrics.avgMaxSalary)}`],
                    ['Generated On', new Date().toLocaleString()]
                ];
                break;
                
            case 'Salary Insights':
                headers = ['Field', 'Avg Min Salary', 'Avg Max Salary', 'Candidate Count'];
                rows = salaryInsights.map(insight => [
                    insight.field,
                    `Rs. ${formatCurrency(insight.avgMinSalary)}`,
                    `Rs. ${formatCurrency(insight.avgMaxSalary)}`,
                    formatNumber(insight.candidateCount)
                ]);
                break;
                
            case 'Field Distribution':
                headers = ['Field', 'Candidate Count'];
                rows = fieldDistribution.map(f => [f.field, formatNumber(f.count)]);
                break;
                
            case 'Status Report':
                headers = ['Status', 'Count', 'Percentage'];
                rows = statusReport.map(s => [s.status, formatNumber(s.count), `${s.percentage.toFixed(1)}%`]);
                break;
        }
        
        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`${reportName} Excel report downloaded successfully`);
    };

    // Log report generation
    const logReportGeneration = useCallback(async (reportName: string, format: ReportFormat, filters?: any) => {
        try {
            const { error: insertError } = await supabase
                .from('report_logs')
                .insert([{
                    report_name: reportName,
                    report_type: format,
                    generated_by: 'Admin',
                    filters: filters || {},
                    generated_at: new Date().toISOString()
                }]);
            
            if (insertError) throw insertError;
            await fetchGeneratedReports();
        } catch (err: any) {
            console.error('Error logging report:', err);
        }
    }, [fetchGeneratedReports]);

    // Generate report data
    const generateReportData = useCallback(async (reportName: string, format: ReportFormat, filters?: any) => {
        try {
            // Refresh data before generating report
            await Promise.all([
                fetchSummaryMetrics(),
                fetchSalaryInsights(),
                fetchFieldDistribution(),
                fetchStatusReport()
            ]);
            
            await logReportGeneration(reportName, format, filters);
            toast.success(`${reportName} report generated successfully`);
            
        } catch (err: any) {
            toast.error('Failed to generate report');
            throw err;
        }
    }, [fetchSummaryMetrics, fetchSalaryInsights, fetchFieldDistribution, fetchStatusReport, logReportGeneration]);

    // Download report
    const downloadReport = useCallback((reportName: string, format: ReportFormat) => {
        if (format === 'PDF') {
            generatePDFReport(reportName);
        } else {
            generateExcelReport(reportName);
        }
    }, [summaryMetrics, salaryInsights, fieldDistribution, statusReport]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchSummaryMetrics(),
                fetchSalaryInsights(),
                fetchFieldDistribution(),
                fetchStatusReport(),
                fetchGeneratedReports()
            ]);
            setLoading(false);
        };
        
        loadData();
    }, [fetchSummaryMetrics, fetchSalaryInsights, fetchFieldDistribution, fetchStatusReport, fetchGeneratedReports]);

    return {
        generatedReports,
        summaryMetrics,
        salaryInsights,
        loading,
        error,
        generateReportData,
        downloadReport,
        refetch: () => {
            fetchSummaryMetrics();
            fetchSalaryInsights();
            fetchFieldDistribution();
            fetchStatusReport();
            fetchGeneratedReports();
        }
    };
};
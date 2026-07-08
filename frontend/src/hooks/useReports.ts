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
    const [filteredData, setFilteredData] = useState<any[]>([]);
    
    const [filteredSalaryInsights, setFilteredSalaryInsights] = useState<SalaryInsight[]>([]);
    const [filteredFieldDistribution, setFilteredFieldDistribution] = useState<any[]>([]);
    const [filteredStatusReport, setFilteredStatusReport] = useState<any[]>([]);
    const [filteredSummaryMetrics, setFilteredSummaryMetrics] = useState<SummaryMetrics>({
        totalCandidates: 0,
        activelyLooking: 0,
        openToOpportunities: 0,
        availableImmediate: 0,
        avgMinSalary: 0,
        avgMaxSalary: 0
    });
    const [currentFilters, setCurrentFilters] = useState<any>(null);
    const [isFiltered, setIsFiltered] = useState(false);

    const parseSalaryRange = (salaryRange: string): { min: number; max: number } => {
        if (!salaryRange) return { min: 0, max: 0 };
        
        let cleaned = salaryRange.replace(/\s/g, '');
        let parts = cleaned.split(/[-–—]/);
        
        if (parts.length === 2) {
            let min = parseFloat(parts[0].replace(/[^0-9.]/g, ''));
            let max = parseFloat(parts[1].replace(/[^0-9.]/g, ''));
            
            if (min > max) {
                [min, max] = [max, min];
            }
            
            if (isNaN(min)) min = 0;
            if (isNaN(max)) max = 0;
            
            return { min, max };
        }
        
        return { min: 0, max: 0 };
    };

    const formatCurrency = (value: number): string => {
        if (!value || isNaN(value) || value === 0) return '0';
        const rounded = Math.round(value);
        return rounded.toLocaleString('en-IN');
    };

    const formatNumber = (value: number): string => {
        if (!value || isNaN(value)) return '0';
        return value.toLocaleString('en-IN');
    };

    const fetchFilteredData = useCallback(async (filters: any) => {
        try {
            setLoading(true);
            setCurrentFilters(filters);
            
            console.log(' Fetching filtered data with filters:', filters);
            
            let query = supabase
                .from('candidates')
                .select('*');

            if (filters.fromDate) {
                query = query.gte('created_at', filters.fromDate);
            }
            if (filters.toDate) {
                query = query.lte('created_at', `${filters.toDate}T23:59:59`);
            }
            if (filters.field && filters.field !== 'All Fields') {
                query = query.eq('interested_field', filters.field);
            }
            if (filters.status && filters.status !== 'All Status') {
                query = query.eq('status', filters.status);
            }
            if (filters.availability && filters.availability !== 'All Availability') {
                query = query.eq('availability', filters.availability);
            }

            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;

            console.log(' Filtered data result:', { 
                dataLength: data?.length,
                fields: data?.map(c => c.interested_field)
            });

            setFilteredData(data || []);
            
            const hasFilters = (filters.field && filters.field !== 'All Fields') ||
                              (filters.status && filters.status !== 'All Status') ||
                              (filters.availability && filters.availability !== 'All Availability') ||
                              filters.fromDate || filters.toDate;
            setIsFiltered(hasFilters);

            const total = data?.length || 0;
            const activelyLooking = data?.filter(c => c.status === 'Actively Looking').length || 0;
            const openOpportunities = data?.filter(c => c.status === 'Open to Opportunities').length || 0;
            const availableImmediate = data?.filter(c => c.availability === 'Immediate').length || 0;
            
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
            
            const newSummaryMetrics = {
                totalCandidates: total,
                activelyLooking,
                openToOpportunities: openOpportunities,
                availableImmediate,
                avgMinSalary: count > 0 ? totalMin / count : 0,
                avgMaxSalary: count > 0 ? totalMax / count : 0
            };
            
            setFilteredSummaryMetrics(newSummaryMetrics);
            setSummaryMetrics(newSummaryMetrics);

            const fieldMap = new Map();
            data?.forEach(c => {
                const field = c.interested_field;
                if (field) {
                    fieldMap.set(field, (fieldMap.get(field) || 0) + 1);
                }
            });
            
            const distribution = Array.from(fieldMap.entries())
                .map(([field, count]) => ({ field, count }))
                .sort((a, b) => b.count - a.count);
            
            setFilteredFieldDistribution(distribution);
            setFieldDistribution(distribution);

            const totalFiltered = data?.length || 0;
            const statusMap = new Map();
            data?.forEach(c => {
                const status = c.status;
                if (status) {
                    statusMap.set(status, (statusMap.get(status) || 0) + 1);
                }
            });
            
            const report = Array.from(statusMap.entries()).map(([status, count]) => ({
                status,
                count,
                percentage: totalFiltered > 0 ? (count / totalFiltered) * 100 : 0
            }));
            
            setFilteredStatusReport(report);
            setStatusReport(report);

            const salaryFieldMap = new Map();
            data?.forEach(c => {
                const field = c.interested_field;
                if (!field) return;
                
                if (!salaryFieldMap.has(field)) {
                    salaryFieldMap.set(field, { totalMin: 0, totalMax: 0, count: 0 });
                }
                
                const { min, max } = parseSalaryRange(c.salary_range);
                if (min > 0 && max > 0 && min <= max) {
                    const existing = salaryFieldMap.get(field);
                    existing.totalMin += min;
                    existing.totalMax += max;
                    existing.count++;
                    salaryFieldMap.set(field, existing);
                }
            });
            
            const insights = Array.from(salaryFieldMap.entries())
                .map(([field, data]) => ({
                    field,
                    avgMinSalary: data.count > 0 ? data.totalMin / data.count : 0,
                    avgMaxSalary: data.count > 0 ? data.totalMax / data.count : 0,
                    candidateCount: data.count
                }))
                .filter(insight => insight.candidateCount > 0)
                .sort((a, b) => b.avgMaxSalary - a.avgMaxSalary);
            
            console.log(' Filtered salary insights:', insights);
            
            setFilteredSalaryInsights(insights);
            setSalaryInsights(insights);

            return data;
        } catch (err: any) {
            console.error(' Error fetching filtered data:', err);
            toast.error('Failed to fetch filtered data');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

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
            
            const newMetrics = {
                totalCandidates: total,
                activelyLooking,
                openToOpportunities: openOpportunities,
                availableImmediate,
                avgMinSalary: count > 0 ? totalMin / count : 0,
                avgMaxSalary: count > 0 ? totalMax / count : 0
            };
            setSummaryMetrics(newMetrics);
            setFilteredSummaryMetrics(newMetrics);
        } catch (err: any) {
            console.error('Error fetching summary metrics:', err);
        }
    }, []);

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
            setFilteredSalaryInsights(insights);
        } catch (err: any) {
            console.error('Error fetching salary insights:', err);
        }
    }, []);

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
            setFilteredFieldDistribution(distribution);
        } catch (err: any) {
            console.error('Error fetching field distribution:', err);
        }
    }, []);

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
            setFilteredStatusReport(report);
        } catch (err: any) {
            console.error('Error fetching status report:', err);
        }
    }, []);

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

    const generatePDFReport = useCallback((reportName: string) => {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        doc.setFontSize(20);
        doc.setTextColor(37, 99, 235);
        doc.text(reportName, 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Generated by: Admin`, 14, 36);
        
        let filterY = 42;
        if (currentFilters) {
            doc.setFontSize(8);
            doc.setTextColor(80, 80, 80);
            const filterParts = [];
            if (currentFilters.field && currentFilters.field !== 'All Fields') filterParts.push(`Field: ${currentFilters.field}`);
            if (currentFilters.status && currentFilters.status !== 'All Status') filterParts.push(`Status: ${currentFilters.status}`);
            if (currentFilters.availability && currentFilters.availability !== 'All Availability') filterParts.push(`Availability: ${currentFilters.availability}`);
            if (currentFilters.fromDate) filterParts.push(`From: ${currentFilters.fromDate}`);
            if (currentFilters.toDate) filterParts.push(`To: ${currentFilters.toDate}`);
            
            if (filterParts.length > 0) {
                doc.text(`Filters: ${filterParts.join(' | ')}`, 14, filterY);
                filterY += 8;
            }
        }
        
        let startY = filterY + 4;
        
        const useSalaryInsights = isFiltered && filteredSalaryInsights.length > 0 
            ? filteredSalaryInsights 
            : salaryInsights;
        const useFieldDistribution = isFiltered && filteredFieldDistribution.length > 0 
            ? filteredFieldDistribution 
            : fieldDistribution;
        const useStatusReport = isFiltered && filteredStatusReport.length > 0 
            ? filteredStatusReport 
            : statusReport;
        const useSummaryMetrics = isFiltered && filteredSummaryMetrics.totalCandidates > 0 
            ? filteredSummaryMetrics 
            : summaryMetrics;

        console.log(' Generating report with data:', {
            isFiltered,
            useSalaryInsights: useSalaryInsights.length,
            useSalaryInsightsData: useSalaryInsights.map(i => i.field)
        });
        
        switch (reportName) {
            case 'Candidate Summary':
                const summaryData = [
                    ['Total Candidates', formatNumber(useSummaryMetrics.totalCandidates)],
                    ['Actively Looking', formatNumber(useSummaryMetrics.activelyLooking)],
                    ['Open to Opportunities', formatNumber(useSummaryMetrics.openToOpportunities)],
                    ['Available Immediately', formatNumber(useSummaryMetrics.availableImmediate)],
                    ['Average Minimum Salary', `Rs. ${formatCurrency(useSummaryMetrics.avgMinSalary)}`],
                    ['Average Maximum Salary', `Rs. ${formatCurrency(useSummaryMetrics.avgMaxSalary)}`]
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
                if (useSalaryInsights.length === 0) {
                    doc.text('No salary data available for the selected filters', 14, startY);
                } else {
                    const salaryTableData = useSalaryInsights.map(insight => [
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
                if (useFieldDistribution.length === 0) {
                    doc.text('No field data available for the selected filters', 14, startY);
                } else {
                    const fieldData = useFieldDistribution.map(f => [f.field, formatNumber(f.count)]);
                    
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
                if (useStatusReport.length === 0) {
                    doc.text('No status data available for the selected filters', 14, startY);
                } else {
                    const statusData = useStatusReport.map(s => [s.status, formatNumber(s.count), `${s.percentage.toFixed(1)}%`]);
                    
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
        
        const fileName = `${reportName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
        toast.success(`${reportName} PDF downloaded successfully`);
    }, [salaryInsights, fieldDistribution, statusReport, summaryMetrics, filteredSalaryInsights, filteredFieldDistribution, filteredStatusReport, filteredSummaryMetrics, currentFilters, isFiltered]);
    
    const generateExcelReport = useCallback((reportName: string) => {
        const useSalaryInsights = isFiltered && filteredSalaryInsights.length > 0 
            ? filteredSalaryInsights 
            : salaryInsights;
        const useFieldDistribution = isFiltered && filteredFieldDistribution.length > 0 
            ? filteredFieldDistribution 
            : fieldDistribution;
        const useStatusReport = isFiltered && filteredStatusReport.length > 0 
            ? filteredStatusReport 
            : statusReport;
        const useSummaryMetrics = isFiltered && filteredSummaryMetrics.totalCandidates > 0 
            ? filteredSummaryMetrics 
            : summaryMetrics;
        
        let rows: any[][] = [];
        let headers: string[] = [];
        
        switch (reportName) {
            case 'Candidate Summary':
                headers = ['Metric', 'Value'];
                rows = [
                    ['Total Candidates', formatNumber(useSummaryMetrics.totalCandidates)],
                    ['Actively Looking', formatNumber(useSummaryMetrics.activelyLooking)],
                    ['Open to Opportunities', formatNumber(useSummaryMetrics.openToOpportunities)],
                    ['Available Immediately', formatNumber(useSummaryMetrics.availableImmediate)],
                    ['Average Minimum Salary', `Rs. ${formatCurrency(useSummaryMetrics.avgMinSalary)}`],
                    ['Average Maximum Salary', `Rs. ${formatCurrency(useSummaryMetrics.avgMaxSalary)}`],
                    ['Generated On', new Date().toLocaleString()]
                ];
                break;
                
            case 'Salary Insights':
                headers = ['Field', 'Avg Min Salary', 'Avg Max Salary', 'Candidate Count'];
                rows = useSalaryInsights.map(insight => [
                    insight.field,
                    `Rs. ${formatCurrency(insight.avgMinSalary)}`,
                    `Rs. ${formatCurrency(insight.avgMaxSalary)}`,
                    formatNumber(insight.candidateCount)
                ]);
                break;
                
            case 'Field Distribution':
                headers = ['Field', 'Candidate Count'];
                rows = useFieldDistribution.map(f => [f.field, formatNumber(f.count)]);
                break;
                
            case 'Status Report':
                headers = ['Status', 'Count', 'Percentage'];
                rows = useStatusReport.map(s => [s.status, formatNumber(s.count), `${s.percentage.toFixed(1)}%`]);
                break;
        }
        
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
    }, [salaryInsights, fieldDistribution, statusReport, summaryMetrics, filteredSalaryInsights, filteredFieldDistribution, filteredStatusReport, filteredSummaryMetrics, isFiltered]);

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

    const generateReportData = useCallback(async (reportName: string, format: ReportFormat, filters?: any) => {
        try {
            await logReportGeneration(reportName, format, filters);
            toast.success(`${reportName} report generated successfully`);
        } catch (err: any) {
            toast.error('Failed to generate report');
            throw err;
        }
    }, [logReportGeneration]);

    const downloadReport = useCallback((reportName: string, format: ReportFormat) => {
        if (format === 'PDF') {
            generatePDFReport(reportName);
        } else {
            generateExcelReport(reportName);
        }
    }, [generatePDFReport, generateExcelReport]);

    const resetFilters = useCallback(() => {
        setIsFiltered(false);
        setCurrentFilters(null);
        fetchSummaryMetrics();
        fetchSalaryInsights();
        fetchFieldDistribution();
        fetchStatusReport();
    }, [fetchSummaryMetrics, fetchSalaryInsights, fetchFieldDistribution, fetchStatusReport]);

    const refetch = useCallback(() => {
        setIsFiltered(false);
        setCurrentFilters(null);
        fetchSummaryMetrics();
        fetchSalaryInsights();
        fetchFieldDistribution();
        fetchStatusReport();
        fetchGeneratedReports();
    }, [fetchSummaryMetrics, fetchSalaryInsights, fetchFieldDistribution, fetchStatusReport, fetchGeneratedReports]);

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
        fieldDistribution,
        statusReport,
        loading,
        error,
        generateReportData,
        downloadReport,
        fetchFilteredData,
        resetFilters,
        isFiltered,
        refetch
    };
};
import React, { useState, useEffect } from 'react';
import { FiDownload, FiInfo } from 'react-icons/fi';
import { FaFileCsv, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type SelectedFields = {
  'Personal Info': boolean;
  'Professional Experience': boolean;
  'Skills': boolean;
  'Salary Expectations': boolean;
  'Availability': boolean;
  'Joined Date': boolean;
};

const ExportData: React.FC = () => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [timePeriod, setTimePeriod] = useState('All Time');
  const [selectedFields, setSelectedFields] = useState<SelectedFields>({
    'Personal Info': true,
    'Professional Experience': true,
    'Skills': true,
    'Salary Expectations': true,
    'Availability': true,
    'Joined Date': true
  });
  const [exporting, setExporting] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);

  const fetchCandidates = async () => {
    try {
      let query = supabase.from('candidates').select('*');
      
      if (timePeriod === 'Today') {
        const today = new Date().toISOString().split('T')[0];
        query = query.gte('created_at', today);
      } else if (timePeriod === 'This Week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('created_at', weekAgo.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      setCandidates(data || []);
    } catch (error: any) {
      console.error('Error fetching candidates:', error);
      toast.error('Failed to fetch candidates');
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [timePeriod]);

  const toggleField = (field: keyof SelectedFields) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const prepareExportData = () => {
    return candidates.map(candidate => {
      const exportRow: Record<string, any> = {};
      
      if (selectedFields['Personal Info']) {
        exportRow['Name'] = candidate.name || '';
        exportRow['Email'] = candidate.email || '';
        exportRow['Phone'] = candidate.phone || '';
      }
      
      if (selectedFields['Professional Experience']) {
        exportRow['Field'] = candidate.interested_field || '';
        exportRow['Experience'] = candidate.years_of_experience || '';
      }
      
      if (selectedFields['Skills']) {
        exportRow['Skills'] = candidate.skills ? candidate.skills.join(', ') : '';
      }
      
      if (selectedFields['Salary Expectations']) {
        exportRow['Salary Range'] = candidate.salary_range || '';
      }
      
      if (selectedFields['Availability']) {
        exportRow['Availability'] = candidate.availability || '';
        exportRow['Status'] = candidate.status || '';
      }
      
      if (selectedFields['Joined Date']) {
        exportRow['Joined Date'] = candidate.created_at ? new Date(candidate.created_at).toLocaleDateString() : '';
      }
      
      return exportRow;
    });
  };

  const getHeaders = () => {
    const sampleRow = prepareExportData()[0];
    return sampleRow ? Object.keys(sampleRow) : [];
  };

  const getDataRows = () => {
    const exportData = prepareExportData();
    const headers = getHeaders();
    return exportData.map(row => headers.map(header => row[header] || ''));
  };

  const exportToCSV = () => {
    const exportData = prepareExportData();
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `candidates_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const exportToExcel = () => {
    const exportData = prepareExportData();
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = Object.keys(exportData[0]);
    
    let htmlContent = `<html><head><meta charset="UTF-8"></head><body><table border="1">`;
    htmlContent += `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
    
    exportData.forEach(row => {
      htmlContent += `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`;
    });
    
    htmlContent += `</table></body></html>`;
    
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `candidates_export_${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Excel file exported successfully');
  };

  const exportToPDF = () => {
    const exportData = prepareExportData();
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = getHeaders();
    const dataRows = getDataRows();
    
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text('Candidates Export Report', 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Time Period: ${timePeriod}`, 14, 36);
    doc.text(`Total Records: ${exportData.length}`, 14, 42);
    
    autoTable(doc, {
      head: [headers],
      body: dataRows,
      startY: 50,
      theme: 'striped',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [241, 245, 249]
      },
      margin: { top: 50, left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
        6: { cellWidth: 25 },
        7: { cellWidth: 25 }
      }
    });
    
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
    
    doc.save(`candidates_export_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF exported successfully');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await fetchCandidates();
      
      if (candidates.length === 0) {
        toast.error('No candidates found to export');
        setExporting(false);
        return;
      }
      
      switch (exportFormat) {
        case 'csv':
          exportToCSV();
          break;
        case 'excel':
          exportToExcel();
          break;
        case 'pdf':
          exportToPDF();
          break;
        default:
          exportToCSV();
      }
    } catch (error: any) {
      toast.error('Export failed: ' + error.message);
    } finally {
      setExporting(false);
    }
  };

  const getFieldCount = () => {
    return Object.values(selectedFields).filter(Boolean).length;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Export Data</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Dashboard / Export Data</p>
      </div>

      {/* CARD */}
      <div className="max-w-4xl bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 space-y-6">
          
          {/* 1. Format Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              1. Select Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div 
                onClick={() => setExportFormat('csv')} 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  exportFormat === 'csv' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                    <FaFileCsv className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">CSV</h4>
                  </div>
                </div>
              </div>
              <div 
                onClick={() => setExportFormat('excel')} 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  exportFormat === 'excel' 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600">
                    <FaFileExcel className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">Excel</h4>
                  </div>
                </div>
              </div>
              <div 
                onClick={() => setExportFormat('pdf')} 
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  exportFormat === 'pdf' 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100 text-red-600">
                    <FaFilePdf className="text-xl" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700">PDF</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Time Period */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              2. Select Time Period
            </label>
            <select 
              className="w-full sm:max-w-xs px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option>All Time</option>
              <option>Today</option>
              <option>This Week</option>
            </select>
          </div>

          {/* 3. Fields */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
              3. Choose Fields to Include ({getFieldCount()} selected)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={selectedFields['Personal Info']}
                  onChange={() => toggleField('Personal Info')}
                />
                <span className="text-sm text-slate-700">Personal Info</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={selectedFields['Professional Experience']}
                  onChange={() => toggleField('Professional Experience')}
                />
                <span className="text-sm text-slate-700">Professional Experience</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={selectedFields['Skills']}
                  onChange={() => toggleField('Skills')}
                />
                <span className="text-sm text-slate-700">Skills</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={selectedFields['Salary Expectations']}
                  onChange={() => toggleField('Salary Expectations')}
                />
                <span className="text-sm text-slate-700">Salary Expectations</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={selectedFields['Availability']}
                  onChange={() => toggleField('Availability')}
                />
                <span className="text-sm text-slate-700">Availability</span>
              </label>
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  checked={selectedFields['Joined Date']}
                  onChange={() => toggleField('Joined Date')}
                />
                <span className="text-sm text-slate-700">Joined Date</span>
              </label>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="flex items-start gap-2 p-3 bg-slate-100 rounded-xl border border-slate-200">
            <FiInfo className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">
              <strong>Ready to export:</strong> {candidates.length} candidates • {getFieldCount()} fields • {timePeriod}
            </p>
          </div>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-200">
            <FiInfo className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-600">
              Your export data complies with strict end-to-end security measures. All candidate details are encrypted and stored securely.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
          <button 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            onClick={() => {
              setTimePeriod('All Time');
              setExportFormat('csv');
              setSelectedFields({
                'Personal Info': true,
                'Professional Experience': true,
                'Skills': true,
                'Salary Expectations': true,
                'Availability': true,
                'Joined Date': true
              });
            }}
          >
            Reset
          </button>
          <button 
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition"
            onClick={handleExport}
            disabled={exporting || candidates.length === 0}
          >
            <FiDownload /> {exporting ? 'Exporting...' : 'Export Dataset'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
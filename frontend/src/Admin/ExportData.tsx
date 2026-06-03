import React, { useState, useEffect } from 'react';
import '../global.css'; 
import { FiDownload, FiInfo } from 'react-icons/fi';
import { FaFileCsv, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define types for selected fields
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

  // Fetch candidates data
  const fetchCandidates = async () => {
    try {
      let query = supabase.from('candidates').select('*');
      
      // Apply time period filter
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

  // Toggle field selection
  const toggleField = (field: keyof SelectedFields) => {
    setSelectedFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Prepare data for export based on selected fields
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

  // Get headers for export
  const getHeaders = () => {
    const sampleRow = prepareExportData()[0];
    return sampleRow ? Object.keys(sampleRow) : [];
  };

  // Get data rows for export
  const getDataRows = () => {
    const exportData = prepareExportData();
    const headers = getHeaders();
    return exportData.map(row => headers.map(header => row[header] || ''));
  };

  // Export to CSV
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

  // Export to Excel (XLS format)
  const exportToExcel = () => {
    const exportData = prepareExportData();
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = Object.keys(exportData[0]);
    
    // Create HTML table for Excel
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

  // Export to PDF using jsPDF
  const exportToPDF = () => {
    const exportData = prepareExportData();
    if (exportData.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = getHeaders();
    const dataRows = getDataRows();
    
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text('Candidates Export Report', 14, 20);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Time Period: ${timePeriod}`, 14, 36);
    doc.text(`Total Records: ${exportData.length}`, 14, 42);
    
    // Add table
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
    
    // Save the PDF
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
    <div className="export-content">
      {/* HEADER */}
      <div className="header">
        <h1>Export Data</h1>
        <p>Dashboard / Export Data</p>
      </div>

      {/* CARD */}
      <div className="export-card">
        <div className="card-body">
          
          {/* 1. Format Selection */}
          <div>
            <label className="section-label">1. Select Export Format</label>
            <div className="format-grid">
              <div onClick={() => setExportFormat('csv')} className={`format-option ${exportFormat === 'csv' ? 'active' : ''}`}>
                <div className="format-icon" style={{background: '#e0f2fe', color: '#0284c7'}}><FaFileCsv /></div>
                <div><h4 style={{fontSize:'14px'}}>CSV Format</h4></div>
              </div>
              <div onClick={() => setExportFormat('excel')} className={`format-option ${exportFormat === 'excel' ? 'active' : ''}`}>
                <div className="format-icon" style={{background: '#dcfce7', color: '#16a34a'}}><FaFileExcel /></div>
                <div><h4 style={{fontSize:'14px'}}>Excel Workbook</h4></div>
              </div>
              <div onClick={() => setExportFormat('pdf')} className={`format-option ${exportFormat === 'pdf' ? 'active' : ''}`}>
                <div className="format-icon" style={{background: '#fee2e2', color: '#dc2626'}}><FaFilePdf /></div>
                <div><h4 style={{fontSize:'14px'}}>PDF Document</h4></div>
              </div>
            </div>
          </div>

          {/* 2. Time Period */}
          <div>
            <label className="section-label">2. Select Time Period</label>
            <select 
              className="time-period-select" 
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
            <label className="section-label">3. Choose Fields to Include ({getFieldCount()} selected)</label>
            <div className="fields-grid">
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={selectedFields['Personal Info']}
                  onChange={() => toggleField('Personal Info')}
                />
                <span style={{fontSize:'13px'}}>Personal Info</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={selectedFields['Professional Experience']}
                  onChange={() => toggleField('Professional Experience')}
                />
                <span style={{fontSize:'13px'}}>Professional Experience</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={selectedFields['Skills']}
                  onChange={() => toggleField('Skills')}
                />
                <span style={{fontSize:'13px'}}>Skills</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={selectedFields['Salary Expectations']}
                  onChange={() => toggleField('Salary Expectations')}
                />
                <span style={{fontSize:'13px'}}>Salary Expectations</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={selectedFields['Availability']}
                  onChange={() => toggleField('Availability')}
                />
                <span style={{fontSize:'13px'}}>Availability</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={selectedFields['Joined Date']}
                  onChange={() => toggleField('Joined Date')}
                />
                <span style={{fontSize:'13px'}}>Joined Date</span>
              </label>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="security-box" style={{background: '#f1f5f9', marginTop: '16px'}}>
            <FiInfo style={{marginTop:'2px', marginRight:'8px', color: '#2563eb'}} />
            <p style={{fontSize: '13px'}}>
              <strong>Ready to export:</strong> {candidates.length} candidates • {getFieldCount()} fields • {timePeriod}
            </p>
          </div>

          {/* Security Notice */}
          <div className="security-box">
            <FiInfo style={{marginTop:'2px', marginRight:'8px'}} />
            <p>Your export data complies with strict end-to-end security measures. All candidate details are encrypted and stored securely.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions">
          <button 
            style={{background:'transparent', border:'none', cursor:'pointer', fontWeight:'600', color:'#64748b'}}
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
            className="btn-export" 
            onClick={handleExport}
            disabled={exporting || candidates.length === 0}
            style={{opacity: exporting || candidates.length === 0 ? 0.7 : 1}}
          >
            <FiDownload /> {exporting ? 'Exporting...' : 'Export Dataset'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
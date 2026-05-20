import React, { useState, useEffect } from 'react';
import { FiDownload, FiInfo, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { FaFileCsv, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import { exportService } from '../services/exportService';
import '../global.css';

const ExportData: React.FC = () => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [timePeriod, setTimePeriod] = useState('all');
  const [selectedFields, setSelectedFields] = useState([
    'Personal Info',
    'Professional Experience',
    'Skills',
    'Salary Expectations',
    'Availability',
    'Joined Date'
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  const fields = [
    'Personal Info',
    'Professional Experience',
    'Skills',
    'Salary Expectations',
    'Availability',
    'Joined Date'
  ];

  useEffect(() => {
    loadExportHistory();
  }, []);

  const loadExportHistory = async () => {
    try {
      const history = await exportService.getExportHistory();
      setExportHistory(history);
    } catch (err) {
      console.error('Failed to load export history:', err);
    }
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportClick = async () => {
    if (selectedFields.length === 0) {
      setError('Please select at least one field to export');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setExportProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await exportService.exportData({
        format: exportFormat as 'csv' | 'excel' | 'pdf',
        timePeriod: timePeriod as 'all' | 'today' | 'week' | 'month' | 'year',
        fields: selectedFields
      });

      clearInterval(progressInterval);
      setExportProgress(100);

      if (result.success && result.data) {
        // Convert data to CSV and download
        const csvData = exportService.convertToCSV(result.data);
        const blob = new Blob([csvData], { type: 'text/csv' });
        const filename = `candidates_export_${new Date().toISOString()}.${exportFormat}`;
        downloadBlob(blob, filename);
        setSuccess('Export completed successfully!');
        await loadExportHistory(); // Refresh history
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setExportProgress(0);
        setSuccess(null);
      }, 3000);
    }
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
              <div 
                onClick={() => setExportFormat('csv')} 
                className={`format-option ${exportFormat === 'csv' ? 'active' : ''}`}
              >
                <div className="format-icon" style={{background: '#e0f2fe', color: '#0284c7'}}>
                  <FaFileCsv />
                </div>
                <div><h4 style={{fontSize:'14px'}}>CSV Format</h4></div>
              </div>
              <div 
                onClick={() => setExportFormat('excel')} 
                className={`format-option ${exportFormat === 'excel' ? 'active' : ''}`}
              >
                <div className="format-icon" style={{background: '#dcfce7', color: '#16a34a'}}>
                  <FaFileExcel />
                </div>
                <div><h4 style={{fontSize:'14px'}}>Excel Workbook</h4></div>
              </div>
              <div 
                onClick={() => setExportFormat('pdf')} 
                className={`format-option ${exportFormat === 'pdf' ? 'active' : ''}`}
              >
                <div className="format-icon" style={{background: '#fee2e2', color: '#dc2626'}}>
                  <FaFilePdf />
                </div>
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
              <option value="all">All Time (Default)</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          {/* 3. Fields */}
          <div>
            <label className="section-label">3. Choose Fields to Include</label>
            <div className="fields-grid">
              {fields.map((field) => (
                <label key={field} className="checkbox-item">
                  <input 
                    type="checkbox" 
                    checked={selectedFields.includes(field)}
                    onChange={() => handleFieldToggle(field)}
                  />
                  <span style={{fontSize:'13px'}}>{field}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          {loading && exportProgress > 0 && (
            <div className="progress-bar-container">
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
              <span className="progress-text">Exporting... {exportProgress}%</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="success-message">
              <FiCheckCircle />
              <p>{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <FiAlertCircle />
              <p>{error}</p>
            </div>
          )}

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
              setExportFormat('csv');
              setTimePeriod('all');
              setSelectedFields([...fields]);
              setError(null);
            }}
          >
            Reset
          </button>
          <button 
            className="btn-export" 
            onClick={handleExportClick}
            disabled={loading || selectedFields.length === 0}
          >
            {loading ? <FiLoader className="spinner" /> : <FiDownload />}
            {loading ? 'Exporting...' : 'Export Dataset'}
          </button>
        </div>
      </div>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <div className="export-history">
          <h3>Recent Exports</h3>
          <div className="history-list">
            {exportHistory.map((job) => (
              <div key={job.id} className="history-item">
                <span>{new Date(job.created_at).toLocaleString()}</span>
                <span>{job.format.toUpperCase()}</span>
                <span>{job.record_count} records</span>
                <span className={`status-${job.status}`}>{job.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportData;
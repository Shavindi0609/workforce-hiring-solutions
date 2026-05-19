import React, { useState } from 'react';
import '../global.css'; 
import { FiDownload, FiCalendar, FiInfo, FiChevronDown } from 'react-icons/fi';
import { FaFileCsv, FaFilePdf, FaFileExcel } from 'react-icons/fa';

const ExportData: React.FC = () => {
  const [exportFormat, setExportFormat] = useState('csv');

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
            <select className="time-period-select">
              <option>All Time (Default)</option>
              <option>Today</option>
              <option>This Week</option>
            </select>
          </div>

          {/* 3. Fields */}
          <div>
            <label className="section-label">3. Choose Fields to Include</label>
            <div className="fields-grid">
              {['Personal Info', 'Professional Experience', 'Skills', 'Salary Expectations', 'Availability', 'Joined Date'].map((field) => (
                <label key={field} className="checkbox-item">
                  <input type="checkbox" defaultChecked />
                  <span style={{fontSize:'13px'}}>{field}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="security-box">
            <FiInfo style={{marginTop:'2px', marginRight:'8px'}} />
            <p>Your export data complies with strict end-to-end security measures. All candidate details are encrypted and stored securely.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="card-actions">
          <button style={{background:'transparent', border:'none', cursor:'pointer', fontWeight:'600', color:'#64748b'}}>Cancel</button>
          <button className="btn-export"><FiDownload /> Export Dataset</button>
        </div>
      </div>
    </div>
  );
};

export default ExportData;
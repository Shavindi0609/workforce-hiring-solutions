import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import "../global.css";



const DashboardLayout: React.FC = () => {
  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <div className="logo-area">WORKFORCE</div>
        <div className="nav-links">
          <NavLink to="/dashboard" className="nav-link">Dashboard</NavLink>
          <NavLink to="/candidates" className="nav-link">Candidates</NavLink>
          <NavLink to="/admin/reports" className="nav-link">Reports</NavLink>
          <NavLink to="/admin/salary-insights" className="nav-link">Salary Insights</NavLink>
          <NavLink to="/exportdata" className="nav-link">Export Data</NavLink>
        </div>
      </div>
      <div className="main-content">
        <Outlet /> 
      </div>
    </div>
  );
};
export default DashboardLayout;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignIn from './Candidate/SignIn';
import ExportData from './Candidate/ExportData';
import CandidateDashboard from './Candidate/CandidateDashboard';
import DashboardLayout from './components/DashboardLayout';
import SettingsPage from './Candidate/Settings';
import Reports from './Admin/Reports';
import SalaryInsights from './Admin/SalaryInsights';
import ProfileCreated from './Candidate/ProfileCreated';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/profile-created" element={<ProfileCreated />} /> 
  
        {/* Redirect empty path to settings (or dashboard) */}
       
       

        {/* Protected Routes (Dashboard Layout) */}
        <Route element={<DashboardLayout />}>
          <Route path="/settings" element={<SettingsPage />} />       
          <Route path="/exportdata" element={<ExportData />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/salary-insights" element={<SalaryInsights />} />
        
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

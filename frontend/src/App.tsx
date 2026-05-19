import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './Candidate/SignIn';
import ExportData from './Candidate/ExportData';
import DashboardLayout from './components/DashboardLayout';
import SettingsPage from './Candidate/Settings';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
  
        {/* Redirect empty path to settings (or dashboard) */}
       <Route path="/settings" element={<SettingsPage />} />
       

        {/* Protected Routes (Dashboard Layout) */}
        <Route element={<DashboardLayout />}>
          
          <Route path="/exportdata" element={<ExportData />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import BasicInformation from './Candidate/BasicInformation';
import ProfessionalInfo from './Candidate/ProfessionalInfo';
import SkillsExperience from './Candidate/SkillsExperience';
import AdditionalDetails from './Candidate/AdditionalDetails';
import SignIn from './Candidate/SignIn';
import Home from './Candidate/Home';
import ExportData from './Candidate/ExportData';
import CandidateDashboard from './Candidate/CandidateDashboard';
import AdminDashboard from './Admin/AdminDashboard';
import DashboardLayout from './components/DashboardLayout';
import SettingsPage from './Candidate/Settings';
import Reports from './Admin/Reports';
import ProfileCreated from './Candidate/ProfileCreated';
import SalaryInsights from './Admin/SalaryInsights';
import type { BasicInfoData, ProfessionalInfoData } from './Candidate/types';
import type { CandidateFormData } from './types/candidate';
import './App.css';

const initialFormData: CandidateFormData = {
  skills: [],
  status: '',
  availability: '',
  willingToContact: '',
  salaryRange: '',
};

// Registration Flow Component
function RegistrationFlow() {
  const navigate = useNavigate();
  const [basicData, setBasicData] = useState<BasicInfoData | null>(null);
  const [professionalData, setProfessionalData] = useState<ProfessionalInfoData | null>(null);
  const [formData, setFormData] = useState<CandidateFormData>(initialFormData);

  const updateFormData = (data: Partial<CandidateFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleBasicNext = (data: BasicInfoData) => {
    setBasicData(data);
    navigate('/candidate/professional');
  };

  const handleProfessionalNext = (data: ProfessionalInfoData) => {
    setProfessionalData(data);
    navigate('/candidate/skills');
  };

  const handleFinalSubmit = () => {
    const completeProfile = { 
      basicData, 
      professionalData, 
      ...formData 
    };
    console.log('Complete profile:', completeProfile);
    alert('Registration completed! Redirecting to dashboard...');
    navigate('/candidate/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route
          path="/basic"
          element={
            <BasicInformation
              onNext={handleBasicNext}
              initialData={basicData ?? undefined}
            />
          }
        />
        <Route
          path="/professional"
          element={
            <ProfessionalInfo
              onNext={handleProfessionalNext}
              onBack={() => navigate('/candidate/registration/basic')}
              initialData={professionalData ?? undefined}
              basicData={basicData ?? undefined}
            />
          }
        />
        <Route
          path="/skills"
          element={
            <SkillsExperience
              formData={formData}
              updateFormData={updateFormData}
              onNext={() => navigate('/candidate/registration/additional')}
              onBack={() => navigate('/candidate/registration/professional')}
              basicData={basicData ?? undefined}
            />
          }
        />
        <Route
          path="/additional"
          element={
            <AdditionalDetails
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleFinalSubmit}
              onBack={() => navigate('/candidate/registration/skills')}
              basicData={basicData ?? undefined}
            />
          }
        />
        
        <Route path="/" element={<Navigate to="/candidate/registration/basic" replace />} />
        <Route path="*" element={<Navigate to="/candidate/registration/basic" replace />} />
      </Routes>
    </div>
  );
}

// Main App - All routes are public (no authentication required)
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes - Everyone can access */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        
        
        {/* Registration Flow - Public access */}
        <Route path="/candidate/registration/*" element={<RegistrationFlow />} />
        <Route path="/candidate/profile" element={<ProfileCreated />} />
        
        {/* Dashboard Routes - Now public without authentication */}
         <Route element={<DashboardLayout />}>
        <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />       
        <Route path="/exportdata" element={<ExportData />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/salary-insights" element={<SalaryInsights />} />
        </Route>
        
        {/* Redirects */}
        <Route path="/" element={<Navigate to="/candidate/registration/basic" replace />} />
        <Route path="/candidate" element={<Navigate to="/candidate/registration/basic" replace />} />
        <Route path="*" element={<Navigate to="/candidate/registration/basic" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
// src/App.tsx
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import BasicInformation from './Candidate/BasicInformation';
import ProfessionalInfo from './Candidate/ProfessionalInfo';
import SkillsExperience from './Candidate/SkillsExperience';
import AdditionalDetails from './Candidate/AdditionalDetails';
import UploadCV from './Candidate/UploadCV';
import SignIn from './Candidate/SignIn';
import Home from './Candidate/Home';
import ExportData from './Admin/ExportData';
import CandidateDashboard from './Admin/CandidateDashboard';
import AdminDashboard from './Admin/AdminDashboard';
import DashboardLayout from './components/DashboardLayout';
import SettingsPage from './Admin/Settings';
import Dashboard from './Candidate/CandidateDashboard';
import CandidateDashboardLayout from './components/CandidateDashboardLayout';
import Reports from './Admin/Reports';
import ProfileCreated from './Candidate/ProfileCreated';
import SalaryInsights from './Admin/SalaryInsights';
import Fields from './Admin/Fields';
import Skills from './Admin/Skills';
import Users from './Admin/Users';
import Navbar from './components/Navbar';
import { supabase } from './supabaseClient';
import { saveCandidate } from './Candidate/candidateService';
import MyCVPage from './Candidate/MyCVPage';

// නිවැරදි:
import type { BasicInfoData, ProfessionalInfoData, CandidateFormData } from './types/candidate';

import './App.css';

const initialFormData: CandidateFormData = {
  fullName: '',
  email: '',
  mobileNumber: '',
  dob: '',           // ← dateOfBirth → dob
  linkedin: '',      // ← linkedInProfile → linkedin
  age: '--',         // ← add this

  interestedField: '',
  yearsOfExperience: '',
  skills: [],
  status: '',
  availability: '',
  willingToContact: '',
  salaryRange: '',
  cv: null,
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
    navigate('/candidate/registration/professional');
  };

  const handleProfessionalNext = (data: ProfessionalInfoData) => {
    setProfessionalData(data);
    navigate('/candidate/registration/skills');
  };

  const handleSkillsNext = () => {
    navigate('/candidate/registration/additional');
  };

  const handleAdditionalNext = () => {
    navigate('/candidate/registration/upload');
  };

const handleFinalSubmit = async () => {
  // formData.cv check
  if (!formData.cv) {
    alert('CV required');
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    navigate('/signin');
    return;
  }

  try {
    await saveCandidate(
      {
        basicData: basicData!,
        professionalData: professionalData!,
        formData,
        cvFile: formData.cv,
      },
      user.id
    );
    navigate('/candidate/profile'); // Success page
  } catch (err: any) {
    alert(`Error: ${err.message}`);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mb-8">
        <Navbar />
      </div>
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
            />
          }
        />
        <Route
          path="/skills"
          element={
            <SkillsExperience
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleSkillsNext}
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
              onNext={handleAdditionalNext}
              onBack={() => navigate('/candidate/registration/skills')}
              basicData={basicData ?? undefined}
            />
          }
        />
        <Route
          path="/upload"
          element={
            <UploadCV
              formData={formData}
              updateFormData={updateFormData}
              onNext={handleFinalSubmit}
              onBack={() => navigate('/candidate/registration/additional')}
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
      {/* Toast notifications container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Public Routes - Everyone can access */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<Home />} />
        
        {/* Registration Flow - Public access */}
        <Route path="/candidate/registration/*" element={<RegistrationFlow />} />
        
        {/* Dashboard Routes - Now public without authentication */}
        <Route element={<DashboardLayout />}>
          <Route path="/admin/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/settings" element={<SettingsPage />} />       
          <Route path="/exportdata" element={<ExportData />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/fields" element={<Fields />} />
          <Route path="/admin/skills" element={<Skills />} />
          <Route path="/admin/users" element={<Users />} />

        
          <Route path="/admin/salary-insights" element={<SalaryInsights />} />
        </Route>
        
        <Route element={<CandidateDashboardLayout />}>
          <Route path="/candidate/candidate-dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/candidate/profile" element={<ProfileCreated />} />
          <Route path="/candidate/cv" element={<MyCVPage />} />
          {/* ... other candidate routes */}
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/candidate" element={<Navigate to="/candidate/registration/basic" replace />} />
        <Route path="*" element={<Navigate to="/candidate/registration/basic" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
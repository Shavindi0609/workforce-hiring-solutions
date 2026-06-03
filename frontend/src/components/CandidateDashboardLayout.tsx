// src/components/CandidateDashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import CandidateSidebar from './CandidateSidebar';

export default function CandidateDashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <CandidateSidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
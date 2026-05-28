import React from 'react';
import { Outlet } from 'react-router-dom'; // react-router-dom අවශ්‍යයි
import { LayoutDashboard, Users, FileText, BarChart2, DollarSign, Settings, Download, LogOut } from 'lucide-react';

const NavItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg cursor-pointer text-gray-500 hover:bg-gray-100 hover:text-blue-900 transition">
    {icon} <span>{label}</span>
  </div>
);

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold text-blue-900 mb-10 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded"></div> WORKFORCE
          </h1>
          <nav className="space-y-2">
            <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" />
            <NavItem icon={<Users size={20}/>} label="Candidates" />
            <NavItem icon={<FileText size={20}/>} label="Fields" />
            <NavItem icon={<BarChart2 size={20}/>} label="Skills" />
            <NavItem icon={<DollarSign size={20}/>} label="Salary Insights" />
            <NavItem icon={<Settings size={20}/>} label="Settings" />
            <NavItem icon={<Download size={20}/>} label="Export Data" />
          </nav>
        </div>
        <NavItem icon={<LogOut size={20}/>} label="Logout" />
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> 
      </main>
    </div>
  );
}
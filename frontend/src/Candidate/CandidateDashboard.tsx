import React, { useState } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react'; 

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  field: string;
  experience: string;
  status: 'Actively Looking' | 'Open to Opportunities';
  availability: string;
  salary: string;
  joined: string;
}

const candidatesData: Candidate[] = [
  { id: 1, name: 'John Doe', email: 'john.doe@email.com', phone: '+91 98765 43210', avatar: 'https://i.pravatar.cc/150?u=1', field: 'Web Development', experience: '5+ Years', status: 'Actively Looking', availability: 'Immediate', salary: '80,000 - 120,000', joined: 'Jun 20, 2024' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+91 87654 32109', avatar: 'https://i.pravatar.cc/150?u=2', field: 'UI/UX Design', experience: '3+ Years', status: 'Open to Opportunities', availability: '2 Weeks', salary: '60,000 - 90,000', joined: 'Jun 19, 2024' },
  { id: 3, name: 'Michael Smith', email: 'michael.s@email.com', phone: '+91 76543 21098', avatar: 'https://i.pravatar.cc/150?u=3', field: 'Data Science', experience: '4+ Years', status: 'Actively Looking', availability: '1 Month', salary: '100,000 - 150,000', joined: 'Jun 18, 2024' },
  { id: 4, name: 'Emily Davis', email: 'emily.d@email.com', phone: '+91 65432 10987', avatar: 'https://i.pravatar.cc/150?u=4', field: 'Digital Marketing', experience: '2+ Years', status: 'Open to Opportunities', availability: '2 Months', salary: '50,000 - 80,000', joined: 'Jun 17, 2024' },
  { id: 5, name: 'David Wilson', email: 'david.w@email.com', phone: '+91 54321 09876', avatar: 'https://i.pravatar.cc/150?u=5', field: 'Mobile Development', experience: '6+ Years', status: 'Actively Looking', availability: 'Immediate', salary: '90,000 - 130,000', joined: 'Jun 16, 2024' },
  { id: 6, name: 'Olivia Brown', email: 'olivia.b@email.com', phone: '+91 43210 98765', avatar: 'https://i.pravatar.cc/150?u=6', field: 'HR & Recruitment', experience: '3+ Years', status: 'Open to Opportunities', availability: '3 Months', salary: '40,000 - 70,000', joined: 'Jun 15, 2024' },
  { id: 7, name: 'James Taylor', email: 'james.t@email.com', phone: '+91 32109 87654', avatar: 'https://i.pravatar.cc/150?u=7', field: 'DevOps', experience: '5+ Years', status: 'Actively Looking', availability: '2 Weeks', salary: '110,000 - 160,000', joined: 'Jun 14, 2024' },
  { id: 8, name: 'Sophia Martinez', email: 'sophia.m@email.com', phone: '+91 21098 76543', avatar: 'https://i.pravatar.cc/150?u=8', field: 'AI / ML', experience: '4+ Years', status: 'Actively Looking', availability: '1 Month', salary: '120,000 - 180,000', joined: 'Jun 13, 2024' },
  { id: 9, name: 'Liam Wilson', email: 'liam.w@email.com', phone: '+91 10987 65432', avatar: 'https://i.pravatar.cc/150?u=9', field: 'Web Development', experience: '2+ Years', status: 'Actively Looking', availability: 'Immediate', salary: '70,000 - 100,000', joined: 'Jun 12, 2024' },
  { id: 10, name: 'Emma Garcia', email: 'emma.g@email.com', phone: '+91 09876 54321', avatar: 'https://i.pravatar.cc/150?u=10', field: 'Data Science', experience: '3+ Years', status: 'Open to Opportunities', availability: '2 Weeks', salary: '95,000 - 140,000', joined: 'Jun 11, 2024' },
];

export default function CandidatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Candidates</h1>
          <p className="text-sm text-gray-500">Dashboard / Candidates</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border rounded-lg text-sm font-medium">Export</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">+ Add Candidate</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Candidates" value="2,458" sub="100% of total" />
        <StatCard title="Actively Looking" value="1,245" sub="50.7% of total" color="text-green-600" />
        <StatCard title="Open to Opportunities" value="1,213" sub="49.3% of total" color="text-orange-500" />
        <StatCard title="Available Immediately" value="798" sub="32.5% of total" color="text-blue-600" />
      </div>

      {/* Search and Filters Section  */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6 flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" placeholder="Search by name, email, skill..." className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none" />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm text-gray-600"><Filter size={16}/> Filter</button>
        <button className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm text-gray-600">All Fields <ChevronDown size={16}/></button>
        <button className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold">Apply Filters</button>
      </div>

      {/* Candidates Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-400 text-xs uppercase border-b">
              <th className="p-4"><input type="checkbox" /></th>
              <th className="p-4">Candidate</th>
              <th className="p-4">Field</th>
              <th className="p-4">Experience</th>
              <th className="p-4">Status</th>
              <th className="p-4">Availability</th>
              <th className="p-4">Salary Range</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {candidatesData.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4"><input type="checkbox" /></td>
                <td className="p-4 flex items-center gap-3">
                  <img src={c.avatar} className="w-8 h-8 rounded-full" alt="" />
                  <div>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </div>
                </td>
                <td className="p-4">{c.field}</td>
                <td className="p-4">{c.experience}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] ${c.status === 'Actively Looking' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</span></td>
                <td className="p-4">{c.availability}</td>
                <td className="p-4">{c.salary}</td>
                <td className="p-4 text-blue-600 cursor-pointer">View</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, sub, color = "text-gray-900" }: any) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm">
    <p className="text-gray-400 text-xs uppercase">{title}</p>
    <h3 className={`text-3xl font-bold ${color} mt-2`}>{value}</h3>
    <p className="text-xs text-gray-400 mt-1">{sub}</p>
  </div>
);
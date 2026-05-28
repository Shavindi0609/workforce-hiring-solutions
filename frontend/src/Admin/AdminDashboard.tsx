import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye } from 'lucide-react';

const fieldData = [{ name: 'Web Dev', v: 642 }, { name: 'UI/UX', v: 412 }, { name: 'Marketing', v: 298 }, { name: 'Data', v: 256 }, { name: 'Mobile', v: 213 }, { name: 'DevOps', v: 145 }, { name: 'Others', v: 192 }];
const availabilityData = [{ name: 'Immediate', v: 798 }, { name: '2 Weeks', v: 456 }, { name: '1 Month', v: 612 }, { name: '2 Months', v: 378 }, { name: '3 Months', v: 214 }];
const statusData = [{ name: 'Actively Looking', v: 1245 }, { name: 'Open', v: 1213 }];
const salaryData = [{ range: '0-40K', v: 96 }, { range: '40K-60K', v: 248 }, { range: '60K-80K', v: 412 }, { range: '80K-100K', v: 568 }, { range: '100K-150K', v: 674 }, { range: '150K-200K', v: 312 }, { range: '200K+', v: 148 }];
const skillsData = [{ name: 'JavaScript', v: 1356 }, { name: 'React', v: 1124 }, { name: 'HTML/CSS', v: 1024 }, { name: 'Node.js', v: 876 }, { name: 'Python', v: 812 }, { name: 'SQL', v: 698 }];

const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <div><h2 className="text-2xl font-bold">Dashboard</h2><p className="text-gray-500 text-sm">Overview of your candidate pool</p></div>
        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">Apply Filters</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Candidates" value="2,458" />
        <StatCard title="Actively Looking" value="1,245" color="text-green-600" />
        <StatCard title="Open to Opportunities" value="1,213" color="text-orange-500" />
      </div>

      {/* Row 1: Bar & Pie Charts */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <ChartCard title="Candidates by Field">
          <ResponsiveContainer width="100%" height={200}><BarChart data={fieldData}><XAxis dataKey="name" fontSize={10} /><Tooltip /><Bar dataKey="v" fill="#2563eb" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Candidates by Availability">
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={availabilityData} innerRadius={50} outerRadius={70} dataKey="v">{availabilityData.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Candidates by Status">
          <ResponsiveContainer width="100%" height={200}><PieChart><Pie data={statusData} innerRadius={50} outerRadius={70} dataKey="v"><Cell fill="#22c55e"/><Cell fill="#eab308"/></Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Salary & Skills */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <ChartCard title="Salary Distribution"><ResponsiveContainer width="100%" height={200}><BarChart data={salaryData}><XAxis dataKey="range" fontSize={10} /><Tooltip /><Bar dataKey="v" fill="#84cc16" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Most Common Skills">
          <ResponsiveContainer width="100%" height={200}><BarChart layout="vertical" data={skillsData} margin={{ left: 30 }}><XAxis type="number" hide /><YAxis dataKey="name" type="category" fontSize={10} /><Tooltip /><Bar dataKey="v" fill="#2563eb" barSize={15} radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Candidates */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h3 className="font-bold mb-4">Recent Candidates</h3>
        <table className="w-full text-left text-sm">
          <thead className="text-gray-400 uppercase"><tr><th className="pb-4">Name</th><th className="pb-4">Field</th><th className="pb-4">Status</th><th className="pb-4">Actions</th></tr></thead>
          <tbody className="border-t"><tr className="border-b"><td className="py-4 font-medium">John Doe</td><td className="py-4">Web Development</td><td className="py-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span></td><td className="py-4 text-blue-600 cursor-pointer flex items-center gap-1"><Eye size={16}/> View</td></tr></tbody>
          <tbody className="border-t"><tr className="border-b"><td className="py-4 font-medium">John Doe</td><td className="py-4">Web Development</td><td className="py-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span></td><td className="py-4 text-blue-600 cursor-pointer flex items-center gap-1"><Eye size={16}/> View</td></tr></tbody>
          <tbody className="border-t"><tr className="border-b"><td className="py-4 font-medium">John Doe</td><td className="py-4">Web Development</td><td className="py-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span></td><td className="py-4 text-blue-600 cursor-pointer flex items-center gap-1"><Eye size={16}/> View</td></tr></tbody>
        </table>
      </div>
    </div>
  );
}

const ChartCard = ({ title, children }: any) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-bold mb-4 text-xs uppercase text-gray-500">{title}</h3>{children}</div>
);

const StatCard = ({ title, value, color = "text-blue-900" }: any) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm"><p className="text-gray-400 text-xs uppercase">{title}</p><h3 className={`text-3xl font-bold ${color} mt-2`}>{value}</h3></div>
);
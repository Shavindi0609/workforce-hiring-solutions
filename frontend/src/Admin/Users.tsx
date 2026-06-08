// src/pages/Users.tsx
import { useState } from 'react';
import { Search, Edit2, Trash2, MoreVertical, Plus, Users as UsersIcon, UserCheck, UserX, Clock, Shield, Lock, Mail } from 'lucide-react';
import { useUsers } from '../hooks/useUsers';
import { UserModal } from '../components/UserModal';
import type { User, CreateUserDto } from '../types/user';

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  // Add userRoles here
  const { users, userRoles, loading, createUser, updateUser, deleteUser, resetPassword } = useUsers();

  const activeUsers = users.filter(u => u.status === 'Active').length;
  const inactiveUsers = users.filter(u => u.status === 'Inactive').length;
  const uniqueRoles = ['All', ...new Set(users.map(user => user.role))];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    setSelectedUser(null);
    setModalTitle('Add New User');
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setModalTitle('Edit User');
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteUser(id);
    }
  };

  const handleResetPassword = async (email: string) => {
    if (window.confirm('Send password reset email to this user?')) {
      await resetPassword(email);
    }
  };

  const handleSubmit = async (data: CreateUserDto | Partial<User>) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    } else {
      await createUser(data as CreateUserDto);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-gray-500">Manage system users and their permission</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-8 mb-8">
        <StatCard
          title="Total Users" 
          value={users.length.toString()} 
          sub="100% of total" 
          icon={<UsersIcon size={28} className="text-blue-500" />}
          bgColor="bg-blue-50"
        />
        <StatCard 
          title="Active Users" 
          value={activeUsers.toString()} 
          sub={`${users.length ? Math.round(activeUsers/users.length*100) : 0}% of total`} 
          icon={<UserCheck size={28} className="text-green-500" />}
          bgColor="bg-green-50"
        />
        <StatCard 
          title="Inactive Users" 
          value={inactiveUsers.toString()} 
          sub={`${users.length ? Math.round(inactiveUsers/users.length*100) : 0}% of total`} 
          icon={<UserX size={28} className="text-orange-500" />}
          bgColor="bg-orange-50"
        />
        <StatCard 
          title="Total Roles" 
          value={(uniqueRoles.length - 1).toString()} 
          sub="Different user roles" 
          icon={<Shield size={28} className="text-purple-500" />}
          bgColor="bg-purple-50"
        />
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or role..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4 mt-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
          >
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1 border border-gray-200 rounded-lg text-sm"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="text-gray-600 text-xs uppercase border-b bg-gray-50">
              <th className="p-4 w-12 text-center">#</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4">Last Login</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredUsers.map((user, index) => (
              <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 text-center text-gray-700 font-medium">{index + 1}</td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.email}`} className="w-8 h-8 rounded-full object-cover" alt="" />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail size={14} className="text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-medium ${
                    user.role === 'Super Admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'HR Manager' ? 'bg-blue-100 text-blue-700' :
                    user.role === 'Recruiter' ? 'bg-green-100 text-green-700' :
                    user.role === 'Analyst' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role || 'Unknown'}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-medium ${
                    user.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    <span>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleResetPassword(user.email)}
                      className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                      title="Reset Password"
                    >
                      <Lock size={16} />
                    </button>
                    <button className="p-1 text-gray-400 hover:bg-gray-100 rounded transition-colors" title="More">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="px-6 py-4 border-t flex items-center justify-between text-sm text-gray-500 bg-gray-50 flex-wrap gap-4">
          <p>Showing {filteredUsers.length} of {users.length} users</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-md">1</button>
            <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors">2</button>
            <button className="px-3 py-1 border rounded-md hover:bg-white transition-colors">Next</button>
          </div>
        </div>
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        user={selectedUser}
        title={modalTitle}
        userRoles={userRoles}
      />
    </div>
  );
}

const StatCard = ({ title, value, sub, color = "text-gray-900", icon, bgColor = "bg-gray-50" }: { 
  title: string; 
  value: string; 
  sub: string; 
  color?: string; 
  icon?: React.ReactNode; 
  bgColor?: string;
}) => (
  <div className="bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md">
    <div className="flex items-start gap-4">
      {icon && (
        <div className={`p-3 rounded-xl ${bgColor}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className="text-gray-400 text-xs uppercase tracking-wider">{title}</p>
        <h3 className={`text-3xl font-bold ${color} mt-2`}>{value}</h3>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </div>
    </div>
  </div>
);
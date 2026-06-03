import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, Download, LogOut, Menu, ChevronDown, Bell, User, X,
  UserPlus, Star, CircleDollarSign, BarChartBig, Briefcase, 
} from 'lucide-react';
import logo from '../assets/logo.png';
import securityImage from '../assets/8.avif'; // Your security image

// Main DashboardLayout Component
export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/signin');
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const navItems = [
    { icon: <LayoutDashboard size={20}/>, label: "Dashboard", to: "/admin/dashboard" },
    { icon: <UserPlus size={20}/>, label: "Candidates", to: "/admin/candidate-dashboard" },
    { icon: <Briefcase size={20}/>, label: "Fields", to: "/admin/fields" },
    { icon: <Star size={20}/>, label: "Skills", to: "/admin/skills" },
    { icon: <BarChartBig size={20}/>, label: "Reports", to: "/admin/reports" },
    { icon: <CircleDollarSign size={20}/>, label: "Salary Insights", to: "/admin/salary-insights" },
    { icon: <Settings size={20}/>, label: "Settings", to: "/settings" },
    { icon: <Users size={20}/>, label: "Users", to: "/admin/users" },
    { icon: <Download size={20}/>, label: "Export Data", to: "/exportdata" },
  ];

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200 lg:left-64 transition-all duration-300">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200 lg:hidden"
              aria-label="Toggle sidebar"
            >
              <Menu size={22} />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Notification Button */}
            <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-all duration-200">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">John Doe</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 hidden md:block ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">John Doe</p>
                          <p className="text-sm text-gray-500">john.doe@workforce.com</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <User size={18} />
                        <span>Your Profile</span>
                      </button>
                      <button 
                        onClick={() => {
                          navigate('/settings');
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={18} />
                        <span>Account Settings</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar - FULL COVER LEFT SIDE TOP TO BOTTOM */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 z-30 bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className={`px-4 pt-6 pb-6 ${!sidebarOpen && 'flex justify-center'}`}>
            <div className={`flex items-center gap-2 ${!sidebarOpen && 'flex-col'}`}>
              <div className="p-[3px] rounded-full bg-gradient-to-r from-blue-500 to-green-500 inline-block">
                <img 
                  src={logo} 
                  alt="WHS logo" 
                  className="h-12 w-auto object-contain rounded-full bg-white"
                />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-gray-800">WORKFORCE</h1>
                  <p className="text-xs text-gray-800 font-bold">HIRING SOLUTIONS</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item, index) => (
              <Link key={index} to={item.to}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActiveRoute(item.to) 
                    ? 'bg-blue-50 text-blue-600 font-semibold' 
                    : 'text-gray-600 font-semibold hover:bg-gray-50 hover:text-blue-500'
                } ${!sidebarOpen && 'justify-center'}`}>
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </div>
              </Link>
            ))}
          </nav>

          {/* Secure & Confidential Section with Image - Below Navigation */}
          {sidebarOpen && (
            <div className="px-5 py-3 mt-2">
              <div className="bg-white rounded-xl p-2 border border-blue-100 shadow-sm">
                {/* Security Image */}
                <div className="flex justify-center mb-2">
                  <img 
                    src={securityImage} 
                    alt="Secure & Confidential" 
                    className="w-20 h-20 object-contain rounded-lg"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-gray-800 flex items-center justify-center gap-2">
                    Secure & Confidential
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    All candidate data is encrypted
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">and stored securely </p>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed Sidebar Security Icon */}
          {!sidebarOpen && (
            <div className="flex justify-center py-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src={securityImage} 
                  alt="Secure" 
                  className="w-8 h-8 object-cover"
                />
              </div>
            </div>
          )}
          
          {/* Copyright Section - At bottom */}
          <div className={`p-6 border-t border-gray-100  ${!sidebarOpen ? 'flex justify-center' : ''}`}>
            <div className={`${!sidebarOpen ? 'text-center' : 'text-left'}`}>
              <p className="text-xs text-gray-500">
                © {new Date().getFullYear()} Workforce Hiring Solutions
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-xl lg:hidden overflow-y-auto">
            <div className="absolute top-4 right-4">
              <button onClick={() => setMobileSidebarOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col h-full pt-12">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-[3px] rounded-full bg-gradient-to-r from-blue-500 to-green-500 inline-block">
                    <img 
                      src={logo} 
                      alt="WHS logo" 
                      className="h-12 w-auto object-contain rounded-full bg-white"
                    />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-800">WORKFORCE</h1>
                    <p className="text-xs text-gray-800 font-bold">HIRING SOLUTIONS</p>
                  </div>
                </div>
              </div>
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item, index) => (
                  <Link key={index} to={item.to} onClick={() => setMobileSidebarOpen(false)}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                      isActiveRoute(item.to) 
                        ? 'bg-blue-50 text-blue-700 font-semibold' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}>
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </nav>
              
              {/* Mobile Security Section with Image */}
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={securityImage} 
                      alt="Secure" 
                      className="w-8 h-8 object-contain rounded"
                    />
                    <span className="text-xs font-semibold text-gray-700">Secure & Confidential</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Your data is encrypted and securely stored</p>
                </div>
              </div>
              
              <div className="p-3 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-400">© {new Date().getFullYear()} Workforce Hiring Solutions</p>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main 
        className={`transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        } pl-0`}
      >
        <div className="pt-[57px]">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
import React, { useState } from 'react';
import { 
  IoSettingsOutline,
  IoMailOutline,
  IoNotificationsOutline,
  IoShieldOutline,
  IoLockClosedOutline,
  IoMenuOutline,
  IoPersonCircleOutline,
  IoLogOutOutline,
  IoChevronDownOutline
} from 'react-icons/io5';
import { MdOutlineBackup } from 'react-icons/md';
import { FiSave } from 'react-icons/fi';
import { BiCheck } from 'react-icons/bi';

type TabType = 'general' | 'email' | 'notification' | 'security' | 'privacy' | 'backup';

interface SettingsData {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  timeZone: string;
  dateFormat: string;
  currency: string;
  itemsPerPage: number;
}

// Separate Menu Item Component
interface MenuItemProps {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({  label, icon, isActive, onClick }) => {
  return (
    <button
      className={`sidebar-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-label">{label}</span>
    </button>
  );
};

// Two Column Form Row Component - Labels on left, Inputs on right
interface FormRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormRow: React.FC<FormRowProps> = ({ label, required = false, children }) => {
  return (
    <div className="form-row">
      <div className="form-label-col">
        <label className="form-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      </div>
      <div className="form-input-col">
        {children}
      </div>
    </div>
  );
};

// Form Input Component
interface FormInputProps {
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  type?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  type = 'text', 
  value, 
  onChange, 
  placeholder 
}) => {
  return (
    <input
      type={type}
      className="form-control"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
};

// Select Input Component with Chevron Icon
interface SelectOption {
  value: string | number;
  label: string;
}

interface FormSelectProps {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
}

const FormSelect: React.FC<FormSelectProps> = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="select-wrapper">
      <select
        className="form-control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <IoChevronDownOutline 
        size={16} 
        className={`select-chevron ${isOpen ? 'open' : ''}`} 
      />
    </div>
  );
};

// Navbar Component
interface NavbarProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notificationCount] = useState(3);

  const handleLogout = () => {
    console.log('Logging out...');
  };

  return (
    <nav className="settings-navbar">
      <div className="navbar-left">
        <button 
          className="navbar-menu-btn" 
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
        >
          <IoMenuOutline size={24} />
        </button>
        <div className="navbar-logo">
          <span className="logo-text">Workforce</span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="navbar-notification-btn" aria-label="Notifications">
          <IoNotificationsOutline size={22} />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </button>

        <div className="navbar-profile">
          <button 
            className="profile-trigger"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-label="Profile menu"
          >
            <div className="profile-image">
              <IoPersonCircleOutline size={32} />
            </div>
            <span className="profile-name">John Doe</span>
            <IoChevronDownOutline size={16} className={`dropdown-arrow ${isProfileOpen ? 'open' : ''}`} />
          </button>

          {isProfileOpen && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-profile-image">
                  <IoPersonCircleOutline size={40} />
                </div>
                <div className="dropdown-user-info">
                  <span className="user-name">John Doe</span>
                  <span className="user-email">john.doe@workforce.com</span>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item" onClick={() => console.log('Profile clicked')}>
                <IoPersonCircleOutline size={18} />
                <span>Your Profile</span>
              </button>
              <button className="dropdown-item" onClick={() => console.log('Settings clicked')}>
                <IoSettingsOutline size={18} />
                <span>Account Settings</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <IoLogOutOutline size={18} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<SettingsData>({
    companyName: 'Workforce Hiring Solutions',
    companyEmail: 'info@workforcehs.com',
    companyPhone: '+1 987 654 3210',
    timeZone: '(GMT +05:30) Asia/Kolkata',
    dateFormat: 'DD MMM, YYYY',
    currency: 'USD - US Dollar',
    itemsPerPage: 10
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleInputChange = (field: keyof SettingsData, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setSaveMessage('Settings saved successfully!');
    setIsSaving(false);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const menuItems = [
    { id: 'general' as TabType, label: 'General Settings', icon: <IoSettingsOutline size={20} /> },
    { id: 'email' as TabType, label: 'Email Settings', icon: <IoMailOutline size={20} /> },
    { id: 'notification' as TabType, label: 'Notification Settings', icon: <IoNotificationsOutline size={20} /> },
    { id: 'security' as TabType, label: 'Security Settings', icon: <IoShieldOutline size={20} /> },
    { id: 'privacy' as TabType, label: 'Privacy Settings', icon: <IoLockClosedOutline size={20} /> },
    { id: 'backup' as TabType, label: 'Backup Settings', icon: <MdOutlineBackup size={20} /> }
  ];

  const timeZoneOptions = [
    { value: '(GMT -12:00) International Date Line West', label: '(GMT -12:00) International Date Line West' },
    { value: '(GMT -08:00) Pacific Time', label: '(GMT -08:00) Pacific Time' },
    { value: '(GMT -05:00) Eastern Time', label: '(GMT -05:00) Eastern Time' },
    { value: '(GMT +00:00) UTC', label: '(GMT +00:00) UTC' },
    { value: '(GMT +01:00) Central European Time', label: '(GMT +01:00) Central European Time' },
    { value: '(GMT +05:30) Asia/Kolkata', label: '(GMT +05:30) Asia/Kolkata' },
    { value: '(GMT +08:00) Singapore Time', label: '(GMT +08:00) Singapore Time' },
    { value: '(GMT +09:00) Japan Standard Time', label: '(GMT +09:00) Japan Standard Time' }
  ];

  const dateFormatOptions = [
    { value: 'DD MMM, YYYY', label: 'DD MMM, YYYY' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
  ];

  const currencyOptions = [
    { value: 'USD - US Dollar', label: 'USD - US Dollar' },
    { value: 'EUR - Euro', label: 'EUR - Euro' },
    { value: 'GBP - British Pound', label: 'GBP - British Pound' },
    { value: 'INR - Indian Rupee', label: 'INR - Indian Rupee' },
    { value: 'SGD - Singapore Dollar', label: 'SGD - Singapore Dollar' }
  ];

  const itemsPerPageOptions = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
  ];

  return (
    <div className="settings-page">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />

      <div className="settings-layout">
        <aside className={`settings-sidebar ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
          <div className="sidebar-header">
            <h1>Settings</h1>
            <p>Application settings and preferences</p>
          </div>
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </nav>
        </aside>

        <main className="settings-main">
          <div className="settings-content-wrapper">
            {activeTab === 'general' && (
              <div className="settings-form">
                <div className="form-section">
                  <h2>General Settings</h2>
                  
                  <div className="form-container">
                    <FormRow label="Company Name">
                      <FormInput
                        value={settings.companyName}
                        onChange={(value) => handleInputChange('companyName', value)}
                        placeholder="Enter company name"
                      />
                    </FormRow>

                    <FormRow label="Company Email">
                      <FormInput
                        type="email"
                        value={settings.companyEmail}
                        onChange={(value) => handleInputChange('companyEmail', value)}
                        placeholder="company@example.com"
                      />
                    </FormRow>

                    <FormRow label="Company Phone">
                      <FormInput
                        type="tel"
                        value={settings.companyPhone}
                        onChange={(value) => handleInputChange('companyPhone', value)}
                        placeholder="+1 234 567 8900"
                      />
                    </FormRow>

                    <FormRow label="Time Zone">
                      <FormSelect
                        value={settings.timeZone}
                        options={timeZoneOptions}
                        onChange={(value) => handleInputChange('timeZone', value as string)}
                      />
                    </FormRow>

                    <FormRow label="Date Format">
                      <FormSelect
                        value={settings.dateFormat}
                        options={dateFormatOptions}
                        onChange={(value) => handleInputChange('dateFormat', value as string)}
                      />
                    </FormRow>

                    <FormRow label="Currency">
                      <FormSelect
                        value={settings.currency}
                        options={currencyOptions}
                        onChange={(value) => handleInputChange('currency', value as string)}
                      />
                    </FormRow>

                    <FormRow label="Items Per Page">
                      <FormSelect
                        value={settings.itemsPerPage}
                        options={itemsPerPageOptions}
                        onChange={(value) => handleInputChange('itemsPerPage', value as number)}
                      />
                    </FormRow>
                  </div>
                </div>

                <div className="form-actions">
                  {saveMessage && (
                    <div className="save-message success">
                      <BiCheck size={16} />
                      {saveMessage}
                    </div>
                  )}
                  <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                    <FiSave size={16} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'general' && (
              <div className="placeholder-content">
                <div className="placeholder-icon">
                  {menuItems.find(item => item.id === activeTab)?.icon}
                </div>
                <h2>{menuItems.find(item => item.id === activeTab)?.label}</h2>
                <p>Configure your {activeTab} preferences here.</p>
                <div className="coming-soon">Coming Soon</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
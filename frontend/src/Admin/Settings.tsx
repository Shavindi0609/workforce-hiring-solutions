// src/Candidate/Settings.tsx
import React, { useState } from 'react';
import { 
  IoSettingsOutline,
  IoMailOutline,
  IoNotificationsOutline,
  IoShieldOutline,
  IoLockClosedOutline,
  IoChevronDownOutline
} from 'react-icons/io5';
import { MdOutlineBackup } from 'react-icons/md';
import { FiSave } from 'react-icons/fi';
import { BiCheck } from 'react-icons/bi';
import { useSettings } from '../hooks/useSettings';

type TabType = 'general' | 'email' | 'notification' | 'security' | 'privacy' | 'backup';

interface MenuItemProps {
  id: TabType;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left
        text-sm font-medium transition-all duration-200
        ${isActive 
          ? 'bg-gradient-to-r from-blue-50 to-transparent text-blue-600 font-semibold border-l-4 border-blue-600' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
        }
      `}
      onClick={onClick}
    >
      <span className="w-5 h-5 flex items-center justify-center flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
};

interface FormRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const FormRow: React.FC<FormRowProps> = ({ label, required = false, children }) => {
  return (
    <div className="flex flex-col md:flex-row items-start gap-4 mb-6 w-full">
      <div className="md:w-48 lg:w-56 pt-2">
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      <div className="flex-1 w-full">
        {children}
      </div>
    </div>
  );
};

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
      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 
                 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                 transition-all duration-200 placeholder:text-gray-400 bg-white"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
};

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
    <div className="relative w-full">
      <select
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-800 
                   focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
                   appearance-none cursor-pointer bg-white pr-10"
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
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
      />
    </div>
  );
};

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const { settings, loading, saving, updateSettings} = useSettings();
  const [saveMessage, setSaveMessage] = useState('');
  const [localSettings, setLocalSettings] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    timeZone: '',
    dateFormat: '',
    currency: '',
    itemsPerPage: 10
  });

  // Update local settings when settings from DB load
  React.useEffect(() => {
    if (settings) {
      setLocalSettings({
        companyName: settings.company_name,
        companyEmail: settings.company_email,
        companyPhone: settings.company_phone,
        timeZone: settings.time_zone,
        dateFormat: settings.date_format,
        currency: settings.currency,
        itemsPerPage: settings.items_per_page
      });
    }
  }, [settings]);

  const handleInputChange = (field: keyof typeof localSettings, value: string | number) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateSettings({
        company_name: localSettings.companyName,
        company_email: localSettings.companyEmail,
        company_phone: localSettings.companyPhone,
        time_zone: localSettings.timeZone,
        date_format: localSettings.dateFormat,
        currency: localSettings.currency,
        items_per_page: localSettings.itemsPerPage
      });
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const menuItems = [
    { id: 'general' as TabType, label: 'General Settings', icon: <IoSettingsOutline size={18} /> },
    { id: 'email' as TabType, label: 'Email Settings', icon: <IoMailOutline size={18} /> },
    { id: 'notification' as TabType, label: 'Notification Settings', icon: <IoNotificationsOutline size={18} /> },
    { id: 'security' as TabType, label: 'Security Settings', icon: <IoShieldOutline size={18} /> },
    { id: 'privacy' as TabType, label: 'Privacy Settings', icon: <IoLockClosedOutline size={18} /> },
    { id: 'backup' as TabType, label: 'Backup Settings', icon: <MdOutlineBackup size={18} /> }
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
    { value: 5, label: '5 items' },
    { value: 10, label: '10 items' },
    { value: 25, label: '25 items' },
    { value: 50, label: '50 items' },
    { value: 100, label: '100 items' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-xs text-gray-500 mt-0.5">Application settings and preferences</p>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-100 overflow-x-auto sticky top-[73px] z-10">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row lg:gap-4 p-4">
        
        {/* Sidebar */}
        <aside className="hidden lg:block lg:w-72 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:sticky lg:top-[calc(73px+1rem)] lg:h-[calc(100vh-100px)]">
          <div className="flex flex-col h-full">
            <nav className="flex-1 p-2 overflow-y-auto space-y-3">
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
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 sm:p-6">
            {activeTab === 'general' && (
              <div>
                <div className="mb-6 pb-3 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">General Settings</h2>
                </div>
                
                <div>
                  <FormRow label="Company Name" required>
                    <FormInput
                      value={localSettings.companyName}
                      onChange={(value) => handleInputChange('companyName', value)}
                      placeholder="Enter company name"
                    />
                  </FormRow>

                  <FormRow label="Company Email" required>
                    <FormInput
                      type="email"
                      value={localSettings.companyEmail}
                      onChange={(value) => handleInputChange('companyEmail', value)}
                      placeholder="company@example.com"
                    />
                  </FormRow>

                  <FormRow label="Company Phone" required>
                    <FormInput
                      type="tel"
                      value={localSettings.companyPhone}
                      onChange={(value) => handleInputChange('companyPhone', value)}
                      placeholder="+1 234 567 8900"
                    />
                  </FormRow>

                  <FormRow label="Time Zone">
                    <FormSelect
                      value={localSettings.timeZone}
                      options={timeZoneOptions}
                      onChange={(value) => handleInputChange('timeZone', value as string)}
                    />
                  </FormRow>

                  <FormRow label="Date Format">
                    <FormSelect
                      value={localSettings.dateFormat}
                      options={dateFormatOptions}
                      onChange={(value) => handleInputChange('dateFormat', value as string)}
                    />
                  </FormRow>

                  <FormRow label="Currency">
                    <FormSelect
                      value={localSettings.currency}
                      options={currencyOptions}
                      onChange={(value) => handleInputChange('currency', value as string)}
                    />
                  </FormRow>

                  <FormRow label="Items Per Page">
                    <FormSelect
                      value={localSettings.itemsPerPage}
                      options={itemsPerPageOptions}
                      onChange={(value) => handleInputChange('itemsPerPage', value as number)}
                    />
                  </FormRow>
                </div>

                <div className="flex flex-col-reverse sm:flex-row justify-end items-center gap-3 mt-8 pt-6 border-t border-gray-100">
                  {saveMessage && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg text-sm order-1 sm:order-none">
                      <BiCheck size={16} />
                      <span>{saveMessage}</span>
                    </div>
                  )}
                  <button 
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    <FiSave size={16} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'general' && (
              <div className="text-center py-12 px-4">
                <div className="text-5xl mb-4 text-blue-500 flex justify-center">
                  {menuItems.find(item => item.id === activeTab)?.icon}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500 mb-5">Configure your {activeTab} preferences here.</p>
                <div className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                  Coming Soon
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
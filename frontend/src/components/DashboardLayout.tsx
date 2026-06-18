import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Settings, Download, LogOut, Menu, ChevronDown, Bell, User, X,
  UserPlus, Star, CircleDollarSign, BarChartBig, Briefcase, FileText, Camera,
  Save, AlertCircle, Trash2, Users, CheckCircle
} from 'lucide-react';
import logo from '../assets/logo.png';
import securityImage from '../assets/8.avif';

interface Notification {
  id: string;
  type: 'new_candidate' | 'new_job_application' | 'job_update';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data: any;
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    role: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      const unread = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    setIsNotificationsOpen(false);

    // Navigate based on notification type
    if (notification.type === 'new_candidate') {
      navigate('/admin/candidate-dashboard');
    } else if (notification.type === 'new_job_application') {
      navigate('/admin/jobs');
    }
  };

  // Setup real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const newNotification = payload.new as Notification;
          
          // Add to state
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show browser notification
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/logo.png'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (user) {
          setUser(user);
          
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profileError && profileError.code === 'PGRST116') {
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{ 
                id: user.id, 
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                role: 'user'
              }])
              .select()
              .single();
            
            if (!insertError && newProfile) {
              setUserProfile(newProfile);
              setProfileForm({
                full_name: newProfile.full_name || '',
                email: user.email || '',
                phone: newProfile.phone || '',
                location: newProfile.location || '',
                bio: newProfile.bio || '',
                role: newProfile.role || ''
              });
            }
          } else if (profile) {
            setUserProfile(profile);
            setProfileForm({
              full_name: profile.full_name || '',
              email: user.email || '',
              phone: profile.phone || '',
              location: profile.location || '',
              bio: profile.bio || '',
              role: profile.role || ''
            });
          }

          // Fetch notifications
          await fetchNotifications();
          
          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        } else {
          navigate('/signin');
        }
      } catch (err) {
        console.error("Error getting user:", err);
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
        if (profile) {
          setProfileForm({
            full_name: profile.full_name || '',
            email: session.user.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            bio: profile.bio || '',
            role: profile.role || ''
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(!mobileSidebarOpen);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  // Image handling functions (same as your existing code)
  const extractFilePath = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const profilesIndex = pathParts.findIndex(part => part === 'profiles');
      if (profilesIndex !== -1) {
        return pathParts.slice(profilesIndex + 1).join('/');
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleRemoveImage = async () => {
    if (!user || !userProfile?.avatar_url) return;

    setUploading(true);
    setUploadError(null);
    
    try {
      const filePath = extractFilePath(userProfile.avatar_url);
      
      if (filePath) {
        const { error: deleteError } = await supabase.storage
          .from('profiles')
          .remove([filePath]);
        
        if (deleteError) {
          console.warn('Error deleting from storage:', deleteError);
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUserProfile({ ...userProfile, avatar_url: null });
      setSuccessMessage('Profile picture removed successfully!');
      setShowRemoveConfirm(false);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Error removing image:', error);
      setUploadError(error.message || 'Failed to remove image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);
    
    try {
      if (userProfile?.avatar_url) {
        const oldFilePath = extractFilePath(userProfile.avatar_url);
        if (oldFilePath) {
          await supabase.storage.from('profiles').remove([oldFilePath]);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setUserProfile({ ...userProfile, avatar_url: publicUrl });
      setSuccessMessage('Profile picture updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setUploadError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    setUploading(true);
    setUploadError(null);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone: profileForm.phone,
          location: profileForm.location,
          bio: profileForm.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setUserProfile({
        ...userProfile,
        full_name: profileForm.full_name,
        phone: profileForm.phone,
        location: profileForm.location,
        bio: profileForm.bio
      });

      setEditingProfile(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setUploadError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setUploading(false);
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
    { icon: <FileText size={20}/>, label: "Jobs", to: "/admin/jobs" },
    { icon: <Download size={20}/>, label: "Export Data", to: "/exportdata" },
  ];

  const isActiveRoute = (path: string) => location.pathname === path;

  const getDisplayName = () => {
    if (userProfile?.full_name) return userProfile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_candidate':
        return <Users size={18} className="text-green-500" />;
      case 'new_job_application':
        return <Briefcase size={18} className="text-blue-500" />;
      default:
        return <Bell size={18} className="text-gray-500" />;
    }
  };

  // Modal components (same as your existing code)
  const RemoveConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Trash2 size={24} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Remove Profile Picture</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to remove your profile picture? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowRemoveConfirm(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleRemoveImage}
            disabled={uploading}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? 'Removing...' : 'Remove'}
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const ProfileEditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Edit Profile</h2>
          <button
            onClick={() => {
              setEditingProfile(false);
              setUploadError(null);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img 
                    src={userProfile.avatar_url} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                  disabled={uploading}
                  title="Upload new picture"
                >
                  <Camera size={16} />
                </button>
                {userProfile?.avatar_url && (
                  <button
                    onClick={() => setShowRemoveConfirm(true)}
                    className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                    disabled={uploading}
                    title="Remove picture"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            {uploading && <p className="text-sm text-gray-500">Processing...</p>}
            {uploadError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                <AlertCircle size={16} />
                <p className="text-sm">{uploadError}</p>
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                <p className="text-sm">{successMessage}</p>
              </div>
            )}
            <p className="text-xs text-gray-500">Click camera to upload (Max 5MB), trash to remove</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={profileForm.email}
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={profileForm.location}
                onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>

            {userProfile?.role && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={profileForm.role}
                  disabled
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={() => {
              setEditingProfile(false);
              setUploadError(null);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProfileUpdate}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? 'Saving...' : 'Save Changes'}
            <Save size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm border-b border-gray-200 lg:left-64 transition-all duration-300">
        <div className="flex items-center justify-between px-4 md:px-6 py-3">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 lg:hidden">
              <Menu size={22} />
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                          <Bell size={40} className="text-gray-300 mb-2" />
                          <p className="text-gray-500 text-sm">No notifications yet</p>
                          <p className="text-gray-400 text-xs mt-1">New candidates and applications will appear here</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50/30' : ''
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 mt-1">
                                {getNotificationIcon(notification.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                    {notification.title}
                                  </p>
                                  <span className="text-xs text-gray-400 flex-shrink-0">
                                    {formatNotificationTime(notification.created_at)}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                              </div>
                              {!notification.read && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                  {userProfile?.avatar_url ? (
                    <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-white" />
                  )}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block">{getDisplayName()}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 hidden md:block ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                          {userProfile?.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <User size={28} className="text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{getDisplayName()}</p>
                          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                          {userProfile?.role && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                              {userProfile.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="py-2">
                      <button onClick={() => { setIsProfileOpen(false); setEditingProfile(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={18} />
                        <span>View & Edit Profile</span>
                      </button>
                      <button onClick={() => { setIsProfileOpen(false); navigate('/settings'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <Settings size={18} />
                        <span>Account Settings</span>
                      </button>
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
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

      {/* Sidebar - keep your existing sidebar code */}
      <aside className={`fixed left-0 top-0 bottom-0 z-30 bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'} hidden lg:block`}>
        <div className="flex flex-col h-full">
          <div className={`px-4 pt-6 pb-6 ${!sidebarOpen && 'flex justify-center'}`}>
            <div className={`flex items-center gap-2 ${!sidebarOpen && 'flex-col'}`}>
              <div className="p-[3px] rounded-full bg-gradient-to-r from-blue-500 to-green-500 inline-block">
                <img src={logo} alt="WHS logo" className="h-12 w-auto object-contain rounded-full bg-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="text-lg font-bold text-gray-800">WORKFORCE</h1>
                  <p className="text-xs text-gray-800 font-bold">HIRING SOLUTIONS</p>
                </div>
              )}
            </div>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item, index) => (
              <Link key={index} to={item.to}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                  isActiveRoute(item.to) ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 font-semibold hover:bg-gray-50 hover:text-blue-500'
                } ${!sidebarOpen && 'justify-center'}`}>
                  <span className="flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && <span className="text-sm">{item.label}</span>}
                </div>
              </Link>
            ))}
          </nav>

          {sidebarOpen && (
            <div className="px-5 py-3 mt-2">
              <div className="bg-white rounded-xl p-2 border border-blue-100 shadow-sm">
                <div className="flex justify-center mb-2">
                  <img src={securityImage} alt="Secure & Confidential" className="w-20 h-20 object-contain rounded-lg" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-bold text-gray-800">Secure & Confidential</h3>
                  <p className="text-xs text-gray-500 mt-2">All candidate data is encrypted and stored securely</p>
                </div>
              </div>
            </div>
          )}

          {!sidebarOpen && (
            <div className="flex justify-center py-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                <img src={securityImage} alt="Secure" className="w-8 h-8 object-cover" />
              </div>
            </div>
          )}
          
          <div className={`p-6 border-t border-gray-100 ${!sidebarOpen ? 'flex justify-center' : ''}`}>
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Workforce Hiring Solutions</p>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
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
                    <img src={logo} alt="WHS logo" className="h-12 w-auto object-contain rounded-full bg-white" />
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
                      isActiveRoute(item.to) ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                    }`}>
                      <span className="flex-shrink-0">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                    </div>
                  </Link>
                ))}
              </nav>
              
              <div className="px-4 py-3 border-t border-gray-100">
                <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={securityImage} alt="Secure" className="w-8 h-8 object-contain rounded" />
                    <span className="text-xs font-semibold text-gray-700">Secure & Confidential</span>
                  </div>
                  <p className="text-[10px] text-gray-500">Your data is encrypted and securely stored</p>
                </div>
              </div>
              
              <div className="p-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">© {new Date().getFullYear()} Workforce Hiring Solutions</p>
              </div>
            </div>
          </aside>
        </>
      )}

      {editingProfile && <ProfileEditModal />}
      {showRemoveConfirm && <RemoveConfirmModal />}

      <main className={`transition-all duration-300 min-h-screen ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'} pl-0`}>
        <div className="pt-[57px]">
          <div className="p-4 md:p-6">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
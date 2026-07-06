// Admin/AdminActivityDashboard.tsx - COMPLETE FIXED VERSION

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Users, Download, Eye, Calendar, Activity as ActivityIcon, TrendingUp, 
  FileText, UserCheck, Clock, Filter, Search, ChevronDown,
  BarChart, RefreshCw, Download as DownloadIcon, X, Trash2
} from 'lucide-react';

// Custom date formatting functions (no external dependency)
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const month = d.toLocaleString('default', { month: 'short' });
  const day = d.getDate();
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
};

const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
};

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface ActivityLog {
  id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  activity_type: string;
  activity_description: string;
  page_url: string;
  page_name: string;
  metadata: any;
  created_at: string;
}

interface DailySummary {
  activity_date: string;
  user_id: string;
  user_email: string;
  user_role: string;
  total_activities: number;
  cv_downloads: number;
  page_views: number;
  candidate_views: number;
  job_edits: number;
  job_creates: number;
  activities: ActivityLog[];
}

export default function AdminActivityDashboard() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedActivityType, setSelectedActivityType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: formatDateForInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    end: formatDateForInput(new Date())
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userCache, setUserCache] = useState<Map<string, any>>(new Map());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDateRange, setDeleteDateRange] = useState<{ start: string; end: string }>({
    start: formatDateForInput(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
    end: formatDateForInput(new Date())
  });
  const [deleteUserId, setDeleteUserId] = useState<string>('all');
  const [deleting, setDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Use refreshKey to force re-fetch
  useEffect(() => {
    fetchUsers();
    fetchActivityData();
  }, [dateRange, selectedUser, selectedActivityType, refreshKey]);

  // FIXED: Properly fetch all users including both admins
  const fetchUsers = async () => {
    try {
      const userMap = new Map();

      // 1. Get users from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role');

      if (profileError) {
        console.error('Error fetching profiles:', profileError);
      } else if (profileData) {
        profileData.forEach((user: any) => {
          userMap.set(user.id, {
            id: user.id,
            full_name: user.full_name || user.email?.split('@')[0]?.replace(/[._-]/g, ' ') || 'User',
            email: user.email || user.id,
            role: user.role || 'User'
          });
        });
      }

      // 2. Get users from activity logs
      const { data: activityUsers, error: activityError } = await supabase
        .from('activity_logs')
        .select('user_id, user_email, user_role')
        .order('created_at', { ascending: false });

      if (!activityError && activityUsers) {
        activityUsers.forEach((log: any) => {
          if (!userMap.has(log.user_id)) {
            let displayName = 'User';
            if (log.user_email) {
              const emailName = log.user_email.split('@')[0];
              displayName = emailName.replace(/[._-]/g, ' ');
              displayName = displayName.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ');
            }
            
            userMap.set(log.user_id, {
              id: log.user_id,
              full_name: displayName,
              email: log.user_email || log.user_id,
              role: log.user_role || 'User'
            });
          }
        });
      }

      // 3. Get users from daily_activity_summary
      const { data: summaryUsers, error: summaryError } = await supabase
        .from('daily_activity_summary')
        .select('user_id, user_email, user_role');

      if (!summaryError && summaryUsers) {
        summaryUsers.forEach((item: any) => {
          if (!userMap.has(item.user_id)) {
            let displayName = 'User';
            if (item.user_email) {
              const emailName = item.user_email.split('@')[0];
              displayName = emailName.replace(/[._-]/g, ' ');
              displayName = displayName.split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              ).join(' ');
            }
            
            userMap.set(item.user_id, {
              id: item.user_id,
              full_name: displayName,
              email: item.user_email || item.user_id,
              role: item.user_role || 'User'
            });
          }
        });
      }

      // 4. IMPORTANT: Also add known admin users manually
      // This ensures both admins appear even if they have no activity logs
      const knownAdmins = [
        { email: 'shavindialaoka69@gmail.com', name: 'Shavindi' },
        { email: 'dhammika@gmail.com', name: 'Dhammika' }
      ];

      knownAdmins.forEach(admin => {
        // Check if user already exists in map by email
        let exists = false;
        userMap.forEach((user) => {
          if (user.email === admin.email) {
            exists = true;
            // Update role to admin if not already
            if (user.role !== 'admin') {
              user.role = 'admin';
            }
          }
        });

        if (!exists) {
          // Add the admin user with a temporary ID (using email as ID)
          userMap.set(admin.email, {
            id: admin.email, // Use email as ID for display
            full_name: admin.name,
            email: admin.email,
            role: 'admin'
          });
        }
      });

      // Convert map to array and sort by name
      const uniqueUsers = Array.from(userMap.values())
        .sort((a, b) => (a.full_name || a.email).localeCompare(b.full_name || b.email));

      setUsers(uniqueUsers);
      
      // Build user cache
      const cache = new Map();
      uniqueUsers.forEach((user: any) => {
        cache.set(user.id, user);
      });
      setUserCache(cache);
      
      console.log('✅ Fetched users:', uniqueUsers.length, uniqueUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchActivityData = async () => {
    setLoading(true);
    try {
      // Build the query
      let detailQuery = supabase
        .from('activity_logs')
        .select('*')
        .gte('created_at', dateRange.start)
        .lte('created_at', `${dateRange.end} 23:59:59`)
        .order('created_at', { ascending: false });

      if (selectedUser !== 'all') {
        // If selected user is an email (from manually added admins), handle it
        if (selectedUser.includes('@')) {
          detailQuery = detailQuery.eq('user_email', selectedUser);
        } else {
          detailQuery = detailQuery.eq('user_id', selectedUser);
        }
      }

      if (selectedActivityType !== 'all') {
        detailQuery = detailQuery.eq('activity_type', selectedActivityType);
      }

      const { data: detailData, error: detailError } = await detailQuery;

      if (detailError) throw detailError;
      
      // If no activities found, set empty arrays
      if (!detailData || detailData.length === 0) {
        setActivities([]);
        setDailySummaries([]);
        setLoading(false);
        return;
      }

      setActivities(detailData || []);

      // Build daily summaries from the fetched activities
      const summaries = buildDailySummaries(detailData || []);
      setDailySummaries(summaries);

      // Fetch missing users
      const userIds = new Set<string>();
      detailData?.forEach((activity: ActivityLog) => {
        if (activity.user_id) {
          userIds.add(activity.user_id);
        }
      });

      await fetchMissingUsers(Array.from(userIds));

    } catch (error) {
      console.error('Error fetching activity data:', error);
      setActivities([]);
      setDailySummaries([]);
    } finally {
      setLoading(false);
    }
  };

  // Build daily summaries from activities
  const buildDailySummaries = (activities: ActivityLog[]): DailySummary[] => {
    const summaryMap = new Map<string, DailySummary>();

    activities.forEach((activity) => {
      const date = new Date(activity.created_at);
      const dateKey = date.toISOString().split('T')[0];
      const key = `${dateKey}-${activity.user_id}`;

      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          activity_date: dateKey,
          user_id: activity.user_id,
          user_email: activity.user_email,
          user_role: activity.user_role,
          total_activities: 0,
          cv_downloads: 0,
          page_views: 0,
          candidate_views: 0,
          job_edits: 0,
          job_creates: 0,
          activities: []
        });
      }

      const summary = summaryMap.get(key)!;
      summary.total_activities++;
      
      // Count activity types
      switch (activity.activity_type) {
        case 'cv_download':
          summary.cv_downloads++;
          break;
        case 'page_view':
          summary.page_views++;
          break;
        case 'candidate_view':
          summary.candidate_views++;
          break;
        case 'job_edit':
          summary.job_edits++;
          break;
        case 'job_create':
          summary.job_creates++;
          break;
      }
      
      summary.activities.push(activity);
    });

    // Sort activities within each summary by created_at descending
    summaryMap.forEach((summary) => {
      summary.activities.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });

    // Sort summaries by date descending
    return Array.from(summaryMap.values()).sort((a, b) => 
      b.activity_date.localeCompare(a.activity_date)
    );
  };

  const fetchMissingUsers = async (userIds: string[]) => {
    const missingIds = userIds.filter(id => !userCache.has(id) && !users.find(u => u.id === id));
    
    if (missingIds.length === 0) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .in('id', missingIds);

      if (error) throw error;

      if (data && data.length > 0) {
        setUsers(prev => {
          const existingIds = new Set(prev.map(u => u.id));
          const newUsers = data.filter(u => !existingIds.has(u.id));
          return [...prev, ...newUsers];
        });

        const newCache = new Map(userCache);
        data.forEach((user: any) => {
          newCache.set(user.id, user);
        });
        setUserCache(newCache);
      }

      const stillMissing = missingIds.filter(id => !userCache.has(id) && !users.find(u => u.id === id));
      if (stillMissing.length > 0) {
        const syntheticUsers = stillMissing.map(id => {
          const activityUser = activities.find(a => a.user_id === id);
          let displayName = 'User';
          if (activityUser?.user_email) {
            const emailName = activityUser.user_email.split('@')[0];
            displayName = emailName.replace(/[._-]/g, ' ');
            displayName = displayName.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
          }
          
          return {
            id: id,
            full_name: displayName,
            email: activityUser?.user_email || id,
            role: activityUser?.user_role || 'User'
          };
        });

        setUsers(prev => {
          const existingIds = new Set(prev.map(u => u.id));
          const newUsers = syntheticUsers.filter(u => !existingIds.has(u.id));
          return [...prev, ...newUsers];
        });

        const newCache = new Map(userCache);
        syntheticUsers.forEach((user: any) => {
          newCache.set(user.id, user);
        });
        setUserCache(newCache);
      }
    } catch (error) {
      console.error('Error fetching missing users:', error);
    }
  };

  // Force refresh function - clears all state and triggers re-fetch
  const forceRefresh = async () => {
    try {
      // Clear all state
      setUserCache(new Map());
      setUsers([]);
      setActivities([]);
      setDailySummaries([]);
      setExpandedDay(null);
      
      // Increment refresh key to force useEffect to re-run
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error during force refresh:', error);
    }
  };

  // Delete functions
  const handleDeleteSingle = async (activityId: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('activity_logs')
        .delete({ count: 'exact' })
        .eq('id', activityId);

      if (error) {
        console.error('Delete error:', error);
        if (error.code === '42501') {
          alert('You do not have permission to delete activities. Please contact your administrator.');
        } else {
          alert(`Delete failed: ${error.message}`);
        }
        return;
      }
      
      await forceRefresh();
      setShowDetailModal(false);
      setSelectedActivity(null);
      alert('Activity deleted successfully');
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      alert(`Failed to delete activity: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteRange = async () => {
    if (!window.confirm(`Delete all activities from ${deleteDateRange.start} to ${deleteDateRange.end}?`)) return;
    
    setDeleting(true);
    try {
      let query = supabase
        .from('activity_logs')
        .delete({ count: 'exact' })
        .gte('created_at', deleteDateRange.start)
        .lte('created_at', `${deleteDateRange.end} 23:59:59`);

      if (deleteUserId !== 'all') {
        query = query.eq('user_id', deleteUserId);
      }

      const { error, count } = await query;

      if (error) {
        console.error('Delete error:', error);
        if (error.code === '42501') {
          alert('You do not have permission to delete activities. Please contact your administrator.');
        } else {
          alert(`Delete failed: ${error.message}`);
        }
        return;
      }
      
      await forceRefresh();
      setShowDeleteModal(false);
      alert(`${count || 0} activities deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting activities:', error);
      alert(`Failed to delete activities: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ WARNING: Are you sure you want to delete ALL activity logs? This action cannot be undone!')) return;
    
    if (!window.confirm('⚠️ FINAL WARNING: This will permanently delete ALL activity logs. Are you absolutely sure?')) return;
    
    setDeleting(true);
    try {
      const { data: allIds, error: selectError } = await supabase
        .from('activity_logs')
        .select('id');

      if (selectError) {
        console.error('Select error:', selectError);
        alert(`Failed to fetch activities: ${selectError.message}`);
        return;
      }

      if (!allIds || allIds.length === 0) {
        alert('No activities found to delete.');
        setDeleting(false);
        return;
      }

      const batchSize = 100;
      let deletedCount = 0;
      
      for (let i = 0; i < allIds.length; i += batchSize) {
        const batch = allIds.slice(i, i + batchSize);
        const ids = batch.map(item => item.id);
        
        const { error: deleteError, count } = await supabase
          .from('activity_logs')
          .delete({ count: 'exact' })
          .in('id', ids);

        if (deleteError) {
          console.error('Delete batch error:', deleteError);
          if (deleteError.code === '42501') {
            alert('You do not have permission to delete activities. Please contact your administrator.');
          } else {
            alert(`Delete failed: ${deleteError.message}`);
          }
          return;
        }
        deletedCount += count || 0;
      }
      
      await forceRefresh();
      setShowDeleteModal(false);
      alert(`${deletedCount} activities deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting all activities:', error);
      alert(`Failed to delete all activities: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteUserActivities = async () => {
    if (deleteUserId === 'all') {
      alert('Please select a specific user');
      return;
    }

    const userName = getUserName(deleteUserId);
    if (!window.confirm(`Delete all activities for user "${userName}"?`)) return;
    
    setDeleting(true);
    try {
      const { data: userActivities, error: selectError } = await supabase
        .from('activity_logs')
        .select('id')
        .eq('user_id', deleteUserId);

      if (selectError) {
        console.error('Select error:', selectError);
        alert(`Failed to fetch user activities: ${selectError.message}`);
        return;
      }

      if (!userActivities || userActivities.length === 0) {
        alert(`No activities found for user "${userName}".`);
        setDeleting(false);
        return;
      }

      const batchSize = 100;
      let deletedCount = 0;
      
      for (let i = 0; i < userActivities.length; i += batchSize) {
        const batch = userActivities.slice(i, i + batchSize);
        const ids = batch.map(item => item.id);
        
        const { error: deleteError, count } = await supabase
          .from('activity_logs')
          .delete({ count: 'exact' })
          .in('id', ids);

        if (deleteError) {
          console.error('Delete batch error:', deleteError);
          if (deleteError.code === '42501') {
            alert('You do not have permission to delete activities. Please contact your administrator.');
          } else {
            alert(`Delete failed: ${deleteError.message}`);
          }
          return;
        }
        deletedCount += count || 0;
      }
      
      await forceRefresh();
      setShowDeleteModal(false);
      alert(`${deletedCount} activities for "${userName}" deleted successfully`);
    } catch (error: any) {
      console.error('Error deleting user activities:', error);
      alert(`Failed to delete user activities: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const getActivityTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      cv_download: 'bg-blue-100 text-blue-700',
      page_view: 'bg-gray-100 text-gray-700',
      candidate_view: 'bg-purple-100 text-purple-700',
      job_view: 'bg-green-100 text-green-700',
      job_edit: 'bg-yellow-100 text-yellow-700',
      job_create: 'bg-emerald-100 text-emerald-700',
      candidate_edit: 'bg-indigo-100 text-indigo-700',
      candidate_create: 'bg-violet-100 text-violet-700',
      report_generated: 'bg-orange-100 text-orange-700',
      settings_change: 'bg-red-100 text-red-700',
      export_data: 'bg-cyan-100 text-cyan-700',
      login: 'bg-teal-100 text-teal-700',
      logout: 'bg-rose-100 text-rose-700',
      candidate_applied: 'bg-pink-100 text-pink-700',
      job_application_view: 'bg-sky-100 text-sky-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getActivityIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      cv_download: <Download size={16} />,
      page_view: <Eye size={16} />,
      candidate_view: <UserCheck size={16} />,
      job_view: <FileText size={16} />,
      job_edit: <FileText size={16} />,
      job_create: <FileText size={16} />,
      candidate_edit: <UserCheck size={16} />,
      candidate_create: <UserCheck size={16} />,
      report_generated: <BarChart size={16} />,
      settings_change: <ActivityIcon size={16} />,
      export_data: <DownloadIcon size={16} />,
      login: <UserCheck size={16} />,
      logout: <UserCheck size={16} />,
    };
    return icons[type] || <ActivityIcon size={16} />;
  };

  const toggleDayExpand = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date);
  };

  const getUserName = (userId: string): string => {
    if (userCache.has(userId)) {
      const user = userCache.get(userId);
      return user.full_name || user.email?.split('@')[0]?.replace(/[._-]/g, ' ') || 'User';
    }

    const user = users.find(u => u.id === userId);
    if (user) {
      return user.full_name || user.email?.split('@')[0]?.replace(/[._-]/g, ' ') || 'User';
    }

    const summaryUser = dailySummaries.find(s => s.user_id === userId);
    if (summaryUser?.user_email) {
      const emailName = summaryUser.user_email.split('@')[0];
      const displayName = emailName.replace(/[._-]/g, ' ');
      return displayName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }

    const activityUser = activities.find(a => a.user_id === userId);
    if (activityUser?.user_email) {
      const emailName = activityUser.user_email.split('@')[0];
      const displayName = emailName.replace(/[._-]/g, ' ');
      return displayName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }

    return 'User';
  };

  const getUserRole = (userId: string): string => {
    if (userCache.has(userId)) {
      return userCache.get(userId).role || 'User';
    }

    const user = users.find(u => u.id === userId);
    if (user?.role) return user.role;

    const summaryUser = dailySummaries.find(s => s.user_id === userId);
    if (summaryUser?.user_role) return summaryUser.user_role;

    const activityUser = activities.find(a => a.user_id === userId);
    return activityUser?.user_role || 'User';
  };

  const stats = useMemo(() => {
    const total = activities.length;
    const cvDownloads = activities.filter(a => a.activity_type === 'cv_download').length;
    const pageViews = activities.filter(a => a.activity_type === 'page_view').length;
    const candidateViews = activities.filter(a => a.activity_type === 'candidate_view').length;
    const uniqueUsers = new Set(activities.map(a => a.user_id)).size;
    const jobCreations = activities.filter(a => a.activity_type === 'job_create').length;
    const jobEdits = activities.filter(a => a.activity_type === 'job_edit').length;

    return { total, cvDownloads, pageViews, candidateViews, uniqueUsers, jobCreations, jobEdits };
  }, [activities]);

  const filteredActivities = useMemo(() => {
    if (!searchTerm) return activities;
    
    return activities.filter(activity => 
      activity.activity_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.page_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activities, searchTerm]);

  const activityTypes = [
    'all',
    'cv_download',
    'page_view',
    'candidate_view',
    'job_view',
    'job_edit',
    'job_create',
    'candidate_edit',
    'candidate_create',
    'report_generated',
    'settings_change',
    'export_data',
    'login',
    'logout',
    'candidate_applied',
    'job_application_view'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Activity Dashboard</h1>
          <p className="text-gray-500 text-sm">Monitor all HR intern activities in real-time</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={18} />
            Delete History
          </button>
          <button
            onClick={() => forceRefresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Activities</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ActivityIcon size={20} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">CV Downloads</p>
              <p className="text-2xl font-bold text-gray-800">{stats.cvDownloads}</p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download size={20} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-800">{stats.uniqueUsers}</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Job Activities</p>
              <p className="text-2xl font-bold text-gray-800">{stats.jobCreations + stats.jobEdits}</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Users</option>
              {users.length > 0 ? (
                users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name || user.email} ({user.role || 'User'})
                  </option>
                ))
              ) : (
                <option value="" disabled>No users found</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {activityTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Activities' : type.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Daily Summary View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Daily Activity Summary</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {dailySummaries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No activities found for the selected period
            </div>
          ) : (
            dailySummaries.map((summary) => (
              <div key={`${summary.user_id}-${summary.activity_date}`} className="p-4">
                <div 
                  className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                  onClick={() => toggleDayExpand(summary.activity_date)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {getUserName(summary.user_id).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{getUserName(summary.user_id)}</p>
                        <p className="text-sm text-gray-500">{summary.user_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {getUserRole(summary.user_id)}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(summary.activity_date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">Activities:</span>
                      <span className="font-semibold text-gray-800">{summary.total_activities}</span>
                    </div>
                    {summary.cv_downloads > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Download size={14} className="text-blue-500" />
                        <span className="font-semibold text-blue-600">{summary.cv_downloads}</span>
                      </div>
                    )}
                    <ChevronDown 
                      size={18} 
                      className={`text-gray-400 transition-transform ${expandedDay === summary.activity_date ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </div>

                {expandedDay === summary.activity_date && (
                  <div className="mt-3 ml-12 space-y-2">
                    {summary.activities.map((activity: ActivityLog) => (
                      <div 
                        key={activity.id} 
                        className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowDetailModal(true);
                        }}
                      >
                        <div className={`p-1.5 rounded-lg ${getActivityTypeColor(activity.activity_type)}`}>
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-gray-800">{activity.activity_description}</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {activity.page_name} • {formatTime(activity.created_at)}
                              </p>
                              {activity.metadata?.candidate_name && (
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Candidate: {activity.metadata.candidate_name}
                                </p>
                              )}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getActivityTypeColor(activity.activity_type)}`}>
                              {activity.activity_type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detailed Activity Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Detailed Activity Log</h2>
          <span className="text-sm text-gray-500">{filteredActivities.length} activities</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredActivities.slice(0, 50).map((activity) => (
                <tr 
                  key={activity.id} 
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{getUserName(activity.user_id)}</p>
                      <p className="text-xs text-gray-400">{activity.user_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{activity.activity_description}</p>
                    {activity.metadata?.candidate_name && (
                      <p className="text-xs text-gray-400">Candidate: {activity.metadata.candidate_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{activity.page_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-700">{formatTime(activity.created_at)}</p>
                      <p className="text-xs text-gray-400">{formatDate(activity.created_at)}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${getActivityTypeColor(activity.activity_type)}`}>
                      {activity.activity_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedActivity(activity);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSingle(activity.id);
                      }}
                      className="text-red-600 hover:text-red-800"
                      disabled={deleting}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredActivities.length > 50 && (
            <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100">
              Showing 50 of {filteredActivities.length} activities. Use filters to narrow down results.
            </div>
          )}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Activity Details</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this activity?')) {
                      handleDeleteSingle(selectedActivity.id);
                    }
                  }}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                  disabled={deleting}
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedActivity(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">User</p>
                  <p className="font-medium text-gray-800">{getUserName(selectedActivity.user_id)}</p>
                  <p className="text-sm text-gray-500">{selectedActivity.user_email}</p>
                  <p className="text-xs text-gray-400">Role: {getUserRole(selectedActivity.user_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Activity Type</p>
                  <span className={`text-sm px-3 py-1 rounded-full ${getActivityTypeColor(selectedActivity.activity_type)}`}>
                    {selectedActivity.activity_type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-800">{selectedActivity.activity_description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Page</p>
                  <p className="text-gray-800">{selectedActivity.page_name}</p>
                  <p className="text-xs text-gray-400">{selectedActivity.page_url}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="text-gray-800">{formatDate(selectedActivity.created_at)}</p>
                  <p className="text-sm text-gray-500">{formatTime(selectedActivity.created_at)}</p>
                </div>
              </div>

              {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Additional Data</p>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                      {JSON.stringify(selectedActivity.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete History Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Delete Activity History</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">
                  <strong>Warning:</strong> Deleting activity logs is permanent and cannot be undone.
                </p>
              </div>

              {/* Delete by Date Range */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">Delete by Date Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={deleteDateRange.start}
                      onChange={(e) => setDeleteDateRange({ ...deleteDateRange, start: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={deleteDateRange.end}
                      onChange={(e) => setDeleteDateRange({ ...deleteDateRange, end: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm text-gray-600 mb-1">User (Optional)</label>
                  <select
                    value={deleteUserId}
                    onChange={(e) => setDeleteUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="all">All Users</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleDeleteRange}
                  disabled={deleting}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Activities in Range'}
                </button>
              </div>

              {/* Delete by User */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">Delete All Activities for a User</h3>
                <select
                  value={deleteUserId}
                  onChange={(e) => setDeleteUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="all">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.email} ({user.role || 'User'})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDeleteUserActivities}
                  disabled={deleting || deleteUserId === 'all'}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete User Activities'}
                </button>
              </div>

              {/* Delete All */}
              <div className="border rounded-lg p-4 border-red-300 bg-red-50">
                <h3 className="font-medium text-red-800 mb-3">Delete ALL Activities</h3>
                <p className="text-sm text-red-600 mb-3">This will permanently delete all activity logs from the database.</p>
                <button
                  onClick={handleDeleteAll}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete All Activities'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
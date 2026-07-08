import { supabase } from '../supabaseClient';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export type ActivityType = 
  | 'page_view'
  | 'cv_download'
  | 'candidate_view'
  | 'job_view'
  | 'job_edit'
  | 'job_create'
  | 'candidate_edit'
  | 'candidate_create'
  | 'report_generated'
  | 'settings_change'
  | 'field_change'  
  | 'export_data'
  | 'login'
  | 'logout'
  | 'notification_read'
  | 'candidate_applied'
  | 'job_application_view';

interface ActivityLogData {
  activity_type: ActivityType;
  activity_description: string;
  page_url?: string;
  page_name?: string;
  metadata?: Record<string, any>;
}

export class ActivityLogger {
  private static instance: ActivityLogger;
  private queue: ActivityLogData[] = [];
  private isProcessing = false;
  private batchTimeout: ReturnType<typeof setTimeout> | null = null;
  private currentUser: any = null;
  private currentProfile: any = null;
  private lastLoggedPage: string = '';
  private lastLoggedTime: number = 0;

  static getInstance() {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  private constructor() {
    this.startBatchProcessing();
    this.loadUser();
  }

  private async loadUser() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        this.currentUser = user;
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, full_name, email')
          .eq('id', user.id)
          .single();
        this.currentProfile = profile;
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  }

  async logActivity(data: ActivityLogData) {
    if (!this.currentUser) {
      await this.loadUser();
    }
    
    if (!this.currentUser) {
      console.warn('No user logged in, activity not logged');
      return;
    }

    if (data.activity_type === 'page_view') {
      const currentPage = data.page_url || window.location.pathname;
      const now = Date.now();
      
      if (this.lastLoggedPage === currentPage && (now - this.lastLoggedTime) < 5000) {
        console.log('Skipping duplicate page view:', currentPage);
        return;
      }
      
      this.lastLoggedPage = currentPage;
      this.lastLoggedTime = now;
    }

    this.queue.push({
      ...data,
      page_url: data.page_url || window.location.pathname,
      page_name: data.page_name || document.title || 'Unknown Page',
    });

    console.log(`Logging activity: ${data.activity_type} - ${data.activity_description}`);

    if (this.queue.length >= 5) {
      await this.processBatch();
    } else {
      this.scheduleBatchProcessing();
    }
  }

  private scheduleBatchProcessing() {
    if (this.batchTimeout) return;
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, 5000);
  }

  private async processBatch() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const batch = [...this.queue];
    this.queue = [];

    try {
      if (!this.currentUser) {
        await this.loadUser();
      }
      
      if (!this.currentUser) {
        console.warn('No user found, skipping activity log');
        this.isProcessing = false;
        return;
      }

      const logs = batch.map(log => ({
        user_id: this.currentUser.id,
        user_email: this.currentUser.email,
        user_role: this.currentProfile?.role || 'user',
        activity_type: log.activity_type,
        activity_description: log.activity_description,
        page_url: log.page_url,
        page_name: log.page_name,
        metadata: log.metadata || {},
        created_at: new Date().toISOString()
      }));

      if (logs.length > 0) {
        const { error } = await supabase
          .from('activity_logs')
          .insert(logs);

        if (error) {
          console.error('Error logging activities:', error);
          this.saveToLocalStorage(logs);
        } else {
          console.log(`Logged ${logs.length} activities`);
        }
      }
    } catch (error) {
      console.error('Error processing activity batch:', error);
    } finally {
      this.isProcessing = false;
      this.batchTimeout = null;
    }
  }

  private saveToLocalStorage(logs: any[]) {
    try {
      const stored = localStorage.getItem('pending_activity_logs');
      const pending = stored ? JSON.parse(stored) : [];
      localStorage.setItem('pending_activity_logs', JSON.stringify([...pending, ...logs]));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private startBatchProcessing() {
    this.processPendingLogs();
  }

  private async processPendingLogs() {
    try {
      const stored = localStorage.getItem('pending_activity_logs');
      if (!stored) return;

      const pending = JSON.parse(stored);
      if (pending.length === 0) return;

      const { error } = await supabase
        .from('activity_logs')
        .insert(pending);

      if (!error) {
        localStorage.removeItem('pending_activity_logs');
      }
    } catch (error) {
      console.error('Error processing pending logs:', error);
    }
  }

  public cleanup() {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

export const useActivityLogger = () => {
  const location = useLocation();
  const logger = ActivityLogger.getInstance();
  const initialLoadRef = useRef(true);
  const lastLoggedPathRef = useRef<string>('');

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      const logInitialPage = async () => {
        const pageName = location.pathname.split('/').pop() || 'dashboard';
        await logger.logActivity({
          activity_type: 'page_view',
          activity_description: `Viewed ${pageName} page`,
          page_name: pageName,
          page_url: location.pathname,
          metadata: { is_initial_load: true }
        });
      };
      logInitialPage();
      return;
    }

    if (lastLoggedPathRef.current === location.pathname) {
      return;
    }

    lastLoggedPathRef.current = location.pathname;

    const logPageView = async () => {
      const pageName = location.pathname.split('/').pop() || 'dashboard';
      await logger.logActivity({
        activity_type: 'page_view',
        activity_description: `Viewed ${pageName} page`,
        page_name: pageName,
        page_url: location.pathname,
      });
    };

    logPageView();

    return () => {
      logger.cleanup();
    };
  }, [location.pathname]);
};

export const logActivity = async (
  type: ActivityType,
  description: string,
  metadata?: Record<string, any>
) => {
  const logger = ActivityLogger.getInstance();
  await logger.logActivity({
    activity_type: type,
    activity_description: description,
    metadata: metadata || {}
  });
};

export const logLogin = async (email: string) => {
  await logActivity('login', `User ${email} logged in`, { user_email: email });
};

export const logLogout = async (email: string) => {
  await logActivity('logout', `User ${email} logged out`, { user_email: email });
};

export const logPageView = async (pageName: string, pageUrl: string) => {
  await logActivity('page_view', `Viewed ${pageName} page`, { page_name: pageName, page_url: pageUrl });
};

export const logCVDownload = async (candidateId: string, candidateName: string) => {
  await logActivity('cv_download', `Downloaded CV for ${candidateName}`, { candidate_id: candidateId, candidate_name: candidateName });
};

export const logCandidateView = async (candidateId: string, candidateName: string) => {
  await logActivity('candidate_view', `Viewed candidate profile: ${candidateName}`, { candidate_id: candidateId, candidate_name: candidateName });
};

export const logCandidateCreate = async (candidateName: string, email: string) => {
  await logActivity('candidate_create', `Created new candidate: ${candidateName}`, { candidate_name: candidateName, email });
};

export const logCandidateEdit = async (candidateId: string, candidateName: string) => {
  await logActivity('candidate_edit', `Updated candidate: ${candidateName}`, { candidate_id: candidateId, candidate_name: candidateName });
};

export const logCandidateApplied = async (candidateId: string, jobId: string, jobTitle: string) => {
  await logActivity('candidate_applied', `Candidate applied for job: ${jobTitle}`, { candidate_id: candidateId, job_id: jobId, job_title: jobTitle });
};

export const logJobView = async (jobId: string, jobTitle: string) => {
  await logActivity('job_view', `Viewed job: ${jobTitle}`, { job_id: jobId, job_title: jobTitle });
};

export const logJobCreate = async (jobTitle: string, department: string) => {
  await logActivity('job_create', `Created new job: ${jobTitle}`, { job_title: jobTitle, department });
};

export const logJobEdit = async (jobId: string, jobTitle: string, changes: any) => {
  await logActivity('job_edit', `Updated job: ${jobTitle}`, { job_id: jobId, job_title: jobTitle, changes });
};

export const logJobApplicationView = async (applicationId: string, candidateName: string) => {
  await logActivity('job_application_view', `Viewed job application for ${candidateName}`, { application_id: applicationId, candidate_name: candidateName });
};

export const logReportGenerated = async (reportName: string, format: string) => {
  await logActivity('report_generated', `Generated ${reportName} report (${format})`, { 
    report_name: reportName, 
    format: format,
    generated_at: new Date().toISOString()
  });
};

export const logExportData = async (exportType: string, recordCount: number) => {
  await logActivity('export_data', `Exported ${exportType} with ${recordCount} records`, { 
    export_type: exportType, 
    records: recordCount 
  });
};

export const logSettingsChange = async (settingName: string, oldValue: any, newValue: any) => {
  await logActivity('settings_change', `Changed setting: ${settingName}`, { setting: settingName, old_value: oldValue, new_value: newValue });
};

export const logNotificationRead = async (notificationId: string, notificationType: string) => {
  await logActivity('notification_read', `Read notification: ${notificationType}`, { notification_id: notificationId, type: notificationType });
};
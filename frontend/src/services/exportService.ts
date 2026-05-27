import { supabase } from '../supabaseClient';

export interface ExportFilters {
  format: 'csv' | 'excel' | 'pdf';
  timePeriod: 'all' | 'today' | 'week' | 'month' | 'year';
  fields: string[];
}

export interface ExportResponse {
  success: boolean;
  data?: any;
  error?: string;
  downloadUrl?: string;
}

class ExportService {
  async fetchCandidatesData(filters: ExportFilters): Promise<any[]> {
    try {
      console.log('Fetching candidates with filters:', filters);
      
      let query = supabase
        .from('candidates')
        .select('*');

      // Apply time period filter
      if (filters.timePeriod !== 'all') {
        const dateFilter = this.getDateFilter(filters.timePeriod);
        if (dateFilter) {
          query = query.gte('created_at', dateFilter);
          console.log('Applying date filter:', dateFilter);
        }
      }

      const { data, error, status, statusText } = await query;

      if (error) {
        console.error('Supabase error details:', { error, status, statusText });
        throw new Error(`Database error: ${error.message}. Please ensure the 'candidates' table exists.`);
      }

      if (!data || data.length === 0) {
        console.log('No data found, returning empty array');
        return [];
      }

      console.log(`Fetched ${data.length} records`);
      
      // Filter fields based on selection
      const filteredData = this.filterFields(data || [], filters.fields);
      return filteredData;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }

  private getDateFilter(timePeriod: string): string | null {
    const now = new Date();
    switch (timePeriod) {
      case 'today':
        return new Date(now.setHours(0, 0, 0, 0)).toISOString();
      case 'week':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      default:
        return null;
    }
  }

  private filterFields(data: any[], fields: string[]): any[] {
    return data.map(item => {
      const filtered: any = { 
        id: item.id,
        created_at: item.created_at 
      };
      
      fields.forEach(field => {
        switch (field) {
          case 'Personal Info':
            filtered.first_name = item.first_name;
            filtered.last_name = item.last_name;
            filtered.email = item.email;
            filtered.phone = item.phone;
            filtered.location = item.location;
            break;
          case 'Professional Experience':
            filtered.job_title = item.job_title;
            filtered.company = item.company;
            filtered.experience_years = item.experience_years;
            break;
          case 'Skills':
            filtered.skills = Array.isArray(item.skills) ? item.skills.join(', ') : item.skills;
            break;
          case 'Salary Expectations':
            filtered.salary_min = item.salary_min;
            filtered.salary_max = item.salary_max;
            filtered.currency = item.currency || 'USD';
            break;
          case 'Availability':
            filtered.availability = item.availability;
            break;
          case 'Joined Date':
            filtered.joined_date = item.created_at;
            break;
        }
      });
      
      return filtered;
    });
  }

  async exportData(filters: ExportFilters): Promise<ExportResponse> {
    try {
      const data = await this.fetchCandidatesData(filters);
      
      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'No data found for the selected criteria'
        };
      }
      
      // Store export job in localStorage for history
      const exportJob = {
        id: Date.now().toString(),
        format: filters.format,
        filters: filters,
        status: 'completed',
        created_at: new Date().toISOString(),
        record_count: data.length,
        export_data: data
      };

      // Save to localStorage
      const existingHistory = this.getExportHistoryFromStorage();
      existingHistory.unshift(exportJob);
      localStorage.setItem('export_history', JSON.stringify(existingHistory.slice(0, 50)));

      return {
        success: true,
        data: data,
        downloadUrl: `/api/export/download/${exportJob.id}`
      };
    } catch (error) {
      console.error('Export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed. Please make sure the database table exists.'
      };
    }
  }

  private getExportHistoryFromStorage(): any[] {
    try {
      const history = localStorage.getItem('export_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  async getExportHistory(): Promise<any[]> {
    return this.getExportHistoryFromStorage();
  }

  convertToCSV(data: any[]): string {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Handle strings with commas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }

  async downloadExport(jobId: string): Promise<Blob | null> {
    try {
      const history = this.getExportHistoryFromStorage();
      const job = history.find(j => j.id === jobId);
      
      if (!job || !job.export_data) {
        return null;
      }

      const csvData = this.convertToCSV(job.export_data);
      return new Blob([csvData], { type: 'text/csv' });
    } catch (error) {
      console.error('Download error:', error);
      return null;
    }
  }

  // Helper method to check if table exists
  async checkTableExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('Table check error:', error);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const exportService = new ExportService();
// src/hooks/useJobs.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import type { Job, CreateJobDto, UpdateJobDto } from '../types/job';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchJobs = useCallback(async (filterByField?: string, options?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build the query
      let query = supabase
        .from('jobs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply field filter
      if (filterByField && filterByField !== 'All') {
        query = query.eq('field', filterByField);
      }

      // Apply status filter (default to 'Open' if not specified)
      if (options?.status) {
        query = query.eq('status', options.status);
      } else {
        // Default to showing only 'Open' jobs for candidates
        query = query.eq('status', 'Open');
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;
      
      setJobs(data || []);
      setTotalCount(count || 0);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
      toast.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = async (jobData: CreateJobDto) => {
    try {
      // Use a proper date handling approach
      const now = new Date();
      
      // Log the date for debugging
      console.log('Creating job with date:', now.toISOString());

      // Validate required fields
      if (!jobData.title || !jobData.description || !jobData.field) {
        throw new Error('Title, description, and field are required');
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          title: jobData.title,
          description: jobData.description,
          requirements: jobData.requirements || '',
          field: jobData.field,
          experience_level: jobData.experience_level || 'Entry Level',
          salary_range: jobData.salary_range || '',
          location: jobData.location || 'Remote',
          job_type: jobData.job_type || 'Full-time',
          status: jobData.status || 'Open',
          created_by: null,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }
      
      toast.success('Job created successfully');
      await fetchJobs();
      return data;
    } catch (err: any) {
      console.error('Create error:', err);
      toast.error(err.message || 'Failed to create job');
      throw err;
    }
  };

  const updateJob = async (id: string, updates: UpdateJobDto) => {
    try {
      const now = new Date();

      const { data, error } = await supabase
        .from('jobs')
        .update({
          ...updates,
          updated_at: now.toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Job updated successfully');
      await fetchJobs();
      return data;
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error(err.message);
      throw err;
    }
  };

  const deleteJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Job deleted successfully');
      await fetchJobs();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message);
      throw err;
    }
  };

  // Additional helper function to get job statistics
  const getJobStatistics = useCallback(() => {
    const total = jobs.length;
    const open = jobs.filter(j => j.status === 'Open').length;
    const closed = jobs.filter(j => j.status === 'Closed').length;
    const byField = jobs.reduce((acc, job) => {
      acc[job.field] = (acc[job.field] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, open, closed, byField };
  }, [jobs]);

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    totalCount,
    createJob,
    updateJob,
    deleteJob,
    refetch: fetchJobs,
    getJobStatistics,
  };
};
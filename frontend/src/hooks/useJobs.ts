// src/hooks/useJobs.ts - Simplified version for testing
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import type { Job, CreateJobDto, UpdateJobDto } from '../types/job';

export const useJobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async (filterByField?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by field if provided
      if (filterByField && filterByField !== 'All') {
        query = query.eq('field', filterByField);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      
      setJobs(data || []);
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
      // For testing, don't check roles at all
      const { data, error } = await supabase
        .from('jobs')
        .insert([{
          title: jobData.title,
          description: jobData.description,
          requirements: jobData.requirements,
          field: jobData.field,
          experience_level: jobData.experience_level,
          salary_range: jobData.salary_range,
          location: jobData.location,
          job_type: jobData.job_type,
          status: jobData.status || 'Open',
          created_by: null, // Set to null to avoid foreign key issues
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
      const { data, error } = await supabase
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
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

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    createJob,
    updateJob,
    deleteJob,
    refetch: fetchJobs,
  };
};
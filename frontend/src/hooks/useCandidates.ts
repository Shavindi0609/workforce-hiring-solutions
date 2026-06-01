// src/hooks/useCandidates.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient'; 
import toast from 'react-hot-toast';
import type { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../types/candidate';

export const useCandidates = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchCandidates = useCallback(async (filters?: any) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Fetching candidates from Supabase...');
            console.log('Supabase object:', supabase); // Debug
            
            let query = supabase
                .from('candidates')
                .select('*', { count: 'exact' });

            if (filters?.search) {
                query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,field.ilike.%${filters.search}%`);
            }
            if (filters?.field && filters.field !== 'All Fields') {
                query = query.eq('field', filters.field);
            }
            if (filters?.status && filters.status !== 'All') {
                query = query.eq('status', filters.status);
            }
            if (filters?.availability && filters.availability !== 'All') {
                query = query.eq('availability', filters.availability);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error: fetchError, count } = await query;

            console.log('📊 Fetch result:', { 
                dataLength: data?.length, 
                count, 
                error: fetchError,
                sampleData: data?.[0] 
            });

            if (fetchError) throw fetchError;
            
            setCandidates(data || []);
            setTotalCount(count || 0);
            
        } catch (err: any) {
            console.error('❌ Fetch error:', err);
            setError(err.message);
            toast.error('Failed to fetch candidates: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCandidate = async (candidateData: CreateCandidateDto) => {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .insert([{
                    ...candidateData,
                    avatar_url: `https://i.pravatar.cc/150?u=${candidateData.email}`,
                    joined: new Date().toISOString(),
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success('Candidate added successfully');
            await fetchCandidates();
            return data;
        } catch (err: any) {
            console.error('Create error:', err);
            toast.error(err.message);
            throw err;
        }
    };

    const updateCandidate = async (id: string, updates: UpdateCandidateDto) => {
        try {
            const { data, error } = await supabase
                .from('candidates')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            toast.success('Candidate updated successfully');
            await fetchCandidates();
            return data;
        } catch (err: any) {
            console.error('Update error:', err);
            toast.error(err.message);
            throw err;
        }
    };

    const deleteCandidate = async (id: string) => {
        try {
            const { error } = await supabase
                .from('candidates')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Candidate deleted successfully');
            await fetchCandidates();
        } catch (err: any) {
            console.error('Delete error:', err);
            toast.error(err.message);
            throw err;
        }
    };

    const getStatistics = useCallback(() => {
        const total = candidates.length;
        const activelyLooking = candidates.filter(c => c.status === 'Actively Looking').length;
        const openToOpportunities = candidates.filter(c => c.status === 'Open to Opportunities').length;
        const availableImmediately = candidates.filter(c => c.availability === 'Immediate').length;
        
        return {
            total,
            activelyLooking,
            openToOpportunities,
            availableImmediately,
            activelyLookingPercentage: total ? (activelyLooking / total) * 100 : 0,
            openToOpportunitiesPercentage: total ? (openToOpportunities / total) * 100 : 0,
            availableImmediatelyPercentage: total ? (availableImmediately / total) * 100 : 0,
        };
    }, [candidates]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    return {
        candidates,
        loading,
        error,
        totalCount,
        createCandidate,
        updateCandidate,
        deleteCandidate,
        fetchCandidates,
        getStatistics,
    };
};
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
            
            let query = supabase
                .from('candidates')
                .select('*', { count: 'exact' });

            // Apply filters using correct column names
            if (filters?.search) {
                query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,interested_field.ilike.%${filters.search}%`);
            }
            if (filters?.field && filters.field !== 'All Fields') {
                query = query.eq('interested_field', filters.field);
            }
            if (filters?.status && filters.status !== 'All') {
                query = query.eq('status', filters.status);
            }
            if (filters?.availability && filters.availability !== 'All') {
                query = query.eq('availability', filters.availability);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error: fetchError, count } = await query;

            console.log('📊 Fetch result:', { dataLength: data?.length, count, error: fetchError });

            if (fetchError) throw fetchError;
            
            // Map database columns to frontend fields
            const mappedCandidates = data?.map(c => ({
                id: c.id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                avatar_url: c.avatar_url,
                field: c.interested_field,
                experience: c.years_of_experience,
                status: c.status,
                availability: c.availability,
                salary_min: 0, // Not in DB, using salary_range only
                salary_max: 0, // Not in DB, using salary_range only
                salary_range: c.salary_range,
                joined: c.joined,
                created_at: c.created_at,
                updated_at: c.updated_at,
                skills: c.skills,
                willing_to_contact: c.willing_to_contact,
                cv_url: c.cv_url,
            })) || [];
            
            setCandidates(mappedCandidates);
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
                    name: candidateData.name,
                    email: candidateData.email,
                    phone: candidateData.phone,
                    interested_field: candidateData.field,
                    years_of_experience: candidateData.experience,
                    status: candidateData.status || 'Active',
                    availability: candidateData.availability,
                    salary_range: candidateData.salary_range,
                    skills: candidateData.skills || [],
                    avatar_url: `https://i.pravatar.cc/150?u=${candidateData.email}`,
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
            // Map the update fields to correct column names
            const dbUpdates: any = {};
            
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.email !== undefined) dbUpdates.email = updates.email;
            if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
            if (updates.field !== undefined) dbUpdates.interested_field = updates.field;
            if (updates.experience !== undefined) dbUpdates.years_of_experience = updates.experience;
            if (updates.status !== undefined) dbUpdates.status = updates.status;
            if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
            if (updates.salary_range !== undefined) dbUpdates.salary_range = updates.salary_range;
            if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
            
            const { data, error } = await supabase
                .from('candidates')
                .update(dbUpdates)
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
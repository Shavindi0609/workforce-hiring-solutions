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

            console.log(' Fetch result:', { dataLength: data?.length, count, error: fetchError });

            if (fetchError) throw fetchError;
            
            const mappedCandidates = data?.map((c: any) => ({
                id: c.id,
                name: c.name || '',
                email: c.email || '',
                phone: c.phone || '',
                avatar_url: c.avatar_url || `https://i.pravatar.cc/150?u=${c.email || 'default'}`,
                field: c.interested_field || '',
                experience: c.years_of_experience || '',
                status: c.status || 'Open to Opportunities',
                availability: c.availability || 'Not Available',
                salary_min: 0,
                salary_max: 0,
                salary_range: c.salary_range || '',
                joined: c.joined || c.created_at,
                created_at: c.created_at,
                updated_at: c.updated_at,
                skills: c.skills || [],
                willing_to_contact: c.willing_to_contact || false,
                cv_url: c.cv_url,
                cv_text: c.cv_text,
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
            console.log(' Creating candidate with data:', candidateData);
            const insertData: any = {
                name: candidateData.name || '',
                email: candidateData.email || '',
                phone: candidateData.phone || '',
                status: candidateData.status || 'Open to Opportunities',
                availability: candidateData.availability || 'Not Available',
                skills: candidateData.skills || [],
            };

            if (candidateData.field) {
                insertData.interested_field = candidateData.field;
            }

            if (candidateData.experience) {
                insertData.years_of_experience = candidateData.experience;
            }

            if (candidateData.salary_range) {
                insertData.salary_range = candidateData.salary_range;
            }

            if (candidateData.cv_url) {
                insertData.cv_url = candidateData.cv_url;
            }

            if (candidateData.cv_text) {
                insertData.cv_text = candidateData.cv_text;
            }

            if (candidateData.willing_to_contact !== undefined) {
                insertData.willing_to_contact = candidateData.willing_to_contact;
            }

            if (candidateData.avatar_url) {
                insertData.avatar_url = candidateData.avatar_url;
            }

            console.log(' Inserting data (ID will be auto-generated):', insertData);

            const { data, error } = await supabase
                .from('candidates')
                .insert([insertData])
                .select()
                .single();

            if (error) {
                console.error(' Supabase insert error:', error);
                throw error;
            }

            console.log('Candidate created with ID:', data?.id);

            toast.success('Candidate added successfully');
            await fetchCandidates();
            return data;
        } catch (err: any) {
            console.error('Create error:', err);
            toast.error('Failed to create candidate: ' + err.message);
            throw err;
        }
    };

    const updateCandidate = async (id: string, updates: UpdateCandidateDto) => {
        try {
            const updateData: any = {};
            
            if (updates.name !== undefined) updateData.name = updates.name;
            if (updates.email !== undefined) updateData.email = updates.email;
            if (updates.phone !== undefined) updateData.phone = updates.phone;
            if (updates.status !== undefined) updateData.status = updates.status;
            if (updates.availability !== undefined) updateData.availability = updates.availability;
            if (updates.skills !== undefined) updateData.skills = updates.skills;
            
            if (updates.field !== undefined) updateData.interested_field = updates.field;
            if (updates.experience !== undefined) updateData.years_of_experience = updates.experience;
            if (updates.salary_range !== undefined) updateData.salary_range = updates.salary_range;
            if (updates.cv_url !== undefined) updateData.cv_url = updates.cv_url;
            if (updates.cv_text !== undefined) updateData.cv_text = updates.cv_text;
            if (updates.willing_to_contact !== undefined) updateData.willing_to_contact = updates.willing_to_contact;
            if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url;
            
            console.log(' Updating candidate with data:', updateData);

            const { data, error } = await supabase
                .from('candidates')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error(' Supabase update error:', error);
                throw error;
            }

            console.log(' Candidate updated:', data);

            toast.success('Candidate updated successfully');
            await fetchCandidates();
            return data;
        } catch (err: any) {
            console.error(' Update error:', err);
            toast.error('Failed to update candidate: ' + err.message);
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
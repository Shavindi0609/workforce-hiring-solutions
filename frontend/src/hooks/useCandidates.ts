import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient'; 
import toast from 'react-hot-toast';
import type { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../types/candidate';
import { logActivity } from '../utils/activityLogger';

export const useCandidates = () => {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchCandidates = useCallback(async (filters?: any) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log(' Fetching candidates from Supabase...');
            
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

            console.log('Fetch result:', { dataLength: data?.length, count, error: fetchError });

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
            console.error(' Fetch error:', err);
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

            console.log(' Candidate created with ID:', data?.id);

            await logActivity('candidate_create', `Created new candidate: ${candidateData.name}`, {
                candidate_name: candidateData.name,
                candidate_email: candidateData.email,
                candidate_phone: candidateData.phone,
                field: candidateData.field,
                experience: candidateData.experience,
                status: candidateData.status,
                availability: candidateData.availability,
                salary_range: candidateData.salary_range,
                skills: candidateData.skills,
                action: 'create'
            });

            toast.success('Candidate added successfully');
            await fetchCandidates();
            return data;
        } catch (err: any) {
            console.error('❌ Create error:', err);
            toast.error('Failed to create candidate: ' + err.message);
            throw err;
        }
    };

    const updateCandidate = async (id: string, updates: UpdateCandidateDto) => {
        try {
            const oldCandidate = candidates.find(c => c.id === id);
            
            const updateData: any = {};
            const changes: string[] = [];
            
            if (updates.name !== undefined && oldCandidate && oldCandidate.name !== updates.name) {
                updateData.name = updates.name;
                changes.push(`name: "${oldCandidate.name}" → "${updates.name}"`);
            }
            if (updates.email !== undefined && oldCandidate && oldCandidate.email !== updates.email) {
                updateData.email = updates.email;
                changes.push(`email: "${oldCandidate.email}" → "${updates.email}"`);
            }
            if (updates.phone !== undefined && oldCandidate && oldCandidate.phone !== updates.phone) {
                updateData.phone = updates.phone;
                changes.push(`phone: "${oldCandidate.phone}" → "${updates.phone}"`);
            }
            if (updates.status !== undefined && oldCandidate && oldCandidate.status !== updates.status) {
                updateData.status = updates.status;
                changes.push(`status: "${oldCandidate.status}" → "${updates.status}"`);
            }
            if (updates.availability !== undefined && oldCandidate && oldCandidate.availability !== updates.availability) {
                updateData.availability = updates.availability;
                changes.push(`availability: "${oldCandidate.availability}" → "${updates.availability}"`);
            }
            if (updates.skills !== undefined && oldCandidate) {
                const oldSkills = oldCandidate.skills?.join(', ') || '';
                const newSkills = updates.skills?.join(', ') || '';
                if (oldSkills !== newSkills) {
                    updateData.skills = updates.skills;
                    changes.push(`skills: "${oldSkills}" → "${newSkills}"`);
                }
            }
            
            if (updates.field !== undefined && oldCandidate && oldCandidate.field !== updates.field) {
                updateData.interested_field = updates.field;
                changes.push(`field: "${oldCandidate.field}" → "${updates.field}"`);
            }
            if (updates.experience !== undefined && oldCandidate && oldCandidate.experience !== updates.experience) {
                updateData.years_of_experience = updates.experience;
                changes.push(`experience: "${oldCandidate.experience}" → "${updates.experience}"`);
            }
            if (updates.salary_range !== undefined && oldCandidate && oldCandidate.salary_range !== updates.salary_range) {
                updateData.salary_range = updates.salary_range;
                changes.push(`salary: "${oldCandidate.salary_range}" → "${updates.salary_range}"`);
            }
            if (updates.cv_url !== undefined && oldCandidate && oldCandidate.cv_url !== updates.cv_url) {
                updateData.cv_url = updates.cv_url;
                changes.push(`CV updated`);
            }
            if (updates.cv_text !== undefined && oldCandidate && oldCandidate.cv_text !== updates.cv_text) {
                updateData.cv_text = updates.cv_text;
                changes.push(`CV text updated`);
            }
            if (updates.willing_to_contact !== undefined && oldCandidate && oldCandidate.willing_to_contact !== updates.willing_to_contact) {
                updateData.willing_to_contact = updates.willing_to_contact;
                changes.push(`willing to contact: "${oldCandidate.willing_to_contact}" → "${updates.willing_to_contact}"`);
            }
            if (updates.avatar_url !== undefined && oldCandidate && oldCandidate.avatar_url !== updates.avatar_url) {
                updateData.avatar_url = updates.avatar_url;
                changes.push(`avatar updated`);
            }
            
            if (Object.keys(updateData).length === 0) {
                console.log(' No changes detected for candidate update');
                toast('No changes to update', {
                    icon: 'ℹ️',
                    duration: 3000,
                });
                return null;
            }

            console.log('📤 Updating candidate with data:', updateData);

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

            await logActivity('candidate_edit', `Updated candidate: ${updates.name || oldCandidate?.name || 'Unknown'}`, {
                candidate_name: updates.name || oldCandidate?.name || 'Unknown',
                candidate_id: id,
                changes: changes,
                changed_fields: changes.map(c => c.split(':')[0].trim()),
                old_values: oldCandidate ? {
                    name: oldCandidate.name,
                    email: oldCandidate.email,
                    phone: oldCandidate.phone,
                    field: oldCandidate.field,
                    experience: oldCandidate.experience,
                    status: oldCandidate.status,
                    availability: oldCandidate.availability,
                    salary_range: oldCandidate.salary_range,
                    skills: oldCandidate.skills
                } : null,
                action: 'update'
            });

            toast.success('Candidate updated successfully');
            await fetchCandidates();
            return data;
        } catch (err: any) {
            console.error('Update error:', err);
            toast.error('Failed to update candidate: ' + err.message);
            throw err;
        }
    };

    const deleteCandidate = async (id: string) => {
        try {
            const candidateToDelete = candidates.find(c => c.id === id);
            
            const { error } = await supabase
                .from('candidates')
                .delete()
                .eq('id', id);

            if (error) throw error;

            if (candidateToDelete) {
                await logActivity('candidate_edit', `Deleted candidate: ${candidateToDelete.name}`, {
                    candidate_name: candidateToDelete.name,
                    candidate_id: id,
                    candidate_email: candidateToDelete.email,
                    action: 'delete'
                });
            }

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
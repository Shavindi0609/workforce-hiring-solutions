// src/hooks/useSkills.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import type { Skill, CreateSkillDto, UpdateSkillDto, SkillStatistics } from '../types/skill';

export const useSkills = () => {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchSkills = useCallback(async (filters?: { search?: string; field?: string; status?: string }) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Fetching skills from Supabase...');
            
            let query = supabase
                .from('skills')
                .select('*', { count: 'exact' });

            if (filters?.search) {
                query = query.or(`name.ilike.%${filters.search}%,field.ilike.%${filters.search}%`);
            }
            if (filters?.field && filters.field !== 'All') {
                query = query.eq('field', filters.field);
            }
            if (filters?.status && filters.status !== 'All') {
                query = query.eq('status', filters.status);
            }

            query = query.order('candidates_count', { ascending: false });

            const { data, error: fetchError, count } = await query;

            console.log('📊 Fetch result:', { dataLength: data?.length, count, error: fetchError });

            if (fetchError) throw fetchError;
            
            setSkills(data || []);
            setTotalCount(count || 0);
            
        } catch (err: any) {
            console.error('❌ Fetch error:', err);
            setError(err.message);
            toast.error('Failed to fetch skills: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createSkill = async (skillData: CreateSkillDto) => {
        try {
            const { data, error } = await supabase
                .from('skills')
                .insert([{
                    ...skillData,
                    candidates_count: skillData.candidates_count || 0,
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success('Skill added successfully');
            await fetchSkills();
            return data;
        } catch (err: any) {
            console.error('Create error:', err);
            toast.error(err.message);
            throw err;
        }
    };

    const updateSkill = async (id: string, updates: UpdateSkillDto) => {
        try {
            const { data, error } = await supabase
                .from('skills')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            toast.success('Skill updated successfully');
            await fetchSkills();
            return data;
        } catch (err: any) {
            console.error('Update error:', err);
            toast.error(err.message);
            throw err;
        }
    };

    const deleteSkill = async (id: string) => {
        try {
            const { error } = await supabase
                .from('skills')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Skill deleted successfully');
            await fetchSkills();
        } catch (err: any) {
            console.error('Delete error:', err);
            toast.error(err.message);
            throw err;
        }
    };

    const getStatistics = useCallback((): SkillStatistics => {
        const total = skills.length;
        const active = skills.filter(s => s.status === 'Active').length;
        const inactive = skills.filter(s => s.status === 'Inactive').length;
        const totalCandidates = skills.reduce((sum, skill) => sum + (skill.candidates_count || 0), 0);
        
        const byField = skills.reduce((acc, skill) => {
            acc[skill.field] = (acc[skill.field] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        
        return {
            total,
            active,
            inactive,
            activePercentage: total ? (active / total) * 100 : 0,
            inactivePercentage: total ? (inactive / total) * 100 : 0,
            totalCandidates,
            byField,
        };
    }, [skills]);

    useEffect(() => {
        fetchSkills();
    }, [fetchSkills]);

    return {
        skills,
        loading,
        error,
        totalCount,
        createSkill,
        updateSkill,
        deleteSkill,
        fetchSkills,
        getStatistics,
    };
};
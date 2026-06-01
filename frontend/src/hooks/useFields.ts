// src/hooks/useFields.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import type { Field, CreateFieldDto, UpdateFieldDto, FieldStatistics } from '../types/field';

export const useFields = () => {
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchFields = useCallback(async (searchTerm?: string) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔍 Fetching fields from Supabase...');
            
            let query = supabase
                .from('fields')
                .select('*', { count: 'exact' });

            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
            }

            query = query.order('created_at', { ascending: false });

            const { data, error: fetchError, count } = await query;

            console.log('📊 Fetch result:', { dataLength: data?.length, count, error: fetchError });

            if (fetchError) throw fetchError;
            
            setFields(data || []);
            setTotalCount(count || 0);
            
        } catch (err: any) {
            console.error('❌ Fetch error:', err);
            setError(err.message);
            toast.error('Failed to fetch fields: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createField = async (fieldData: CreateFieldDto) => {
        try {
            const { data, error } = await supabase
                .from('fields')
                .insert([{
                    ...fieldData,
                    candidates_count: fieldData.candidates_count || 0,
                }])
                .select()
                .single();

            if (error) throw error;

            toast.success('Field added successfully');
            await fetchFields();
            return data;
        } catch (err: any) {
            console.error('Create error:', err);
            toast.error(err.message);
            throw err;
        }
    };

    const updateField = async (id: string, updates: UpdateFieldDto) => {
        try {
            const { data, error } = await supabase
                .from('fields')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            toast.success('Field updated successfully');
            await fetchFields();
            return data;
        } catch (err: any) {
            console.error('Update error:', err);
            toast.error(err.message);
            throw err;
        }
    };

    const deleteField = async (id: string) => {
        try {
            const { error } = await supabase
                .from('fields')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success('Field deleted successfully');
            await fetchFields();
        } catch (err: any) {
            console.error('Delete error:', err);
            toast.error(err.message);
            throw err;
        }
    };

    const getStatistics = useCallback((): FieldStatistics => {
        const total = fields.length;
        const active = fields.filter(f => f.status === 'Active').length;
        const inactive = fields.filter(f => f.status === 'Inactive').length;
        const totalCandidates = fields.reduce((sum, field) => sum + (field.candidates_count || 0), 0);
        
        return {
            total,
            active,
            inactive,
            activePercentage: total ? (active / total) * 100 : 0,
            inactivePercentage: total ? (inactive / total) * 100 : 0,
            totalCandidates,
        };
    }, [fields]);

    useEffect(() => {
        fetchFields();
    }, [fetchFields]);

    return {
        fields,
        loading,
        error,
        totalCount,
        createField,
        updateField,
        deleteField,
        fetchFields,
        getStatistics,
    };
};
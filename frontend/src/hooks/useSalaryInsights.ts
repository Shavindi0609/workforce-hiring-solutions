
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

export interface SalaryDistribution {
    field: string;
    min_salary: number;
    max_salary: number;
    candidate_count: number;
}

export interface SalaryOverview {
    avg_min_salary: number;
    avg_max_salary: number;
    highest_range: string;
    total_candidates: number;
}

export interface SalaryRangeDistribution {
    salary_range: string;
    candidate_count: number;
    percentage: number;
}

export interface SalaryByExperience {
    experience_level: string;
    avg_min_salary: number;
    avg_max_salary: number;
}

export const useSalaryInsights = () => {
    const [salaryDistribution, setSalaryDistribution] = useState<SalaryDistribution[]>([]);
    const [salaryOverview, setSalaryOverview] = useState<SalaryOverview>({
        avg_min_salary: 0,
        avg_max_salary: 0,
        highest_range: '0',
        total_candidates: 0
    });
    const [salaryRangeDistribution, setSalaryRangeDistribution] = useState<SalaryRangeDistribution[]>([]);
    const [salaryByExperience, setSalaryByExperience] = useState<SalaryByExperience[]>([]);
    const [loading, setLoading] = useState(true);
    const [error] = useState<string | null>(null);

    const fetchSalaryDistribution = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .rpc('get_salary_distribution_by_field');
            
            if (fetchError) throw fetchError;
            setSalaryDistribution(data || []);
        } catch (err: any) {
            console.error('Error fetching salary distribution:', err);
        }
    }, []);

    const fetchSalaryOverview = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .rpc('get_salary_overview');
            
            if (fetchError) throw fetchError;
            
            if (data && data[0]) {
                setSalaryOverview({
                    avg_min_salary: data[0].avg_min_salary || 0,
                    avg_max_salary: data[0].avg_max_salary || 0,
                    highest_range: data[0].highest_range || '0',
                    total_candidates: data[0].total_candidates || 0
                });
            }
        } catch (err: any) {
            console.error('Error fetching salary overview:', err);
        }
    }, []);

    const fetchSalaryRangeDistribution = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .rpc('get_salary_range_distribution');
            
            if (fetchError) throw fetchError;
            setSalaryRangeDistribution(data || []);
        } catch (err: any) {
            console.error('Error fetching salary range distribution:', err);
        }
    }, []);

    const fetchSalaryByExperience = useCallback(async () => {
        try {
            const { data, error: fetchError } = await supabase
                .rpc('get_salary_by_experience');
            
            if (fetchError) throw fetchError;
            setSalaryByExperience(data || []);
        } catch (err: any) {
            console.error('Error fetching salary by experience:', err);
        }
    }, []);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchSalaryDistribution(),
                fetchSalaryOverview(),
                fetchSalaryRangeDistribution(),
                fetchSalaryByExperience()
            ]);
            setLoading(false);
        };
        
        loadData();
    }, [fetchSalaryDistribution, fetchSalaryOverview, fetchSalaryRangeDistribution, fetchSalaryByExperience]);

    return {
        salaryDistribution,
        salaryOverview,
        salaryRangeDistribution,
        salaryByExperience,
        loading,
        error,
        refetch: () => {
            fetchSalaryDistribution();
            fetchSalaryOverview();
            fetchSalaryRangeDistribution();
            fetchSalaryByExperience();
        }
    };
};
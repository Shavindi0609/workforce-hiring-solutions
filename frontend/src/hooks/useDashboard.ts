// src/hooks/useDashboard.ts (updated)
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export interface DashboardData {
    totalCandidates: number;
    activelyLooking: number;
    openToOpportunities: number;
    fieldData: Array<{ name: string; v: number }>;
    availabilityData: Array<{ name: string; v: number }>;
    statusData: Array<{ name: string; v: number }>;
    salaryData: Array<{ range: string; v: number }>;
    skillsData: Array<{ name: string; v: number }>;
    recentCandidates: Array<{ 
        id: string; 
        name: string; 
        field: string; 
        status: string; 
        cv_url: string;
        created_at: string 
    }>;
}

export const useDashboard = () => {
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        totalCandidates: 0,
        activelyLooking: 0,
        openToOpportunities: 0,
        fieldData: [],
        availabilityData: [],
        statusData: [],
        salaryData: [],
        skillsData: [],
        recentCandidates: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📊 Fetching dashboard data...');
            
            // Fetch all candidates
            const { data: candidatesData, error: candidatesError } = await supabase
                .from('candidates')
                .select('*');
            
            if (candidatesError) throw candidatesError;
            
            const totalCandidates = candidatesData?.length || 0;
            const activelyLooking = candidatesData?.filter(c => c.status === 'Actively Looking').length || 0;
            const openToOpportunities = candidatesData?.filter(c => c.status === 'Open to Opportunities').length || 0;
            
            // Field statistics (using interested_field)
            const fieldMap = new Map<string, number>();
            candidatesData?.forEach(c => {
                if (c.interested_field) {
                    fieldMap.set(c.interested_field, (fieldMap.get(c.interested_field) || 0) + 1);
                }
            });
            
            const fieldStats = Array.from(fieldMap.entries())
                .map(([name, count]) => ({ name: name.substring(0, 15), v: count }))
                .sort((a, b) => b.v - a.v)
                .slice(0, 7);
            
            // Availability statistics
            const availabilityMap = new Map<string, number>();
            candidatesData?.forEach(c => {
                if (c.availability) {
                    availabilityMap.set(c.availability, (availabilityMap.get(c.availability) || 0) + 1);
                }
            });
            
            const availabilityStats = Array.from(availabilityMap.entries())
                .map(([name, count]) => ({ name, v: count }));
            
            // Skills statistics (unwind array)
            const skillsMap = new Map<string, number>();
            candidatesData?.forEach(c => {
                if (c.skills && Array.isArray(c.skills)) {
                    c.skills.forEach((skill: string) => {
                        const cleanSkill = skill.trim();
                        skillsMap.set(cleanSkill, (skillsMap.get(cleanSkill) || 0) + 1);
                    });
                }
            });
            
            const skillsStats = Array.from(skillsMap.entries())
                .map(([name, count]) => ({ name, v: count }))
                .sort((a, b) => b.v - a.v)
                .slice(0, 6);
            
            // Salary distribution (parse from salary_range string)
            const salaryRanges = [
                { range: '0-40K', pattern: /0-40|0 - 40/i },
                { range: '40K-60K', pattern: /40-60|40 - 60/i },
                { range: '60K-80K', pattern: /60-80|60 - 80/i },
                { range: '80K-100K', pattern: /80-100|80 - 100/i },
                { range: '100K-150K', pattern: /100-150|100 - 150/i },
                { range: '150K-200K', pattern: /150-200|150 - 200/i },
                { range: '200K+', pattern: /200/i }
            ];
            
            const salaryStats = salaryRanges.map(range => ({
                range: range.range,
                v: candidatesData?.filter(c => c.salary_range && range.pattern.test(c.salary_range)).length || 0
            }));
            
            // Recent candidates with id and cv_url
            const recentCandidates = candidatesData
                ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5)
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    field: c.interested_field,
                    status: c.status,
                    cv_url: c.cv_url,
                    created_at: c.created_at
                })) || [];
            
            setDashboardData({
                totalCandidates,
                activelyLooking,
                openToOpportunities,
                fieldData: fieldStats,
                availabilityData: availabilityStats,
                statusData: [
                    { name: 'Actively Looking', v: activelyLooking },
                    { name: 'Open to Opportunities', v: openToOpportunities }
                ],
                salaryData: salaryStats,
                skillsData: skillsStats,
                recentCandidates
            });
            
            console.log('✅ Dashboard data fetched successfully');
            
        } catch (err: any) {
            console.error('❌ Dashboard fetch error:', err);
            setError(err.message);
            toast.error('Failed to fetch dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return {
        dashboardData,
        loading,
        error,
        refetch: fetchDashboardData
    };
};
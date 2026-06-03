// src/hooks/useSettings.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import type { Settings, UpdateSettingsDto } from '../types/settings';

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>({
        company_name: '',
        company_email: '',
        company_phone: '',
        time_zone: '',
        date_format: '',
        currency: '',
        items_per_page: 10
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch settings from database
    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const { data, error: fetchError } = await supabase
                .rpc('get_settings');
            
            if (fetchError) throw fetchError;
            
            if (data && data[0]) {
                setSettings({
                    company_name: data[0].company_name || '',
                    company_email: data[0].company_email || '',
                    company_phone: data[0].company_phone || '',
                    time_zone: data[0].time_zone || '',
                    date_format: data[0].date_format || '',
                    currency: data[0].currency || '',
                    items_per_page: data[0].items_per_page || 10
                });
            }
        } catch (err: any) {
            console.error('Error fetching settings:', err);
            setError(err.message);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }, []);

    // Update settings
    const updateSettings = useCallback(async (settingsData: UpdateSettingsDto) => {
        try {
            setSaving(true);
            setError(null);
            
            const { error: updateError } = await supabase
                .rpc('update_settings', {
                    p_company_name: settingsData.company_name,
                    p_company_email: settingsData.company_email,
                    p_company_phone: settingsData.company_phone,
                    p_time_zone: settingsData.time_zone,
                    p_date_format: settingsData.date_format,
                    p_currency: settingsData.currency,
                    p_items_per_page: settingsData.items_per_page
                });
            
            if (updateError) throw updateError;
            
            // Update local state
            setSettings(settingsData);
            toast.success('Settings saved successfully!');
            
        } catch (err: any) {
            console.error('Error updating settings:', err);
            setError(err.message);
            toast.error('Failed to save settings');
            throw err;
        } finally {
            setSaving(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        saving,
        error,
        updateSettings,
        refetch: fetchSettings
    };
};
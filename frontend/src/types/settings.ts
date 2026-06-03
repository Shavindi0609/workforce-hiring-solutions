// src/types/settings.ts
export interface Settings {
    id?: string;
    company_name: string;
    company_email: string;
    company_phone: string;
    time_zone: string;
    date_format: string;
    currency: string;
    items_per_page: number;
    updated_at?: string;
    updated_by?: string;
}

export interface UpdateSettingsDto {
    company_name: string;
    company_email: string;
    company_phone: string;
    time_zone: string;
    date_format: string;
    currency: string;
    items_per_page: number;
}
// src/types/field.ts
export interface Field {
    id: string;
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    candidates_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateFieldDto {
    name: string;
    description: string;
    status: 'Active' | 'Inactive';
    candidates_count?: number;
}

export interface UpdateFieldDto extends Partial<CreateFieldDto> {
    id?: string;
}

export interface FieldStatistics {
    total: number;
    active: number;
    inactive: number;
    activePercentage: number;
    inactivePercentage: number;
    totalCandidates: number;
}
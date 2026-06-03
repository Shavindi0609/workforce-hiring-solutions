// src/types/skill.ts
export interface Skill {
    id: string;
    name: string;
    field: string;
    candidates_count: number;
    status: 'Active' | 'Inactive';
    created_at: string;
    updated_at: string;
}

export interface CreateSkillDto {
    name: string;
    field: string;
    candidates_count?: number;
    status?: 'Active' | 'Inactive';
}

export interface UpdateSkillDto extends Partial<CreateSkillDto> {
    id?: string;
}

export interface SkillStatistics {
    total: number;
    active: number;
    inactive: number;
    activePercentage: number;
    inactivePercentage: number;
    totalCandidates: number;
    byField: Record<string, number>;
}
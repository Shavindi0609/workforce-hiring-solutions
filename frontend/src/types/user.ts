// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Active' | 'Inactive';
  last_login: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: string;
  status?: 'Active' | 'Inactive';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
  status?: 'Active' | 'Inactive';
}
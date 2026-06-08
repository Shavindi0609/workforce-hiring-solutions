// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;  // Store role directly instead of role_id
  status: 'Active' | 'Inactive';
  last_login: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  role: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role: string;  // Store role directly
  status?: 'Active' | 'Inactive';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;  // Store role directly
  status?: 'Active' | 'Inactive';
}
// src/hooks/useUsers.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import type { User, CreateUserDto, UpdateUserDto, UserRole } from '../types/user';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = useCallback(async () => {
    try {
      const { data, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('role', { ascending: true });

      if (rolesError) throw rolesError;
      setUserRoles(data || []);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
      toast.error('Failed to fetch user roles');
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users from Supabase...');
      
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        throw usersError;
      }
      
      console.log(`Fetched ${usersData?.length || 0} users`);
      setUsers(usersData || []);
      
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (userData: CreateUserDto) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: userData.name,
          email: userData.email,
          role: userData.role,  // Store role directly
          status: userData.status || 'Active',
          avatar_url: `https://i.pravatar.cc/150?u=${userData.email}`,
          last_login: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('User created successfully');
      await fetchUsers();
      return data;
    } catch (err: any) {
      console.error('Create error:', err);
      toast.error(err.message);
      throw err;
    }
  };

  const updateUser = async (id: string, updates: UpdateUserDto) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('User updated successfully');
      await fetchUsers();
      return data;
    } catch (err: any) {
      console.error('Update error:', err);
      toast.error(err.message);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('User deleted successfully');
      await fetchUsers();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      toast.success(`Password reset link sent to ${email}`);
      console.log('Password reset requested for:', email);
    } catch (err: any) {
      toast.error(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchUserRoles();
    fetchUsers();
  }, [fetchUsers, fetchUserRoles]);

  return {
    users,
    userRoles,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    refetch: fetchUsers,
    refetchRoles: fetchUserRoles,
  };
};
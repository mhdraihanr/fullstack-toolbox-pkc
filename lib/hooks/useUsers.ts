'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { User, ApiResponse, PaginatedResponse } from '@/types';

interface UseUsersOptions {
  page?: number;
  limit?: number;
  role?: string;
  department?: string;
  search?: string;
  autoRefresh?: boolean;
  clientSideSearch?: boolean;
}

interface UseUsersReturn {
  users: User[];
  allUsers: User[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  getUserById: (id: string) => User | undefined;
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const {
    page = 1,
    limit = 10,
    role,
    department,
    search,
    autoRefresh = false,
    clientSideSearch = true
  } = options;

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Client-side filtering
  const filteredUsers = useMemo(() => {
    if (!clientSideSearch) return allUsers;

    let filtered = [...allUsers];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.department?.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
      );
    }

    if (role) {
      filtered = filtered.filter(user => user.role === role);
    }

    if (department) {
      filtered = filtered.filter(user => user.department === department);
    }

    return filtered;
  }, [allUsers, search, role, department, clientSideSearch]);

  // Get the users to return (either filtered or all)
  const users = clientSideSearch ? filteredUsers : allUsers;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      
      if (!clientSideSearch) {
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        if (role) params.append('role', role);
        if (department) params.append('department', department);
      }

      const response = await fetch(`/api/users?${params.toString()}`);
      const result: ApiResponse<PaginatedResponse<User>> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch users');
      }

      if (result.data && result.data.data) {
        setAllUsers(Array.isArray(result.data.data) ? result.data.data : []);
        setPagination(result.data.pagination);
      } else {
        setAllUsers([]);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, role, department, clientSideSearch]);

  const getUserById = useCallback((id: string): User | undefined => {
    return allUsers.find(user => user.id === id);
  }, [allUsers]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchUsers();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchUsers]);

  return {
    users,
    allUsers,
    loading,
    error,
    pagination,
    refetch: fetchUsers,
    getUserById
  };
}
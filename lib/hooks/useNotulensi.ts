'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Notulensi, NotulensiFormData, ApiResponse, PaginatedResponse } from '@/types';

interface UseNotulensiOptions {
  page?: number;
  limit?: number;
  approved?: boolean;
  created_by?: string;
  meeting_id?: string;
  search?: string;
  is_draft?: boolean;
  date_from?: string;
  date_to?: string;
  autoRefresh?: boolean;
  clientSideSearch?: boolean;
}

interface UseNotulensiReturn {
  notulensi: Notulensi[];
  allNotulensi: Notulensi[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  createNotulensi: (notulensiData: NotulensiFormData & { meeting_id: string; is_draft?: boolean }) => Promise<Notulensi | null>;
  updateNotulensi: (id: string, updates: Partial<NotulensiFormData> & { is_draft?: boolean; approved_by?: string; approved_at?: string | null }) => Promise<Notulensi | null>;
  deleteNotulensi: (id: string) => Promise<boolean>;
  approveNotulensi: (id: string) => Promise<Notulensi | null>;
  unapproveNotulensi: (id: string) => Promise<Notulensi | null>;
  exportToPDF: (id: string) => Promise<boolean>;
}

export function useNotulensi(options: UseNotulensiOptions = {}): UseNotulensiReturn {
  const {
    page = 1,
    limit = 10,
    approved,
    created_by,
    meeting_id,
    search,
    is_draft,
    date_from,
    date_to,
    autoRefresh = false,
    clientSideSearch = true
  } = options;

  const [allNotulensi, setAllNotulensi] = useState<Notulensi[]>([]);
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

  // Client-side filtering for search and other filters
  const filteredNotulensi = useMemo(() => {
    if (!clientSideSearch) {
      return allNotulensi;
    }

    let filtered = [...allNotulensi];

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(notulensi => 
        notulensi.content.toLowerCase().includes(searchLower) ||
        notulensi.decisions.some(decision => decision.toLowerCase().includes(searchLower)) ||
        notulensi.meeting?.title?.toLowerCase().includes(searchLower) ||
        notulensi.creator?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (date_from) {
      filtered = filtered.filter(notulensi => 
        new Date(notulensi.created_at) >= new Date(date_from)
      );
    }

    if (date_to) {
      filtered = filtered.filter(notulensi => 
        new Date(notulensi.created_at) <= new Date(date_to)
      );
    }

    return filtered;
  }, [allNotulensi, search, date_from, date_to, clientSideSearch]);

  // Get the notulensi to return (either filtered or all)
  const notulensi = clientSideSearch ? filteredNotulensi : allNotulensi;

  const fetchNotulensi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For client-side search, only fetch with non-search filters
      const params = new URLSearchParams({
        page: clientSideSearch ? '1' : page.toString(),
        limit: clientSideSearch ? '1000' : limit.toString()
      });

      // Only add server-side filters when not using client-side search
      if (!clientSideSearch) {
        if (approved !== undefined) params.append('approved', approved.toString());
        if (created_by) params.append('created_by', created_by);
        if (meeting_id) params.append('meeting_id', meeting_id);
        if (search) params.append('search', search);
        if (is_draft !== undefined) params.append('is_draft', is_draft.toString());
        if (date_from) params.append('date_from', date_from);
        if (date_to) params.append('date_to', date_to);
      } else {
        // For client-side search, only apply non-search filters to server
        if (approved !== undefined) params.append('approved', approved.toString());
        if (created_by) params.append('created_by', created_by);
        if (meeting_id) params.append('meeting_id', meeting_id);
        if (is_draft !== undefined) params.append('is_draft', is_draft.toString());
      }

      const response = await fetch(`/api/notulensi?${params.toString()}`);
      const result: ApiResponse<PaginatedResponse<Notulensi>> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch notulensi');
      }

      if (result.data && result.data.data) {
        setAllNotulensi(Array.isArray(result.data.data) ? result.data.data : []);
        setPagination(result.data.pagination);
      } else {
        setAllNotulensi([]);
      }
    } catch (err) {
      console.error('Error fetching notulensi:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, limit, approved, created_by, meeting_id, search, is_draft, date_from, date_to, clientSideSearch]);

  const createNotulensi = async (notulensiData: NotulensiFormData & { meeting_id: string; is_draft?: boolean }): Promise<Notulensi | null> => {
    try {
      const response = await fetch('/api/notulensi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notulensiData)
      });

      const result: ApiResponse<Notulensi> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create notulensi');
      }

      if (result.success && result.data) {
        // Refresh notulensi list
        await fetchNotulensi();
        return result.data;
      }

      throw new Error(result.error || 'Failed to create notulensi');
    } catch (err) {
      console.error('Error creating notulensi:', err);
      setError(err instanceof Error ? err.message : 'Failed to create notulensi');
      return null;
    }
  };

  const updateNotulensi = async (id: string, updates: Partial<NotulensiFormData> & { is_draft?: boolean; approved_by?: string; approved_at?: string | null }): Promise<Notulensi | null> => {
    try {
      const response = await fetch(`/api/notulensi/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result: ApiResponse<Notulensi> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update notulensi');
      }

      if (result.success && result.data) {
        // Update local state
        setAllNotulensi(prev => prev.map(notulensi => 
          notulensi.id === id ? result.data! : notulensi
        ));
        return result.data;
      }

      throw new Error(result.error || 'Failed to update notulensi');
    } catch (err) {
      console.error('Error updating notulensi:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notulensi');
      return null;
    }
  };

  const deleteNotulensi = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notulensi/${id}`, {
        method: 'DELETE'
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete notulensi');
      }

      if (result.success) {
        // Remove from local state
        setAllNotulensi(prev => prev.filter(notulensi => notulensi.id !== id));
        return true;
      }

      throw new Error(result.error || 'Failed to delete notulensi');
    } catch (err) {
      console.error('Error deleting notulensi:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notulensi');
      return false;
    }
  };

  const approveNotulensi = async (id: string): Promise<Notulensi | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      return await updateNotulensi(id, {
        approved_by: user.id,
        approved_at: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error approving notulensi:', err);
      setError(err instanceof Error ? err.message : 'Failed to approve notulensi');
      return null;
    }
  };

  const unapproveNotulensi = async (id: string): Promise<Notulensi | null> => {
    try {
      return await updateNotulensi(id, {
        approved_by: undefined,
        approved_at: null
      });
    } catch (err) {
      console.error('Error unapproving notulensi:', err);
      setError(err instanceof Error ? err.message : 'Failed to unapprove notulensi');
      return null;
    }
  };

  const exportToPDF = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/notulensi/${id}/export`);
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to export PDF');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'notulensi.pdf';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      console.error('Error exporting PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to export PDF');
      return false;
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchNotulensi();
  }, [fetchNotulensi]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchNotulensi, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, fetchNotulensi]);

  return {
    notulensi,
    allNotulensi,
    loading,
    error,
    pagination,
    refetch: fetchNotulensi,
    createNotulensi,
    updateNotulensi,
    deleteNotulensi,
    approveNotulensi,
    unapproveNotulensi,
    exportToPDF
  };
}
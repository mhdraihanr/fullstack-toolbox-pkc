'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Meeting, MeetingFormData, ApiResponse, PaginatedResponse } from '@/types';

interface UseMeetingsOptions {
  page?: number;
  limit?: number;
  status?: string;
  meeting_type?: string;
  created_by?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  autoRefresh?: boolean;
  clientSideSearch?: boolean;
}

interface UseMeetingsReturn {
  meetings: Meeting[];
  allMeetings: Meeting[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  createMeeting: (meetingData: MeetingFormData) => Promise<Meeting | null>;
  updateMeeting: (id: string, updates: Partial<MeetingFormData> & { status?: string }) => Promise<Meeting | null>;
  updateMeetingStatus: (id: string, status: Meeting['status']) => Promise<Meeting | null>;
  deleteMeeting: (id: string) => Promise<boolean>;
}

export function useMeetings(options: UseMeetingsOptions = {}): UseMeetingsReturn {
  const {
    page = 1,
    limit = 10,
    status,
    meeting_type,
    created_by,
    search,
    date_from,
    date_to,
    autoRefresh = false,
    clientSideSearch = true
  } = options;

  const [allMeetings, setAllMeetings] = useState<Meeting[]>([]);
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
  const filteredMeetings = useMemo(() => {
    if (!clientSideSearch) {
      return allMeetings;
    }

    let filtered = [...allMeetings];

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(meeting => 
        meeting.title.toLowerCase().includes(searchLower) ||
        meeting.description?.toLowerCase().includes(searchLower) ||
        meeting.location?.toLowerCase().includes(searchLower) ||
        meeting.agenda.some(item => item.toLowerCase().includes(searchLower)) ||
        meeting.creator?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply date range filter
    if (date_from) {
      filtered = filtered.filter(meeting => 
        new Date(meeting.date_time) >= new Date(date_from)
      );
    }

    if (date_to) {
      filtered = filtered.filter(meeting => 
        new Date(meeting.date_time) <= new Date(date_to)
      );
    }

    return filtered;
  }, [allMeetings, search, date_from, date_to, clientSideSearch]);

  // Get the meetings to return (either filtered or all)
  const meetings = clientSideSearch ? filteredMeetings : allMeetings;

  const fetchMeetings = useCallback(async () => {
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
        if (status) params.append('status', status);
        if (meeting_type) params.append('meeting_type', meeting_type);
        if (created_by) params.append('created_by', created_by);
        if (search) params.append('search', search);
        if (date_from) params.append('date_from', date_from);
        if (date_to) params.append('date_to', date_to);
      } else {
        // For client-side search, only apply non-search filters to server
        if (status) params.append('status', status);
        if (meeting_type) params.append('meeting_type', meeting_type);
        if (created_by) params.append('created_by', created_by);
      }

      const response = await fetch(`/api/meetings?${params.toString()}`);
      const result: ApiResponse<PaginatedResponse<Meeting>> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch meetings');
      }

      if (result.data && result.data.data) {
        setAllMeetings(Array.isArray(result.data.data) ? result.data.data : []);
        setPagination(result.data.pagination);
      } else {
        setAllMeetings([]);
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, meeting_type, created_by, search, date_from, date_to, clientSideSearch]);

  const createMeeting = async (meetingData: MeetingFormData): Promise<Meeting | null> => {
    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(meetingData)
      });

      const result: ApiResponse<Meeting> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create meeting');
      }

      if (result.success && result.data) {
        // Refresh meetings list
        await fetchMeetings();
        return result.data;
      }

      throw new Error(result.error || 'Failed to create meeting');
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
      return null;
    }
  };

  const updateMeeting = async (id: string, updates: Partial<MeetingFormData> & { status?: string }): Promise<Meeting | null> => {
    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result: ApiResponse<Meeting> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update meeting');
      }

      if (result.success && result.data) {
        // Update local state
        setAllMeetings(prev => prev.map(meeting => 
          meeting.id === id ? result.data! : meeting
        ));
        return result.data;
      }

      throw new Error(result.error || 'Failed to update meeting');
    } catch (err) {
      console.error('Error updating meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to update meeting');
      return null;
    }
  };

  const updateMeetingStatus = async (id: string, status: Meeting['status']): Promise<Meeting | null> => {
    return updateMeeting(id, { status });
  };

  const deleteMeeting = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/meetings/${id}`, {
        method: 'DELETE'
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete meeting');
      }

      if (result.success) {
        // Remove from local state
        setAllMeetings(prev => prev.filter(meeting => meeting.id !== id));
        return true;
      }

      throw new Error(result.error || 'Failed to delete meeting');
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete meeting');
      return false;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMeetings();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchMeetings]);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('meetings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meetings'
        },
        () => {
          fetchMeetings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchMeetings]);

  return {
    meetings,
    allMeetings,
    loading,
    error,
    pagination,
    refetch: fetchMeetings,
    createMeeting,
    updateMeeting,
    updateMeetingStatus,
    deleteMeeting
  };
}
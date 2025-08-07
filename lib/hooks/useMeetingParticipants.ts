'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { MeetingParticipant, ApiResponse } from '@/types';

interface UseMeetingParticipantsOptions {
  meetingId: string;
  autoRefresh?: boolean;
}

interface UseMeetingParticipantsReturn {
  participants: MeetingParticipant[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addParticipants: (userIds: string[], status?: string) => Promise<MeetingParticipant[] | null>;
  updateParticipantStatus: (userId: string, status: MeetingParticipant['status']) => Promise<MeetingParticipant | null>;
  removeParticipant: (userId: string) => Promise<boolean>;
  getParticipantByUserId: (userId: string) => MeetingParticipant | undefined;
  isUserParticipant: (userId: string) => boolean;
  getParticipantsByStatus: (status: MeetingParticipant['status']) => MeetingParticipant[];
}

export function useMeetingParticipants(options: UseMeetingParticipantsOptions): UseMeetingParticipantsReturn {
  const { meetingId, autoRefresh = false } = options;

  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchParticipants = useCallback(async () => {
    if (!meetingId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/meetings/${meetingId}/participants`);
      const result: ApiResponse<MeetingParticipant[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch participants');
      }

      if (result.success && result.data) {
        setParticipants(result.data);
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  const addParticipants = async (userIds: string[], status = 'invited'): Promise<MeetingParticipant[] | null> => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_ids: userIds, status })
      });

      const result: ApiResponse<MeetingParticipant[]> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add participants');
      }

      if (result.success && result.data) {
        // Refresh participants list
        await fetchParticipants();
        return result.data;
      }

      throw new Error(result.error || 'Failed to add participants');
    } catch (err) {
      console.error('Error adding participants:', err);
      setError(err instanceof Error ? err.message : 'Failed to add participants');
      return null;
    }
  };

  const updateParticipantStatus = async (userId: string, status: MeetingParticipant['status']): Promise<MeetingParticipant | null> => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/participants/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const result: ApiResponse<MeetingParticipant> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update participant status');
      }

      if (result.success && result.data) {
        // Update local state
        setParticipants(prev => prev.map(participant => 
          participant.user_id === userId ? result.data! : participant
        ));
        return result.data;
      }

      throw new Error(result.error || 'Failed to update participant status');
    } catch (err) {
      console.error('Error updating participant status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update participant status');
      return null;
    }
  };

  const removeParticipant = async (userId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/participants/${userId}`, {
        method: 'DELETE'
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove participant');
      }

      if (result.success) {
        // Remove from local state
        setParticipants(prev => prev.filter(participant => participant.user_id !== userId));
        return true;
      }

      throw new Error(result.error || 'Failed to remove participant');
    } catch (err) {
      console.error('Error removing participant:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove participant');
      return false;
    }
  };

  const getParticipantByUserId = useCallback((userId: string): MeetingParticipant | undefined => {
    return participants.find(participant => participant.user_id === userId);
  }, [participants]);

  const isUserParticipant = useCallback((userId: string): boolean => {
    return participants.some(participant => participant.user_id === userId);
  }, [participants]);

  const getParticipantsByStatus = useCallback((status: MeetingParticipant['status']): MeetingParticipant[] => {
    return participants.filter(participant => participant.status === status);
  }, [participants]);

  // Initial fetch
  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchParticipants();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchParticipants]);

  // Real-time subscriptions
  useEffect(() => {
    if (!meetingId) return;

    const channel = supabase
      .channel(`meeting-participants-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_participants',
          filter: `meeting_id=eq.${meetingId}`
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, meetingId, fetchParticipants]);

  return {
    participants,
    loading,
    error,
    refetch: fetchParticipants,
    addParticipants,
    updateParticipantStatus,
    removeParticipant,
    getParticipantByUserId,
    isUserParticipant,
    getParticipantsByStatus
  };
}
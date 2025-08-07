'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { MeetingAttendance, ApiResponse } from '@/types';

interface UseMeetingAttendanceOptions {
  meetingId: string;
  autoRefresh?: boolean;
}

interface AttendanceData {
  meeting: {
    id: string;
    title: string;
    date_time: string;
  };
  attendance: MeetingAttendance[];
}

interface CheckInData {
  user_id?: string;
  check_in_method?: 'qr_code' | 'manual' | 'auto';
  location_lat?: number;
  location_lng?: number;
  device_info?: string;
}

interface UseMeetingAttendanceReturn {
  attendance: MeetingAttendance[];
  meeting: AttendanceData['meeting'] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  checkIn: (data?: CheckInData) => Promise<MeetingAttendance | null>;
  isUserCheckedIn: (userId: string) => boolean;
  getUserAttendance: (userId: string) => MeetingAttendance | undefined;
  getAttendanceStats: () => {
    totalAttended: number;
    totalParticipants: number;
    attendanceRate: number;
    checkInMethods: Record<string, number>;
  };
}

export function useMeetingAttendance(options: UseMeetingAttendanceOptions): UseMeetingAttendanceReturn {
  const { meetingId, autoRefresh = false } = options;

  const [attendance, setAttendance] = useState<MeetingAttendance[]>([]);
  const [meeting, setMeeting] = useState<AttendanceData['meeting'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const fetchAttendance = useCallback(async () => {
    if (!meetingId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/meetings/${meetingId}/attendance`);
      const result: ApiResponse<AttendanceData> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch attendance');
      }

      if (result.success && result.data) {
        setAttendance(result.data.attendance);
        setMeeting(result.data.meeting);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  const checkIn = async (data: CheckInData = {}): Promise<MeetingAttendance | null> => {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          check_in_method: 'manual',
          ...data
        })
      });

      const result: ApiResponse<MeetingAttendance> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to check in');
      }

      if (result.success && result.data) {
        // Add to local state
        setAttendance(prev => [...prev, result.data!]);
        return result.data;
      }

      throw new Error(result.error || 'Failed to check in');
    } catch (err) {
      console.error('Error checking in:', err);
      setError(err instanceof Error ? err.message : 'Failed to check in');
      return null;
    }
  };

  const isUserCheckedIn = useCallback((userId: string): boolean => {
    return attendance.some(record => record.user_id === userId);
  }, [attendance]);

  const getUserAttendance = useCallback((userId: string): MeetingAttendance | undefined => {
    return attendance.find(record => record.user_id === userId);
  }, [attendance]);

  const getAttendanceStats = useCallback(() => {
    const totalAttended = attendance.length;
    
    // Get total participants from the meeting (this would need to be fetched separately)
    // For now, we'll use a placeholder or could be passed as an option
    const totalParticipants = totalAttended; // This should be updated to get actual participant count
    
    const attendanceRate = totalParticipants > 0 ? (totalAttended / totalParticipants) * 100 : 0;
    
    const checkInMethods = attendance.reduce((acc, record) => {
      const method = record.check_in_method || 'manual';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAttended,
      totalParticipants,
      attendanceRate,
      checkInMethods
    };
  }, [attendance]);

  // Initial fetch
  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAttendance();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchAttendance]);

  // Real-time subscriptions
  useEffect(() => {
    if (!meetingId) return;

    const channel = supabase
      .channel(`meeting-attendance-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_attendance',
          filter: `meeting_id=eq.${meetingId}`
        },
        () => {
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, meetingId, fetchAttendance]);

  return {
    attendance,
    meeting,
    loading,
    error,
    refetch: fetchAttendance,
    checkIn,
    isUserCheckedIn,
    getUserAttendance,
    getAttendanceStats
  };
}
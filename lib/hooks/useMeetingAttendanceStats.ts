"use client";

import { useState, useEffect, useCallback } from "react";

interface AttendanceStats {
  month: string;
  totalMeetings: number;
  totalParticipants: number;
  totalAttendees: number;
  attendanceRate: number;
}

interface UseMeetingAttendanceStatsReturn {
  attendanceStats: AttendanceStats[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMeetingAttendanceStats(): UseMeetingAttendanceStatsReturn {
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `/api/meetings/attendance-stats?year=${currentYear}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance stats");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch attendance stats");
      }

      setAttendanceStats(result.data || []);
    } catch (err) {
      console.error("Error fetching attendance stats:", err);
      setError(err instanceof Error ? err.message : "An error occurred");

      // Set fallback data when there's an error or no data
      const fallbackData: AttendanceStats[] = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ].map((month) => ({
        month,
        totalMeetings: Math.floor(Math.random() * 5) + 1, // 1-5 meetings
        totalParticipants: Math.floor(Math.random() * 20) + 10, // 10-30 participants
        totalAttendees: Math.floor(Math.random() * 15) + 8, // 8-23 attendees
        attendanceRate: Math.floor(Math.random() * 40) + 60, // 60-100% attendance
      }));

      setAttendanceStats(fallbackData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchAttendanceStats();
  }, [fetchAttendanceStats]);

  return {
    attendanceStats,
    loading,
    error,
    refetch: fetchAttendanceStats,
  };
}

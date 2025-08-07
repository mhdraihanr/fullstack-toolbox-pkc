import {
  User,
  Task,
  Meeting,
  Notulensi,
  Notification,
  MeetingParticipant,
  ActionItem,
  MeetingFilters,
  ApiResponse,
  PaginatedResponse,
} from "../../types";

// Mock Users (keeping for compatibility)
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Ahmad Suryadi",
    role: "admin",
    department: "IT",
    avatar_url: "/avatars/admin.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    role: "manager",
    department: "Produksi",
    avatar_url: "/avatars/manager.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Budi Santoso",
    role: "employee",
    department: "Produksi",
    avatar_url: "/avatars/employee1.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Dewi Lestari",
    role: "employee",
    department: "QC",
    avatar_url: "/avatars/employee2.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name: "Rudi Hermawan",
    role: "employee",
    department: "Maintenance",
    avatar_url: "/avatars/employee3.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Export users function
export function getUsers() {
  return mockUsers;
}

// Helper function to get user by ID
export function getUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id);
}

// API-based functions for meetings
export async function getMeetingsWithUsers(options?: {
  page?: number;
  limit?: number;
  status?: string;
  meeting_type?: string;
  created_by?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}): Promise<PaginatedResponse<Meeting>> {
  try {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.status) params.append("status", options.status);
    if (options?.meeting_type)
      params.append("meeting_type", options.meeting_type);
    if (options?.created_by) params.append("created_by", options.created_by);
    if (options?.search) params.append("search", options.search);
    if (options?.date_from) params.append("date_from", options.date_from);
    if (options?.date_to) params.append("date_to", options.date_to);

    const response = await fetch(`/api/meetings?${params.toString()}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch meetings");
    }

    return {
      data: result.data?.data || [],
      pagination: result.data?.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return {
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
  }
}

export async function addMeeting(
  meetingData: Omit<Meeting, "id" | "created_at" | "updated_at">,
  participantIds: string[] = []
): Promise<Meeting | null> {
  try {
    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...meetingData,
        participant_ids: participantIds,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to create meeting");
    }

    return result.data || null;
  } catch (error) {
    console.error("Error creating meeting:", error);
    return null;
  }
}

export async function updateMeeting(
  meetingId: string,
  meetingData: Partial<Meeting>,
  participants: string[] = []
): Promise<Meeting | null> {
  try {
    const response = await fetch(`/api/meetings/${meetingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...meetingData,
        participant_ids: participants,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to update meeting");
    }

    return result.data || null;
  } catch (error) {
    console.error("Error updating meeting:", error);
    return null;
  }
}

export async function deleteMeeting(meetingId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/meetings/${meetingId}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to delete meeting");
    }

    return result.success || false;
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return false;
  }
}

export async function getMeetingById(
  meetingId: string
): Promise<Meeting | null> {
  try {
    const response = await fetch(`/api/meetings/${meetingId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to fetch meeting");
    }

    return result.data || null;
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return null;
  }
}

// Update meeting status
export async function updateMeetingStatus(
  meetingId: string,
  newStatus: Meeting["status"],
  participants: string[]
): Promise<Meeting | null> {
  return updateMeeting(meetingId, { status: newStatus }, participants);
}

// Get meetings with filters
export async function getFilteredMeetings(
  filters: MeetingFilters
): Promise<PaginatedResponse<Meeting>> {
  const options: {
    status?: string;
    meeting_type?: string;
    created_by?: string;
  } = {};

  if (filters.status && filters.status.length > 0) {
    options.status = filters.status.join(",");
  }

  if (filters.meeting_type && filters.meeting_type.length > 0) {
    options.meeting_type = filters.meeting_type.join(",");
  }

  if (filters.created_by) {
    options.created_by = filters.created_by;
  }

  return getMeetingsWithUsers(options);
}

// Get upcoming meetings
export async function getUpcomingMeetings(
  limit: number = 5
): Promise<Meeting[]> {
  const now = new Date().toISOString();
  const result = await getMeetingsWithUsers({
    limit,
    date_from: now,
  });

  return result.data.sort(
    (a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
  );
}

// Note: getMeetingsWithUsersSync has been removed. Use getMeetingsWithUsers() instead for API-based data.

// Get past meetings
export async function getPastMeetings(limit: number = 5): Promise<Meeting[]> {
  const now = new Date().toISOString();
  const result = await getMeetingsWithUsers({
    limit,
    date_to: now,
  });

  return result.data.sort(
    (a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()
  );
}

// Get meetings by user
export async function getMeetingsByUser(userId: string): Promise<Meeting[]> {
  const result = await getMeetingsWithUsers({
    created_by: userId,
  });

  return result.data;
}

// Get meeting statistics
export async function getMeetingStats() {
  const result = await getMeetingsWithUsers({ limit: 1000 }); // Get all meetings for stats
  const meetings = result.data;

  const stats = {
    total: meetings.length,
    scheduled: meetings.filter((m) => m.status === "scheduled").length,
    inProgress: meetings.filter((m) => m.status === "in-progress").length,
    completed: meetings.filter((m) => m.status === "completed").length,
    cancelled: meetings.filter((m) => m.status === "cancelled").length,
    onsite: meetings.filter((m) => m.meeting_type === "onsite").length,
    virtual: meetings.filter((m) => m.meeting_type === "virtual").length,
    hybrid: meetings.filter((m) => m.meeting_type === "hybrid").length,
  };

  return stats;
}

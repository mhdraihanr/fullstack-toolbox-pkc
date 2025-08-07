// User Types
export interface User {
  id: string;
  name: string;
  role: "admin" | "manager" | "employee";
  department?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignee_id?: string;
  assignee?: User;
  created_by: string;
  creator?: User;
  due_date?: string;
  completed_at?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

// Meeting Types
export interface Meeting {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  duration: number;
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  location?: string;
  meeting_type: "onsite" | "virtual" | "hybrid";
  meeting_link?: string;
  qr_code_url?: string;
  qr_code_expires_at?: string;
  created_by: string;
  creator?: User;
  agenda: string[];
  participants?: MeetingParticipant[];
  attendance?: MeetingAttendance[];
  created_at: string;
  updated_at: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  user?: User;
  status: "invited" | "accepted" | "declined" | "tentative";
  created_at: string;
}

export interface MeetingAttendance {
  id: string;
  meeting_id: string;
  user_id: string;
  user?: User;
  checked_in_at: string;
  check_in_method: "qr_code" | "manual" | "auto";
  location_lat?: number;
  location_lng?: number;
  device_info?: string;
}

// Notulensi Types
export interface Notulensi {
  id: string;
  meeting_id: string;
  meeting?: Meeting;
  content: string;
  decisions: string[];
  next_meeting_date?: string;
  created_by: string;
  creator?: User;
  approved_by?: string;
  approver?: User;
  approved_at?: string;
  action_items?: ActionItem[];
  is_draft?: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  notulensi_id: string;
  description: string;
  assignee_id?: string;
  assignee?: User;
  due_date?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  completed_at?: string;
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  type: "task" | "meeting" | "reminder" | "system";
  title: string;
  message: string;
  read: boolean;
  data?: string;
  created_at: string;
}

// Analytics Types
export interface MeetingAnalytics {
  id: string;
  meeting_id: string;
  total_invited: number;
  total_attended: number;
  attendance_rate: number;
  average_check_in_time?: string;
  late_arrivals: number;
  early_departures: number;
  engagement_score: number;
  created_at: string;
}

// Dashboard Types
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  totalMeetings: number;
  upcomingMeetings: number;
  completedMeetings: number;
  averageAttendance: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// API Response Types
export interface ApiResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = string> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface TaskFormData {
  title: string;
  description?: string;
  priority: Task["priority"];
  assignee_id?: string;
  due_date?: string;
  tags: string[];
}

export interface MeetingFormData {
  title: string;
  description?: string;
  date_time: string;
  duration: number;
  location?: string;
  meeting_link?: string;
  meeting_type: Meeting["meeting_type"];
  agenda: string[];
  participant_ids: string[];
}

export interface NotulensiFormData {
  content: string;
  decisions: string[];
  next_meeting_date?: string;
  action_items: Omit<ActionItem, "id" | "notulensi_id" | "created_at">[];
}

// Filter Types
export interface TaskFilters {
  status?: Task["status"][];
  priority?: Task["priority"][];
  assignee_id?: string;
  due_date_from?: string;
  due_date_to?: string;
  tags?: string[];
}

export interface MeetingFilters {
  status?: Meeting["status"][];
  meeting_type?: Meeting["meeting_type"][];
  date_from?: string;
  date_to?: string;
  created_by?: string;
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  loading: boolean;
  notifications: Notification[];
}

// Search Types
export interface SearchResult {
  type: "task" | "meeting" | "notulensi" | "user";
  id: string;
  title: string;
  description?: string;
  url: string;
}

export interface SearchFilters {
  type?: SearchResult["type"][];
  date_from?: string;
  date_to?: string;
}

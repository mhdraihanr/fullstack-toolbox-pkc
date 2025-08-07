# API Documentation - Web Toolbox PKC

## Overview

Dokumentasi lengkap untuk API endpoints, komponen, dan fungsi dalam aplikasi Web Toolbox PKC. Aplikasi ini menggunakan Next.js App Router dengan API Routes untuk backend functionality.

## API Endpoints

### Authentication

#### POST /api/auth/login

**Description**: User login

```typescript
// Request
{
  email: string;
  password: string;
}

// Response
{
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "manager" | "employee";
    department: string;
  }
  token: string;
}
```

#### POST /api/auth/logout

**Description**: User logout

```typescript
// Response
{
  success: boolean;
  message: string;
}
```

### Tasks Management

#### GET /api/tasks

**Description**: Get all tasks with filtering and pagination

```typescript
// Query Parameters
{
  page?: number;
  limit?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee?: string;
  due_date?: string;
}

// Response
{
  success: boolean;
  data: {
    tasks: Task[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      per_page: number;
    };
  };
}
```

#### POST /api/tasks

**Description**: Create new task

```typescript
// Request
{
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id: string;
  due_date: string;
  tags?: string[];
}

// Response
{
  success: boolean;
  data: Task;
  message: string;
}
```

#### GET /api/tasks/[id]

**Description**: Get specific task by ID

```typescript
// Response
{
  success: boolean;
  data: Task;
}
```

#### PUT /api/tasks/[id]

**Description**: Update task

```typescript
// Request
{
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;
  due_date?: string;
  tags?: string[];
}

// Response
{
  success: boolean;
  data: Task;
  message: string;
}
```

#### DELETE /api/tasks/[id]

**Description**: Delete task

```typescript
// Response
{
  success: boolean;
  message: string;
}
```

### Meetings Management

#### GET /api/meetings

**Description**: Get all meetings

```typescript
// Query Parameters
{
  page?: number;
  limit?: number;
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  date_from?: string;
  date_to?: string;
}

// Response
{
  success: boolean;
  data: {
    meetings: Meeting[];
    pagination: PaginationInfo;
  };
}
```

#### POST /api/meetings

**Description**: Create new meeting

```typescript
// Request
{
  title: string;
  description?: string;
  date_time: string;
  duration: number; // in notulensi
  participants: string[]; // user IDs
  agenda?: string[];
  location?: string;
  meeting_type: 'onsite' | 'virtual' | 'hybrid';
}

// Response
{
  success: boolean;
  data: Meeting;
  message: string;
}
```

#### GET /api/meetings/[id]

**Description**: Get specific meeting

```typescript
// Response
{
  success: boolean;
  data: Meeting & {
    participants: User[];
    notulensi?: Notulensi;
  };
}
```

### Notulensi Management

#### POST /api/notulensi

**Description**: Create meeting notulensi

```typescript
// Request
{
  meeting_id: string;
  content: string; // Rich text content
  attendees: string[]; // user IDs
  action_items: {
    description: string;
    assignee_id: string;
    due_date?: string;
    priority: 'low' | 'medium' | 'high';
  }[];
  decisions: string[];
  next_meeting_date?: string;
}

// Response
{
  success: boolean;
  data: Notulensi;
  message: string;
}
```

#### GET /api/notulensi/[id]

**Description**: Get meeting notulensi

```typescript
// Response
{
  success: boolean;
  data: Notulensi & {
    meeting: Meeting;
    attendees: User[];
  };
}
```

#### GET /api/notulensi/[id]/pdf

**Description**: Generate and download PDF of notulensi

```typescript
// Response: PDF file download
```

#### POST /api/notulensi/[id]/share

**Description**: Share notulensi via email or WhatsApp

```typescript
// Request
{
  method: 'email' | 'whatsapp';
  recipients: string[]; // email addresses or phone numbers
  message?: string;
}

// Response
{
  success: boolean;
  message: string;
}
```

### QR Code & Attendance

#### POST /api/meetings/[id]/qr-code

**Description**: Generate QR code for meeting attendance

```typescript
// Request
{
  expires_in_minutes?: number; // Default: 60
  location_required?: boolean; // Default: false
}

// Response
{
  success: boolean;
  data: {
    qr_code_url: string;
    qr_code_data: string;
    expires_at: string;
    check_in_url: string;
  };
}
```

#### POST /api/attendance/check-in

**Description**: Check-in to meeting via QR code

```typescript
// Request
{
  meeting_id: string;
  qr_token: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  device_info?: {
    user_agent: string;
    platform: string;
    ip_address: string;
  };
}

// Response
{
  success: boolean;
  data: {
    attendance_id: string;
    meeting: {
      id: string;
      title: string;
      date_time: string;
      location: string;
    };
    check_in_time: string;
    message: string;
  };
}
```

#### GET /api/meetings/[id]/attendance

**Description**: Get real-time attendance for meeting

```typescript
// Response
{
  success: boolean;
  data: {
    meeting: Meeting;
    stats: {
      total_invited: number;
      total_checked_in: number;
      attendance_rate: number;
      late_arrivals: number;
    };
    attendees: {
      user: User;
      status: 'invited' | 'checked_in' | 'absent';
      checked_in_at?: string;
      is_late: boolean;
    }[];
    recent_check_ins: {
      user: User;
      checked_in_at: string;
    }[];
  };
}
```

#### PUT /api/meetings/[id]/attendance/[userId]

**Description**: Manual check-in/check-out for meeting

```typescript
// Request
{
  action: 'check_in' | 'check_out';
  notes?: string;
}

// Response
{
  success: boolean;
  data: {
    attendance_id: string;
    action: string;
    timestamp: string;
  };
}
```

### Notifications

#### GET /api/notifications

**Description**: Get user notifications

```typescript
// Query Parameters
{
  page?: number;
  limit?: number;
  read?: boolean;
  type?: 'task' | 'meeting' | 'reminder' | 'system';
}

// Response
{
  success: boolean;
  data: {
    notifications: Notification[];
    unread_count: number;
    pagination: PaginationInfo;
  };
}
```

#### PUT /api/notifications/[id]/read

**Description**: Mark notification as read

```typescript
// Response
{
  success: boolean;
  message: string;
}
```

#### POST /api/notifications/mark-all-read

**Description**: Mark all notifications as read

```typescript
// Response
{
  success: boolean;
  message: string;
}
```

### Dashboard & Analytics

#### GET /api/dashboard/stats

**Description**: Get dashboard statistics

```typescript
// Response
{
  success: boolean;
  data: {
    tasks: {
      total: number;
      pending: number;
      in_progress: number;
      completed: number;
      overdue: number;
    }
    meetings: {
      total_this_month: number;
      upcoming: number;
      completed: number;
      average_attendance_rate: number;
    }
    productivity: {
      completion_rate: number;
      average_task_duration: number;
    }
  }
}
```

#### GET /api/analytics/meetings

**Description**: Get meeting analytics data

```typescript
// Query Parameters
{
  period?: 'week' | 'month' | 'quarter' | 'year';
  department?: string;
  meeting_type?: 'onsite' | 'virtual' | 'hybrid';
}

// Response
{
  success: boolean;
  data: {
    overview: {
      total_meetings: number;
      total_participants: number;
      average_attendance_rate: number;
      most_active_department: string;
    };
    attendance_trends: {
      date: string;
      attendance_rate: number;
      total_meetings: number;
    }[];
    department_stats: {
      department: string;
      meetings_count: number;
      attendance_rate: number;
      engagement_score: number;
    }[];
    meeting_insights: {
      peak_meeting_hours: string[];
      average_meeting_duration: number;
      most_common_meeting_type: string;
      late_arrival_rate: number;
    };
  };
}
```

#### GET /api/analytics/meetings/[id]

**Description**: Get specific meeting analytics

```typescript
// Response
{
  success: boolean;
  data: {
    meeting: Meeting;
    analytics: {
      total_invited: number;
      total_attended: number;
      attendance_rate: number;
      late_arrivals: number;
      early_departures: number;
      average_check_in_time: string;
      engagement_score: number;
    }
    attendees: {
      user: User;
      checked_in_at: string;
      check_in_method: "qr_code" | "manual" | "auto";
      was_late: boolean;
    }
    [];
    timeline: {
      timestamp: string;
      event: "check_in" | "check_out" | "late_arrival";
      user: User;
    }
    [];
  }
}
```

## Data Types

### Core Types

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
  department: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignee_id: string;
  assignee?: User;
  created_by: string;
  creator?: User;
  due_date: string;
  completed_at?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date_time: string;
  duration: number;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  location?: string;
  meeting_type: "onsite" | "virtual" | "hybrid";
  qr_code_url?: string;
  qr_code_expires_at?: string;
  created_by: string;
  agenda: string[];
  created_at: string;
  updated_at: string;
}

interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  user?: User;
  status: "invited" | "accepted" | "declined" | "tentative";
  created_at: string;
}

interface MeetingAttendance {
  id: string;
  meeting_id: string;
  user_id: string;
  user?: User;
  checked_in_at: string;
  check_in_method: "qr_code" | "manual" | "auto";
  location_lat?: number;
  location_lng?: number;
  device_info?: any;
}

interface MeetingAnalytics {
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

interface Notulensi {
  id: string;
  meeting_id: string;
  content: string;
  decisions: string[];
  action_items: ActionItem[];
  next_meeting_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface ActionItem {
  id: string;
  description: string;
  assignee_id: string;
  assignee?: User;
  due_date?: string;
  priority: "low" | "medium" | "high";
  status: "pending" | "completed";
  completed_at?: string;
}

interface Notification {
  id: string;
  user_id: string;
  type: "task" | "meeting" | "reminder" | "system";
  title: string;
  message: string;
  read: boolean;
  data?: any; // Additional data for the notification
  created_at: string;
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
}
```

## React Components

### Core UI Components

#### TaskCard

```typescript
interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, status: Task["status"]) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  showAssignee?: boolean;
}
```

#### MeetingCard

```typescript
interface MeetingCardProps {
  meeting: Meeting;
  onJoin?: (meetingId: string) => void;
  onEdit: (meeting: Meeting) => void;
  onCancel: (meetingId: string) => void;
  showParticipants?: boolean;
}
```

#### NotulensiEditor

```typescript
interface NotulensiEditorProps {
  initialContent?: string;
  onSave: (content: string, actionItems: ActionItem[]) => void;
  onCancel: () => void;
  meeting: Meeting;
}
```

#### NotificationBell

```typescript
interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}
```

#### QRScanner

```typescript
interface QRScannerProps {
  onScanSuccess: (data: string) => void;
  onScanError: (error: string) => void;
  isActive: boolean;
  constraints?: {
    width: number;
    height: number;
    facingMode: "user" | "environment";
  };
}
```

#### QRGenerator

```typescript
interface QRGeneratorProps {
  data: string;
  size?: number;
  level?: "L" | "M" | "Q" | "H";
  includeMargin?: boolean;
  onGenerated?: (url: string) => void;
}
```

#### AttendanceList

```typescript
interface AttendanceListProps {
  meetingId: string;
  attendees: MeetingAttendance[];
  isRealTime?: boolean;
  onRefresh?: () => void;
  showCheckInTime?: boolean;
  showLocation?: boolean;
}
```

#### AnalyticsChart

```typescript
interface AnalyticsChartProps {
  data: any[];
  type: "line" | "bar" | "pie" | "doughnut";
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  height?: number;
}
```

#### AttendanceChart

```typescript
interface AttendanceChartProps {
  meetingId?: string;
  period: "week" | "month" | "quarter";
  department?: string;
  onDataUpdate?: (data: any) => void;
}
```

### Form Components

#### TaskForm

```typescript
interface TaskFormProps {
  task?: Task; // For editing
  onSubmit: (taskData: Partial<Task>) => void;
  onCancel: () => void;
  users: User[]; // For assignee selection
}
```

#### MeetingForm

```typescript
interface MeetingFormProps {
  meeting?: Meeting; // For editing
  onSubmit: (meetingData: Partial<Meeting>) => void;
  onCancel: () => void;
  users: User[]; // For participant selection
}
```

## Utility Functions

### Date & Time Utils

```typescript
// Format date for display
function formatDate(date: string | Date, format?: string): string;

// Check if date is overdue
function isOverdue(dueDate: string): boolean;

// Get relative time (e.g., "2 hours ago")
function getRelativeTime(date: string | Date): string;

// Calculate meeting duration
function calculateDuration(startTime: string, endTime: string): number;
```

### Task Utils

```typescript
// Get task priority color
function getPriorityColor(priority: Task["priority"]): string;

// Get task status color
function getStatusColor(status: Task["status"]): string;

// Filter tasks by criteria
function filterTasks(tasks: Task[], filters: TaskFilters): Task[];

// Sort tasks by priority, due date, etc.
function sortTasks(
  tasks: Task[],
  sortBy: string,
  order: "asc" | "desc"
): Task[];
```

### PDF Generation

```typescript
// Generate PDF from notulensi
function generateNotulensiPDF(
  notulensi: Notulensi,
  meeting: Meeting
): Promise<Blob>;

// Generate task report PDF
function generateTaskReportPDF(tasks: Task[], filters: any): Promise<Blob>;

// Generate attendance report PDF
function generateAttendanceReportPDF(
  meeting: Meeting,
  attendance: MeetingAttendance[]
): Promise<Blob>;

// Generate analytics report PDF
function generateAnalyticsReportPDF(
  analytics: any,
  period: string
): Promise<Blob>;
```

### QR Code Utils

```typescript
// Generate QR code for meeting
function generateMeetingQR(
  meetingId: string,
  expiresIn?: number
): Promise<{
  qrCodeUrl: string;
  qrCodeData: string;
  expiresAt: Date;
}>;

// Validate QR code token
function validateQRToken(token: string, meetingId: string): Promise<boolean>;

// Parse QR code data
function parseQRData(qrData: string): {
  meetingId: string;
  token: string;
  expiresAt: Date;
} | null;
```

### Analytics Utils

```typescript
// Calculate attendance rate
function calculateAttendanceRate(invited: number, attended: number): number;

// Calculate engagement score
function calculateEngagementScore(
  meeting: Meeting,
  attendance: MeetingAttendance[]
): number;

// Get meeting insights
function getMeetingInsights(
  meetings: Meeting[],
  attendance: MeetingAttendance[]
): {
  peakHours: string[];
  averageDuration: number;
  lateArrivalRate: number;
  mostActiveDay: string;
};

// Generate attendance trends
function generateAttendanceTrends(
  period: string,
  department?: string
): Promise<
  {
    date: string;
    attendanceRate: number;
    totalMeetings: number;
  }[]
>;
```

### Real-time Utils

```typescript
// Subscribe to meeting attendance updates
function subscribeToAttendance(
  meetingId: string,
  callback: (attendance: MeetingAttendance[]) => void
): () => void;

// Subscribe to meeting analytics updates
function subscribeToAnalytics(
  meetingId: string,
  callback: (analytics: MeetingAnalytics) => void
): () => void;

// Broadcast attendance update
function broadcastAttendanceUpdate(
  meetingId: string,
  attendance: MeetingAttendance
): void;
```

### Communication Utils

```typescript
// Send email
function sendEmail(
  to: string[],
  subject: string,
  content: string,
  attachments?: File[]
): Promise<boolean>;

// Send WhatsApp message
function sendWhatsApp(
  phoneNumbers: string[],
  message: string,
  attachment?: File
): Promise<boolean>;
```

## Error Handling

### API Error Responses

```typescript
interface APIError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Common error codes
// AUTH_001: Invalid credentials
// AUTH_002: Token expired
// TASK_001: Task not found
// TASK_002: Insufficient permissions
// MEET_001: Meeting not found
// MEET_002: Meeting already started
// FILE_001: File upload failed
// COMM_001: Email sending failed
// COMM_002: WhatsApp sending failed
```

## Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# WhatsApp Business API
WHATSAPP_API_URL=https://api.whatsapp.com
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id

# QR Code Configuration
QR_CODE_SECRET=your-qr-secret-key
QR_CODE_EXPIRY_MINUTES=60

# Analytics Configuration
ANALYTICS_RETENTION_DAYS=365
REAL_TIME_UPDATES=true

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Web Toolbox PKC"
```

Dokumentasi ini akan terus diperbarui seiring dengan pengembangan fitur-fitur baru dalam aplikasi Web Toolbox PKC.

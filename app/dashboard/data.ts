// Dashboard data
import { Task } from "@/types";

// Meeting interface for chart data
interface Meeting {
  id: string;
  date_time: string;
  status: string;
  participants?: {
    user_id: string;
    name: string;
    email: string;
    role: string;
  }[];
}

// Utility function to generate task status chart data from real tasks
export const generateTaskStatusData = (tasks: Task[]) => {
  const statusCounts = {
    pending: tasks.filter((t) => t.status === "pending").length,
    "in-progress": tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    cancelled: tasks.filter((t) => t.status === "cancelled").length,
  };

  return [
    { label: "Pending", value: statusCounts.pending, color: "#f59e0b" },
    {
      label: "In Progress",
      value: statusCounts["in-progress"],
      color: "#3b82f6",
    },
    { label: "Completed", value: statusCounts.completed, color: "#10b981" },
    { label: "Cancelled", value: statusCounts.cancelled, color: "#ef4444" },
  ];
};

// Utility function to generate department tasks data from real tasks
export const generateDepartmentTasksData = (tasks: Task[]) => {
  const departmentCounts: { [key: string]: number } = {};

  tasks.forEach((task) => {
    const department =
      task.assignee?.department || task.creator?.department || "Unassigned";
    departmentCounts[department] = (departmentCounts[department] || 0) + 1;
  });

  const colors = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ef4444",
    "#06b6d4",
  ];

  return Object.entries(departmentCounts).map(([department, count], index) => ({
    label: department,
    value: count,
    color: colors[index % colors.length],
  }));
};

// Utility function to get last N months names
export const getLastNMonths = (n: number): string[] => {
  const months = [];
  const now = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    months.push(monthName);
  }
  
  return months;
};

// Utility function to generate meeting attendance data from attendance stats
export const generateMeetingAttendanceDataFromStats = (
  attendanceStats: { month: string; attendanceRate: number }[]
) => {
  return attendanceStats.map((stat) => ({
    label: stat.month,
    value: Math.round(stat.attendanceRate), // Ensure integer values
    color: 'bg-blue-500'
  }));
};

// Legacy function for backward compatibility
export const generateMeetingAttendanceData = (meetings: Meeting[]) => {
  const currentYear = new Date().getFullYear();
  const monthNames = [
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
  ];

  // Initialize data for all 12 months
  const monthlyData = monthNames.map((month, index) => ({
    label: month,
    value: 0,
    totalMeetings: 0,
    totalParticipants: 0,
  }));

  // Process meetings data
  meetings.forEach((meeting) => {
    const meetingDate = new Date(meeting.date_time);
    if (meetingDate.getFullYear() === currentYear) {
      const monthIndex = meetingDate.getMonth();
      const participantCount = meeting.participants?.length || 0;

      monthlyData[monthIndex].totalMeetings += 1;
      monthlyData[monthIndex].totalParticipants += participantCount;
    }
  });

  // Calculate attendance percentage (assuming average 85% attendance if no specific data)
  return monthlyData.map((month) => ({
    label: month.label,
    value:
      month.totalMeetings > 0
        ? Math.round(
            (month.totalParticipants * 0.85) / Math.max(month.totalMeetings, 1)
          )
        : 0,
  }));
};

// Fallback static data for meeting attendance
export const meetingAttendanceData = [
  { label: "Jan", value: 85 },
  { label: "Feb", value: 92 },
  { label: "Mar", value: 78 },
  { label: "Apr", value: 88 },
  { label: "May", value: 95 },
  { label: "Jun", value: 82 },
  { label: "Jul", value: 90 },
  { label: "Aug", value: 87 },
  { label: "Sep", value: 93 },
  { label: "Oct", value: 89 },
  { label: "Nov", value: 91 },
  { label: "Dec", value: 86 },
];

export const departmentTasksData = [
  { label: "Produksi", value: 12, color: "bg-blue-500" },
  { label: "QC", value: 8, color: "bg-green-500" },
  { label: "Maintenance", value: 6, color: "bg-yellow-500" },
  { label: "IT", value: 4, color: "bg-purple-500" },
];

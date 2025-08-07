// Dashboard data
import { Task } from "@/types";

// Utility function to generate task status chart data from real tasks
export const generateTaskStatusData = (tasks: Task[]) => {
  const statusCounts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    'in-progress': tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length
  };

  return [
    { label: 'Pending', value: statusCounts.pending, color: '#f59e0b' },
    { label: 'In Progress', value: statusCounts['in-progress'], color: '#3b82f6' },
    { label: 'Completed', value: statusCounts.completed, color: '#10b981' },
    { label: 'Cancelled', value: statusCounts.cancelled, color: '#ef4444' }
  ];
};

// Utility function to generate department tasks data from real tasks
export const generateDepartmentTasksData = (tasks: Task[]) => {
  const departmentCounts: { [key: string]: number } = {};
  
  tasks.forEach(task => {
    const department = task.assignee?.department || task.creator?.department || 'Unassigned';
    departmentCounts[department] = (departmentCounts[department] || 0) + 1;
  });

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
  
  return Object.entries(departmentCounts).map(([department, count], index) => ({
    label: department,
    value: count,
    color: colors[index % colors.length]
  }));
};

export const meetingAttendanceData = [
  { label: "Jan", value: 85 },
  { label: "Feb", value: 92 },
  { label: "Mar", value: 78 },
  { label: "Apr", value: 88 },
  { label: "May", value: 95 },
  { label: "Jun", value: 82 },
];

export const departmentTasksData = [
  { label: "Produksi", value: 12, color: "bg-blue-500" },
  { label: "QC", value: 8, color: "bg-green-500" },
  { label: "Maintenance", value: 6, color: "bg-yellow-500" },
  { label: "IT", value: 4, color: "bg-purple-500" },
];

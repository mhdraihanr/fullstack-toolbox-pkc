"use client";

import React, { useMemo } from "react";
import {
  CheckSquare,
  Calendar,
  FileText,
  Users,
  Clock,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  StatsCard,
  TaskList,
  NotificationPanel,
  ChartCard,
} from "@/components/features";
import { useTasks } from "@/lib/hooks/useTasks";
// Temporary mock data for meetings until meetings API is implemented
const mockUpcomingMeetings = [
  {
    id: "1",
    title: "Rapat Evaluasi Produksi Mingguan",
    date_time: "2024-12-23T09:00:00Z",
    duration: 90,
    location: "Ruang Rapat Utama",
    participants: [{ id: "1" }, { id: "2" }, { id: "3" }],
  },
  {
    id: "2",
    title: "Meeting Quality Control",
    date_time: "2024-12-24T14:00:00Z",
    duration: 60,
    location: "Lab QC",
    participants: [{ id: "2" }, { id: "4" }],
  },
  {
    id: "3",
    title: "Koordinasi IT & Maintenance",
    date_time: "2024-12-25T10:30:00Z",
    duration: 45,
    location: "Virtual Meeting",
    participants: [{ id: "1" }, { id: "5" }],
  },
];
import {
  meetingAttendanceData,
  generateTaskStatusData,
  generateDepartmentTasksData,
} from "./data";

// Mock data untuk charts diimpor dari './data'

export default function DashboardPage() {
  // Get tasks data from Supabase
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
  } = useTasks({
    limit: 50, // Get more tasks for better stats calculation
    autoRefresh: true,
  });

  // Calculate real-time stats from tasks
  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const pendingTasks = tasks.filter(
      (task) => task.status === "pending"
    ).length;
    const inProgressTasks = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    // Calculate overdue tasks
    const now = new Date();
    const overdueTasks = tasks.filter(
      (task) =>
        task.due_date &&
        new Date(task.due_date) < now &&
        task.status !== "completed"
    ).length;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      upcomingMeetings: 3, // This would come from meetings API
      averageAttendance: 85, // This would come from meetings API
    };
  }, [tasks]);

  // Generate chart data from real tasks
  const taskStatusData = useMemo(() => generateTaskStatusData(tasks), [tasks]);
  const departmentTasksData = useMemo(
    () => generateDepartmentTasksData(tasks),
    [tasks]
  );

  const upcomingMeetings = mockUpcomingMeetings.slice(0, 3);

  // Show loading state
  if (tasksLoading) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 dark:text-white min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (tasksError) {
    return (
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 dark:text-white min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Error loading dashboard: {tasksError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8  dark:text-white min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight mb-1 sm:mb-2">
            Dashboard
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Selamat datang di Web Toolbox PKC. Berikut adalah ringkasan
            aktivitas Anda.
          </p>
        </div>
        <div className="text-xs sm:text-sm lg:text-base text-muted-foreground font-medium flex-shrink-0">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          description="total tugas"
          icon={<CheckSquare className="h-5 w-5" />}
          trend={{
            value:
              stats.totalTasks > 0
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                : 0,
            isPositive: stats.completedTasks > 0,
          }}
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgressTasks}
          description="sedang dikerjakan"
          icon={<Clock className="h-5 w-5" />}
          trend={{
            value:
              stats.pendingTasks > 0
                ? Math.round((stats.pendingTasks / stats.totalTasks) * 100)
                : 0,
            isPositive: stats.pendingTasks === 0,
          }}
        />
        <StatsCard
          title="Completed"
          value={stats.completedTasks}
          description="selesai"
          icon={<CheckSquare className="h-5 w-5" />}
          trend={{
            value:
              stats.totalTasks > 0
                ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
                : 0,
            isPositive: stats.completedTasks > stats.pendingTasks,
          }}
        />
        <StatsCard
          title="Overdue"
          value={stats.overdueTasks}
          description={stats.overdueTasks === 0 ? "tepat waktu" : "terlambat"}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{
            value: stats.overdueTasks,
            isPositive: stats.overdueTasks === 0,
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-3">
        {/* Left Column - Tasks and Charts */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Recent Tasks */}
          <TaskList
            title="Recent Tasks"
            limit={5}
            showHeader={true}
            showAssignee={true}
            tasks={tasks}
            loading={tasksLoading}
            error={tasksError}
          />

          {/* Charts Row */}
          <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2">
            <ChartCard
              title="Task Status Overview"
              description="Distribusi status tasks saat ini"
              data={taskStatusData}
              type="bar"
            />
            <ChartCard
              title="Meeting Attendance Trend"
              description="Tingkat kehadiran 6 bulan terakhir"
              data={meetingAttendanceData}
              type="line"
              trend={{
                value: 8,
                isPositive: true,
                period: "bulan lalu",
              }}
            />
          </div>

          {/* Department Tasks */}
          <ChartCard
            title="Tasks by Department"
            description="Distribusi tasks berdasarkan departemen"
            data={departmentTasksData}
            type="pie"
          />
        </div>

        {/* Right Column - Notifications and Quick Info */}
        <div className="space-y-4 sm:space-y-6">
          {/* Notifications */}
          <NotificationPanel
            title="Notifications"
            limit={4}
            showHeader={true}
            className="overflow-hidden"
          />

          {/* Upcoming Meetings */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">
              Upcoming Meetings
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base truncate">
                        {meeting.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {new Date(meeting.date_time).toLocaleDateString(
                          "id-ID",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                      <div className="flex items-center space-x-2 sm:space-x-3 mt-1.5 sm:mt-2">
                        <div className="flex items-center space-x-1 sm:space-x-1.5 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{meeting.duration} min</span>
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-1.5 text-xs sm:text-sm text-muted-foreground">
                          <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>
                            {meeting.participants?.length || 0} peserta
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                      {meeting.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-3 sm:p-4 lg:p-5 border rounded-lg">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <button className="w-full text-left p-2 sm:p-3 rounded hover:bg-muted transition-colors text-sm sm:text-base">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Create Task</span>
                </div>
              </button>
              <button className="w-full text-left p-2 sm:p-3 rounded hover:bg-muted transition-colors text-sm sm:text-base">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Schedule Meeting</span>
                </div>
              </button>
              <button className="w-full text-left p-2 sm:p-3 rounded hover:bg-muted transition-colors text-sm sm:text-base">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">Create Notulensi</span>
                </div>
              </button>
              <button className="w-full text-left p-2 sm:p-3 rounded hover:bg-muted transition-colors text-sm sm:text-base">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">See Analytics</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
import { StatsCard, TaskList, ChartCard } from "@/components/features";
import { useTasks } from "@/lib/hooks/useTasks";
import { useMeetings } from "@/lib/hooks/useMeetings";
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

  // Get meetings data from Supabase
  const {
    meetings,
    loading: meetingsLoading,
    error: meetingsError,
  } = useMeetings({
    limit: 10,
    autoRefresh: true,
    clientSideSearch: true,
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
      upcomingMeetings: meetings.length,
      averageAttendance: 85, // This would come from meetings API
    };
  }, [tasks]);

  // Generate chart data from real tasks
  const taskStatusData = useMemo(() => generateTaskStatusData(tasks), [tasks]);
  const departmentTasksData = useMemo(
    () => generateDepartmentTasksData(tasks),
    [tasks]
  );

  // Get upcoming meetings (next 3 meetings)
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((meeting) => new Date(meeting.date_time) >= now)
      .sort(
        (a, b) =>
          new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
      )
      .slice(0, 3);
  }, [meetings]);

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
    <div className="space-y-6 dark:text-white min-h-screen p-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Selamat datang kembali!
          </h1>
          <p className="text-muted-foreground">
            Berikut adalah ringkasan aktivitas Anda hari ini.
          </p>
        </div>
        <div className="text-sm text-muted-foreground font-medium px-4 py-2 rounded-lg bg-muted/50 border">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<CheckSquare className="h-5 w-5" />}
          trend={{
            value: stats.completedTasks,
            isPositive: true,
          }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 border-blue-200 dark:border-blue-800"
        />
        <StatsCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<Clock className="h-5 w-5" />}
          trend={{
            value: stats.pendingTasks,
            isPositive: false,
          }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30 border-orange-200 dark:border-orange-800"
        />
        <StatsCard
          title="Meetings"
          value={stats.upcomingMeetings}
          icon={<Calendar className="h-5 w-5" />}
          trend={{
            value: stats.upcomingMeetings,
            isPositive: true,
          }}
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 border-green-200 dark:border-green-800"
        />
        <StatsCard
          title="Productivity"
          value={`${
            Math.round((stats.completedTasks / stats.totalTasks) * 100) || 0
          }%`}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{
            value: stats.completedTasks,
            isPositive: true,
          }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border-purple-200 dark:border-purple-800"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tasks and Charts */}
        <div className="lg:col-span-2">
          {/* Recent Tasks */}
          <div className=" dark:bg-slate-900 border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Recent Tasks
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your latest task activities
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground px-3 py-1.5 rounded-lg bg-white border dark:bg-gray-900 ">
                  {tasks.length} tasks
                </span>
              </div>
            </div>
            <TaskList
              limit={5}
              showHeader={false}
              showAssignee={true}
              tasks={tasks}
              loading={tasksLoading}
              error={tasksError}
            />
          </div>

          {/* Charts Row */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-6">
            <ChartCard
              title="Task Status Overview"
              description="Distribusi status tasks saat ini"
              data={taskStatusData}
              type="bar"
              className="bg-card border rounded-xl"
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
              className="bg-card border rounded-xl"
            />
          </div>

          {/* Department Tasks */}
          <ChartCard
            title="Tasks by Department"
            description="Distribusi tasks berdasarkan departemen"
            data={departmentTasksData}
            type="pie"
            className="bg-card border rounded-xl"
          />
        </div>

        {/* Right Column - Meetings and Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Meetings */}
          <div className=" dark:bg-slate-900 border rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  Upcoming Meetings
                </h2>
                <p className="text-sm text-muted-foreground">
                  Your scheduled meetings
                </p>
              </div>
              <span className="text-sm text-muted-foreground px-3 py-1.5 rounded-lg bg-white border dark:bg-gray-900">
                {meetings.length} meetings
              </span>
            </div>
            {meetingsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Loading meetings...
                  </span>
                </div>
              </div>
            ) : meetingsError ? (
              <div className="p-4 text-center text-red-600 text-sm">
                Error loading meetings: {meetingsError}
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                No upcoming meetings
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-foreground truncate">
                          {meeting.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
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
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{meeting.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>
                              {meeting.participants?.length || 0} peserta
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          📍 {meeting.location}
                        </div>
                      </div>
                      <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className=" dark:bg-slate-900 border rounded-xl p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Quick Actions
              </h2>
              <p className="text-sm text-muted-foreground">
                Common tasks and shortcuts
              </p>
            </div>
            <div className="space-y-3">
              <button className="w-full p-4 text-left rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Create New Task
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Add a new task to your list
                    </p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 text-left rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Schedule Meeting
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Plan your next meeting
                    </p>
                  </div>
                </div>
              </button>
              <button className="w-full p-4 text-left rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Create Notulensi
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Document meeting notes
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CheckSquare, Clock, User, Calendar } from "lucide-react";
import { Task } from "@/types";
import { useTasks } from "@/lib/hooks/useTasks";
import {
  formatRelativeTime,
  getStatusColor,
  getPriorityColor,
} from "@/lib/utils";

interface TaskListProps {
  title?: string;
  limit?: number;
  showHeader?: boolean;
  className?: string;
  showAssignee?: boolean;
  tasks?: Task[];
  loading?: boolean;
  error?: string | null;
}

function TaskItem({
  task,
  showAssignee = true,
}: {
  task: Task & {
    assignee?: { id: string; name: string; avatar_url?: string };
    creator?: { id: string; name: string; avatar_url?: string };
  };
  showAssignee?: boolean;
}) {
  const isOverdue =
    task.due_date &&
    new Date(task.due_date) < new Date() &&
    task.status !== "completed";

  return (
    <div
      className={`flex items-center p-2 sm:p-3 lg:p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
        task.status === "pending"
          ? "border-l-2 sm:border-l-4 border-l-red-500 pl-1 sm:pl-2 lg:pl-3"
          : ""
      }`}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0 mr-2 sm:mr-3">
        <div
          className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center ${
            task.status === "completed"
              ? "bg-emerald-500 border-emerald-500"
              : task.status === "in-progress"
              ? "bg-blue-500 border-blue-500"
              : task.status === "pending"
              ? "bg-white border-red-500"
              : "border-gray-300"
          }`}
        >
          {task.status === "completed" && (
            <CheckSquare className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-white" />
          )}
        </div>
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center flex-wrap gap-1 sm:gap-2 mb-1">
          {/* Indicator for tasks that need attention */}
          {(task.status === "pending" || isOverdue) && (
            <div className="flex-shrink-0">
              <div
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                  isOverdue ? "bg-red-500 animate-pulse" : "bg-red-500"
                }`}
                title={
                  isOverdue
                    ? "Overdue - Needs immediate attention!"
                    : "Pending - Needs to be worked on"
                }
              />
            </div>
          )}
          <Link
            href={`/tasks/${task.id}`}
            className="font-medium text-sm sm:text-base hover:text-primary transition-colors truncate flex-1 min-w-0"
          >
            {task.title}
          </Link>
          <Badge
            variant={
              task.status === "completed"
                ? "success"
                : task.status === "in-progress"
                ? "kujang"
                : task.status === "pending"
                ? "warning"
                : "secondary"
            }
            status={
              task.status as
                | "pending"
                | "completed"
                | "in-progress"
                | "cancelled"
                | "draft"
            }
            className="text-xs sm:text-sm flex-shrink-0"
          >
            {task.status}
          </Badge>
        </div>

        {task.description && (
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2 line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
          {/* Priority */}
          <div className="flex items-center space-x-1">
            <div
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getPriorityColor(
                task.priority
              ).replace("text-", "bg-")}`}
            />
            <span className="capitalize">{task.priority}</span>
          </div>

          {/* Due Date */}
          {task.due_date && (
            <div
              className={`flex items-center space-x-1 ${
                isOverdue ? "text-red-500" : ""
              }`}
            >
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">
                {formatRelativeTime(task.due_date)}
              </span>
              <span className="sm:hidden">
                {new Date(task.due_date).toLocaleDateString("id-ID", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {/* Assignee - Only shown in text format if showAssignee is true */}
          {showAssignee && task.assignee && (
            <div className="flex items-center space-x-1">
              <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="truncate max-w-20 sm:max-w-none">
                {task.assignee.name}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
            {task.tags.slice(0, 2).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs sm:text-sm px-1 sm:px-1.5 py-0.5"
              >
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge
                variant="outline"
                className="text-xs sm:text-sm px-1 sm:px-1.5 py-0.5"
              >
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TaskList({
  title = "Recent Tasks",
  limit = 5,
  showHeader = true,
  className,
  showAssignee = true,
  tasks: propTasks,
  loading: propLoading,
  error: propError,
}: TaskListProps) {
  // Use tasks from props if provided, otherwise fetch from hook
  const {
    tasks: hookTasks,
    loading: hookLoading,
    error: hookError,
  } = useTasks({
    limit: propTasks ? undefined : limit * 2, // Get more tasks for sorting if not provided
    autoRefresh: propTasks ? false : true,
  });

  const allTasks = propTasks || hookTasks;
  const loading = propLoading ?? hookLoading;
  const error = propError ?? hookError;

  // Sort tasks: pending/in-progress first, then completed
  const sortedTasks = allTasks.sort((a, b) => {
    // Priority order: pending -> in-progress -> completed
    const statusOrder = { pending: 0, "in-progress": 1, completed: 2 };
    const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
    const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;

    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }

    // If same status, sort by due date (overdue first)
    if (a.due_date && b.due_date) {
      const aOverdue =
        new Date(a.due_date) < new Date() && a.status !== "completed";
      const bOverdue =
        new Date(b.due_date) < new Date() && b.status !== "completed";

      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;

      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    }

    return 0;
  });

  const tasks = sortedTasks.slice(0, limit);

  // Show loading state
  if (loading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold truncate">
              {title}
            </CardTitle>
            <Link href="/tasks">
              <Button
                variant="whiteLine"
                size="sm"
                className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary text-xs sm:text-sm flex-shrink-0"
              >
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
              </Button>
            </Link>
          </CardHeader>
        )}
        <CardContent className="p-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 animate-spin" />
            <span className="text-muted-foreground">Loading tasks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold truncate">
              {title}
            </CardTitle>
            <Link href="/tasks">
              <Button
                variant="whiteLine"
                size="sm"
                className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary text-xs sm:text-sm flex-shrink-0"
              >
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
              </Button>
            </Link>
          </CardHeader>
        )}
        <CardContent className="p-8 text-center text-red-600">
          <p>Error loading tasks: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 lg:p-6">
          <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold truncate">
            {title}
          </CardTitle>
          <Link href="/tasks">
            <Button
              variant="whiteLine"
              size="sm"
              className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary text-xs sm:text-sm flex-shrink-0"
            >
              <span className="hidden sm:inline">View All</span>
              <span className="sm:hidden">All</span>
            </Button>
          </Link>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {tasks.length > 0 ? (
          <div>
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} showAssignee={showAssignee} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

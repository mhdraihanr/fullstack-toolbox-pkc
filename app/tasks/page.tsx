"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Calendar,
  Tag,
  ArrowUpDown,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useTasks } from "@/lib/hooks/useTasks";
import { Task, TaskFilters } from "@/types";
import { formatRelativeTime, formatDate, getPriorityColor } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

export default function TasksPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filters, setFilters] = useState<TaskFilters>({
    status: undefined,
    priority: undefined,
    assignee_id: undefined,
    tags: undefined,
  });
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<{
    field: keyof Task | "assignee" | "creator";
    direction: "asc" | "desc";
  }>({
    field: "due_date",
    direction: "asc",
  });

  // Debounce search query to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Status options for task status change
  const statusOptions: Task["status"][] = [
    "pending",
    "in-progress",
    "completed",
    "cancelled",
  ];

  // Use the new useTasks hook with client-side search
  const {
    tasks: allTasks,
    loading,
    error,
    updateTaskStatus: updateStatus,
    refetch,
  } = useTasks({
    page,
    limit: 1000, // Fetch all tasks for client-side filtering
    // Remove search from API call to prevent server requests
    status: filters.status?.join(","),
    priority: filters.priority?.join(","),
    assignee_id: filters.assignee_id,
    tags: filters.tags?.join(","),
    autoRefresh: true,
    clientSideSearch: true, // Enable client-side search
  });

  // Client-side search filtering
  const filteredTasks = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return allTasks;
    }

    const searchLower = debouncedSearchQuery.toLowerCase().trim();
    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        task.assignee?.name?.toLowerCase().includes(searchLower) ||
        task.creator?.name?.toLowerCase().includes(searchLower)
    );
  }, [allTasks, debouncedSearchQuery]);

  // Function to update task status
  const handleUpdateTaskStatus = useCallback(
    async (taskId: string, newStatus: Task["status"]) => {
      await updateStatus(taskId, newStatus);
    },
    [updateStatus]
  );

  // Priority options for filtering
  const priorityOptions: Task["priority"][] = [
    "low",
    "medium",
    "high",
    "urgent",
  ];

  // Toggle sort function
  const toggleSort = useCallback(
    (field: keyof Task | "assignee" | "creator") => {
      setSortBy((prev) => ({
        field,
        direction:
          prev.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    },
    []
  );

  // Toggle status filter
  const toggleStatusFilter = useCallback((status: Task["status"]) => {
    setFilters((prev) => {
      const currentStatus = prev.status || [];
      const newStatus = currentStatus.includes(status)
        ? currentStatus.filter((s) => s !== status)
        : [...currentStatus, status];
      return {
        ...prev,
        status: newStatus.length > 0 ? newStatus : undefined,
      };
    });
  }, []);

  // Toggle priority filter
  const togglePriorityFilter = useCallback((priority: Task["priority"]) => {
    setFilters((prev) => {
      const currentPriority = prev.priority || [];
      const newPriority = currentPriority.includes(priority)
        ? currentPriority.filter((p) => p !== priority)
        : [...currentPriority, priority];
      return {
        ...prev,
        priority: newPriority.length > 0 ? newPriority : undefined,
      };
    });
  }, []);

  // Toggle tags filter
  const toggleTagsFilter = useCallback((tag: string) => {
    setFilters((prev) => {
      const currentTags = prev.tags || [];
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag];
      return {
        ...prev,
        tags: newTags.length > 0 ? newTags : undefined,
      };
    });
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({
      status: undefined,
      priority: undefined,
      assignee_id: undefined,
      tags: undefined,
    });
    setSearchQuery("");
    setDebouncedSearchQuery("");
  }, []);

  // Get unique tags from all tasks
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    // Using allTasks to show all available tags for filtering
    allTasks.forEach((task) => {
      task.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [allTasks]);

  // Client-side sorting for better UX
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // First priority: status (pending first, then in-progress, then completed, then cancelled)
      const statusOrder = {
        pending: 0,
        "in-progress": 1,
        completed: 2,
        cancelled: 3,
      };
      const aStatusOrder = statusOrder[a.status] ?? 4;
      const bStatusOrder = statusOrder[b.status] ?? 4;

      if (aStatusOrder !== bStatusOrder) {
        return aStatusOrder - bStatusOrder;
      }

      // Second priority: user-selected sorting
      let aValue: string | number | Date | undefined;
      let bValue: string | number | Date | undefined;

      // Handle special fields
      if (sortBy.field === "assignee") {
        aValue = a.assignee?.name || "";
        bValue = b.assignee?.name || "";
      } else if (sortBy.field === "creator") {
        aValue = a.creator?.name || "";
        bValue = b.creator?.name || "";
      } else {
        aValue = a[sortBy.field as keyof Task] as
          | string
          | number
          | Date
          | undefined;
        bValue = b[sortBy.field as keyof Task] as
          | string
          | number
          | Date
          | undefined;
      }

      // Handle dates
      if (
        sortBy.field === "due_date" ||
        sortBy.field === "created_at" ||
        sortBy.field === "updated_at"
      ) {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }

      // Sort direction
      if (sortBy.direction === "asc") {
        return aValue !== undefined && bValue !== undefined
          ? aValue > bValue
            ? 1
            : -1
          : 0;
      } else {
        return aValue !== undefined && bValue !== undefined
          ? aValue < bValue
            ? 1
            : -1
          : 0;
      }
    });
  }, [filteredTasks, sortBy]);

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading tasks...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 dark:text-white min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            Tasks
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            Manage and monitor all tasks in one place
          </p>
        </div>
        <Button
          className="md:self-start cursor-pointer"
          onClick={() => router.push("/tasks/create")}
        >
          <Plus className="mr-2 h-4 w-4" /> Create New Task
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 dark:bg-[#1E1E2D]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full rounded-md border border-input pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Status Filter Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="whiteLine"
                size="sm"
                className="flex items-center"
              >
                <Filter className="mr-2 h-4 w-4" />
                Status
                {filters.status && filters.status.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {filters.status.length}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-3">
                <h4 className="font-medium text-sm mb-3">Filter by Status</h4>
                <div className="space-y-2">
                  {statusOptions.map((status) => (
                    <label
                      key={status}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status) || false}
                        onChange={() => toggleStatusFilter(status)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm capitalize">
                        {status === "in-progress" ? "In Progress" : status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Priority Filter Dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="whiteLine"
                size="sm"
                className="flex items-center"
              >
                <Tag className="mr-2 h-4 w-4" />
                Priority
                {filters.priority && filters.priority.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                  >
                    {filters.priority.length}
                  </Badge>
                )}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-3">
                <h4 className="font-medium text-sm mb-3">Filter by Priority</h4>
                <div className="space-y-2">
                  {priorityOptions.map((priority) => (
                    <label
                      key={priority}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.priority?.includes(priority) || false}
                        onChange={() => togglePriorityFilter(priority)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm capitalize">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Tags Filter Dropdown */}
          {uniqueTags.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="whiteLine"
                  size="sm"
                  className="flex items-center"
                >
                  <Tag className="mr-2 h-4 w-4" />
                  Tags
                  {filters.tags && filters.tags.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                    >
                      {filters.tags.length}
                    </Badge>
                  )}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0" align="start">
                <div className="p-3">
                  <h4 className="font-medium text-sm mb-3">Filter by Tags</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {uniqueTags.map((tag) => (
                      <label
                        key={tag}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={filters.tags?.includes(tag) || false}
                          onChange={() => toggleTagsFilter(tag)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Active Filters Display */}
          {((filters.status?.length || 0) > 0 ||
            (filters.priority?.length || 0) > 0 ||
            filters.assignee_id ||
            (filters.tags?.length || 0) > 0) && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Status badges */}
              {filters.status?.map((status) => (
                <Badge
                  key={status}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {status === "in-progress" ? "In Progress" : status}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => toggleStatusFilter(status)}
                  />
                </Badge>
              ))}
              {/* Priority badges */}
              {filters.priority?.map((priority) => (
                <Badge
                  key={priority}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {priority}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => togglePriorityFilter(priority)}
                  />
                </Badge>
              ))}
              {/* Tags badges */}
              {filters.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => toggleTagsFilter(tag)}
                  />
                </Badge>
              ))}
              {/* Reset button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-xs"
              >
                <X className="mr-1 h-3 w-3" />
                Clear All
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Task Count */}
      <div className="flex justify-end items-center">
        <div className="text-sm text-muted-foreground">
          {filteredTasks.length} tasks
        </div>
      </div>

      {/* List View */}
      <div className="border rounded-lg overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden lg:grid grid-cols-13 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
          <div
            className="col-span-5 flex items-center cursor-pointer"
            onClick={() => toggleSort("title")}
          >
            Task <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
          <div
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => toggleSort("status")}
          >
            Status <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
          <div
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => toggleSort("priority")}
          >
            Priority <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
          <div
            className="col-span-2 flex items-center cursor-pointer"
            onClick={() => toggleSort("due_date")}
          >
            Due Date <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
          <div
            className="col-span-1 flex items-center cursor-pointer"
            onClick={() => toggleSort("assignee")}
          >
            PIC <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </div>

        {/* Desktop Table Body */}
        <div className="hidden lg:block divide-y">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className="grid grid-cols-13 gap-4 p-4 hover:bg-muted/50 transition-colors dark:bg-[#1E1E2D]"
            >
              <div className="col-span-5 min-w-0">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      task.status === "completed"
                        ? "bg-green-500 border-green-500"
                        : task.status === "in-progress"
                        ? "bg-blue-500 border-blue-500"
                        : task.status === "pending"
                        ? "bg-gray-500 border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    {task.status === "completed" && (
                      <CheckSquare className="w-2 h-2 text-white" />
                    )}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <div className="font-medium text-base truncate">
                      {task.title}
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                        {task.description}
                      </p>
                    )}
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 overflow-hidden">
                        {task.tags.slice(0, 2).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-sm px-1.5 py-0.5"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {task.tags.length > 2 && (
                          <Badge
                            variant="outline"
                            className="text-sm px-1.5 py-0.5"
                          >
                            +{task.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-2 flex items-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "success"
                          : task.status === "in-progress"
                          ? "kujang"
                          : task.status === "cancelled"
                          ? "destructive"
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
                      className="text-sm cursor-pointer hover:opacity-80"
                    >
                      {task.status}
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="flex flex-col">
                      {statusOptions.map((status) => (
                        <Button
                          key={status}
                          variant="ghost"
                          className={`justify-start text-sm ${
                            task.status === status ? "bg-muted" : ""
                          }`}
                          onClick={() => {
                            // Use the new handler function to update task status
                            handleUpdateTaskStatus(task.id, status);
                          }}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="col-span-2 flex items-center">
                <div className="flex items-center space-x-1">
                  <div
                    className={`w-2 h-2 rounded-full ${getPriorityColor(
                      task.priority
                    ).replace("text-", "bg-")}`}
                  />
                  <span className="capitalize text-sm">{task.priority}</span>
                </div>
              </div>
              <div className="col-span-2 flex items-center">
                {task.due_date ? (
                  <div
                    className={`flex items-center space-x-1 text-sm ${
                      task.due_date &&
                      new Date(task.due_date) < new Date() &&
                      task.status !== "completed"
                        ? "text-red-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
              <div className="col-span-1 flex items-center">
                {task.assignee ? (
                  <div className="flex items-center space-x-2">
                    <Avatar
                      src={task.assignee.avatar_url}
                      name={task.assignee.name}
                      size="sm"
                    />
                    <span className="text-sm">{task.assignee.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </div>
          ))}

          {sortedTasks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks found</p>
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden divide-y">
          {sortedTasks.map((task) => (
            <div
              key={task.id}
              className="p-3 sm:p-4 hover:bg-muted/50 transition-colors dark:bg-[#1E1E2D]"
            >
              <div className="space-y-3">
                {/* Task Title and Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div
                      className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center ${
                        task.status === "completed"
                          ? "bg-green-500 border-green-500"
                          : task.status === "in-progress"
                          ? "bg-blue-500 border-blue-500"
                          : task.status === "pending"
                          ? "bg-gray-500 border-red-500"
                          : "border-gray-300"
                      }`}
                    >
                      {task.status === "completed" && (
                        <CheckSquare className="w-2 h-2 text-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm sm:text-base truncate">
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Badge
                        variant={
                          task.status === "completed"
                            ? "success"
                            : task.status === "in-progress"
                            ? "kujang"
                            : task.status === "cancelled"
                            ? "destructive"
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
                        className="text-xs cursor-pointer hover:opacity-80"
                      >
                        {task.status}
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="flex flex-col">
                        {statusOptions.map((status) => (
                          <Button
                            key={status}
                            variant="ghost"
                            className={`justify-start text-sm ${
                              task.status === status ? "bg-muted" : ""
                            }`}
                            onClick={() => {
                              handleUpdateTaskStatus(task.id, status);
                            }}
                          >
                            {status}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Task Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                  {/* Priority */}
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground font-medium">
                      Priority:
                    </span>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${getPriorityColor(
                          task.priority
                        ).replace("text-", "bg-")}`}
                      />
                      <span className="capitalize">{task.priority}</span>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="flex items-center space-x-2">
                    <span className="text-muted-foreground font-medium">
                      Due:
                    </span>
                    {task.due_date ? (
                      <div
                        className={`flex items-center space-x-1 ${
                          task.due_date &&
                          new Date(task.due_date) < new Date() &&
                          task.status !== "completed"
                            ? "text-red-500"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(task.due_date)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center space-x-2 sm:col-span-2">
                    <span className="text-muted-foreground font-medium">
                      PIC:
                    </span>
                    {task.assignee ? (
                      <div className="flex items-center space-x-2">
                        <Avatar
                          src={task.assignee.avatar_url}
                          name={task.assignee.name}
                          size="sm"
                        />
                        <span className="truncate">{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {task.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        +{task.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {sortedTasks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

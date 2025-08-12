"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTasks } from "@/lib/hooks/useTasks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Avatar } from "@/components/ui/Avatar";
import {
  Plus,
  Search,
  Filter,
  Tag,
  Calendar,
  CheckSquare,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Task } from "@/types";

type SortField = "title" | "status" | "priority" | "due_date" | "assignee";
type SortDirection = "asc" | "desc";

interface SortBy {
  field: SortField;
  direction: SortDirection;
}

interface Filters {
  status: string[];
  priority: string[];
  tags: string[];
}

export default function TasksPage() {
  const router = useRouter();
  const { tasks, loading, error, refetch, updateTaskStatus } = useTasks();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>({
    field: "title",
    direction: "asc",
  });
  const [filters, setFilters] = useState<Filters>({
    status: [],
    priority: [],
    tags: [],
  });

  const statusOptions = ["pending", "in-progress", "completed", "cancelled"];
  const priorityOptions = ["low", "medium", "high", "urgent"];

  // Debounced search
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get unique tags from all tasks
  const uniqueTags = useMemo(() => {
    if (!tasks) return [];
    const allTags = tasks.flatMap((task) => task.tags || []);
    return Array.from(new Set(allTags)).sort();
  }, [tasks]);

  // Filter tasks based on search query and filters
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];

    return tasks.filter((task) => {
      // Search filter
      const matchesSearch =
        !debouncedSearchQuery ||
        task.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        task.description
          ?.toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        task.assignee?.name
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase());

      // Status filter
      const matchesStatus =
        filters.status.length === 0 || filters.status.includes(task.status);

      // Priority filter
      const matchesPriority =
        filters.priority.length === 0 ||
        filters.priority.includes(task.priority);

      // Tags filter
      const matchesTags =
        filters.tags.length === 0 ||
        filters.tags.some((tag) => task.tags?.includes(tag));

      return matchesSearch && matchesStatus && matchesPriority && matchesTags;
    });
  }, [tasks, debouncedSearchQuery, filters]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;

      switch (sortBy.field) {
        case "title":
          aValue = a.title;
          bValue = b.title;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case "due_date":
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
          break;
        case "assignee":
          aValue = a.assignee?.name || "";
          bValue = b.assignee?.name || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortBy.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortBy.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredTasks, sortBy]);

  const toggleSort = (field: SortField) => {
    setSortBy((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const togglePriorityFilter = (priority: string) => {
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter((p) => p !== priority)
        : [...prev.priority, priority],
    }));
  };

  const toggleTagsFilter = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const resetFilters = () => {
    setFilters({
      status: [],
      priority: [],
      tags: [],
    });
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateTaskStatus(taskId, newStatus as Task["status"]);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

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

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari tasks..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                    className="flex items-center rounded-lg"
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
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-3">
                      Filter by Status
                    </h4>
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
                    className="flex items-center rounded-lg"
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
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-0" align="start">
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-3">
                      Filter by Priority
                    </h4>
                    <div className="space-y-2">
                      {priorityOptions.map((priority) => (
                        <label
                          key={priority}
                          className="flex items-center space-x-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={
                              filters.priority?.includes(priority) || false
                            }
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
                      className="flex items-center rounded-lg"
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
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0" align="start">
                    <div className="p-3">
                      <h4 className="font-medium text-sm mb-3">
                        Filter by Tags
                      </h4>
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

              {/* Reset Filters Button */}
              {(filters.status?.length > 0 ||
                filters.priority?.length > 0 ||
                filters.tags?.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="rounded-lg"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daftar Tasks ({filteredTasks.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 dark:bg-[#1E1E2D]">
                <th
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleSort("title")}
                >
                  <div className="flex items-center">
                    Task
                    {sortBy.field === "title" ? (
                      sortBy.direction === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortBy.field === "status" ? (
                      sortBy.direction === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleSort("priority")}
                >
                  <div className="flex items-center">
                    Priority
                    {sortBy.field === "priority" ? (
                      sortBy.direction === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleSort("due_date")}
                >
                  <div className="flex items-center">
                    Due Date
                    {sortBy.field === "due_date" ? (
                      sortBy.direction === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </th>
                <th
                  className="text-left p-4 font-medium cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => toggleSort("assignee")}
                >
                  <div className="flex items-center">
                    PIC
                    {sortBy.field === "assignee" ? (
                      sortBy.direction === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No tasks found
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="border-b hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            task.status === "completed"
                              ? "bg-green-500 border-green-500"
                              : task.status === "in-progress"
                              ? "bg-blue-500 border-blue-500"
                              : task.status === "pending"
                              ? "bg-white border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          {task.status === "completed" && (
                            <CheckSquare className="w-2 h-2 text-white" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm">
                            {task.title}
                          </div>
                          {task.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {task.description}
                            </p>
                          )}
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.tags.slice(0, 2).map((tag, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  +{task.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
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
                            className="text-sm cursor-pointer hover:opacity-80 flex items-center gap-1 max-w-fit px-2"
                          >
                            {task.status}
                            <ChevronDown className="h-3 w-3" />
                          </Badge>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-0" align="start">
                          <div className="p-2">
                            <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                              Ubah Status
                            </div>
                            <div className="flex flex-col space-y-1">
                              {statusOptions.map((status) => (
                                <Button
                                  key={status}
                                  variant="ghost"
                                  className={`justify-start text-sm h-8 px-2 ${
                                    task.status === status ? "bg-muted" : ""
                                  }`}
                                  onClick={() => {
                                    handleUpdateTaskStatus(task.id, status);
                                  }}
                                >
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        status === "completed"
                                          ? "bg-green-500"
                                          : status === "in-progress"
                                          ? "bg-blue-500"
                                          : status === "pending"
                                          ? "bg-yellow-500"
                                          : "bg-gray-500"
                                      }`}
                                    />
                                    <span className="capitalize">
                                      {status === "in-progress"
                                        ? "In Progress"
                                        : status}
                                    </span>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        <div
                          className={`w-2 h-2 rounded-full ${getPriorityColor(
                            task.priority
                          ).replace("text-", "bg-")}`}
                        />
                        <span className="capitalize text-sm">
                          {task.priority}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {sortedTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No tasks found
            </CardContent>
          </Card>
        ) : (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-card border rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-primary/20"
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
                        className="text-xs cursor-pointer hover:opacity-80 flex items-center gap-1 max-w-fit px-2"
                      >
                        {task.status}
                        <ChevronDown className="h-3 w-3" />
                      </Badge>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-0" align="start">
                      <div className="p-2">
                        <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                          Ubah Status
                        </div>
                        <div className="flex flex-col space-y-1">
                          {statusOptions.map((status) => (
                            <Button
                              key={status}
                              variant="ghost"
                              className={`justify-start text-sm h-8 px-2 ${
                                task.status === status ? "bg-muted" : ""
                              }`}
                              onClick={() => {
                                handleUpdateTaskStatus(task.id, status);
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    status === "completed"
                                      ? "bg-green-500"
                                      : status === "in-progress"
                                      ? "bg-blue-500"
                                      : status === "pending"
                                      ? "bg-yellow-500"
                                      : "bg-gray-500"
                                  }`}
                                />
                                <span className="capitalize">
                                  {status === "in-progress"
                                    ? "In Progress"
                                    : status}
                                </span>
                              </div>
                            </Button>
                          ))}
                        </div>
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
          ))
        )}
      </div>
    </div>
  );
}

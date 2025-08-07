'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Task, ApiResponse, PaginatedResponse } from '@/types';

interface UseTasksOptions {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  assignee_id?: string;
  search?: string;
  tags?: string;
  autoRefresh?: boolean;
  clientSideSearch?: boolean; // New option for client-side search
}

interface UseTasksReturn {
  tasks: Task[];
  allTasks: Task[]; // Expose all tasks for client-side filtering
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  refetch: () => Promise<void>;
  createTask: (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>) => Promise<Task | null>;
  updateTaskStatus: (id: string, status: Task['status']) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const {
    page = 1,
    limit = 10,
    status,
    priority,
    assignee_id,
    search,
    tags,
    autoRefresh = false,
    clientSideSearch = true // Default to client-side search
  } = options;

  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Client-side filtering for search and other filters
  const filteredTasks = useMemo(() => {
    if (!clientSideSearch) {
      return allTasks;
    }

    let filtered = [...allTasks];

    // Apply search filter
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        task.assignee?.name?.toLowerCase().includes(searchLower) ||
        task.creator?.name?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [allTasks, search, clientSideSearch]);

  // Get the tasks to return (either filtered or all)
  const tasks = clientSideSearch ? filteredTasks : allTasks;

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For client-side search, only fetch with non-search filters
      const params = new URLSearchParams({
        page: clientSideSearch ? '1' : page.toString(),
        limit: clientSideSearch ? '1000' : limit.toString() // Fetch more data for client-side filtering
      });

      // Only add server-side filters when not using client-side search
      if (!clientSideSearch) {
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        if (assignee_id) params.append('assignee_id', assignee_id);
        if (search) params.append('search', search);
        if (tags) params.append('tags', tags);
      } else {
        // For client-side search, only apply non-search filters to server
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        if (assignee_id) params.append('assignee_id', assignee_id);
        if (tags) params.append('tags', tags);
      }

      const response = await fetch(`/api/tasks?${params.toString()}`);
      const result: PaginatedResponse<Task> = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      setAllTasks(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, priority, assignee_id, search, tags, clientSideSearch]);

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      const result: ApiResponse<Task> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create task');
      }

      if (result.success && result.data) {
        // Refresh tasks list
        await fetchTasks();
        return result.data;
      }

      throw new Error(result.error || 'Failed to create task');
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>): Promise<Task | null> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      const result: ApiResponse<Task> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update task');
      }

      if (result.success && result.data) {
        // Update local state
        setAllTasks(prev => prev.map(task => 
          task.id === id ? result.data! : task
        ));
        return result.data;
      }

      throw new Error(result.error || 'Failed to update task');
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    }
  };

  const updateTaskStatus = async (id: string, status: Task['status']): Promise<Task | null> => {
    try {
      const response = await fetch(`/api/tasks/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const result: ApiResponse<Task> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update task status');
      }

      if (result.success && result.data) {
        // Update local state
        setAllTasks(prev => prev.map(task => 
          task.id === id ? result.data! : task
        ));
        return result.data;
      }

      throw new Error(result.error || 'Failed to update task status');
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task status');
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      const result: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete task');
      }

      if (result.success) {
        // Remove from local state
        setAllTasks(prev => prev.filter(task => task.id !== id));
        return true;
      }

      throw new Error(result.error || 'Failed to delete task');
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    }
  };

  // Setup real-time subscriptions
  useEffect(() => {
    if (autoRefresh) {
      const channel = supabase
        .channel('tasks-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks'
          },
          () => {
            // Refetch tasks when changes occur
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [autoRefresh, fetchTasks, supabase]);

  // Initial fetch
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    allTasks,
    loading,
    error,
    pagination,
    refetch: fetchTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask
  };
}

// Hook untuk mendapatkan single task
export function useTask(id: string) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tasks/${id}`);
      const result: ApiResponse<Task> = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch task');
      }

      if (result.success && result.data) {
        setTask(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch task');
      }
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchTask();
    }
  }, [id, fetchTask]);

  return {
    task,
    loading,
    error,
    refetch: fetchTask
  };
}
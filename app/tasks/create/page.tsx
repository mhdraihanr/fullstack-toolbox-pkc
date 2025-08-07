"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Tag,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { TaskFormData, Task, User } from "@/types";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import { useTasks } from "@/lib/hooks/useTasks";

export default function CreateTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    priority: "medium",
    assignee_id: undefined,
    due_date: undefined,
    tags: [],
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof TaskFormData, string>>
  >({});
  const [tagInput, setTagInput] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { createTask } = useTasks();

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name");

      if (data && !error) {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TaskFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title cannot be empty";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Create task using useTasks hook
      const newTask = await createTask({
        title: formData.title,
        description: formData.description || "",
        status: "pending",
        priority: formData.priority,
        assignee_id: formData.assignee_id || undefined,
        created_by: "", // Will be set by API from authenticated user
        due_date: formData.due_date || undefined,
        completed_at: undefined,
        tags: formData.tags,
      });

      if (newTask) {
        // Redirect ke halaman tasks
        router.push("/tasks");
      } else {
        setErrors({ title: "Failed to create task. Please try again." });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setErrors({ title: "Failed to create task. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name as keyof TaskFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTagAdd();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Buat Task Baru
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Buat task baru untuk ditugaskan kepada tim Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Task Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    className={`flex h-10 w-full rounded-md border ${
                      errors.title ? "border-red-500" : "border-input"
                    } bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                    placeholder="Enter task title"
                    value={formData.title}
                    onChange={handleChange}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter task description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label
                    htmlFor="priority"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Prioritas
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <label
                    htmlFor="assignee_id"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    PIC
                  </label>
                  <select
                    id="assignee_id"
                    name="assignee_id"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.assignee_id || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Assignee</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <label
                    htmlFor="due_date"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Due Date
                  </label>
                  <input
                    id="due_date"
                    name="due_date"
                    type="datetime-local"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.due_date || ""}
                    onChange={handleChange}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label
                    htmlFor="tags"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Tags
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      id="tag-input"
                      type="text"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Add tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                    />
                    <Button
                      type="button"
                      variant="whiteLine"
                      className="cursor-pointer"
                      onClick={handleTagAdd}
                    >
                      Add
                    </Button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1 px-2 py-1"
                        >
                          {tag}
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleTagRemove(tag)}
                          >
                            &times;
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="whiteLine"
                    className="cursor-pointer"
                    onClick={() => router.push("/tasks")}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="cursor-pointer"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Task"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">
                    {formData.title || "Task Title"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formData.description ||
                      "Task description will appear here"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        formData.priority === "urgent"
                          ? "bg-red-500"
                          : formData.priority === "high"
                          ? "bg-orange-500"
                          : formData.priority === "medium"
                          ? "bg-blue-500"
                          : "bg-green-500"
                      }`}
                    />
                    <span className="capitalize">{formData.priority}</span>
                  </div>

                  {formData.due_date && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(formData.due_date).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  )}

                  {formData.assignee_id && (
                    <div className="flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      <span>
                        {users.find((u) => u.id === formData.assignee_id)
                          ?.name || "Assignee"}
                      </span>
                    </div>
                  )}
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" status="pending">
                      pending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Baru saja</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

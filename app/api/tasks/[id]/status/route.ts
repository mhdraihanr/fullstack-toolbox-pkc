import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Task } from '@/types';

// PATCH /api/tasks/[id]/status - Update status task
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const { status }: { status: Task["status"] } = await request.json();

    // Validate status
    const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status. Must be one of: " + validStatuses.join(", "),
        },
        { status: 400 }
      );
    }

    // Check if user has permission to update this task
    const { data: existingTask, error: fetchError } = await supabase
      .from("tasks")
      .select("created_by, assignee_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Task not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Failed to fetch task" },
        { status: 500 }
      );
    }

    // Get user profile to check role
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // Check permissions
    const isCreator = existingTask.created_by === user.id;
    const isAssignee = existingTask.assignee_id === user.id;
    const isAdminOrManager =
      userProfile?.role === "admin" || userProfile?.role === "manager";

    if (!isCreator && !isAssignee && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Partial<Task> = {
      status,
    };

    // Set completed_at if status is completed
    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = undefined;
    }

    // Update task status
    const { data: task, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        *,
        assignee:assignee_id(id, name, department, role, avatar_url),
        creator:created_by(id, name, department, role, avatar_url)
      `
      )
      .single();

    if (error) {
      console.error("Error updating task status:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update task status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: `Task status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error in PATCH /api/tasks/[id]/status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

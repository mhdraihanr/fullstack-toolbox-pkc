import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TaskFormData, Task } from '@/types';

// GET /api/tasks/[id] - Mendapatkan task berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:assignee_id(id, name, department, role, avatar_url),
        creator:created_by(id, name, department, role, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching task:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('Error in GET /api/tasks/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: Partial<TaskFormData> & { status?: string } = await request.json();
    
    // Check if user has permission to update this task
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('created_by, assignee_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch task' },
        { status: 500 }
      );
    }

    // Get user profile to check role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Check permissions
    const isCreator = existingTask.created_by === user.id;
    const isAssignee = existingTask.assignee_id === user.id;
    const isAdminOrManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';

    if (!isCreator && !isAssignee && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Partial<Task> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.assignee_id !== undefined) updateData.assignee_id = body.assignee_id;
    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.status !== undefined) {
      updateData.status = body.status as Task['status'];
      if (body.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else {
        updateData.completed_at = undefined;
      }
    }

    // Update task
    const { data: task, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        assignee:assignee_id(id, name, department, role, avatar_url),
        creator:created_by(id, name, department, role, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/tasks/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Hapus task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission to delete this task
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Task not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch task' },
        { status: 500 }
      );
    }

    // Get user profile to check role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Check permissions
    const isCreator = existingTask.created_by === user.id;
    const isAdminOrManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';

    if (!isCreator && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Delete task
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/tasks/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
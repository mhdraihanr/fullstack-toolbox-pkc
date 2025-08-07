import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TaskFormData } from '@/types';

// GET /api/tasks - Mendapatkan daftar tasks
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assignee_id = searchParams.get('assignee_id');
    const search = searchParams.get('search');
    const tags = searchParams.get('tags');

    // Build query
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:assignee_id(id, name, department, role, avatar_url),
        creator:created_by(id, name, department, role, avatar_url)
      `);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (priority) {
      query = query.eq('priority', priority);
    }
    if (assignee_id) {
      query = query.eq('assignee_id', assignee_id);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (tags) {
      // Split comma-separated tags and filter tasks that contain any of these tags
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      if (tagArray.length > 0) {
        // Use overlaps operator to check if task tags array overlaps with filter tags
        query = query.overlaps('tags', tagArray);
      }
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tasks' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        totalPages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Membuat task baru
export async function POST(request: NextRequest) {
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
    const body: TaskFormData = await request.json();
    
    // Validate required fields
    if (!body.title || !body.priority) {
      return NextResponse.json(
        { success: false, error: 'Title and priority are required' },
        { status: 400 }
      );
    }

    // Prepare task data
    const taskData = {
      title: body.title,
      description: body.description || null,
      priority: body.priority,
      assignee_id: body.assignee_id || null,
      due_date: body.due_date || null,
      tags: body.tags || [],
      created_by: user.id,
      status: 'pending'
    };

    // Insert task
    const { data: task, error } = await supabase
      .from('tasks')
      .insert(taskData)
      .select(`
        *,
        assignee:assignee_id(id, name, department, role, avatar_url),
        creator:created_by(id, name, department, role, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create task' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
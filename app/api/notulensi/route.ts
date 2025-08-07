import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotulensiFormData } from '@/types';

// GET /api/notulensi - Mendapatkan daftar notulensi
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
    const approved = searchParams.get('approved');
    const created_by = searchParams.get('created_by');
    const meeting_id = searchParams.get('meeting_id');
    const search = searchParams.get('search');
    const is_draft = searchParams.get('is_draft');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    // Build query
    let query = supabase
      .from('notulensi')
      .select(`
        *,
        meeting:meeting_id(
          id,
          title,
          description,
          date_time,
          duration,
          status,
          location,
          meeting_type,
          creator:created_by(id, name, department, role, avatar_url)
        ),
        creator:created_by(id, name, department, role, avatar_url),
        approver:approved_by(id, name, department, role, avatar_url),
        action_items:action_items(
          id,
          description,
          assignee_id,
          due_date,
          priority,
          status,
          completed_at,
          created_at,
          assignee:assignee_id(id, name, department, role, avatar_url)
        )
      `);

    // Apply filters
    if (approved !== null && approved !== undefined) {
      if (approved === 'true') {
        query = query.not('approved_at', 'is', null);
      } else if (approved === 'false') {
        query = query.is('approved_at', null);
      }
    }
    
    if (created_by) {
      query = query.eq('created_by', created_by);
    }
    
    if (meeting_id) {
      query = query.eq('meeting_id', meeting_id);
    }
    
    if (is_draft !== null && is_draft !== undefined) {
      query = query.eq('is_draft', is_draft === 'true');
    }
    
    if (search) {
      query = query.or(`content.ilike.%${search}%,decisions.cs.{"${search}"}`);
    }
    
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data: notulensi, error } = await query;

    if (error) {
      console.error('Error fetching notulensi:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notulensi' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('notulensi')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: {
        data: notulensi || [],
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in GET /api/notulensi:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notulensi - Membuat notulensi baru
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
    const body: NotulensiFormData & { meeting_id: string; is_draft?: boolean } = await request.json();
    
    // Validate required fields
    if (!body.meeting_id || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Meeting ID and content are required' },
        { status: 400 }
      );
    }

    // Verify meeting exists
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title')
      .eq('id', body.meeting_id)
      .single();

    if (meetingError || !meeting) {
      return NextResponse.json(
        { success: false, error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Prepare notulensi data
    const notulensiData = {
      meeting_id: body.meeting_id,
      content: body.content,
      decisions: body.decisions || [],
      next_meeting_date: body.next_meeting_date || null,
      created_by: user.id,
      is_draft: body.is_draft || false
    };

    // Insert notulensi
    const { data: notulensi, error } = await supabase
      .from('notulensi')
      .insert(notulensiData)
      .select(`
        *,
        meeting:meeting_id(
          id,
          title,
          description,
          date_time,
          duration,
          status,
          location,
          meeting_type,
          creator:created_by(id, name, department, role, avatar_url)
        ),
        creator:created_by(id, name, department, role, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating notulensi:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create notulensi' },
        { status: 500 }
      );
    }

    // Add action items if provided
    if (body.action_items && body.action_items.length > 0) {
      const actionItemsData = body.action_items.map(item => ({
        notulensi_id: notulensi.id,
        description: item.description,
        assignee_id: item.assignee_id || null,
        due_date: item.due_date || null,
        priority: item.priority || 'medium',
        status: item.status || 'pending'
      }));

      const { error: actionItemsError } = await supabase
        .from('action_items')
        .insert(actionItemsData);

      if (actionItemsError) {
        console.error('Error adding action items:', actionItemsError);
        // Don't fail the notulensi creation, just log the error
      }
    }

    // Fetch the complete notulensi with action items
    const { data: completeNotulensi } = await supabase
      .from('notulensi')
      .select(`
        *,
        meeting:meeting_id(
          id,
          title,
          description,
          date_time,
          duration,
          status,
          location,
          meeting_type,
          creator:created_by(id, name, department, role, avatar_url)
        ),
        creator:created_by(id, name, department, role, avatar_url),
        action_items:action_items(
          id,
          description,
          assignee_id,
          due_date,
          priority,
          status,
          completed_at,
          created_at,
          assignee:assignee_id(id, name, department, role, avatar_url)
        )
      `)
      .eq('id', notulensi.id)
      .single();

    return NextResponse.json({
      success: true,
      data: completeNotulensi || notulensi,
      message: 'Notulensi created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/notulensi:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
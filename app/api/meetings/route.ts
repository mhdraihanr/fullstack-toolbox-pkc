import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MeetingFormData } from '@/types';

// GET /api/meetings - Mendapatkan daftar meetings
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
    const meeting_type = searchParams.get('meeting_type');
    const created_by = searchParams.get('created_by');
    const search = searchParams.get('search');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    // Build query
    let query = supabase
      .from('meetings')
      .select(`
        *,
        creator:created_by(id, name, department, role, avatar_url),
        participants:meeting_participants(
          id,
          status,
          user:user_id(id, name, department, role, avatar_url)
        )
      `);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (meeting_type) {
      query = query.eq('meeting_type', meeting_type);
    }
    if (created_by) {
      query = query.eq('created_by', created_by);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (date_from) {
      query = query.gte('date_time', date_from);
    }
    if (date_to) {
      query = query.lte('date_time', date_to);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query
      .order('date_time', { ascending: true })
      .range(from, to);

    const { data: meetings, error } = await query;

    if (error) {
      console.error('Error fetching meetings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch meetings' },
        { status: 500 }
      );
    }

    // Get total count for pagination with same filters
    let countQuery = supabase
      .from('meetings')
      .select('*', { count: 'exact', head: true });

    // Apply same filters for count
    if (status) {
      countQuery = countQuery.eq('status', status);
    }
    if (meeting_type) {
      countQuery = countQuery.eq('meeting_type', meeting_type);
    }
    if (created_by) {
      countQuery = countQuery.eq('created_by', created_by);
    }
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    if (date_from) {
      countQuery = countQuery.gte('date_time', date_from);
    }
    if (date_to) {
      countQuery = countQuery.lte('date_time', date_to);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      success: true,
      data: {
        data: meetings,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          totalPages: Math.ceil((totalCount || 0) / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error in GET /api/meetings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/meetings - Membuat meeting baru
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
    const body: MeetingFormData = await request.json();
    
    // Validate required fields
    if (!body.title || !body.date_time || !body.duration) {
      return NextResponse.json(
        { success: false, error: 'Title, date_time, and duration are required' },
        { status: 400 }
      );
    }

    // Prepare meeting data
    const meetingData = {
      title: body.title,
      description: body.description || null,
      date_time: body.date_time,
      duration: body.duration,
      location: body.location || null,
      meeting_type: body.meeting_type || 'onsite',
      meeting_link: body.meeting_link || null,
      agenda: body.agenda || [],
      created_by: user.id,
      status: 'scheduled'
    };

    // Insert meeting
    const { data: meeting, error } = await supabase
      .from('meetings')
      .insert(meetingData)
      .select(`
        *,
        creator:created_by(id, name, department, role, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating meeting:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create meeting' },
        { status: 500 }
      );
    }

    // Add participants if provided
    if (body.participant_ids && body.participant_ids.length > 0) {
      const participantData = body.participant_ids.map(userId => ({
        meeting_id: meeting.id,
        user_id: userId,
        status: 'invited'
      }));

      const { error: participantError } = await supabase
        .from('meeting_participants')
        .insert(participantData);

      if (participantError) {
        console.error('Error adding participants:', participantError);
        // Don't fail the meeting creation, just log the error
      }
    }

    // Fetch the complete meeting with participants
    const { data: completeMeeting } = await supabase
      .from('meetings')
      .select(`
        *,
        creator:created_by(id, name, department, role, avatar_url),
        participants:meeting_participants(
          id,
          status,
          user:user_id(id, name, department, role, avatar_url)
        )
      `)
      .eq('id', meeting.id)
      .single();

    return NextResponse.json({
      success: true,
      data: completeMeeting || meeting,
      message: 'Meeting created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/meetings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
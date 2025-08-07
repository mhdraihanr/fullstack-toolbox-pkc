import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/meetings/[id]/participants - Mendapatkan daftar participants
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

    // Check if meeting exists
    const { error: meetingError } = await supabase
      .from('meetings')
      .select('id, title')
      .eq('id', id)
      .single();

    if (meetingError) {
      if (meetingError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Meeting not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch meeting' },
        { status: 500 }
      );
    }

    // Get participants
    const { data: participants, error } = await supabase
      .from('meeting_participants')
      .select(`
        id,
        status,
        created_at,
        user:user_id(id, name, department, role, avatar_url)
      `)
      .eq('meeting_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching participants:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch participants' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: participants
    });

  } catch (error) {
    console.error('Error in GET /api/meetings/[id]/participants:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/meetings/[id]/participants - Tambah participant
export async function POST(
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
    const body = await request.json();
    const { user_ids, status = 'invited' } = body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'user_ids array is required' },
        { status: 400 }
      );
    }

    // Check if user has permission to add participants
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('created_by')
      .eq('id', id)
      .single();

    if (meetingError) {
      if (meetingError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Meeting not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch meeting' },
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
    const isCreator = meeting.created_by === user.id;
    const isAdminOrManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';

    if (!isCreator && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Prepare participant data
    const participantData = user_ids.map((userId: string) => ({
      meeting_id: id,
      user_id: userId,
      status
    }));

    // Insert participants (use upsert to handle duplicates)
    const { data: participants, error } = await supabase
      .from('meeting_participants')
      .upsert(participantData, {
        onConflict: 'meeting_id,user_id',
        ignoreDuplicates: false
      })
      .select(`
        id,
        status,
        created_at,
        user:user_id(id, name, department, role, avatar_url)
      `);

    if (error) {
      console.error('Error adding participants:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to add participants' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: participants,
      message: `${participants?.length || 0} participant(s) added successfully`
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/meetings/[id]/participants:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
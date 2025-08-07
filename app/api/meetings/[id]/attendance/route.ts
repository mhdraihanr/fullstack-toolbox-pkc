import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/meetings/[id]/attendance - Mendapatkan daftar attendance
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
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, date_time')
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

    // Get attendance records
    const { data: attendance, error } = await supabase
      .from('meeting_attendance')
      .select(`
        id,
        checked_in_at,
        check_in_method,
        location_lat,
        location_lng,
        device_info,
        created_at,
        user:user_id(id, name, department, role, avatar_url)
      `)
      .eq('meeting_id', id)
      .order('checked_in_at', { ascending: true });

    if (error) {
      console.error('Error fetching attendance:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch attendance' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        meeting: {
          id: meeting.id,
          title: meeting.title,
          date_time: meeting.date_time
        },
        attendance: attendance || []
      }
    });

  } catch (error) {
    console.error('Error in GET /api/meetings/[id]/attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/meetings/[id]/attendance - Check-in attendance
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
    const {
      user_id = user.id, // Default to current user
      check_in_method = 'manual',
      location_lat,
      location_lng,
      device_info
    } = body;

    // Validate check_in_method
    if (!['qr_code', 'manual', 'auto'].includes(check_in_method)) {
      return NextResponse.json(
        { success: false, error: 'Invalid check_in_method' },
        { status: 400 }
      );
    }

    // Check if meeting exists
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, date_time, created_by')
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

    // Check permissions for checking in other users
    if (user_id !== user.id) {
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const isCreator = meeting.created_by === user.id;
      const isAdminOrManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';

      if (!isCreator && !isAdminOrManager) {
        return NextResponse.json(
          { success: false, error: 'Insufficient permissions to check in other users' },
          { status: 403 }
        );
      }
    }

    // Check if user is a participant
    const { data: participant } = await supabase
      .from('meeting_participants')
      .select('id')
      .eq('meeting_id', id)
      .eq('user_id', user_id)
      .single();

    if (!participant) {
      return NextResponse.json(
        { success: false, error: 'User is not a participant of this meeting' },
        { status: 400 }
      );
    }

    // Check if already checked in
    const { data: existingAttendance } = await supabase
      .from('meeting_attendance')
      .select('id')
      .eq('meeting_id', id)
      .eq('user_id', user_id)
      .single();

    if (existingAttendance) {
      return NextResponse.json(
        { success: false, error: 'User already checked in' },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendanceData = {
      meeting_id: id,
      user_id,
      checked_in_at: new Date().toISOString(),
      check_in_method,
      location_lat: location_lat || null,
      location_lng: location_lng || null,
      device_info: device_info || null
    };

    const { data: attendance, error } = await supabase
      .from('meeting_attendance')
      .insert(attendanceData)
      .select(`
        id,
        checked_in_at,
        check_in_method,
        location_lat,
        location_lng,
        device_info,
        created_at,
        user:user_id(id, name, department, role, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error creating attendance:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to check in' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: attendance,
      message: 'Successfully checked in'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/meetings/[id]/attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
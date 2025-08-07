import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MeetingFormData, Meeting } from '@/types';

// GET /api/meetings/[id] - Mendapatkan meeting berdasarkan ID
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

    const { data: meeting, error } = await supabase
      .from('meetings')
      .select(`
        *,
        creator:created_by(id, name, department, role, avatar_url),
        participants:meeting_participants(
          id,
          status,
          user:user_id(id, name, department, role, avatar_url)
        ),
        attendance:meeting_attendance(
          id,
          checked_in_at,
          check_in_method,
          location_lat,
          location_lng,
          device_info,
          user:user_id(id, name, department, role, avatar_url)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Meeting not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching meeting:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch meeting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: meeting
    });

  } catch (error) {
    console.error('Error in GET /api/meetings/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/meetings/[id] - Update meeting
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
    const body: Partial<MeetingFormData> & { status?: string } = await request.json();
    
    // Check if user has permission to update this meeting
    const { data: existingMeeting, error: fetchError } = await supabase
      .from('meetings')
      .select('created_by')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
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
    const isCreator = existingMeeting.created_by === user.id;
    const isAdminOrManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';

    if (!isCreator && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Partial<Meeting> = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date_time !== undefined) updateData.date_time = body.date_time;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.meeting_type !== undefined) updateData.meeting_type = body.meeting_type;
    if (body.meeting_link !== undefined) updateData.meeting_link = body.meeting_link;
    if (body.agenda !== undefined) updateData.agenda = body.agenda;
    if (body.status !== undefined) {
      updateData.status = body.status as Meeting['status'];
    }

    // Update meeting
    const { data: meeting, error } = await supabase
      .from('meetings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        creator:created_by(id, name, department, role, avatar_url),
        participants:meeting_participants(
          id,
          status,
          user:user_id(id, name, department, role, avatar_url)
        )
      `)
      .single();

    if (error) {
      console.error('Error updating meeting:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update meeting' },
        { status: 500 }
      );
    }

    // Update participants if provided
    if (body.participant_ids !== undefined) {
      // Remove existing participants
      await supabase
        .from('meeting_participants')
        .delete()
        .eq('meeting_id', id);

      // Add new participants
      if (body.participant_ids.length > 0) {
        const participantData = body.participant_ids.map(userId => ({
          meeting_id: id,
          user_id: userId,
          status: 'invited'
        }));

        const { error: participantError } = await supabase
          .from('meeting_participants')
          .insert(participantData);

        if (participantError) {
          console.error('Error updating participants:', participantError);
        }
      }

      // Fetch updated meeting with participants
      const { data: updatedMeeting } = await supabase
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
        .eq('id', id)
        .single();

      return NextResponse.json({
        success: true,
        data: updatedMeeting || meeting,
        message: 'Meeting updated successfully'
      });
    }

    return NextResponse.json({
      success: true,
      data: meeting,
      message: 'Meeting updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/meetings/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[id] - Hapus meeting
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

    // Check if user has permission to delete this meeting
    const { data: existingMeeting, error: fetchError } = await supabase
      .from('meetings')
      .select('created_by, title')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
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
    const isCreator = existingMeeting.created_by === user.id;
    const isAdminOrManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';

    if (!isCreator && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to delete this meeting' },
        { status: 403 }
      );
    }

    // Delete meeting (cascade will handle participants and attendance)
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meeting:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete meeting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Meeting "${existingMeeting.title}" deleted successfully`
    });

  } catch (error) {
    console.error('Error in DELETE /api/meetings/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
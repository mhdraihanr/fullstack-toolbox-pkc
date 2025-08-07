import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { NotulensiFormData } from '@/types';

// GET /api/notulensi/[id] - Mendapatkan detail notulensi
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

    // Fetch notulensi with all related data
    const { data: notulensi, error } = await supabase
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
          agenda,
          creator:created_by(id, name, department, role, avatar_url),
          participants:meeting_participants(
            id,
            status,
            user:user_id(id, name, department, role, avatar_url)
          )
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
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching notulensi:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Notulensi not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notulensi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notulensi
    });

  } catch (error) {
    console.error('Error in GET /api/notulensi/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/notulensi/[id] - Update notulensi
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
    const body: Partial<NotulensiFormData> & { 
      is_draft?: boolean;
      approved_by?: string;
      approved_at?: string;
    } = await request.json();

    // Check if notulensi exists and user has permission
    const { data: existingNotulensi, error: fetchError } = await supabase
      .from('notulensi')
      .select('id, created_by, approved_at')
      .eq('id', id)
      .single();

    if (fetchError || !existingNotulensi) {
      return NextResponse.json(
        { success: false, error: 'Notulensi not found' },
        { status: 404 }
      );
    }

    // Check permissions - only creator can edit, unless it's approval
    const isApprovalAction = body.approved_by !== undefined || body.approved_at !== undefined;
    if (!isApprovalAction && existingNotulensi.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only edit your own notulensi' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (body.content !== undefined) updateData.content = body.content;
    if (body.decisions !== undefined) updateData.decisions = body.decisions;
    if (body.next_meeting_date !== undefined) updateData.next_meeting_date = body.next_meeting_date;
    if (body.is_draft !== undefined) updateData.is_draft = body.is_draft;
    
    // Handle approval
    if (isApprovalAction) {
      if (body.approved_by) {
        updateData.approved_by = body.approved_by;
        updateData.approved_at = new Date().toISOString();
      } else if (body.approved_at === null) {
        // Unapprove
        updateData.approved_by = null;
        updateData.approved_at = null;
      }
    }

    // Update notulensi
    const { data: updatedNotulensi, error: updateError } = await supabase
      .from('notulensi')
      .update(updateData)
      .eq('id', id)
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
        approver:approved_by(id, name, department, role, avatar_url)
      `)
      .single();

    if (updateError) {
      console.error('Error updating notulensi:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update notulensi' },
        { status: 500 }
      );
    }

    // Update action items if provided
    if (body.action_items) {
      // Delete existing action items
      await supabase
        .from('action_items')
        .delete()
        .eq('notulensi_id', id);

      // Insert new action items
      if (body.action_items.length > 0) {
        const actionItemsData = body.action_items.map(item => ({
          notulensi_id: id,
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
          console.error('Error updating action items:', actionItemsError);
        }
      }
    }

    // Fetch complete updated notulensi
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
      `)
      .eq('id', id)
      .single();

    return NextResponse.json({
      success: true,
      data: completeNotulensi || updatedNotulensi,
      message: 'Notulensi updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/notulensi/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notulensi/[id] - Hapus notulensi
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

    // Check if notulensi exists and user has permission
    const { data: existingNotulensi, error: fetchError } = await supabase
      .from('notulensi')
      .select('id, created_by, approved_at')
      .eq('id', id)
      .single();

    if (fetchError || !existingNotulensi) {
      return NextResponse.json(
        { success: false, error: 'Notulensi not found' },
        { status: 404 }
      );
    }

    // Check permissions - only creator can delete, and only if not approved
    if (existingNotulensi.created_by !== user.id) {
      return NextResponse.json(
        { success: false, error: 'You can only delete your own notulensi' },
        { status: 403 }
      );
    }

    if (existingNotulensi.approved_at) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete approved notulensi' },
        { status: 403 }
      );
    }

    // Delete action items first (cascade)
    await supabase
      .from('action_items')
      .delete()
      .eq('notulensi_id', id);

    // Delete notulensi
    const { error: deleteError } = await supabase
      .from('notulensi')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting notulensi:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete notulensi' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notulensi deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/notulensi/[id]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
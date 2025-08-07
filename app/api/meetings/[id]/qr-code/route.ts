import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/meetings/[id]/qr-code - Generate QR code untuk check-in
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

    // Check if meeting exists and get details
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('id, title, date_time, created_by, qr_code_url, qr_code_expires_at')
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

    // Check permissions - only creator, admin, or manager can generate QR codes
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isCreator = meeting.created_by === user.id;
    const isAdminOrManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';

    if (!isCreator && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to generate QR code' },
        { status: 403 }
      );
    }

    // Check if existing QR code is still valid (expires in 24 hours)
    const now = new Date();
    const expiresAt = meeting.qr_code_expires_at ? new Date(meeting.qr_code_expires_at) : null;
    
    if (meeting.qr_code_url && expiresAt && expiresAt > now) {
      // Return existing valid QR code
      return NextResponse.json({
        success: true,
        data: {
          qr_code_url: meeting.qr_code_url,
          expires_at: meeting.qr_code_expires_at,
          check_in_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/meetings/${id}/check-in`
        }
      });
    }

    // Generate new QR code data
    const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/meetings/${id}/check-in`;
    const qrCodeData = {
      meeting_id: id,
      meeting_title: meeting.title,
      check_in_url: checkInUrl,
      generated_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // For this implementation, we'll use a simple QR code service
    // In production, you might want to use a more robust QR code generation service
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}`;
    
    // Update meeting with new QR code info
    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        qr_code_url: qrCodeUrl,
        qr_code_expires_at: qrCodeData.expires_at
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating meeting with QR code:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate QR code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        qr_code_url: qrCodeUrl,
        expires_at: qrCodeData.expires_at,
        check_in_url: checkInUrl,
        meeting: {
          id: meeting.id,
          title: meeting.title,
          date_time: meeting.date_time
        }
      },
      message: 'QR code generated successfully'
    });

  } catch (error) {
    console.error('Error in GET /api/meetings/[id]/qr-code:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/meetings/[id]/qr-code - Regenerate QR code
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

    // Check permissions
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const isCreator = meeting.created_by === user.id;
    const isAdminOrManager = userProfile?.role === 'admin' || userProfile?.role === 'manager';

    if (!isCreator && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to regenerate QR code' },
        { status: 403 }
      );
    }

    // Force regenerate QR code
    const now = new Date();
    const checkInUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/meetings/${id}/check-in`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}&t=${now.getTime()}`;
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    
    // Update meeting with new QR code info
    const { error: updateError } = await supabase
      .from('meetings')
      .update({
        qr_code_url: qrCodeUrl,
        qr_code_expires_at: expiresAt
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating meeting with new QR code:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to regenerate QR code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        qr_code_url: qrCodeUrl,
        expires_at: expiresAt,
        check_in_url: checkInUrl,
        meeting: {
          id: meeting.id,
          title: meeting.title,
          date_time: meeting.date_time
        }
      },
      message: 'QR code regenerated successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/meetings/[id]/qr-code:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
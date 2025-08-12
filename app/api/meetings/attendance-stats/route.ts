import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/meetings/attendance-stats - Mendapatkan statistik attendance untuk semua meetings
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

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    
    const startDate = new Date(parseInt(year), 0, 1).toISOString();
    const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59).toISOString();

    // Fetch meetings with participants and attendance data
    const { data: meetings, error } = await supabase
      .from('meetings')
      .select(`
        id,
        date_time,
        status,
        meeting_participants!inner(
          user_id,
          status
        ),
        meeting_attendance(
          user_id,
          checked_in_at
        )
      `)
      .gte('date_time', startDate)
      .lte('date_time', endDate)
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching attendance stats:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch attendance stats' },
        { status: 500 }
      );
    }

    // Process data by month
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyStats = monthNames.map((month, index) => {
      const monthMeetings = meetings?.filter(meeting => {
        const meetingDate = new Date(meeting.date_time);
        return meetingDate.getMonth() === index;
      }) || [];

      const totalMeetings = monthMeetings.length;
      let totalParticipants = 0;
      let totalAttendees = 0;

      monthMeetings.forEach(meeting => {
        // Count accepted participants
        const participants = meeting.meeting_participants?.filter(
          p => p.status === 'accepted'
        ).length || 0;
        
        // Count actual attendees
        const attendees = meeting.meeting_attendance?.length || 0;
        
        totalParticipants += participants;
        totalAttendees += attendees;
      });

      const attendanceRate = totalParticipants > 0 
        ? Math.round((totalAttendees / totalParticipants) * 100)
        : 0;

      return {
        month,
        totalMeetings,
        totalParticipants,
        totalAttendees,
        attendanceRate
      };
    });

    return NextResponse.json({
      success: true,
      data: monthlyStats
    });

  } catch (error) {
    console.error('Error in GET /api/meetings/attendance-stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
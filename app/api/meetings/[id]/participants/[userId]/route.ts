import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/meetings/[id]/participants/[userId] - Update participant status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    if (
      !status ||
      !["invited", "accepted", "declined", "tentative"].includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Valid status is required (invited, accepted, declined, tentative)",
        },
        { status: 400 }
      );
    }

    // Check if participant exists
    const { error: participantError } = await supabase
      .from("meeting_participants")
      .select("id, meeting_id, user_id")
      .eq("meeting_id", id)
      .eq("user_id", userId)
      .single();

    if (participantError) {
      if (participantError.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Participant not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Failed to fetch participant" },
        { status: 500 }
      );
    }

    // Check permissions
    const { data: meeting } = await supabase
      .from("meetings")
      .select("created_by")
      .eq("id", id)
      .single();

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isCreator = meeting?.created_by === user.id;
    const isParticipant = userId === user.id;
    const isAdminOrManager =
      userProfile?.role === "admin" || userProfile?.role === "manager";

    if (!isCreator && !isParticipant && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Update participant status
    const { data: updatedParticipant, error } = await supabase
      .from("meeting_participants")
      .update({ status })
      .eq("meeting_id", id)
      .eq("user_id", userId)
      .select(
        `
        id,
        status,
        created_at,
        user:user_id(id, name, department, role, avatar_url)
      `
      )
      .single();

    if (error) {
      console.error("Error updating participant:", error);
      return NextResponse.json(
        { success: false, error: "Failed to update participant status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedParticipant,
      message: "Participant status updated successfully",
    });
  } catch (error) {
    console.error(
      "Error in PUT /api/meetings/[id]/participants/[userId]:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/meetings/[id]/participants/[userId] - Remove participant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  try {
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if participant exists
    const { data: participant, error: participantError } = await supabase
      .from("meeting_participants")
      .select(
        `
        id,
        user:user_id(name)
      `
      )
      .eq("meeting_id", id)
      .eq("user_id", userId)
      .single();

    if (participantError) {
      if (participantError.code === "PGRST116") {
        return NextResponse.json(
          { success: false, error: "Participant not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Failed to fetch participant" },
        { status: 500 }
      );
    }

    // Check permissions
    const { data: meeting } = await supabase
      .from("meetings")
      .select("created_by")
      .eq("id", id)
      .single();

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isCreator = meeting?.created_by === user.id;
    const isParticipant = userId === user.id;
    const isAdminOrManager =
      userProfile?.role === "admin" || userProfile?.role === "manager";

    if (!isCreator && !isParticipant && !isAdminOrManager) {
      return NextResponse.json(
        { success: false, error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Delete participant
    const { error } = await supabase
      .from("meeting_participants")
      .delete()
      .eq("meeting_id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error removing participant:", error);
      return NextResponse.json(
        { success: false, error: "Failed to remove participant" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Participant "${
        participant.user && typeof participant.user === 'object' && 'name' in participant.user
          ? participant.user.name || "Unknown"
          : "Unknown"
      }" removed successfully`,
    });
  } catch (error) {
    console.error(
      "Error in DELETE /api/meetings/[id]/participants/[userId]:",
      error
    );
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

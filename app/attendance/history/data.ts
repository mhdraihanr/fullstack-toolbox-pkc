import { getMeetingsWithUsers, mockUsers } from "../../../lib/mockData";

// Attendance data interfaces
export interface AttendanceRecord {
  id: string;
  meetingId: string;
  meetingTitle: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  department?: string;
  checkedInAt: string;
  checkInMethod: "qr_code" | "manual" | "auto";
  isLate: boolean;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  deviceInfo?: string;
}

export interface QRCodeData {
  meetingId: string;
  meetingTitle: string;
  qrCodeUrl: string;
  expiresAt: string;
  isActive: boolean;
  scansCount: number;
  generatedAt: string;
}

export interface AttendanceStats {
  totalAttendees: number;
  onTimeAttendees: number;
  lateAttendees: number;
  absentees: number;
  qrCodeScans: number;
  manualCheckIns: number;
  autoCheckIns: number;
  attendanceRate: number;
  punctualityRate: number;
}

export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  accuracy?: number;
  timestamp: string;
}

// Generate mock attendance records
export function getAttendanceRecords(meetingId?: string): AttendanceRecord[] {
  const meetings = getMeetingsWithUsers();
  const users = mockUsers;
  const records: AttendanceRecord[] = [];

  const targetMeetings = meetingId
    ? meetings.filter((m) => m.id === meetingId)
    : meetings;

  targetMeetings.forEach((meeting) => {
    // Simulate 70-90% attendance rate
    const attendanceRate = 0.7 + Math.random() * 0.2;
    const attendingUsers = users.slice(
      0,
      Math.floor(users.length * attendanceRate)
    );

    attendingUsers.forEach((user, index) => {
      const meetingStart = new Date(meeting.date_time);
      const checkedInAt = new Date(meetingStart);

      // Simulate check-in times: 80% on time, 20% late
      if (Math.random() < 0.8) {
        // On time: 5-15 minutes early
        checkedInAt.setMinutes(
          checkedInAt.getMinutes() - (Math.random() * 10 + 5)
        );
      } else {
        // Late: 1-30 minutes late
        checkedInAt.setMinutes(
          checkedInAt.getMinutes() + (Math.random() * 29 + 1)
        );
      }

      const isLate = checkedInAt > meetingStart;

      // Simulate check-in methods: 70% QR code, 20% manual, 10% auto
      let checkInMethod: "qr_code" | "manual" | "auto";
      const methodRandom = Math.random();
      if (methodRandom < 0.7) {
        checkInMethod = "qr_code";
      } else if (methodRandom < 0.9) {
        checkInMethod = "manual";
      } else {
        checkInMethod = "auto";
      }

      records.push({
        id: `${meeting.id}-${user.id}`,
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar_url,
        department: user.department,
        checkedInAt: checkedInAt.toISOString(),
        checkInMethod,
        isLate,
        location: {
          lat: -6.2088 + (Math.random() - 0.5) * 0.01, // Around Cikampek area
          lng: 106.8456 + (Math.random() - 0.5) * 0.01,
          address:
            meeting.meeting_type === "virtual"
              ? "Remote Location"
              : "PT Pupuk Kujang, Cikampek",
        },
        deviceInfo: `${Math.random() > 0.5 ? "Android" : "iOS"} ${
          Math.random() > 0.5 ? "Mobile App" : "Web Browser"
        }`,
      });
    });
  });

  return records.sort(
    (a, b) =>
      new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime()
  );
}

// Generate QR codes for active meetings
export function getActiveQRCodes(): QRCodeData[] {
  const meetings = getMeetingsWithUsers();
  const now = new Date();

  return meetings
    .filter((meeting) => {
      const meetingDate = new Date(meeting.date_time);
      const meetingEnd = new Date(
        meetingDate.getTime() + meeting.duration * 60000
      );
      return (
        meeting.status === "scheduled" ||
        (meeting.status === "in-progress" && now <= meetingEnd)
      );
    })
    .map((meeting) => {
      const meetingDate = new Date(meeting.date_time);
      const expiresAt = new Date(
        meetingDate.getTime() + (meeting.duration + 30) * 60000
      ); // 30 min buffer

      return {
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=meeting-checkin-${
          meeting.id
        }-${Date.now()}`,
        expiresAt: expiresAt.toISOString(),
        isActive: now < expiresAt,
        scansCount: Math.floor(Math.random() * 25) + 5, // 5-30 scans
        generatedAt: new Date(meetingDate.getTime() - 60 * 60000).toISOString(), // 1 hour before meeting
      };
    });
}

// Get attendance statistics
export function getAttendanceStats(meetingId?: string): AttendanceStats {
  const records = getAttendanceRecords(meetingId);
  const meetings = getMeetingsWithUsers();
  const users = mockUsers;

  const targetMeetings = meetingId
    ? meetings.filter((m) => m.id === meetingId)
    : meetings;
  const totalInvited = targetMeetings.reduce((sum, meeting) => {
    return sum + (meeting.participants?.length || users.length);
  }, 0);

  const totalAttendees = records.length;
  const onTimeAttendees = records.filter((r) => !r.isLate).length;
  const lateAttendees = records.filter((r) => r.isLate).length;
  const absentees = totalInvited - totalAttendees;

  const qrCodeScans = records.filter(
    (r) => r.checkInMethod === "qr_code"
  ).length;
  const manualCheckIns = records.filter(
    (r) => r.checkInMethod === "manual"
  ).length;
  const autoCheckIns = records.filter((r) => r.checkInMethod === "auto").length;

  const attendanceRate =
    totalInvited > 0 ? (totalAttendees / totalInvited) * 100 : 0;
  const punctualityRate =
    totalAttendees > 0 ? (onTimeAttendees / totalAttendees) * 100 : 0;

  return {
    totalAttendees,
    onTimeAttendees,
    lateAttendees,
    absentees,
    qrCodeScans,
    manualCheckIns,
    autoCheckIns,
    attendanceRate,
    punctualityRate,
  };
}

// Generate QR code for specific meeting
export function generateMeetingQRCode(meetingId: string): QRCodeData | null {
  const meetings = getMeetingsWithUsers();
  const meeting = meetings.find((m) => m.id === meetingId);

  if (!meeting) return null;

  const meetingDate = new Date(meeting.date_time);
  const expiresAt = new Date(
    meetingDate.getTime() + (meeting.duration + 30) * 60000
  );
  const now = new Date();

  return {
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=meeting-checkin-${
      meeting.id
    }-${Date.now()}`,
    expiresAt: expiresAt.toISOString(),
    isActive: now < expiresAt,
    scansCount: 0,
    generatedAt: now.toISOString(),
  };
}

// Simulate QR code scan check-in
export function processQRCodeCheckIn(
  meetingId: string,
  userId: string,
  location?: LocationData
): { success: boolean; message: string; record?: AttendanceRecord } {
  const meetings = getMeetingsWithUsers();
  const users = mockUsers;
  const meeting = meetings.find((m) => m.id === meetingId);
  const user = users.find((u) => u.id === userId);

  if (!meeting) {
    return { success: false, message: "Meeting tidak ditemukan" };
  }

  if (!user) {
    return { success: false, message: "User tidak ditemukan" };
  }

  const now = new Date();
  const meetingStart = new Date(meeting.date_time);
  const meetingEnd = new Date(
    meetingStart.getTime() + (meeting.duration + 30) * 60000
  );

  if (now > meetingEnd) {
    return { success: false, message: "QR Code sudah expired" };
  }

  // Check if already checked in
  const existingRecords = getAttendanceRecords(meetingId);
  const alreadyCheckedIn = existingRecords.find((r) => r.userId === userId);

  if (alreadyCheckedIn) {
    return {
      success: false,
      message: "Anda sudah melakukan check-in untuk meeting ini",
    };
  }

  const isLate = now > meetingStart;

  const record: AttendanceRecord = {
    id: `${meetingId}-${userId}-${Date.now()}`,
    meetingId,
    meetingTitle: meeting.title,
    userId,
    userName: user.name,
    userAvatar: user.avatar_url,
    department: user.department,
    checkedInAt: now.toISOString(),
    checkInMethod: "qr_code",
    isLate,
    location: location || {
      lat: -6.2088,
      lng: 106.8456,
      address: "PT Pupuk Kujang, Cikampek",
    },
    deviceInfo: "Mobile QR Scanner",
  };

  return {
    success: true,
    message: `Check-in berhasil! ${
      isLate ? "Anda terlambat." : "Anda tepat waktu."
    }`,
    record,
  };
}

// Manual check-in by admin
export function processManualCheckIn(
  meetingId: string,
  userId: string,
  adminId: string
): { success: boolean; message: string; record?: AttendanceRecord } {
  const meetings = getMeetingsWithUsers();
  const users = mockUsers;
  const meeting = meetings.find((m) => m.id === meetingId);
  const user = users.find((u) => u.id === userId);
  const admin = users.find((u) => u.id === adminId);

  if (!meeting || !user || !admin) {
    return { success: false, message: "Data tidak valid" };
  }

  if (admin.role !== "admin" && admin.role !== "manager") {
    return {
      success: false,
      message: "Tidak memiliki permission untuk manual check-in",
    };
  }

  const now = new Date();
  const meetingStart = new Date(meeting.date_time);
  const isLate = now > meetingStart;

  const record: AttendanceRecord = {
    id: `${meetingId}-${userId}-manual-${Date.now()}`,
    meetingId,
    meetingTitle: meeting.title,
    userId,
    userName: user.name,
    userAvatar: user.avatar_url,
    department: user.department,
    checkedInAt: now.toISOString(),
    checkInMethod: "manual",
    isLate,
    location: {
      lat: -6.2088,
      lng: 106.8456,
      address: "PT Pupuk Kujang, Cikampek",
    },
    deviceInfo: `Manual check-in by ${admin.name}`,
  };

  return {
    success: true,
    message: "Manual check-in berhasil",
    record,
  };
}

// Get attendance by department
export function getAttendanceByDepartment(): {
  department: string;
  stats: AttendanceStats;
}[] {
  const users = mockUsers;
  const departments = [
    ...new Set(users.map((u) => u.department).filter(Boolean)),
  ] as string[];

  return departments.map((department) => {
    const deptUsers = users.filter((u) => u.department === department);
    const deptUserIds = deptUsers.map((u) => u.id);
    const deptRecords = getAttendanceRecords().filter((r) =>
      deptUserIds.includes(r.userId)
    );

    const totalAttendees = deptRecords.length;
    const onTimeAttendees = deptRecords.filter((r) => !r.isLate).length;
    const lateAttendees = deptRecords.filter((r) => r.isLate).length;

    return {
      department,
      stats: {
        totalAttendees,
        onTimeAttendees,
        lateAttendees,
        absentees: 0, // Would need meeting invitation data
        qrCodeScans: deptRecords.filter((r) => r.checkInMethod === "qr_code")
          .length,
        manualCheckIns: deptRecords.filter((r) => r.checkInMethod === "manual")
          .length,
        autoCheckIns: deptRecords.filter((r) => r.checkInMethod === "auto")
          .length,
        attendanceRate: 85, // Mock data
        punctualityRate:
          totalAttendees > 0 ? (onTimeAttendees / totalAttendees) * 100 : 0,
      },
    };
  });
}

// Export attendance data
export function exportAttendanceData(
  records: AttendanceRecord[],
  format: "csv" | "json" = "csv"
): string {
  if (format === "json") {
    return JSON.stringify(records, null, 2);
  }

  // CSV format
  const headers = [
    "Meeting",
    "Name",
    "Department",
    "Check-in Time",
    "Method",
    "Status",
    "Location",
    "Device",
  ];

  const csvRows = [
    headers.join(","),
    ...records.map((record) =>
      [
        `"${record.meetingTitle}"`,
        `"${record.userName}"`,
        `"${record.department || ""}"`,
        `"${new Date(record.checkedInAt).toLocaleString()}"`,
        `"${record.checkInMethod.replace("_", " ")}"`,
        `"${record.isLate ? "Late" : "On Time"}"`,
        `"${record.location?.address || ""}"`,
        `"${record.deviceInfo || ""}"`,
      ].join(",")
    ),
  ];

  return csvRows.join("\n");
}

// Get real-time attendance updates
export function getRealtimeAttendanceUpdates() {
  return [
    {
      id: "1",
      type: "checkin",
      message: "Budi Santoso checked in via QR Code",
      timestamp: new Date(Date.now() - 30000), // 30 seconds ago
      meetingId: "1",
      userId: "3",
    },
    {
      id: "2",
      type: "late_checkin",
      message: "Dewi Lestari checked in 5 minutes late",
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      meetingId: "1",
      userId: "4",
    },
    {
      id: "3",
      type: "qr_generated",
      message: 'QR Code generated for "Rapat Evaluasi Produksi"',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      meetingId: "1",
    },
  ];
}

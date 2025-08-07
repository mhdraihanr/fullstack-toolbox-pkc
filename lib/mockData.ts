import {
  User,
  Task,
  Meeting,
  Notulensi,
  Notification,
  MeetingParticipant,
  ActionItem,
} from "@/types";

// Mock Users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Ahmad Suryadi",
    role: "admin",
    department: "IT",
    avatar_url: "/avatars/admin.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Siti Nurhaliza",
    role: "manager",
    department: "Produksi",
    avatar_url: "/avatars/manager.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Budi Santoso",
    role: "employee",
    department: "Produksi",
    avatar_url: "/avatars/employee1.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Dewi Lestari",
    role: "employee",
    department: "QC",
    avatar_url: "/avatars/employee2.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    name: "Rudi Hermawan",
    role: "employee",
    department: "Maintenance",
    avatar_url: "/avatars/employee3.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Pemeliharaan Mesin Produksi Line 1",
    description:
      "Melakukan pemeliharaan rutin pada mesin produksi line 1 untuk memastikan kualitas produk tetap optimal",
    status: "in-progress",
    priority: "high",
    assignee_id: "5",
    created_by: "2",
    due_date: "2024-12-25T10:00:00Z",
    tags: ["maintenance", "produksi", "urgent"],
    created_at: "2024-12-20T08:00:00Z",
    updated_at: "2024-12-22T14:30:00Z",
  },
  {
    id: "2",
    title: "Quality Control Batch #2024-12-001",
    description:
      "Melakukan quality control untuk batch produksi pupuk NPK minggu ini",
    status: "pending",
    priority: "medium",
    assignee_id: "4",
    created_by: "2",
    due_date: "2024-12-24T16:00:00Z",
    tags: ["qc", "npk", "batch-control"],
    created_at: "2024-12-21T09:15:00Z",
    updated_at: "2024-12-21T09:15:00Z",
  },
  {
    id: "3",
    title: "Laporan Produksi Bulanan",
    description: "Menyusun laporan produksi bulan Desember 2024",
    status: "completed",
    priority: "medium",
    assignee_id: "3",
    created_by: "2",
    due_date: "2024-12-23T17:00:00Z",
    completed_at: "2024-12-22T16:45:00Z",
    tags: ["laporan", "produksi", "bulanan"],
    created_at: "2024-12-15T10:00:00Z",
    updated_at: "2024-12-22T16:45:00Z",
  },
  {
    id: "4",
    title: "Update Sistem Inventory",
    description: "Melakukan update sistem inventory untuk tracking bahan baku",
    status: "pending",
    priority: "low",
    assignee_id: "1",
    created_by: "2",
    due_date: "2024-12-30T12:00:00Z",
    tags: ["it", "inventory", "sistem"],
    created_at: "2024-12-22T11:00:00Z",
    updated_at: "2024-12-22T11:00:00Z",
  },
  {
    id: "5",
    title: "Pelatihan Keselamatan Kerja",
    description:
      "Mengorganisir pelatihan keselamatan kerja untuk karyawan baru",
    status: "in-progress",
    priority: "urgent",
    assignee_id: "2",
    created_by: "1",
    due_date: "2024-12-26T09:00:00Z",
    tags: ["training", "safety", "hr"],
    created_at: "2024-12-18T14:00:00Z",
    updated_at: "2024-12-22T10:30:00Z",
  },
];

// Mock Meetings
export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Rapat Evaluasi Produksi Mingguan",
    description: "Evaluasi hasil produksi minggu ini dan planning minggu depan",
    date_time: "2024-12-23T09:00:00Z",
    duration: 90,
    status: "scheduled",
    location: "Ruang Rapat Utama",
    meeting_type: "onsite",
    created_by: "2",
    agenda: [
      "Review target produksi minggu ini",
      "Analisis kendala produksi",
      "Planning produksi minggu depan",
      "Update maintenance schedule",
    ],
    created_at: "2024-12-20T10:00:00Z",
    updated_at: "2024-12-20T10:00:00Z",
  },
  {
    id: "2",
    title: "Meeting Quality Control",
    description: "Pembahasan standar quality control dan improvement",
    date_time: "2024-12-24T14:00:00Z",
    duration: 60,
    status: "scheduled",
    location: "Lab QC",
    meeting_type: "onsite",
    created_by: "4",
    agenda: [
      "Review hasil QC bulan ini",
      "Diskusi improvement process",
      "Update SOP quality control",
    ],
    created_at: "2024-12-21T08:30:00Z",
    updated_at: "2024-12-21T08:30:00Z",
  },
  {
    id: "3",
    title: "Koordinasi IT & Maintenance",
    description:
      "Koordinasi antara tim IT dan maintenance untuk sistem monitoring",
    date_time: "2024-12-25T10:30:00Z",
    duration: 45,
    status: "scheduled",
    location: "Virtual Meeting",
    meeting_link: "https://zoom.us/j/123456789",
    meeting_type: "virtual",
    created_by: "1",
    agenda: [
      "Update sistem monitoring mesin",
      "Integrasi data maintenance",
      "Planning preventive maintenance",
    ],
    created_at: "2024-12-22T09:00:00Z",
    updated_at: "2024-12-22T09:00:00Z",
  },
];

// Mock Meeting Participants
export const mockMeetingParticipants: MeetingParticipant[] = [
  {
    id: "1",
    meeting_id: "1",
    user_id: "1",
    status: "accepted",
    created_at: "2024-12-20T10:00:00Z",
  },
  {
    id: "2",
    meeting_id: "1",
    user_id: "2",
    status: "accepted",
    created_at: "2024-12-20T10:00:00Z",
  },
  {
    id: "3",
    meeting_id: "1",
    user_id: "3",
    status: "accepted",
    created_at: "2024-12-20T10:00:00Z",
  },
  {
    id: "4",
    meeting_id: "1",
    user_id: "5",
    status: "tentative",
    created_at: "2024-12-20T10:00:00Z",
  },
  {
    id: "5",
    meeting_id: "2",
    user_id: "2",
    status: "accepted",
    created_at: "2024-12-21T08:30:00Z",
  },
  {
    id: "6",
    meeting_id: "2",
    user_id: "4",
    status: "accepted",
    created_at: "2024-12-21T08:30:00Z",
  },
  {
    id: "7",
    meeting_id: "3",
    user_id: "1",
    status: "accepted",
    created_at: "2024-12-22T09:00:00Z",
  },
  {
    id: "8",
    meeting_id: "3",
    user_id: "5",
    status: "accepted",
    created_at: "2024-12-22T09:00:00Z",
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: "1",
    user_id: "2",
    type: "meeting",
    title: "Rapat Evaluasi Produksi Besok",
    message: "Rapat evaluasi produksi mingguan akan dimulai besok pukul 09:00",
    read: false,
    data: "1",
    created_at: "2024-12-22T16:00:00Z",
  },
  {
    id: "2",
    user_id: "4",
    type: "task",
    title: "Deadline QC Batch Besok",
    message: "Quality control untuk batch #2024-12-001 harus selesai besok",
    read: false,
    data: "2",
    created_at: "2024-12-22T15:30:00Z",
  },
  {
    id: "3",
    user_id: "5",
    type: "task",
    title: "Task Maintenance Urgent",
    message: "Pemeliharaan mesin produksi line 1 memerlukan perhatian segera",
    read: true,
    data: "1",
    created_at: "2024-12-22T14:00:00Z",
  },
  {
    id: "4",
    user_id: "1",
    type: "system",
    title: "Sistem Update Berhasil",
    message: "Update sistem inventory telah berhasil dilakukan",
    read: true,
    data: "1",
    created_at: "2024-12-22T12:00:00Z",
  },
];

// Mock Notulensi
export const mockNotulensi: Notulensi[] = [
  {
    id: "1",
    meeting_id: "1",
    content: `# Notulensi Rapat Evaluasi Produksi Mingguan\n\n## Peserta\n- Ahmad Suryadi (IT)\n- Siti Nurhaliza (Manager Produksi)\n- Budi Santoso (Staff Produksi)\n\n## Pembahasan\n\n### 1. Review Target Produksi\n- Target minggu ini: 1000 ton pupuk NPK\n- Realisasi: 950 ton (95%)\n- Kendala: Maintenance mesin line 1\n\n### 2. Analisis Kendala\n- Mesin line 1 mengalami gangguan minor\n- Perlu maintenance preventif\n- Koordinasi dengan tim maintenance\n\n### 3. Planning Minggu Depan\n- Target: 1100 ton\n- Fokus pada efisiensi produksi\n- Implementasi improvement dari QC`,
    decisions: [
      "Maintenance mesin line 1 akan dilakukan akhir pekan",
      "Target produksi minggu depan dinaikkan menjadi 1100 ton",
      "Implementasi SOP baru dari tim QC",
    ],
    next_meeting_date: "2024-12-30T09:00:00Z",
    created_by: "2",
    created_at: "2024-12-22T11:00:00Z",
    updated_at: "2024-12-22T11:00:00Z",
  },
];

// Mock Action Items
export const mockActionItems: ActionItem[] = [
  {
    id: "1",
    notulensi_id: "1",
    description: "Koordinasi maintenance mesin line 1 dengan tim maintenance",
    assignee_id: "5",
    due_date: "2024-12-24T17:00:00Z",
    priority: "high",
    status: "pending",
    created_at: "2024-12-22T11:00:00Z",
  },
  {
    id: "2",
    notulensi_id: "1",
    description: "Implementasi SOP baru dari tim QC",
    assignee_id: "4",
    due_date: "2024-12-26T12:00:00Z",
    priority: "medium",
    status: "pending",
    created_at: "2024-12-22T11:00:00Z",
  },
];

// Dashboard Stats sudah dipindahkan ke app/dashboard/data.ts

// Helper function to get user by ID
export function getUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id);
}

// Helper function to get tasks with populated user data
export function getTasksWithUsers(): (Task & {
  assignee?: User;
  creator?: User;
})[] {
  return mockTasks.map((task) => ({
    ...task,
    assignee: task.assignee_id ? getUserById(task.assignee_id) : undefined,
    creator: getUserById(task.created_by),
  }));
}

// Helper function to get meetings with populated user data
export function getMeetingsWithUsers(): (Meeting & {
  creator?: User;
  participants?: (MeetingParticipant & { user?: User })[];
})[] {
  return mockMeetings.map((meeting) => ({
    ...meeting,
    creator: getUserById(meeting.created_by),
    participants: mockMeetingParticipants
      .filter((p) => p.meeting_id === meeting.id)
      .map((p) => ({
        ...p,
        user: getUserById(p.user_id),
      })),
  }));
}

// Helper function to get notulensi with populated data
export function getNotulensiWithData(): (Notulensi & {
  meeting?: Meeting;
  creator?: User;
  action_items?: (ActionItem & { assignee?: User })[];
})[] {
  return mockNotulensi.map((notulensi) => ({
    ...notulensi,
    meeting: mockMeetings.find((m) => m.id === notulensi.meeting_id),
    creator: getUserById(notulensi.created_by),
    action_items: mockActionItems
      .filter((item) => item.notulensi_id === notulensi.id)
      .map((item) => ({
        ...item,
        assignee: item.assignee_id ? getUserById(item.assignee_id) : undefined,
      })),
  }));
}

// Function to add new meeting
export function addMeeting(meetingData: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>, participantIds: string[] = []): Meeting {
  const newId = (mockMeetings.length + 1).toString();
  const now = new Date().toISOString();
  
  const newMeeting: Meeting = {
    ...meetingData,
    id: newId,
    created_at: now,
    updated_at: now,
  };
  
  // Add meeting to mock data
  mockMeetings.push(newMeeting);
  
  // Add participants
  participantIds.forEach((userId, index) => {
    const participantId = (mockMeetingParticipants.length + index + 1).toString();
    mockMeetingParticipants.push({
      id: participantId,
      meeting_id: newId,
      user_id: userId,
      status: 'accepted',
      created_at: now,
    });
  });
  
  return newMeeting;
}

// Function to update meeting
export function updateMeeting(meetingId: string, meetingData: Partial<Meeting>, participantIds?: string[]): Meeting | null {
  const meetingIndex = mockMeetings.findIndex(m => m.id === meetingId);
  if (meetingIndex === -1) return null;
  
  const now = new Date().toISOString();
  mockMeetings[meetingIndex] = {
    ...mockMeetings[meetingIndex],
    ...meetingData,
    updated_at: now,
  };
  
  // Update participants if provided
  if (participantIds) {
    // Remove existing participants
    const existingParticipantIndices = mockMeetingParticipants
      .map((p, index) => p.meeting_id === meetingId ? index : -1)
      .filter(index => index !== -1)
      .reverse(); // Reverse to avoid index shifting issues
    
    existingParticipantIndices.forEach(index => {
      mockMeetingParticipants.splice(index, 1);
    });
    
    // Add new participants
    participantIds.forEach((userId, index) => {
      const participantId = (mockMeetingParticipants.length + index + 1).toString();
      mockMeetingParticipants.push({
        id: participantId,
        meeting_id: meetingId,
        user_id: userId,
        status: 'accepted',
        created_at: now,
      });
    });
  }
  
  return mockMeetings[meetingIndex];
}

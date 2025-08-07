import { Notulensi, Meeting, User, ActionItem } from "../../types";

// Sample users data
const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    role: "manager",
    department: "Engineering",
    avatar_url:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    role: "admin",
    department: "HR",
    avatar_url:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Mike Johnson",
    role: "employee",
    department: "Marketing",
    avatar_url:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    role: "manager",
    department: "Finance",
    avatar_url:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

// Sample meetings data
const meetings: Meeting[] = [
  {
    id: "1",
    title: "Rapat Evaluasi Proyek Q1",
    description: "Evaluasi pencapaian target dan perencanaan Q2",
    date_time: "2024-01-15T09:00:00Z",
    duration: 120,
    status: "completed",
    location: "Ruang Rapat A",
    meeting_type: "onsite",
    created_by: "1",
    agenda: [
      "Review pencapaian Q1",
      "Analisis kendala dan solusi",
      "Perencanaan target Q2",
      "Alokasi sumber daya",
    ],
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-15T11:00:00Z",
  },
  {
    id: "2",
    title: "Standup Meeting Tim Development",
    description: "Update harian progress development",
    date_time: "2024-01-20T10:00:00Z",
    duration: 30,
    status: "completed",
    location: "Virtual",
    meeting_type: "virtual",
    meeting_link: "https://meet.google.com/abc-defg-hij",
    created_by: "2",
    agenda: [
      "Update progress masing-masing developer",
      "Diskusi blocker",
      "Planning task hari ini",
    ],
    created_at: "2024-01-19T00:00:00Z",
    updated_at: "2024-01-20T10:30:00Z",
  },
  {
    id: "3",
    title: "Rapat Koordinasi Marketing Campaign",
    description: "Koordinasi peluncuran campaign produk baru",
    date_time: "2024-01-25T14:00:00Z",
    duration: 90,
    status: "completed",
    location: "Ruang Rapat B",
    meeting_type: "hybrid",
    created_by: "3",
    agenda: [
      "Presentasi konsep campaign",
      "Review budget dan timeline",
      "Pembagian tugas tim",
      "Strategi media sosial",
    ],
    created_at: "2024-01-22T00:00:00Z",
    updated_at: "2024-01-25T15:30:00Z",
  },
];

// Sample action items
const actionItems: ActionItem[] = [
  {
    id: "1",
    notulensi_id: "1",
    description: "Menyiapkan laporan detail pencapaian Q1",
    assignee_id: "1",
    due_date: "2024-01-22T00:00:00Z",
    priority: "high",
    status: "completed",
    completed_at: "2024-01-21T00:00:00Z",
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    notulensi_id: "1",
    description: "Membuat proposal budget Q2",
    assignee_id: "4",
    due_date: "2024-01-30T00:00:00Z",
    priority: "high",
    status: "pending",
    created_at: "2024-01-15T00:00:00Z",
  },
  {
    id: "3",
    notulensi_id: "2",
    description: "Fix bug pada modul authentication",
    assignee_id: "2",
    due_date: "2024-01-21T00:00:00Z",
    priority: "medium",
    status: "completed",
    completed_at: "2024-01-20T00:00:00Z",
    created_at: "2024-01-20T00:00:00Z",
  },
  {
    id: "4",
    notulensi_id: "3",
    description: "Membuat konten untuk media sosial",
    assignee_id: "3",
    due_date: "2024-02-01T00:00:00Z",
    priority: "medium",
    status: "pending",
    created_at: "2024-01-25T00:00:00Z",
  },
  {
    id: "5",
    notulensi_id: "3",
    description: "Koordinasi dengan tim design untuk visual campaign",
    assignee_id: "1",
    due_date: "2024-01-28T00:00:00Z",
    priority: "low",
    status: "pending",
    created_at: "2024-01-25T00:00:00Z",
  },
];

// Sample draft notulensi data
const draftNotulensiData: Notulensi[] = [
  {
    id: "draft-1",
    meeting_id: "1",
    content: `# Notulensi Rapat Evaluasi Proyek Q1

## Peserta Rapat
- John Doe (Manager Engineering)
- Sarah Wilson (Manager Finance)

## Pembahasan

### 1. Review Pencapaian Q1
- Target development: 95% tercapai
- Bug fixing: 98% selesai

[DRAFT - Belum selesai]`,
    decisions: ["Menambah 2 QA engineer untuk Q2"],
    created_by: "1",
    is_draft: true,
    created_at: "2024-01-28T10:00:00Z",
    updated_at: "2024-01-28T14:30:00Z",
  },
  {
    id: "draft-2",
    meeting_id: "2",
    content: `# Notulensi Standup Meeting Tim Development

## Peserta
- Jane Smith (Tech Lead)
- Developer A

[DRAFT - Perlu dilengkapi]`,
    decisions: [],
    created_by: "2",
    is_draft: true,
    created_at: "2024-01-29T09:00:00Z",
    updated_at: "2024-01-29T09:15:00Z",
  },
];

// Sample notulensi data
const notulensiData: Notulensi[] = [
  {
    id: "1",
    meeting_id: "1",
    content: `# Notulensi Rapat Evaluasi Proyek Q1

## Peserta Rapat
- John Doe (Manager Engineering)
- Sarah Wilson (Manager Finance)
- Tim Development (5 orang)
- Tim QA (3 orang)

## Pembahasan

### 1. Review Pencapaian Q1
- Target development: 95% tercapai
- Bug fixing: 98% selesai
- User acceptance testing: 90% selesai
- Deployment ke production: Berhasil tanpa kendala

### 2. Analisis Kendala
- Keterlambatan pada modul payment gateway (2 minggu)
- Resource shortage pada tim QA
- Perubahan requirement dari client di tengah development

### 3. Solusi yang Diambil
- Menambah 2 QA engineer untuk Q2
- Implementasi change request process yang lebih ketat
- Buffer time 20% untuk setiap milestone

### 4. Perencanaan Q2
- Focus pada performance optimization
- Implementation of new features berdasarkan user feedback
- Strengthening testing procedures

## Kesimpulan
Secara keseluruhan Q1 berjalan dengan baik meskipun ada beberapa kendala. Tim siap untuk menghadapi tantangan Q2 dengan pembelajaran dari Q1.`,
    decisions: [
      "Menambah 2 QA engineer untuk Q2",
      "Implementasi change request process yang lebih ketat",
      "Menambah buffer time 20% untuk setiap milestone Q2",
      "Focus Q2 pada performance optimization dan new features",
    ],
    next_meeting_date: "2024-04-15T09:00:00Z",
    created_by: "1",
    approved_by: "2",
    approved_at: "2024-01-16T00:00:00Z",
    created_at: "2024-01-15T12:00:00Z",
    updated_at: "2024-01-16T00:00:00Z",
  },
  {
    id: "2",
    meeting_id: "2",
    content: `# Notulensi Standup Meeting Tim Development

## Peserta
- Jane Smith (Tech Lead)
- Developer A
- Developer B
- Developer C

## Update Progress

### Developer A
- Kemarin: Menyelesaikan implementasi user profile page
- Hari ini: Akan mengerjakan integration dengan API
- Blocker: Tidak ada

### Developer B
- Kemarin: Fix bug pada authentication module
- Hari ini: Code review dan testing
- Blocker: Menunggu approval dari security team

### Developer C
- Kemarin: Setup CI/CD pipeline
- Hari ini: Documentation dan knowledge transfer
- Blocker: Tidak ada

## Action Items
- Developer B follow up dengan security team
- Semua developer update progress di project board

## Next Meeting
Besok jam 10:00 WIB`,
    decisions: [
      "Developer B akan follow up dengan security team untuk approval",
      "Semua developer wajib update progress di project board setiap hari",
    ],
    created_by: "2",
    created_at: "2024-01-20T10:30:00Z",
    updated_at: "2024-01-20T10:30:00Z",
  },
  {
    id: "3",
    meeting_id: "3",
    content: `# Notulensi Rapat Koordinasi Marketing Campaign

## Peserta Rapat
- Mike Johnson (Marketing Manager)
- Tim Creative (3 orang)
- Tim Social Media (2 orang)
- John Doe (Product Manager)

## Agenda yang Dibahas

### 1. Presentasi Konsep Campaign
- Theme: "Innovation for Everyone"
- Target audience: Young professionals 25-35 tahun
- Key message: Accessibility dan user-friendly
- Visual concept: Modern, clean, dengan warna brand

### 2. Budget dan Timeline
- Total budget: Rp 500,000,000
- Timeline: 6 minggu (1 Feb - 15 Mar 2024)
- Breakdown:
  - Creative development: 2 minggu
  - Production: 2 minggu
  - Launch dan monitoring: 2 minggu

### 3. Pembagian Tugas
- Tim Creative: Visual assets, video content
- Tim Social Media: Content calendar, community management
- Product team: Product demo, technical content

### 4. Strategi Media Sosial
- Platform utama: Instagram, LinkedIn, TikTok
- Content mix: 40% educational, 30% promotional, 30% engagement
- Influencer collaboration: 5 micro-influencers

## Kesimpulan
Semua tim siap untuk eksekusi campaign. Timeline aggressive tapi achievable dengan resource yang ada.`,
    decisions: [
      "Approve budget Rp 500,000,000 untuk campaign",
      "Timeline 6 minggu mulai 1 Februari 2024",
      "Collaboration dengan 5 micro-influencers",
      "Focus pada 3 platform: Instagram, LinkedIn, TikTok",
    ],
    next_meeting_date: "2024-02-08T14:00:00Z",
    created_by: "3",
    created_at: "2024-01-25T15:30:00Z",
    updated_at: "2024-01-25T15:30:00Z",
  },
];

export function getNotulensiWithData(): (Notulensi & {
  meeting?: Meeting;
  creator?: User;
  approver?: User;
  action_items?: (ActionItem & { assignee?: User })[];
})[] {
  return notulensiData.map((notulensi) => {
    const meeting = meetings.find((m) => m.id === notulensi.meeting_id);
    const creator = users.find((u) => u.id === notulensi.created_by);
    const approver = notulensi.approved_by
      ? users.find((u) => u.id === notulensi.approved_by)
      : undefined;
    const action_items = actionItems
      .filter((item) => item.notulensi_id === notulensi.id)
      .map((item) => ({
        ...item,
        assignee: users.find((u) => u.id === item.assignee_id),
      }));

    return {
      ...notulensi,
      meeting,
      creator,
      approver,
      action_items,
    };
  });
}

export function getNotulensiById(id: string) {
  const notulensiList = getNotulensiWithData();
  return notulensiList.find((notulensi) => notulensi.id === id);
}

export function getMeetingsForNotulensi() {
  return meetings.map((meeting) => ({
    ...meeting,
    creator: users.find((u) => u.id === meeting.created_by),
  }));
}

export function getUsers() {
  return users;
}

export function getDraftNotulensi(): (Notulensi & {
  meeting?: Meeting;
  creator?: User;
  action_items?: (ActionItem & { assignee?: User })[];
})[] {
  return draftNotulensiData.map((draft) => {
    const meeting = meetings.find((m) => m.id === draft.meeting_id);
    const creator = users.find((u) => u.id === draft.created_by);
    const action_items = actionItems
      .filter((item) => item.notulensi_id === draft.id)
      .map((item) => ({
        ...item,
        assignee: users.find((u) => u.id === item.assignee_id),
      }));

    return {
      ...draft,
      meeting,
      creator,
      action_items,
    };
  });
}

export function getDraftById(id: string) {
  const draftList = getDraftNotulensi();
  return draftList.find((draft) => draft.id === id);
}

export function saveDraftNotulensi(draftData: Partial<Notulensi> & { meeting_id: string }) {
  const newDraft: Notulensi = {
    id: draftData.id || `draft-${Date.now()}`,
    meeting_id: draftData.meeting_id,
    content: draftData.content || "",
    decisions: draftData.decisions || [],
    next_meeting_date: draftData.next_meeting_date,
    created_by: draftData.created_by || "1", // Default user
    is_draft: true,
    created_at: draftData.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // In real app, this would be an API call
  const existingIndex = draftNotulensiData.findIndex(d => d.id === newDraft.id);
  if (existingIndex >= 0) {
    draftNotulensiData[existingIndex] = newDraft;
  } else {
    draftNotulensiData.push(newDraft);
  }

  return newDraft;
}

export function publishDraftNotulensi(draftId: string) {
  const draft = draftNotulensiData.find(d => d.id === draftId);
  if (!draft) return null;

  // Create published notulensi
  const publishedNotulensi: Notulensi = {
    ...draft,
    id: `notulensi-${Date.now()}`,
    is_draft: false,
    updated_at: new Date().toISOString(),
  };

  // Add to published notulensi
  notulensiData.push(publishedNotulensi);

  // Remove from drafts
  const draftIndex = draftNotulensiData.findIndex(d => d.id === draftId);
  if (draftIndex >= 0) {
    draftNotulensiData.splice(draftIndex, 1);
  }

  return publishedNotulensi;
}

export function deleteDraftNotulensi(draftId: string) {
  const draftIndex = draftNotulensiData.findIndex(d => d.id === draftId);
  if (draftIndex >= 0) {
    draftNotulensiData.splice(draftIndex, 1);
    return true;
  }
  return false;
}

// Additional data from mockData.ts for PKC context
export const pkcUsers: User[] = [
  {
    id: "pkc-1",
    name: "Ahmad Suryadi",
    role: "admin",
    department: "IT",
    avatar_url: "/avatars/admin.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "pkc-2",
    name: "Siti Nurhaliza",
    role: "manager",
    department: "Produksi",
    avatar_url: "/avatars/manager.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "pkc-3",
    name: "Budi Santoso",
    role: "employee",
    department: "Produksi",
    avatar_url: "/avatars/employee1.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "pkc-4",
    name: "Dewi Lestari",
    role: "employee",
    department: "QC",
    avatar_url: "/avatars/employee2.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "pkc-5",
    name: "Rudi Hermawan",
    role: "employee",
    department: "Maintenance",
    avatar_url: "/avatars/employee3.jpg",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const pkcMeetings: Meeting[] = [
  {
    id: "pkc-1",
    title: "Rapat Evaluasi Produksi Mingguan",
    description: "Evaluasi hasil produksi minggu ini dan planning minggu depan",
    date_time: "2024-12-23T09:00:00Z",
    duration: 90,
    status: "completed",
    location: "Ruang Rapat Utama",
    meeting_type: "onsite",
    created_by: "pkc-2",
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
    id: "pkc-2",
    title: "Meeting Quality Control",
    description: "Pembahasan standar quality control dan improvement",
    date_time: "2024-12-24T14:00:00Z",
    duration: 60,
    status: "completed",
    location: "Lab QC",
    meeting_type: "onsite",
    created_by: "pkc-4",
    agenda: [
      "Review hasil QC bulan ini",
      "Diskusi improvement process",
      "Update SOP quality control",
    ],
    created_at: "2024-12-21T08:30:00Z",
    updated_at: "2024-12-21T08:30:00Z",
  },
];

export const pkcNotulensi: Notulensi[] = [
  {
    id: "pkc-notulensi-1",
    meeting_id: "pkc-1",
    content: `# Notulensi Rapat Evaluasi Produksi Mingguan

## Peserta
- Ahmad Suryadi (IT)
- Siti Nurhaliza (Manager Produksi)
- Budi Santoso (Staff Produksi)

## Pembahasan

### 1. Review Target Produksi
- Target minggu ini: 1000 ton pupuk NPK
- Realisasi: 950 ton (95%)
- Kendala: Maintenance mesin line 1

### 2. Analisis Kendala
- Mesin line 1 mengalami gangguan minor
- Perlu maintenance preventif
- Koordinasi dengan tim maintenance

### 3. Planning Minggu Depan
- Target: 1100 ton
- Fokus pada efisiensi produksi
- Implementasi improvement dari QC`,
    decisions: [
      "Maintenance mesin line 1 akan dilakukan akhir pekan",
      "Target produksi minggu depan dinaikkan menjadi 1100 ton",
      "Implementasi SOP baru dari tim QC",
    ],
    next_meeting_date: "2024-12-30T09:00:00Z",
    created_by: "pkc-2",
    created_at: "2024-12-22T11:00:00Z",
    updated_at: "2024-12-22T11:00:00Z",
  },
];

export const pkcActionItems: ActionItem[] = [
  {
    id: "pkc-action-1",
    notulensi_id: "pkc-notulensi-1",
    description: "Koordinasi maintenance mesin line 1 dengan tim maintenance",
    assignee_id: "pkc-5",
    due_date: "2024-12-24T17:00:00Z",
    priority: "high",
    status: "pending",
    created_at: "2024-12-22T11:00:00Z",
  },
  {
    id: "pkc-action-2",
    notulensi_id: "pkc-notulensi-1",
    description: "Implementasi SOP baru dari tim QC",
    assignee_id: "pkc-4",
    due_date: "2024-12-26T12:00:00Z",
    priority: "medium",
    status: "pending",
    created_at: "2024-12-22T11:00:00Z",
  },
];

// Combine all data sources
export function getAllUsers() {
  return [...users, ...pkcUsers];
}

export function getAllMeetings() {
  return [...meetings, ...pkcMeetings];
}

export function getAllNotulensi() {
  return [...notulensiData, ...pkcNotulensi];
}

export function getAllActionItems() {
  return [...actionItems, ...pkcActionItems];
}

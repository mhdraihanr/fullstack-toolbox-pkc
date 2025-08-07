import { User, Task } from "@/types";

// Mock Users (dipindahkan dari mockData.ts)
export const users: User[] = [
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

// Mock Tasks (dipindahkan dari mockData.ts)
export const tasks: Task[] = [
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
    priority: "medium",
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

// Helper function untuk mendapatkan user berdasarkan ID
export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

// Helper function untuk mendapatkan tasks dengan data user
export function getTasksWithUsers(): (Task & {
  assignee?: User;
  creator?: User;
})[] {
  return tasks.map((task) => ({
    ...task,
    assignee: task.assignee_id ? getUserById(task.assignee_id) : undefined,
    creator: getUserById(task.created_by),
  }));
}

// Helper function untuk mengubah status task
export function updateTaskStatus(taskId: string, newStatus: Task["status"]) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].status = newStatus;
    tasks[taskIndex].updated_at = new Date().toISOString();

    // Jika status completed, tambahkan completed_at
    if (newStatus === "completed") {
      tasks[taskIndex].completed_at = new Date().toISOString();
    } else {
      // Jika status bukan completed, hapus completed_at
      delete tasks[taskIndex].completed_at;
    }

    return true;
  }
  return false;
}

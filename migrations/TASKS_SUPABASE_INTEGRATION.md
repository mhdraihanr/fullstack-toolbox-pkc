# Tasks Supabase Integration Guide

## Langkah 1: Setup Database

### 1.1 Jalankan SQL Script
1. Buka Supabase Dashboard project Anda
2. Navigasi ke **SQL Editor**
3. Jalankan script berikut secara berurutan:
   - Pertama: `migrations/supabase-setup.sql` (jika belum dijalankan)
   - Kedua: `migrations/tasks-setup.sql`

### 1.2 Verifikasi Tabel
Pastikan tabel berikut sudah terbuat:
- `public.profiles` - untuk data user
- `public.tasks` - untuk data tasks

### 1.3 Konfigurasi RLS (Row Level Security)
Script sudah mengatur RLS policies untuk:
- Users dapat melihat semua tasks (kolaborasi)
- Users dapat membuat tasks
- Users dapat update tasks yang mereka buat atau ditugaskan
- Admin/Manager dapat mengelola semua tasks

## Langkah 2: Integrasi API dan Frontend

### 2.1 API Routes
API routes yang akan dibuat:
- `GET /api/tasks` - Mendapatkan daftar tasks
- `POST /api/tasks` - Membuat task baru
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Hapus task
- `PATCH /api/tasks/[id]/status` - Update status task

### 2.2 Frontend Integration
- Update `app/tasks/page.tsx` untuk menggunakan API
- Update `app/dashboard/page.tsx` untuk menampilkan tasks dari database
- Implementasi real-time updates menggunakan Supabase subscriptions

### 2.3 Type Safety
- Menggunakan types yang sudah ada di `types/index.ts`
- Supabase client dengan TypeScript support

## Fitur yang Akan Tersedia

1. **CRUD Operations**: Create, Read, Update, Delete tasks
2. **Real-time Updates**: Perubahan tasks langsung terlihat di semua client
3. **Role-based Access**: Admin/Manager memiliki akses penuh
4. **Task Assignment**: Assign tasks ke user lain
5. **Status Tracking**: Pending, In Progress, Completed, Cancelled
6. **Priority Management**: Low, Medium, High, Urgent
7. **Due Date Management**: Set dan track deadline
8. **Tags System**: Kategorisasi tasks dengan tags

## Security Features

1. **Row Level Security (RLS)**: Data protection di level database
2. **Authentication**: Hanya user yang login dapat akses
3. **Authorization**: Role-based permissions
4. **Data Validation**: Input validation di API level

## Performance Optimizations

1. **Database Indexes**: Untuk query yang cepat
2. **Pagination**: Untuk handling data besar
3. **Caching**: Client-side caching untuk UX yang baik
4. **Real-time Subscriptions**: Efficient data synchronization
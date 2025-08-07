# Meetings Supabase Integration

Dokumentasi ini menjelaskan cara mengintegrasikan sistem meetings dengan Supabase untuk Web Toolbox PKC.

## Prerequisites

1. Akun Supabase aktif
2. Project Supabase sudah dibuat
3. Environment variables sudah dikonfigurasi di `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Database Setup

### 1. Jalankan SQL Script

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Navigasi ke **SQL Editor**
4. Buat query baru dan copy-paste isi dari `meetings-setup.sql`
5. Jalankan script tersebut

### 2. Verifikasi Tabel

Pastikan tabel-tabel berikut sudah terbuat:
- `meetings` - Tabel utama untuk data meetings
- `meeting_participants` - Tabel untuk peserta meetings
- `meeting_attendance` - Tabel untuk absensi meetings

### 3. Struktur Tabel

#### Tabel `meetings`
```sql
id uuid PRIMARY KEY
title text NOT NULL
description text
date_time timestamptz NOT NULL
duration integer DEFAULT 60
status text DEFAULT 'scheduled'
location text
meeting_type text DEFAULT 'onsite'
meeting_link text
qr_code_url text
qr_code_expires_at timestamptz
created_by uuid REFERENCES profiles(id)
agenda text[]
created_at timestamptz
updated_at timestamptz
```

#### Tabel `meeting_participants`
```sql
id uuid PRIMARY KEY
meeting_id uuid REFERENCES meetings(id)
user_id uuid REFERENCES profiles(id)
status text DEFAULT 'invited'
created_at timestamptz
```

#### Tabel `meeting_attendance`
```sql
id uuid PRIMARY KEY
meeting_id uuid REFERENCES meetings(id)
user_id uuid REFERENCES profiles(id)
checked_in_at timestamptz
check_in_method text DEFAULT 'manual'
location_lat decimal
location_lng decimal
device_info text
created_at timestamptz
```

## Row Level Security (RLS)

### Policies yang Diterapkan

#### Meetings Table
- **View**: Semua authenticated users dapat melihat meetings
- **Create**: Users dapat membuat meetings (sebagai creator)
- **Update**: Creator atau admin/manager dapat update
- **Delete**: Creator atau admin/manager dapat delete

#### Meeting Participants Table
- **View**: Semua authenticated users dapat melihat participants
- **Manage**: Creator meeting atau admin/manager dapat manage, users dapat update status partisipasi mereka sendiri

#### Meeting Attendance Table
- **View**: Semua authenticated users dapat melihat attendance
- **Manage**: Users dapat manage attendance mereka sendiri, creator atau admin/manager dapat manage semua

## API Endpoints

Setelah setup database, API endpoints berikut akan tersedia:

### Meetings
- `GET /api/meetings` - List semua meetings
- `POST /api/meetings` - Buat meeting baru
- `GET /api/meetings/[id]` - Detail meeting
- `PUT /api/meetings/[id]` - Update meeting
- `DELETE /api/meetings/[id]` - Hapus meeting

### Meeting Participants
- `GET /api/meetings/[id]/participants` - List participants
- `POST /api/meetings/[id]/participants` - Tambah participant
- `PUT /api/meetings/[id]/participants/[userId]` - Update status participant
- `DELETE /api/meetings/[id]/participants/[userId]` - Hapus participant

### Meeting Attendance
- `GET /api/meetings/[id]/attendance` - List attendance
- `POST /api/meetings/[id]/attendance` - Check-in attendance
- `GET /api/meetings/[id]/qr-code` - Generate QR code untuk check-in

## Frontend Integration

### Types
Tipe TypeScript sudah didefinisikan di `types/index.ts`:
- `Meeting`
- `MeetingParticipant`
- `MeetingAttendance`
- `CreateMeetingData`
- `UpdateMeetingData`

### Hooks
Custom hooks tersedia di `lib/hooks/`:
- `useMeetings` - Manage meetings data
- `useMeetingParticipants` - Manage participants
- `useMeetingAttendance` - Manage attendance

### Pages
- `/meetings` - List meetings
- `/meetings/create` - Buat meeting baru
- `/meetings/[id]` - Detail meeting
- `/meetings/[id]/edit` - Edit meeting

## Features

### Core Features
1. **CRUD Meetings** - Create, Read, Update, Delete meetings
2. **Participant Management** - Invite dan manage participants
3. **Attendance Tracking** - Track kehadiran dengan berbagai metode
4. **QR Code Check-in** - Generate QR code untuk check-in otomatis
5. **Meeting Types** - Support onsite, virtual, dan hybrid meetings
6. **Meeting Links** - Support link untuk virtual/hybrid meetings

### Advanced Features
1. **Real-time Updates** - Menggunakan Supabase realtime
2. **Location Tracking** - Track lokasi saat check-in
3. **Device Info** - Record device info untuk security
4. **Agenda Management** - Manage agenda items
5. **Status Management** - Track meeting dan participant status

## Security

1. **Row Level Security** - Semua tabel menggunakan RLS
2. **Authentication Required** - Semua operations memerlukan authentication
3. **Role-based Access** - Admin/manager memiliki akses lebih luas
4. **Data Validation** - Server-side validation untuk semua input

## Testing

1. Buat meeting baru melalui frontend
2. Invite participants
3. Test check-in functionality
4. Verify QR code generation
5. Test real-time updates

## Troubleshooting

### Common Issues

1. **RLS Policy Error**
   - Pastikan user sudah authenticated
   - Check apakah policies sudah benar

2. **Foreign Key Error**
   - Pastikan tabel `profiles` sudah ada
   - Verify user ID exists di profiles table

3. **Permission Denied**
   - Check user role dan permissions
   - Verify RLS policies

### Debug Tips

1. Check Supabase logs di dashboard
2. Use browser developer tools untuk network requests
3. Verify environment variables
4. Test API endpoints dengan Postman/curl

## Migration dari Sistem Lain

Jika Anda migrasi dari sistem meetings lain:

1. Export data dalam format JSON/CSV
2. Transform data sesuai schema Supabase
3. Import menggunakan SQL INSERT statements
4. Verify data integrity
5. Test functionality

---

**Note**: Dokumentasi ini akan diupdate seiring dengan pengembangan fitur baru.
# 🔄 Supabase Database Restore Guide

Panduan lengkap untuk merestore database backup ke project Supabase baru untuk Web Toolbox PKC.

## ⚠️ Peringatan Penting

Sebelum memulai proses restore:

- **Backup file saat ini**: `db_cluster-05-09-2025@16-49-01.backup.gz`
- Proses ini akan mengganti seluruh database di project tujuan
- Pastikan project tujuan adalah project kosong atau project yang siap di-reset

## 📋 Checklist Pra-Restore

- [ ] File backup tersedia: `db_cluster-05-09-2025@16-49-01.backup.gz`
- [ ] Supabase CLI terinstall (`npm install -g supabase`)
- [ ] Docker Desktop berjalan
- [ ] Project Supabase baru sudah dibuat
- [ ] Connection string dan API keys sudah didapat

## 🚀 Langkah-langkah Restore

### 1. Siapkan Project Supabase Baru

1. **Buat Project Baru**

   - Login ke [Supabase Dashboard](https://supabase.com/dashboard)
   - Klik "New Project"
   - Isi detail project:
     - **Name**: `web-toolbox-pkc-restored`
     - **Database Password**: Buat password yang kuat
     - **Region**: Sesuaikan dengan lokasi Anda

2. **Dapatkan API Keys**
   - Dashboard > Settings > API
   - Copy:
     - **Project URL**: `https://[PROJECT-ID].supabase.co`
     - **anon public key**: Dimulai dengan `eyJ...`
     - **service_role key**: Dimulai dengan `eyJ...`

### 2. Restore Database Menggunakan Supabase CLI

```bash
# 1. Login ke Supabase
supabase login

# 2. Masuk ke direktori project
cd /path/to/web-toolbox-pkc

# 3. Restore database dari backup
supabase db reset --from-backup ../db_cluster-05-09-2025@16-49-01.backup.gz
```

### 3. Alternatif: Restore Manual dengan pg_restore

```bash
# 1. Ekstrak file backup (jika dalam format .gz)
gunzip -c db_cluster-05-09-2025@16-49-01.backup.gz > db_backup.sql

# 2. Restore ke database baru
pg_restore -d "postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.com:5432/postgres" db_cluster-05-09-2025@16-49-01.backup.gz
```

## 🛠️ Konfigurasi Pasca-Restore

### 1. Update Environment Variables

Edit file `.env.local`:

```env
# Project URL dari project baru
NEXT_PUBLIC_SUPABASE_URL=https://[NEW-PROJECT-ID].supabase.co

# Anon Key dari project baru
NEXT_PUBLIC_SUPABASE_ANON_KEY=[NEW-ANON-KEY]

# Service Role Key dari project baru
SUPABASE_SERVICE_ROLE_KEY=[NEW-SERVICE-ROLE-KEY]
```

### 2. Restart Development Server

```bash
# Hentikan server yang sedang berjalan (Ctrl+C)
# Lalu jalankan ulang:
pnpm dev
```

### 3. Verifikasi Restore

1. **Test Koneksi Database**

   - Buka aplikasi di `http://localhost:3000`
   - Coba login dengan user yang ada di backup
   - Periksa apakah data tasks/meetings/notulensi muncul

2. **Cek di Supabase Dashboard**
   - Tables > Browse Rows
   - Pastikan tabel-tabel berikut ada dan berisi data:
     - `profiles`
     - `tasks`
     - `meetings`
     - `meeting_participants`
     - `meeting_attendance`
     - `notulensi`
     - `action_items`

## 🔧 Konfigurasi Tambahan yang Perlu Diatur Ulang

Berikut adalah pengaturan yang **tidak termasuk** dalam database backup dan perlu diatur ulang secara manual:

### 1. Authentication Settings

- Dashboard > Authentication > Settings
- Atur:
  - Site URL: `http://localhost:3000`
  - Redirect URLs:
    - `http://localhost:3000/auth/callback`
    - `http://localhost:3000/auth/reset-password`

### 2. Email Templates

- Dashboard > Authentication > Templates
- Sesuaikan template email jika diperlukan

### 3. Storage Settings (jika digunakan)

- Dashboard > Storage
- Buat buckets jika diperlukan
- Atur policies untuk akses file

### 4. Realtime Settings

- Dashboard > Realtime
- Enable realtime untuk tabel-tabel yang diperlukan

## 🧪 Testing Setelah Restore

### 1. Test Authentication

```bash
# Buka halaman login
http://localhost:3000/auth/login

# Coba login dengan user yang ada di backup
# Atau register user baru
```

### 2. Test Fitur Utama

- [ ] Dashboard menampilkan data dengan benar
- [ ] Bisa membuat/view tasks
- [ ] Bisa membuat/view meetings
- [ ] Bisa membuat/view notulensi
- [ ] QR Code check-in berfungsi

### 3. Test API Endpoints

```bash
# Test API tasks
curl http://localhost:3000/api/tasks

# Test API meetings
curl http://localhost:3000/api/meetings

# Test API notulensi
curl http://localhost:3000/api/notulensi
```

## 🔍 Troubleshooting

### Error: "Connection refused"

- Pastikan project Supabase aktif (bukan dalam status paused)
- Periksa koneksi internet
- Cek apakah firewall memblokir koneksi

### Error: "Invalid credentials"

- Pastikan API keys di `.env.local` benar
- Restart development server setelah mengubah env vars
- Periksa tidak ada spasi di awal/akhir keys

### Data tidak muncul

- Cek apakah restore berhasil di Supabase Dashboard
- Periksa console browser untuk error
- Pastikan user sudah login dan memiliki akses ke data

### RLS (Row Level Security) Error

- Pastikan user sudah login
- Periksa policies di tabel terkait
- Cek apakah user memiliki role yang tepat

## 📊 Struktur Database yang Direstore

Database akan berisi tabel-tabel berikut:

### Core Tables

- `profiles` - Metadata user
- `tasks` - Manajemen tugas
- `meetings` - Jadwal meeting
- `meeting_participants` - Peserta meeting
- `meeting_attendance` - Absensi meeting
- `notulensi` - Notulen meeting
- `action_items` - Item tindak lanjut

### Functions & Triggers

- `handle_new_user()` - Auto-create profile
- `handle_updated_at()` - Auto-update timestamps
- `handle_action_item_completion()` - Manage action item status

### Views

- `notulensi_with_details` - Notulensi dengan detail lengkap
- `action_items_with_details` - Action items dengan detail lengkap

## 🆘 Butuh Bantuan?

Jika mengalami masalah:

1. **Periksa Logs**

   ```bash
   # Lihat logs development server
   pnpm dev

   # Lihat logs Supabase
   supabase logs
   ```

2. **Referensi Dokumentasi**

   - [Supabase Restore Docs](https://supabase.com/docs/guides/platform/migrating-within-supabase/dashboard-restore)
   - [Supabase CLI Docs](https://supabase.com/docs/guides/cli)

3. **Community Support**
   - [Supabase Discord](https://discord.supabase.com)
   - [GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

**✅ Restore Selesai!** Setelah mengikuti panduan ini, aplikasi Web Toolbox PKC Anda seharusnya berjalan dengan data yang telah direstore.

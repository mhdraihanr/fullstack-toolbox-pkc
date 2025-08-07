# Fix Database Error - "Database error saving new user"

## Problem
Saat melakukan registrasi user baru, muncul error:
```
{code: "unexpected_failure", message: "Database error saving new user"}
```

Error ini terjadi karena:
1. Tabel `profiles` belum dibuat di database
2. Function `handle_new_user()` belum ada
3. Trigger `on_auth_user_created` belum ada
4. Ada constraint atau permission issue di database

## Solution

### Step 1: Jalankan SQL Setup Script
1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda (ikxgujjtsxcsoxpcptmu)
3. Masuk ke **SQL Editor** (ikon database di sidebar kiri)
4. Klik **New Query**
5. Copy dan paste seluruh isi file `supabase-setup.sql`
6. Klik **Run** (atau tekan Ctrl+Enter) untuk menjalankan script
7. Tunggu hingga muncul pesan "Success. No rows returned"

### Step 2: Verifikasi Setup Database
Setelah menjalankan script, verifikasi di **Table Editor**:

1. **Cek Tabel Profiles**:
   - Masuk ke **Table Editor**
   - Pastikan tabel `profiles` sudah muncul
   - Kolom yang harus ada: `id`, `name`, `department`, `role`, `avatar_url`, `created_at`, `updated_at`

2. **Cek Functions**:
   - Masuk ke **Database** → **Functions**
   - Pastikan function `handle_new_user` dan `handle_updated_at` sudah ada

3. **Cek Triggers**:
   - Masuk ke **Database** → **Triggers**
   - Pastikan trigger `on_auth_user_created` sudah ada pada tabel `auth.users`

### Step 3: Test Registration
1. Buka aplikasi di browser
2. Masuk ke halaman registrasi: `/auth/register`
3. Isi form dengan data lengkap:
   - Email
   - Password
   - Nama
   - Departemen
   - Role
4. Klik **Register**
5. Periksa apakah registrasi berhasil tanpa error

### Step 4: Verifikasi Data Tersimpan
Setelah registrasi berhasil:
1. Masuk ke **Table Editor** di Supabase Dashboard
2. Buka tabel `profiles`
3. Pastikan data user baru sudah tersimpan:
   - `id`: UUID yang sama dengan auth.users
   - `name`: Nama yang diinput saat registrasi
   - `department`: Departemen yang dipilih
   - `role`: Role yang dipilih
   - `created_at`: Timestamp saat registrasi

### Step 5: Test Login dan Profile Display
1. Login dengan user yang baru didaftarkan
2. Masuk ke halaman demo: `/auth/demo`
3. Pastikan informasi user ditampilkan dengan benar:
   - Nama dari tabel `profiles`
   - Departemen dari tabel `profiles`
   - Role dari tabel `profiles`

## Troubleshooting

### Jika masih ada error "Database error saving new user":

1. **Check SQL Script Execution**:
   ```sql
   -- Jalankan query ini untuk cek apakah tabel sudah ada
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' AND table_name = 'profiles';
   ```

2. **Check Function Exists**:
   ```sql
   -- Jalankan query ini untuk cek function
   SELECT routine_name FROM information_schema.routines 
   WHERE routine_schema = 'public' AND routine_name = 'handle_new_user';
   ```

3. **Check Trigger Exists**:
   ```sql
   -- Jalankan query ini untuk cek trigger
   SELECT trigger_name FROM information_schema.triggers 
   WHERE event_object_table = 'users' AND trigger_name = 'on_auth_user_created';
   ```

4. **Manual Test Function**:
   ```sql
   -- Test function secara manual
   SELECT public.handle_new_user();
   ```

### Jika error "permission denied":
1. Pastikan RLS policies sudah benar
2. Cek di **Authentication** → **Policies**
3. Pastikan ada policies untuk `profiles` table:
   - "Users can view own profile"
   - "Users can update own profile"
   - "Users can insert own profile"

### Verification Checklist:
- [ ] ✅ Tabel `profiles` exists di public schema
- [ ] ✅ Function `handle_new_user()` exists
- [ ] ✅ Function `handle_updated_at()` exists
- [ ] ✅ Trigger `on_auth_user_created` exists pada auth.users
- [ ] ✅ Trigger `handle_updated_at` exists pada profiles
- [ ] ✅ RLS enabled pada tabel `profiles`
- [ ] ✅ 3 RLS policies sudah ada (SELECT, INSERT, UPDATE)
- [ ] ✅ Test registration berhasil tanpa error
- [ ] ✅ Data user tersimpan di tabel `profiles`
- [ ] ✅ Login dan display profile berfungsi

## Technical Details

### Apa yang dilakukan oleh `supabase-setup.sql`:

1. **Membuat Tabel Profiles**:
   ```sql
   CREATE TABLE public.profiles (
     id uuid references auth.users on delete cascade primary key,
     name text,
     department text,
     role text default 'employee',
     avatar_url text,
     created_at timestamp with time zone default now(),
     updated_at timestamp with time zone default now()
   );
   ```

2. **Enable Row Level Security**:
   - Memastikan user hanya bisa akses data mereka sendiri
   - 3 policies: SELECT, INSERT, UPDATE untuk own profile

3. **Auto-Create Profile Function**:
   - Function `handle_new_user()` mengambil data dari `raw_user_meta_data`
   - Otomatis insert ke tabel `profiles` saat user register

4. **Trigger Setup**:
   - Trigger `on_auth_user_created` dijalankan AFTER INSERT pada `auth.users`
   - Trigger `handle_updated_at` untuk auto-update timestamp

### Flow Registrasi Setelah Fix:
1. User mengisi form registrasi
2. Data dikirim ke Supabase Auth (`/auth/v1/signup`)
3. Supabase membuat user di tabel `auth.users`
4. Trigger `on_auth_user_created` otomatis dijalankan
5. Function `handle_new_user()` mengambil data dari `raw_user_meta_data`
6. Data disimpan ke tabel `public.profiles`
7. User berhasil terdaftar dan bisa login

### Mengapa Error Terjadi Sebelumnya:
- Aplikasi frontend sudah siap mengirim data `name`, `department`, `role`
- Tapi database belum punya tabel `profiles` untuk menyimpan data tersebut
- Function `handle_new_user()` belum ada untuk memproses data registrasi
- Trigger belum ada untuk menjalankan function secara otomatis

Setelah menjalankan script SQL ini, semua komponen database sudah lengkap dan registrasi akan berjalan normal.
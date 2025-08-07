# 🚀 Panduan Setup Supabase untuk Web Toolbox PKC

Panduan ini akan membantu Anda membuat project Supabase dan mendapatkan API keys yang diperlukan untuk menjalankan sistem authentication.

## 📋 Langkah-langkah Setup

### 1. Buat Akun Supabase

1. Kunjungi [https://supabase.com](https://supabase.com)
2. Klik **"Start your project"** atau **"Sign Up"**
3. Daftar menggunakan GitHub, Google, atau email
4. Verifikasi email Anda jika diperlukan

### 2. Buat Project Baru

1. Setelah login, klik **"New Project"**
2. Pilih **Organization** (biasanya nama Anda)
3. Isi detail project:
   - **Name**: `web-toolbox-pkc` (atau nama yang Anda inginkan)
   - **Database Password**: Buat password yang kuat (simpan dengan aman!)
   - **Region**: Pilih yang terdekat dengan lokasi Anda (contoh: Southeast Asia)
   - **Pricing Plan**: Pilih **"Free"** untuk development
4. Klik **"Create new project"**
5. Tunggu beberapa menit hingga project selesai dibuat

### 3. Dapatkan API Keys dan URL

1. Setelah project selesai dibuat, Anda akan diarahkan ke Dashboard
2. Di sidebar kiri, klik **"Settings"** (ikon gear)
3. Klik **"API"** di menu Settings
4. Anda akan melihat informasi berikut:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: Key untuk client-side (dimulai dengan `eyJ...`)
   - **service_role**: Key untuk server-side (dimulai dengan `eyJ...`)

### 4. Setup Environment Variables

1. Buka file `.env.local` di root project Anda
2. Ganti placeholder values dengan data dari Supabase:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Supabase Service Role Key (untuk admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

**⚠️ PENTING:**
- Ganti `your-project-id` dengan ID project Supabase Anda
- Ganti `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` dengan anon key yang sebenarnya
- Jangan commit file `.env.local` ke Git!

### 5. Setup Authentication di Supabase

1. Di Dashboard Supabase, klik **"Authentication"** di sidebar
2. Klik **"Settings"** di menu Authentication
3. Di tab **"General"**:
   - **Site URL**: `http://localhost:3000` (untuk development)
   - **Redirect URLs**: Tambahkan:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/reset-password`

### 6. Setup Database Schema (Opsional)

Untuk menyimpan metadata user tambahan:

1. Di Dashboard, klik **"SQL Editor"**
2. Jalankan query berikut:

```sql
-- Buat tabel profiles untuk metadata user tambahan
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  department text,
  role text default 'user',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;

-- Policy: Users can view their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Policy: Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Policy: Users can insert their own profile
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Function untuk auto-create profile saat user register
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, department, role)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'department',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger untuk auto-create profile
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 7. Test Koneksi

1. Restart development server:
   ```bash
   pnpm dev
   ```

2. Buka browser ke `http://localhost:3000`
3. Navigasi ke `/auth/demo` untuk test authentication
4. Coba register user baru
5. Cek di Supabase Dashboard > Authentication > Users untuk melihat user yang terdaftar

## 🔧 Troubleshooting

### Error: "Your project's URL and Key are required"
- Pastikan file `.env.local` sudah dibuat dan berisi values yang benar
- Restart development server setelah mengubah environment variables
- Pastikan tidak ada typo di environment variable names

### Error: "Invalid API key"
- Pastikan menggunakan **anon key**, bukan service_role key untuk client-side
- Copy paste key langsung dari Dashboard Supabase
- Pastikan tidak ada spasi di awal/akhir key

### Error: "Failed to fetch"
- Pastikan Project URL benar dan project sudah aktif
- Cek koneksi internet
- Pastikan project tidak di-pause (free tier bisa auto-pause)

### User tidak bisa register
- Pastikan email confirmation diaktifkan di Authentication > Settings
- Cek spam folder untuk email konfirmasi
- Untuk development, bisa disable email confirmation sementara

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

## 🆘 Butuh Bantuan?

Jika masih ada masalah:
1. Cek [Supabase Community](https://github.com/supabase/supabase/discussions)
2. Baca [FAQ Authentication](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
3. Pastikan mengikuti semua langkah di atas dengan teliti

---

**Selamat! 🎉** Setelah setup selesai, sistem authentication Supabase siap digunakan untuk Web Toolbox PKC.
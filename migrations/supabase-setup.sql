-- Supabase Setup Script untuk Web Toolbox PKC
-- Jalankan script ini di Supabase SQL Editor untuk setup database

-- 1. Buat tabel profiles untuk metadata user tambahan
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  department text,
  role text default 'employee',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 4. Buat policies untuk RLS
-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Function untuk auto-create profile saat user register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, department, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'department',
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Hapus trigger lama jika ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 7. Buat trigger untuk auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. Buat function untuk update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 9. Buat trigger untuk auto-update updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Selesai! Sekarang saat user register, profile akan otomatis dibuat dengan data dari registration form.
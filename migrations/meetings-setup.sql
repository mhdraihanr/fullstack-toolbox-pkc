-- Meetings Setup Script untuk Web Toolbox PKC
-- Jalankan script ini di Supabase SQL Editor untuk setup tabel meetings

-- 1. Buat tabel meetings
CREATE TABLE IF NOT EXISTS public.meetings (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  date_time timestamp with time zone not null,
  duration integer not null default 60, -- dalam menit
  status text default 'scheduled' check (status in ('scheduled', 'in-progress', 'completed', 'cancelled')),
  location text,
  meeting_type text default 'onsite' check (meeting_type in ('onsite', 'virtual', 'hybrid')),
  meeting_link text, -- Link untuk virtual/hybrid meetings
  qr_code_url text,
  qr_code_expires_at timestamp with time zone,
  created_by uuid references public.profiles(id) on delete cascade not null,
  agenda text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Buat tabel meeting_participants
CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references public.meetings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'invited' check (status in ('invited', 'accepted', 'declined', 'tentative')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(meeting_id, user_id)
);

-- 3. Buat tabel meeting_attendance
CREATE TABLE IF NOT EXISTS public.meeting_attendance (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references public.meetings(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  checked_in_at timestamp with time zone default timezone('utc'::text, now()) not null,
  check_in_method text default 'manual' check (check_in_method in ('qr_code', 'manual', 'auto')),
  location_lat decimal,
  location_lng decimal,
  device_info text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  UNIQUE(meeting_id, user_id)
);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendance ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can create meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can update meetings" ON public.meetings;
DROP POLICY IF EXISTS "Users can delete own meetings" ON public.meetings;

DROP POLICY IF EXISTS "Users can view meeting participants" ON public.meeting_participants;
DROP POLICY IF EXISTS "Users can manage meeting participants" ON public.meeting_participants;

DROP POLICY IF EXISTS "Users can view meeting attendance" ON public.meeting_attendance;
DROP POLICY IF EXISTS "Users can manage meeting attendance" ON public.meeting_attendance;

-- 6. Buat policies untuk meetings
-- Policy: Users can view all meetings (untuk kolaborasi)
CREATE POLICY "Users can view all meetings" ON public.meetings
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Users can create meetings
CREATE POLICY "Users can create meetings" ON public.meetings
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update meetings (creator atau admin/manager)
CREATE POLICY "Users can update meetings" ON public.meetings
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Policy: Users can delete own meetings atau admin/manager
CREATE POLICY "Users can delete own meetings" ON public.meetings
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 7. Buat policies untuk meeting_participants
-- Policy: Users can view meeting participants
CREATE POLICY "Users can view meeting participants" ON public.meeting_participants
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Users can manage meeting participants (creator atau admin/manager)
CREATE POLICY "Users can manage meeting participants" ON public.meeting_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = meeting_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      )
    ) OR
    user_id = auth.uid() -- Users can update their own participation status
  );

-- 8. Buat policies untuk meeting_attendance
-- Policy: Users can view meeting attendance
CREATE POLICY "Users can view meeting attendance" ON public.meeting_attendance
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Users can manage meeting attendance
CREATE POLICY "Users can manage meeting attendance" ON public.meeting_attendance
  FOR ALL USING (
    user_id = auth.uid() OR -- Users can manage their own attendance
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = meeting_id AND (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.profiles 
          WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
      )
    )
  );

-- 9. Buat trigger untuk auto-update updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.meetings;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 10. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_meetings_created_by ON public.meetings(created_by);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_date_time ON public.meetings(date_time);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_type ON public.meetings(meeting_type);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON public.meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON public.meeting_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_meeting_attendance_meeting_id ON public.meeting_attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendance_user_id ON public.meeting_attendance(user_id);

-- 11. Insert sample data (opsional)
INSERT INTO public.meetings (title, description, date_time, duration, status, location, meeting_type, created_by, agenda)
SELECT 
  'Setup Database Meetings',
  'Mengatur database untuk sistem manajemen meetings',
  timezone('utc'::text, now()) + interval '1 day',
  90,
  'scheduled',
  'Ruang Rapat Utama',
  'onsite',
  id,
  ARRAY['Setup database', 'Testing functionality', 'Review implementation']
FROM public.profiles 
WHERE role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Selesai! Tabel meetings sudah siap digunakan.
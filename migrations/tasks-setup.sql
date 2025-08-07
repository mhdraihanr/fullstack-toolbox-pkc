-- Tasks Setup Script untuk Web Toolbox PKC
-- Jalankan script ini di Supabase SQL Editor untuk setup tabel tasks

-- 1. Buat tabel tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'in-progress', 'completed', 'cancelled')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  tags text[] default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS (Row Level Security)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;

-- 4. Buat policies untuk RLS
-- Policy: Users can view all tasks (untuk kolaborasi)
CREATE POLICY "Users can view all tasks" ON public.tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Users can create tasks
CREATE POLICY "Users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Policy: Users can update tasks (creator atau assignee)
CREATE POLICY "Users can update tasks" ON public.tasks
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.uid() = assignee_id OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Policy: Users can delete own tasks atau admin/manager
CREATE POLICY "Users can delete own tasks" ON public.tasks
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 5. Buat trigger untuk auto-update updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.tasks;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 6. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- 7. Insert sample data (opsional)
INSERT INTO public.tasks (title, description, status, priority, created_by, due_date, tags)
SELECT 
  'Setup Database Tasks',
  'Mengatur database untuk sistem manajemen tasks',
  'completed',
  'high',
  id,
  timezone('utc'::text, now()) + interval '7 days',
  ARRAY['setup', 'database', 'tasks']
FROM public.profiles 
WHERE role = 'admin'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Selesai! Tabel tasks sudah siap digunakan.
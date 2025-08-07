-- Notulensi Setup Script untuk Web Toolbox PKC
-- Jalankan script ini di Supabase SQL Editor untuk setup tabel notulensi

-- 1. Buat tabel notulensi
CREATE TABLE IF NOT EXISTS public.notulensi (
  id uuid default gen_random_uuid() primary key,
  meeting_id uuid references public.meetings(id) on delete cascade not null,
  content text not null,
  decisions text[] default '{}',
  next_meeting_date timestamp with time zone,
  created_by uuid references public.profiles(id) on delete cascade not null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamp with time zone,
  is_draft boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Buat tabel action_items
CREATE TABLE IF NOT EXISTS public.action_items (
  id uuid default gen_random_uuid() primary key,
  notulensi_id uuid references public.notulensi(id) on delete cascade not null,
  description text not null,
  assignee_id uuid references public.profiles(id) on delete set null,
  due_date timestamp with time zone,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  status text default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.notulensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all notulensi" ON public.notulensi;
DROP POLICY IF EXISTS "Users can create notulensi" ON public.notulensi;
DROP POLICY IF EXISTS "Users can update notulensi" ON public.notulensi;
DROP POLICY IF EXISTS "Users can delete own notulensi" ON public.notulensi;

DROP POLICY IF EXISTS "Users can view action items" ON public.action_items;
DROP POLICY IF EXISTS "Users can manage action items" ON public.action_items;

-- 5. Buat policies untuk notulensi
-- Policy: Users can view all notulensi (untuk kolaborasi)
CREATE POLICY "Users can view all notulensi" ON public.notulensi
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Users can create notulensi
CREATE POLICY "Users can create notulensi" ON public.notulensi
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.meetings 
      WHERE id = meeting_id
    )
  );

-- Policy: Users can update notulensi (creator, approver, atau admin/manager)
CREATE POLICY "Users can update notulensi" ON public.notulensi
  FOR UPDATE USING (
    auth.uid() = created_by OR
    auth.uid() = approved_by OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Policy: Users can delete own notulensi (hanya jika belum disetujui)
CREATE POLICY "Users can delete own notulensi" ON public.notulensi
  FOR DELETE USING (
    auth.uid() = created_by AND approved_at IS NULL OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 6. Buat policies untuk action_items
-- Policy: Users can view action items
CREATE POLICY "Users can view action items" ON public.action_items
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Policy: Users can manage action items (creator notulensi, assignee, atau admin/manager)
CREATE POLICY "Users can manage action items" ON public.action_items
  FOR ALL USING (
    assignee_id = auth.uid() OR -- Assignee can update their own action items
    EXISTS (
      SELECT 1 FROM public.notulensi 
      WHERE id = notulensi_id AND (
        created_by = auth.uid() OR
        approved_by = auth.uid()
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- 7. Buat trigger untuk auto-update updated_at pada notulensi
DROP TRIGGER IF EXISTS handle_updated_at ON public.notulensi;
CREATE TRIGGER handle_updated_at
  BEFORE UPDATE ON public.notulensi
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 8. Buat trigger untuk auto-update completed_at pada action_items
CREATE OR REPLACE FUNCTION public.handle_action_item_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Set completed_at when status changes to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = timezone('utc'::text, now());
  END IF;
  
  -- Clear completed_at when status changes from completed
  IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_action_item_completion ON public.action_items;
CREATE TRIGGER handle_action_item_completion
  BEFORE UPDATE ON public.action_items
  FOR EACH ROW EXECUTE PROCEDURE public.handle_action_item_completion();

-- 9. Buat index untuk performa
CREATE INDEX IF NOT EXISTS idx_notulensi_meeting_id ON public.notulensi(meeting_id);
CREATE INDEX IF NOT EXISTS idx_notulensi_created_by ON public.notulensi(created_by);
CREATE INDEX IF NOT EXISTS idx_notulensi_approved_by ON public.notulensi(approved_by);
CREATE INDEX IF NOT EXISTS idx_notulensi_is_draft ON public.notulensi(is_draft);
CREATE INDEX IF NOT EXISTS idx_notulensi_created_at ON public.notulensi(created_at);
CREATE INDEX IF NOT EXISTS idx_notulensi_approved_at ON public.notulensi(approved_at);

CREATE INDEX IF NOT EXISTS idx_action_items_notulensi_id ON public.action_items(notulensi_id);
CREATE INDEX IF NOT EXISTS idx_action_items_assignee_id ON public.action_items(assignee_id);
CREATE INDEX IF NOT EXISTS idx_action_items_status ON public.action_items(status);
CREATE INDEX IF NOT EXISTS idx_action_items_priority ON public.action_items(priority);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON public.action_items(due_date);

-- 10. Buat view untuk notulensi dengan data lengkap
CREATE OR REPLACE VIEW public.notulensi_with_details AS
SELECT 
  n.*,
  m.title as meeting_title,
  m.date_time as meeting_date,
  m.location as meeting_location,
  m.meeting_type,
  creator.name as creator_name,
  creator.role as creator_role,
  creator.department as creator_department,
  approver.name as approver_name,
  approver.role as approver_role,
  approver.department as approver_department,
  (
    SELECT COUNT(*) 
    FROM public.action_items ai 
    WHERE ai.notulensi_id = n.id
  ) as total_action_items,
  (
    SELECT COUNT(*) 
    FROM public.action_items ai 
    WHERE ai.notulensi_id = n.id AND ai.status = 'completed'
  ) as completed_action_items
FROM public.notulensi n
LEFT JOIN public.meetings m ON n.meeting_id = m.id
LEFT JOIN public.profiles creator ON n.created_by = creator.id
LEFT JOIN public.profiles approver ON n.approved_by = approver.id;

-- 11. Buat view untuk action items dengan data lengkap
CREATE OR REPLACE VIEW public.action_items_with_details AS
SELECT 
  ai.*,
  n.meeting_id,
  m.title as meeting_title,
  assignee.name as assignee_name,
  assignee.role as assignee_role,
  assignee.department as assignee_department,
  creator.name as creator_name
FROM public.action_items ai
LEFT JOIN public.notulensi n ON ai.notulensi_id = n.id
LEFT JOIN public.meetings m ON n.meeting_id = m.id
LEFT JOIN public.profiles assignee ON ai.assignee_id = assignee.id
LEFT JOIN public.profiles creator ON n.created_by = creator.id;

-- 12. Buat function untuk statistik notulensi
CREATE OR REPLACE FUNCTION public.get_notulensi_stats(user_id_param uuid DEFAULT NULL)
RETURNS TABLE (
  total_notulensi bigint,
  draft_notulensi bigint,
  approved_notulensi bigint,
  pending_approval bigint,
  total_action_items bigint,
  completed_action_items bigint,
  overdue_action_items bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(n.id) as total_notulensi,
    COUNT(n.id) FILTER (WHERE n.is_draft = true) as draft_notulensi,
    COUNT(n.id) FILTER (WHERE n.approved_at IS NOT NULL) as approved_notulensi,
    COUNT(n.id) FILTER (WHERE n.approved_at IS NULL AND n.is_draft = false) as pending_approval,
    COUNT(ai.id) as total_action_items,
    COUNT(ai.id) FILTER (WHERE ai.status = 'completed') as completed_action_items,
    COUNT(ai.id) FILTER (WHERE ai.status = 'pending' AND ai.due_date < timezone('utc'::text, now())) as overdue_action_items
  FROM public.notulensi n
  LEFT JOIN public.action_items ai ON n.id = ai.notulensi_id
  WHERE (user_id_param IS NULL OR n.created_by = user_id_param);
END;
$$ LANGUAGE plpgsql;

-- 13. Insert sample data (opsional)
-- Hanya insert jika ada meeting yang sudah ada
INSERT INTO public.notulensi (meeting_id, content, decisions, created_by, is_draft)
SELECT 
  m.id,
  'Notulensi sample untuk meeting: ' || m.title || E'\n\nPembahasan:\n- Review agenda meeting\n- Diskusi implementasi\n- Planning next steps',
  ARRAY['Melanjutkan implementasi sistem', 'Review progress mingguan'],
  m.created_by,
  false
FROM public.meetings m
WHERE m.title = 'Setup Database Meetings'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert sample action items
INSERT INTO public.action_items (notulensi_id, description, assignee_id, due_date, priority, status)
SELECT 
  n.id,
  'Menyelesaikan setup database notulensi',
  n.created_by,
  timezone('utc'::text, now()) + interval '3 days',
  'high',
  'pending'
FROM public.notulensi n
WHERE n.content LIKE '%Notulensi sample%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Selesai! Tabel notulensi sudah siap digunakan.
-- 
-- Untuk menggunakan:
-- 1. Buat notulensi baru dengan meeting_id yang valid
-- 2. Tambahkan action items sesuai kebutuhan
-- 3. Approve notulensi dengan mengisi approved_by dan approved_at
-- 4. Export ke PDF menggunakan API endpoint /api/notulensi/[id]/export
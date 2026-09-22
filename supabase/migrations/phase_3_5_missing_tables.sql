-- ====================================================================
-- HI MUMMA - PHASE 3-5 MISSING TABLES MIGRATION
-- Installs Phase 3, 4, and 5 tables, indexes, and patient RLS policies.
-- Safe to execute against live Supabase database with existing Phase 1 tables.
-- ====================================================================

-- 1. PREGNANCY TEST RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.pregnancy_test_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_recorded', 'recorded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_patient_pregnancy_test UNIQUE (patient_id, test_id)
);

-- 2. ULTRASOUND MILESTONES RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.ultrasound_milestones_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  milestone_id TEXT NOT NULL,
  title TEXT NOT NULL,
  timing TEXT,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('not_recorded', 'recorded')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_patient_ultrasound_milestone UNIQUE (patient_id, milestone_id)
);

-- 3. DAILY SUPPLEMENT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.daily_supplement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  iron BOOLEAN NOT NULL DEFAULT FALSE,
  folic_acid BOOLEAN NOT NULL DEFAULT FALSE,
  calcium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_patient_supplement_date UNIQUE (patient_id, log_date)
);

-- 4. FETAL MOVEMENT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.fetal_movement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  count INT NOT NULL,
  duration_minutes INT NOT NULL,
  time_label TEXT NOT NULL,
  timestamp_str TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEDICAL RECORDS TABLE (DIGITAL VAULT)
CREATE TABLE IF NOT EXISTS public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  folder TEXT NOT NULL CHECK (folder IN ('first_trimester', 'second_trimester', 'third_trimester', 'postpartum')),
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'camera', 'gallery')),
  file_size TEXT NOT NULL,
  preview_url TEXT,
  record_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DELIVERY PREPARATION ITEMS TABLE (HOSPITAL BAG CHECKLIST)
CREATE TABLE IF NOT EXISTS public.delivery_prep_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mum', 'partner', 'baby', 'documents')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_patient_prep_item UNIQUE (patient_id, item_id)
);

-- 7. PRENATAL VISIT QUESTIONS TABLE (OB-GYN QUESTION LEDGER)
CREATE TABLE IF NOT EXISTS public.prenatal_visit_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visit_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('General Support', 'Trimester Tips', 'Postpartum Care', 'Nutrition')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. EXPERT QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.expert_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_pregnancy_test_records_patient ON public.pregnancy_test_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_ultrasound_milestones_records_patient ON public.ultrasound_milestones_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_daily_supplement_logs_patient ON public.daily_supplement_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_fetal_movement_logs_patient ON public.fetal_movement_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_delivery_prep_items_patient ON public.delivery_prep_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_prenatal_visit_questions_patient ON public.prenatal_visit_questions(patient_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_questions_patient ON public.expert_questions(patient_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.pregnancy_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ultrasound_milestones_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_supplement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fetal_movement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_prep_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenatal_visit_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_questions ENABLE ROW LEVEL SECURITY;

-- PATIENT OWNERSHIP RLS POLICIES FOR PHASE 3-5 TABLES

-- Pregnancy Test Records
DROP POLICY IF EXISTS "Patients manage own pregnancy tests" ON public.pregnancy_test_records;
CREATE POLICY "Patients manage own pregnancy tests"
  ON public.pregnancy_test_records FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Ultrasound Milestones Records
DROP POLICY IF EXISTS "Patients manage own ultrasound milestones" ON public.ultrasound_milestones_records;
CREATE POLICY "Patients manage own ultrasound milestones"
  ON public.ultrasound_milestones_records FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Daily Supplement Logs
DROP POLICY IF EXISTS "Patients manage own supplement logs" ON public.daily_supplement_logs;
CREATE POLICY "Patients manage own supplement logs"
  ON public.daily_supplement_logs FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Fetal Movement Logs
DROP POLICY IF EXISTS "Patients manage own fetal movement logs" ON public.fetal_movement_logs;
CREATE POLICY "Patients manage own fetal movement logs"
  ON public.fetal_movement_logs FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Medical Records
DROP POLICY IF EXISTS "Patients manage own medical records" ON public.medical_records;
CREATE POLICY "Patients manage own medical records"
  ON public.medical_records FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Delivery Preparation Items
DROP POLICY IF EXISTS "Patients manage own delivery prep items" ON public.delivery_prep_items;
CREATE POLICY "Patients manage own delivery prep items"
  ON public.delivery_prep_items FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Prenatal Visit Questions
DROP POLICY IF EXISTS "Patients manage own prenatal visit questions" ON public.prenatal_visit_questions;
CREATE POLICY "Patients manage own prenatal visit questions"
  ON public.prenatal_visit_questions FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Community Posts
DROP POLICY IF EXISTS "Authenticated users can read community posts" ON public.community_posts;
CREATE POLICY "Authenticated users can read community posts"
  ON public.community_posts FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert own community posts" ON public.community_posts;
CREATE POLICY "Users can insert own community posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own community posts" ON public.community_posts;
CREATE POLICY "Users can update own community posts"
  ON public.community_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own community posts" ON public.community_posts;
CREATE POLICY "Users can delete own community posts"
  ON public.community_posts FOR DELETE
  USING (auth.uid() = user_id);

-- Expert Questions
DROP POLICY IF EXISTS "Patients view own expert questions" ON public.expert_questions;
CREATE POLICY "Patients view own expert questions"
  ON public.expert_questions FOR SELECT
  USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Patients insert own expert questions" ON public.expert_questions;
CREATE POLICY "Patients insert own expert questions"
  ON public.expert_questions FOR INSERT
  WITH CHECK (auth.uid() = patient_id AND status = 'pending' AND answer IS NULL);

-- ====================================================================
-- HI MUMMA - PHASE 1 DATABASE SCHEMA & RLS SECURITY POLICIES
-- ====================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'guardian')),
  avatar_url TEXT,
  provider TEXT NOT NULL DEFAULT 'email',
  is_onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  phase TEXT NOT NULL DEFAULT 'pregnancy',
  postpartum_day INT DEFAULT 8,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PATIENT PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.patient_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date DATE,
  is_first_pregnancy BOOLEAN DEFAULT TRUE,
  location TEXT
);

-- 3. GUARDIAN PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.guardian_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL,
  connected_patient_name TEXT,
  phone TEXT
);

-- 4. SUPPORT PEOPLE TABLE
CREATE TABLE IF NOT EXISTS public.support_people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT
);

-- 5. GUARDIAN-PATIENT RELATIONSHIP LINKS TABLE
CREATE TABLE IF NOT EXISTS public.guardian_patient_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  allow_vitals_view BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_guardian_patient_pair UNIQUE (guardian_id, patient_id)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_patient_links ENABLE ROW LEVEL SECURITY;

-- Profiles Security Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Patient Profiles Security Policies
DROP POLICY IF EXISTS "Mothers can read own patient profile" ON public.patient_profiles;
CREATE POLICY "Mothers can read own patient profile"
  ON public.patient_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mothers can insert own patient profile" ON public.patient_profiles;
CREATE POLICY "Mothers can insert own patient profile"
  ON public.patient_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Mothers can update own patient profile" ON public.patient_profiles;
CREATE POLICY "Mothers can update own patient profile"
  ON public.patient_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Guardian Profiles Security Policies
DROP POLICY IF EXISTS "Guardians can read own guardian profile" ON public.guardian_profiles;
CREATE POLICY "Guardians can read own guardian profile"
  ON public.guardian_profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Guardians can insert own guardian profile" ON public.guardian_profiles;
CREATE POLICY "Guardians can insert own guardian profile"
  ON public.guardian_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Guardians can update own guardian profile" ON public.guardian_profiles;
CREATE POLICY "Guardians can update own guardian profile"
  ON public.guardian_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Support People Security Policies
DROP POLICY IF EXISTS "Mothers can read own support people" ON public.support_people;
CREATE POLICY "Mothers can read own support people"
  ON public.support_people FOR SELECT
  USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Mothers can insert own support people" ON public.support_people;
CREATE POLICY "Mothers can insert own support people"
  ON public.support_people FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Mothers can update own support people" ON public.support_people;
CREATE POLICY "Mothers can update own support people"
  ON public.support_people FOR UPDATE
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Mothers can delete own support people" ON public.support_people;
CREATE POLICY "Mothers can delete own support people"
  ON public.support_people FOR DELETE
  USING (auth.uid() = patient_id);

-- Guardian Links Security Policies
DROP POLICY IF EXISTS "Users can read links where they are guardian or patient" ON public.guardian_patient_links;
CREATE POLICY "Users can read links where they are guardian or patient"
  ON public.guardian_patient_links FOR SELECT
  USING (auth.uid() = guardian_id OR auth.uid() = patient_id);

DROP POLICY IF EXISTS "Guardians or patients can insert relationship link" ON public.guardian_patient_links;
CREATE POLICY "Guardians or patients can insert relationship link"
  ON public.guardian_patient_links FOR INSERT
  WITH CHECK (auth.uid() = guardian_id OR auth.uid() = patient_id);

DROP POLICY IF EXISTS "Users can update relationship link where involved" ON public.guardian_patient_links;
CREATE POLICY "Users can update relationship link where involved"
  ON public.guardian_patient_links FOR UPDATE
  USING (auth.uid() = guardian_id OR auth.uid() = patient_id)
  WITH CHECK (auth.uid() = guardian_id OR auth.uid() = patient_id);

-- ====================================================================
-- SAFE AUTOMATIC PROFILE CREATION TRIGGER FUNCTION
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  user_role TEXT;
  user_provider TEXT;
BEGIN
  -- Safe name resolution
  user_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(split_part(NEW.email, '@', 1)), ''),
    'Mumma User'
  );

  -- Safe role resolution
  user_role := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'role'), ''), 'patient');
  IF user_role NOT IN ('patient', 'guardian') THEN
    user_role := 'patient';
  END IF;

  -- Safe provider resolution (using raw_app_meta_data or raw_user_meta_data)
  user_provider := COALESCE(
    NULLIF(TRIM(NEW.raw_app_meta_data->>'provider'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'provider'), ''),
    'email'
  );

  -- Safe insert/update into public.profiles
  INSERT INTO public.profiles (
    id,
    email,
    name,
    role,
    avatar_url,
    provider,
    is_onboarded,
    phase,
    postpartum_day,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    user_name,
    user_role,
    NEW.raw_user_meta_data->>'avatar_url',
    user_provider,
    FALSE,
    'pregnancy',
    8,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = CASE WHEN public.profiles.name = '' OR public.profiles.name IS NULL THEN EXCLUDED.name ELSE public.profiles.name END,
    updated_at = NOW();

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log warning without throwing/blocking auth.users INSERT
  RAISE WARNING 'handle_new_user trigger warning: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon, authenticated, service_role;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- HI MUMMA - PHASE 3 CARE DATABASE TABLES & RLS SECURITY POLICIES
-- ====================================================================

-- 6. PREGNANCY TEST RECORDS TABLE
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

-- 7. ULTRASOUND MILESTONES RECORDS TABLE
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

-- 8. DAILY SUPPLEMENT LOGS TABLE
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

-- 9. FETAL MOVEMENT LOGS TABLE
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

-- 10. MEDICAL RECORDS TABLE (DIGITAL VAULT)
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

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_pregnancy_test_records_patient ON public.pregnancy_test_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_ultrasound_milestones_records_patient ON public.ultrasound_milestones_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_daily_supplement_logs_patient ON public.daily_supplement_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_fetal_movement_logs_patient ON public.fetal_movement_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON public.medical_records(patient_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.pregnancy_test_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ultrasound_milestones_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_supplement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fetal_movement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PREGNANCY TEST RECORDS
DROP POLICY IF EXISTS "Patients manage own pregnancy tests" ON public.pregnancy_test_records;
CREATE POLICY "Patients manage own pregnancy tests"
  ON public.pregnancy_test_records FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- RLS POLICIES FOR ULTRASOUND MILESTONES RECORDS
DROP POLICY IF EXISTS "Patients manage own ultrasound milestones" ON public.ultrasound_milestones_records;
CREATE POLICY "Patients manage own ultrasound milestones"
  ON public.ultrasound_milestones_records FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- RLS POLICIES FOR DAILY SUPPLEMENT LOGS
DROP POLICY IF EXISTS "Patients manage own supplement logs" ON public.daily_supplement_logs;
CREATE POLICY "Patients manage own supplement logs"
  ON public.daily_supplement_logs FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- RLS POLICIES FOR FETAL MOVEMENT LOGS
DROP POLICY IF EXISTS "Patients manage own fetal movement logs" ON public.fetal_movement_logs;
CREATE POLICY "Patients manage own fetal movement logs"
  ON public.fetal_movement_logs FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- RLS POLICIES FOR MEDICAL RECORDS
DROP POLICY IF EXISTS "Patients manage own medical records" ON public.medical_records;
CREATE POLICY "Patients manage own medical records"
  ON public.medical_records FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- ====================================================================
-- HI MUMMA - PHASE 4 REMINDERS, DELIVERY & POSTPARTUM TABLES & RLS
-- ====================================================================

-- 11. DELIVERY PREPARATION ITEMS TABLE (HOSPITAL BAG CHECKLIST)
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

-- 12. PRENATAL VISIT QUESTIONS TABLE (OB-GYN QUESTION LEDGER)
CREATE TABLE IF NOT EXISTS public.prenatal_visit_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  visit_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_delivery_prep_items_patient ON public.delivery_prep_items(patient_id);
CREATE INDEX IF NOT EXISTS idx_prenatal_visit_questions_patient ON public.prenatal_visit_questions(patient_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.delivery_prep_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenatal_visit_questions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR DELIVERY PREPARATION ITEMS
DROP POLICY IF EXISTS "Patients manage own delivery prep items" ON public.delivery_prep_items;
CREATE POLICY "Patients manage own delivery prep items"
  ON public.delivery_prep_items FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- RLS POLICIES FOR PRENATAL VISIT QUESTIONS
DROP POLICY IF EXISTS "Patients manage own prenatal visit questions" ON public.prenatal_visit_questions;
CREATE POLICY "Patients manage own prenatal visit questions"
  ON public.prenatal_visit_questions FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- ====================================================================
-- HI MUMMA - PHASE 5 COMMUNITY & EXPERT Q&A TABLES & RLS
-- ====================================================================

-- 13. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('General Support', 'Trimester Tips', 'Postpartum Care', 'Nutrition')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EXPERT QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.expert_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered')),
  answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_expert_questions_patient ON public.expert_questions(patient_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_questions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR COMMUNITY POSTS
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

-- RLS POLICIES FOR EXPERT QUESTIONS
DROP POLICY IF EXISTS "Patients manage own expert questions" ON public.expert_questions;
DROP POLICY IF EXISTS "Patients view own expert questions" ON public.expert_questions;
DROP POLICY IF EXISTS "Patients insert own expert questions" ON public.expert_questions;

CREATE POLICY "Patients view own expert questions"
  ON public.expert_questions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients insert own expert questions"
  ON public.expert_questions FOR INSERT
  WITH CHECK (auth.uid() = patient_id AND status = 'pending' AND answer IS NULL);





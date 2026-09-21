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

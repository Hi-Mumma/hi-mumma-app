import { supabase } from './supabaseClient';
import {
  UserProfile,
  PatientProfile,
  GuardianProfile,
  SupportPerson,
  DailySupplements,
  PregnancyTestTrackingEntry,
  UltrasoundMilestoneTrackingEntry,
  FetalMovementEntry,
  MedicalRecordItem,
  RecordFolderType,
  MedicalTrackingStatus,
  ChecklistItem
} from '../types';

export interface DatabaseProfile {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'guardian';
  avatar_url?: string;
  provider: 'email' | 'google';
  is_onboarded: boolean;
  phase: 'pregnancy' | 'postpartum';
  postpartum_day?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DatabasePatientProfile {
  user_id: string;
  due_date?: string;
  is_first_pregnancy: boolean;
  location?: string;
}

export interface DatabaseGuardianProfile {
  user_id: string;
  relationship: string;
  connected_patient_name?: string;
  phone?: string;
}

export interface DatabaseSupportPerson {
  id: string;
  patient_id: string;
  name: string;
  relationship: 'partner' | 'mother' | 'guardian' | 'friend' | 'other';
  phone?: string;
}

export interface DatabaseGuardianPatientLink {
  id: string;
  guardian_id: string;
  patient_id: string;
  status: string;
  allow_vitals_view: boolean;
  created_at: string;
}

/**
 * Fetch base profile for a given user ID from public.profiles
 */
export async function getCurrentProfile(userId: string): Promise<DatabaseProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching current profile:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch patient profile details for a given patient user ID from public.patient_profiles
 */
export async function getPatientProfile(userId: string): Promise<DatabasePatientProfile | null> {
  const { data, error } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching patient profile:', error.message);
    return null;
  }
  return data;
}

/**
 * Fetch guardian profile details for a given guardian user ID from public.guardian_profiles
 */
export async function getGuardianProfile(userId: string): Promise<DatabaseGuardianProfile | null> {
  const { data, error } = await supabase
    .from('guardian_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching guardian profile:', error.message);
    return null;
  }
  return data;
}

/**
 * Upsert base profile in public.profiles table
 */
export async function createOrUpdateProfile(profileData: {
  id: string;
  email: string;
  name: string;
  role: 'patient' | 'guardian';
  avatar_url?: string;
  provider?: 'email' | 'google';
  is_onboarded?: boolean;
  phase?: 'pregnancy' | 'postpartum';
  postpartum_day?: number;
}): Promise<DatabaseProfile | null> {
  const payload = {
    id: profileData.id,
    email: profileData.email,
    name: profileData.name,
    role: profileData.role,
    avatar_url: profileData.avatar_url || null,
    provider: profileData.provider || 'email',
    is_onboarded: profileData.is_onboarded ?? false,
    phase: profileData.phase || 'pregnancy',
    postpartum_day: profileData.postpartum_day ?? 8,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();

  if (error) {
    console.error('Error upserting profile:', error.message);
    throw new Error(`Failed to save user profile: ${error.message}`);
  }
  return data;
}

/**
 * Upsert patient profile details in public.patient_profiles using user_id
 */
export async function createOrUpdatePatientProfile(
  userId: string,
  patientData: {
    due_date?: string;
    is_first_pregnancy?: boolean;
    location?: string;
  }
): Promise<DatabasePatientProfile | null> {
  let formattedDueDate: string | null = null;
  if (patientData.due_date && patientData.due_date.trim()) {
    const d = new Date(patientData.due_date.trim());
    if (!isNaN(d.getTime())) {
      formattedDueDate = d.toISOString().split('T')[0];
    } else {
      formattedDueDate = patientData.due_date.trim();
    }
  }

  const payload = {
    user_id: userId,
    due_date: formattedDueDate,
    is_first_pregnancy: patientData.is_first_pregnancy ?? true,
    location: patientData.location?.trim() || null
  };

  if (import.meta.env.DEV) {
    console.log('[Supabase] Upserting patient_profiles:', { userId, payload });
  }

  const { data, error } = await supabase
    .from('patient_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) {
    console.error('[Supabase] Error upserting patient profile:', error.message, error.details);
    throw new Error(`Failed to save patient profile into database: ${error.message}`);
  }

  if (import.meta.env.DEV) {
    console.log('[Supabase] Successfully upserted patient_profiles row:', data);
  }

  // Verification: immediately fetch the patient profile row back using the authenticated user ID
  const { data: verifiedRow, error: verifyError } = await supabase
    .from('patient_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (verifyError || !verifiedRow) {
    console.error('[Supabase] Patient profile verification failed:', verifyError?.message);
    throw new Error(`Patient profile persistence verification failed for user ID ${userId}.`);
  }

  return verifiedRow;
}

/**
 * Upsert guardian profile details in public.guardian_profiles using user_id
 */
export async function createOrUpdateGuardianProfile(
  userId: string,
  guardianData: {
    relationship: string;
    connected_patient_name?: string;
    phone?: string;
  }
): Promise<DatabaseGuardianProfile | null> {
  const payload = {
    user_id: userId,
    relationship: guardianData.relationship,
    connected_patient_name: guardianData.connected_patient_name?.trim() || null,
    phone: guardianData.phone?.trim() || null
  };

  const { data, error } = await supabase
    .from('guardian_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) {
    console.error('Error upserting guardian profile:', error.message);
    throw new Error(`Failed to save guardian profile into database: ${error.message}`);
  }
  return data;
}

/**
 * Get all support contacts linked to a patient
 */
export async function getSupportPeople(patientId: string): Promise<SupportPerson[]> {
  const { data, error } = await supabase
    .from('support_people')
    .select('*')
    .eq('patient_id', patientId);

  if (error) {
    console.error('Error fetching support people:', error.message);
    return [];
  }

  return (data || []).map((sp) => ({
    id: sp.id,
    name: sp.name,
    relationship: sp.relationship as SupportPerson['relationship'],
    phone: sp.phone || undefined
  }));
}

/**
 * Add a new support person for a patient
 */
export async function addSupportPerson(
  patientId: string,
  person: { name: string; relationship: SupportPerson['relationship']; phone?: string }
): Promise<SupportPerson | null> {
  const { data, error } = await supabase
    .from('support_people')
    .insert({
      patient_id: patientId,
      name: person.name,
      relationship: person.relationship,
      phone: person.phone || null
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error adding support person:', error.message);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    relationship: data.relationship as SupportPerson['relationship'],
    phone: data.phone || undefined
  };
}

/**
 * Get guardian relationship links involving a given user ID
 */
export async function getGuardianLinks(userId: string): Promise<DatabaseGuardianPatientLink[]> {
  const { data, error } = await supabase
    .from('guardian_patient_links')
    .select('*')
    .or(`guardian_id.eq.${userId},patient_id.eq.${userId}`);

  if (error) {
    console.error('Error fetching guardian links:', error.message);
    return [];
  }

  return data || [];
}

/**
 * Create or link a guardian to a patient with optional vitals permission
 */
export async function createGuardianLink(
  guardianId: string,
  patientId: string,
  allowVitalsView: boolean = false
): Promise<DatabaseGuardianPatientLink | null> {
  const { data, error } = await supabase
    .from('guardian_patient_links')
    .upsert(
      {
        guardian_id: guardianId,
        patient_id: patientId,
        status: 'active',
        allow_vitals_view: allowVitalsView
      },
      { onConflict: 'guardian_id,patient_id' }
    )
    .select('*')
    .single();

  if (error) {
    console.error('Error creating guardian link:', error.message);
    return null;
  }

  return data;
}

/**
 * Helper to fetch complete UserProfile object combining base profile, sub-profile, and support people directly from Supabase
 */
export async function getFullUserProfile(userId: string, authEmail?: string): Promise<UserProfile | null> {
  const baseProfile = await getCurrentProfile(userId);

  if (!baseProfile) {
    return null;
  }

  let patientProfileObj: PatientProfile | undefined = undefined;
  let guardianProfileObj: GuardianProfile | undefined = undefined;

  if (baseProfile.role === 'patient') {
    const patientData = await getPatientProfile(userId);
    const supportPeople = await getSupportPeople(userId);

    if (patientData) {
      patientProfileObj = {
        name: baseProfile.name,
        dueDate: patientData.due_date || '',
        isFirstPregnancy: patientData.is_first_pregnancy ?? true,
        location: patientData.location || '',
        supportPeople
      };
    }
  } else if (baseProfile.role === 'guardian') {
    const guardianData = await getGuardianProfile(userId);
    if (guardianData) {
      guardianProfileObj = {
        name: baseProfile.name,
        relationship: guardianData.relationship || '',
        connectedPatientName: guardianData.connected_patient_name || '',
        phone: guardianData.phone || undefined
      };
    }
  }

  // A patient is strictly onboarded ONLY if base profile is marked onboarded AND patient_profiles record exists
  const effectiveIsOnboarded =
    baseProfile.role === 'patient'
      ? baseProfile.is_onboarded && patientProfileObj !== undefined
      : baseProfile.is_onboarded && guardianProfileObj !== undefined;

  return {
    id: baseProfile.id,
    name: baseProfile.name,
    email: baseProfile.email || authEmail || '',
    role: baseProfile.role,
    avatarUrl: baseProfile.avatar_url || '/mother-hero.jpg',
    provider: baseProfile.provider || 'email',
    dueDate: patientProfileObj?.dueDate,
    isOnboarded: effectiveIsOnboarded,
    patientProfile: patientProfileObj,
    guardianProfile: guardianProfileObj
  };
}

/* ====================================================================
   PHASE 3: CARE SERVICES (TESTS, ULTRASOUNDS, SUPPLEMENTS, KICKS, RECORDS)
   ==================================================================== */

/**
 * Fetch pregnancy test tracking records for a patient
 */
export async function fetchPregnancyTestRecords(patientId: string): Promise<PregnancyTestTrackingEntry[]> {
  const { data, error } = await supabase
    .from('pregnancy_test_records')
    .select('*')
    .eq('patient_id', patientId);

  if (error) {
    console.error('Error fetching pregnancy test records:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.test_id,
    name: row.test_name,
    status: row.status as MedicalTrackingStatus
  }));
}

/**
 * Upsert a pregnancy test tracking status
 */
export async function upsertPregnancyTestRecord(
  patientId: string,
  testId: string,
  testName: string,
  status: MedicalTrackingStatus
) {
  const { error } = await supabase
    .from('pregnancy_test_records')
    .upsert(
      {
        patient_id: patientId,
        test_id: testId,
        test_name: testName,
        status,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'patient_id,test_id' }
    );

  if (error) {
    console.error('Error upserting pregnancy test record:', error.message);
  }
}

/**
 * Fetch ultrasound milestone tracking records for a patient
 */
export async function fetchUltrasoundMilestonesRecords(patientId: string): Promise<UltrasoundMilestoneTrackingEntry[]> {
  const { data, error } = await supabase
    .from('ultrasound_milestones_records')
    .select('*')
    .eq('patient_id', patientId);

  if (error) {
    console.error('Error fetching ultrasound milestone records:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.milestone_id,
    title: row.title,
    timing: row.timing || '',
    description: row.description || undefined,
    status: row.status as MedicalTrackingStatus
  }));
}

/**
 * Upsert an ultrasound milestone status
 */
export async function upsertUltrasoundMilestoneRecord(
  patientId: string,
  milestoneId: string,
  title: string,
  status: MedicalTrackingStatus,
  timing?: string,
  description?: string
) {
  const { error } = await supabase
    .from('ultrasound_milestones_records')
    .upsert(
      {
        patient_id: patientId,
        milestone_id: milestoneId,
        title,
        status,
        timing: timing || null,
        description: description || null,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'patient_id,milestone_id' }
    );

  if (error) {
    console.error('Error upserting ultrasound milestone record:', error.message);
  }
}

/**
 * Fetch daily supplement log for a given date
 */
export async function fetchDailySupplementLog(patientId: string, dateStr?: string): Promise<DailySupplements | null> {
  const today = dateStr || new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('daily_supplement_logs')
    .select('*')
    .eq('patient_id', patientId)
    .eq('log_date', today)
    .maybeSingle();

  if (error) {
    console.error('Error fetching daily supplement log:', error.message);
    return null;
  }

  if (!data) return null;

  return {
    iron: data.iron,
    folicAcid: data.folic_acid,
    calcium: data.calcium
  };
}

/**
 * Upsert daily supplement log for a given date
 */
export async function upsertDailySupplementLog(
  patientId: string,
  supplements: DailySupplements,
  dateStr?: string
) {
  const today = dateStr || new Date().toISOString().split('T')[0];
  const { error } = await supabase
    .from('daily_supplement_logs')
    .upsert(
      {
        patient_id: patientId,
        log_date: today,
        iron: supplements.iron,
        folic_acid: supplements.folicAcid,
        calcium: supplements.calcium,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'patient_id,log_date' }
    );

  if (error) {
    console.error('Error upserting daily supplement log:', error.message);
  }
}

/**
 * Fetch fetal movement counter logs for a patient
 */
export async function fetchFetalMovementLogs(patientId: string): Promise<FetalMovementEntry[]> {
  const { data, error } = await supabase
    .from('fetal_movement_logs')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching fetal movement logs:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    count: row.count,
    durationMinutes: row.duration_minutes,
    timeLabel: row.time_label,
    timestamp: row.timestamp_str,
    notes: row.notes || undefined
  }));
}

/**
 * Add a new fetal movement counter log
 */
export async function addFetalMovementLog(
  patientId: string,
  count: number,
  durationMinutes: number,
  timeLabel: string,
  timestampStr: string,
  notes?: string
): Promise<FetalMovementEntry | null> {
  const { data, error } = await supabase
    .from('fetal_movement_logs')
    .insert({
      patient_id: patientId,
      count,
      duration_minutes: durationMinutes,
      time_label: timeLabel,
      timestamp_str: timestampStr,
      notes: notes || null
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error inserting fetal movement log:', error.message);
    return null;
  }

  return {
    id: data.id,
    count: data.count,
    durationMinutes: data.durationMinutes,
    timeLabel: data.time_label,
    timestamp: data.timestamp_str,
    notes: data.notes || undefined
  };
}

/**
 * Fetch digital medical records for a patient
 */
export async function fetchMedicalRecords(patientId: string): Promise<MedicalRecordItem[]> {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching medical records:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    name: row.name,
    folder: row.folder as RecordFolderType,
    date: row.record_date || new Date(row.created_at).toLocaleDateString(),
    fileType: row.file_type as 'pdf' | 'camera' | 'gallery',
    fileSize: row.file_size,
    previewUrl: row.preview_url || undefined
  }));
}

/**
 * Add a digital medical record for a patient
 */
export async function addMedicalRecord(
  patientId: string,
  name: string,
  folder: RecordFolderType,
  fileType: 'pdf' | 'camera' | 'gallery',
  fileSize: string,
  previewUrl?: string
): Promise<MedicalRecordItem | null> {
  const { data, error } = await supabase
    .from('medical_records')
    .insert({
      patient_id: patientId,
      name,
      folder,
      file_type: fileType,
      file_size: fileSize,
      preview_url: previewUrl || null
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error inserting medical record:', error.message);
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    folder: data.folder as RecordFolderType,
    date: data.record_date || 'Just now',
    fileType: data.file_type as 'pdf' | 'camera' | 'gallery',
    fileSize: data.file_size,
    previewUrl: data.preview_url || undefined
  };
}

/* ====================================================================
   PHASE 4: REMINDERS, DELIVERY & POSTPARTUM SERVICES
   ==================================================================== */

/**
 * Fetch delivery preparation checklist items (Hospital Bag) for a patient
 */
export async function fetchDeliveryPrepItems(patientId: string): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from('delivery_prep_items')
    .select('*')
    .eq('patient_id', patientId);

  if (error) {
    console.error('Error fetching delivery prep items:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.item_id,
    label: row.label,
    completed: row.completed,
    category: row.category as ChecklistItem['category']
  }));
}

/**
 * Upsert delivery preparation checklist item completion state
 */
export async function upsertDeliveryPrepItem(
  patientId: string,
  itemId: string,
  label: string,
  category: string,
  completed: boolean
) {
  const { error } = await supabase
    .from('delivery_prep_items')
    .upsert(
      {
        patient_id: patientId,
        item_id: itemId,
        label,
        category,
        completed,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'patient_id,item_id' }
    );

  if (error) {
    console.error('Error upserting delivery prep item:', error.message);
  }
}

/**
 * Fetch patient questions for prenatal visits
 */
export async function fetchPrenatalVisitQuestions(
  patientId: string
): Promise<{ visitId: string; questionText: string }[]> {
  const { data, error } = await supabase
    .from('prenatal_visit_questions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching prenatal visit questions:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    visitId: row.visit_id,
    questionText: row.question_text
  }));
}

/**
 * Add a question to a prenatal visit
 */
export async function addPrenatalVisitQuestion(
  patientId: string,
  visitId: string,
  questionText: string
) {
  const { error } = await supabase
    .from('prenatal_visit_questions')
    .insert({
      patient_id: patientId,
      visit_id: visitId,
      question_text: questionText
    });

  if (error) {
    console.error('Error inserting prenatal visit question:', error.message);
  }
}

/**
 * Update patient postpartum journey phase and recovery day in profiles
 */
export async function updatePatientPostpartumState(
  patientId: string,
  phase: 'pregnancy' | 'postpartum',
  postpartumDay: number
) {
  const { error } = await supabase
    .from('profiles')
    .update({
      phase,
      postpartum_day: postpartumDay,
      updated_at: new Date().toISOString()
    })
    .eq('id', patientId);

  if (error) {
    console.error('Error updating patient postpartum state:', error.message);
  }
}



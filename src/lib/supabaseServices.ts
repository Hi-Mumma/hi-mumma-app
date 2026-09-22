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
  ChecklistItem,
  CommunityPost,
  ExpertQuestion,
  CaregiverPermissions,
  DatabaseGuardianPatientLink,
  GuardianLinkedPatientData
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

export interface DatabaseGuardianPatientLinkRow {
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
 * Fetch all caregiver links and permissions for a patient
 */
export async function fetchPatientCaregiverLinks(patientId: string): Promise<DatabaseGuardianPatientLink[]> {
  const { data, error } = await supabase
    .from('guardian_patient_links')
    .select('*')
    .eq('patient_id', patientId);

  if (error) {
    console.error('Error fetching caregiver links:', error.message);
    return [];
  }

  const enriched: DatabaseGuardianPatientLink[] = [];
  for (const row of data || []) {
    let guardianName = 'Caregiver';
    let guardianEmail = '';

    const { data: prof } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', row.guardian_id)
      .maybeSingle();

    if (prof) {
      guardianName = prof.name || 'Caregiver';
      guardianEmail = prof.email || '';
    }

    enriched.push({
      id: row.id,
      guardianId: row.guardian_id,
      patientId: row.patient_id,
      status: row.status as any,
      permissions: {
        allowVitalsView: row.allow_vitals_view ?? false,
        allowJourneyView: row.allow_journey_view ?? false,
        allowCareView: row.allow_care_view ?? false,
        allowRemindersView: row.allow_reminders_view ?? false,
        allowDeliveryPrepView: row.allow_delivery_prep_view ?? false,
        allowPostpartumView: row.allow_postpartum_view ?? false,
        allowSharedTasksView: row.allow_shared_tasks_view ?? false
      },
      guardianName,
      guardianEmail,
      createdAt: row.created_at
    });
  }

  return enriched;
}

/**
 * Update caregiver permissions for a link
 */
export async function updateCaregiverLinkPermissions(
  linkId: string,
  permissions: Partial<CaregiverPermissions>
): Promise<boolean> {
  const payload: Record<string, boolean> = {};
  if (permissions.allowVitalsView !== undefined) payload.allow_vitals_view = permissions.allowVitalsView;
  if (permissions.allowJourneyView !== undefined) payload.allow_journey_view = permissions.allowJourneyView;
  if (permissions.allowCareView !== undefined) payload.allow_care_view = permissions.allowCareView;
  if (permissions.allowRemindersView !== undefined) payload.allow_reminders_view = permissions.allowRemindersView;
  if (permissions.allowDeliveryPrepView !== undefined) payload.allow_delivery_prep_view = permissions.allowDeliveryPrepView;
  if (permissions.allowPostpartumView !== undefined) payload.allow_postpartum_view = permissions.allowPostpartumView;
  if (permissions.allowSharedTasksView !== undefined) payload.allow_shared_tasks_view = permissions.allowSharedTasksView;

  const { error } = await supabase
    .from('guardian_patient_links')
    .update(payload)
    .eq('id', linkId);

  if (error) {
    console.error('Error updating caregiver permissions:', error.message);
    return false;
  }
  return true;
}

/**
 * Revoke or delete a caregiver relationship link
 */
export async function revokeCaregiverLink(linkId: string): Promise<boolean> {
  const { error } = await supabase
    .from('guardian_patient_links')
    .delete()
    .eq('id', linkId);

  if (error) {
    console.error('Error revoking caregiver link:', error.message);
    return false;
  }
  return true;
}

/**
 * Add / link a caregiver by email for a patient
 */
export async function createCaregiverLinkByEmail(
  patientId: string,
  caregiverEmail: string,
  relationship: string
): Promise<DatabaseGuardianPatientLink | null> {
  const cleanEmail = caregiverEmail.trim().toLowerCase();

  // Call SECURITY DEFINER RPC to resolve guardian user ID safely without exposing profiles
  const { data: resolvedGuardianId, error: rpcError } = await supabase.rpc(
    'resolve_caregiver_id_by_email',
    { email_input: cleanEmail }
  );

  if (rpcError) {
    console.error('Error resolving caregiver email via RPC:', rpcError.message);
  }

  const guardianId = resolvedGuardianId as string | null;

  if (!guardianId) {
    console.warn(`No active guardian profile found matching email: ${cleanEmail}`);
    return null;
  }

  // Insert caregiver link with least-privilege defaults (ALL PERMISSIONS FALSE)
  const { data: newLink, error: linkError } = await supabase
    .from('guardian_patient_links')
    .upsert(
      {
        patient_id: patientId,
        guardian_id: guardianId,
        status: 'active',
        allow_vitals_view: false,
        allow_journey_view: false,
        allow_care_view: false,
        allow_reminders_view: false,
        allow_delivery_prep_view: false,
        allow_postpartum_view: false,
        allow_shared_tasks_view: false
      },
      { onConflict: 'guardian_id,patient_id' }
    )
    .select('*')
    .single();

  if (linkError) {
    console.error('Error creating guardian link:', linkError.message);
    return null;
  }

  // Fetch basic guardian profile name if now linked
  const { data: guardianProf } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', guardianId)
    .maybeSingle();

  await addSupportPerson(patientId, {
    name: guardianProf?.name || cleanEmail.split('@')[0],
    relationship: relationship as any,
    phone: ''
  });

  return {
    id: newLink.id,
    guardianId: newLink.guardian_id,
    patientId: newLink.patient_id,
    status: newLink.status as any,
    permissions: {
      allowVitalsView: newLink.allow_vitals_view ?? false,
      allowJourneyView: newLink.allow_journey_view ?? false,
      allowCareView: newLink.allow_care_view ?? false,
      allowRemindersView: newLink.allow_reminders_view ?? false,
      allowDeliveryPrepView: newLink.allow_delivery_prep_view ?? false,
      allowPostpartumView: newLink.allow_postpartum_view ?? false,
      allowSharedTasksView: newLink.allow_shared_tasks_view ?? false
    },
    guardianName: guardianProf?.name || cleanEmail.split('@')[0],
    guardianEmail: cleanEmail
  };
}

/**
 * Fetch linked patient data for a logged-in caregiver based on granted permissions
 */
export async function fetchGuardianLinkedPatientData(
  guardianId: string
): Promise<GuardianLinkedPatientData | null> {
  const { data: link, error: linkErr } = await supabase
    .from('guardian_patient_links')
    .select('*')
    .eq('guardian_id', guardianId)
    .eq('status', 'active')
    .maybeSingle();

  if (linkErr || !link) {
    return null;
  }

  const patientId = link.patient_id;

  const permissions: CaregiverPermissions = {
    allowVitalsView: link.allow_vitals_view ?? false,
    allowJourneyView: link.allow_journey_view ?? false,
    allowCareView: link.allow_care_view ?? false,
    allowRemindersView: link.allow_reminders_view ?? false,
    allowDeliveryPrepView: link.allow_delivery_prep_view ?? false,
    allowPostpartumView: link.allow_postpartum_view ?? false,
    allowSharedTasksView: link.allow_shared_tasks_view ?? false
  };

  const { data: pProfile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', patientId)
    .maybeSingle();

  const { data: patDetails } = await supabase
    .from('patient_profiles')
    .select('due_date')
    .eq('user_id', patientId)
    .maybeSingle();

  const patientName = pProfile?.name || 'Mother';
  const dueDate = patDetails?.due_date || '';

  let currentWeek = 24;
  if (dueDate) {
    const due = new Date(dueDate).getTime();
    const now = new Date().getTime();
    const weeksRemaining = Math.floor((due - now) / (1000 * 60 * 60 * 24 * 7));
    currentWeek = Math.max(1, Math.min(40, 40 - weeksRemaining));
  }

  let supplementsTaken: { taken: number; total: number } | undefined = undefined;
  if (permissions.allowCareView) {
    const today = new Date().toISOString().split('T')[0];
    const { data: suppData } = await supabase
      .from('daily_supplement_logs')
      .select('*')
      .eq('patient_id', patientId)
      .eq('log_date', today)
      .maybeSingle();

    if (suppData) {
      let count = 0;
      if (suppData.iron) count++;
      if (suppData.folic_acid) count++;
      if (suppData.calcium) count++;
      supplementsTaken = { taken: count, total: 3 };
    } else {
      supplementsTaken = { taken: 0, total: 3 };
    }
  }

  let sharedPrepItems: ChecklistItem[] | undefined = undefined;
  if (permissions.allowSharedTasksView || permissions.allowDeliveryPrepView) {
    const { data: items } = await supabase
      .from('delivery_prep_items')
      .select('*')
      .eq('patient_id', patientId);

    sharedPrepItems = (items || []).map((item) => ({
      id: item.item_id,
      label: item.label,
      category: item.category as any,
      completed: item.completed
    }));
  }

  return {
    patientId,
    patientName,
    currentWeek,
    dueDate,
    permissions,
    supplementsTaken,
    sharedPrepItems
  };
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

/* ====================================================================
   PHASE 5: COMMUNITY & EXPERT Q&A SERVICES
   ==================================================================== */

/**
 * Fetch all community posts
 */
export async function fetchCommunityPosts(): Promise<CommunityPost[]> {
  const { data, error } = await supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching community posts:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    authorName: row.author_name,
    category: row.category as CommunityPost['category'],
    title: row.title,
    content: row.content,
    createdAt: row.created_at
  }));
}

/**
 * Add a new community post
 */
export async function addCommunityPost(
  userId: string,
  authorName: string,
  category: CommunityPost['category'],
  title: string,
  content: string
): Promise<CommunityPost | null> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      user_id: userId,
      author_name: authorName,
      category,
      title,
      content
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error adding community post:', error.message);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    authorName: data.author_name,
    category: data.category as CommunityPost['category'],
    title: data.title,
    content: data.content,
    createdAt: data.created_at
  };
}

/**
 * Fetch expert Q&A questions submitted by a patient
 */
export async function fetchPatientExpertQuestions(patientId: string): Promise<ExpertQuestion[]> {
  const { data, error } = await supabase
    .from('expert_questions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching expert questions:', error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    patientId: row.patient_id,
    topic: row.topic,
    question: row.question,
    status: row.status as 'pending' | 'answered',
    answer: row.answer || undefined,
    createdAt: row.created_at
  }));
}

/**
 * Add a new question to Expert Q&A
 */
export async function addExpertQuestion(
  patientId: string,
  topic: string,
  questionText: string
): Promise<ExpertQuestion | null> {
  const { data, error } = await supabase
    .from('expert_questions')
    .insert({
      patient_id: patientId,
      topic,
      question: questionText,
      status: 'pending'
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error inserting expert question:', error.message);
    return null;
  }

  return {
    id: data.id,
    patientId: data.patient_id,
    topic: data.topic,
    question: data.question,
    status: data.status as 'pending' | 'answered',
    answer: data.answer || undefined,
    createdAt: data.created_at
  };
}




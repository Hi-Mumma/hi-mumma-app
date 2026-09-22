import { supabase } from './supabaseClient';
import {
  UserProfile,
  PatientProfile,
  GuardianProfile,
  SupportPerson
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

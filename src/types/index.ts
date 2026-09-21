export type NavigationTab = 'home' | 'journey' | 'track' | 'learn' | 'more' | 'records' | 'login' | 'guardian-dashboard';

export type UserRole = 'patient' | 'guardian';

export type AuthStage =
  | 'splash'
  | 'role-select'
  | 'login'
  | 'patient-onboarding'
  | 'guardian-onboarding';

export interface SupportPerson {
  id: string;
  name: string;
  relationship: 'partner' | 'mother' | 'guardian' | 'friend' | 'other';
  phone?: string;
}

export interface PatientProfile {
  name: string;
  dueDate: string;
  isFirstPregnancy: boolean;
  location: string;
  supportPeople: SupportPerson[];
}

export interface GuardianProfile {
  name: string;
  relationship: string;
  connectedPatientName: string;
  phone?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  provider: 'google' | 'email';
  dueDate?: string;
  isOnboarded: boolean;
  patientProfile?: PatientProfile;
  guardianProfile?: GuardianProfile;
}

export type Trimester = 1 | 2 | 3;

export type PregnancyPhase = 'pregnancy' | 'postpartum';

export type RecordFolderType = 'first_trimester' | 'second_trimester' | 'third_trimester' | 'postpartum';

export interface MedicalRecordItem {
  id: string;
  name: string;
  folder: RecordFolderType;
  date: string;
  fileType: 'pdf' | 'camera' | 'gallery';
  fileSize: string;
  previewUrl?: string;
}

export interface DailySupplements {
  iron: boolean;
  folicAcid: boolean;
  calcium: boolean;
}

export type WeekdayShort = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export interface BPLogEntry {
  id: string;
  systolic: number;
  diastolic: number;
  date: string;
  time: string;
  dayOfWeek: WeekdayShort;
  note?: string;
  createdAt: number;
}

export type BloodSugarType = 'fasting' | 'post_meal_1h' | 'post_meal_2h' | 'random';

export interface BloodSugarEntry {
  id: string;
  value: number; // in mg/dL
  type: BloodSugarType;
  date: string;
  time: string;
  note?: string;
  createdAt: number;
}

export interface FetalMovementEntry {
  id: string;
  timestamp: string;
  timeLabel: string;
  count: number;
  durationMinutes: number;
  notes?: string;
}

export interface PrenatalVisit {
  id: string;
  weekDue: number;
  title: string;
  description: string;
  completed: boolean;
  scheduledDate?: string;
  doctorQuestions: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  category: 'mum' | 'partner' | 'baby' | 'documents';
}

export interface UltrasoundStageInfo {
  stageNumber: string;
  title: string;
  timingWindow: string;
  clinicalPurpose: string;
  whatToExpect: string;
  disclaimer: string;
}

export type MedicalTrackingStatus = 'not_recorded' | 'recorded';

export interface PregnancyTestTrackingEntry {
  id: string;
  name: string;
  status: MedicalTrackingStatus;
}

export interface UltrasoundMilestoneTrackingEntry {
  id: string;
  title: string;
  timing: string;
  description?: string;
  status: MedicalTrackingStatus;
}

export interface GovernmentSchemeInfo {
  id: string;
  schemeName: string;
  authority: string;
  objective: string;
  keyBenefits: string[];
  documentationChecklist: string[];
}

export interface DevelopmentalSubStage {
  week: number;
  label: string;
  milestoneTitle: string;
  fetalAnatomyFocus: string;
  approxDimensions: string;
}

export interface TrimesterVisualExperience {
  id: RecordFolderType;
  trimesterNumber: 1 | 2 | 3;
  weekRangeText: string;
  title: string;
  colorPalette: {
    primaryGlow: string;
    secondaryGlow: string;
    canvasAmbient: string;
    particleTint: string;
  };
  subStages: DevelopmentalSubStage[];
  mediaAsset: {
    videoUrl?: string;
    posterPlaceholder: string;
    description: string;
  };
}

export interface FetalDevelopmentWeek {
  week: number;
  trimester: Trimester;
  fruitMetaphor: string;
  fruitIllustrationUrl: string;
  approxLengthCm: number;
  approxWeightGrams: number;
  developmentalMilestone: string;
  maternalBodyChanges: string;
}

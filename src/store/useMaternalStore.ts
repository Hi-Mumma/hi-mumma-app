import { useState, useEffect } from 'react';
import {
  NavigationTab,
  PregnancyPhase,
  DailySupplements,
  BPLogEntry,
  BloodSugarEntry,
  WeekdayShort,
  FetalMovementEntry,
  MedicalRecordItem,
  RecordFolderType,
  PrenatalVisit,
  ChecklistItem,
  UserProfile,
  PregnancyTestTrackingEntry,
  UltrasoundMilestoneTrackingEntry
} from '../types';
import {
  initialMockRecords,
  initialVisits,
  initialHospitalBag,
  initialPregnancyTestTracking,
  initialUltrasoundMilestones,
  mockWeekData
} from '../mock/maternalData';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import {
  getFullUserProfile,
  fetchPregnancyTestRecords,
  upsertPregnancyTestRecord,
  fetchUltrasoundMilestonesRecords,
  upsertUltrasoundMilestoneRecord,
  fetchDailySupplementLog,
  upsertDailySupplementLog,
  fetchFetalMovementLogs,
  addFetalMovementLog,
  fetchMedicalRecords,
  addMedicalRecord
} from '../lib/supabaseServices';
import { calculateGestationalWeekFromDueDate } from '../utils/pregnancyStage';

export const useMaternalStore = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [currentWeek, setCurrentWeek] = useState<number>(24);
  const [phase, setPhase] = useState<PregnancyPhase>('pregnancy');
  const [postpartumDay, setPostpartumDay] = useState<number>(8);

  // Authenticated User State & Loading Indicator
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // Derive gestational week dynamically when user profile / due date changes
  useEffect(() => {
    const dueDateStr = currentUser?.dueDate || currentUser?.patientProfile?.dueDate;
    if (dueDateStr) {
      const derivedWeek = calculateGestationalWeekFromDueDate(dueDateStr);
      setCurrentWeek(derivedWeek);
    }
  }, [currentUser]);

  // Supabase Auth Session Listener & Initialization
  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      if (!isSupabaseConfigured) {
        if (mounted) setIsAuthLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          const profile = await getFullUserProfile(session.user.id, session.user.email);
          if (profile) {
            const dueDateStr = profile.dueDate || profile.patientProfile?.dueDate;
            if (dueDateStr) {
              const derivedWeek = calculateGestationalWeekFromDueDate(dueDateStr);
              setCurrentWeek(derivedWeek);
            }
            setCurrentUser(profile);
          } else {
            // Minimal profile fallback if profile record is still pending onboarding
            const role = (session.user.user_metadata?.role as 'patient' | 'guardian') || 'patient';
            setCurrentUser({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role,
              provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
              isOnboarded: false
            });
          }
        }
      } catch (err) {
        console.error('Session restoration error:', err);
      } finally {
        if (mounted) setIsAuthLoading(false);
      }
    }

    restoreSession();

    // Listen for auth state changes (Sign in, Sign out, Token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await getFullUserProfile(session.user.id, session.user.email);
        if (profile) {
          const dueDateStr = profile.dueDate || profile.patientProfile?.dueDate;
          if (dueDateStr) {
            const derivedWeek = calculateGestationalWeekFromDueDate(dueDateStr);
            setCurrentWeek(derivedWeek);
          }
          setCurrentUser(profile);
        } else {
          const role = (session.user.user_metadata?.role as 'patient' | 'guardian') || 'patient';
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role,
            provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
            isOnboarded: false
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    }
    setCurrentUser(null);
  };

  // Daily Supplements (Phase 1 local, persisted to Supabase in Phase 3)
  const [supplements, setSupplements] = useState<DailySupplements>({
    iron: false,
    folicAcid: true,
    calcium: false
  });

  const toggleSupplement = (key: keyof DailySupplements) => {
    setSupplements((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (currentUser?.id && isSupabaseConfigured) {
        upsertDailySupplementLog(currentUser.id, next);
      }
      return next;
    });
  };

  const [pregnancyTestTracking, setPregnancyTestTracking] = useState<PregnancyTestTrackingEntry[]>(
    initialPregnancyTestTracking
  );
  const [ultrasoundMilestones, setUltrasoundMilestones] = useState<UltrasoundMilestoneTrackingEntry[]>(
    initialUltrasoundMilestones
  );

  const togglePregnancyTest = (id: string) => {
    setPregnancyTestTracking((prev) => {
      const updated = prev.map((entry) => {
        if (entry.id === id) {
          const nextStatus = entry.status === 'recorded' ? 'not_recorded' : 'recorded';
          if (currentUser?.id && isSupabaseConfigured) {
            upsertPregnancyTestRecord(currentUser.id, entry.id, entry.name, nextStatus as any);
          }
          return { ...entry, status: nextStatus as any };
        }
        return entry;
      });
      return updated;
    });
  };

  const toggleUltrasoundMilestone = (id: string) => {
    setUltrasoundMilestones((prev) => {
      const updated = prev.map((entry) => {
        if (entry.id === id) {
          const nextStatus = entry.status === 'recorded' ? 'not_recorded' : 'recorded';
          if (currentUser?.id && isSupabaseConfigured) {
            upsertUltrasoundMilestoneRecord(
              currentUser.id,
              entry.id,
              entry.title,
              nextStatus as any,
              entry.timing,
              entry.description
            );
          }
          return { ...entry, status: nextStatus as any };
        }
        return entry;
      });
      return updated;
    });
  };

  // Blood Pressure Logs (Phase 1 local, migrated in Phase 2)
  const [bpEntries, setBpEntries] = useState<BPLogEntry[]>([
    {
      id: 'bp-1',
      systolic: 116,
      diastolic: 74,
      date: '2026-09-15',
      time: '09:15 AM',
      dayOfWeek: 'TUE',
      note: 'Seated calmly for 5 mins prior',
      createdAt: Date.now() - 3600 * 1000 * 48
    }
  ]);

  const [bpSuccessModal, setBpSuccessModal] = useState<boolean>(false);

  const addBPEntry = (newLog: Omit<BPLogEntry, 'id' | 'createdAt'>) => {
    const entry: BPLogEntry = {
      ...newLog,
      id: `bp-${Date.now()}`,
      createdAt: Date.now()
    };
    setBpEntries((prev) => [entry, ...prev]);
    setBpSuccessModal(true);
    setTimeout(() => setBpSuccessModal(false), 2400);
  };

  // Blood Sugar Logs (Phase 1 local, migrated in Phase 2)
  const [bloodSugarEntries, setBloodSugarEntries] = useState<BloodSugarEntry[]>([
    {
      id: 'bs-1',
      value: 86,
      type: 'fasting',
      date: '2026-09-18',
      time: '07:30 AM',
      note: 'Fasting reading before breakfast',
      createdAt: Date.now() - 3600 * 1000 * 24
    },
    {
      id: 'bs-2',
      value: 112,
      type: 'post_meal_2h',
      date: '2026-09-17',
      time: '01:45 PM',
      note: '2 hours post nutritious lunch',
      createdAt: Date.now() - 3600 * 1000 * 48
    }
  ]);

  const addBloodSugarEntry = (newLog: Omit<BloodSugarEntry, 'id' | 'createdAt'>) => {
    const entry: BloodSugarEntry = {
      ...newLog,
      id: `bs-${Date.now()}`,
      createdAt: Date.now()
    };
    setBloodSugarEntries((prev) => [entry, ...prev]);
  };

  // Fetal Movements Log (Phase 1 local, persisted to Supabase in Phase 3)
  const [movementEntries, setMovementEntries] = useState<FetalMovementEntry[]>([
    {
      id: 'mv-1',
      timestamp: 'Today',
      timeLabel: '14:20',
      count: 10,
      durationMinutes: 19,
      notes: 'Active rolls after afternoon snack'
    },
    {
      id: 'mv-2',
      timestamp: 'Yesterday',
      timeLabel: '20:05',
      count: 10,
      durationMinutes: 24,
      notes: 'Evening relaxed observation'
    }
  ]);

  const addMovementEntry = (count: number, durationMinutes: number) => {
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestampStr = 'Today';
    const newEntry: FetalMovementEntry = {
      id: `mv-${Date.now()}`,
      timestamp: timestampStr,
      timeLabel,
      count,
      durationMinutes
    };
    setMovementEntries((prev) => [newEntry, ...prev]);

    if (currentUser?.id && isSupabaseConfigured) {
      addFetalMovementLog(currentUser.id, count, durationMinutes, timeLabel, timestampStr).then((saved) => {
        if (saved) {
          setMovementEntries((prev) => prev.map((item) => (item.id === newEntry.id ? saved : item)));
        }
      });
    }
  };

  // Digital Records Vault (Phase 1 local, persisted to Supabase in Phase 3)
  const [records, setRecords] = useState<MedicalRecordItem[]>(initialMockRecords);
  const [selectedRecordFolder, setSelectedRecordFolder] = useState<RecordFolderType>('second_trimester');

  const uploadMockRecord = (
    name: string,
    fileType: 'pdf' | 'camera' | 'gallery',
    folder: RecordFolderType
  ) => {
    const fileSize = fileType === 'pdf' ? '1.4 MB' : '2.8 MB';
    const newRecord: MedicalRecordItem = {
      id: `rec-${Date.now()}`,
      name,
      folder,
      date: 'Just now',
      fileType,
      fileSize
    };
    setRecords((prev) => [newRecord, ...prev]);

    if (currentUser?.id && isSupabaseConfigured) {
      addMedicalRecord(currentUser.id, name, folder, fileType, fileSize).then((saved) => {
        if (saved) {
          setRecords((prev) => prev.map((item) => (item.id === newRecord.id ? saved : item)));
        }
      });
    }
  };

  // Fetch & Sync Phase 3 Care Data from Supabase when user logs in
  useEffect(() => {
    let active = true;

    async function syncCareData(userId: string) {
      if (!isSupabaseConfigured) return;

      try {
        const [dbTests, dbUltrasounds, dbSupplements, dbMovements, dbRecords] = await Promise.all([
          fetchPregnancyTestRecords(userId),
          fetchUltrasoundMilestonesRecords(userId),
          fetchDailySupplementLog(userId),
          fetchFetalMovementLogs(userId),
          fetchMedicalRecords(userId)
        ]);

        if (!active) return;

        if (dbTests.length > 0) {
          setPregnancyTestTracking((prev) =>
            prev.map((item) => {
              const match = dbTests.find((t) => t.id === item.id);
              return match ? { ...item, status: match.status } : item;
            })
          );
        }

        if (dbUltrasounds.length > 0) {
          setUltrasoundMilestones((prev) =>
            prev.map((item) => {
              const match = dbUltrasounds.find((u) => u.id === item.id);
              return match ? { ...item, status: match.status } : item;
            })
          );
        }

        if (dbSupplements) {
          setSupplements(dbSupplements);
        }

        if (dbMovements.length > 0) {
          setMovementEntries(dbMovements);
        }

        if (dbRecords.length > 0) {
          setRecords(dbRecords);
        }
      } catch (err) {
        console.error('Error syncing Phase 3 Care data from Supabase:', err);
      }
    }

    if (currentUser?.id) {
      syncCareData(currentUser.id);
    }

    return () => {
      active = false;
    };
  }, [currentUser?.id]);


  // Clinical Visits & OB-GYN Questions (Phase 1 local, migrated in Phase 2)
  const [visits, setVisits] = useState<PrenatalVisit[]>(initialVisits);

  const addOBQuestion = (visitId: string, questionText: string) => {
    if (!questionText.trim()) return;
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? { ...v, doctorQuestions: [...v.doctorQuestions, questionText.trim()] }
          : v
      )
    );
  };

  // Hospital Packing List (Phase 1 local, migrated in Phase 2)
  const [bagItems, setBagItems] = useState<ChecklistItem[]>(initialHospitalBag);

  const toggleBagItem = (id: string) => {
    setBagItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Week info helper
  const weekInfo = mockWeekData[currentWeek] || mockWeekData[24];

  // Weekly BP count calculations
  const daysLogged = Array.from(new Set(bpEntries.map((e) => e.dayOfWeek))) as WeekdayShort[];
  const weeklyBPCount = Math.min(2, daysLogged.length);

  return {
    currentTab,
    setCurrentTab,
    currentWeek,
    setCurrentWeek,
    phase,
    setPhase,
    postpartumDay,
    setPostpartumDay,
    weekInfo,
    supplements,
    toggleSupplement,
    pregnancyTestTracking,
    togglePregnancyTest,
    ultrasoundMilestones,
    toggleUltrasoundMilestone,
    bpEntries,
    addBPEntry,
    bpSuccessModal,
    closeBpSuccessModal: () => setBpSuccessModal(false),
    daysLogged,
    weeklyBPCount,
    bloodSugarEntries,
    addBloodSugarEntry,
    movementEntries,
    addMovementEntry,
    records,
    selectedRecordFolder,
    setSelectedRecordFolder,
    uploadMockRecord,
    visits,
    addOBQuestion,
    bagItems,
    toggleBagItem,
    currentUser,
    setCurrentUser,
    logout,
    isAuthLoading
  };
};

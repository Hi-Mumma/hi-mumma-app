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
  UltrasoundMilestoneTrackingEntry,
  CommunityPost,
  ExpertQuestion,
  CaregiverPermissions,
  DatabaseGuardianPatientLink,
  GuardianLinkedPatientData
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
  addMedicalRecord,
  fetchDeliveryPrepItems,
  upsertDeliveryPrepItem,
  fetchPrenatalVisitQuestions,
  addPrenatalVisitQuestion,
  updatePatientPostpartumState,
  fetchCommunityPosts,
  addCommunityPost,
  fetchPatientExpertQuestions,
  addExpertQuestion,
  fetchPatientCaregiverLinks,
  updateCaregiverLinkPermissions,
  revokeCaregiverLink,
  createCaregiverLinkByEmail,
  fetchGuardianLinkedPatientData
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

  const handleSetPhase = (newPhase: PregnancyPhase) => {
    setPhase(newPhase);
    if (currentUser?.id && isSupabaseConfigured) {
      updatePatientPostpartumState(currentUser.id, newPhase, postpartumDay);
    }
  };

  const handleSetPostpartumDay = (newDay: number) => {
    setPostpartumDay(newDay);
    if (currentUser?.id && isSupabaseConfigured) {
      updatePatientPostpartumState(currentUser.id, phase, newDay);
    }
  };

  // Phase 5 Community Posts & Expert Questions State
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: 'cp-1',
      userId: 'demo-1',
      authorName: 'Ananya M.',
      category: 'Nutrition',
      title: 'Safe morning sickness smoothie recipes?',
      content: 'Looking for gentle, refreshing smoothie ideas for early morning nausea during the first trimester.',
      createdAt: '2 hours ago'
    },
    {
      id: 'cp-2',
      userId: 'demo-2',
      authorName: 'Priya K.',
      category: 'Postpartum Care',
      title: 'Essential rest tips for the first two weeks',
      content: 'Setting boundaries with visitors helped my recovery tremendously during the initial 14 days postpartum.',
      createdAt: '1 day ago'
    }
  ]);

  const [expertQuestions, setExpertQuestions] = useState<ExpertQuestion[]>([
    {
      id: 'eq-1',
      patientId: 'demo-patient',
      topic: 'Nutrition & Iron',
      question: 'Is it normal for iron tablets to cause mild constipation, and how can I adjust my diet safely?',
      status: 'answered',
      answer: 'Yes, oral iron supplements frequently cause mild GI changes. Pair your iron tablet with Vitamin C (such as citrus juices) and increase fiber and water intake.',
      createdAt: '3 days ago'
    }
  ]);

  const handleAddCommunityPost = (category: CommunityPost['category'], title: string, content: string) => {
    if (!title.trim() || !content.trim()) return;
    const authorName = currentUser?.name || 'Mumma Member';
    const newPost: CommunityPost = {
      id: `cp-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      authorName,
      category,
      title: title.trim(),
      content: content.trim(),
      createdAt: 'Just now'
    };
    setCommunityPosts((prev) => [newPost, ...prev]);

    if (currentUser?.id && isSupabaseConfigured) {
      addCommunityPost(currentUser.id, authorName, category, title.trim(), content.trim()).then((saved) => {
        if (saved) {
          setCommunityPosts((prev) => prev.map((p) => (p.id === newPost.id ? saved : p)));
        }
      });
    }
  };

  const handleAddExpertQuestion = (topic: string, questionText: string) => {
    if (!questionText.trim()) return;
    const newQuestion: ExpertQuestion = {
      id: `eq-${Date.now()}`,
      patientId: currentUser?.id || 'guest',
      topic: topic.trim() || 'General Care',
      question: questionText.trim(),
      status: 'pending',
      createdAt: 'Just now'
    };
    setExpertQuestions((prev) => [newQuestion, ...prev]);

    if (currentUser?.id && isSupabaseConfigured) {
      addExpertQuestion(currentUser.id, topic.trim() || 'General Care', questionText.trim()).then((saved) => {
        if (saved) {
          setExpertQuestions((prev) => prev.map((q) => (q.id === newQuestion.id ? saved : q)));
        }
      });
    }
  };

  // Phase 6 Caregiver & Guardian State
  const [caregiverLinks, setCaregiverLinks] = useState<DatabaseGuardianPatientLink[]>([]);
  const [guardianLinkedData, setGuardianLinkedData] = useState<GuardianLinkedPatientData | null>(null);

  const handleUpdateCaregiverPermissions = async (
    linkId: string,
    permissions: Partial<CaregiverPermissions>
  ) => {
    setCaregiverLinks((prev) =>
      prev.map((link) =>
        link.id === linkId
          ? { ...link, permissions: { ...link.permissions, ...permissions } }
          : link
      )
    );

    if (currentUser?.id && isSupabaseConfigured) {
      await updateCaregiverLinkPermissions(linkId, permissions);
    }
  };

  const handleRevokeCaregiverLink = async (linkId: string) => {
    setCaregiverLinks((prev) => prev.filter((link) => link.id !== linkId));

    if (currentUser?.id && isSupabaseConfigured) {
      await revokeCaregiverLink(linkId);
    }
  };

  const handleAddCaregiverByEmail = async (email: string, relationship: string) => {
    if (!email.trim() || !currentUser?.id) return;
    const newLink = await createCaregiverLinkByEmail(currentUser.id, email.trim(), relationship);
    if (newLink) {
      setCaregiverLinks((prev) => [newLink, ...prev]);
    } else {
      // Optimistic local representation if guardian profile is pending auth signup
      const localLink: DatabaseGuardianPatientLink = {
        id: `cgl-${Date.now()}`,
        guardianId: `pending-${Date.now()}`,
        patientId: currentUser.id,
        status: 'pending',
        guardianName: email.split('@')[0],
        guardianEmail: email.trim(),
        permissions: {
          allowVitalsView: true,
          allowJourneyView: true,
          allowCareView: true,
          allowRemindersView: true,
          allowDeliveryPrepView: true,
          allowPostpartumView: true,
          allowSharedTasksView: true
        }
      };
      setCaregiverLinks((prev) => [localLink, ...prev]);
    }
  };

  // Fetch & Sync Phase 3 Care, Phase 4 Reminders/Delivery, Phase 5 Community/Q&A & Phase 6 Caregiver Data from Supabase
  useEffect(() => {
    let active = true;

    async function syncCareData(userId: string, role: string) {
      if (!isSupabaseConfigured) return;

      try {
        if (role === 'guardian') {
          const gData = await fetchGuardianLinkedPatientData(userId);
          if (active && gData) {
            setGuardianLinkedData(gData);
          }
          return;
        }

        const [
          dbTests,
          dbUltrasounds,
          dbSupplements,
          dbMovements,
          dbRecords,
          dbPrepItems,
          dbVisitQuestions,
          dbCommunityPosts,
          dbExpertQuestions,
          dbCaregiverLinks
        ] = await Promise.all([
          fetchPregnancyTestRecords(userId),
          fetchUltrasoundMilestonesRecords(userId),
          fetchDailySupplementLog(userId),
          fetchFetalMovementLogs(userId),
          fetchMedicalRecords(userId),
          fetchDeliveryPrepItems(userId),
          fetchPrenatalVisitQuestions(userId),
          fetchCommunityPosts(),
          fetchPatientExpertQuestions(userId),
          fetchPatientCaregiverLinks(userId)
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

        if (dbPrepItems.length > 0) {
          setBagItems((prev) =>
            prev.map((item) => {
              const match = dbPrepItems.find((p) => p.id === item.id);
              return match ? { ...item, completed: match.completed } : item;
            })
          );
        }

        if (dbVisitQuestions.length > 0) {
          setVisits((prev) =>
            prev.map((visit) => {
              const questionsForVisit = dbVisitQuestions
                .filter((q) => q.visitId === visit.id)
                .map((q) => q.questionText);
              if (questionsForVisit.length > 0) {
                const combined = Array.from(new Set([...visit.doctorQuestions, ...questionsForVisit]));
                return { ...visit, doctorQuestions: combined };
              }
              return visit;
            })
          );
        }

        if (dbCommunityPosts.length > 0) {
          setCommunityPosts(dbCommunityPosts);
        }

        if (dbExpertQuestions.length > 0) {
          setExpertQuestions(dbExpertQuestions);
        }

        if (dbCaregiverLinks.length > 0) {
          setCaregiverLinks(dbCaregiverLinks);
        }
      } catch (err) {
        console.error('Error syncing Care & Delivery data from Supabase:', err);
      }
    }

    if (currentUser?.id) {
      syncCareData(currentUser.id, currentUser.role);
    }

    return () => {
      active = false;
    };
  }, [currentUser?.id, currentUser?.role]);

  // Clinical Visits & OB-GYN Questions (Phase 1 local, persisted in Phase 4)
  const [visits, setVisits] = useState<PrenatalVisit[]>(initialVisits);

  const addOBQuestion = (visitId: string, questionText: string) => {
    if (!questionText.trim()) return;
    const cleanText = questionText.trim();
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? { ...v, doctorQuestions: [...v.doctorQuestions, cleanText] }
          : v
      )
    );

    if (currentUser?.id && isSupabaseConfigured) {
      addPrenatalVisitQuestion(currentUser.id, visitId, cleanText);
    }
  };

  // Hospital Packing List / Delivery Prep Items (Phase 1 local, persisted in Phase 4)
  const [bagItems, setBagItems] = useState<ChecklistItem[]>(initialHospitalBag);

  const toggleBagItem = (id: string) => {
    setBagItems((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const nextCompleted = !item.completed;
          if (currentUser?.id && isSupabaseConfigured) {
            upsertDeliveryPrepItem(currentUser.id, item.id, item.label, item.category, nextCompleted);
          }
          return { ...item, completed: nextCompleted };
        }
        return item;
      });
      return updated;
    });
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
    setPhase: handleSetPhase,
    postpartumDay,
    setPostpartumDay: handleSetPostpartumDay,
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
    communityPosts,
    addCommunityPost: handleAddCommunityPost,
    expertQuestions,
    addExpertQuestion: handleAddExpertQuestion,
    caregiverLinks,
    updateCaregiverPermissions: handleUpdateCaregiverPermissions,
    revokeCaregiverLink: handleRevokeCaregiverLink,
    addCaregiverByEmail: handleAddCaregiverByEmail,
    guardianLinkedData,
    currentUser,
    setCurrentUser,
    logout,
    isAuthLoading
  };
};



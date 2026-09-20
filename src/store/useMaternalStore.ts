import { useState } from 'react';
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

export const useMaternalStore = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [currentWeek, setCurrentWeek] = useState<number>(24);
  const [phase, setPhase] = useState<PregnancyPhase>('pregnancy');
  const [postpartumDay, setPostpartumDay] = useState<number>(8);

  // Mock local auth state (initially null so user starts at Welcome / Login flow)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('hi_mumma_mock_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.role) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const logout = () => {
    try {
      localStorage.removeItem('hi_mumma_mock_user');
    } catch {
      // ignore
    }
    setCurrentUser(null);
  };

  // Daily Supplements
  const [supplements, setSupplements] = useState<DailySupplements>({
    iron: false,
    folicAcid: true,
    calcium: false
  });

  const toggleSupplement = (key: keyof DailySupplements) => {
    setSupplements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [pregnancyTestTracking, setPregnancyTestTracking] = useState<PregnancyTestTrackingEntry[]>(
    initialPregnancyTestTracking
  );
  const [ultrasoundMilestones, setUltrasoundMilestones] = useState<UltrasoundMilestoneTrackingEntry[]>(
    initialUltrasoundMilestones
  );

  const togglePregnancyTest = (id: string) => {
    setPregnancyTestTracking((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, status: entry.status === 'recorded' ? 'not_recorded' : 'recorded' }
          : entry
      )
    );
  };

  const toggleUltrasoundMilestone = (id: string) => {
    setUltrasoundMilestones((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, status: entry.status === 'recorded' ? 'not_recorded' : 'recorded' }
          : entry
      )
    );
  };

  // Blood Pressure Logs (Twice weekly tracking)
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

  // Blood Sugar Logs (Record-keeping only, no diagnosis)
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

  // Fetal Movements Log
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
    const newEntry: FetalMovementEntry = {
      id: `mv-${Date.now()}`,
      timestamp: 'Today',
      timeLabel: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      count,
      durationMinutes
    };
    setMovementEntries((prev) => [newEntry, ...prev]);
  };

  // Digital Records Vault
  const [records, setRecords] = useState<MedicalRecordItem[]>(initialMockRecords);
  const [selectedRecordFolder, setSelectedRecordFolder] = useState<RecordFolderType>('second_trimester');

  const uploadMockRecord = (
    name: string,
    fileType: 'pdf' | 'camera' | 'gallery',
    folder: RecordFolderType
  ) => {
    const newRecord: MedicalRecordItem = {
      id: `rec-${Date.now()}`,
      name,
      folder,
      date: 'Just now',
      fileType,
      fileSize: fileType === 'pdf' ? '1.4 MB' : '2.8 MB'
    };
    setRecords((prev) => [newRecord, ...prev]);
  };

  // Clinical Visits & OB-GYN Questions
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

  // Hospital Packing List
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
    logout
  };
};

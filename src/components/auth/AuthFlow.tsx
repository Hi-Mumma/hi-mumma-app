import React, { useState } from 'react';
import {
  Heart,
  Shield,
  ArrowRight,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Phone,
  Plus,
  Trash2,
  Baby
} from 'lucide-react';
import {
  UserProfile,
  UserRole,
  AuthStage,
  SupportPerson
} from '../../types';
import { BrandLogo } from '../common/BrandLogo';

interface AuthFlowProps {
  onAuthComplete: (user: UserProfile) => void;
  initialRole?: UserRole;
  initialStage?: AuthStage;
}

export const AuthFlow: React.FC<AuthFlowProps> = ({
  onAuthComplete,
  initialRole = 'patient',
  initialStage = 'splash'
}) => {
  // Current stage in authentication pipeline
  const [stage, setStage] = useState<AuthStage>(initialStage);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Login form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Patient Onboarding state
  const [patientName, setPatientName] = useState('Priya Sharma');
  const [dueDate, setDueDate] = useState('2026-12-14');
  const [isFirstPregnancy, setIsFirstPregnancy] = useState(true);
  const [location, setLocation] = useState('Mumbai, Maharashtra');
  const [supportPeople, setSupportPeople] = useState<SupportPerson[]>([
    {
      id: 'sp-1',
      name: 'Rohan Sharma',
      relationship: 'partner',
      phone: '+91 98765 43210'
    }
  ]);
  const [newSupportName, setNewSupportName] = useState('');
  const [newSupportRelation, setNewSupportRelation] = useState<'partner' | 'mother' | 'guardian' | 'friend'>('mother');

  // Guardian Onboarding state
  const [guardianName, setGuardianName] = useState('Rohan Sharma');
  const [guardianRelationship, setGuardianRelationship] = useState('Partner / Husband');
  const [connectedPatientName, setConnectedPatientName] = useState('Priya Sharma');
  const [guardianPhone, setGuardianPhone] = useState('+91 98765 43210');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // ── QUICK DEMO HANDLERS ──
  const handleQuickDemoPatient = () => {
    setIsLoading(true);
    showToast('Entering as Priya Sharma (Mother)...');
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: 'demo-patient-1',
        name: 'Priya Sharma',
        email: 'priya.sharma@maternal.care',
        role: 'patient',
        avatarUrl: '/mother-hero.jpg',
        provider: 'email',
        dueDate: 'Dec 14, 2026',
        isOnboarded: true,
        patientProfile: {
          name: 'Priya Sharma',
          dueDate: 'Dec 14, 2026',
          isFirstPregnancy: true,
          location: 'Mumbai, Maharashtra',
          supportPeople: [
            { id: 'sp-1', name: 'Rohan Sharma', relationship: 'partner', phone: '+91 98765 43210' }
          ]
        }
      };
      try {
        localStorage.setItem('hi_mumma_mock_user', JSON.stringify(user));
      } catch (e) {
        console.warn(e);
      }
      onAuthComplete(user);
    }, 600);
  };

  const handleQuickDemoGuardian = () => {
    setIsLoading(true);
    showToast('Entering as Rohan Sharma (Guardian)...');
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: 'demo-guardian-1',
        name: 'Rohan Sharma',
        email: 'rohan.sharma@maternal.care',
        role: 'guardian',
        avatarUrl: '/mother-hero.jpg',
        provider: 'email',
        isOnboarded: true,
        guardianProfile: {
          name: 'Rohan Sharma',
          relationship: 'Partner / Husband',
          connectedPatientName: 'Priya Sharma',
          phone: '+91 98765 43210'
        }
      };
      try {
        localStorage.setItem('hi_mumma_mock_user', JSON.stringify(user));
      } catch (e) {
        console.warn(e);
      }
      onAuthComplete(user);
    }, 600);
  };

  // ── AUTOFILL DEMO CREDENTIALS ──
  const handleFillDemoCreds = () => {
    if (selectedRole === 'patient') {
      setEmailOrPhone('priya.sharma@maternal.care');
      setPassword('mumma2026');
      setPatientName('Priya Sharma');
    } else {
      setEmailOrPhone('rohan.sharma@maternal.care');
      setPassword('guardian2026');
      setGuardianName('Rohan Sharma');
    }
    setErrorMessage('');
  };

  // ── SUBMIT LOGIN ──
  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email address or phone number.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // If user creates account or chooses sign up, go to onboarding!
      if (isSignUp) {
        if (selectedRole === 'patient') {
          setStage('patient-onboarding');
        } else {
          setStage('guardian-onboarding');
        }
        return;
      }

      // If logging in as existing user:
      const nameDerived =
        selectedRole === 'patient'
          ? (emailOrPhone.includes('priya') ? 'Priya Sharma' : emailOrPhone.split('@')[0])
          : (emailOrPhone.includes('rohan') ? 'Rohan Sharma' : emailOrPhone.split('@')[0]);

      const user: UserProfile = {
        id: `${selectedRole}-${Date.now()}`,
        name: nameDerived,
        email: emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@maternal.care`,
        role: selectedRole,
        avatarUrl: '/mother-hero.jpg',
        provider: 'email',
        dueDate: 'Dec 14, 2026',
        isOnboarded: true,
        patientProfile:
          selectedRole === 'patient'
            ? {
                name: nameDerived,
                dueDate: 'Dec 14, 2026',
                isFirstPregnancy: true,
                location: 'Mumbai, Maharashtra',
                supportPeople: [
                  { id: 'sp-1', name: 'Rohan Sharma', relationship: 'partner', phone: '+91 98765 43210' }
                ]
              }
            : undefined,
        guardianProfile:
          selectedRole === 'guardian'
            ? {
                name: nameDerived,
                relationship: 'Partner',
                connectedPatientName: 'Priya Sharma',
                phone: '+91 98765 43210'
              }
            : undefined
      };

      try {
        localStorage.setItem('hi_mumma_mock_user', JSON.stringify(user));
      } catch (err) {
        console.warn('LocalStorage error', err);
      }

      showToast(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        onAuthComplete(user);
      }, 500);
    }, 700);
  };

  // ── GOOGLE LOGIN SIMULATION ──
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (isSignUp) {
        if (selectedRole === 'patient') {
          setStage('patient-onboarding');
        } else {
          setStage('guardian-onboarding');
        }
        return;
      }

      const user: UserProfile = {
        id: `google-${selectedRole}-${Date.now()}`,
        name: selectedRole === 'patient' ? 'Priya Sharma' : 'Rohan Sharma',
        email: selectedRole === 'patient' ? 'priya.sharma@gmail.com' : 'rohan.sharma@gmail.com',
        role: selectedRole,
        avatarUrl: '/mother-hero.jpg',
        provider: 'google',
        dueDate: 'Dec 14, 2026',
        isOnboarded: true,
        patientProfile:
          selectedRole === 'patient'
            ? {
                name: 'Priya Sharma',
                dueDate: 'Dec 14, 2026',
                isFirstPregnancy: true,
                location: 'Mumbai, Maharashtra',
                supportPeople: [
                  { id: 'sp-1', name: 'Rohan Sharma', relationship: 'partner' }
                ]
              }
            : undefined,
        guardianProfile:
          selectedRole === 'guardian'
            ? {
                name: 'Rohan Sharma',
                relationship: 'Partner',
                connectedPatientName: 'Priya Sharma'
              }
            : undefined
      };

      try {
        localStorage.setItem('hi_mumma_mock_user', JSON.stringify(user));
      } catch (err) {
        console.warn('LocalStorage error', err);
      }

      showToast(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        onAuthComplete(user);
      }, 500);
    }, 600);
  };

  // ── FINISH PATIENT ONBOARDING ──
  const handleFinishPatientOnboarding = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: `patient-${Date.now()}`,
        name: patientName.trim() || 'Priya Sharma',
        email: emailOrPhone.trim() || 'priya.sharma@maternal.care',
        role: 'patient',
        avatarUrl: '/mother-hero.jpg',
        provider: 'email',
        dueDate: dueDate,
        isOnboarded: true,
        patientProfile: {
          name: patientName.trim() || 'Priya Sharma',
          dueDate: dueDate,
          isFirstPregnancy: isFirstPregnancy,
          location: location.trim() || 'Mumbai',
          supportPeople: supportPeople
        }
      };

      try {
        localStorage.setItem('hi_mumma_mock_user', JSON.stringify(user));
      } catch (err) {
        console.warn(err);
      }

      showToast('Profile setup complete! Welcome to Sanctuary 💗');
      setTimeout(() => {
        onAuthComplete(user);
      }, 600);
    }, 600);
  };

  // ── FINISH GUARDIAN ONBOARDING ──
  const handleFinishGuardianOnboarding = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: UserProfile = {
        id: `guardian-${Date.now()}`,
        name: guardianName.trim() || 'Rohan Sharma',
        email: emailOrPhone.trim() || 'rohan.sharma@maternal.care',
        role: 'guardian',
        avatarUrl: '/mother-hero.jpg',
        provider: 'email',
        isOnboarded: true,
        guardianProfile: {
          name: guardianName.trim() || 'Rohan Sharma',
          relationship: guardianRelationship,
          connectedPatientName: connectedPatientName.trim() || 'Priya Sharma',
          phone: guardianPhone
        }
      };

      try {
        localStorage.setItem('hi_mumma_mock_user', JSON.stringify(user));
      } catch (err) {
        console.warn(err);
      }

      showToast("You're all set to support Mumma! 💙");
      setTimeout(() => {
        onAuthComplete(user);
      }, 600);
    }, 600);
  };

  // Add support person helper
  const handleAddSupportPerson = () => {
    if (!newSupportName.trim()) return;
    const newPerson: SupportPerson = {
      id: `sp-${Date.now()}`,
      name: newSupportName.trim(),
      relationship: newSupportRelation
    };
    setSupportPeople([...supportPeople, newPerson]);
    setNewSupportName('');
  };

  const handleRemoveSupportPerson = (id: string) => {
    setSupportPeople(supportPeople.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-slide-up">
      {/* ═══════════════════════════════════════════════════════════════
          STAGE 1: SPLASH / WELCOME SCREEN
         ═══════════════════════════════════════════════════════════════ */}
      {stage === 'splash' && (
        <div className="space-y-4">
          {/* Maternal Visual Hero Card */}
          <section className="relative rounded-[36px] p-6 bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] border border-[#E2ECF7] shadow-[0_16px_40px_rgba(234,129,170,0.14)] overflow-hidden text-center">
            {/* Volumetric ambient background glows */}
            <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full bg-[#FCE7F3] blur-3xl opacity-80 pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#E0F2FE] blur-3xl opacity-85 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center space-y-4">
              {/* Brand Emblem */}
              <div className="pt-1">
                <BrandLogo size="md" />
              </div>

              {/* Maternal Hero Visual Frame with scale & blur reveal */}
              <div className="relative my-2">
                <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-[32px] overflow-hidden border-4 border-white shadow-[0_16px_36px_rgba(234,129,170,0.28)] bg-gradient-to-tr from-[#FDF2F7] to-[#E0F2FE] animate-hero-reveal">
                  <img
                    src="/mother-hero.jpg"
                    alt="HI MUMMA Maternal Hero"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 pointer-events-none" />
                </div>

                {/* Floating Soft Emblem */}
                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#FBCFE8] shadow-xs flex items-center gap-1.5 animate-bounce">
                  <Heart className="w-3.5 h-3.5 text-[#EA81AA] fill-[#EA81AA]" />
                  <span className="text-[11px] font-black text-[#192231] tracking-wide">
                    Mumma Sanctuary
                  </span>
                </div>
              </div>

              {/* Welcome Headlines */}
              <div className="space-y-1.5 max-w-xs">
                <span className="px-3 py-0.5 rounded-full bg-white border border-[#FBCFE8] text-[10px] font-black uppercase tracking-wider text-[#EA81AA] inline-block shadow-2xs">
                  Your Sacred Pregnancy Companion
                </span>
                <h1 className="text-2xl font-black text-[#192231] tracking-tight">
                  Welcome to HI MUMMA
                </h1>
                <p className="text-xs text-[#5A677D] leading-relaxed">
                  Personalized 3D fetal evaluation, gentle vitals tracking & private medical records for you and your baby.
                </p>
              </div>

              {/* Three Pill Highlights */}
              <div className="grid grid-cols-3 gap-2 w-full pt-1">
                <div className="p-2 rounded-2xl bg-white/90 border border-[#FBCFE8] shadow-2xs text-center">
                  <p className="text-[11px] font-black text-[#EA81AA]">3D Fetal</p>
                  <p className="text-[9px] text-[#7A8B9E]">Weekly Growth</p>
                </div>
                <div className="p-2 rounded-2xl bg-white/90 border border-[#BAE6FD] shadow-2xs text-center">
                  <p className="text-[11px] font-black text-[#0284C7]">Gentle BP</p>
                  <p className="text-[9px] text-[#7A8B9E]">Vitals Tracker</p>
                </div>
                <div className="p-2 rounded-2xl bg-white/90 border border-[#FED7AA] shadow-2xs text-center">
                  <p className="text-[11px] font-black text-[#D97706]">Clinical Vault</p>
                  <p className="text-[9px] text-[#7A8B9E]">Encrypted Scans</p>
                </div>
              </div>

              {/* Main CTAs */}
              <div className="w-full space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setStage('role-select')}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#192231] via-[#2D3748] to-[#192231] hover:from-[#232F42] hover:to-[#374459] text-white font-black text-sm shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Get Started 💗</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('patient');
                    setStage('login');
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white border border-[#E2ECF7] hover:bg-[#F8FAFD] text-xs font-bold text-[#5A677D] hover:text-[#192231] transition-all cursor-pointer"
                >
                  I already have an account → Sign In
                </button>
              </div>
            </div>
          </section>

          {/* Quick Instant Demo Access Box */}
          <section className="p-4 rounded-3xl bg-white border border-[#E2ECF7] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#EA81AA]" />
                <span className="text-xs font-black text-[#192231]">
                  Instant Preview Test Mode
                </span>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]">
                1-Click Ready
              </span>
            </div>
            <p className="text-[11px] text-[#7A8B9E]">
              Explore either role directly or walk through the multi-step onboarding flow:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoPatient}
                className="p-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FBCFE8] hover:bg-[#FCE7F3] text-left transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-[#EA81AA]">
                  <Heart className="w-3.5 h-3.5 fill-[#EA81AA]" />
                  <span>Demo as Mumma</span>
                </div>
                <p className="text-[10px] text-[#5A677D] mt-0.5">
                  Patient Dashboard (Priya)
                </p>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoGuardian}
                className="p-2.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-left transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-[#2563EB]">
                  <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Demo as Guardian</span>
                </div>
                <p className="text-[10px] text-[#5A677D] mt-0.5">
                  Guardian Dashboard (Rohan)
                </p>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 2: SELECT USER TYPE (PATIENT vs GUARDIAN)
         ═══════════════════════════════════════════════════════════════ */}
      {stage === 'role-select' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStage('splash')}
              className="p-2 rounded-2xl bg-white border border-[#E2ECF7] text-[#64748B] hover:text-[#192231] shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-lg font-black text-[#192231]">
                Select Your Role
              </h2>
              <p className="text-[11px] text-[#7A8B9E]">
                How will you be using HI MUMMA?
              </p>
            </div>
          </div>

          {/* TWO PREMIUM ROLE CARDS */}
          <div className="space-y-3">
            {/* 1. PATIENT CARD */}
            <div
              onClick={() => setSelectedRole('patient')}
              className={`relative p-5 rounded-[28px] border-2 transition-all cursor-pointer group ${
                selectedRole === 'patient'
                  ? 'bg-gradient-to-br from-[#FFF5F8] to-white border-[#F472B6] shadow-[0_12px_28px_rgba(234,129,170,0.22)] scale-[1.01]'
                  : 'bg-white border-[#E2ECF7] hover:border-[#FBCFE8] hover:bg-[#FAFBFD]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      selectedRole === 'patient'
                        ? 'bg-[#EA81AA] text-white shadow-md'
                        : 'bg-[#FDF2F7] text-[#EA81AA]'
                    }`}
                  >
                    <Heart className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#EA81AA]">
                      Primary Sanctuary
                    </span>
                    <h3 className="text-base font-black text-[#192231]">
                      Mother / Patient
                    </h3>
                    <p className="text-xs font-semibold text-[#5A677D]">
                      Track your pregnancy journey
                    </p>
                  </div>
                </div>

                {/* Active check pill */}
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    selectedRole === 'patient'
                      ? 'bg-[#EA81AA] border-[#EA81AA] text-white'
                      : 'border-[#CBD5E1] bg-white'
                  }`}
                >
                  {selectedRole === 'patient' && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#FCE7F3]/80 grid grid-cols-3 gap-1.5 text-center">
                <div className="p-1.5 rounded-xl bg-white/80 text-[10px] font-bold text-[#5A677D]">
                  3D Fetal View
                </div>
                <div className="p-1.5 rounded-xl bg-white/80 text-[10px] font-bold text-[#5A677D]">
                  BP & Vitals Log
                </div>
                <div className="p-1.5 rounded-xl bg-white/80 text-[10px] font-bold text-[#5A677D]">
                  Clinical Vault
                </div>
              </div>
            </div>

            {/* 2. GUARDIAN CARD */}
            <div
              onClick={() => setSelectedRole('guardian')}
              className={`relative p-5 rounded-[28px] border-2 transition-all cursor-pointer group ${
                selectedRole === 'guardian'
                  ? 'bg-gradient-to-br from-[#EFF6FF] to-white border-[#60A5FA] shadow-[0_12px_28px_rgba(96,165,250,0.22)] scale-[1.01]'
                  : 'bg-white border-[#E2ECF7] hover:border-[#BFDBFE] hover:bg-[#FAFBFD]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                      selectedRole === 'guardian'
                        ? 'bg-[#2563EB] text-white shadow-md'
                        : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}
                  >
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">
                      Supportive Sanctuary
                    </span>
                    <h3 className="text-base font-black text-[#192231]">
                      Partner / Guardian
                    </h3>
                    <p className="text-xs font-semibold text-[#5A677D]">
                      Support and stay connected
                    </p>
                  </div>
                </div>

                {/* Active check pill */}
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    selectedRole === 'guardian'
                      ? 'bg-[#2563EB] border-[#2563EB] text-white'
                      : 'border-[#CBD5E1] bg-white'
                  }`}
                >
                  {selectedRole === 'guardian' && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#DBEAFE]/80 grid grid-cols-3 gap-1.5 text-center">
                <div className="p-1.5 rounded-xl bg-white/80 text-[10px] font-bold text-[#5A677D]">
                  Care Nudges
                </div>
                <div className="p-1.5 rounded-xl bg-white/80 text-[10px] font-bold text-[#5A677D]">
                  Daily Vitals Feed
                </div>
                <div className="p-1.5 rounded-xl bg-white/80 text-[10px] font-bold text-[#5A677D]">
                  Emergency Call
                </div>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={() => {
              // Pre-fill demo email placeholder based on chosen role
              if (selectedRole === 'patient') {
                setEmailOrPhone('priya.sharma@maternal.care');
              } else {
                setEmailOrPhone('rohan.sharma@maternal.care');
              }
              setStage('login');
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#192231] to-[#2D3748] hover:from-[#232F42] hover:to-[#374459] text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Continue as {selectedRole === 'patient' ? 'Mother' : 'Guardian'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 3: ROLE-SPECIFIC LOGIN / SIGN UP
         ═══════════════════════════════════════════════════════════════ */}
      {stage === 'login' && (
        <div className="space-y-4">
          {/* Header with back button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStage('role-select')}
              className="p-2 rounded-2xl bg-white border border-[#E2ECF7] text-[#64748B] hover:text-[#192231] shadow-2xs transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change Role</span>
            </button>
            <span
              className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                selectedRole === 'patient'
                  ? 'bg-[#FFF5F8] text-[#EA81AA] border-[#FBCFE8]'
                  : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
              }`}
            >
              {selectedRole === 'patient' ? 'Mother Mode' : 'Guardian Mode'}
            </span>
          </div>

          {/* Maternal Visual Greeting Card */}
          <section
            className={`relative rounded-[32px] p-5 border shadow-sm overflow-hidden ${
              selectedRole === 'patient'
                ? 'bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] border-[#FBCFE8]'
                : 'bg-gradient-to-br from-[#EFF6FF] via-white to-[#FDF2F7] border-[#BFDBFE]'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-xs shrink-0 bg-white">
                <img
                  src="/mother-hero.jpg"
                  alt="Maternal Hero"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-black tracking-wider uppercase text-[#EA81AA]">
                  {selectedRole === 'patient' ? 'Patient Login' : 'Guardian Login'}
                </span>
                <h2 className="text-xl font-black text-[#192231]">
                  {selectedRole === 'patient'
                    ? isSignUp
                      ? 'Begin Your Journey, Mumma'
                      : 'Welcome back, Mumma 💗'
                    : isSignUp
                      ? 'Join to Support Mumma'
                      : 'Welcome, Guardian 💙'}
                </h2>
                <p className="text-[11px] text-[#5A677D]">
                  {selectedRole === 'patient'
                    ? 'Access 3D fetal evaluation, health logs & medical records.'
                    : "Stay connected to Mumma's care and daily updates."}
                </p>
              </div>
            </div>
          </section>

          {/* Authentication Container */}
          <section className="p-5 rounded-[32px] bg-white border border-[#E2ECF7] shadow-xs space-y-4">
            {/* Toggle Sign In vs Create Account */}
            <div className="flex p-1 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF7]">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  !isSignUp
                    ? 'bg-[#192231] text-white shadow-xs'
                    : 'text-[#7A8B9E] hover:text-[#192231]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMessage('');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSignUp
                    ? 'bg-[#192231] text-white shadow-xs'
                    : 'text-[#7A8B9E] hover:text-[#192231]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error message */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[11px] font-bold text-[#DC2626] flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-2xl bg-white border border-[#E2ECF7] hover:border-[#CBD5E1] text-[#192231] font-bold text-xs shadow-2xs hover:shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Subtle Divider */}
            <div className="relative flex items-center justify-center my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EEF2F6]" />
              </div>
              <span className="relative px-3 bg-white text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                or with email / phone
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                  Email or Phone Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#94A3B8]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder={
                      selectedRole === 'patient'
                        ? 'priya.sharma@maternal.care'
                        : 'rohan.sharma@maternal.care'
                    }
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231] placeholder-[#94A3B8] focus:bg-white focus:border-[#EA81AA] focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent in demo mode.')}
                      className="text-[10px] font-bold text-[#EA81AA] hover:underline cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#94A3B8]">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231] placeholder-[#94A3B8] focus:bg-white focus:border-[#EA81AA] focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#94A3B8] hover:text-[#192231] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2 text-xs text-[#5A677D] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#CBD5E1] text-[#EA81AA] accent-[#EA81AA] cursor-pointer"
                  />
                  <span>Remember on this device</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#192231] to-[#2D3748] hover:from-[#232F42] hover:to-[#374459] text-white font-black text-xs shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span>
                      {isSignUp
                        ? `Continue to ${selectedRole === 'patient' ? 'Mother' : 'Guardian'} Setup`
                        : `Sign In as ${selectedRole === 'patient' ? 'Mumma' : 'Guardian'}`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Autofill */}
            <div className="pt-2 border-t border-[#F0F4FA] flex items-center justify-between">
              <span className="text-[10px] text-[#8F9EB3]">Testing? Quick autofill:</span>
              <button
                type="button"
                onClick={handleFillDemoCreds}
                className="px-2.5 py-1 rounded-lg bg-[#FDF2F7] border border-[#FBCFE8] text-[10px] font-bold text-[#EA81AA] hover:bg-[#FCE7F3] transition-colors cursor-pointer"
              >
                Fill {selectedRole === 'patient' ? 'Priya Sharma' : 'Rohan Sharma'}
              </button>
            </div>

            {/* Direct Onboarding Walkthrough Option */}
            <div className="text-center pt-1 border-t border-[#F8FAFD]">
              <button
                type="button"
                onClick={() => {
                  if (selectedRole === 'patient') {
                    setStage('patient-onboarding');
                  } else {
                    setStage('guardian-onboarding');
                  }
                }}
                className="text-[11px] font-bold text-[#6FAFED] hover:underline cursor-pointer"
              >
                Walk through New Profile Onboarding →
              </button>
            </div>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 4: PATIENT ONBOARDING / PROFILE SETUP
         ═══════════════════════════════════════════════════════════════ */}
      {stage === 'patient-onboarding' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStage('login')}
              className="p-2 rounded-2xl bg-white border border-[#E2ECF7] text-[#64748B] hover:text-[#192231] shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#EA81AA]">
                Step 1 of 2 • Patient Profile
              </span>
              <h2 className="text-lg font-black text-[#192231]">
                Let's get to know you 💗
              </h2>
            </div>
          </div>

          {/* Section 1: Maternal Details */}
          <section className="p-5 rounded-[32px] bg-white border border-[#E2ECF7] shadow-xs space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Mother's Full Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231] focus:bg-white focus:border-[#EA81AA] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#EA81AA]" />
                  <span>Estimated Due Date</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231] focus:bg-white focus:border-[#EA81AA] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#EA81AA]" />
                  <span>Location / City</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Mumbai"
                  className="w-full px-3 py-2 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231] focus:bg-white focus:border-[#EA81AA] focus:outline-none"
                />
              </div>
            </div>

            {/* First pregnancy toggle */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D] flex items-center gap-1">
                <Baby className="w-3 h-3 text-[#EA81AA]" />
                <span>Is this your first pregnancy?</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsFirstPregnancy(true)}
                  className={`py-2 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                    isFirstPregnancy
                      ? 'bg-[#FFF5F8] border-[#FBCFE8] text-[#EA81AA] shadow-2xs'
                      : 'bg-[#F8FAFD] border-[#E8EFF7] text-[#7A8B9E]'
                  }`}
                >
                  Yes, First Time Mumma 🌸
                </button>
                <button
                  type="button"
                  onClick={() => setIsFirstPregnancy(false)}
                  className={`py-2 px-3 rounded-2xl text-xs font-black transition-all cursor-pointer border ${
                    !isFirstPregnancy
                      ? 'bg-[#FFF5F8] border-[#FBCFE8] text-[#EA81AA] shadow-2xs'
                      : 'bg-[#F8FAFD] border-[#E8EFF7] text-[#7A8B9E]'
                  }`}
                >
                  No, Experienced Mumma ✨
                </button>
              </div>
            </div>
          </section>

          {/* Section 2: Add Your Support System */}
          <section className="p-5 rounded-[32px] bg-white border border-[#E2ECF7] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-[#192231] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#6FAFED]" />
                  Add Your Support System
                </h3>
                <p className="text-[10px] text-[#7A8B9E]">
                  Partner, mother, or guardian who can support and receive alerts.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#EA81AA] bg-[#FDF2F7] px-2 py-0.5 rounded-full border border-[#FBCFE8]">
                {supportPeople.length} Added
              </span>
            </div>

            {/* List of current support people */}
            <div className="space-y-2">
              {supportPeople.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF7]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#E2ECF7] flex items-center justify-center text-xs font-bold text-[#192231]">
                      {person.relationship === 'partner' ? '💍' : person.relationship === 'mother' ? '🤱' : '🛡️'}
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#192231]">{person.name}</p>
                      <p className="text-[10px] text-[#7A8B9E] capitalize">
                        {person.relationship} {person.phone ? `• ${person.phone}` : ''}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSupportPerson(person.id)}
                    className="p-1.5 rounded-xl text-[#94A3B8] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick add support person input */}
            <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#E2ECF7] space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Support person name (e.g. Mumma, Anita)"
                  value={newSupportName}
                  onChange={(e) => setNewSupportName(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#E2ECF7] text-xs font-semibold text-[#192231] focus:border-[#EA81AA] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddSupportPerson}
                  className="px-3 py-1.5 rounded-xl bg-[#192231] text-white text-xs font-bold hover:bg-[#2D3748] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {(['partner', 'mother', 'guardian', 'friend'] as const).map((rel) => (
                  <button
                    key={rel}
                    type="button"
                    onClick={() => setNewSupportRelation(rel)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize transition-all cursor-pointer ${
                      newSupportRelation === rel
                        ? 'bg-[#EA81AA] text-white'
                        : 'bg-white text-[#64748B] border border-[#E2ECF7]'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Finish Button */}
          <button
            type="button"
            onClick={handleFinishPatientOnboarding}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#192231] via-[#2D3748] to-[#192231] hover:from-[#232F42] hover:to-[#374459] text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <span>Preparing Sanctuary...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span>Enter Sanctuary 💗</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 5: GUARDIAN ONBOARDING / SETUP
         ═══════════════════════════════════════════════════════════════ */}
      {stage === 'guardian-onboarding' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStage('login')}
              className="p-2 rounded-2xl bg-white border border-[#E2ECF7] text-[#64748B] hover:text-[#192231] shadow-2xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">
                Guardian Onboarding
              </span>
              <h2 className="text-lg font-black text-[#192231]">
                You're here to support Mumma 💙
              </h2>
            </div>
          </div>

          <section className="p-5 rounded-[32px] bg-white border border-[#BFDBFE] shadow-xs space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Your Name (Guardian)
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Rohan Sharma"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231] focus:bg-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Relationship to Mumma
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Partner / Husband', 'Mother / Mother-in-law', 'Sister / Family', 'Trusted Friend'].map(
                  (rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setGuardianRelationship(rel)}
                      className={`p-2 rounded-2xl text-xs font-black transition-all cursor-pointer border text-center ${
                        guardianRelationship === rel
                          ? 'bg-[#EFF6FF] border-[#60A5FA] text-[#2563EB] shadow-2xs'
                          : 'bg-[#F8FAFD] border-[#E8EFF7] text-[#7A8B9E]'
                      }`}
                    >
                      {rel}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Connected Patient (Mumma's Name)
              </label>
              <input
                type="text"
                value={connectedPatientName}
                onChange={(e) => setConnectedPatientName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231] focus:bg-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D] flex items-center gap-1">
                <Phone className="w-3 h-3 text-[#2563EB]" />
                <span>Emergency Contact Number</span>
              </label>
              <input
                type="tel"
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231] focus:bg-white focus:border-[#2563EB] focus:outline-none"
              />
            </div>

            {/* Confirmation Note */}
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#166534] font-semibold">
                You're all set. You will receive gentle status updates, scan milestones, and emergency fast-dials for {connectedPatientName}.
              </p>
            </div>
          </section>

          {/* Finish Button */}
          <button
            type="button"
            onClick={handleFinishGuardianOnboarding}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#192231] to-[#2D3748] hover:from-[#232F42] hover:to-[#374459] text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {isLoading ? (
              <span>Preparing Dashboard...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span>Enter Guardian Dashboard 💙</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#192231] text-white px-4 py-2.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="w-2 h-2 rounded-full bg-[#EA81AA] animate-ping" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

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
import { supabase } from '../../lib/supabaseClient';
import {
  createOrUpdateProfile,
  createOrUpdatePatientProfile,
  createOrUpdateGuardianProfile,
  addSupportPerson,
  getFullUserProfile
} from '../../lib/supabaseServices';

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
  const [infoMessage, setInfoMessage] = useState('');

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

  // Harmless form-fill helpers (populates input fields only)
  const handleQuickDemoPatient = () => {
    setEmailOrPhone('priya.sharma@maternal.care');
    setPassword('mumma2026');
    setPatientName('Priya Sharma');
    setSelectedRole('patient');
    setStage('login');
    setErrorMessage('');
    setInfoMessage('');
  };

  const handleQuickDemoGuardian = () => {
    setEmailOrPhone('rohan.sharma@maternal.care');
    setPassword('guardian2026');
    setGuardianName('Rohan Sharma');
    setSelectedRole('guardian');
    setStage('login');
    setErrorMessage('');
    setInfoMessage('');
  };

  // ── SUBMIT LOGIN / SIGN UP WITH SUPABASE AUTH ──
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const email = emailOrPhone.includes('@') ? emailOrPhone.trim() : `${emailOrPhone.trim()}@maternal.care`;
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Supabase Auth Email Sign Up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0],
              role: selectedRole,
              provider: 'email'
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          await createOrUpdateProfile({
            id: data.user.id,
            email: data.user.email || email,
            name: email.split('@')[0],
            role: selectedRole,
            provider: 'email',
            is_onboarded: false
          });
        }

        if (!data.session) {
          setIsLoading(false);
          setInfoMessage('Account created! Please check your email to confirm registration.');
          return;
        }

        setIsLoading(false);
        if (selectedRole === 'patient') {
          setStage('patient-onboarding');
        } else {
          setStage('guardian-onboarding');
        }
      } else {
        // Supabase Auth Email Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data.user) {
          const fullProfile = await getFullUserProfile(data.user.id, data.user.email);
          setIsLoading(false);
          if (fullProfile) {
            showToast(`Welcome back, ${fullProfile.name}!`);
            onAuthComplete(fullProfile);
          } else {
            if (selectedRole === 'patient') {
              setStage('patient-onboarding');
            } else {
              setStage('guardian-onboarding');
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

  // ── GOOGLE LOGIN WITH SUPABASE AUTH ──
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      setErrorMessage(err.message || 'Google Sign-In failed.');
      setIsLoading(false);
    }
  };

  // ── FINISH PATIENT ONBOARDING ──
  const handleFinishPatientOnboarding = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session?.user) {
        throw new Error('No active authentication session. Please sign in first.');
      }

      const userId = session.user.id;
      const email = session.user.email || emailOrPhone || '';

      await createOrUpdateProfile({
        id: userId,
        email,
        name: patientName.trim() || 'Mumma',
        role: 'patient',
        provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
        is_onboarded: true
      });

      await createOrUpdatePatientProfile(userId, {
        due_date: dueDate,
        is_first_pregnancy: isFirstPregnancy,
        location: location.trim()
      });

      for (const sp of supportPeople) {
        await addSupportPerson(userId, {
          name: sp.name,
          relationship: sp.relationship,
          phone: sp.phone
        });
      }

      const fullProfile = await getFullUserProfile(userId, email);

      if (!fullProfile || !fullProfile.patientProfile) {
        throw new Error('Patient profile was not successfully persisted into database.');
      }

      setIsLoading(false);
      showToast('Profile setup complete! Welcome to Sanctuary 💗');
      onAuthComplete(fullProfile);
    } catch (err: any) {
      console.error('Onboarding save error:', err);
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to complete profile onboarding.');
    }
  };

  // ── FINISH GUARDIAN ONBOARDING ──
  const handleFinishGuardianOnboarding = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!session?.user) {
        throw new Error('No active authentication session. Please sign in first.');
      }

      const userId = session.user.id;
      const email = session.user.email || emailOrPhone || '';

      await createOrUpdateProfile({
        id: userId,
        email,
        name: guardianName.trim() || 'Guardian',
        role: 'guardian',
        provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
        is_onboarded: true
      });

      await createOrUpdateGuardianProfile(userId, {
        relationship: guardianRelationship,
        connected_patient_name: connectedPatientName.trim(),
        phone: guardianPhone
      });

      const fullProfile = await getFullUserProfile(userId, email);
      setIsLoading(false);
      showToast("You're all set to support Mumma! 💙");

      const finalUser: UserProfile = fullProfile || {
        id: userId,
        email,
        name: guardianName.trim() || 'Guardian',
        role: 'guardian',
        provider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
        isOnboarded: true
      };

      onAuthComplete(finalUser);
    } catch (err: any) {
      console.error('Guardian onboarding error:', err);
      setIsLoading(false);
      setErrorMessage(err.message || 'Failed to complete guardian onboarding.');
    }
  };

  return (
    <div className="space-y-4 pb-12 animate-fade-slide-up">
      {/* ═══════════════════════════════════════════════════════════════
          STAGE 1: SPLASH / WELCOME SCREEN
         ═══════════════════════════════════════════════════════════════ */}
      {stage === 'splash' && (
        <div className="space-y-4">
          <section className="relative rounded-[36px] p-6 bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] border border-[#E2ECF7] shadow-[0_16px_40px_rgba(234,129,170,0.14)] overflow-hidden text-center">
            <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full bg-[#FCE7F3] blur-3xl opacity-80 pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#E0F2FE] blur-3xl opacity-85 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="pt-1">
                <BrandLogo size="md" />
              </div>

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

                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#FBCFE8] shadow-xs flex items-center gap-1.5 animate-bounce">
                  <Heart className="w-3.5 h-3.5 text-[#EA81AA] fill-[#EA81AA]" />
                  <span className="text-[11px] font-black text-[#192231] tracking-wide">
                    Mumma Sanctuary
                  </span>
                </div>
              </div>

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

          <section className="p-4 rounded-3xl bg-white border border-[#E2ECF7] shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#EA81AA]" />
                <span className="text-xs font-black text-[#192231]">
                  Quick Fill Form Helpers
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[#7A8B9E]">
              Fill sample credentials into the login form:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickDemoPatient}
                className="p-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FBCFE8] hover:bg-[#FCE7F3] text-left transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-[#EA81AA]">
                  <Heart className="w-3.5 h-3.5 fill-[#EA81AA]" />
                  <span>Fill Mother Credentials</span>
                </div>
                <p className="text-[10px] text-[#5A677D] mt-0.5">
                  Populate Mother login form
                </p>
              </button>

              <button
                type="button"
                onClick={handleQuickDemoGuardian}
                className="p-2.5 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] text-left transition-all cursor-pointer group active:scale-98"
              >
                <div className="flex items-center gap-1.5 text-xs font-black text-[#2563EB]">
                  <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Fill Guardian Credentials</span>
                </div>
                <p className="text-[10px] text-[#5A677D] mt-0.5">
                  Populate Guardian login form
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

          <div className="space-y-3">
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

          <button
            type="button"
            onClick={() => setStage('login')}
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

          <section className="p-5 rounded-[32px] bg-white border border-[#E2ECF7] shadow-xs space-y-4">
            <div className="flex p-1 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF7]">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMessage('');
                  setInfoMessage('');
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
                  setInfoMessage('');
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

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[11px] font-bold text-[#DC2626] flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {infoMessage && (
              <div className="p-3 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] text-[11px] font-bold text-[#1D4ED8] flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                <span>{infoMessage}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-white border border-[#E2ECF7] hover:border-[#CBD5E1] text-[#192231] font-bold text-xs shadow-xs hover:shadow-sm active:scale-98 transition-all flex items-center justify-center gap-3 cursor-pointer group"
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
              <span className="tracking-wide">Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#EEF2F6]" />
              </div>
              <span className="relative px-3 bg-white text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                or sign in with email
              </span>
            </div>

            <form onSubmit={handleSubmitLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-[#94A3B8]">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    placeholder="mumma@example.com"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#192231] to-[#2D3748] hover:from-[#232F42] hover:to-[#374459] text-white font-black text-xs shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span>{isSignUp ? 'Create Mumma Account' : 'Sign In to Sanctuary'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </form>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 4: PATIENT ONBOARDING FORM
         ═══════════════════════════════════════════════════════════════ */}
      {stage === 'patient-onboarding' && (
        <div className="space-y-4">
          <section className="p-5 rounded-[32px] bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] border border-[#FBCFE8] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-[#EA81AA]" />
              <h2 className="text-lg font-black text-[#192231]">
                Mother Onboarding Profile
              </h2>
            </div>
            <p className="text-xs text-[#5A677D]">
              Personalize your gestational timeline and care contacts.
            </p>
          </section>

          <section className="p-5 rounded-[32px] bg-white border border-[#E2ECF7] shadow-xs space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[11px] font-bold text-[#DC2626] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Your Full Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Estimated Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                City / Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-bold text-[#192231] cursor-pointer">
                First-time pregnancy?
              </label>
              <input
                type="checkbox"
                checked={isFirstPregnancy}
                onChange={(e) => setIsFirstPregnancy(e.target.checked)}
                className="w-4 h-4 rounded border-[#CBD5E1] accent-[#EA81AA]"
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleFinishPatientOnboarding}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#EA81AA] to-[#6FAFED] text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? 'Saving Profile...' : 'Complete Setup & Open Sanctuary 💗'}
            </button>
          </section>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          STAGE 5: GUARDIAN ONBOARDING FORM
         ═══════════════════════════════════════════════════════════════ */}
      {stage === 'guardian-onboarding' && (
        <div className="space-y-4">
          <section className="p-5 rounded-[32px] bg-gradient-to-br from-[#EFF6FF] via-white to-[#FDF2F7] border border-[#BFDBFE] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2563EB]" />
              <h2 className="text-lg font-black text-[#192231]">
                Guardian Onboarding Profile
              </h2>
            </div>
            <p className="text-xs text-[#5A677D]">
              Connect to support your partner throughout pregnancy.
            </p>
          </section>

          <section className="p-5 rounded-[32px] bg-white border border-[#E2ECF7] shadow-xs space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[11px] font-bold text-[#DC2626] flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Your Name
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Relationship to Mother
              </label>
              <input
                type="text"
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Mother's Name
              </label>
              <input
                type="text"
                value={connectedPatientName}
                onChange={(e) => setConnectedPatientName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231]"
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleFinishGuardianOnboarding}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white font-black text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
            >
              {isLoading ? 'Saving Profile...' : 'Complete Setup & Open Guardian Dashboard 💙'}
            </button>
          </section>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#192231] text-white px-4 py-2.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

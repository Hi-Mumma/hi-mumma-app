import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, Heart } from 'lucide-react';
import { UserProfile } from '../../types';
import { supabase } from '../../lib/supabaseClient';
import { getFullUserProfile, createOrUpdateProfile, createOrUpdatePatientProfile } from '../../lib/supabaseServices';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  onDismiss?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onDismiss }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [successToast, setSuccessToast] = useState(false);

  // Form-fill helper only (populates inputs, does NOT simulate authentication)
  const handleFillDemo = () => {
    setEmail('priya.sharma@maternal.care');
    setPassword('mumma2026');
    setName('Priya Sharma');
    setErrorMessage('');
    setInfoMessage('');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // ── EMAIL SIGN UP WITH SUPABASE AUTH ──
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim() || 'Mumma',
              role: 'patient',
              provider: 'email'
            }
          }
        });

        if (error) throw error;

        if (data.user) {
          await createOrUpdateProfile({
            id: data.user.id,
            email: data.user.email || email.trim(),
            name: name.trim() || 'Mumma',
            role: 'patient',
            provider: 'email',
            is_onboarded: true
          });

          await createOrUpdatePatientProfile(data.user.id, {
            due_date: '2026-12-14',
            is_first_pregnancy: true,
            location: 'Mumbai, Maharashtra'
          });

          if (!data.session) {
            setIsLoading(false);
            setInfoMessage('Account created successfully! Please check your email inbox to confirm registration.');
            return;
          }

          const fullProfile = await getFullUserProfile(data.user.id, data.user.email);
          setIsLoading(false);
          setSuccessToast(true);

          if (fullProfile) {
            onLoginSuccess(fullProfile);
          } else {
            throw new Error('Failed to retrieve patient profile from database.');
          }
        }
      } else {
        // ── EMAIL SIGN IN WITH SUPABASE AUTH ──
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (error) throw error;

        if (data.user) {
          let fullProfile = await getFullUserProfile(data.user.id, data.user.email);

          if (!fullProfile) {
            await createOrUpdateProfile({
              id: data.user.id,
              email: data.user.email || email.trim(),
              name: data.user.user_metadata?.name || email.split('@')[0],
              role: 'patient',
              provider: 'email',
              is_onboarded: true
            });

            await createOrUpdatePatientProfile(data.user.id, {
              due_date: '2026-12-14',
              is_first_pregnancy: true,
              location: 'Mumbai, Maharashtra'
            });

            fullProfile = await getFullUserProfile(data.user.id, data.user.email);
          } else if (!fullProfile.patientProfile && fullProfile.role === 'patient') {
            await createOrUpdatePatientProfile(data.user.id, {
              due_date: '2026-12-14',
              is_first_pregnancy: true,
              location: 'Mumbai, Maharashtra'
            });
            fullProfile = await getFullUserProfile(data.user.id, data.user.email);
          }

          setIsLoading(false);
          setSuccessToast(true);

          if (fullProfile) {
            onLoginSuccess(fullProfile);
          } else {
            throw new Error('Failed to retrieve user profile after sign in.');
          }
        }
      }
    } catch (err: any) {
      console.error('Supabase Auth Error:', err);
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
      setIsLoading(false);
    }
  };

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
      console.error('Google Sign-In Error:', err);
      setErrorMessage(err.message || 'Google Sign-In failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <section className="relative rounded-[36px] p-5 sm:p-6 bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] border border-[#E2ECF7] shadow-[0_16px_40px_rgba(234,129,170,0.12)] overflow-hidden">
        <div className="absolute -top-12 -left-12 w-52 h-52 rounded-full bg-[#FCE7F3] blur-3xl opacity-75 pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-56 h-56 rounded-full bg-[#E0F2FE] blur-3xl opacity-80 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-white shadow-[0_12px_32px_rgba(234,129,170,0.25)] bg-gradient-to-tr from-[#FDF2F7] to-[#E0F2FE] animate-hero-reveal">
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

            <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#FBCFE8] shadow-xs flex items-center gap-1.5">
              <Heart className="w-3 h-3 text-[#EA81AA] fill-[#EA81AA]" />
              <span className="text-[10px] font-black text-[#192231] tracking-wide">
                HI MUMMA
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1">
            <span className="px-3 py-0.5 rounded-full bg-white border border-[#FBCFE8] text-[10px] font-black uppercase tracking-wider text-[#EA81AA] inline-block shadow-2xs">
              Welcome to Your Sanctuary
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#192231] tracking-tight leading-tight">
              {isSignUp ? 'Begin Your Journey' : 'Welcome Back, Mumma'}
            </h2>
            <p className="text-xs text-[#5A677D] leading-relaxed max-w-sm">
              Your personalized maternal companion for 3D fetal evaluation, daily vitals tracking, and private medical records.
            </p>
          </div>
        </div>
      </section>

      <section className="p-5 sm:p-6 rounded-[32px] bg-white border border-[#E2ECF7] shadow-xs space-y-4">
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

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs font-semibold text-[#192231] placeholder-[#94A3B8] focus:bg-white focus:border-[#EA81AA] focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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

          <div className="flex items-center justify-between pt-1">
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

        <div className="pt-2 border-t border-[#F0F4FA] flex items-center justify-between">
          <span className="text-[10px] text-[#8F9EB3]">Quick Fill Form:</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-2.5 py-1 rounded-lg bg-[#FDF2F7] border border-[#FBCFE8] text-[10px] font-bold text-[#EA81AA] hover:bg-[#FCE7F3] transition-colors cursor-pointer"
          >
            Fill Demo Form
          </button>
        </div>

        {onDismiss && (
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onDismiss}
              className="text-[11px] font-semibold text-[#8F9EB3] hover:text-[#192231] cursor-pointer"
            >
              Continue as Guest for now →
            </button>
          </div>
        )}
      </section>

      <section className="p-3.5 rounded-2xl bg-[#FAFBFD] border border-[#E8EFF7] flex items-center gap-3">
        <div className="p-2 rounded-xl bg-white border border-[#E2ECF7] text-[#6FAFED] shrink-0 shadow-2xs">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <p className="text-[10px] text-[#7A8B9E] leading-relaxed">
          <strong className="text-[#192231]">256-Bit Maternal Security:</strong> Your records, fetal metrics, and blood pressure logs are strictly confidential and encrypted locally.
        </p>
      </section>

      {successToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#192231] text-white px-4 py-2.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
          <span className="text-xs font-bold">Welcome! Access granted</span>
        </div>
      )}
    </div>
  );
};

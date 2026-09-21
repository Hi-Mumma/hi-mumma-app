import React, { useState } from 'react';
import {
  Heart,
  Shield,
  Calendar,
  Bell,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Sparkles,
  Coffee,
  Smile,
  Pill
} from 'lucide-react';
import { UserProfile } from '../../types';

interface GuardianDashboardViewProps {
  currentUser: UserProfile;
  currentWeek: number;
  onSwitchToPatientView: () => void;
  onLogout: () => void;
}

export const GuardianDashboardView: React.FC<GuardianDashboardViewProps> = ({
  currentUser,
  currentWeek,
  onSwitchToPatientView,
  onLogout
}) => {
  const [nudgeSentToast, setNudgeSentToast] = useState<string | null>(null);

  const patientName =
    currentUser.guardianProfile?.connectedPatientName || 'Priya Sharma';
  const guardianName = currentUser.name || 'Rohan';
  const relationship = currentUser.guardianProfile?.relationship || 'Partner';

  const sendNudge = (message: string) => {
    setNudgeSentToast(`"${message}" sent to ${patientName}! 💗`);
    setTimeout(() => {
      setNudgeSentToast(null);
    }, 2800);
  };

  return (
    <div className="space-y-4 pb-20 animate-fade-slide-up">
      {/* ── 1. GUARDIAN HEADER HERO ── */}
      <section className="relative rounded-[32px] p-5 bg-gradient-to-br from-[#EFF6FF] via-white to-[#FDF2F7] border border-[#BFDBFE] shadow-sm overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#DBEAFE] blur-2xl opacity-60 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-[#FCE7F3] blur-2xl opacity-60 pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#93C5FD] text-[10px] font-black uppercase tracking-wider text-[#2563EB] shadow-2xs inline-flex items-center gap-1">
                <Shield className="w-3 h-3 text-[#2563EB]" />
                Guardian Sanctuary
              </span>
              <span className="text-[10px] text-[#64748B] font-bold">
                {relationship} Mode
              </span>
            </div>
            <h2 className="text-xl font-black text-[#192231] tracking-tight">
              Hello, {guardianName} 💙
            </h2>
            <p className="text-xs text-[#5A677D]">
              Connected to <strong className="text-[#192231]">{patientName}</strong> • Week {currentWeek} of pregnancy
            </p>
          </div>

          <button
            onClick={onLogout}
            title="Sign Out"
            className="p-2 rounded-2xl bg-white border border-[#E2ECF7] text-[#64748B] hover:text-[#DC2626] hover:border-[#FECACA] shadow-2xs transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── 2. MUMMA'S ACTIVE STATUS SUMMARY ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E2ECF7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#192231] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#EA81AA] fill-[#EA81AA]" />
            Mumma & Baby's Status Today
          </h3>
          <span className="text-[10px] font-extrabold text-[#34A853] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
            Latest log available
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Fetal Growth Card */}
          <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF7] space-y-1">
            <span className="text-[10px] font-bold text-[#7A8B9E] uppercase tracking-wider">
              Baby Development
            </span>
            <p className="text-sm font-black text-[#192231]">Cantaloupe Melon</p>
            <p className="text-[10px] text-[#5A677D]">
              ~30 cm • ~600 grams • Hearing mother's voice
            </p>
          </div>

          {/* Daily Supplements */}
          <div className="p-3 rounded-2xl bg-[#FFF5F8] border border-[#FCE7F3] space-y-1">
            <span className="text-[10px] font-bold text-[#EA81AA] uppercase tracking-wider flex items-center gap-1">
              <Pill className="w-3 h-3" /> Supplements
            </span>
            <p className="text-sm font-black text-[#192231]">2 of 3 Taken</p>
            <p className="text-[10px] text-[#5A677D]">
              Folic Acid & Calcium completed
            </p>
          </div>
        </div>

        {/* Clinical Note for Guardian */}
        <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-[#166534]">
              Last BP Reading: 118/76 mmHg
            </p>
            <p className="text-[10px] text-[#15803D]">
              Logged yesterday at 8:30 AM. Keep sharing readings with the care team.
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. LOVE NUDGES & SUPPORTIVE ACTIONS ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E2ECF7] shadow-xs space-y-3">
        <div>
          <h3 className="text-xs font-black text-[#192231] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            Send a Love Nudge to Mumma
          </h3>
          <p className="text-[10px] text-[#7A8B9E]">
            One tap sends a gentle, loving reminder to {patientName}'s phone.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => sendNudge('Put your feet up and rest, Mumma 🦶💗')}
            className="p-3 rounded-2xl bg-[#FDF2F7] border border-[#FBCFE8] hover:bg-[#FCE7F3] transition-all text-left space-y-1 cursor-pointer group active:scale-98"
          >
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#EA81AA] shadow-2xs group-hover:scale-105 transition-transform">
              <Coffee className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#192231]">Rest & Relax</p>
            <p className="text-[9px] text-[#5A677D]">Remind her to take a break</p>
          </button>

          <button
            onClick={() => sendNudge('Thinking of you and our baby! You are doing amazing 💗')}
            className="p-3 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] hover:bg-[#F3E8FF] transition-all text-left space-y-1 cursor-pointer group active:scale-98"
          >
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#9333EA] shadow-2xs group-hover:scale-105 transition-transform">
              <Smile className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#192231]">Loving Praise</p>
            <p className="text-[9px] text-[#5A677D]">Boost her spirits today</p>
          </button>

          <button
            onClick={() => sendNudge('Healthy snack time for Mumma & baby! 🥗')}
            className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] hover:bg-[#DCFCE7] transition-all text-left space-y-1 cursor-pointer group active:scale-98"
          >
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center text-[#16A34A] shadow-2xs group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-[#192231]">Nourish Baby</p>
            <p className="text-[9px] text-[#5A677D]">Healthy snack reminder</p>
          </button>
        </div>
      </section>

      {/* ── 4. CLINICAL CALENDAR & SCANS ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E2ECF7] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#192231] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#D8A657]" />
            Upcoming Clinical Milestone
          </h3>
          <span className="text-[10px] font-bold text-[#7A8B9E]">Next 14 Days</span>
        </div>

        <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#92400E]">
              Anomaly Scan (Level II Ultrasound)
            </span>
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white text-[#92400E] border border-[#FDE68A]">
              Week 24
            </span>
          </div>
          <p className="text-[10px] text-[#B45309]">
            Detailed anatomical evaluation of baby's organs, heart, and placenta position.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] font-semibold text-[#78350F]">
            <span>Consulting: Dr. Anita Desai (OB-GYN)</span>
            <span className="text-[9px] underline">Set Phone Alarm</span>
          </div>
        </div>
      </section>

      {/* ── 5. SWITCH TO PATIENT DASHBOARD PREVIEW ── */}
      <section className="p-3.5 rounded-2xl bg-white border border-[#E2ECF7] shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-xs font-black text-[#192231]">
            View Mother's Full Experience
          </p>
          <p className="text-[10px] text-[#7A8B9E]">
            Check 3D evaluation, ultrasound tests, and full health logs
          </p>
        </div>
        <button
          onClick={onSwitchToPatientView}
          className="px-3 py-1.5 rounded-xl bg-[#192231] text-white text-[11px] font-bold shadow-xs hover:bg-[#2D3748] transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>Open App</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </section>

      {/* ── TOAST NOTIFICATION ── */}
      {nudgeSentToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#192231] text-white px-4 py-2.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-ping" />
          <span className="text-xs font-bold">{nudgeSentToast}</span>
        </div>
      )}
    </div>
  );
};

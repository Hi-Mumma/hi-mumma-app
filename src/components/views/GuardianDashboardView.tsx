import React, { useState } from 'react';
import {
  Heart,
  Shield,
  Calendar,
  CheckCircle2,
  ExternalLink,
  LogOut,
  Sparkles,
  Coffee,
  Smile,
  Pill,
  CheckSquare,
  Lock
} from 'lucide-react';
import { UserProfile, GuardianLinkedPatientData } from '../../types';

interface GuardianDashboardViewProps {
  currentUser: UserProfile;
  currentWeek: number;
  guardianLinkedData?: GuardianLinkedPatientData | null;
  onSwitchToPatientView: () => void;
  onLogout: () => void;
  onToggleSharedTask?: (itemId: string) => void;
}

export const GuardianDashboardView: React.FC<GuardianDashboardViewProps> = ({
  currentUser,
  currentWeek,
  guardianLinkedData,
  onSwitchToPatientView,
  onLogout,
  onToggleSharedTask
}) => {
  const [nudgeSentToast, setNudgeSentToast] = useState<string | null>(null);

  const patientName =
    guardianLinkedData?.patientName ||
    currentUser.guardianProfile?.connectedPatientName ||
    'Mother';
  const guardianName = currentUser.name || 'Caregiver';
  const relationship = currentUser.guardianProfile?.relationship || 'Support Person';
  const weekNumber = guardianLinkedData?.currentWeek || currentWeek;
  const permissions = guardianLinkedData?.permissions;

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
              Connected to <strong className="text-[#192231]">{patientName}</strong> • Week {weekNumber} of pregnancy
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

      {/* ── 2. PERMISSION-GOVERNED STATUS SUMMARY ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E2ECF7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#192231] flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-[#EA81AA] fill-[#EA81AA]" />
            Mother & Baby's Status Today
          </h3>
          <span className="text-[10px] font-extrabold text-[#34A853] bg-[#DCFCE7] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
            Permission Controlled
          </span>
        </div>

        {permissions ? (
          <div className="grid grid-cols-2 gap-2.5">
            {/* Trimester Journey Access */}
            <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF7] space-y-1">
              <span className="text-[10px] font-bold text-[#7A8B9E] uppercase tracking-wider">
                Gestational Status
              </span>
              <p className="text-sm font-black text-[#192231]">Week {weekNumber}</p>
              <p className="text-[10px] text-[#5A677D]">
                {permissions.allowJourneyView
                  ? 'Trimester milestone tracking active'
                  : 'Journey details restricted by Mother'}
              </p>
            </div>

            {/* Daily Supplements Access */}
            <div className="p-3 rounded-2xl bg-[#FFF5F8] border border-[#FCE7F3] space-y-1">
              <span className="text-[10px] font-bold text-[#EA81AA] uppercase tracking-wider flex items-center gap-1">
                <Pill className="w-3 h-3" /> Supplements
              </span>
              {permissions.allowCareView || permissions.allowVitalsView ? (
                <>
                  <p className="text-sm font-black text-[#192231]">
                    {guardianLinkedData?.supplementsTaken?.taken || 0} of {guardianLinkedData?.supplementsTaken?.total || 3} Taken
                  </p>
                  <p className="text-[10px] text-[#5A677D]">Today's maternal logs</p>
                </>
              ) : (
                <div className="flex items-center gap-1 text-[10px] text-[#8F9EB3] pt-1">
                  <Lock className="w-3 h-3 text-[#EA81AA]" />
                  <span>Restricted by Mother</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FAFBFD] border border-[#E8EFF7] space-y-1 text-center">
            <p className="text-xs font-bold text-[#192231]">Caregiver Connection Linked</p>
            <p className="text-[10px] text-[#7A8B9E]">
              Ask {patientName} to grant caregiver view permissions in her settings menu.
            </p>
          </div>
        )}
      </section>

      {/* ── 3. SHARED TASKS SECTION ── */}
      {permissions && (permissions.allowSharedTasksView || permissions.allowDeliveryPrepView) && (
        <section className="p-4 rounded-3xl bg-white border border-[#E2ECF7] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
            <h3 className="text-xs font-black text-[#192231] flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#2563EB]" />
              Shared Delivery Preparation Tasks
            </h3>
            <span className="text-[10px] text-[#7A8B9E] font-bold">Collaborative List</span>
          </div>

          {!guardianLinkedData?.sharedPrepItems || guardianLinkedData.sharedPrepItems.length === 0 ? (
            <p className="text-[10px] text-[#8F9EB3] italic">No shared tasks currently listed.</p>
          ) : (
            <div className="space-y-2">
              {guardianLinkedData.sharedPrepItems.slice(0, 4).map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] text-xs cursor-pointer hover:border-[#BFDBFE] transition-all"
                >
                  <span
                    className={`font-semibold ${
                      item.completed ? 'line-through text-[#8F9EB3]' : 'text-[#192231]'
                    }`}
                  >
                    {item.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => onToggleSharedTask && onToggleSharedTask(item.id)}
                    className="accent-[#2563EB] w-4 h-4 cursor-pointer"
                  />
                </label>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 4. LOVE NUDGES & SUPPORTIVE ACTIONS ── */}
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


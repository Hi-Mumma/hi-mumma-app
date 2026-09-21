import React from 'react';
import { PregnancyPhase, UserProfile } from '../../types';

interface MoreViewProps {
  phase: PregnancyPhase;
  onTogglePhase: (phase: PregnancyPhase) => void;
  postpartumDay: number;
  onUpdatePostpartumDay: (day: number) => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  phase,
  onTogglePhase,
  postpartumDay,
  onUpdatePostpartumDay,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  return (
    <div className="space-y-4">
      {/* ── 0. MATERNAL ACCOUNT & PROFILE (MOCK AUTH) ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2.5">
          <div>
            <h3 className="text-xs font-black text-[#192231]">Maternal Account</h3>
            <p className="text-[10px] text-[#8F9EB3]">Cloud sync & encrypted records access</p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FDF2F7] border border-[#FBCFE8] text-[#EA81AA]">
            {currentUser ? 'Active Sanctuary' : 'Guest Mode'}
          </span>
        </div>

        {currentUser ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF7]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white shadow-xs shrink-0">
                <img
                  src={currentUser.avatarUrl || '/mother-hero.jpg'}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-[#192231]">{currentUser.name}</h4>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase border ${
                    currentUser.role === 'guardian'
                      ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]'
                      : 'bg-[#FFF5F8] border-[#FBCFE8] text-[#EA81AA]'
                  }`}>
                    {currentUser.role === 'guardian' ? 'Guardian' : 'Mother'}
                  </span>
                </div>
                <p className="text-[10px] text-[#7A8B9E]">{currentUser.email}</p>
                {currentUser.role === 'patient' && currentUser.dueDate && (
                  <p className="text-[9px] text-[#5A677D]">Due: {currentUser.dueDate}</p>
                )}
                {currentUser.role === 'guardian' && currentUser.guardianProfile && (
                  <p className="text-[9px] text-[#5A677D]">
                    Supporting: {currentUser.guardianProfile.connectedPatientName} ({currentUser.guardianProfile.relationship})
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenLogin}
                className="px-2.5 py-1 rounded-xl bg-white border border-[#E2ECF7] text-[10px] font-bold text-[#192231] hover:bg-[#F3F8FE] transition-colors cursor-pointer"
              >
                Switch Role
              </button>
              <button
                onClick={onLogout}
                className="px-2.5 py-1 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[10px] font-bold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#FFF5F8] to-[#F0F7FF] border border-[#FCE7F3]">
            <div>
              <p className="text-xs font-bold text-[#192231]">Sign in to sync vitals</p>
              <p className="text-[10px] text-[#7A8B9E]">Access your private sanctuary across devices</p>
            </div>
            <button
              onClick={onOpenLogin}
              className="px-4 py-1.5 rounded-full bg-[#192231] text-white text-xs font-black shadow-xs hover:bg-[#2D3748] transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}
      </section>

      {/* ── 1. PREGNANCY / POSTPARTUM PHASE CONTROLLER ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-[#192231]">Maternal Journey Phase</h3>
            <p className="text-[10px] text-[#8F9EB3]">Controls timeline and postpartum vault access</p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FAFBFD] border border-[#E2ECF7] text-[#6FAFED]">
            {phase === 'pregnancy' ? 'Pregnancy Mode' : 'Postpartum Mode'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTogglePhase('pregnancy')}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              phase === 'pregnancy'
                ? 'bg-[#192231] text-white border-[#192231] shadow-xs'
                : 'bg-[#FAFBFD] text-[#5A677D] border-[#E8EFF7] hover:border-[#6FAFED]'
            }`}
          >
            🤰 Pregnancy (Weeks 0–40)
          </button>
          <button
            onClick={() => onTogglePhase('postpartum')}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              phase === 'postpartum'
                ? 'bg-gradient-to-r from-[#EA81AA] to-[#6FAFED] text-white border-transparent shadow-xs'
                : 'bg-[#FAFBFD] text-[#5A677D] border-[#E8EFF7] hover:border-[#EA81AA]'
            }`}
          >
            🌸 Postpartum (Days 1–42)
          </button>
        </div>

        {phase === 'postpartum' && (
          <div className="p-3 rounded-2xl bg-[#FDF5F8] border border-[#F5D5E3] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-[#192231]">
                Postpartum Recovery: Day {postpartumDay} of 42
              </span>
              <span className="text-[10px] font-bold text-[#EA81AA]">
                Vault Unlocked 🔓
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="42"
              value={postpartumDay}
              onChange={(e) => onUpdatePostpartumDay(Number(e.target.value))}
              className="w-full accent-[#EA81AA] cursor-pointer"
            />
          </div>
        )}
      </section>

      {/* ── 2. CLINICAL CARE TEAM REPOSITORY ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-2.5">
        <h4 className="text-xs font-black text-[#192231] border-b border-[#F0F4FA] pb-2">
          Your Maternal Care Team
        </h4>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#FAFBFD] border border-[#EBF1F9] flex justify-between items-center">
            <div>
              <p className="font-bold text-[#192231]">Dr. A. Sharma, MD, DGO</p>
              <p className="text-[10px] text-[#8F9EB3]">Lead Obstetrician & Gynecologist</p>
            </div>
            <span className="text-xs">🩺</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FAFBFD] border border-[#EBF1F9] flex justify-between items-center">
            <div>
              <p className="font-bold text-[#192231]">City Maternal Care Hospital</p>
              <p className="text-[10px] text-[#8F9EB3]">Registration: #MUM-2026-8819</p>
            </div>
            <span className="text-xs">🏥</span>
          </div>
        </div>
      </section>

      {/* ── 4. NON-DIAGNOSTIC ARCHITECTURAL DISCLAIMER ── */}
      <section className="p-4 rounded-3xl bg-[#FAFBFD] border border-[#E8EFF7] text-center space-y-1 text-[#8F9EB3]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A677D]">
          Maternal Companion Notice
        </p>
        <p className="text-[10px] leading-relaxed">
          HI MUMMA is a digital journey companion and tracking tool. It does not provide medical diagnoses, treatment plans, clinical decision scoring, or emergency triage. Always consult your attending OB-GYN for all health evaluations.
        </p>
      </section>
    </div>
  );
};

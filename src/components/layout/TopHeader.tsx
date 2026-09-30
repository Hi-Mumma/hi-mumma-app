import React from 'react';
import { Trimester, UserProfile } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import {
  getTrimesterNumber,
  getPregnancyStageInfo,
  calculateGestationalAgeFromDueDate,
  GestationalAge
} from '../../utils/pregnancyStage';

interface TopHeaderProps {
  week: number;
  currentDays?: number;
  gestationalAge?: GestationalAge;
  trimester?: Trimester;
  onWeekChange: (week: number) => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  week,
  currentDays = 0,
  gestationalAge,
  onWeekChange,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  const allWeeks = Array.from({ length: 42 }, (_, i) => i + 1);
  const dueDateStr = currentUser?.dueDate || currentUser?.patientProfile?.dueDate;
  
  // Calculate mother's actual EDD-derived gestational age
  const actualPog = calculateGestationalAgeFromDueDate(
    dueDateStr,
    week,
    currentDays
  );

  const displayPog = gestationalAge || actualPog;
  const isExploring = actualPog.hasValidDate && week !== actualPog.weeks;

  const activeTrimester = getTrimesterNumber(week);
  const activeStageInfo = getPregnancyStageInfo(week);

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-xl mb-3 border-b border-[#E8EFF7] shadow-2xs divide-y divide-[#E8EFF7]/60">
      {/* ── ROW 1: Clean, Minimal Main Navbar ── */}
      <div className="py-2 px-3 flex items-center justify-between gap-2">
        {/* Left: App Brand Logo & Role Badge */}
        <div className="flex items-center gap-2 min-w-0">
          <BrandLogo size="sm" hideSubtext />
          {currentUser && (
            <span
              className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                currentUser.role === 'guardian'
                  ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                  : 'bg-[#FFF5F8] text-[#EA81AA] border-[#FBCFE8]'
              }`}
            >
              {currentUser.role === 'guardian' ? 'Guardian' : 'Mother'}
            </span>
          )}
        </div>

        {/* Right: Account Avatar & Auth Controls */}
        {onOpenLogin && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenLogin}
              title={currentUser ? `Signed in as ${currentUser.name} (${currentUser.role}). Click to switch role.` : 'Sign In'}
              className="w-8 h-8 rounded-full overflow-hidden border border-[#E2ECF7] hover:border-[#EA81AA] shadow-2xs transition-all cursor-pointer flex items-center justify-center shrink-0 bg-white"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-bold text-[#EA81AA]">
                  {currentUser?.name ? currentUser.name[0].toUpperCase() : '👤'}
                </span>
              )}
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 rounded-full hover:bg-[#FEF2F2] text-[#94A3B8] hover:text-[#DC2626] transition-colors cursor-pointer text-xs"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── ROW 2: Dedicated Pregnancy Information Bar ── */}
      <div className="py-1.5 px-3 bg-[#FAFBFD]/90 flex items-center justify-between gap-2 text-xs overflow-x-auto no-scrollbar">
        {/* Left: Trimester / Viewing Badge & Actual POG Gestational Age */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-[#E2ECF7] shadow-2xs">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                activeTrimester === 1
                  ? 'bg-[#EA81AA]'
                  : activeTrimester === 2
                  ? 'bg-[#6FAFED]'
                  : 'bg-[#D8A657]'
              }`}
            />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#5A677D]">
              {isExploring ? `Viewing W${week}` : activeStageInfo.trimesterName}
            </span>
          </div>

          <span className="text-[11px] font-extrabold text-[#192231] bg-[#FDF2F7] px-2.5 py-0.5 rounded-full border border-[#FBCFE8] shadow-2xs whitespace-nowrap">
            {isExploring ? `POG: ${actualPog.formattedLong}` : displayPog.formattedLong}
          </span>
        </div>

        {/* Right: Preserved & Fully Functional Week Selector Dropdown */}
        <div className="flex items-center gap-1 bg-white border border-[#E2ECF7] rounded-full shadow-2xs px-2.5 py-0.5 shrink-0">
          <span className="text-[10px] font-bold text-[#8F9EB3]">Week</span>
          <select
            aria-label="Select Gestational Week"
            value={week}
            onChange={(e) => onWeekChange(Number(e.target.value))}
            className="bg-transparent text-xs font-black text-[#192231] focus:outline-none cursor-pointer pr-0.5"
          >
            {allWeeks.map((w) => (
              <option key={w} value={w}>
                W{w}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};


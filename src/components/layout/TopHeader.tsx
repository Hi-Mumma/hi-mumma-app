import React from 'react';
import { Trimester, UserProfile } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { GestationalAge } from '../../utils/pregnancyStage';

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
  onWeekChange,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  const allWeeks = Array.from({ length: 42 }, (_, i) => i + 1);

  return (
    <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-xl mb-3 border-b border-[#E8EFF7] shadow-2xs py-2 px-3 flex items-center justify-between gap-2">
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

      {/* Right: Interactive Week Selector Dropdown & Account Avatar Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-white border border-[#E2ECF7] rounded-full shadow-2xs px-2.5 py-1">
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

        {/* User Account Avatar & Auth Controls */}
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
    </header>
  );
};



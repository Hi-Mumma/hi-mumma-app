import React from 'react';
import { Trimester, UserProfile } from '../../types';
import { BrandLogo } from '../common/BrandLogo';
import { getTrimesterNumber } from '../../utils/pregnancyStage';

interface TopHeaderProps {
  week: number;
  trimester: Trimester;
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
  const canonicalTrimester = getTrimesterNumber(week);

  return (
    <div className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-xl pt-2.5 pb-2.5 mb-3 border-b border-[#E8EFF7] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <BrandLogo size="sm" />
        {currentUser && (
          <span
            className={`hidden sm:inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
              currentUser.role === 'guardian'
                ? 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
                : 'bg-[#FFF5F8] text-[#EA81AA] border-[#FBCFE8]'
            }`}
          >
            {currentUser.role === 'guardian' ? 'Guardian' : 'Mother'}
          </span>
        )}
      </div>

      {/* Week Selector Dropdown, Trimester Pill & Account Avatar */}
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white border border-[#E2ECF7] shadow-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              canonicalTrimester === 1
                ? 'bg-[#EA81AA]'
                : canonicalTrimester === 2
                ? 'bg-[#6FAFED]'
                : 'bg-[#D8A657]'
            }`}
          />
          <span className="text-[10px] font-black uppercase tracking-wider text-[#5A677D]">
            T{canonicalTrimester}
          </span>
        </div>

        <div className="flex items-center bg-white border border-[#E2ECF7] rounded-full shadow-xs px-2 py-0.5">
          <span className="text-[10px] font-bold text-[#8F9EB3] mr-1">Week</span>
          <select
            aria-label="Select Gestational Week"
            value={week}
            onChange={(e) => onWeekChange(Number(e.target.value))}
            className="bg-transparent text-xs font-black text-[#192231] py-0.5 focus:outline-none cursor-pointer"
          >
            {allWeeks.map((w) => (
              <option key={w} value={w}>
                W{w} (T{getTrimesterNumber(w)})
              </option>
            ))}
          </select>
        </div>

        {/* User Account Avatar & Switch / Sign Out Button */}
        {onOpenLogin && (
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenLogin}
              title={currentUser ? `Signed in as ${currentUser.name} (${currentUser.role}). Click to switch role.` : 'Sign In'}
              className="w-7 h-7 rounded-full overflow-hidden border border-[#E2ECF7] hover:border-[#EA81AA] shadow-2xs transition-all cursor-pointer flex items-center justify-center shrink-0 bg-white"
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
    </div>
  );
};


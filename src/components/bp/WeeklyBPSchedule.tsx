import React from 'react';
import { WeekdayShort } from '../../types';

interface WeeklyBPScheduleProps {
  daysLogged: WeekdayShort[];
  weeklyCount: number;
}

export const WeeklyBPSchedule: React.FC<WeeklyBPScheduleProps> = ({
  daysLogged,
  weeklyCount
}) => {
  const weekDays: WeekdayShort[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6FAFED]">
            Cadence Tracker
          </span>
          <h4 className="text-sm font-black text-[#192231]">
            Twice-Weekly Blood Pressure Rhythm
          </h4>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F8FE] border border-[#C7DFF9]">
          <span className="text-xs font-black text-[#192231]">{weeklyCount}</span>
          <span className="text-[10px] font-bold text-[#8F9EB3]">/ 2 target</span>
        </div>
      </div>

      {/* 7-Day Status Strip */}
      <div className="grid grid-cols-7 gap-1.5">
        {weekDays.map((day) => {
          const isLogged = daysLogged.includes(day);
          return (
            <div
              key={day}
              className={`py-2 px-1 rounded-xl border text-center transition-all duration-300 ${
                isLogged
                  ? 'bg-gradient-to-b from-[#FDF5F8] to-[#FBE8F0] border-[#EA81AA] text-[#192231] shadow-xs'
                  : 'bg-[#FAFBFD] border-[#EBF1F9] text-[#8F9EB3]'
              }`}
            >
              <span className="text-[9px] font-extrabold block">{day}</span>
              <div className="mt-1 flex justify-center">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLogged ? 'bg-[#EA81AA]' : 'bg-[#E0E8F2]'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Routine advisory tip (non-diagnostic) */}
      <div className="flex items-start gap-2 pt-1 text-[11px] text-[#5A677D] leading-tight">
        <span className="text-xs">💡</span>
        <span>
          Recommended technique: Rest quietly for 5 minutes prior. Use the same arm and keep feet flat on the floor.
        </span>
      </div>
    </div>
  );
};

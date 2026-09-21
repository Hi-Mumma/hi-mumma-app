import React from 'react';
import {
  NavigationTab,
  DailySupplements,
  BPLogEntry,
  WeekdayShort,
  FetalDevelopmentWeek
} from '../../types';
import { MotherHeroBanner } from '../home/MotherHeroBanner';
import { InteractiveBabyReminder } from '../home/InteractiveBabyReminder';

interface HomeViewProps {
  currentWeek: number;
  weekInfo: FetalDevelopmentWeek;
  supplements: DailySupplements;
  onToggleSupplement: (key: keyof DailySupplements) => void;
  bpEntries: BPLogEntry[];
  weeklyBPCount: number;
  daysLogged: WeekdayShort[];
  onNavigate: (tab: NavigationTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentWeek,
  weekInfo,
  supplements,
  onToggleSupplement,
  bpEntries,
  weeklyBPCount,
  daysLogged,
  onNavigate
}) => {
  const latestBP = bpEntries[0];
  const allDays: WeekdayShort[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="space-y-4 pb-20">
      {/* ── 1. CINEMATIC MOTHER HERO BANNER (Scale 0.88→1, Blur-to-focus entry) ── */}
      <MotherHeroBanner
        currentWeek={currentWeek}
        weekInfo={weekInfo}
        onExploreJourney={() => onNavigate('journey')}
      />

      {/* ── 2. INTERACTIVE BABY CHARACTER REMINDER SYSTEM (3 States: Happy, Approaching, Overdue) ── */}
      <InteractiveBabyReminder
        supplements={supplements}
        onToggleSupplement={onToggleSupplement}
      />

      {/* ── 3. TWICE-WEEKLY BLOOD PRESSURE STATUS ── */}
      <section className="p-5 rounded-[32px] bg-white border border-[#E2ECF7] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#F0F7FF] text-xs">🩺</span>
            <div>
              <h3 className="text-xs font-black text-[#192231] tracking-tight">
                Twice-Weekly BP Tracker
              </h3>
              <p className="text-[10px] text-[#7A8B9E]">
                Target: Log 2 readings per week for your OB-GYN
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('track')}
            className="text-xs font-black text-[#38BDF8] hover:text-[#0284C7] transition-colors cursor-pointer"
          >
            Track Vitals →
          </button>
        </div>

        {/* 7-Day Visual Cadence Tracker */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FAFBFD] to-[#F3F8FE] border border-[#E8EFF7] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8F9EB3] uppercase tracking-wider">
              This Week's Schedule
            </span>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white border border-[#E2ECF7] text-[#192231]">
              {weeklyBPCount} of 2 Logs Done
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {allDays.map((day) => {
              const isLogged = daysLogged.includes(day);
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center py-1.5 rounded-xl border text-[10px] transition-all ${
                    isLogged
                      ? 'bg-gradient-to-b from-[#FCE7F3] to-[#FDF2F7] border-[#F9A8D4] text-[#DB2777] font-black shadow-xs'
                      : 'bg-white border-[#E2ECF7] text-[#94A3B8] font-medium'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`w-2 h-2 mt-1 rounded-full ${isLogged ? 'bg-[#EA81AA]' : 'bg-[#E2ECF7]'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Reading Display */}
        <div className="flex items-center justify-between px-1 text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#8F9EB3] block">Latest Reading:</span>
            {latestBP ? (
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base font-black text-[#192231]">
                  {latestBP.systolic} / {latestBP.diastolic}
                </span>
                <span className="text-[10px] text-[#7A8B9E] font-semibold">mmHg</span>
                <span className="text-[10px] text-[#8F9EB3] ml-1.5">({latestBP.dayOfWeek})</span>
              </div>
            ) : (
              <span className="text-xs text-[#8F9EB3]">No readings yet this week</span>
            )}
          </div>

          <button
            onClick={() => onNavigate('track')}
            className="px-4 py-1.5 rounded-full bg-[#192231] text-white text-[11px] font-bold shadow-xs hover:bg-[#2d3748] active:scale-95 transition-all cursor-pointer"
          >
            + New Log
          </button>
        </div>
      </section>

      {/* ── 4. QUICK ACCESS DESTINATIONS (Journey & Track) ── */}
      <section className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigate('journey')}
          className="p-4 rounded-3xl bg-gradient-to-br from-[#FFF5F8] to-white border border-[#FCE7F3] shadow-xs text-left hover:border-[#EA81AA] transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-2xl bg-[#FDF2F7] border border-[#FBCFE8] flex items-center justify-center text-base mb-2 group-hover:scale-110 transition-transform">
            🗺️
          </div>
          <h4 className="text-xs font-black text-[#192231]">Journey Roadmap</h4>
          <p className="text-[10px] text-[#7A8B9E] mt-0.5">
            Trimester milestones & 3D fetal evaluation
          </p>
        </button>

        <button
          onClick={() => onNavigate('track')}
          className="p-4 rounded-3xl bg-gradient-to-br from-[#F0F9FF] to-white border border-[#E0F2FE] shadow-xs text-left hover:border-[#38BDF8] transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-2xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-base mb-2 group-hover:scale-110 transition-transform">
            🩺
          </div>
          <h4 className="text-xs font-black text-[#192231]">Health Tracking</h4>
          <p className="text-[10px] text-[#7A8B9E] mt-0.5">
            BP cadence, kick counter & hospital bag
          </p>
        </button>
      </section>
    </div>
  );
};

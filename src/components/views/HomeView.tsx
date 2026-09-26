import React from 'react';
import {
  NavigationTab,
  DailySupplements,
  BPLogEntry,
  WeekdayShort,
  FetalDevelopmentWeek,
  UserProfile
} from '../../types';
import { MotherHeroBanner } from '../home/MotherHeroBanner';
import { InteractiveBabyReminder } from '../home/InteractiveBabyReminder';
import { Sparkles, BookOpen, FolderHeart, HeartHandshake, Compass } from 'lucide-react';

interface HomeViewProps {
  currentWeek: number;
  weekInfo: FetalDevelopmentWeek;
  supplements: DailySupplements;
  onToggleSupplement: (key: keyof DailySupplements) => void;
  bpEntries: BPLogEntry[];
  weeklyBPCount: number;
  daysLogged: WeekdayShort[];
  onNavigate: (tab: NavigationTab) => void;
  currentUser?: UserProfile | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  currentWeek,
  weekInfo,
  supplements,
  onToggleSupplement,
  bpEntries,
  weeklyBPCount,
  daysLogged,
  onNavigate,
  currentUser
}) => {
  const latestBP = bpEntries[0];
  const allDays: WeekdayShort[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="space-y-4 pb-20">
      {/* ── 1. CINEMATIC MOTHER HERO BANNER ── */}
      <MotherHeroBanner
        currentWeek={currentWeek}
        weekInfo={weekInfo}
        currentUser={currentUser}
        onExploreJourney={() => onNavigate('journey')}
      />

      {/* ── 2. STAGE-SPECIFIC EDUCATIONAL GUIDANCE & MATERNAL INSIGHTS ── */}
      {weekInfo && (
        <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#F0F4FA] pb-2">
            <span className="p-1.5 rounded-xl bg-[#FDF2F7] text-[#EA81AA]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-black text-[#192231]">
                Week {currentWeek} Insights
              </h3>
              <p className="text-[10px] text-[#7A8B9E]">
                Milestones & gentle body guidance
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EA81AA] block">
                🌱 Fetal Development
              </span>
              <p className="text-xs text-[#475569] leading-relaxed">
                {weekInfo.developmentalMilestone}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0284C7] block">
                🌸 Maternal Comfort Tip
              </span>
              <p className="text-xs text-[#475569] leading-relaxed">
                {weekInfo.maternalBodyChanges}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── 3. INTERACTIVE BABY CHARACTER REMINDER SYSTEM (SUPPLEMENTS) ── */}
      <InteractiveBabyReminder
        supplements={supplements}
        onToggleSupplement={onToggleSupplement}
      />

      {/* ── 4. TWICE-WEEKLY BLOOD PRESSURE TRACKER ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#F0F7FF] text-xs">🩺</span>
            <div>
              <h3 className="text-xs font-black text-[#192231]">
                Twice-Weekly BP Tracker
              </h3>
              <p className="text-[10px] text-[#7A8B9E]">
                Target: Log 2 readings per week
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
        <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#8F9EB3] uppercase tracking-wider">
              Weekly Schedule
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white border border-[#E2ECF7] text-[#192231]">
              {weeklyBPCount} / 2 Logs Done
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {allDays.map((day) => {
              const isLogged = daysLogged.includes(day);
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center py-1 rounded-xl border text-[10px] transition-all ${
                    isLogged
                      ? 'bg-[#FDF2F7] border-[#F9A8D4] text-[#DB2777] font-black'
                      : 'bg-white border-[#E2ECF7] text-[#94A3B8] font-medium'
                  }`}
                >
                  <span>{day}</span>
                  <span className={`w-1.5 h-1.5 mt-0.5 rounded-full ${isLogged ? 'bg-[#EA81AA]' : 'bg-[#E2ECF7]'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest Reading Display */}
        <div className="flex items-center justify-between px-1 text-xs pt-1">
          <div>
            <span className="text-[10px] font-bold text-[#8F9EB3] block">Latest Reading:</span>
            {latestBP ? (
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-sm font-black text-[#192231]">
                  {latestBP.systolic} / {latestBP.diastolic}
                </span>
                <span className="text-[10px] text-[#7A8B9E]">mmHg</span>
                <span className="text-[10px] text-[#8F9EB3] ml-1">({latestBP.dayOfWeek})</span>
              </div>
            ) : (
              <span className="text-xs text-[#8F9EB3]">No readings yet this week</span>
            )}
          </div>

          <button
            onClick={() => onNavigate('track')}
            className="px-3.5 py-1.5 rounded-full bg-[#192231] text-white text-[11px] font-bold shadow-xs hover:bg-[#2d3748] active:scale-95 transition-all cursor-pointer"
          >
            + New Log
          </button>
        </div>
      </section>

      {/* ── 5. QUICK ACCESS NAVIGATION GRID ── */}
      <section className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onNavigate('journey')}
          className="p-3.5 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs text-left hover:border-[#EA81AA] transition-all group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-[#FDF2F7] border border-[#FBCFE8] flex items-center justify-center text-[#EA81AA] mb-2 group-hover:scale-105 transition-transform">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-black text-[#192231]">My Journey</h4>
          <p className="text-[10px] text-[#7A8B9E] mt-0.5 leading-snug">
            Trimester milestones & 3D fetal evaluation
          </p>
        </button>

        <button
          onClick={() => onNavigate('track')}
          className="p-3.5 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs text-left hover:border-[#38BDF8] transition-all group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex items-center justify-center text-[#0284C7] mb-2 group-hover:scale-105 transition-transform">
            <HeartHandshake className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-black text-[#192231]">Care & Vitals</h4>
          <p className="text-[10px] text-[#7A8B9E] mt-0.5 leading-snug">
            BP cadence, kick counter & hospital bag
          </p>
        </button>

        <button
          onClick={() => onNavigate('records')}
          className="p-3.5 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs text-left hover:border-[#818CF8] transition-all group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-[#F5F3FF] border border-[#C4B5FD] flex items-center justify-center text-[#7C3AED] mb-2 group-hover:scale-105 transition-transform">
            <FolderHeart className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-black text-[#192231]">Records Vault</h4>
          <p className="text-[10px] text-[#7A8B9E] mt-0.5 leading-snug">
            Clinical scans, lab reports & documents
          </p>
        </button>

        <button
          onClick={() => onNavigate('learn')}
          className="p-3.5 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs text-left hover:border-[#F59E0B] transition-all group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-xl bg-[#FFFBEB] border border-[#FCD34D] flex items-center justify-center text-[#D97706] mb-2 group-hover:scale-105 transition-transform">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-black text-[#192231]">Learn Sanctuary</h4>
          <p className="text-[10px] text-[#7A8B9E] mt-0.5 leading-snug">
            Maternal nutrition, schemes & FAQs
          </p>
        </button>
      </section>
    </div>
  );
};

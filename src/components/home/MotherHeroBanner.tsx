import React, { useState } from 'react';
import { FetalDevelopmentWeek, UserProfile } from '../../types';
import { getPregnancyStageInfo } from '../../utils/pregnancyStage';

interface MotherHeroBannerProps {
  currentWeek: number;
  weekInfo: FetalDevelopmentWeek;
  currentUser?: UserProfile | null;
  onExploreJourney: () => void;
}

export const MotherHeroBanner: React.FC<MotherHeroBannerProps> = ({
  currentWeek,
  weekInfo,
  currentUser,
  onExploreJourney
}) => {
  const [tapHeart, setTapHeart] = useState(false);
  const [affirmationIndex, setAffirmationIndex] = useState(0);

  const affirmations = [
    "Mumma, you are doing so wonderful today! 🌸",
    "Baby feels your calm heartbeat and loves you. 💕",
    "Every day you are nourishing a beautiful miracle. ✨",
    "Rest, take a gentle pause, and breathe with your baby. 💧"
  ];

  const handleAvatarTap = () => {
    setTapHeart(true);
    setAffirmationIndex((prev) => (prev + 1) % affirmations.length);
    setTimeout(() => setTapHeart(false), 2400);
  };

  const stageInfo = getPregnancyStageInfo(currentWeek);

  const getBadgeStyle = (num: 1 | 2 | 3) => {
    if (num === 1) {
      return { badgeBg: 'bg-[#FDF2F7]', badgeBorder: 'border-[#FBCFE8]', badgeText: 'text-[#DB2777]' };
    }
    if (num === 2) {
      return { badgeBg: 'bg-[#F0F9FF]', badgeBorder: 'border-[#BAE6FD]', badgeText: 'text-[#0284C7]' };
    }
    return { badgeBg: 'bg-[#F5F3FF]', badgeBorder: 'border-[#DDD6FE]', badgeText: 'text-[#7C3AED]' };
  };

  const badgeStyle = getBadgeStyle(stageInfo.trimesterNumber);
  const progressPercent = Math.min(100, Math.round((currentWeek / 40) * 100));

  const dueDateStr = currentUser?.dueDate || currentUser?.patientProfile?.dueDate;
  let daysLeft: number;
  if (dueDateStr && dueDateStr.trim()) {
    const due = new Date(dueDateStr.trim());
    const today = new Date();
    const diffMs = due.getTime() - today.getTime();
    daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  } else {
    daysLeft = Math.max(0, (40 - currentWeek) * 7);
  }

  const displayName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Mumma';

  return (
    <section className="relative isolate rounded-[32px] p-5 bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] border border-[#E2ECF7] shadow-sm overflow-hidden transition-all duration-300">
      {/* ── Atmospheric Ambient Radiance ── */}
      <div className="absolute -top-16 -left-16 z-0 w-48 h-48 rounded-full bg-[#FCE7F3] blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 z-0 w-48 h-48 rounded-full bg-[#E0F2FE] blur-3xl opacity-60 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center">
        {/* Gestational Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#EA81AA] bg-white px-3 py-1 rounded-full border border-[#FBCFE8] shadow-2xs">
            Week {currentWeek} of 40
          </span>
          <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-2xs ${badgeStyle.badgeBg} ${badgeStyle.badgeBorder} ${badgeStyle.badgeText}`}>
            {stageInfo.trimesterName}
          </span>
        </div>

        {/* Maternal Headline */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#192231] flex items-center justify-center gap-2">
            <span>Hello, {displayName}!</span>
            <span className="text-xl">💗</span>
          </h1>
          <p className="text-xs text-[#475569] font-medium leading-relaxed mt-1">
            Baby is growing strong today. You're doing amazing, Mumma.
          </p>
        </div>

        {/* ── 3D PREGNANT WOMAN AVATAR ── */}
        <div className="relative shrink-0 w-full max-w-[260px] flex flex-col items-center justify-center my-1">
          {/* Floating Hearts Reaction when Avatar is tapped */}
          {tapHeart && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
              <span className="absolute -top-4 text-xl animate-sparkle">💖</span>
              <span className="absolute top-2 right-2 text-base animate-sparkle" style={{ animationDelay: '0.2s' }}>🌸</span>
              <span className="absolute -bottom-2 left-4 text-lg animate-sparkle" style={{ animationDelay: '0.3s' }}>✨</span>
              <span className="absolute top-1/2 -left-3 text-base animate-sparkle" style={{ animationDelay: '0.15s' }}>💕</span>
            </div>
          )}

          {/* Avatar Container */}
          <div
            onClick={handleAvatarTap}
            title="Tap Mumma avatar for maternal love 💕"
            className="relative z-20 w-48 h-56 rounded-[36px] overflow-hidden border-4 border-white shadow-md bg-gradient-to-b from-[#FDF2F7] via-white to-[#EBF5FE] cursor-pointer group transition-transform duration-300 hover:scale-[1.02] active:scale-95"
          >
            <img
              src="/mother-3d-avatar.jpg"
              alt="3D Pregnant Mother Avatar"
              className="w-full h-full object-cover object-top opacity-100 transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
            {/* Ambient Inner Shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#192231]/20 via-transparent to-transparent pointer-events-none" />

            {/* Subtle Floating Badge */}
            <div className="absolute z-30 bottom-2.5 left-2.5 right-2.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#FCE7F3] shadow-xs flex items-center justify-between pointer-events-none">
              <span className="text-[10px] font-black text-[#192231] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA81AA]" />
                Mumma & Baby
              </span>
              <span className="text-[9px] font-extrabold text-[#6FAFED] uppercase tracking-wider">
                Thriving ✨
              </span>
            </div>
          </div>

          <span className="text-[9px] text-[#8F9EB3] font-semibold mt-1.5">
            Tap avatar for daily affirmation 💗
          </span>
        </div>

        {/* Baby Size Comparison Pill */}
        <div className="w-full max-w-[340px] p-3 rounded-2xl bg-white border border-[#E8EFF7] shadow-2xs flex items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <span className="text-xl p-1.5 rounded-xl bg-[#FDF2F7] border border-[#FCE7F3] shrink-0">
              {weekInfo.fruitIllustrationUrl || '🥑'}
            </span>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8F9EB3] block">
                Baby Size Comparison
              </span>
              <span className="text-xs font-black text-[#192231]">
                Like a {weekInfo.fruitMetaphor} (~{weekInfo.approxLengthCm} cm)
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] font-bold text-[#8F9EB3] block">Due In</span>
            <span className="text-xs font-black text-[#6FAFED]">{daysLeft} days</span>
          </div>
        </div>

        {/* Tap Reaction Affirmation Bubble */}
        <p className="text-[11px] text-[#DB2777] font-semibold italic min-h-[1.25rem] flex items-center justify-center">
          <span>{affirmations[affirmationIndex]}</span>
        </p>

        {/* Primary CTA */}
        <div>
          <button
            onClick={onExploreJourney}
            className="px-6 py-2.5 rounded-full bg-[#192231] text-white text-xs font-black shadow-xs hover:bg-[#2d3748] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Continue Journey</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* ── GESTATIONAL PROGRESS BAR ── */}
      <div className="mt-4 pt-3 border-t border-[#F0F4FA] relative z-20 space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-[#8F9EB3]">Overall Gestational Progress</span>
          <span className="text-[#192231] font-black">{progressPercent}% Journey Completed</span>
        </div>
        <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#EA81AA] to-[#38BDF8] transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
};

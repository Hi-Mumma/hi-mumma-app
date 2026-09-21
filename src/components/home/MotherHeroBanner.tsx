import React, { useState } from 'react';
import { FetalDevelopmentWeek } from '../../types';

interface MotherHeroBannerProps {
  currentWeek: number;
  weekInfo: FetalDevelopmentWeek;
  onExploreJourney: () => void;
}

export const MotherHeroBanner: React.FC<MotherHeroBannerProps> = ({
  currentWeek,
  weekInfo,
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

  const getTrimester = (w: number) => {
    if (w <= 12) {
      return { num: 1, name: 'First Trimester', badgeBg: 'bg-[#FDF2F7]', badgeBorder: 'border-[#FBCFE8]', badgeText: 'text-[#DB2777]' };
    }
    if (w <= 24) {
      return { num: 2, name: 'Second Trimester', badgeBg: 'bg-[#F0F9FF]', badgeBorder: 'border-[#BAE6FD]', badgeText: 'text-[#0284C7]' };
    }
    return { num: 3, name: 'Third Trimester', badgeBg: 'bg-[#F5F3FF]', badgeBorder: 'border-[#DDD6FE]', badgeText: 'text-[#7C3AED]' };
  };

  const trimester = getTrimester(currentWeek);
  const progressPercent = Math.min(100, Math.round((currentWeek / 40) * 100));
  const daysLeft = Math.max(0, (40 - currentWeek) * 7);

  return (
    <section className="relative isolate min-h-[430px] rounded-[36px] p-5 pb-8 sm:p-7 sm:pb-9 bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] border border-[#E2ECF7] shadow-[0_20px_50px_rgba(234,129,170,0.14)] overflow-hidden transition-all duration-500">
      {/* ── Atmospheric Ambient Radiance ── */}
      <div className="absolute -top-16 -left-16 z-0 w-56 h-56 rounded-full bg-[#FCE7F3] blur-3xl opacity-75 pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 z-0 w-60 h-60 rounded-full bg-[#E0F2FE] blur-3xl opacity-80 pointer-events-none" />
      <div className="absolute inset-x-10 bottom-[-12px] z-0 h-24 rounded-full bg-white/70 blur-2xl pointer-events-none" />

      {/* Floating Sparkle Elements */}
      <div className="absolute top-4 right-1/3 z-0 text-sm opacity-40 pointer-events-none animate-pulse">✨</div>
      <div className="absolute bottom-8 left-1/4 z-0 text-xs opacity-30 pointer-events-none animate-pulse" style={{ animationDelay: '1.2s' }}>🌸</div>

      <div className="relative z-20 flex flex-col items-center gap-5">
        {/* ── LEFT COLUMN: GREETINGS, REASSURANCE, METRICS & CTA ── */}
        <div className="contents">
          <div className="relative z-20 order-1 w-full max-w-[340px] space-y-2 text-center">
            {/* Gestational Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-[#EA81AA] bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#FBCFE8] shadow-2xs">
                Week {currentWeek} of 40
              </span>
              <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border shadow-2xs ${trimester.badgeBg} ${trimester.badgeBorder} ${trimester.badgeText}`}>
                {trimester.name}
              </span>
            </div>

            {/* Maternal Headline */}
            <div className="pt-1">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#192231] flex items-center justify-center gap-2">
                <span>Hello, Mumma!</span>
                <span className="text-xl sm:text-2xl animate-pulse">💗</span>
              </h1>
              {/* Daily Motivation & Maternal Reassurance */}
              <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed mt-1">
                Baby is growing strong today. You're doing amazing, Mumma.
              </p>
            </div>
          </div>

          {/* Quick Care & Metaphor Pill */}
          <div className="relative z-20 order-4 w-full max-w-[340px] p-3 rounded-2xl bg-white/85 backdrop-blur-md border border-[#E9EFF7] shadow-2xs flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 rounded-xl bg-[#FDF2F7] border border-[#FCE7F3] shadow-2xs shrink-0">
                {weekInfo.fruitIllustrationUrl || '🥑'}
              </span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F9EB3] block">
                  Baby Size Comparison
                </span>
                <span className="text-xs font-black text-[#192231]">
                  Like a {weekInfo.fruitMetaphor} (~{weekInfo.approxLengthCm} cm)
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-bold text-[#8F9EB3] block">Due In</span>
              <span className="text-xs font-black text-[#6FAFED]">{daysLeft} days</span>
            </div>
          </div>

          {/* Primary CTA & Interactive Affirmation */}
          <div className="relative z-20 order-5 space-y-2 pt-1 text-center">
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={onExploreJourney}
                className="relative z-30 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#EA81AA] via-[#F472B6] to-[#38BDF8] text-white text-xs font-black shadow-md hover:shadow-lg hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Continue Journey</span>
                <span>→</span>
              </button>

              <span className="text-[11px] font-bold text-[#8F9EB3] inline-block">
                • Next: Anatomy & Vitals
              </span>
            </div>

            {/* Tap Reaction Affirmation Bubble */}
            <p className="text-[11px] text-[#DB2777] font-semibold italic h-4 flex items-center justify-center gap-1">
              <span>{affirmations[affirmationIndex]}</span>
            </p>
          </div>
        </div>

        {/* ── RIGHT COLUMN: LARGE 3D PREGNANT WOMAN AVATAR (40–50% visual area) ── */}
        <div className="relative z-10 order-3 shrink-0 w-full max-w-[310px] flex flex-col items-center justify-center self-center">
          {/* Glowing Aura & Floating Hearts on Tap */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-[#FCE7F3] via-white to-[#E0F2FE] blur-xl opacity-90 pointer-events-none" />

          {/* Floating Hearts Reaction when Avatar is tapped */}
          {tapHeart && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
              <span className="absolute -top-4 text-xl animate-sparkle">💖</span>
              <span className="absolute top-2 right-2 text-base animate-sparkle" style={{ animationDelay: '0.2s' }}>🌸</span>
              <span className="absolute -bottom-2 left-4 text-lg animate-sparkle" style={{ animationDelay: '0.3s' }}>✨</span>
              <span className="absolute top-1/2 -left-3 text-base animate-sparkle" style={{ animationDelay: '0.15s' }}>💕</span>
            </div>
          )}

          {/* Avatar Container with gentle floating / breathing motion */}
          <div
            onClick={handleAvatarTap}
            title="Tap Mumma avatar for maternal love 💕"
            className="relative z-20 w-56 h-64 sm:w-64 sm:h-72 rounded-[45%] overflow-visible border-4 border-white/80 shadow-[0_24px_45px_rgba(25,34,49,0.18)] bg-gradient-to-b from-[#FDF2F7] via-white to-[#EBF5FE] cursor-pointer group animate-hero-reveal animate-gentle-breathe transition-transform duration-500 hover:scale-[1.02] active:scale-98"
          >
            <div className="absolute inset-0 overflow-hidden rounded-[45%]">
              <img
                src="/mother-3d-avatar.jpg"
                alt="3D Pregnant Mother Avatar"
                className="w-full h-full object-cover object-top opacity-100 transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  // Fallback gracefully
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />

              {/* Soft Ambient Inner Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#192231]/30 via-transparent to-white/20 pointer-events-none" />
            </div>

            {/* Decorative Floating Label */}
            <div className="absolute z-30 bottom-2.5 left-2.5 right-2.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#FCE7F3] shadow-xs flex items-center justify-between pointer-events-none">
              <span className="text-[10px] font-black text-[#192231] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA81AA] animate-pulse" />
                Mumma & Baby
              </span>
              <span className="text-[9px] font-extrabold text-[#6FAFED] uppercase tracking-wider">
                Thriving ✨
              </span>
            </div>
          </div>

          <span className="relative z-20 text-[9px] text-[#8F9EB3] font-semibold mt-1.5 sm:mt-2">
            Tap avatar for daily affirmation 💗
          </span>
        </div>
      </div>

      {/* ── GESTATIONAL PROGRESS BAR ── */}
      <div className="mt-5 pt-3 border-t border-[#F0F4FA] relative z-20 space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-[#8F9EB3]">Overall Gestational Progress</span>
          <span className="text-[#192231] font-black">{progressPercent}% Journey Completed</span>
          <button
            onClick={onExploreJourney}
            className="text-[#6FAFED] hover:text-[#0284C7] font-bold transition-colors cursor-pointer"
          >
            Full Roadmap →
          </button>
        </div>
        <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#F472B6] via-[#EA81AA] to-[#38BDF8] transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </section>
  );
};

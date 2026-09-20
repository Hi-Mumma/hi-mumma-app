import React, { useState } from 'react';
import { DailySupplements } from '../../types';

interface InteractiveBabyReminderProps {
  supplements: DailySupplements;
  onToggleSupplement: (key: keyof DailySupplements) => void;
}

export const InteractiveBabyReminder: React.FC<InteractiveBabyReminderProps> = ({
  supplements,
  onToggleSupplement
}) => {
  const [manualState, setManualState] = useState<'auto' | 'happy' | 'approaching' | 'overdue'>('auto');
  const [celebrationActive, setCelebrationActive] = useState(false);

  const completedCount = Object.values(supplements).filter(Boolean).length;
  const totalCount = 3;

  // Derive state if in 'auto' mode
  let currentState: 'happy' | 'approaching' | 'overdue';
  if (manualState !== 'auto') {
    currentState = manualState;
  } else if (completedCount === totalCount) {
    currentState = 'happy';
  } else if (completedCount === 0) {
    currentState = 'overdue';
  } else {
    currentState = 'approaching';
  }

  const handleTakeNext = () => {
    let targetKey: keyof DailySupplements | null = null;
    if (!supplements.folicAcid) targetKey = 'folicAcid';
    else if (!supplements.iron) targetKey = 'iron';
    else if (!supplements.calcium) targetKey = 'calcium';

    if (targetKey) {
      onToggleSupplement(targetKey);
      setCelebrationActive(true);
      setTimeout(() => setCelebrationActive(false), 2600);
    }
  };

  const supplementList = [
    { key: 'folicAcid' as const, name: 'Folic Acid', time: '8:00 AM', desc: 'Neural tube development', icon: '💊', checked: supplements.folicAcid },
    { key: 'iron' as const, name: 'IFA Tablet', time: '2:00 PM', desc: 'Iron + Folic Acid', icon: '🩸', checked: supplements.iron },
    { key: 'calcium' as const, name: 'Calcium', time: '8:00 PM', desc: 'Bone & skeletal density', icon: '🦴', checked: supplements.calcium }
  ];

  return (
    <section className="relative rounded-[32px] p-5 bg-white border border-[#E2ECF7] shadow-[0_12px_36px_rgba(25,34,49,0.06)] overflow-hidden transition-all duration-500">
      {/* Background Soft Gradients (Dual Baby-Pink + Light Baby-Blue) */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-50 pointer-events-none transition-all duration-700 ${
          currentState === 'happy' ? 'bg-[#FCE7F3]' : currentState === 'approaching' ? 'bg-[#FEF3C7]' : 'bg-[#E0F2FE]'
        }`}
      />
      <div
        className={`absolute -bottom-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-50 pointer-events-none transition-all duration-700 ${
          currentState === 'happy' ? 'bg-[#E0F2FE]' : currentState === 'approaching' ? 'bg-[#FCE7F3]' : 'bg-[#FEE2E2]'
        }`}
      />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-[#FDF2F7] text-xs">⏰</span>
          <div>
            <h3 className="text-xs font-black text-[#192231] tracking-tight">
              Prenatal Supplement Reminder
            </h3>
            <p className="text-[10px] text-[#7A8B9E]">
              {completedCount} of {totalCount} completed today
            </p>
          </div>
        </div>

        {/* State Badge */}
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border transition-all ${
              currentState === 'happy'
                ? 'bg-[#FDF2F7] text-[#DB2777] border-[#FBCFE8]'
                : currentState === 'approaching'
                ? 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                : 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
            }`}
          >
            {currentState === 'happy' ? 'Thriving ✨' : currentState === 'approaching' ? 'Due Soon ⏳' : 'Overdue ⚠️'}
          </span>
        </div>
      </div>

      {/* ── THE VISUAL CENTERPIECE: SAME BABY CHARACTER (3–6 MONTHS OLD) ── */}
      <div className="relative z-10 flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#FDF9FB] via-white to-[#F2F7FD] border border-[#E8EFF7] shadow-inner mb-4">
        {/* Celebration Sparkles when completed */}
        {celebrationActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
            <span className="absolute top-2 left-6 text-lg animate-sparkle">💖</span>
            <span className="absolute top-4 right-8 text-base animate-sparkle" style={{ animationDelay: '0.2s' }}>✨</span>
            <span className="absolute bottom-4 left-10 text-base animate-sparkle" style={{ animationDelay: '0.4s' }}>🌟</span>
            <span className="absolute bottom-2 right-6 text-lg animate-sparkle" style={{ animationDelay: '0.3s' }}>💗</span>
          </div>
        )}

        {/* Baby Character Viewport */}
        <div
          className={`relative w-32 h-32 flex items-center justify-center transition-all duration-700 ${
            currentState === 'happy'
              ? 'animate-baby-bounce animate-gentle-breathe'
              : currentState === 'overdue'
              ? 'animate-baby-tremble'
              : 'animate-head-tilt animate-gentle-breathe'
          }`}
        >
          {/* Consistent Baby Character Rendered in High-End 3D Animated Style */}
          <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-lg overflow-visible">
            <defs>
              {/* Soft realistic baby skin tone */}
              <radialGradient id="babySkin" cx="50%" cy="40%" r="55%">
                <stop offset="0%" stopColor="#FFF2EA" />
                <stop offset="70%" stopColor="#FFE1D2" />
                <stop offset="100%" stopColor="#F8CEBC" />
              </radialGradient>

              {/* Rosy Chubby Cheeks */}
              <radialGradient id="babyCheek" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF8B9E" stopOpacity="0.65" />
                <stop offset="60%" stopColor="#FFA6B5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFA6B5" stopOpacity="0" />
              </radialGradient>

              {/* Pastel Pink + Baby Blue Onesie */}
              <linearGradient id="babyOnesie" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#E0F2FE" />
                <stop offset="50%" stopColor="#FCE7F3" />
                <stop offset="100%" stopColor="#BAE6FD" />
              </linearGradient>

              {/* Onesie Collar Trim */}
              <linearGradient id="onesieTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>

              {/* Eye Iris Depth */}
              <radialGradient id="irisGrad" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#4A3428" />
                <stop offset="60%" stopColor="#2E1B10" />
                <stop offset="100%" stopColor="#150B06" />
              </radialGradient>
            </defs>

            {/* ── BABY BODY & ONESIE (3–6 Months Proportions) ── */}
            <g id="baby-body">
              {/* Onesie Torso */}
              <path
                d="M40,110 Q80,96 120,110 Q132,148 108,154 Q80,157 52,154 Q28,148 40,110 Z"
                fill="url(#babyOnesie)"
                stroke="#CDE3F7"
                strokeWidth="1.5"
              />

              {/* Pastel Collar Accent */}
              <path
                d="M62,106 Q80,116 98,106"
                fill="none"
                stroke="url(#onesieTrim)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />

              {/* Tiny Cute Heart Badge on Chest */}
              <path
                d="M75,124 C75,120 78.5,117.5 81,120 C83.5,117.5 87,120 87,124 C87,128.5 81,132 81,132 C81,132 75,128.5 75,124 Z"
                fill="#EA81AA"
              />

              {/* Chubby Baby Hands */}
              <circle cx="36" cy="118" r="9.5" fill="url(#babySkin)" stroke="#F2C1AF" strokeWidth="1.2" />
              <circle cx="124" cy="118" r="9.5" fill="url(#babySkin)" stroke="#F2C1AF" strokeWidth="1.2" />
            </g>

            {/* ── BABY HEAD (Same Base for All States) ── */}
            <g id="baby-head">
              {/* Cute Round Head */}
              <circle cx="80" cy="66" r="45" fill="url(#babySkin)" stroke="#F2C1AF" strokeWidth="1.5" />

              {/* Soft Baby Ears */}
              <circle cx="33" cy="68" r="9" fill="url(#babySkin)" stroke="#F2C1AF" strokeWidth="1.2" />
              <circle cx="33" cy="68" r="5" fill="#FFAE9E" opacity="0.4" />
              <circle cx="127" cy="68" r="9" fill="url(#babySkin)" stroke="#F2C1AF" strokeWidth="1.2" />
              <circle cx="127" cy="68" r="5" fill="#FFAE9E" opacity="0.4" />

              {/* Wispy Natural Baby Hair Strands */}
              <path
                d="M77,21 Q81,12 85,17 Q83,23 77,21"
                fill="none"
                stroke="#8A502D"
                strokeWidth="2.8"
                strokeLinecap="round"
              />
              <path
                d="M84,18 Q89,13 91,19"
                fill="none"
                stroke="#A2633A"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Soft Chubby Rosy Cheeks */}
              <ellipse cx="52" cy="76" rx="10" ry="7.5" fill="url(#babyCheek)" />
              <ellipse cx="108" cy="76" rx="10" ry="7.5" fill="url(#babyCheek)" />

              {/* Cute Button Nose */}
              <circle cx="80" cy="69" r="2.8" fill="#F8B19E" />
              <ellipse cx="79.5" cy="68.2" rx="1" ry="0.6" fill="#FFFFFF" opacity="0.6" />

              {/* ════════════════════════════════════════════════════════════
                  STATE 1 — HAPPY (Smiling, Blinking, Happy Eyes)
                 ════════════════════════════════════════════════════════════ */}
              {currentState === 'happy' && (
                <g id="state-happy">
                  {/* Happy Arched Eyes with Natural Blinking */}
                  <g className="animate-blink" style={{ transformOrigin: '80px 58px' }}>
                    <path
                      d="M51,57 Q61,48 71,57"
                      fill="none"
                      stroke="#3E2723"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M89,57 Q99,48 109,57"
                      fill="none"
                      stroke="#3E2723"
                      strokeWidth="3.4"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Cheerful Eyebrows */}
                  <path d="M53,46 Q61,42 69,46" fill="none" stroke="#A2633A" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M91,46 Q99,42 107,46" fill="none" stroke="#A2633A" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Big Joyful Open Smile with Baby Tongue */}
                  <path
                    d="M66,77 Q80,94 94,77 Z"
                    fill="#BE123C"
                    stroke="#3E2723"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M72,77 Q80,85 88,77"
                    fill="#FDA4AF"
                  />
                </g>
              )}

              {/* ════════════════════════════════════════════════════════════
                  STATE 2 — REMINDER APPROACHING (Concerned, Playful, Looking at reminder)
                 ════════════════════════════════════════════════════════════ */}
              {currentState === 'approaching' && (
                <g id="state-approaching">
                  {/* Inquisitive / Playful Eyes Looking Toward Reminder */}
                  <g id="approaching-eyes">
                    {/* Left Eye */}
                    <circle cx="61" cy="56" r="7.5" fill="url(#irisGrad)" />
                    <circle cx="63" cy="54" r="2.8" fill="#FFFFFF" />
                    <circle cx="60" cy="58" r="1.2" fill="#FFFFFF" opacity="0.8" />

                    {/* Right Eye */}
                    <circle cx="99" cy="56" r="7.5" fill="url(#irisGrad)" />
                    <circle cx="101" cy="54" r="2.8" fill="#FFFFFF" />
                    <circle cx="98" cy="58" r="1.2" fill="#FFFFFF" opacity="0.8" />
                  </g>

                  {/* Inquisitive Arched Eyebrows (Slightly tilted) */}
                  <path d="M51,46 Q61,41 71,45" fill="none" stroke="#A2633A" strokeWidth="2.2" strokeLinecap="round" />
                  <path d="M89,45 Q99,41 109,48" fill="none" stroke="#A2633A" strokeWidth="2.2" strokeLinecap="round" />

                  {/* Cute Soft 'O' Pout Mouth */}
                  <ellipse cx="80" cy="80" rx="4.2" ry="4.8" fill="#BE123C" stroke="#3E2723" strokeWidth="1.4" />
                </g>
              )}

              {/* ════════════════════════════════════════════════════════════
                  STATE 3 — OVERDUE (Crying, Watery Eyes, Tears, Trembling)
                 ════════════════════════════════════════════════════════════ */}
              {currentState === 'overdue' && (
                <g id="state-overdue">
                  {/* Closed Tight Crying Eyes */}
                  <path
                    d="M51,60 Q61,68 71,60"
                    fill="none"
                    stroke="#3E2723"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M89,60 Q99,68 109,60"
                    fill="none"
                    stroke="#3E2723"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                  />

                  {/* Sad Downward Angled Brows */}
                  <path d="M51,48 Q61,53 71,50" fill="none" stroke="#A2633A" strokeWidth="2.4" strokeLinecap="round" />
                  <path d="M89,50 Q99,53 109,48" fill="none" stroke="#A2633A" strokeWidth="2.4" strokeLinecap="round" />

                  {/* Downturned Trembling Crying Mouth */}
                  <path
                    d="M66,85 Q80,72 94,85 Q80,91 66,85 Z"
                    fill="#991B1B"
                    stroke="#3E2723"
                    strokeWidth="1.6"
                  />

                  {/* Visible Falling Blue Teardrops */}
                  <circle cx="48" cy="66" r="4" fill="#38BDF8" className="animate-tear-left filter drop-shadow-sm" />
                  <circle cx="112" cy="66" r="4" fill="#38BDF8" className="animate-tear-right filter drop-shadow-sm" />
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* Microcopy Callout Strictly Following Requirements */}
        <div className="text-center mt-2 space-y-0.5">
          <p className="text-sm font-black text-[#192231]">
            {currentState === 'happy' && 'Yay, Mumma! 💗'}
            {currentState === 'approaching' && "Mumma, don't forget! 🥺"}
            {currentState === 'overdue' && 'Mummaaa… you forgot! 🥺'}
          </p>
          <p className="text-[11px] text-[#5A677D] max-w-[260px] leading-relaxed">
            {currentState === 'happy' && 'All daily nutrients active! A healthier tomorrow for us both.'}
            {currentState === 'approaching' && 'Time for your prenatal supplements! Baby is growing every second.'}
            {currentState === 'overdue' && 'Your IFA Tablet (Iron + Folic Acid) protects baby’s growth. Please take it now.'}
          </p>
        </div>

        {/* Primary "Take it now" Action Button */}
        {completedCount < totalCount && (
          <button
            onClick={handleTakeNext}
            className="mt-3 px-6 py-2 rounded-full bg-gradient-to-r from-[#EA81AA] to-[#F472B6] text-white text-xs font-black shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Take it now</span>
            <span>💗</span>
          </button>
        )}
      </div>

      {/* ── SUPPLEMENT INTERACTION CHECKLIST (Iron, Folic Acid, Calcium) ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
            Today's Supplements
          </span>
          <span className="text-[10px] font-semibold text-[#8F9EB3]">Tap to mark taken</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {supplementList.map((item) => (
            <button
              key={item.key}
              onClick={() => onToggleSupplement(item.key)}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between sm:flex-col sm:items-start ${
                item.checked
                  ? 'bg-[#FDF2F7] border-[#F9A8D4] text-[#192231] shadow-xs'
                  : 'bg-[#F8FAFD] border-[#E8EFF7] text-[#7A8B9E] hover:border-[#6FAFED]'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{item.icon}</span>
                  <span className="text-xs font-black text-[#192231]">{item.name}</span>
                </div>
                <span className="text-[9px] font-bold text-[#6FAFED] block">{item.time}</span>
                <span className="text-[8px] text-[#7A8B9E] block">{item.desc}</span>
              </div>

              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                  item.checked
                    ? 'bg-[#EA81AA] text-white shadow-xs'
                    : 'border-2 border-[#CBD5E1] text-transparent hover:border-[#6FAFED]'
                }`}
              >
                ✓
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Character State Preview Switcher */}
      <div className="mt-3 pt-2 border-t border-[#F0F4FA] flex items-center justify-between text-[9px] text-[#8F9EB3]">
        <span>Baby Character Preview:</span>
        <div className="flex gap-1">
          <button
            onClick={() => setManualState('happy')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              manualState === 'happy' ? 'bg-[#FCE7F3] text-[#DB2777] font-bold' : 'hover:text-[#192231]'
            }`}
          >
            Happy
          </button>
          <button
            onClick={() => setManualState('approaching')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              manualState === 'approaching' ? 'bg-[#FEF3C7] text-[#D97706] font-bold' : 'hover:text-[#192231]'
            }`}
          >
            Approaching
          </button>
          <button
            onClick={() => setManualState('overdue')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              manualState === 'overdue' ? 'bg-[#FEE2E2] text-[#DC2626] font-bold' : 'hover:text-[#192231]'
            }`}
          >
            Overdue
          </button>
          <button
            onClick={() => setManualState('auto')}
            className={`px-2 py-0.5 rounded-md transition-colors ${
              manualState === 'auto' ? 'bg-[#E0F2FE] text-[#0284C7] font-bold' : 'hover:text-[#192231]'
            }`}
          >
            Auto
          </button>
        </div>
      </div>
    </section>
  );
};

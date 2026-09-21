import React, { useState } from 'react';

interface TrimesterRoadmapProps {
  currentWeek: number;
  onSelectWeek: (week: number) => void;
}

interface RoadmapStage {
  id: string;
  phaseName: string;
  weekRange: string;
  subtitle: string;
  status: 'completed' | 'current' | 'upcoming';
  accentColor: string;
  bgGradient: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  keyMilestones: string[];
  keyTests: string[];
  supplements: string[];
  sampleWeek: number;
}

export const TrimesterRoadmap: React.FC<TrimesterRoadmapProps> = ({
  currentWeek,
  onSelectWeek
}) => {
  const [expandedStage, setExpandedStage] = useState<string>(() => {
    if (currentWeek <= 12) return 't1';
    if (currentWeek <= 26) return 't2';
    if (currentWeek <= 40) return 't3';
    return 'delivery';
  });

  const stages: RoadmapStage[] = [
    {
      id: 'start',
      phaseName: 'Start of Journey',
      weekRange: 'Weeks 0–4',
      subtitle: 'Conception & Implantation Genesis',
      status: currentWeek >= 4 ? 'completed' : 'current',
      accentColor: '#EA81AA',
      bgGradient: 'from-[#FFF5F8] to-[#FFFFFF]',
      borderColor: 'border-[#FBCFE8]',
      badgeBg: 'bg-[#FDF2F7]',
      badgeText: 'text-[#DB2777]',
      icon: '✨',
      keyMilestones: ['Blastocyst implantation', 'Cellular differentiation', 'Early hCG elevation'],
      keyTests: ['Urine Pregnancy Test', 'Early Consultation'],
      supplements: ['Folic Acid (400 mcg daily)'],
      sampleWeek: 4
    },
    {
      id: 't1',
      phaseName: 'First Trimester',
      weekRange: 'Weeks 1–12',
      subtitle: 'Building the Foundation & Neural Genesis',
      status: currentWeek > 12 ? 'completed' : currentWeek >= 1 ? 'current' : 'upcoming',
      accentColor: '#F472B6',
      bgGradient: 'from-[#FDF2F7] via-white to-[#FCE7F3]/40',
      borderColor: 'border-[#F9A8D4]',
      badgeBg: 'bg-[#FDF2F7]',
      badgeText: 'text-[#DB2777]',
      icon: '🌱',
      keyMilestones: ['Embryonic heart flicker detected', 'Neural tube closure', 'Tiny limb buds develop into fingers'],
      keyTests: ['First Ultrasound (Dating & Viability)', 'CBC & Blood Group/Rh', 'Thyroid (TSH)', 'Urine Routine'],
      supplements: ['Folic Acid (mandatory)', 'Vitamin D & Prenatal Multivitamin'],
      sampleWeek: 8
    },
    {
      id: 't2',
      phaseName: 'Second Trimester',
      weekRange: 'Weeks 13–26',
      subtitle: 'Growing Stronger & First Flutter Kicks',
      status: currentWeek > 26 ? 'completed' : currentWeek >= 13 ? 'current' : 'upcoming',
      accentColor: '#38BDF8',
      bgGradient: 'from-[#F0F9FF] via-white to-[#E0F2FE]/40',
      borderColor: 'border-[#93C5FD]',
      badgeBg: 'bg-[#F0F9FF]',
      badgeText: 'text-[#0284C7]',
      icon: '🤍',
      keyMilestones: ['Quickening (first baby flutter kicks)', 'Auditory perception of maternal voice', 'Vernix coating shields delicate skin'],
      keyTests: ['Third Ultrasound (Anomaly Scan)', 'Glucose Tolerance Test (GTT)', 'Mid-Pregnancy CBC', 'Tetanus Toxoid / Tdap'],
      supplements: ['IFA Tablet (Iron + Folic Acid)', 'Calcium (500mg twice daily)'],
      sampleWeek: 20
    },
    {
      id: 't3',
      phaseName: 'Third Trimester',
      weekRange: 'Weeks 27–40',
      subtitle: 'Maturation, Brainwaves & Final Arrival Prep',
      status: currentWeek > 40 ? 'completed' : currentWeek >= 27 ? 'current' : 'upcoming',
      accentColor: '#818CF8',
      bgGradient: 'from-[#F5F3FF] via-white to-[#EDE9FE]/40',
      borderColor: 'border-[#C4B5FD]',
      badgeBg: 'bg-[#F5F3FF]',
      badgeText: 'text-[#6D28D9]',
      icon: '🌟',
      keyMilestones: ['Rapid fetal weight gain', 'Lungs synthesize vital surfactant', 'Cephalic (head down) resting posture'],
      keyTests: ['Fourth Ultrasound (Growth & Biophysical Assessment)', 'CBC (Hemoglobin)', 'Group B Strep (GBS)', 'Non-Stress Test (NST)'],
      supplements: ['IFA Tablet (Iron + Folic Acid) & Calcium (continued)', 'Vitamin D3 (as advised)'],
      sampleWeek: 32
    },
    {
      id: 'delivery',
      phaseName: 'Delivery',
      weekRange: 'Week 40',
      subtitle: 'The Big Day • Welcoming Your Baby',
      status: currentWeek >= 40 ? 'current' : 'upcoming',
      accentColor: '#EA81AA',
      bgGradient: 'from-[#FFF1F2] via-white to-[#FFE4E6]/50',
      borderColor: 'border-[#FDA4AF]',
      badgeBg: 'bg-[#FFF1F2]',
      badgeText: 'text-[#E11D48]',
      icon: '👶',
      keyMilestones: ['Full term maturity', 'Cervical softening & effacement', 'Birth & initial skin-to-skin bond'],
      keyTests: ['Hospital Admission Triage', 'Fetal Heart Monitoring'],
      supplements: ['Pack Hospital Bag Checklist'],
      sampleWeek: 40
    },
    {
      id: 'postpartum',
      phaseName: 'Postpartum Window',
      weekRange: 'Days 1–42 Post-Delivery',
      subtitle: '42-Day Maternal Restorative Window (Puerperium)',
      status: 'upcoming',
      accentColor: '#10B981',
      bgGradient: 'from-[#ECFDF5] via-white to-[#D1FAE5]/40',
      borderColor: 'border-[#A7F3D0]',
      badgeBg: 'bg-[#ECFDF5]',
      badgeText: 'text-[#059669]',
      icon: '🌸',
      keyMilestones: ['Uterine involution & healing', 'Emotional wellness & partner bonding', '42-day maternal postnatal checkup'],
      keyTests: ['Postnatal Well-Woman Evaluation', 'PDD Emotional Wellbeing Check'],
      supplements: ['Postnatal Nutrition & IFA Tablet Support'],
      sampleWeek: 40
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-black text-[#192231] tracking-tight">
            Maternal Journey Roadmap
          </h2>
          <p className="text-[10px] text-[#7A8B9E]">
            Chronological stages from conception to postpartum recovery
          </p>
        </div>
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white border border-[#E2ECF7] text-[#192231] shadow-xs">
          Week {currentWeek} Active
        </span>
      </div>

      {/* ── VERTICAL TIMELINE ROADMAP ── */}
      <div className="relative pl-6 space-y-4">
        {/* Continuous Connecting Line (Pink to Blue Gradient) */}
        <div className="absolute top-4 bottom-6 left-[18px] w-1 bg-gradient-to-b from-[#F472B6] via-[#38BDF8] to-[#A7F3D0] rounded-full pointer-events-none opacity-70" />

        {stages.map((stage, idx) => {
          const isExpanded = expandedStage === stage.id;
          const isCurrent = stage.status === 'current';
          const isCompleted = stage.status === 'completed';

          return (
            <div key={stage.id} className="relative group">
              {/* Roadmap Timeline Node Icon */}
              <button
                onClick={() => setExpandedStage(isExpanded ? '' : stage.id)}
                className={`absolute -left-6 top-3 w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all duration-300 z-20 cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-tr from-[#EA81AA] to-[#6FAFED] text-white shadow-[0_0_16px_rgba(234,129,170,0.6)] scale-110 ring-4 ring-white'
                    : isCompleted
                    ? 'bg-white border-2 border-[#10B981] text-[#10B981] shadow-xs'
                    : 'bg-white border border-[#CBD5E1] text-[#94A3B8] opacity-80'
                }`}
              >
                {isCompleted ? '✓' : stage.icon}
              </button>

              {/* Stage Card */}
              <div
                className={`ml-5 rounded-3xl border transition-all duration-300 overflow-hidden shadow-xs ${
                  isCurrent
                    ? `bg-gradient-to-br ${stage.bgGradient} ${stage.borderColor} shadow-[0_12px_28px_rgba(25,34,49,0.06)] ring-2 ring-[#EA81AA]/20`
                    : `bg-white border-[#E8EFF7] hover:border-[#6FAFED]`
                }`}
              >
                {/* Header Summary */}
                <div
                  onClick={() => setExpandedStage(isExpanded ? '' : stage.id)}
                  className="p-4 cursor-pointer flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${stage.badgeBg} ${stage.badgeText}`}>
                        {stage.weekRange}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-extrabold text-[#EA81AA] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EA81AA] animate-ping" />
                          You are here
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[9px] font-bold text-[#10B981]">
                          Completed
                        </span>
                      )}
                    </div>

                    <h3 className="text-xs font-black text-[#192231] tracking-tight">
                      {stage.phaseName}
                    </h3>
                    <p className="text-[10px] text-[#7A8B9E] font-medium">
                      {stage.subtitle}
                    </p>
                  </div>

                  <span className={`text-xs text-[#8F9EB3] transition-transform duration-300 ${isExpanded ? 'rotate-180 text-[#192231]' : ''}`}>
                    ▼
                  </span>
                </div>

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-[#F0F4FA] space-y-3 animate-in fade-in duration-200">
                    {/* Key Milestones */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F9EB3] block">
                        Developmental Milestones:
                      </span>
                      <div className="space-y-1">
                        {stage.keyMilestones.map((m, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-[#334155]">
                            <span className="text-[#EA81AA] font-bold">•</span>
                            <span>{m}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Key Tests & Ultrasounds */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F9EB3] block">
                        Clinical Scans & Lab Panels:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {stage.keyTests.map((t, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-[#F0F7FF] text-[#0284C7] border border-[#BAE6FD] px-2 py-0.5 rounded-lg"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Supplements */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F9EB3] block">
                        Prescribed Nutrition:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {stage.supplements.map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-[#FDF2F7] text-[#DB2777] border border-[#FBCFE8] px-2 py-0.5 rounded-lg"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Jump Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => onSelectWeek(stage.sampleWeek)}
                        className="text-[11px] font-bold text-[#6FAFED] hover:text-[#0284C7] transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        Inspect Week {stage.sampleWeek} Visuals →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

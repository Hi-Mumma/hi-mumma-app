import React, { useState } from 'react';
import { trimesterVisualConfigs } from '../../mock/maternalData';
import { CinematicCanvasParticles } from './CinematicCanvasParticles';
import { StageVideoContainer } from './StageVideoContainer';
import { getTrimesterNumber } from '../../utils/pregnancyStage';

interface PregnancyVisualEvolutionProps {
  currentWeek: number;
  onSelectWeek?: (week: number) => void;
}

export const PregnancyVisualEvolution: React.FC<PregnancyVisualEvolutionProps> = ({
  currentWeek,
  onSelectWeek
}) => {
  const trimesterNum = getTrimesterNumber(currentWeek);
  const activeExperience = trimesterVisualConfigs[trimesterNum];

  const [selectedSubWeek, setSelectedSubWeek] = useState<number>(currentWeek);

  // Sync sub-stage when currentWeek changes
  const activeSubStage =
    activeExperience.subStages.find((s) => s.week === selectedSubWeek) ||
    activeExperience.subStages.find((s) => s.week <= currentWeek) ||
    activeExperience.subStages[0];

  const handleStageSelect = (w: number) => {
    setSelectedSubWeek(w);
    if (onSelectWeek) {
      onSelectWeek(w);
    }
  };

  return (
    <section className="relative rounded-[36px] p-5 bg-white border border-[#E8EFF7] shadow-[0_16px_40px_rgba(25,34,49,0.04)] overflow-hidden transition-all duration-500">
      {/* ── 1. HUD Telemetry Bar ── */}
      <div className="flex items-center justify-between mb-3 relative z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-black tracking-tight text-[#192231]">
              3D Fetal Visualizer • Week {currentWeek}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8F9EB3]" />
            <span className="text-xs font-bold text-[#6FAFED]">
              Trimester {trimesterNum}
            </span>
          </div>
          <p className="text-[10px] font-semibold text-[#8F9EB3]">
            Week {currentWeek} of 40 Developmental Visualization
          </p>
        </div>

        {/* Trimester Badge */}
        <div className="px-3 py-1 rounded-full bg-[#F3F8FE] border border-[#C7DFF9] text-[10px] font-extrabold uppercase tracking-wider text-[#6FAFED] shadow-xs">
          {activeExperience.weekRangeText}
        </div>
      </div>

      {/* ── 2. Atmospheric 3D Visual Viewport ── */}
      <div className="relative rounded-[28px] overflow-hidden border border-[#E9EFF7]">
        {/* Bioluminescent canvas particle system */}
        <CinematicCanvasParticles tintColor={activeExperience.colorPalette.particleTint} />

        {/* Video & Fallback viewport */}
        <StageVideoContainer experience={activeExperience} activeWeek={activeSubStage.week} />
      </div>

      {/* ── 3. Subtle Gestational Progress Gauge ── */}
      <div className="mt-3.5 mb-3">
        <div className="flex justify-between text-[10px] font-bold text-[#8F9EB3] mb-1">
          <span>0w</span>
          <span className="text-[#192231] font-extrabold">
            Progress ({Math.round((currentWeek / 40) * 100)}%)
          </span>
          <span>40w</span>
        </div>
        <div className="w-full h-2 bg-[#F0F4FA] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#F7D0E2] via-[#EA81AA] to-[#6FAFED] rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.min(100, Math.max(5, (currentWeek / 40) * 100))}%` }}
          />
        </div>
      </div>

      {/* ── 4. Sub-stage Milestone Scrubber (0–12w / 12–24w / 24–36w) ── */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A677D]">
            Trimester {trimesterNum} Stages
          </span>
          <span className="text-[10px] font-bold text-[#EA81AA]">Tap stage to explore</span>
        </div>

        <div className="grid grid-flow-col auto-cols-fr gap-1.5">
          {activeExperience.subStages.map((stage) => {
            const isSelected = stage.week === activeSubStage.week;
            return (
              <button
                key={stage.week}
                onClick={() => handleStageSelect(stage.week)}
                className={`py-2 px-1 rounded-2xl border text-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#FDF5F8] to-[#FBE8F0] border-[#EA81AA] text-[#192231] shadow-xs'
                    : 'bg-[#F8FAFD] border-[#EAEFF7] text-[#8F9EB3] hover:border-[#C7DFF9]'
                }`}
              >
                <p className="text-[10px] font-extrabold">{stage.label}</p>
                <span className="text-[8px] font-semibold block truncate opacity-85">
                  {stage.milestoneTitle.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detailed Developmental Insight Card */}
        {activeSubStage && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FAFBFD] to-[#F5F8FC] border border-[#E8EFF7] space-y-1 mt-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-[#192231]">{activeSubStage.milestoneTitle}</h4>
              <span className="text-[9px] font-mono font-bold text-[#6FAFED] bg-white px-2 py-0.5 rounded-full border border-[#E2ECF7]">
                {activeSubStage.approxDimensions}
              </span>
            </div>
            <p className="text-xs text-[#5A677D] leading-relaxed font-normal">
              {activeSubStage.fetalAnatomyFocus}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

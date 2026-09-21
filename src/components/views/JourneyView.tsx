import React, { useState } from 'react';
import {
  FetalDevelopmentWeek,
  PregnancyTestTrackingEntry,
  UltrasoundMilestoneTrackingEntry
} from '../../types';
import { PregnancyVisualEvolution } from '../visualizer/PregnancyVisualEvolution';
import { TrimesterRoadmap } from '../journey/TrimesterRoadmap';
import { TestsAndUltrasoundSection } from '../medical/TestsAndUltrasoundSection';

interface JourneyViewProps {
  currentWeek: number;
  weekInfo: FetalDevelopmentWeek;
  onSelectWeek: (week: number) => void;
  pregnancyTestTracking: PregnancyTestTrackingEntry[];
  onTogglePregnancyTest: (id: string) => void;
  ultrasoundMilestones: UltrasoundMilestoneTrackingEntry[];
  onToggleUltrasoundMilestone: (id: string) => void;
}

export const JourneyView: React.FC<JourneyViewProps> = ({
  currentWeek,
  weekInfo,
  onSelectWeek,
  pregnancyTestTracking,
  onTogglePregnancyTest,
  ultrasoundMilestones,
  onToggleUltrasoundMilestone
}) => {
  const [journeySection, setJourneySection] = useState<'visual' | 'roadmap' | 'scans'>('visual');

  return (
    <div className="space-y-4 pb-20">
      {/* View Mode Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E8EFF7] rounded-2xl shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'visual', label: '3D Fetal Evaluation', icon: '🧬' },
          { id: 'roadmap', label: 'Pregnancy Roadmap', icon: '🗺️' },
          { id: 'scans', label: 'Scans & Lab Panels', icon: '🩺' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setJourneySection(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              journeySection === tab.id
                ? 'bg-[#192231] text-white shadow-xs'
                : 'text-[#7A8B9E] hover:text-[#192231] hover:bg-[#F3F8FE]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── 1. 3D VISUAL EVOLUTION ENGINE ── */}
      {journeySection === 'visual' && (
        <div className="space-y-4">
          <PregnancyVisualEvolution
            currentWeek={currentWeek}
            onSelectWeek={onSelectWeek}
          />

          {/* Week-by-Week Developmental Breakdown */}
          <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">🌱</span>
                <h3 className="text-xs font-black text-[#192231]">
                  Week {currentWeek} Developmental Biology
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#EA81AA] bg-[#FDF2F7] px-2 py-0.5 rounded-full border border-[#FCE7F3]">
                ~{weekInfo.approxWeightGrams} grams
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#5A677D] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9]">
                <strong className="text-[#192231] block mb-0.5">Fetal Milestones:</strong>
                <p>{weekInfo.developmentalMilestone}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9]">
                <strong className="text-[#192231] block mb-0.5">Maternal Physiology:</strong>
                <p>{weekInfo.maternalBodyChanges}</p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── 2. SEPARATE PREGNANCY ROADMAP (Vertical Timeline) ── */}
      {journeySection === 'roadmap' && (
        <TrimesterRoadmap
          currentWeek={currentWeek}
          onSelectWeek={onSelectWeek}
        />
      )}

      {/* ── 3. TESTS & ULTRASOUNDS SECTION ── */}
      {journeySection === 'scans' && (
        <TestsAndUltrasoundSection
          pregnancyTestTracking={pregnancyTestTracking}
          onTogglePregnancyTest={onTogglePregnancyTest}
          ultrasoundMilestones={ultrasoundMilestones}
          onToggleUltrasoundMilestone={onToggleUltrasoundMilestone}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  BPLogEntry,
  BloodSugarEntry,
  WeekdayShort,
  FetalMovementEntry,
  PrenatalVisit,
  ChecklistItem
} from '../../types';
import { BPLogWorkspace } from '../bp/BPLogWorkspace';
import { BloodSugarWorkspace } from '../bloodsugar/BloodSugarWorkspace';

interface TrackViewProps {
  bpEntries: BPLogEntry[];
  daysLogged: WeekdayShort[];
  weeklyBPCount: number;
  onAddBPLog: (entry: Omit<BPLogEntry, 'id' | 'createdAt'>) => void;
  bloodSugarEntries: BloodSugarEntry[];
  onAddBloodSugar: (entry: Omit<BloodSugarEntry, 'id' | 'createdAt'>) => void;
  movementEntries: FetalMovementEntry[];
  onAddMovement: (count: number, durationMinutes: number) => void;
  visits: PrenatalVisit[];
  onAddOBQuestion: (visitId: string, question: string) => void;
  bagItems: ChecklistItem[];
  onToggleBagItem: (id: string) => void;
}

export const TrackView: React.FC<TrackViewProps> = ({
  bpEntries,
  daysLogged,
  weeklyBPCount,
  onAddBPLog,
  bloodSugarEntries,
  onAddBloodSugar,
  movementEntries,
  onAddMovement,
  visits,
  onAddOBQuestion,
  bagItems,
  onToggleBagItem
}) => {
  const [activeSection, setActiveSection] = useState<'bp' | 'sugar' | 'kicks' | 'visits' | 'bag'>('bp');

  // Kick counter active session local state
  const [kickCount, setKickCount] = useState<number>(0);
  const [isCounting, setIsCounting] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // OB question local state
  const [selectedVisitId, setSelectedVisitId] = useState<string>(visits[0]?.id || '');
  const [newQuestionText, setNewQuestionText] = useState<string>('');

  const handleStartKickSession = () => {
    setIsCounting(true);
    setKickCount(0);
    setStartTime(Date.now());
  };

  const handleRegisterKick = () => {
    const updated = kickCount + 1;
    setKickCount(updated);
    if (updated >= 10 && startTime) {
      const minutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));
      onAddMovement(updated, minutes);
      setIsCounting(false);
      setStartTime(null);
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestionText.trim() && selectedVisitId) {
      onAddOBQuestion(selectedVisitId, newQuestionText.trim());
      setNewQuestionText('');
    }
  };

  return (
    <div className="space-y-4">
      {/* Track Section Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E8EFF7] rounded-2xl shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'bp', label: 'Blood Pressure', icon: '🩺' },
          { id: 'sugar', label: 'Blood Sugar', icon: '🩸' },
          { id: 'kicks', label: 'Kick Counter', icon: '🦶' },
          { id: 'visits', label: 'Doctor Prep', icon: '📋' },
          { id: 'bag', label: 'Hospital Bag', icon: '🧳' }
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeSection === sec.id
                ? 'bg-[#192231] text-white shadow-xs'
                : 'text-[#5A677D] hover:text-[#192231] hover:bg-[#F3F8FE]'
            }`}
          >
            <span>{sec.icon}</span>
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* ── 1. BLOOD PRESSURE LOGGING WORKSPACE ── */}
      {activeSection === 'bp' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FBE8F0] to-[#E4EFFC] border border-white">
            <h3 className="text-xs font-black text-[#192231]">Twice-Weekly BP Tracker</h3>
            <p className="text-[10px] text-[#5A677D]">
              Record non-diagnostic blood pressure values twice a week to present clean logs to your doctor.
            </p>
          </div>
          <BPLogWorkspace
            entries={bpEntries}
            daysLogged={daysLogged}
            weeklyCount={weeklyBPCount}
            onAddLog={onAddBPLog}
          />
        </div>
      )}

      {/* ── 2. BLOOD SUGAR TRACKING WORKSPACE ── */}
      {activeSection === 'sugar' && (
        <BloodSugarWorkspace
          entries={bloodSugarEntries}
          onAddLog={onAddBloodSugar}
        />
      )}

      {/* ── 2. FETAL MOVEMENT KICK COUNTER ── */}
      {activeSection === 'kicks' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-[#192231]">Fetal Movement Counter</h3>
                <p className="text-[10px] text-[#8F9EB3]">Count to 10 session tracker</p>
              </div>
              <span className="text-[10px] font-bold text-[#EA81AA] bg-[#FBE8F0] px-2.5 py-1 rounded-full border border-[#F5D5E3]">
                Third Trimester Guide
              </span>
            </div>

            {!isCounting ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#FDF5F8] border border-[#FBE8F0] mx-auto flex items-center justify-center text-2xl">
                  🦶
                </div>
                <p className="text-xs text-[#5A677D] max-w-xs mx-auto">
                  Lie on your left side in a quiet setting. Count each kick, flutter, or swish until you reach 10.
                </p>
                <button
                  onClick={handleStartKickSession}
                  className="px-6 py-2.5 rounded-full bg-[#192231] text-white text-xs font-bold shadow-xs hover:bg-[#2e3b52] active:scale-95 transition-all"
                >
                  Start 10-Kick Session
                </button>
              </div>
            ) : (
              <div className="py-5 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-tr from-[#FDF5F8] to-[#FBE8F0] border-2 border-[#EA81AA] shadow-xs">
                  <span className="text-3xl font-black text-[#192231]">{kickCount} / 10</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#192231]">Session in Progress</p>
                  <p className="text-[10px] text-[#8F9EB3]">Tap button every time you perceive a movement</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleRegisterKick}
                    className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#EA81AA] to-[#6FAFED] text-white text-xs font-black shadow-md active:scale-95 transition-all"
                  >
                    + Tap on Kick Perceived
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Movement History */}
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-2">
            <h4 className="text-xs font-black text-[#192231] border-b border-[#F0F4FA] pb-2">
              Recent Movement Sessions
            </h4>
            <div className="space-y-2">
              {movementEntries.map((m) => (
                <div
                  key={m.id}
                  className="p-2.5 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-black text-[#192231]">{m.count} movements</span>
                    <span className="text-[#8F9EB3] ml-2">in {m.durationMinutes} mins</span>
                    {m.notes && <p className="text-[10px] text-[#5A677D] mt-0.5">{m.notes}</p>}
                  </div>
                  <span className="text-[10px] font-bold text-[#8F9EB3]">
                    {m.timestamp} {m.timeLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 3. DOCTOR QUESTIONS PREP LEDGER ── */}
      {activeSection === 'visits' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-[#192231]">OB-GYN Question Ledger</h3>
              <span className="text-[10px] font-bold text-[#6FAFED]">Clinical Prep</span>
            </div>

            <form onSubmit={handleAddQuestion} className="space-y-2">
              <label className="text-[11px] font-bold text-[#5A677D] block">
                Prepare a question for your next visit:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Is lower abdominal tightness normal after walks?"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  className="flex-1 bg-[#FAFBFD] border border-[#E2ECF7] rounded-xl py-2 px-3 text-xs text-[#192231] placeholder-[#A0B0C4] focus:outline-none focus:border-[#6FAFED]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#192231] text-white text-xs font-bold hover:bg-[#2d3950] active:scale-95 transition-all"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {visits.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#EA81AA]">
                    Week {v.weekDue} Visit
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    v.completed ? 'bg-[#EBFBF4] text-[#1FA662]' : 'bg-[#F3F8FE] text-[#6FAFED]'
                  }`}>
                    {v.completed ? 'Completed' : 'Upcoming'}
                  </span>
                </div>

                <h4 className="text-xs font-black text-[#192231]">{v.title}</h4>
                <p className="text-[11px] text-[#5A677D]">{v.description}</p>

                {v.doctorQuestions.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#F0F4FA] space-y-1">
                    <span className="text-[10px] font-bold text-[#8F9EB3] uppercase tracking-wider block">
                      Your Prepared Questions:
                    </span>
                    {v.doctorQuestions.map((q, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-[#192231]">
                        <span className="text-[#EA81AA] font-black">•</span>
                        <span>{q}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. HOSPITAL BAG PACKING CHECKLIST ── */}
      {activeSection === 'bag' && (
        <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
            <div>
              <h3 className="text-xs font-black text-[#192231]">Hospital Bag Essentials</h3>
              <p className="text-[10px] text-[#8F9EB3]">Preparedness for labor and hospital stay</p>
            </div>
            <span className="text-[10px] font-bold text-[#6FAFED]">
              {bagItems.filter((i) => i.completed).length} / {bagItems.length} Packed
            </span>
          </div>

          <div className="space-y-2">
            {bagItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onToggleBagItem(item.id)}
                className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] flex items-center justify-between cursor-pointer hover:border-[#6FAFED] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] font-bold ${
                    item.completed ? 'bg-[#EA81AA] border-[#EA81AA] text-white' : 'border-[#C7DFF9] bg-white'
                  }`}>
                    {item.completed && '✓'}
                  </div>
                  <span className={`text-xs ${item.completed ? 'line-through text-[#8F9EB3]' : 'font-medium text-[#192231]'}`}>
                    {item.label}
                  </span>
                </div>
                <span className="text-[9px] font-bold uppercase text-[#8F9EB3] bg-white px-2 py-0.5 rounded border border-[#E8EFF7]">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

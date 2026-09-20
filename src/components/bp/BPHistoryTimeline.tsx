import React from 'react';
import { BPLogEntry } from '../../types';

interface BPHistoryTimelineProps {
  entries: BPLogEntry[];
}

export const BPHistoryTimeline: React.FC<BPHistoryTimelineProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="p-6 rounded-3xl bg-white border border-[#E8EFF7] text-center space-y-2">
        <span className="text-3xl">🩺</span>
        <h5 className="text-xs font-bold text-[#192231]">No Readings Recorded Yet</h5>
        <p className="text-[11px] text-[#8F9EB3]">
          Log your twice-weekly readings above to maintain a clear record for your next doctor appointment.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <h4 className="text-xs font-black text-[#192231]">Blood Pressure History</h4>
        </div>
        <span className="text-[10px] font-bold text-[#8F9EB3]">
          {entries.length} {entries.length === 1 ? 'Reading' : 'Readings'}
        </span>
      </div>

      <div className="space-y-2.5">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] flex items-center justify-between hover:border-[#C7DFF9] transition-all"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-[#192231]">
                  {entry.systolic} / {entry.diastolic}
                </span>
                <span className="text-[10px] font-bold text-[#8F9EB3]">mmHg</span>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#F3F8FE] text-[#6FAFED] border border-[#C7DFF9]">
                  {entry.dayOfWeek}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#8F9EB3]">
                <span>{entry.date}</span>
                <span>•</span>
                <span>{entry.time}</span>
              </div>
              {entry.note && (
                <p className="text-[11px] text-[#5A677D] italic mt-0.5">"{entry.note}"</p>
              )}
            </div>

            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-[#E2ECF7] text-xs">
              🩺
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

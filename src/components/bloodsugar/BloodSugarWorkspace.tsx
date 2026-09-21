import React from 'react';
import { BloodSugarEntry } from '../../types';
import { BloodSugarLogForm } from './BloodSugarLogForm';
import { BloodSugarHistoryTimeline } from './BloodSugarHistoryTimeline';

interface BloodSugarWorkspaceProps {
  entries: BloodSugarEntry[];
  onAddLog: (entry: Omit<BloodSugarEntry, 'id' | 'createdAt'>) => void;
}

export const BloodSugarWorkspace: React.FC<BloodSugarWorkspaceProps> = ({
  entries,
  onAddLog
}) => {
  const latestEntry = entries[0];
  const trendEntries = [...entries].slice(0, 6).reverse();
  const trendMax = Math.max(...trendEntries.map((entry) => entry.value), 1);

  return (
    <div className="space-y-4">
      {/* ── Trend Summary Header ── */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] border border-[#E2ECF7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-white border border-[#FCE7F3] shadow-xs text-sm">
              🩸
            </span>
            <div>
              <h3 className="text-xs font-black text-[#192231]">Blood Glucose Log</h3>
              <p className="text-[10px] text-[#7A8B9E]">Antenatal metabolic tracking</p>
            </div>
          </div>
          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white border border-[#E2ECF7] text-[#192231]">
            {entries.length} {entries.length === 1 ? 'Record' : 'Records'} Logged
          </span>
        </div>

        {/* Quick Metric Tiles */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-3 rounded-2xl bg-white/80 border border-[#E8EFF7]">
            <span className="text-[9px] font-bold text-[#8F9EB3] uppercase tracking-wider block">
              Latest Reading
            </span>
            {latestEntry ? (
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-lg font-black text-[#192231]">{latestEntry.value}</span>
                <span className="text-[10px] text-[#8F9EB3]">mg/dL</span>
                <span className="text-[9px] font-semibold text-[#EA81AA] ml-1 uppercase">
                  ({latestEntry.type.replace('_', ' ')})
                </span>
              </div>
            ) : (
              <span className="text-xs text-[#8F9EB3] font-medium">None logged yet</span>
            )}
          </div>

          <div className="p-3 rounded-2xl bg-white/80 border border-[#E8EFF7]">
            <span className="text-[9px] font-bold text-[#8F9EB3] uppercase tracking-wider block">
              Latest Type
            </span>
            {latestEntry ? (
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-sm font-black text-[#192231] capitalize">{latestEntry.type.replace('_', ' ')}</span>
              </div>
            ) : (
              <span className="text-xs text-[#8F9EB3] font-medium">No type yet</span>
            )}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F9EB3]">Recent trend</span>
            <span className="text-[10px] text-[#6FAFED]">Personal log</span>
          </div>
          <div className="h-16 flex items-end gap-2">
            {trendEntries.length > 0 ? trendEntries.map((entry) => (
              <div key={entry.id} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                <span className="text-[9px] font-bold text-[#5A677D]">{entry.value}</span>
                <div
                  className="w-full max-w-8 rounded-t-lg bg-gradient-to-t from-[#6FAFED] to-[#F5B3D0] transition-all duration-500"
                  style={{ height: `${Math.max(18, (entry.value / trendMax) * 42)}px` }}
                />
              </div>
            )) : (
              <span className="text-[10px] text-[#8F9EB3]">Your logged values will appear here.</span>
            )}
          </div>
          <p className="text-[10px] text-[#5A677D]">Keep readings here for your own reference and routine clinical conversations.</p>
        </div>
      </div>

      {/* ── Log Input Form ── */}
      <BloodSugarLogForm onAddLog={onAddLog} />

      {/* ── Historical Timeline ── */}
      <BloodSugarHistoryTimeline entries={entries} />
    </div>
  );
};

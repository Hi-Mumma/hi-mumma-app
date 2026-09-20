import React from 'react';
import { BloodSugarEntry, BloodSugarType } from '../../types';

interface BloodSugarHistoryTimelineProps {
  entries: BloodSugarEntry[];
}

export const BloodSugarHistoryTimeline: React.FC<BloodSugarHistoryTimelineProps> = ({
  entries
}) => {
  const getTypeBadge = (type: BloodSugarType) => {
    switch (type) {
      case 'fasting':
        return { label: 'Fasting', bg: 'bg-[#FFF5F8] border-[#FBCFE8] text-[#DB2777]', icon: '🌅' };
      case 'post_meal_1h':
        return { label: '1-Hr Post-Meal', bg: 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7]', icon: '🍽️' };
      case 'post_meal_2h':
        return { label: '2-Hr Post-Meal', bg: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]', icon: '🥗' };
      case 'random':
      default:
        return { label: 'Random', bg: 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]', icon: '🍎' };
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3.5">
      <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs">📜</span>
          <h4 className="text-xs font-black text-[#192231] tracking-tight">
            Recorded Blood Sugar History
          </h4>
        </div>
        <span className="text-[10px] font-bold text-[#8F9EB3]">
          {entries.length} {entries.length === 1 ? 'Reading' : 'Readings'}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-6 text-[#8F9EB3] space-y-1">
          <p className="text-xs">No blood sugar entries recorded yet.</p>
          <p className="text-[10px]">Use the form above to log your first reading.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {entries.map((entry) => {
            const badge = getTypeBadge(entry.type);
            return (
              <div
                key={entry.id}
                className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] hover:border-[#E2ECF7] transition-all flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-extrabold ${badge.bg}`}
                    >
                      <span>{badge.icon}</span>
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[10px] font-semibold text-[#8F9EB3]">
                      {entry.date} at {entry.time}
                    </span>
                  </div>

                  {entry.note && (
                    <p className="text-[11px] text-[#5A677D] italic pl-1 leading-snug">
                      "{entry.note}"
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black text-[#192231]">
                      {entry.value}
                    </span>
                    <span className="text-[10px] font-semibold text-[#8F9EB3]">mg/dL</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Clinical Guidance Footnote */}
      <div className="pt-2 border-t border-[#F0F4FA] flex items-center justify-between text-[10px] text-[#8F9EB3]">
        <span>Export ready for OB-GYN consultations</span>
        <span className="font-semibold text-[#6FAFED]">Hi Mumma Records</span>
      </div>
    </div>
  );
};

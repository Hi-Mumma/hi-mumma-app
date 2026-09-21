import React, { useState } from 'react';
import { BPLogEntry, WeekdayShort } from '../../types';

interface BPLogFormProps {
  onAddLog: (entry: Omit<BPLogEntry, 'id' | 'createdAt'>) => void;
}

export const BPLogForm: React.FC<BPLogFormProps> = ({ onAddLog }) => {
  const [systolic, setSystolic] = useState<string>('118');
  const [diastolic, setDiastolic] = useState<string>('76');
  const [note, setNote] = useState<string>('');

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const dayMap: WeekdayShort[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const currentDayOfWeek = dayMap[now.getDay()];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sysNum = parseInt(systolic, 10);
    const diaNum = parseInt(diastolic, 10);

    if (isNaN(sysNum) || isNaN(diaNum) || sysNum <= 0 || diaNum <= 0) {
      return;
    }

    onAddLog({
      systolic: sysNum,
      diastolic: diaNum,
      date: dateStr,
      time: timeStr,
      dayOfWeek: currentDayOfWeek,
      note: note.trim() || undefined
    });

    setNote('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-[#FBE8F0] text-[#EA81AA] text-sm">🩺</span>
          <h4 className="text-sm font-black text-[#192231]">Log New Reading</h4>
        </div>
        <span className="text-[10px] font-bold text-[#8F9EB3]">
          {dateStr} • {timeStr}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Systolic */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#5A677D] block">
            Systolic (Upper)
          </label>
          <div className="relative">
            <input
              type="number"
              min="60"
              max="220"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-2xl py-2 px-3 text-base font-black text-[#192231] focus:bg-white focus:border-[#6FAFED] focus:outline-none transition-all"
            />
            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[#8F9EB3]">
              mmHg
            </span>
          </div>
        </div>

        {/* Diastolic */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-[#5A677D] block">
            Diastolic (Lower)
          </label>
          <div className="relative">
            <input
              type="number"
              min="40"
              max="140"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-2xl py-2 px-3 text-base font-black text-[#192231] focus:bg-white focus:border-[#6FAFED] focus:outline-none transition-all"
            />
            <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[#8F9EB3]">
              mmHg
            </span>
          </div>
        </div>
      </div>

      {/* Context Note */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#5A677D] block">
          Context Note (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Morning reading, left arm, rested 10 mins"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-2xl py-2 px-3 text-xs text-[#192231] placeholder-[#A0B0C4] focus:bg-white focus:border-[#6FAFED] focus:outline-none transition-all"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#EA81AA] to-[#6FAFED] text-white text-xs font-black tracking-wide shadow-[0_8px_20px_rgba(234,129,170,0.3)] hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
      >
        Save Reading to Maternal Log
      </button>

      {/* Explicit Non-Diagnostic Disclaimer */}
      <p className="text-[10px] text-center text-[#8F9EB3] font-medium leading-normal">
        Self-tracking log only. Does not provide medical assessment, diagnosis, or triage. Always share your readings directly with your healthcare provider.
      </p>
    </form>
  );
};

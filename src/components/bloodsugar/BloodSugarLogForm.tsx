import React, { useState } from 'react';
import { BloodSugarEntry, BloodSugarType } from '../../types';

interface BloodSugarLogFormProps {
  onAddLog: (entry: Omit<BloodSugarEntry, 'id' | 'createdAt'>) => void;
}

export const BloodSugarLogForm: React.FC<BloodSugarLogFormProps> = ({ onAddLog }) => {
  const [value, setValue] = useState<string>('92');
  const [type, setType] = useState<BloodSugarType>('fasting');
  const [note, setNote] = useState<string>('');
  const [justLogged, setJustLogged] = useState(false);

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const typeOptions: { id: BloodSugarType; label: string; sub: string; icon: string }[] = [
    { id: 'fasting', label: 'Fasting', sub: 'Before breakfast', icon: '🌅' },
    { id: 'post_meal_1h', label: '1-Hr Post-Meal', sub: '1 hr after meal', icon: '🍽️' },
    { id: 'post_meal_2h', label: '2-Hr Post-Meal', sub: '2 hrs after meal', icon: '🥗' },
    { id: 'random', label: 'Random / Snack', sub: 'Anytime reading', icon: '🍎' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numVal = parseFloat(value);
    if (isNaN(numVal) || numVal <= 0) return;

    onAddLog({
      value: Math.round(numVal),
      type,
      date: dateStr,
      time: timeStr,
      note: note.trim() || undefined
    });

    setNote('');
    setJustLogged(true);
    setTimeout(() => setJustLogged(false), 2200);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-5 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-4"
    >
      <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-2xl bg-[#FFF0F5] text-[#EA81AA] text-sm">🩸</span>
          <div>
            <h4 className="text-sm font-black text-[#192231]">Log Blood Glucose</h4>
            <p className="text-[10px] text-[#7A8B9E]">Antenatal metabolic tracking log</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-[#8F9EB3] bg-[#F8FAFD] px-2.5 py-1 rounded-full border border-[#E9EFF7]">
          {dateStr} • {timeStr}
        </span>
      </div>

      {/* Reading Value Input */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#5A677D] block">
          Blood Sugar Reading Value
        </label>
        <div className="relative flex items-center">
          <input
            type="number"
            min="30"
            max="400"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full pl-4 pr-16 py-3 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xl font-black text-[#192231] focus:bg-white focus:border-[#EA81AA] focus:ring-2 focus:ring-[#FCE7F3] outline-hidden transition-all"
            placeholder="e.g. 95"
            required
          />
          <span className="absolute right-4 text-xs font-black text-[#8F9EB3] pointer-events-none">
            mg/dL
          </span>
        </div>
      </div>

      {/* Reading Timing Type Selector */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-[#5A677D] block">
          Reading Context / Timing
        </label>
        <div className="grid grid-cols-2 gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setType(opt.id)}
              className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                type === opt.id
                  ? 'bg-gradient-to-r from-[#FFF5F8] to-[#FCE7F3]/40 border-[#EA81AA] text-[#192231] shadow-xs'
                  : 'bg-[#FAFBFD] border-[#E8EFF7] text-[#7A8B9E] hover:border-[#6FAFED]'
              }`}
            >
              <span className="text-base">{opt.icon}</span>
              <div>
                <span className="text-xs font-extrabold block text-[#192231]">{opt.label}</span>
                <span className="text-[9px] text-[#8F9EB3] block">{opt.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Optional Note */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-[#5A677D] block">
          Meal or Routine Note (Optional)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Whole grain toast + boiled egg, or light walk before test"
          className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8FAFD] border border-[#E2ECF7] text-xs text-[#192231] placeholder-[#94A3B8] focus:bg-white focus:border-[#EA81AA] outline-hidden transition-all"
        />
      </div>

      {/* Record-keeping only disclaimer */}
      <p className="text-[10px] text-[#8F9EB3] italic leading-tight">
        * Record-keeping only. Always share your readings with your obstetrician or diabetes educator during scheduled check-ups.
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full py-3 rounded-2xl text-xs font-black shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 ${
          justLogged
            ? 'bg-emerald-500 text-white'
            : 'bg-gradient-to-r from-[#192231] to-[#2B394A] text-white hover:opacity-95'
        }`}
      >
        <span>{justLogged ? '✓ Logged Successfully!' : 'Save Blood Glucose Log'}</span>
        {!justLogged && <span>🩸</span>}
      </button>
    </form>
  );
};

import React from 'react';
import { BPLogEntry, WeekdayShort } from '../../types';
import { WeeklyBPSchedule } from './WeeklyBPSchedule';
import { BPLogForm } from './BPLogForm';
import { BPHistoryTimeline } from './BPHistoryTimeline';

interface BPLogWorkspaceProps {
  entries: BPLogEntry[];
  daysLogged: WeekdayShort[];
  weeklyCount: number;
  onAddLog: (entry: Omit<BPLogEntry, 'id' | 'createdAt'>) => void;
}

export const BPLogWorkspace: React.FC<BPLogWorkspaceProps> = ({
  entries,
  daysLogged,
  weeklyCount,
  onAddLog
}) => {
  return (
    <div className="space-y-4">
      <WeeklyBPSchedule daysLogged={daysLogged} weeklyCount={weeklyCount} />
      <BPLogForm onAddLog={onAddLog} />
      <BPHistoryTimeline entries={entries} />
    </div>
  );
};

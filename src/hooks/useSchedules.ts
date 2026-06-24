import { useState } from 'react';
import type { ScheduleEntry } from '../index';
import { INITIAL_SCHEDULES } from '../mockData';

export const useSchedules = () => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(INITIAL_SCHEDULES);

  const addSchedule = (entry: Omit<ScheduleEntry, 'id'>) => {
    setSchedules(prev => [...prev, { ...entry, id: Date.now().toString() }]);
  };

  const deleteSchedulesBySubject = (subjectId: string) => {
    setSchedules(prev => prev.filter(s => s.subjectId !== subjectId));
  };

  return { schedules, setSchedules, addSchedule, deleteSchedulesBySubject };
};

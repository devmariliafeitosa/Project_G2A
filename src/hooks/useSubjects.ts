import { useState } from 'react';
import type { Subject } from '../index';
import { INITIAL_SUBJECTS } from '../mockData';
import { PASTEL_COLORS } from '../constants';

export const useSubjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);

  const addSubject = (name: string, workload: number, courseId: string, period: number, type: 'Obrigatória' | 'Opcional') => {
    const colorIndex = subjects.length % PASTEL_COLORS.length;
    setSubjects(prev => [...prev, { id: Date.now().toString(), name, workload, courseId, period, type, color: PASTEL_COLORS[colorIndex] }]);
  };

  const updateSubject = (subject: Subject) => {
    setSubjects(prev => prev.map(s => s.id === subject.id ? subject : s));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  return { subjects, setSubjects, addSubject, updateSubject, deleteSubject };
};

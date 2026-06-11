import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { DAYS, TIME_SLOTS, PASTEL_COLORS } from '../constants';
import type { User, Course, Subject, ScheduleEntry } from '../index';

const ProfessorScheduleView = ({ 
  user, 
  courses, 
  subjects, 
  teachers,
  schedules 
}: { 
  user: User, 
  courses: Course[], 
  subjects: Subject[],
  teachers: User[],
  schedules: ScheduleEntry[]
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const professorSchedules = useMemo(() => {
    let filtered = schedules.filter(s => s.teacherId === user?.id);
    if (selectedCourseId) {
      filtered = filtered.filter(s => s.courseId === selectedCourseId);
    }
    return filtered;
  }, [schedules, user?.id, selectedCourseId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <div className="flex items-center gap-3 text-primary mb-2">
          <Calendar size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Área Professor</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Minha Grade Semanal</h1>
        <p className="text-zinc-500 text-sm">Visualize suas alocações em todos os cursos.</p>
      </header>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Visualização de Horário</h3>
            <p className="text-xs text-zinc-500 font-sans">Filtre por curso para ver alocações específicas.</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-xs font-bold text-zinc-700 outline-none focus:ring-1 focus:ring-primary/20 transition-all"
            >
              <option value="">Todos os Cursos</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="p-6 overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-7 gap-4 mb-4">
              <div className="w-24"></div>
              {DAYS.map(day => (
                <div key={day} className="text-center">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{day}</p>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {TIME_SLOTS.map(slot => (
                <div key={slot.id} className="grid grid-cols-7 gap-4">
                  <div className="w-24 flex flex-col justify-center">
                    <p className="text-[10px] font-bold text-zinc-900 leading-none">{slot.label.split(' às ')[0]}</p>
                    <p className="text-[9px] text-zinc-400 font-medium mt-1 uppercase">{slot.period}</p>
                  </div>
                  {DAYS.map(day => {
                    const entry = professorSchedules.find(s => 
                      s.dayOfWeek === day && 
                      s.timeSlotId === slot.id
                    );
                    const subject = entry ? subjects.find(s => s.id === entry.subjectId) : null;
                    const course = entry ? courses.find(c => c.id === entry.courseId) : null;

                    if (slot.isBreak) {
                      return (
                        <div key={day} className="h-10 bg-zinc-50/50 border border-zinc-100 border-dashed rounded-lg flex items-center justify-center">
                          <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">{slot.period}</span>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={day}
                        className={`min-h-[60px] rounded-xl border p-3 flex flex-col justify-center shadow-sm relative group transition-all ${
                          subject 
                            ? (subject.color || PASTEL_COLORS[0])
                            : 'bg-zinc-50/30 border-zinc-100 hover:border-zinc-200'
                        }`}
                      >
                        {subject ? (
                          <>
                            <p className="text-[10px] font-bold leading-tight mb-1">{subject.name}</p>
                            <div className="flex flex-col gap-1">
                              <span className="text-[8px] font-bold opacity-60 uppercase">{course?.name}</span>
                              <span className="text-[8px] font-bold opacity-40 uppercase">{entry?.period}º Período</span>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">Livre</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfessorScheduleView;

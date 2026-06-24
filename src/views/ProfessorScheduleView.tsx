import React, { useState, useMemo } from 'react';
import { Info, Layers, Clock } from 'lucide-react';
import { DAYS, TIME_SLOTS, PASTEL_COLORS } from '../constants';
import type { User, Course, Subject, ScheduleEntry } from '../index';

const ProfessorScheduleView = ({ 
  user, 
  courses, 
  subjects, 
  teachers = [],
  schedules 
}: { 
  user: User, 
  courses: Course[], 
  subjects: Subject[],
  teachers?: User[],
  schedules: ScheduleEntry[]
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedTurn, setSelectedTurn] = useState<string>('Todos');

  const mySchedules = useMemo(() => {
    let filtered = schedules.filter(s => s.teacherId === user?.id);
    if (selectedCourseId) filtered = filtered.filter(s => s.courseId === selectedCourseId);
    return filtered;
  }, [schedules, user?.id, selectedCourseId]);

  const myCourses = useMemo(() => {
    const ids = new Set(schedules.filter(s => s.teacherId === user?.id).map(s => s.courseId));
    return courses.filter(c => ids.has(c.id));
  }, [schedules, user, courses]);

  const filteredSlots = useMemo(() =>
    TIME_SLOTS.filter(slot => {
      if (selectedTurn === 'Manhã') return slot.id.startsWith('m');
      if (selectedTurn === 'Tarde') return slot.id.startsWith('t') || slot.id === 'lunch';
      if (selectedTurn === 'Noite') return slot.id.startsWith('n');
      return true;
    })
  , [selectedTurn]);

  const weeklyHours = useMemo(() =>
    schedules.filter(s => s.teacherId === user?.id).length * 2
  , [schedules, user]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#32a041] animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Área do Professor</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-2">Minha Grade Semanal</h1>
        <p className="text-zinc-500 text-sm font-medium">Visualize suas alocações em todos os cursos.</p>
      </header>

      {/* Read-only banner */}
      <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-[10px] text-zinc-500">
        <Info size={12} className="text-zinc-400 shrink-0" />
        <span className="font-black text-zinc-700 shrink-0">Somente leitura.</span>
        <span className="font-medium">Grade preenchida e homologada pelos coordenadores. Para ajustes, entre em contato com sua coordenação.</span>
      </div>

      {/* Profile bar */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#32a041]/10 text-[#32a041] flex items-center justify-center font-black text-sm">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-black text-zinc-800 uppercase">{user.name}</p>
            <p className="text-[9px] text-zinc-400 font-semibold uppercase">{user.role} • SIAPE: {user.registration || (user as any).siape || '---'}</p>
          </div>
        </div>
        <div className="flex gap-6 text-center text-[9px] font-black text-zinc-400 uppercase tracking-widest">
          <div><p className="text-lg font-black text-zinc-800">{weeklyHours}h</p><p>Carga Semanal</p></div>
          <div><p className="text-lg font-black text-zinc-800">{mySchedules.length}</p><p>Slots</p></div>
          <div><p className="text-lg font-black text-zinc-800">{myCourses.length}</p><p>Cursos</p></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 gap-0.5">
          {['Manhã', 'Tarde', 'Noite', 'Todos'].map(t => (
            <button key={t} onClick={() => setSelectedTurn(t)}
              className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedTurn === t ? 'bg-[#32a041] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2.5 rounded-xl shadow-xs">
          <Layers size={13} className="text-zinc-400" />
          <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}
            className="bg-transparent text-xs font-black text-zinc-700 outline-none pr-4 cursor-pointer uppercase tracking-wider">
            <option value="">Todos os Cursos</option>
            {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Schedule grid */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-zinc-900 uppercase">Matriz de Horários Institucional</h3>
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-[9px] font-black text-zinc-400 px-3 py-1.5 rounded-lg uppercase">
            <Info size={10} /> Somente Consulta
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[800px] p-4">
            <div className="grid grid-cols-7 gap-3 mb-3">
              <div className="w-28" />
              {DAYS.map(day => (
                <div key={day} className="text-center">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{day}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {filteredSlots.map(slot => (
                <div key={slot.id} className="grid grid-cols-7 gap-3">
                  <div className="w-28 flex flex-col justify-center py-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{slot.period}</p>
                    <p className="text-[10px] font-black text-zinc-700 mt-0.5">{slot.label}</p>
                  </div>
                  {DAYS.map(day => {
                    if (slot.isBreak) return (
                      <div key={day} className="h-8 bg-zinc-50/50 border border-zinc-100 border-dashed rounded-lg flex items-center justify-center">
                        <span className="text-[7px] font-bold text-zinc-300 uppercase">{slot.period}</span>
                      </div>
                    );
                    const entry = mySchedules.find(s => s.dayOfWeek === day && s.timeSlotId === slot.id);
                    const subject = entry ? subjects.find(s => s.id === entry.subjectId) : null;
                    const course = entry ? courses.find(c => c.id === entry.courseId) : null;
                    return (
                      <div key={day} className={`min-h-[60px] rounded-xl border p-2.5 flex flex-col justify-center shadow-xs transition-all ${subject ? (subject.color || PASTEL_COLORS[0]) : 'bg-zinc-50/30 border-zinc-100'}`}>
                        {subject ? (
                          <>
                            <p className="text-[10px] font-black leading-tight line-clamp-2">{subject.name}</p>
                            <p className="text-[8px] font-bold opacity-50 uppercase mt-1">{course?.name}</p>
                            <p className="text-[7px] font-bold opacity-40 uppercase">{entry?.period}º Per</p>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <span className="text-[8px] font-bold text-zinc-200 uppercase">Livre</span>
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

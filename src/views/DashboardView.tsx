import React, { useState, useMemo } from 'react';
import { Users, BookOpen, FileText, Calendar, Activity } from 'lucide-react';
import { DAYS, TIME_SLOTS, PASTEL_COLORS } from '../constants';
import type { User, Course, Subject, ScheduleEntry } from '../index';

  type DashboardViewProps = {
    user: User;
    stats: any;
    courses: Course[];
    subjects: Subject[];
    teachers: User[];
    schedules: ScheduleEntry[];
    allocations: ScheduleEntry[];
    onAddSchedule: (s: Omit<ScheduleEntry, 'id'>) => void;
  };

  const DashboardView = ({
    user,
    stats,
    courses,
    subjects,
    teachers = [],
    schedules,
    allocations,
    onAddSchedule
  }: DashboardViewProps) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

  const course = useMemo(() => courses.find(c => c.id === selectedCourseId), [courses, selectedCourseId]);
  const effectiveSchedules = schedules || allocations || [];
  const availablePeriods = useMemo(() => {
    if (!course) return [];
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }, [course]);

  const courseSubjects = useMemo(() => (subjects || []).filter(Boolean).filter(s => s.courseId === selectedCourseId), [subjects, selectedCourseId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">
          Gestão Acadêmica
        </h1>
        <p className="text-zinc-500 text-sm">Bem-vindo, {user?.name}. Campus Tauá.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(stats ? [
          { label: 'Total Docentes', value: stats.teachers, icon: Users },
          { label: 'Total Cursos', value: stats.courses, icon: BookOpen },
          { label: 'Total Disciplinas', value: stats.subjects, icon: FileText }
        ] : [
          { label: 'Minhas Aulas', value: effectiveSchedules.filter(s => s.teacherId === user.id).length, icon: Calendar },
          { label: 'Cursos Ativos', value: new Set(effectiveSchedules.filter(s => s.teacherId === user.id).map(s => s.courseId)).size, icon: BookOpen },
          { label: 'Carga Semanal', value: effectiveSchedules.filter(s => s.teacherId === user.id).length * 2 + 'h', icon: Activity }
        ]).map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border border-zinc-200 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 bg-primary-light text-primary rounded-lg flex items-center justify-center">
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-zinc-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-zinc-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Grade Semanal</h3>
            <p className="text-xs text-zinc-500 font-sans">Visualize o horário das turmas por período.</p>
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 outline-none focus:ring-1 focus:ring-primary/20"
            >
              <option value="">Selecionar Curso...</option>
              {(courses || []).filter(Boolean).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {selectedCourseId && (
              <select 
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(parseInt(e.target.value))}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 outline-none"
              >
                {availablePeriods.map(p => <option key={p} value={p}>{p}º Período</option>)}
              </select>
            )}
          </div>
        </div>

        {selectedCourseId ? (
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
                      const entryInRange = effectiveSchedules.filter(Boolean).find(s => 
                        s.courseId === selectedCourseId && 
                        s.period === selectedPeriod && 
                        s.dayOfWeek === day && 
                        s.timeSlotId === slot.id
                      );
                      const subject = entryInRange ? (subjects || []).filter(Boolean).find(s => s.id === entryInRange.subjectId) : null;
                      const teacher = entryInRange && entryInRange.teacherId ? (teachers || []).filter(Boolean).find(t => t.id === entryInRange.teacherId) : null;

                      if (slot.isBreak) {
                        return (
                          <div key={day} className="h-10 bg-zinc-50/50 border border-zinc-100 border-dashed rounded-lg flex items-center justify-center">
                            <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">{slot.period}</span>
                          </div>
                        );
                      }

                      const isAdminUser = user?.id === '99';

                      return (
                        <div 
                          key={day}
                          className={`min-h-[60px] rounded-xl border p-2 flex flex-col justify-center shadow-sm relative group cursor-pointer transition-all ${
                            subject 
                              ? (subject.color || PASTEL_COLORS[0])
                              : 'bg-zinc-50/30 border-zinc-100' + (!isAdminUser ? ' hover:border-zinc-200' : '')
                          }`}
                        >
                          {subject ? (
                            <>
                              <p className="text-[10px] font-bold leading-tight">{subject.name}</p>
                              <div className="mt-1 flex items-center justify-between">
                                <span className="text-[8px] font-bold opacity-60 uppercase truncate pr-1">
                                  {teacher ? `Prof: ${teacher.name.split(' ')[0]}` : 'Docente'}
                                </span>
                                {!isAdminUser && (
                                  <button 
                                    onClick={() => {
                                      // Remove logic could be here
                                    }}
                                    className="text-[8px] font-bold opacity-0 group-hover:opacity-100 hover:text-alert"
                                  >
                                    Remover
                                  </button>
                                )}
                              </div>
                            </>
                          ) : (
                            !isAdminUser ? (
                              <div className="opacity-0 group-hover:opacity-100 flex flex-col items-center gap-1">
                                <select 
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      // Simple logic: pick the first teacher who is allocated this subject
                                      // In a real app, this would be more explicit
                                      const allocatedTeacher = teachers.find(t => t.disciplinasMinistradas?.includes(e.target.value));
                                      onAddSchedule && onAddSchedule({
                                        courseId: selectedCourseId,
                                        period: selectedPeriod,
                                        dayOfWeek: day,
                                        timeSlotId: slot.id,
                                        subjectId: e.target.value,
                                        teacherId: allocatedTeacher?.id
                                      });
                                    }
                                  }}
                                  className="w-full bg-transparent text-[8px] font-bold uppercase tracking-tight text-zinc-400 outline-none"
                                >
                                  <option value="">+ Alocar</option>
                                  {courseSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                              </div>
                            ) : null
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-zinc-300 gap-4">
            <Calendar size={48} className="opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">Selecione um curso para visualizar a grade</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-900">Resumo de Cargas Horárias</h3>
          <Activity size={18} className="text-zinc-300" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-zinc-50 text-left border-b border-zinc-200">
              <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Curso</th>
              <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Qtd. Disciplinas</th>
              <th className="px-6 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Carga Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {courses.length > 0 ? courses.filter(Boolean).map(course => {
              const courseSubjects = (subjects || []).filter(s => s && s.courseId === course.id);
              const totalWorkload = courseSubjects.reduce((acc, curr) => acc + curr.workload, 0);
              return (
                <tr key={course.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-zinc-900">{course.name}</td>
                  <td className="px-6 py-4 text-sm text-zinc-500">{courseSubjects.length}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">{totalWorkload}h</td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-zinc-400 text-sm font-medium">
                  Nenhum curso cadastrado ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default DashboardView;

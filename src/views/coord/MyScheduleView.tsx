import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  AlertTriangle, 
  BookOpen, 
  Info, 
  Coffee,
  CheckCircle,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { User, Subject, Course, ScheduleEntry } from '../../index';

interface MyScheduleViewProps {
  user: User | null;
  courses: Course[];
  subjects: Subject[];
  allocations: ScheduleEntry[];
}

// Consistent DAYS and TIME_SLOTS structure.
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const DISPLAY_TIME_SLOTS = [
  { id: 'm1', label: '07:25 às 08:25', period: 'MANHÃ', isBreak: false },
  { id: 'm2', label: '08:25 às 09:25', period: 'MANHÃ', isBreak: false },
  { id: 'm-int', label: '09:25 às 09:45', period: 'INTERVALO', isBreak: true },
  { id: 'm3', label: '09:45 às 10:45', period: 'MANHÃ', isBreak: false },
  { id: 'm4', label: '10:45 às 11:45', period: 'MANHÃ', isBreak: false },
  { id: 'lunch', label: '11:45 às 13:00', period: 'ALMOÇO', isBreak: true },
  { id: 't1', label: '13:00 às 14:00', period: 'TARDE', isBreak: false },
  { id: 't2', label: '14:00 às 15:00', period: 'TARDE', isBreak: false },
  { id: 't-int', label: '15:00 às 15:20', period: 'INTERVALO', isBreak: true },
  { id: 't3', label: '15:20 às 16:25', period: 'TARDE', isBreak: false },
  { id: 't4', label: '16:25 às 17:30', period: 'TARDE', isBreak: false },
];

export default function MyScheduleView({
  user,
  courses,
  subjects,
  allocations
}: MyScheduleViewProps) {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Find academic allocations for active logged-in teacher.
  const myAllocations = useMemo(() => {
    if (!user) return [];
    return allocations.filter(alloc => alloc.teacherId === user.id);
  }, [allocations, user]);

  // Extract unique courses in which the teacher has active allocations.
  const activeCoursesForTeacher = useMemo(() => {
    const courseIds = Array.from(new Set(myAllocations.map(a => a.courseId)));
    return courses.filter(c => courseIds.includes(c.id));
  }, [myAllocations, courses]);

  // Filter allocations based on the "Todos os Cursos" vs specific course filter.
  const filteredAllocations = useMemo(() => {
    if (selectedCourseFilter === 'all') {
      return myAllocations;
    }
    return myAllocations.filter(alloc => alloc.courseId === selectedCourseFilter);
  }, [myAllocations, selectedCourseFilter]);

  // Quick statistics
  const stats = useMemo(() => {
    const totalWeeklySlots = filteredAllocations.length;
    const hoursCount = totalWeeklySlots * 2; // Each slot is 2 academic hours
    const coursesCount = Array.from(new Set(filteredAllocations.map(a => a.courseId))).length;
    return { slots: totalWeeklySlots, hours: hoursCount, courses: coursesCount };
  }, [filteredAllocations]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* 1. Header and Filters */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-3 max-w-3xl">
          <div>
            <div className="flex items-center gap-2 text-[10px] tracking-widest font-black text-[#32a041] uppercase mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#32a041] animate-pulse"></span>
              Área do Docente
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-2">
              Minha Grade Semanal
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              Visualize suas alocações em todos os cursos.
            </p>
          </div>
          
          <div className="bg-zinc-50 border border-zinc-250/60 rounded-2xl p-4 text-xs text-zinc-500 leading-relaxed shadow-inner">
            <span className="font-bold text-zinc-800">Como funciona a matriz acadêmica?</span> Essa grade é preenchida e homologada pela chefia de departamento e coordenadores de curso. Docentes não possuem privilégio de modificação ou remanejamento de horários diretos, garantindo a consistência das grades de alunos e evitando colisões institucionais. Para dúvidas ou reajustes de sala/bloco, entre em contato imediatamente com sua coordenação específica.
          </div>
        </div>

        {/* Dropdown de Escopo situated in the upper right */}
        <div className="flex items-center gap-2.5 bg-white border border-zinc-200 px-4 py-2.5 rounded-2xl shadow-xs shrink-0 self-start md:self-auto">
          <Layers size={14} className="text-zinc-400" />
          <div className="flex flex-col text-left">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-0.5">Filtrar por Escopo</span>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-transparent text-xs font-black text-zinc-700 outline-none pr-6 cursor-pointer uppercase tracking-wider"
            >
              <option value="all">TODOS OS CURSOS</option>
              {activeCoursesForTeacher.map(course => (
                <option key={course.id} value={course.id}>
                  {course.name.toUpperCase()} ({course.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Profile quick metadata banner */}
      <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#32a041] font-black text-lg shadow-sm">
            {user?.name ? user.name.charAt(0) : 'P'}
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-800 uppercase tracking-tight">{user?.name}</h3>
            <p className="text-xs font-semibold text-zinc-400">
              Cargo: <span className="font-bold text-zinc-500 uppercase">{user?.role}</span> • SIAPE: <span className="font-mono text-zinc-500">{user?.registration || user?.siape || '---'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 divide-x divide-zinc-100">
          <div className="pl-6 first:pl-0">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Carga Semanal</span>
            <p className="text-lg font-black text-zinc-800 mt-0.5">{stats.hours}h <span className="text-xs font-normal text-zinc-400">de aula</span></p>
          </div>
          <div className="pl-6">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Aulas Alocadas</span>
            <p className="text-lg font-black text-zinc-800 mt-0.5">{stats.slots} <span className="text-xs font-normal text-zinc-400">slots</span></p>
          </div>
          <div className="pl-6">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Cursos Atuantes</span>
            <p className="text-lg font-black text-zinc-800 mt-0.5">{stats.courses} <span className="text-xs font-normal text-zinc-400">cursos</span></p>
          </div>
        </div>
        
        {/* Decorative corner tag */}
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-50/20 to-transparent pointer-events-none hidden md:block"></div>
      </div>

      {/* 2. Matriz de Horários */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-zinc-900 uppercase">Matriz de Horários Institucional</h3>
            <p className="text-xs text-zinc-400 font-semibold italic">Consulta integral aos turnos de atuação vigentes.</p>
          </div>
          <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 text-[9px] font-extrabold text-zinc-400 px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-inner">
            <Info size={11} className="text-zinc-400" />
            <span>Somente Consulta (Leitura)</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-zinc-200/50 rounded-[1.8rem] shadow-inner bg-zinc-50">
          <table className="w-full min-w-[850px] border-collapse bg-white">
            <thead>
              <tr className="border-b border-zinc-200/50 bg-zinc-50/50">
                <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400 w-36">Turno / Horário</th>
                {DAYS.map(day => (
                  <th key={day} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-zinc-600 w-44">{day.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {DISPLAY_TIME_SLOTS.map((slot) => {
                // If this is institutional interval or lunch
                if (slot.isBreak) {
                  return (
                    <tr key={slot.id} className="bg-amber-50/25 border-y border-amber-100/40">
                      {/* Left Header */}
                      <td className="p-3 pl-4 text-[9px] font-black text-zinc-400 uppercase tracking-widest border-r border-zinc-100 font-mono">
                        {slot.label}
                      </td>
                      {/* Spanned Content */}
                      <td colSpan={DAYS.length} className="p-3 text-center align-middle">
                        <div className="flex items-center justify-center gap-2 text-[10px] font-black tracking-widest text-amber-700/80 uppercase">
                          <Coffee size={12} className="text-amber-600/80" />
                          <span>{slot.period} — INTERVALO PEDAGÓGICO INSTITUCIONAL</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={slot.id} className="hover:bg-zinc-55/10 transition-all">
                    {/* Turn/Hour cell */}
                    <td className="p-4 pl-6 border-r border-zinc-100 text-left shrink-0">
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">{slot.period}</span>
                      <span className="text-xs font-mono font-bold text-zinc-800 leading-none mt-1.5 block">{slot.label}</span>
                    </td>

                    {/* Weekly day cells */}
                    {DAYS.map(day => {
                      // Find matching allocations for this particular day and time slot and filtered list
                      const alloc = filteredAllocations.find(
                        a => a.dayOfWeek.toLowerCase() === day.toLowerCase() && a.timeSlotId === slot.id
                      );

                      const subject = alloc ? subjects.find(s => s.id === alloc.subjectId) : null;
                      const course = alloc ? courses.find(c => c.id === alloc.courseId) : null;

                      // Check if room or block is defined
                      const hasDefinedLocation = alloc && (alloc.room || alloc.block);
                      const locationText = alloc && hasDefinedLocation
                        ? `Sala ${alloc.room || 'N/A'} - Bloco ${alloc.block || 'N/A'}`
                        : null;

                      return (
                        <td key={day} className="p-2 border-r border-zinc-100 last:border-r-0 align-middle">
                          {alloc ? (
                            <div className="p-3.5 rounded-2xl border bg-emerald-50/35 border-emerald-500/10 text-left flex flex-col justify-between h-24 hover:shadow-xs transition-all">
                              <div className="space-y-1">
                                <span className="text-[8px] font-black uppercase bg-emerald-100/80 text-emerald-800 px-1.5 py-0.5 rounded leading-none inline-block">
                                  {course?.name ? course.name.slice(0, 3) : 'CURSO'} {/* Simple badge */}
                                </span>
                                <h4 className="text-xs font-black text-zinc-800 leading-tight uppercase line-clamp-2">
                                  {subject?.name || 'Disciplina'}
                                </h4>
                              </div>

                              {/* Physical Location info */}
                              <div className="mt-2 pt-1.5 border-t border-zinc-200/40 flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                                <MapPin size={11} className="text-[#32a041]/70 shrink-0" />
                                {hasDefinedLocation ? (
                                  <span className="truncate">{locationText}</span>
                                ) : (
                                  <span className="text-rose-600 font-extrabold uppercase flex items-center gap-0.5">
                                    <AlertTriangle size={10} className="text-rose-500 shrink-0" />
                                    Sala não definida
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="h-24 rounded-2xl border border-dashed border-zinc-200/70 bg-zinc-50/20 flex items-center justify-center text-zinc-400 text-[10px] font-black uppercase tracking-wider transition-all select-none opacity-50">
                              LIVRE
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}

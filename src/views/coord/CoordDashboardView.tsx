import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, GraduationCap, Users, BookOpen, Plus, X, ArrowRightLeft, AlertCircle, Activity, Info, ClipboardList, CheckCircle2, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DAYS, TIME_SLOTS, PASTEL_COLORS } from '../../constants';
import type { User, Course, Subject, ScheduleEntry, AcademicSemester } from '../../index';
import { getWorkloadLimit } from '../../workload';
import WeeklyGrid from '../../components/coord/WeeklyGrid';

const CoordDashboardView = ({ 
  user, 
  teachers, 
  subjects, 
  courses, 
  allocations, 
  semesters,
  onAddAllocation, 
  onDeleteAllocation 
}: { 
  user: User | null, 
  teachers: User[], 
  subjects: Subject[], 
  courses: Course[], 
  allocations: ScheduleEntry[], 
  semesters: AcademicSemester[],
  onAddAllocation: (newEntry: ScheduleEntry) => void, 
  onDeleteAllocation: (id: string) => void 
}) => {
  // Course coordinated by user
  const coordinatedCourse = useMemo(() => {
    return courses.find(c => c.coordinatorId === user?.id) || courses[0];
  }, [courses, user]);

  const courseSemesters = useMemo(() => {
    if (!coordinatedCourse) return [];
    return semesters.filter(s => s.courseId === coordinatedCourse.id);
  }, [semesters, coordinatedCourse]);

  const activeSemesterIdent = useMemo(() => {
    const active = courseSemesters.find(s => s.status === 'Ativo');
    return active ? active.identification : (courseSemesters[0]?.identification || '2024.1');
  }, [courseSemesters]);

  const [selectedSemester, setSelectedSemester] = useState(activeSemesterIdent);

  useEffect(() => {
    if (activeSemesterIdent) {
      setSelectedSemester(activeSemesterIdent);
    }
  }, [activeSemesterIdent]);

  const [simulatedError, setSimulatedError] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isTableExpanded, setIsTableExpanded] = useState(false);

  // Form states for adding allocation
  const [targetDay, setTargetDay] = useState('Segunda');
  const [targetSlot, setTargetSlot] = useState('m1');
  const [targetSubject, setTargetSubject] = useState('');
  const [targetTeacher, setTargetTeacher] = useState('');

  // Subjects belonging to this course
  const courseSubjects = useMemo(() => {
    if (!coordinatedCourse) return [];
    return subjects.filter(s => s.courseId === coordinatedCourse.id);
  }, [subjects, coordinatedCourse]);

  const currentSemesterObj = useMemo(() => {
    return courseSemesters.find(s => s.identification === selectedSemester);
  }, [courseSemesters, selectedSemester]);

  // Subjects offered in this selected semester Specifically 
  const offeredSubjects = useMemo(() => {
    if (!coordinatedCourse) return [];
    const activeCourseSubjects = subjects.filter(s => s.courseId === coordinatedCourse.id && s.status !== 'Inativa');
    if (!currentSemesterObj) return activeCourseSubjects;
    if (!currentSemesterObj.offeredSubjectIds) return activeCourseSubjects;
    return activeCourseSubjects.filter(s => currentSemesterObj.offeredSubjectIds?.includes(s.id));
  }, [subjects, coordinatedCourse, currentSemesterObj]);

  // Active teachers
  const activeTeachers = useMemo(() => {
    return teachers.filter(t => t.status === 'Ativo');
  }, [teachers]);

  // Filtered allocations for selected course and semester
  const semesterAllocations = useMemo(() => {
    if (!coordinatedCourse) return [];
    return allocations.filter(a => a.courseId === coordinatedCourse.id && a.semester === selectedSemester);
  }, [allocations, coordinatedCourse, selectedSemester]);

  // Handle open modal
  const handleOpenAddModal = (day: string, slotId: string) => {
    setTargetDay(day);
    setTargetSlot(slotId);
    if (offeredSubjects.length > 0) {
      setTargetSubject(offeredSubjects[0].id);
    } else {
      setTargetSubject('');
    }
    if (activeTeachers.length > 0) setTargetTeacher(activeTeachers[0].id);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!targetSubject || !targetTeacher) return;
    const subj = subjects.find(s => s.id === targetSubject);
    
    // Check if there is already an allocation for this teacher in the same slot and semester
    const hasConflict = allocations.some(a => 
      a.semester === selectedSemester && 
      a.dayOfWeek === targetDay && 
      a.timeSlotId === targetSlot && 
      a.teacherId === targetTeacher
    );

    if (hasConflict) {
      alert(`Aviso: O docente já possui uma alocação neste mesmo dia (${targetDay}) e horário!`);
    }

    const newEntry: ScheduleEntry = {
      id: 'sch-' + Math.random().toString(36).substr(2, 9),
      courseId: coordinatedCourse.id,
      period: subj ? subj.period : 1,
      dayOfWeek: targetDay,
      timeSlotId: targetSlot,
      subjectId: targetSubject,
      teacherId: targetTeacher,
      semester: selectedSemester
    };
    onAddAllocation(newEntry);
    setShowAddModal(false);
  };

  const ACTIVE_SLOTS = useMemo(() => {
    return TIME_SLOTS.filter(s => !s.isBreak);
  }, []);

  const [selectedTurn, setSelectedTurn] = useState<string>('Todos');

  // Compute teacher statistics (recalculates dynamically)
  const teacherStats = useMemo(() => {
    return activeTeachers.map(t => {
      // Find allocations for this teacher in the selected semester (across all courses, to track real workload)
      const tAllocations = allocations.filter(a => a.teacherId === t.id && a.semester === selectedSemester);
      // Unique subjects taught
      const uniqueSubjIds = Array.from(new Set(tAllocations.map(a => a.subjectId)));
      const tSubjects = subjects.filter(s => uniqueSubjIds.includes(s.id));
      
      // Calculate total workload in hours (total semester workload)
      const totalWorkload = tSubjects.reduce((acc, curr) => acc + curr.workload, 0);
      
      // Calculate weekly workload classes (1 slot typically represents 2 hours of teaching weekly in IFCE schedule block)
      const weeklyHours = tAllocations.length * 2;

      // Limit based on role
      const limit = getWorkloadLimit(t.role); 

      let situation: 'Pendente' | 'Completa' | 'Excedida' = 'Pendente';
      if (weeklyHours === limit) {
        situation = 'Completa';
      } else if (weeklyHours > limit) {
        situation = 'Excedida';
      }

      return {
        teacher: t,
        subjectsCount: tSubjects.length,
        subjectsNames: tSubjects.map(s => s.name).join(', '),
        totalHours: totalWorkload,
        weeklyHours,
        limit,
        situation
      };
    });
  }, [activeTeachers, allocations, subjects, selectedSemester]);
  
  const workloadsSummary = useMemo(() => {
    const total = teacherStats.length;
    const semCarga = teacherStats.filter(t => t.weeklyHours === 0);
    const cargaParcial = teacherStats.filter(t => t.weeklyHours > 0 && t.weeklyHours < t.limit);
    const cargaIdeal = teacherStats.filter(t => t.weeklyHours === t.limit);
    const sobrecarregado = teacherStats.filter(t => t.weeklyHours > t.limit);
    
    return {
      total,
      semCarga: semCarga.length,
      cargaParcial: cargaParcial.length,
      cargaIdeal: cargaIdeal.length,
      sobrecarregado: sobrecarregado.length,
      semCargaList: semCarga,
      cargaParcialList: cargaParcial,
      sobrecarregadoList: sobrecarregado,
    };
  }, [teacherStats]);

  if (simulatedError) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <header className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Erro • Conexão Falhou</span>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-1.5">Visão Geral do Curso</h1>
            <p className="text-zinc-500 text-sm font-medium">Indicadores cruciais para a coordenação neste semestre.</p>
          </div>
          <button 
            onClick={() => setSimulatedError(false)}
            className="text-xs bg-zinc-100 border border-zinc-200 text-zinc-600 font-bold px-3 py-1.5 rounded-lg active:scale-95 transition-all text-right"
          >
            Ativar Conexão
          </button>
        </header>

        <div className="p-16 text-center bg-rose-50/50 border border-rose-100 rounded-[2.5rem] space-y-6 max-w-4xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl mx-auto flex items-center justify-center shadow-inner">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-rose-950 uppercase tracking-tight">Erro ao carregar dados</h3>
            <p className="text-rose-600 text-sm font-medium max-w-md mx-auto">O sistema não conseguiu carregar as alocações devido a um erro de conexão ou instabilidade temporária no servidor do IFCE.</p>
          </div>
          <div className="pt-4">
            <button 
              onClick={() => setSimulatedError(false)}
              className="h-12 px-8 bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/15"
            >
              Tente novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Campus Tauá</span>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-1.5">Visão Geral do Curso</h1>
          <p className="text-zinc-500 text-sm font-medium">Indicadores cruciais para a coordenação neste semestre.</p>
        </div>

      </header>

      {/* Informativos Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Coordinated Course */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/10 flex items-center justify-between group hover:border-[#32a041]/20 transition-all">
          <div className="space-y-2 flex-1 pr-4">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Curso sob Coordenação</p>
            <h4 className="text-lg font-black text-zinc-900 tracking-tight leading-snug">{coordinatedCourse?.name || 'Não alocado'}</h4>
            <div className="flex gap-2">
              <span className="px-1.5 py-0.5 rounded-md bg-zinc-50 border border-zinc-100 text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{coordinatedCourse?.level}</span>
              <span className="px-1.5 py-0.5 rounded-md bg-zinc-50 border border-zinc-100 text-[8px] font-bold text-zinc-400 uppercase tracking-wider">{coordinatedCourse?.type}</span>
            </div>
          </div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-emerald-50/70 text-emerald-600 shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap size={28} />
          </div>
        </div>

        {/* Card 2: Total Disciplinas */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/10 flex items-center justify-between group hover:border-blue-500/20 transition-all">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Matriz Curricular</p>
            <p className="text-4xl font-black text-zinc-900 tracking-tighter">
              {courseSubjects.length}
            </p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Disciplinas registradas</p>
          </div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-blue-50/70 text-blue-600 shadow-sm transition-transform group-hover:scale-105">
            <BookOpen size={28} />
          </div>
        </div>

        {/* Card 3: Docentes Vinculados */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-100/10 flex items-center justify-between group hover:border-purple-500/20 transition-all">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Docentes do Curso</p>
            <p className="text-4xl font-black text-zinc-900 tracking-tighter">
              {activeTeachers.length}
            </p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Docentes ativos no Campus</p>
          </div>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-purple-50/70 text-purple-600 shadow-sm transition-transform group-hover:scale-105">
            <Users size={28} />
          </div>
        </div>
      </div>

      {/* Grade Semanal Card */}
      <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-xl shadow-zinc-100/10 overflow-hidden">
        <div className="p-8 border-b border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50/30">
          <div>
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-zinc-400" />
              <h3 className="text-lg font-black text-zinc-900 uppercase">Grade Semanal do Curso</h3>
            </div>
            <p className="text-zinc-400 text-xs font-semibold mt-1">Visualize e interaja com os horários das turmas. Clique em slots vazios para criar alocações.</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 gap-0.5">
              {['Manhã','Tarde','Noite','Todos'].map(t => (
                <button key={t} type="button" onClick={() => setSelectedTurn(t)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${selectedTurn === t ? 'bg-[#32a041] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
                  {t}
                </button>
              ))}
            </div>
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Semestre:</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="h-11 px-4 bg-white border border-zinc-200 rounded-xl text-xs font-black uppercase tracking-widest outline-none focus:border-[#32a041]/30 text-zinc-700 shadow-sm"
            >
              {courseSemesters.length > 0 ? (
                courseSemesters.map(sem => (
                  <option key={sem.id} value={sem.identification}>
                    Semestre {sem.identification} {sem.status === 'Ativo' ? '(Ativo)' : ''}
                  </option>
                ))
              ) : (
                <>
                  <option value="2024.1">Semestre 2024.1</option>
                  <option value="2024.2">Semestre 2024.2</option>
                  <option value="2023.2">Semestre 2023.2</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Dynamic empty state block */}
        {semesterAllocations.length === 0 ? (
          <div className="p-16 text-center border-t border-zinc-100 bg-white flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center shadow-inner">
              <Calendar size={24} />
            </div>
            <div className="space-y-1">
              <h4 className="text-zinc-800 font-extrabold text-sm uppercase">Nenhuma alocação encontrada para o semestre selecionado.</h4>
              <p className="text-zinc-500 text-xs font-semibold max-w-sm mx-auto">Utilize a grade abaixo para clicar e criar alocações para o período letivo {selectedSemester}.</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#32a041]/5 border-b border-[#32a041]/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 flex items-center justify-center gap-2">
              <Check size={14} className="text-emerald-600" /> Semestre ativo • {semesterAllocations.length} Alocações Homologadas
            </p>
          </div>
        )}

        <WeeklyGrid
          allocations={semesterAllocations}
          subjects={subjects}
          teachers={teachers}
          onDeleteAllocation={onDeleteAllocation}
          onOpenAddModal={handleOpenAddModal}
          selectedTurn={selectedTurn}
        />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-[#f4f4f5] border-zinc-100 shadow-xl shadow-zinc-100/10 overflow-hidden">

        <div className="p-6 border-b border-zinc-100 bg-zinc-50/30">
          <div className="flex items-center gap-3">
            <ClipboardList size={18} className="text-[#32a041]" />
            <div>
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Resumo de Cargas Horárias</h3>
              <p className="text-zinc-400 text-[9px] font-semibold uppercase tracking-wider mt-0.5">Visão estratégica e equilíbrio docente para {selectedSemester}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 border-b border-zinc-100">

          <div className="p-4 border-r border-b lg:border-b-0 border-zinc-100 text-center flex flex-col justify-center items-center">
            <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Docentes Ativos</span>
            <span className="text-lg font-black text-zinc-800 mt-1 block">{workloadsSummary.total}</span>
          </div>

          <div className="p-4 border-r border-b lg:border-b-0 border-zinc-100 text-center flex flex-col justify-center items-center bg-zinc-55/5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">Sem Alocação</span>
            </div>
            <span className="text-lg font-black text-zinc-500 mt-1 block">{workloadsSummary.semCarga}</span>
          </div>

          <div className="p-4 border-r border-zinc-100 text-center flex flex-col justify-center items-center bg-amber-50/10">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[8px] font-black uppercase text-amber-600 tracking-widest">Carga Parcial</span>
            </div>
            <span className="text-lg font-black text-amber-600 mt-1 block">{workloadsSummary.cargaParcial}</span>
          </div>

          <div className="p-4 border-r border-zinc-100 text-center flex flex-col justify-center items-center bg-[#32a041]/10">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#32a041]" />
              <span className="text-[8px] font-black uppercase text-[#32a041] tracking-widest">Carga Ideal</span>
            </div>
            <span className="text-lg font-black text-[#32a041] mt-1 block">{workloadsSummary.cargaIdeal}</span>
          </div>

          <div className="p-4 text-center flex flex-col justify-center items-center bg-rose-50/[0.15]">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[8px] font-black uppercase text-rose-600 tracking-widest">Sobrecarga</span>
            </div>
            <span className="text-lg font-black text-rose-600 mt-1 block">{workloadsSummary.sobrecarregado}</span>
          </div>
        </div>

        <div className="p-6 bg-white space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-zinc-400">⚠️ Alertas Prioritários</h4>
            <span className="text-[8px] font-black uppercase text-zinc-400">Exceções de Carga</span>
          </div>

          {[
            ...(workloadsSummary.sobrecarregadoList || []),
            ...(workloadsSummary.semCargaList || []),
            ...(workloadsSummary.cargaParcialList || [])
          ].length === 0 ? (
            <div className="py-4 text-center bg-emerald-50/10 border border-emerald-100/50 rounded-2xl flex items-center justify-center gap-2 text-[#32a041]">
              <CheckCircle2 size={14} />
              <span className="text-[10px] uppercase font-black">Tudo em Equilíbrio! Excelente distribuição</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {[
                  ...(workloadsSummary.sobrecarregadoList || []),
                  ...(workloadsSummary.semCargaList || []),
                  ...(workloadsSummary.cargaParcialList || [])
                ].slice(0, 3).map((stat) => {
                  const isOver = stat.weeklyHours > stat.limit;
                  const isZero = stat.weeklyHours === 0;

                  return (
                    <div 
                      key={stat.teacher.id} 
                      className={`p-3 rounded-2xl border flex flex-col justify-between space-y-1.5 transition-all text-left
                        ${isOver 
                          ? 'bg-rose-50/30 border-rose-100 text-rose-950' 
                          : isZero 
                            ? 'bg-zinc-50 border-zinc-200 text-zinc-700' 
                            : 'bg-amber-50/30 border-amber-100/80 text-amber-950'
                        }
                      `}
                    >
                      <span className="text-[10px] font-black uppercase truncate leading-snug">{stat.teacher.name}</span>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md
                          ${isOver 
                            ? 'bg-rose-100/80 text-rose-700' 
                            : isZero 
                              ? 'bg-zinc-100 text-zinc-500' 
                              : 'bg-amber-100/80 text-amber-700'
                          }
                        `}>
                          {isOver ? 'Sobrecarga' : isZero ? 'Sem Carga' : 'Carga Parcial'}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase opacity-80">
                          {stat.weeklyHours}h / {stat.limit}h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {[
                ...(workloadsSummary.sobrecarregadoList || []),
                ...(workloadsSummary.semCargaList || []),
                ...(workloadsSummary.cargaParcialList || [])
              ].length > 3 && (
                <div className="text-center pt-1 animate-pulse">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#32a041] bg-emerald-50/50 px-3 py-1 rounded-full border border-emerald-100/30">
                    + {[
                      ...(workloadsSummary.sobrecarregadoList || []),
                      ...(workloadsSummary.semCargaList || []),
                      ...(workloadsSummary.cargaParcialList || [])
                    ].length - 3} docentes precisam de atenção
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex justify-center items-center shrink-0">
          <button
            onClick={() => setIsTableExpanded(true)}
            className="text-[9px] font-black uppercase tracking-widest text-[#32a041] hover:text-[#277c32] hover:underline flex items-center gap-1.5 transition-all outline-none cursor-pointer"
          >
            Abrir painel detalhado →
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isTableExpanded && (
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl overflow-hidden max-w-5xl w-full max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 md:p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#32a041] flex items-center justify-center">
                    <ClipboardList size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-900 uppercase tracking-tight">Análise Detalhada de Carga Docente</h3>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">Gestão completa para o semestre {selectedSemester}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTableExpanded(false)}
                  className="w-10 h-10 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all shadow-xs outline-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="overflow-x-auto border border-zinc-150 rounded-2xl bg-zinc-50">
                  <table className="w-full text-left border-collapse bg-white">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-zinc-50/50">
                        <th className="p-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest pl-8">Docente</th>
                        <th className="p-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Regime / Vínculo</th>
                        <th className="p-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Disciplinas Alocadas</th>
                        <th className="p-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-center">Carga Alocada</th>
                        <th className="p-5 text-[10px] font-black uppercase text-zinc-400 tracking-widest text-right pr-8">Situação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-150">
                      {teacherStats.map(({ teacher, subjectsCount, subjectsNames, totalHours, weeklyHours, limit, situation }) => {
                        const pct = Math.min(100, Math.round((weeklyHours / limit) * 100));
                        return (
                          <tr key={teacher.id} className="hover:bg-zinc-50/30 transition-all">
                            <td className="p-5 pl-8">
                              <div>
                                <p className="text-xs font-black text-zinc-800 uppercase leading-snug">{teacher.name}</p>
                                <p className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider mt-0.5">{teacher.regime}</p>
                              </div>
                            </td>
                            <td className="p-5 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                              {teacher.regime || 'Dedicação Exclusiva'}
                            </td>
                            <td className="p-5 max-w-xs">
                              {subjectsCount > 0 ? (
                                <div className="space-y-0.5">
                                  <p className="text-xs text-zinc-800 font-extrabold">{subjectsCount} {subjectsCount === 1 ? 'disciplina' : 'disciplinas'}</p>
                                  <p className="text-[10px] text-zinc-400 font-medium leading-relaxed truncate" title={subjectsNames}>
                                    {subjectsNames}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider">Nenhuma alocação</span>
                              )}
                            </td>
                            <td className="p-5 text-center">
                              <div className="space-y-1.5 flex flex-col items-center">
                                <p className="text-sm font-black text-zinc-950 leading-none">
                                  {totalHours}h <span className="text-[10px] text-zinc-400 font-bold uppercase">Total</span>
                                </p>
                                <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">
                                  {weeklyHours}h / {limit}h sem.
                                </p>
                                <div className="w-20 bg-zinc-100 h-1 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      weeklyHours === 0 
                                        ? 'bg-zinc-300' 
                                        : weeklyHours > limit 
                                          ? 'bg-rose-500' 
                                          : weeklyHours === limit 
                                            ? 'bg-[#32a041]' 
                                            : 'bg-amber-500'
                                    }`} 
                                    style={{ width: `${pct}%` }} 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="p-5 text-right pr-8">
                              {weeklyHours === 0 ? (
                                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-400 border border-zinc-200">
                                  Sem Carga
                                </span>
                              ) : situation === 'Completa' ? (
                                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                                  Completa ({weeklyHours}h)
                                </span>
                              ) : situation === 'Excedida' ? (
                                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 text-[#32a041] border border-rose-200">
                                  Excedida (+{weeklyHours - limit}h)
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                                  Pendente ({limit - weeklyHours}h)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-150 bg-zinc-50/50 flex justify-end shrink-0">
                <button
                  onClick={() => setIsTableExpanded(false)}
                  className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-800 transition-all outline-none cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2rem] max-w-md w-full overflow-hidden shadow-2xl border border-zinc-100 flex flex-col"
            >

              <div className="p-5 border-b border-zinc-100 bg-[#32a041]/5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">GESTÃO DE ALOCAÇÃO</span>
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 uppercase">Alocar Nova Disciplina</h3>
                  <p className="text-xs text-zinc-400 font-semibold">Preencha os campos para homologar o horário letivo.</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="w-10 h-10 rounded-full border border-zinc-200 hover:border-zinc-300 flex items-center justify-center text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 space-y-4">
   
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Curso sob Coordenação:</label>
                  <input
                    type="text"
                    value={coordinatedCourse?.name || ''}
                    disabled
                    className="w-full h-12 bg-zinc-50 text-zinc-500 border border-zinc-200 rounded-xl px-4 text-xs font-extrabold outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Disciplina Letiva:*</label>
                  <select
                    value={targetSubject}
                    onChange={(e) => setTargetSubject(e.target.value)}
                    className="w-full h-12 bg-[#fffbec] border border-zinc-200 rounded-xl px-4 text-xs font-black uppercase tracking-wider outline-none focus:border-emerald-500/30 text-zinc-700"
                  >
                    <option value="" disabled>Selecionar Disciplina...</option>
                    {offeredSubjects.length > 0 ? (
                      offeredSubjects.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.workload}h) - Período {s.period}
                        </option>
                      ))
                    ) : (
                      <option disabled value="">Nenhuma disciplina ofertada configurada para este período!</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Docente Responsável:*</label>
                  <select
                    value={targetTeacher}
                    onChange={(e) => setTargetTeacher(e.target.value)}
                    className="w-full h-12 bg-[#fffbec] border border-zinc-200 rounded-xl px-4 text-xs font-black uppercase tracking-wider outline-none focus:border-emerald-500/30 text-zinc-700"
                  >
                    <option value="" disabled>Selecionar Docente...</option>
                    {activeTeachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.regime})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Dia da Semana:*</label>
                    <select
                      value={targetDay}
                      onChange={(e) => setTargetDay(e.target.value)}
                      className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-xs font-black uppercase tracking-wider outline-none focus:border-emerald-500/30 text-zinc-700"
                    >
                      {DAYS.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Horário da Aula:*</label>
                    <select
                      value={targetSlot}
                      onChange={(e) => setTargetSlot(e.target.value)}
                      className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-xs font-black uppercase tracking-wider outline-none focus:border-emerald-500/30 text-zinc-700"
                    >
                      {ACTIVE_SLOTS.map(slot => (
                        <option key={slot.id} value={slot.id}>{slot.label} ({slot.period})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center gap-3">
                  <Info size={16} className="text-[#32a041]/70 shrink-0" />
                  <p className="text-[10px] font-semibold text-zinc-500 leading-relaxed uppercase tracking-wider">
                    Esta alocação será gravada para o semestre ativo <strong className="text-zinc-800 font-extrabold">{selectedSemester}</strong> e atualizará o resumo em tempo real.
                  </p>
                </div>
              </div>

              <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-12 px-6 rounded-xl text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="h-12 px-8 rounded-xl text-xs font-black text-white bg-[#32a041] hover:bg-opacity-95 shadow-xl shadow-emerald-700/10 active:scale-98 transition-all uppercase tracking-widest"
                >
                  Homologar Alocação
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default CoordDashboardView;

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowRightLeft, UserCheck, AlertTriangle, Check, Clock,
  Plus, Trash2, User, Info, X, Sparkles, Lock, ChevronRight,
  CheckCircle2, AlertCircle, Activity, Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, Course, Subject, AcademicSemester, ScheduleEntry, LeaveType } from '../../index';
import Toast, { useToast } from '../../components/Toast';
import StatCard from '../../components/StatCard';
import TurnSelector from '../../components/TurnSelector';
import AllocationForm from '../../components/coord/AllocationForm';

interface AllocationsViewProps {
  user: UserType | null;
  teachers: UserType[];
  subjects: Subject[];
  courses: Course[];
  semesters: AcademicSemester[];
  allocations: ScheduleEntry[];
  onAddAllocation: (newEntry: ScheduleEntry) => void;
  onDeleteAllocation: (id: string) => void;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DAYS_ORDER = DAYS;

const TIME_SLOTS = [
  { id: 'm1', label: '07:25 às 08:25', period: 'Manhã' },
  { id: 'm2', label: '08:25 às 09:25', period: 'Manhã' },
  { id: 'm-int', label: '09:25 às 09:45', period: 'Intervalo', isBreak: true },
  { id: 'm3', label: '09:45 às 10:45', period: 'Manhã' },
  { id: 'm4', label: '10:45 às 11:45', period: 'Manhã' },
  { id: 'lunch', label: '11:45 às 13:00', period: 'Almoço', isBreak: true },
  { id: 't1', label: '13:00 às 14:00', period: 'Tarde' },
  { id: 't2', label: '14:00 às 15:00', period: 'Tarde' },
  { id: 't-int', label: '15:00 às 15:20', period: 'Intervalo', isBreak: true },
  { id: 't3', label: '15:20 às 16:25', period: 'Tarde' },
  { id: 't4', label: '16:25 às 17:30', period: 'Tarde' },
  { id: 'n-pre', label: '17:30 às 18:30', period: 'Transição Noite', isBreak: true },
  { id: 'n1', label: '18:30 às 19:30', period: 'Noite' },
  { id: 'n2', label: '19:30 às 20:30', period: 'Noite' },
  { id: 'n-int', label: '20:30 às 20:40', period: 'Intervalo Noite', isBreak: true },
  { id: 'n3', label: '20:40 às 21:40', period: 'Noite' },
  { id: 'n4', label: '21:40 às 22:40', period: 'Noite' },
];

export const AllocationsView = ({
  user, teachers, subjects, courses, semesters, allocations,
  onAddAllocation, onDeleteAllocation
}: AllocationsViewProps) => {
  const { alert, showToast } = useToast();

  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    const coord = courses.find(c => c.coordinatorId === user?.id) || courses[0];
    return coord ? coord.id : '';
  });
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedMatrixSemester, setSelectedMatrixSemester] = useState<number>(1);
  const [teacherCustomWorkloads] = useState<Record<string, number>>({});
  const [allocatedSubjectId, setAllocatedSubjectId] = useState<string>('');
  const [allocatedTeacherId, setAllocatedTeacherId] = useState<string>('');
  const [allocatedRoom, setAllocatedRoom] = useState<string>('');
  const [allocatedBlock, setAllocatedBlock] = useState<string>('');
  const [selectedSlots, setSelectedSlots] = useState<{ day: string; slotId: string }[]>([]);
  const [selectedTurn, setSelectedTurn] = useState<string>('Manhã');
  const [activeTab, setActiveTab] = useState<'selection-g' | 'grid' | 'disponibilidade' | 'lista'>('selection-g');

  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId) || courses[0], [courses, selectedCourseId]);
  const courseSemesters = useMemo(() => semesters.filter(s => s.courseId === selectedCourse?.id), [semesters, selectedCourse]);
  const activeSemesterIdent = useMemo(() => {
    const a = courseSemesters.find(s => s.status === 'Ativo');
    return a ? a.identification : (courseSemesters[0]?.identification || '2024.1');
  }, [courseSemesters]);
  const currentSemesterObj = useMemo(() => courseSemesters.find(s => s.identification === selectedSemester), [courseSemesters, selectedSemester]);
  const activeTeachers = useMemo(() => teachers.filter(t => t.status === 'Ativo'), [teachers]);

  useEffect(() => { if (activeSemesterIdent) setSelectedSemester(activeSemesterIdent); }, [activeSemesterIdent]);
  useEffect(() => { const c = courses.find(c => c.coordinatorId === user?.id); if (c) setSelectedCourseId(c.id); }, [courses, user]);
  useEffect(() => { setSelectedSlots([]); }, [allocatedSubjectId, allocatedTeacherId]);
  useEffect(() => {
    const offered = subjects.filter(s => s.courseId === selectedCourse?.id && s.status !== 'Inativa' && s.period === selectedMatrixSemester);
    if (offered.length > 0) setAllocatedSubjectId(offered[0].id); else setAllocatedSubjectId('');
  }, [selectedMatrixSemester, selectedCourse, subjects]);
  useEffect(() => { if (activeTeachers.length > 0) setAllocatedTeacherId(activeTeachers[0].id); else setAllocatedTeacherId(''); }, [activeTeachers]);

  const getTeacherTimeLimit = (teacher: UserType): number => {
    if (teacher.id in teacherCustomWorkloads) return teacherCustomWorkloads[teacher.id];
    const r = String(teacher.role || '').trim().toLowerCase();
    if (['coordenador', 'diretor', 'vice-diretor', 'vicediretor'].includes(r)) return 10;
    if (teacher.cargaHoraria && teacher.cargaHoraria > 0) return teacher.cargaHoraria;
    return 20;
  };

  const offeredSubjects = useMemo(() => {
    if (!selectedCourse) return [];
    const active = subjects.filter(s => s.courseId === selectedCourse.id && s.status !== 'Inativa');
    if (!currentSemesterObj) return active.filter(s => s.period === selectedMatrixSemester);
    const offeredIds = currentSemesterObj.offeredSubjectIds || [];
    return active.filter(s => offeredIds.includes(s.id) && s.period === selectedMatrixSemester);
  }, [subjects, selectedCourse, currentSemesterObj, selectedMatrixSemester]);

  const selectedSubject = useMemo(() => subjects.find(s => s.id === allocatedSubjectId), [subjects, allocatedSubjectId]);
  const selectedTeacher = useMemo(() => teachers.find(t => t.id === allocatedTeacherId), [teachers, allocatedTeacherId]);
  const requiredSlotsCount = useMemo(() => selectedSubject ? Math.max(1, Math.ceil(selectedSubject.workload / 20)) : 0, [selectedSubject]);
  const filteredSlots = useMemo(() => {
    if (selectedTurn === 'Manhã') return TIME_SLOTS.filter(s => s.id.startsWith('m'));
    if (selectedTurn === 'Tarde') return TIME_SLOTS.filter(s => s.id.startsWith('t') || s.id === 'lunch');
    if (selectedTurn === 'Noite') return TIME_SLOTS.filter(s => s.id.startsWith('n'));
    return TIME_SLOTS;
  }, [selectedTurn]);

  const formProgress = useMemo(() => {
    let p = 0;
    if (allocatedSubjectId) p += 30;
    if (allocatedTeacherId) p += 30;
    if (selectedSubject && requiredSlotsCount > 0) p += Math.round((selectedSlots.length / requiredSlotsCount) * 40);
    return Math.min(100, p);
  }, [allocatedSubjectId, allocatedTeacherId, selectedSlots, selectedSubject, requiredSlotsCount]);

  // Stats
  const totalOfferedSubjectsInSemester = useMemo(() => subjects.filter(s => s.courseId === selectedCourseId && (currentSemesterObj?.offeredSubjectIds || []).includes(s.id)), [subjects, selectedCourseId, currentSemesterObj]);
  const allocatedSubjectIdsInCourse = useMemo(() => new Set(allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).map(a => a.subjectId)), [allocations, selectedCourseId, selectedSemester]);
  const uniqueTeachersCount = useMemo(() => new Set(allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).map(a => a.teacherId)).size, [allocations, selectedCourseId, selectedSemester]);
  const totalCargaHorariaPreenchida = useMemo(() => allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).length * 2, [allocations, selectedCourseId, selectedSemester]);
  const pendingSubjectsCount = useMemo(() => totalOfferedSubjectsInSemester.filter(s => !allocatedSubjectIdsInCourse.has(s.id)).length, [totalOfferedSubjectsInSemester, allocatedSubjectIdsInCourse]);
  const currentSemesterConflictsCount = useMemo(() => {
    let count = 0;
    const active = allocations.filter(a => a.semester === selectedSemester);
    const tm = new Map<string, string[]>();
    active.forEach(a => { const k = `${a.teacherId}-${a.dayOfWeek}-${a.timeSlotId}`; tm.set(k, [...(tm.get(k) || []), a.id]); });
    tm.forEach(ids => { if (ids.length > 1) count += ids.length - 1; });
    const sm = new Map<string, string[]>();
    active.forEach(a => { const k = `${a.courseId}-${a.period}-${a.dayOfWeek}-${a.timeSlotId}`; sm.set(k, [...(sm.get(k) || []), a.id]); });
    sm.forEach(ids => { if (ids.length > 1) count += ids.length - 1; });
    return count;
  }, [allocations, selectedSemester]);

  const preferencesSummary = useMemo(() => teachers.filter(t => t.disciplinasMinistradas?.includes(allocatedSubjectId)), [allocatedSubjectId, teachers]);
  const anyCoursePreferences = useMemo(() => teachers.some(t => t.disciplinasMinistradas && t.disciplinasMinistradas.length > 0), [teachers]);

  // Interjornada helpers
  const getNextDay = (day: string) => { const i = DAYS_ORDER.indexOf(day); return i === -1 || i === DAYS_ORDER.length - 1 ? null : DAYS_ORDER[i + 1]; };
  const getPrevDay = (day: string) => { const i = DAYS_ORDER.indexOf(day); return i <= 0 ? null : DAYS_ORDER[i - 1]; };
  const checkInterjornada = (day: string, slotId: string, teacherId: string) => {
    if (!teacherId) return null;
    const prev = getPrevDay(day); const next = getNextDay(day);
    if (slotId === 'm1' && prev && (allocations.some(a => a.teacherId === teacherId && a.dayOfWeek === prev && a.timeSlotId === 'n4' && a.semester === selectedSemester) || selectedSlots.some(s => s.day === prev && s.slotId === 'n4')))
      return { hasConflict: true, reason: `Não é possível alocar na primeira aula (${day} 07:25) após ministrar o último horário do dia anterior (${prev} 22:40).` };
    if (slotId === 'n4' && next && (allocations.some(a => a.teacherId === teacherId && a.dayOfWeek === next && a.timeSlotId === 'm1' && a.semester === selectedSemester) || selectedSlots.some(s => s.day === next && s.slotId === 'm1')))
      return { hasConflict: true, reason: `Não é possível alocar no último horário (22:40) se houver primeira aula do dia seguinte (${next} 07:25).` };
    return null;
  };

  const handlePerformAllocation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!allocatedSubjectId) { showToast('Selecione uma disciplina válida.', 'error'); return; }
    if (!allocatedTeacherId) { showToast('Selecione um docente válido.', 'error'); return; }
    if (!selectedSubject) return;
    if (selectedSlots.length !== requiredSlotsCount) { showToast(`Selecione exatamente ${requiredSlotsCount} horários.`, 'error'); return; }
    let hasErr = false; let errMsg = '';
    selectedSlots.forEach(slot => {
      if (allocations.some(a => a.courseId === selectedCourseId && a.period === selectedMatrixSemester && a.dayOfWeek === slot.day && a.timeSlotId === slot.slotId && a.semester === selectedSemester)) { hasErr = true; errMsg = `Choque de matriz para ${slot.day}.`; }
      else if (allocations.some(a => a.teacherId === allocatedTeacherId && a.dayOfWeek === slot.day && a.timeSlotId === slot.slotId && a.semester === selectedSemester)) { hasErr = true; errMsg = `Professor já ocupado em ${slot.day}.`; }
      else { const ij = checkInterjornada(slot.day, slot.slotId, allocatedTeacherId); if (ij) { hasErr = true; errMsg = ij.reason; } }
    });
    if (hasErr) { showToast(errMsg, 'error'); return; }
    const newlyAdded: string[] = [];
    selectedSlots.forEach((slot, idx) => {
      const newId = `sch-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`;
      onAddAllocation({ id: newId, courseId: selectedCourseId, period: selectedMatrixSemester, dayOfWeek: slot.day, timeSlotId: slot.slotId, subjectId: allocatedSubjectId, teacherId: allocatedTeacherId, semester: selectedSemester, room: allocatedRoom.trim() || undefined, block: allocatedBlock.trim() || undefined });
      newlyAdded.push(newId);
    });
    setNewlyAddedIds(prev => { const c = new Set(prev); newlyAdded.forEach(id => c.add(id)); return c; });
    showToast(`Disciplina alocada (${selectedSlots.length} horários)!`, 'success');
    setSelectedSlots([]); setAllocatedRoom(''); setAllocatedBlock('');
  };

  const handleRemoveAllocation = (id: string) => {
    onDeleteAllocation(id);
    setNewlyAddedIds(prev => { const c = new Set(prev); c.delete(id); return c; });
    showToast('Alocação removida.', 'success');
  };

  const matrixPeriods = useMemo(() => {
    const periods = Array.from(new Set(subjects.filter(s => s.courseId === selectedCourseId).map(s => s.period))).sort();
    return periods.length > 0 ? periods : [1,2,3,4,5,6];
  }, [subjects, selectedCourseId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      <Toast alert={alert} />

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-wider">
          <span>Início</span><ChevronRight size={10} /><span>Alocações</span><ChevronRight size={10} /><span className="text-[#32a041]">Distribuição</span>
        </div>
        <header>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-[#32a041] uppercase tracking-widest">Painel Coordenador / DOC-003</span>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-2">Distribuição de Alocações</h1>
          <p className="text-zinc-500 text-sm font-medium">Assegure a grade de aulas vinculando disciplinas, professores e turnos livres de qualquer conflito de horário.</p>
        </header>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Grade Alocada" value={<>{allocatedSubjectIdsInCourse.size}<span className="text-sm text-zinc-400 font-bold">/{totalOfferedSubjectsInSemester.length || 1}</span></>} subtext="Disciplinas em curso ativo" icon={<CheckCircle2 size={16} />} iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard label="Docentes Ativos" value={uniqueTeachersCount} subtext="Professores com grade" icon={<UserCheck size={16} />} iconBg="bg-blue-50 text-blue-600" />
        <StatCard label="Carga Alocada" value={<>{totalCargaHorariaPreenchida}<span className="text-xs text-zinc-400 font-bold">h/sem</span></>} subtext="Total de horas preenchidas" icon={<Clock size={16} />} iconBg="bg-indigo-50 text-indigo-600" />
        <StatCard label="Conflitos" value={currentSemesterConflictsCount} subtext="Colisões de horários" icon={<AlertTriangle size={16} />} iconBg={currentSemesterConflictsCount > 0 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-zinc-50 text-zinc-400'} valueClass={currentSemesterConflictsCount > 0 ? 'text-rose-600' : 'text-zinc-800'} />
        <StatCard label="Pendências" value={pendingSubjectsCount} subtext="Disciplinas sem docente" icon={<Activity size={16} />} iconBg={pendingSubjectsCount > 0 ? 'bg-[#fffbec] text-amber-700' : 'bg-emerald-50 text-emerald-600'} className="col-span-2 lg:col-span-1" />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-[2rem] border border-zinc-150 p-6 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Curso Sob Gestão</label>
          <div className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-650 shadow-xs">
            <span className="truncate">{selectedCourse?.name || 'Administração Curricular'}</span>
            <Lock size={12} className="text-zinc-400 shrink-0 ml-2" />
          </div>
        </div>
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Período Civil Ativo</label>
          <select value={selectedSemester} onChange={e => { setSelectedSemester(e.target.value); showToast(`Calendário alterado para ${e.target.value}.`, 'info'); }}
            className="w-full h-11 bg-[#fffbec]/40 border border-amber-200/50 rounded-xl pl-4 pr-10 text-xs font-black uppercase tracking-widest outline-none focus:border-[#32a041] text-zinc-800 appearance-none cursor-pointer shadow-inner">
            {courseSemesters.map(s => <option key={s.id} value={s.identification}>{s.identification} {s.status === 'Ativo' ? '(Ativo)' : ''}</option>)}
            {courseSemesters.length === 0 && <option value="2024.1">2024.1</option>}
          </select>
        </div>
        <div className="md:col-span-3 space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Semestre Matriz</label>
          <select value={selectedMatrixSemester} onChange={e => setSelectedMatrixSemester(parseInt(e.target.value))}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl pl-4 pr-10 text-xs font-black uppercase tracking-widest outline-none focus:border-[#32a041] text-zinc-800 appearance-none cursor-pointer shadow-inner">
            {matrixPeriods.map(p => <option key={p} value={p}>{p}º Semestre Matriz</option>)}
          </select>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Disciplinas Ofertadas</label>
          <div className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 flex items-center text-xs font-black uppercase tracking-wider text-zinc-650 shadow-xs">
            <span>{offeredSubjects.length} ofertadas</span>
          </div>
        </div>
      </div>

      {/* Main Layout: Form + Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <AllocationForm
          offeredSubjects={offeredSubjects} activeTeachers={activeTeachers}
          allocations={allocations} selectedSemester={selectedSemester}
          allocatedSubjectId={allocatedSubjectId} allocatedTeacherId={allocatedTeacherId}
          allocatedRoom={allocatedRoom} allocatedBlock={allocatedBlock}
          selectedSlots={selectedSlots} requiredSlotsCount={requiredSlotsCount}
          formProgress={formProgress} selectedSubject={selectedSubject}
          selectedTeacher={selectedTeacher} getTeacherTimeLimit={getTeacherTimeLimit}
          preferencesSummary={preferencesSummary} anyCoursePreferences={anyCoursePreferences}
          onSubjectChange={setAllocatedSubjectId} onTeacherChange={setAllocatedTeacherId}
          onRoomChange={setAllocatedRoom} onBlockChange={setAllocatedBlock}
          onClearSlots={() => setSelectedSlots([])}
          onRemoveSlot={(day, slotId) => setSelectedSlots(p => p.filter(s => !(s.day === day && s.slotId === slotId)))}
          onSubmit={handlePerformAllocation}
        />

        {/* Right Column: Tabs */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap bg-zinc-100 p-1 rounded-2xl border border-zinc-200 max-w-xl gap-0.5">
            {[['selection-g', '🛠️ Montar Grade'], ['grid', 'Grade do Curso'], ['disponibilidade', 'Agenda Docente'], ['lista', 'Total Vinculado']] .map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)}
                className={`flex-1 min-w-[120px] h-10 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-[#32a041] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* Tab: Montar Grade */}
          {activeTab === 'selection-g' && (
            <div className="bg-white rounded-[2rem] border border-zinc-150 shadow-sm p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-emerald-50/10 p-4 rounded-2xl border border-emerald-150/40">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#32a041] animate-pulse" />
                    <h3 className="text-base font-black text-zinc-900 uppercase">Montador Inteligente de Grade</h3>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-extrabold uppercase tracking-wide">
                    {allocatedSubjectId ? `${selectedSubject?.name} • ${selectedSubject?.workload}h • ${selectedMatrixSemester}ºS` : 'Aguardando seleção de disciplina...'}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border text-[11px] font-black uppercase tracking-wider shadow-xs ${selectedSlots.length === requiredSlotsCount && requiredSlotsCount > 0 ? 'bg-[#32a041] border-[#277c32] text-white animate-pulse' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  {selectedSlots.length === requiredSlotsCount && requiredSlotsCount > 0
                    ? <>Concluído! {selectedSlots.length}/{requiredSlotsCount} ✓</>
                    : allocatedSubjectId ? <>Selecionados: {selectedSlots.length}/{requiredSlotsCount}</> : <span className="text-zinc-400">Selecione disciplina</span>}
                </div>
              </div>

              <div className="bg-zinc-50/50 p-3.5 rounded-xl border border-zinc-150 text-[10px] font-semibold text-zinc-550 leading-relaxed">
                <p className="uppercase text-[8px] font-black tracking-widest text-[#32a041] mb-1.5">💡 Regras de Alocação</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                  <div>• <strong>Livre (tracejado):</strong> Disponível para seleção.</div>
                  <div>• <strong>Choque (Vermelho):</strong> Outra disciplina no {selectedMatrixSemester}º sem.</div>
                  <div>• <strong>Docente Ocupado (Cinza):</strong> {selectedTeacher?.name || 'Docente'} já ministra aula.</div>
                  <div>• <strong>Interjornada (Rosa):</strong> Repouso obrigatório.</div>
                </div>
              </div>

              <TurnSelector value={selectedTurn} onChange={setSelectedTurn} />

              <div className="overflow-x-auto border border-zinc-200 rounded-2xl shadow-xs bg-zinc-50">
                <table className="w-full min-w-[700px] border-collapse bg-white">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/50">
                      <th className="py-2.5 px-3 text-left text-[9px] font-black uppercase tracking-wider text-zinc-400 w-28">Horário</th>
                      {DAYS_ORDER.map(day => <th key={day} className="py-2.5 px-2 text-center text-[9px] font-black uppercase tracking-wider text-[#58595b] w-36">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlots.map(slot => {
                      if (slot.isBreak) return (
                        <tr key={slot.id} className="border-b border-zinc-200 bg-zinc-50/50">
                          <td className="py-1.5 px-2 text-[8px] font-black text-center text-zinc-400 uppercase">{slot.period}</td>
                          <td colSpan={DAYS_ORDER.length} className="py-1.5 text-center text-[9px] font-black uppercase text-zinc-450 italic">{slot.label} — {slot.period}</td>
                        </tr>
                      );
                      return (
                        <tr key={slot.id} className="border-b border-zinc-100">
                          <td className="py-2.5 px-3 border-r border-zinc-150 bg-zinc-50/10 w-28">
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-450 block">{slot.period}</span>
                            <span className="text-[11px] font-black text-zinc-700 leading-none mt-0.5 block">{slot.label}</span>
                          </td>
                          {DAYS_ORDER.map(day => {
                            if (!allocatedSubjectId) return (
                              <td key={day} className="p-1 border-r border-zinc-100 text-center">
                                <div className="h-11 rounded-lg border border-dashed border-zinc-200 flex items-center justify-center text-[8.5px] font-bold text-zinc-300">Aguardando</div>
                              </td>
                            );
                            const matrixC = allocations.find(a => a.courseId === selectedCourseId && a.period === selectedMatrixSemester && a.dayOfWeek === day && a.timeSlotId === slot.id && a.semester === selectedSemester);
                            const teacherC = allocations.find(a => a.teacherId === allocatedTeacherId && a.dayOfWeek === day && a.timeSlotId === slot.id && a.semester === selectedSemester);
                            const ij = checkInterjornada(day, slot.id, allocatedTeacherId);
                            const isSelected = selectedSlots.some(s => s.day === day && s.slotId === slot.id);
                            const maxReached = !isSelected && selectedSlots.length >= requiredSlotsCount;
                            let cellStyle = 'border-dashed border-zinc-200 hover:border-[#32a041]/40 hover:bg-[#32a041]/5 text-zinc-400 hover:text-[#32a041] cursor-pointer';
                            let cellLabel = 'Livre'; let cellSub = '+ Adicionar'; let clickable = true;
                            if (isSelected) { cellStyle = 'bg-emerald-500 border-emerald-600 text-white cursor-pointer shadow-sm'; cellLabel = 'Selecionado'; cellSub = 'Desmarcar'; }
                            else if (matrixC) { cellStyle = 'bg-rose-50 border-rose-200 text-rose-800 opacity-80 cursor-not-allowed'; cellLabel = 'Choque'; cellSub = subjects.find(s => s.id === matrixC.subjectId)?.name || ''; clickable = false; }
                            else if (teacherC) { cellStyle = 'bg-zinc-100 border-zinc-200 text-zinc-500 opacity-70 cursor-not-allowed'; cellLabel = 'Ocupado'; cellSub = subjects.find(s => s.id === teacherC.subjectId)?.name || ''; clickable = false; }
                            else if (ij) { cellStyle = 'bg-rose-50/60 border-rose-150 text-rose-700 opacity-75 cursor-not-allowed'; cellLabel = 'Restrição'; cellSub = 'Interjornada'; clickable = false; }
                            else if (maxReached) { cellStyle = 'border-dashed border-zinc-100 opacity-40 cursor-not-allowed'; cellLabel = 'Limite'; clickable = false; }
                            return (
                              <td key={day} className="p-1 border-r border-zinc-100 text-center" onClick={() => {
                                if (!clickable) return;
                                setSelectedSlots(prev => prev.some(s => s.day === day && s.slotId === slot.id)
                                  ? prev.filter(s => !(s.day === day && s.slotId === slot.id))
                                  : prev.length < requiredSlotsCount ? [...prev, { day, slotId: slot.id }] : prev);
                              }}>
                                <div className={`h-11 rounded-lg border flex flex-col items-center justify-center text-[8.5px] font-bold transition-all ${cellStyle}`}>
                                  <span className="font-black">{cellLabel}</span>
                                  <span className="opacity-70 truncate max-w-[80px] text-center">{cellSub}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {selectedSlots.length === requiredSlotsCount && requiredSlotsCount > 0 && (
                <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200">
                  <div>
                    <p className="text-[11px] font-black uppercase text-[#32a041]">Confirmação de Alocações</p>
                    <p className="text-zinc-500 text-[10px] font-semibold mt-0.5">{selectedSlots.length} horários configurados.</p>
                  </div>
                  <button onClick={() => handlePerformAllocation()} className="h-11 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl bg-[#32a041] text-white hover:bg-[#277c32] shadow-md flex items-center gap-1.5">
                    CONFIRMAR ✓
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab: Grade do Curso */}
          {activeTab === 'grid' && (
            <div className="bg-white rounded-[2.5rem] border border-zinc-150 shadow-sm p-8 space-y-6">
              <div className="flex justify-between items-center bg-zinc-50/50 p-4 rounded-3xl border border-zinc-150/60">
                <div>
                  <h3 className="text-base font-black text-zinc-900 uppercase">{selectedMatrixSemester}º Semestre Matriz</h3>
                  <p className="text-zinc-400 text-[10px] font-bold">Grade semanal vinculada no período {selectedSemester}.</p>
                </div>
              </div>
              <TurnSelector value={selectedTurn} onChange={setSelectedTurn} />
              <div className="overflow-x-auto border border-zinc-200 rounded-[1.8rem] shadow-inner bg-zinc-50">
                <table className="w-full min-w-[700px] border-collapse bg-white">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/50">
                      <th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-400 w-32">Horário</th>
                      {DAYS.map(day => <th key={day} className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-[#58595b] w-40">{day}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSlots.map(slot => {
                      if (slot.isBreak) return (
                        <tr key={slot.id} className="border-b border-zinc-200 bg-zinc-50/50">
                          <td className="p-3.5 text-[9px] font-black text-center text-zinc-400 uppercase">{slot.period}</td>
                          <td colSpan={DAYS.length} className="p-3.5 text-center text-[10px] font-bold text-zinc-400 italic">{slot.label} — {slot.period}</td>
                        </tr>
                      );
                      return (
                        <tr key={slot.id} className="border-b border-zinc-100 hover:bg-zinc-50/10 transition-all">
                          <td className="p-4 border-r border-zinc-150 text-left">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">{slot.period}</span>
                            <span className="text-xs font-black text-zinc-700 leading-none mt-1 block">{slot.label}</span>
                          </td>
                          {DAYS.map(day => {
                            const alloc = allocations.find(a => a.courseId === selectedCourseId && a.period === selectedMatrixSemester && a.dayOfWeek === day && a.timeSlotId === slot.id && a.semester === selectedSemester);
                            const subject = alloc ? subjects.find(s => s.id === alloc.subjectId) : null;
                            const teacher = alloc ? teachers.find(t => t.id === alloc.teacherId) : null;
                            let statusColor = 'bg-emerald-50 border-emerald-200 text-emerald-800';
                            if (alloc) {
                              const isNew = newlyAddedIds.has(alloc.id);
                              const onLeave = teacher?.leaveType && teacher.leaveType !== LeaveType.Nenhum;
                              const noPref = teacher?.disciplinasMinistradas && !teacher.disciplinasMinistradas.includes(alloc.subjectId);
                              if (isNew) statusColor = 'bg-blue-50 border-blue-200 text-blue-800';
                              else if (onLeave) statusColor = 'bg-rose-50 border-rose-200 text-rose-800';
                              else if (noPref) statusColor = 'bg-amber-50 border-amber-200 text-amber-800';
                              else if (subject?.color) statusColor = subject.color;
                            }
                            return (
                              <td key={day} className="p-2 text-center border-r border-zinc-150 align-middle" onClick={() => { setAllocatedSubjectId(alloc?.subjectId || ''); }}>
                                {alloc ? (
                                  <div className={`p-3 rounded-2xl border text-left flex flex-col justify-between h-22 transition-all shadow-xs relative group ${statusColor}`}>
                                    <button type="button" onClick={e => { e.stopPropagation(); handleRemoveAllocation(alloc.id); }}
                                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-white border border-rose-200 text-rose-650 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-rose-50 transition-all cursor-pointer shadow-sm">
                                      <Trash2 size={11} />
                                    </button>
                                    <div className="space-y-0.5">
                                      <p className="text-[8px] font-mono font-black uppercase">{subject?.code || subject?.id.toUpperCase()}</p>
                                      <p className="text-[10px] font-extrabold leading-tight truncate uppercase pr-4">{subject?.name}</p>
                                    </div>
                                    <div className="flex items-center gap-1 mt-1 border-t border-black/5 pt-1 truncate">
                                      <User size={9} className="shrink-0 opacity-70" />
                                      <span className="text-[9px] font-black truncate uppercase">{teacher?.name.split(' ')[0]} {teacher?.name.split(' ').pop()}</span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-22 rounded-2xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-300 hover:border-[#32a041]/30 hover:bg-[#32a041]/5 transition-all cursor-pointer p-2">
                                    <span className="text-[9px] font-black uppercase">+ Adicionar</span>
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
          )}

          {/* Tab: Agenda Docente */}
          {activeTab === 'disponibilidade' && (
            <div className="bg-white rounded-[2.5rem] border border-zinc-150 shadow-sm p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-3xl border border-zinc-150">
                <div>
                  <h3 className="text-base font-black text-zinc-900 uppercase">Agenda de Ocupação Docente</h3>
                  <p className="text-zinc-400 text-[10px] font-semibold">Selecione para revisar o quadro total de aulas.</p>
                </div>
                <select value={allocatedTeacherId} onChange={e => setAllocatedTeacherId(e.target.value)}
                  className="bg-white border border-zinc-200 rounded-xl px-4 h-11 text-xs font-black uppercase text-zinc-800 focus:border-[#32a041] outline-none shadow-sm cursor-pointer">
                  {activeTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              {allocatedTeacherId && (() => {
                const t = teachers.find(x => x.id === allocatedTeacherId);
                if (!t) return null;
                const ta = allocations.filter(a => a.teacherId === t.id && a.semester === selectedSemester);
                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 bg-zinc-50/50 p-5 border border-zinc-200 rounded-3xl">
                      <div><span className="text-[9px] font-black text-zinc-400 uppercase block">Professor</span><p className="text-sm font-black text-zinc-805 uppercase">{t.name}</p></div>
                      <div><span className="text-[9px] font-black text-zinc-400 uppercase block">Regime</span><p className="text-xs font-black text-[#32a041] uppercase">{t.regime}</p></div>
                      <div><span className="text-[9px] font-black text-zinc-400 uppercase block">Aulas</span><p className="text-xs font-black text-zinc-600">{ta.length * 2}h / máx {getTeacherTimeLimit(t)}h</p></div>
                    </div>
                    <TurnSelector value={selectedTurn} onChange={setSelectedTurn} />
                    <div className="overflow-x-auto border border-zinc-200 rounded-[1.8rem]">
                      <table className="w-full min-w-[700px] border-collapse bg-white">
                        <thead><tr className="border-b border-zinc-200 bg-zinc-50/50">
                          <th className="p-4 text-left text-[10px] font-black uppercase text-zinc-400 w-32">Horário</th>
                          {DAYS.map(day => <th key={day} className="p-4 text-center text-[10px] font-black uppercase text-[#58595b]">{day}</th>)}
                        </tr></thead>
                        <tbody>
                          {filteredSlots.map(slot => {
                            if (slot.isBreak) return <tr key={slot.id} className="border-b border-zinc-200 bg-zinc-50/50"><td className="p-3.5 text-[9px] font-black text-center text-zinc-400 uppercase">{slot.period}</td><td colSpan={DAYS.length} className="p-3.5 text-center text-[10px] font-bold text-zinc-400 italic">{slot.label}</td></tr>;
                            return (
                              <tr key={slot.id} className="border-b border-zinc-100">
                                <td className="p-4 border-r border-zinc-150">
                                  <span className="text-[9px] font-black uppercase text-zinc-400 block">{slot.period}</span>
                                  <span className="text-xs font-black text-zinc-700 block">{slot.label}</span>
                                </td>
                                {DAYS.map(day => {
                                  const alloc = allocations.find(a => a.teacherId === t.id && a.dayOfWeek === day && a.timeSlotId === slot.id && a.semester === selectedSemester);
                                  const subject = alloc ? subjects.find(s => s.id === alloc.subjectId) : null;
                                  const course = alloc ? courses.find(c => c.id === alloc.courseId) : null;
                                  return (
                                    <td key={day} className="p-2 text-center border-r border-zinc-150 align-middle">
                                      {alloc ? (
                                        <div className="p-3 rounded-2xl border border-[#32a041]/30 bg-emerald-50/30 text-emerald-800 text-left flex flex-col h-20 shadow-xs">
                                          <span className="text-[8px] font-extrabold uppercase bg-emerald-50 px-1.5 py-0.5 rounded w-max">Matriz: {alloc.period}º Sem</span>
                                          <p className="text-[10px] font-black leading-tight truncate uppercase mt-1">{subject?.name}</p>
                                          <p className="text-[8px] text-zinc-500 truncate uppercase">{course?.name}</p>
                                        </div>
                                      ) : (
                                        <div className="h-20 rounded-2xl border border-dashed border-zinc-150 flex items-center justify-center text-emerald-600 bg-emerald-50/5 text-[9px] font-extrabold uppercase">Disponível</div>
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
                );
              })()}
            </div>
          )}

          {/* Tab: Lista */}
          {activeTab === 'lista' && (
            <div className="bg-white rounded-[2.5rem] border border-zinc-150 shadow-sm p-8 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-150">
                <div>
                  <h3 className="text-md font-black text-zinc-900 uppercase">Tabela de Distribuições Efetuadas</h3>
                  <p className="text-[#32a041] text-[10px] font-black uppercase mt-0.5">Semestre: {selectedSemester}</p>
                </div>
                <span className="text-[10px] font-black uppercase bg-[#32a041]/10 px-3 py-1 rounded-xl text-[#32a041]">
                  {allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).length} alocações
                </span>
              </div>
              <div className="divide-y divide-zinc-150 max-h-[500px] overflow-y-auto pr-2">
                {allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).length === 0 ? (
                  <div className="py-20 text-center space-y-4 text-zinc-300">
                    <ArrowRightLeft size={32} className="mx-auto opacity-30" />
                    <p className="text-xs font-black uppercase">Nenhuma alocação registrada.</p>
                  </div>
                ) : allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).map(alloc => {
                  const subject = subjects.find(s => s.id === alloc.subjectId);
                  const teacher = teachers.find(t => t.id === alloc.teacherId);
                  const slot = TIME_SLOTS.find(ts => ts.id === alloc.timeSlotId);
                  return (
                    <div key={alloc.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-zinc-50/50 px-2 rounded-xl transition-colors">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold text-[#32a041] bg-[#32a041]/10 border border-[#32a041]/20 px-2.5 py-1 rounded-xl uppercase">{alloc.dayOfWeek} • {slot?.label || alloc.timeSlotId.toUpperCase()}</span>
                        <h4 className="text-sm font-black text-zinc-805 uppercase mt-1.5 leading-none">{subject?.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-semibold uppercase">Docente: <span className="text-zinc-650 font-black">{teacher?.name || 'Não informado'}</span></p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] font-mono font-black uppercase text-zinc-405 border border-zinc-200 px-2.5 py-1 rounded-lg">Matriz {alloc.period}º Per</span>
                        <button type="button" onClick={() => handleRemoveAllocation(alloc.id)} className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 flex items-center justify-center transition-all cursor-pointer">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllocationsView;

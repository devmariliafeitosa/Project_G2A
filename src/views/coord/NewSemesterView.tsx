import React, { useState, useMemo, useEffect } from 'react';
import Toast, { useToast } from '../../components/Toast';
import SemesterCard from '../../components/coord/SemesterCard';
import {
  Plus, Calendar, Check, AlertTriangle, Trash2,
  CheckCircle2, BookOpen, Edit3, X, Lock, Sun, Moon, Sunset
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Course, Subject, AcademicSemester } from '../../index';

interface NewSemesterViewProps {
  user: User | null;
  courses: Course[];
  subjects: Subject[];
  semesters: AcademicSemester[];
  onAddSemester: (newSem: AcademicSemester) => void;
  onDeleteSemester?: (id: string) => void;
}

const TURNS = [
  { id: 'Manhã',  icon: Sun,    color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'Tarde',  icon: Sunset, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'Noite',  icon: Moon,   color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
];

export const NewSemesterView = ({
  user, courses, subjects, semesters, onAddSemester, onDeleteSemester
}: NewSemesterViewProps) => {

  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    const c = courses.find(c => c.coordinatorId === user?.id) || courses[0];
    return c ? c.id : '';
  });
  const selectedCourse = useMemo(() => courses.find(c => c.id === selectedCourseId) || courses[0], [courses, selectedCourseId]);

  useEffect(() => {
    const c = courses.find(c => c.coordinatorId === user?.id);
    if (c) setSelectedCourseId(c.id);
  }, [courses, user]);

  const courseSubjects = useMemo(() =>
    selectedCourse ? subjects.filter(s => s.courseId === selectedCourse.id) : []
  , [subjects, selectedCourse]);

  const courseSemesters = useMemo(() =>
    selectedCourse
      ? semesters.filter(s => s.courseId === selectedCourse.id).sort((a, b) => b.identification.localeCompare(a.identification))
      : []
  , [semesters, selectedCourse]);

  const availablePeriods = useMemo(() => {
    const fixed = [
      '2023.2','2024.1','2024.2','2025.1','2025.2',
      '2026.1','2026.2','2027.1','2027.2','2028.1','2028.2'
    ];
    const existing = courseSemesters.map(s => s.identification);
    return Array.from(new Set([...fixed, ...existing])).sort((a, b) => a.localeCompare(b));
  }, [courseSemesters]);

  // Form state
  const [matrixSemester, setMatrixSemester] = useState<number>(1);
  const [civilPeriod, setCivilPeriod] = useState<string>('2027.1');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [durationSemesters, setDurationSemesters] = useState<string>('1');
  const [turn, setTurn] = useState<string>('Manhã');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [activeSemesters, setActiveSemesters] = useState<number[]>([1]);
  const [availableForAllocation, setAvailableForAllocation] = useState<boolean>(true);
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingPeriodIdent, setDeletingPeriodIdent] = useState<string | null>(null);

  const { alert: toast, showToast: triggerToast } = useToast();

  const semestersWithDisciplines = useMemo(() => {
    const s = new Set<number>();
    if (selectedSubjectIds.length > 0) s.add(matrixSemester);
    courseSemesters.forEach(sem => {
      if (sem.identification.toUpperCase() === civilPeriod.trim().toUpperCase() && sem.matrixSemester && (sem.offeredSubjectIds?.length || 0) > 0)
        s.add(sem.matrixSemester);
    });
    return s;
  }, [selectedSubjectIds, matrixSemester, courseSemesters, civilPeriod]);

  useEffect(() => {
    setActiveSemesters(prev => {
      const f = prev.filter(n => semestersWithDisciplines.has(n));
      if (semestersWithDisciplines.has(matrixSemester) && !f.includes(matrixSemester)) f.push(matrixSemester);
      return f;
    });
  }, [semestersWithDisciplines, matrixSemester]);

  const periodsGrouped = useMemo(() => {
    const map: Record<string, { identification: string; semestersList: AcademicSemester[]; createdAt: string }> = {};
    courseSemesters.forEach(sem => {
      const id = sem.identification.toUpperCase().trim();
      if (!map[id]) map[id] = { identification: sem.identification, semestersList: [], createdAt: sem.createdAt };
      map[id].semestersList.push(sem);
    });
    return Object.values(map).sort((a, b) => b.identification.localeCompare(a.identification));
  }, [courseSemesters]);

  const handleEditClick = (sem: AcademicSemester) => {
    setEditingSemesterId(sem.id);
    setCivilPeriod(sem.identification);
    setMatrixSemester(sem.matrixSemester || 1);
    setSelectedSubjectIds(sem.offeredSubjectIds || []);
    setAvailableForAllocation(sem.availableForAllocation);
    setStartDate((sem as any).startDate || '');
    setEndDate((sem as any).endDate || '');
    setDurationSemesters(String((sem as any).durationSemesters || '1'));
    setTurn((sem as any).turn || 'Manhã');
    const activeFrom = courseSemesters.filter(s => s.identification.toUpperCase() === sem.identification.toUpperCase() && s.status === 'Ativo').map(s => s.matrixSemester || 1);
    setActiveSemesters(activeFrom);
    setErrorMsg(null);
    triggerToast(`Carregando ${sem.matrixSemester || 1}º Semestre de ${sem.identification} para edição.`, 'info');
  };

  const handleCancelEdit = () => {
    setEditingSemesterId(null);
    setMatrixSemester(1);
    setCivilPeriod('2027.1');
    setSelectedSubjectIds([]);
    setActiveSemesters([1]);
    setStartDate(''); setEndDate(''); setDurationSemesters('1'); setTurn('Manhã');
    setErrorMsg(null);
    triggerToast('Edição cancelada.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const clean = civilPeriod.trim();
    if (!clean) { setErrorMsg('Período Civil obrigatório.'); triggerToast('Erro: Período Civil vazio.', 'error'); return; }
    if (!/^\d{4}\.\d$/.test(clean)) { setErrorMsg('Formato inválido. Ex: 2027.1'); triggerToast('Erro: formato inválido.', 'error'); return; }
    if (selectedSubjectIds.length === 0) { setErrorMsg('Selecione ao menos uma disciplina.'); triggerToast('Erro: nenhuma disciplina marcada.', 'error'); return; }
    const ident = clean.toUpperCase();
    const dup = courseSemesters.some(s => s.id !== editingSemesterId && s.identification.toUpperCase() === ident && s.matrixSemester === matrixSemester);
    if (dup) { setErrorMsg(`Já existe ${ident} para o ${matrixSemester}º Semestre.`); triggerToast('Erro: duplicado.', 'error'); return; }

    const sId = editingSemesterId || `sem-${selectedCourseId}-${ident.replace('.', '-')}-${matrixSemester}`;
    const newSem: AcademicSemester & { startDate?: string; endDate?: string; durationSemesters?: number; turn?: string } = {
      id: sId,
      identification: ident,
      status: activeSemesters.includes(matrixSemester) ? 'Ativo' : 'Inativo',
      acceptPreferences: true,
      availableForAllocation,
      courseId: selectedCourseId,
      createdAt: new Date().toISOString(),
      offeredSubjectIds: selectedSubjectIds,
      matrixSemester,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      durationSemesters: durationSemesters ? parseInt(durationSemesters) : undefined,
      turn,
    };

    onAddSemester(newSem as AcademicSemester);
    courseSemesters.forEach(other => {
      if (other.id !== newSem.id && other.identification.toUpperCase() === ident && other.matrixSemester) {
        const active = activeSemesters.includes(other.matrixSemester);
        if (other.status !== (active ? 'Ativo' : 'Inativo'))
          onAddSemester({ ...other, status: active ? 'Ativo' : 'Inativo', acceptPreferences: true });
      }
    });

    setEditingSemesterId(null);
    triggerToast('Período salvo com sucesso!', 'success');
    if (matrixSemester < 5) setMatrixSemester(prev => prev + 1);
  };

  const handleDeleteConfirm = () => {
    if (!deletingPeriodIdent || !onDeleteSemester) return;
    courseSemesters.filter(s => s.identification.toUpperCase() === deletingPeriodIdent.toUpperCase()).forEach(s => onDeleteSemester(s.id));
    setDeletingPeriodIdent(null);
    triggerToast(`Período ${deletingPeriodIdent} excluído.`, 'success');
  };

  const availableSubjects = useMemo(() =>
    courseSubjects.filter(s => s.status !== 'Inativa')
  , [courseSubjects]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      <Toast alert={toast} />

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deletingPeriodIdent && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-zinc-100 max-w-md w-full shadow-2xl p-8 space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 size={22} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900 uppercase">Confirmar Exclusão</h3>
                <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
                  Excluir o período <strong className="text-zinc-800">{deletingPeriodIdent}</strong>? Isso apagará todas as ofertas vinculadas.
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setDeletingPeriodIdent(null)} className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">Cancelar</button>
                <button onClick={handleDeleteConfirm} className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg transition-all">Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#32a041] animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Parametrização do Sistema</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-2">Lançar Semestre Letivo</h1>
        <p className="text-zinc-500 text-sm font-medium">Gerencie a oferta de disciplinas, datas e turno do semestre.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT: Form */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-150/5 p-8 md:p-10 space-y-8">
          <div>
            <h3 className="text-xl font-black text-zinc-900 uppercase">
              {editingSemesterId ? 'Editar Oferta' : 'Configuração da Oferta'}
            </h3>
            <p className="text-zinc-400 text-xs font-semibold mt-1">Monte e vincule a matriz de disciplinas ao período civil.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Curso */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 pl-1 block">Curso</label>
              <div className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-650 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{selectedCourse?.name || 'Sem curso'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-[9px] font-extrabold text-zinc-400 px-2 py-1 rounded-lg uppercase tracking-widest shrink-0">
                  <Lock size={10} /><span>Vinculado</span>
                </div>
              </div>
            </div>

            {/* Semestre Matriz */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-455 pl-1 block">Semestre da Matriz *</label>
              <div className="grid grid-cols-5 gap-2">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setMatrixSemester(s)}
                    className={`h-12 rounded-2xl text-[11px] font-black uppercase transition-all border tracking-tight ${matrixSemester === s ? 'bg-[#32a041]/10 border-[#32a041] text-[#32a041] shadow-sm' : 'bg-zinc-50/50 border-zinc-150 text-zinc-500 hover:bg-zinc-50'}`}>
                    {s}º Sem
                  </button>
                ))}
              </div>
            </div>

            {/* Período Civil */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 pl-1 block">Período Civil *</label>
              <div className="relative">
                <select value={civilPeriod} onChange={e => setCivilPeriod(e.target.value)}
                  className="w-full h-12 bg-[#fffbec]/30 border border-zinc-250 rounded-2xl pl-11 pr-10 text-xs font-black uppercase tracking-widest outline-none focus:border-[#32a041]/30 text-zinc-800 shadow-inner appearance-none cursor-pointer">
                  {availablePeriods.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
              </div>
            </div>

            {/* Datas + Duração */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 pl-1 block">Data de Início</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 text-xs font-bold outline-none focus:border-[#32a041]/30 text-zinc-800 shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 pl-1 block">Data de Fim</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 text-xs font-bold outline-none focus:border-[#32a041]/30 text-zinc-800 shadow-inner" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 pl-1 block">Duração (semestres)</label>
                <input type="number" min="1" max="12" value={durationSemesters} onChange={e => setDurationSemesters(e.target.value)}
                  className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 text-xs font-bold outline-none focus:border-[#32a041]/30 text-zinc-800 shadow-inner" placeholder="Ex: 1" />
              </div>
            </div>

            {/* Turno */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 pl-1 block">Turno *</label>
              <div className="grid grid-cols-3 gap-3">
                {TURNS.map(({ id, icon: Icon, color }) => (
                  <button key={id} type="button" onClick={() => setTurn(id)}
                    className={`h-12 rounded-2xl border text-[11px] font-black uppercase flex items-center justify-center gap-2 transition-all ${turn === id ? color + ' shadow-sm' : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100'}`}>
                    <Icon size={14} />{id}
                  </button>
                ))}
              </div>
            </div>

            {/* Disciplinas — flat list, sem agrupamento por período */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-650 block">Disciplinas Ofertadas *</label>
                  <p className="text-[10px] text-zinc-400 font-semibold italic mt-0.5">
                    Selecione as disciplinas para o {matrixSemester}º Semestre ({civilPeriod}).
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => {
                    const ids = availableSubjects.filter(sub => {
                      const other = courseSemesters.find(s => s.id !== editingSemesterId && s.identification.toUpperCase() === civilPeriod.trim().toUpperCase() && s.matrixSemester !== matrixSemester && s.offeredSubjectIds?.includes(sub.id));
                      return !other;
                    }).map(s => s.id);
                    setSelectedSubjectIds(ids);
                    triggerToast('Todas marcadas.', 'info');
                  }} className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[8px] font-black uppercase tracking-wider transition-colors">
                    Marcar Todas
                  </button>
                  <button type="button" onClick={() => { setSelectedSubjectIds([]); triggerToast('Desmarcadas.', 'info'); }}
                    className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-lg text-[8px] font-black uppercase tracking-wider transition-colors">
                    Desmarcar
                  </button>
                </div>
              </div>

              {/* Flat list of subjects */}
              <div className="space-y-1.5 max-h-[280px] overflow-y-auto border border-zinc-150 rounded-2xl p-3 bg-zinc-50/20 shadow-inner">
                {availableSubjects.length === 0 ? (
                  <div className="text-center p-6 text-zinc-400 text-xs font-semibold uppercase">Nenhuma disciplina ativa neste curso.</div>
                ) : availableSubjects.map(sub => {
                  const isSelected = selectedSubjectIds.includes(sub.id);
                  const otherSem = courseSemesters.find(s => s.id !== editingSemesterId && s.identification.toUpperCase() === civilPeriod.trim().toUpperCase() && s.matrixSemester !== matrixSemester && s.offeredSubjectIds?.includes(sub.id));
                  const isBlocked = !!otherSem;
                  return (
                    <div key={sub.id}
                      onClick={() => {
                        if (isBlocked) { triggerToast(`Já vinculada ao ${otherSem.matrixSemester}º Semestre.`, 'error'); return; }
                        setSelectedSubjectIds(prev => isSelected ? prev.filter(id => id !== sub.id) : [...prev, sub.id]);
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-center gap-3 text-left ${isBlocked ? 'bg-zinc-100/50 border-zinc-250 opacity-60 cursor-not-allowed' : isSelected ? 'bg-emerald-50/40 border-emerald-250 hover:bg-emerald-50/60 cursor-pointer shadow-sm' : 'bg-white border-zinc-150 hover:bg-zinc-50/50 cursor-pointer'}`}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${isBlocked ? 'border-zinc-200 bg-zinc-100' : isSelected ? 'bg-[#32a041] border-[#32a041] text-white' : 'border-zinc-300 bg-white'}`}>
                        {isSelected && !isBlocked && <Check size={10} strokeWidth={4} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-black leading-tight truncate ${isBlocked ? 'text-zinc-400 line-through' : isSelected ? 'text-emerald-950' : 'text-zinc-700'}`}>{sub.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] font-mono font-bold uppercase text-zinc-400">{sub.code || sub.id.toUpperCase()}</span>
                          <span className="text-[8px] text-zinc-400 font-bold">{sub.workload}h</span>
                          <span className="text-[8px] text-zinc-400 font-bold">{sub.period}º Sem</span>
                        </div>
                      </div>
                      {isBlocked && (
                        <span className="text-[8px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded shrink-0">
                          Já no {otherSem.matrixSemester}º Sem
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-3 border border-zinc-150 text-[10px] font-bold uppercase text-zinc-650">
                <span>{selectedSubjectIds.length} disciplinas selecionadas</span>
                <span>Carga: {selectedSubjectIds.reduce((sum, id) => sum + (courseSubjects.find(s => s.id === id)?.workload || 0), 0)}h</span>
              </div>
            </div>

            {/* Semestres ativos concorrentes */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#32a041] block">Semestres Ativos Concorrentes</label>
                <p className="text-[10px] text-zinc-400 font-semibold italic mt-0.5">
                  Quais semestres rodam em paralelo em {civilPeriod}.
                </p>
              </div>
              <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-2xl space-y-2">
                {[1,2,3,4,5].map(num => {
                  const hasOffer = semestersWithDisciplines.has(num);
                  const isChecked = activeSemesters.includes(num);
                  return (
                    <label key={num} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${!hasOffer ? 'bg-zinc-100/50 border-zinc-200 opacity-60 cursor-not-allowed' : isChecked ? 'bg-white border-emerald-350 cursor-pointer shadow-xs' : 'bg-white border-zinc-200 hover:bg-zinc-50/50 cursor-pointer'}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" disabled={!hasOffer} checked={isChecked}
                          onChange={e => {
                            if (!hasOffer) return;
                            if (e.target.checked) { setActiveSemesters(p => [...p, num]); triggerToast(`${num}º Semestre ativado.`, 'success'); }
                            else { setActiveSemesters(p => p.filter(n => n !== num)); triggerToast(`${num}º Semestre inativado.`, 'info'); }
                          }}
                          className="w-4 h-4 rounded text-[#32a041] focus:ring-[#32a041]/30 border-zinc-300" />
                        <span className={`text-[11px] font-black block leading-none ${isChecked && hasOffer ? 'text-zinc-800' : 'text-zinc-505'}`}>{num}º Semestre Letivo</span>
                      </div>
                      {!hasOffer && <span className="text-[8px] font-extrabold uppercase text-zinc-400 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">Sem Ofertas</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <div className="pt-4 border-t border-zinc-50 flex justify-end gap-3">
              {editingSemesterId && (
                <button type="button" onClick={handleCancelEdit}
                  className="h-12 px-6 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
                  Cancelar
                </button>
              )}
              <button type="submit"
                className="h-12 px-8 bg-[#32a041] hover:bg-[#2a8737] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-700/10 active:scale-95 transition-all flex items-center gap-2">
                <Plus size={16} /> SALVAR PERÍODO
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT: History */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-150/5 p-8 flex flex-col min-h-[480px]">
            <div className="flex items-center justify-between pb-6 border-b border-zinc-100 mb-4">
              <div>
                <h3 className="text-md font-black text-zinc-900 uppercase">Histórico de Períodos</h3>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Calendários Acadêmicos Criados</p>
              </div>
              <span className="text-[10px] font-black uppercase bg-zinc-50 border border-zinc-150 px-2.5 py-0.5 rounded-lg text-zinc-400">
                {periodsGrouped.length} Registros
              </span>
            </div>

            {periodsGrouped.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-300 gap-4 py-16">
                <Calendar size={32} className="opacity-30" />
                <p className="text-xs font-black uppercase">Nenhum período lançado ainda.</p>
              </div>
            ) : (
              <div className="flex-1 divide-y divide-zinc-100 overflow-y-auto max-h-[520px] pr-1">
                {periodsGrouped.map(period => (
                  <SemesterCard
                    key={period.identification}
                    period={period}
                    onEdit={handleEditClick}
                    onDeletePeriod={onDeleteSemester ? ident => setDeletingPeriodIdent(ident) : undefined}
                  />
                ))}
              </div>
            )}

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 mt-6 space-y-1.5">
              <span className="text-[8px] font-black uppercase tracking-widest text-[#32a041] block">DIRETRIZES DE AUDITORIA</span>
              <p className="text-[10px] font-medium leading-relaxed text-zinc-400 uppercase tracking-wider">
                O salvamento reinicia o banco de preferências do período correspondente. A exclusão não apaga simulações históricas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewSemesterView;

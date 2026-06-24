import React, { useState, useMemo, useEffect } from 'react';
import Toast, { useToast } from '../../components/Toast';
import StatCard from '../../components/StatCard';
import SemesterCard from '../../components/coord/SemesterCard';
import { 
  Plus, 
  Calendar, 
  Check, 
  AlertTriangle, 
  Info, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  GraduationCap, 
  UserCheck,
  Building2,
  BookOpen,
  Edit3,
  X,
  Compass,
  Zap,
  Layers,
  Lock
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

export const NewSemesterView = ({ 
  user, 
  courses, 
  subjects, 
  semesters, 
  onAddSemester,
  onDeleteSemester
}: NewSemesterViewProps) => {

  // --- Core States ---
  
  // 1. Course Selector state
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    const coordinated = courses.find(c => c.coordinatorId === user?.id) || courses[0];
    return coordinated ? coordinated.id : '';
  });

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  // Sync course selector if user is coordinated to a course
  useEffect(() => {
    const coordinated = courses.find(c => c.coordinatorId === user?.id);
    if (coordinated) {
      setSelectedCourseId(coordinated.id);
    }
  }, [courses, user]);

  // Derived subjects of the selected course
  const courseSubjects = useMemo(() => {
    if (!selectedCourse) return [];
    return subjects.filter(s => s.courseId === selectedCourse.id);
  }, [subjects, selectedCourse]);

  // Derived semesters of the selected course
  const courseSemesters = useMemo(() => {
    if (!selectedCourse) return [];
    return semesters.filter(s => s.courseId === selectedCourse.id)
      .sort((a, b) => b.identification.localeCompare(a.identification));
  }, [semesters, selectedCourse]);

  const availablePeriods = useMemo(() => {
    const fixed = [
      '2023.2', '2024.1', '2024.2', '2025.1', '2025.2', 
      '2026.1', '2026.2', '2027.1', '2027.2', 
      '2028.1', '2028.2', '2029.1', '2029.2', '2030.1', '2030.2'
    ];
    const existing = courseSemesters.map(s => s.identification);
    const combined = Array.from(new Set([...fixed, ...existing])).filter(Boolean);
    return combined.sort((a, b) => a.localeCompare(b));
  }, [courseSemesters]);

  // 2. Semestre Matriz (1 to 5)
  const [matrixSemester, setMatrixSemester] = useState<number>(1);

  // 3. Período Civil (mask constraint pattern)
  const [civilPeriod, setCivilPeriod] = useState<string>('2027.1');

  // 4. Offered subjects for the selected semester
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // 5. Active semesters list constraint (e.g. 1 to 5 that run concurrently in this civil period)
  const [activeSemesters, setActiveSemesters] = useState<number[]>([1]);

  // 6. Settings toggles
  const [availableForAllocation, setAvailableForAllocation] = useState<boolean>(true);

  // 7. Edit state
  const [editingSemesterId, setEditingSemesterId] = useState<string | null>(null);

  // 8. Inline form validation message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 9. Período Civil exclusão
  const [deletingPeriodIdent, setDeletingPeriodIdent] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const { alert: toast, showToast: triggerToast } = useToast();


  // Grouped subjects of the selected course by curricular structure
  const subjectsByPeriod = useMemo(() => {
    const map: Record<number, Subject[]> = {};
    courseSubjects.forEach(s => {
      const p = s.period || 1;
      if (!map[p]) map[p] = [];
      map[p].push(s);
    });
    return map;
  }, [courseSubjects]);

  const sortedCurricularPeriods = useMemo(() => {
    return Object.keys(subjectsByPeriod).map(Number).sort((a, b) => a - b);
  }, [subjectsByPeriod]);

  // Which semesters options (1 to 5) are activeable based on non-empty subject structures
  const semestersWithDisciplines = useMemo(() => {
    const activeSet = new Set<number>();
    
    // 1. The currently evaluated matrixSemester in editor counts if it has subjects selected
    if (selectedSubjectIds.length > 0) {
      activeSet.add(matrixSemester);
    }

    // 2. Any other matrix semester already saved in the history under this SAME Periodo Civil
    courseSemesters.forEach(sem => {
      if (
        sem.identification.toUpperCase() === civilPeriod.trim().toUpperCase() &&
        sem.matrixSemester &&
        sem.offeredSubjectIds &&
        sem.offeredSubjectIds.length > 0
      ) {
        activeSet.add(sem.matrixSemester);
      }
    });

    return activeSet;
  }, [selectedSubjectIds, matrixSemester, courseSemesters, civilPeriod]);

  // Adjust activeSemesters to exclude those that are no longer eligible
  useEffect(() => {
    setActiveSemesters(prev => {
      const filtered = prev.filter(num => semestersWithDisciplines.has(num));
      // Always include matrixSemester if it is qualified and isn't included yet
      if (semestersWithDisciplines.has(matrixSemester) && !filtered.includes(matrixSemester)) {
        filtered.push(matrixSemester);
      }
      return filtered;
    });
  }, [semestersWithDisciplines, matrixSemester]);

  // Group courseSemesters chronologically by Periodo Civil ("2027.1") for the History List
  const periodsGrouped = useMemo(() => {
    const map: Record<string, {
      identification: string;
      semestersList: AcademicSemester[];
      createdAt: string;
    }> = {};

    courseSemesters.forEach(sem => {
      const ident = sem.identification.toUpperCase().trim();
      if (!map[ident]) {
        map[ident] = {
          identification: sem.identification,
          semestersList: [],
          createdAt: sem.createdAt
        };
      }
      map[ident].semestersList.push(sem);
    });

    return Object.values(map).sort((a, b) => b.identification.localeCompare(a.identification));
  }, [courseSemesters]);

  const handleEditClick = (sem: AcademicSemester) => {
    setEditingSemesterId(sem.id);
    setCivilPeriod(sem.identification);
    setMatrixSemester(sem.matrixSemester || 1);
    setSelectedSubjectIds(sem.offeredSubjectIds || []);
    setAvailableForAllocation(sem.availableForAllocation);

    // Load active semesters list from all concurrent active states
    const activeFromSems = courseSemesters
      .filter(s => s.identification.toUpperCase() === sem.identification.toUpperCase() && s.status === 'Ativo')
      .map(s => s.matrixSemester || 1);
    
    setActiveSemesters(activeFromSems);
    setErrorMsg(null);
    triggerToast(`Carregando ${sem.matrixSemester || 1}º Semestre do Período ${sem.identification} para edição.`, 'info');
  };

  const handleCancelEdit = () => {
    setEditingSemesterId(null);
    setMatrixSemester(1);
    setCivilPeriod('2027.1');
    setSelectedSubjectIds([]);
    setActiveSemesters([1]);
    setErrorMsg(null);
    triggerToast('Edição cancelada. Formulário de lançamento restaurado.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Civil Period Mask Validation
    const cleanPeriod = civilPeriod.trim();
    if (!cleanPeriod) {
      setErrorMsg("O Período Civil do calendário acadêmico é obrigatório.");
      triggerToast("Erro de validação: Período Civil vazio.", "error");
      return;
    }

    // Mask check for standard formats like "2027.1"
    const periodRegex = /^\d{4}\.\d$/;
    if (!periodRegex.test(cleanPeriod)) {
      setErrorMsg("Formato inválido de Período Civil. Esperado padrão AAAA.P (ex: 2027.1, 2027.2).");
      triggerToast("Erro de validação: formato do Período Civil inválido.", "error");
      return;
    }

    // 2. Offereing disciplines selection check
    if (selectedSubjectIds.length === 0) {
      setErrorMsg("Selecione ao menos uma disciplina da matriz curricular para compor a oferta do semestre.");
      triggerToast("Erro de validação: nenhuma disciplina marcada.", "error");
      return;
    }

    const cleanIdent = cleanPeriod.toUpperCase();

    // 3. Duplicate check for current matrix semester inside SAME period civil
    const duplicate = courseSemesters.some(
      s => s.id !== editingSemesterId && 
           s.identification.toUpperCase() === cleanIdent && 
           s.matrixSemester === matrixSemester
    );

    if (duplicate) {
      setErrorMsg(`Já existe um período cadastrado com esta identificação (${cleanIdent}) para o ${matrixSemester}º Semestre Matriz.`);
      triggerToast("Erro: Registro duplicado.", "error");
      return;
    }

    // Generate unique ID for this Course + Period Civil + MatrixSemester
    const sId = editingSemesterId || `sem-${selectedCourseId}-${cleanIdent.replace('.', '-')}-${matrixSemester}`;
    
    const isThisSemActive = activeSemesters.includes(matrixSemester);

    const newSem: AcademicSemester = {
      id: sId,
      identification: cleanIdent,
      status: isThisSemActive ? 'Ativo' : 'Inativo',
      acceptPreferences: true, // "Gatilho: altera estado para Período de Planejamento Aberto liberando acesso pro PROF-002"
      availableForAllocation: availableForAllocation,
      courseId: selectedCourseId,
      createdAt: new Date().toISOString(),
      offeredSubjectIds: selectedSubjectIds,
    };

    const [deletingPeriodIdent, setDeletingPeriodIdent] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
    // Save/Update current Semester
    onAddSemester(newSem);

    // Synchronize concurrent active statuses of other already-saved semesters of this same Course + Period Civil
    courseSemesters.forEach(otherSem => {
      if (
        otherSem.id !== newSem.id &&
        otherSem.identification.toUpperCase() === cleanIdent &&
        otherSem.matrixSemester
      ) {
        const isNowActive = activeSemesters.includes(otherSem.matrixSemester);
        const targetStatus = isNowActive ? 'Ativo' : 'Inativo';
        if (otherSem.status !== targetStatus) {
          onAddSemester({
            ...otherSem,
            status: targetStatus,
            acceptPreferences: true // ensure preference is synchronized
          });
        }
      }
    });

    // Resetting page configurations
    setEditingSemesterId(null);
    triggerToast("Período salvo com sucesso! O sistema abrirá o prazo para que os professores selecionem suas preferências.", "success");
    
    // Move to next logical vacant matrixSemester for easier continuous data entry
    if (matrixSemester < 5) {
      setMatrixSemester(prev => prev + 1);
    }
  };

  // Delete/Exclude execution
  const handleDeleteConfirm = () => {
    if (!deletingPeriodIdent) return;

    if (onDeleteSemester) {
      const targetSemsObj = courseSemesters.filter(
        s => s.identification.toUpperCase() === deletingPeriodIdent.toUpperCase()
      );

      // Remove each of them
      targetSemsObj.forEach(s => {
        onDeleteSemester(s.id);
      });

      triggerToast(`Período acadêmico ${deletingPeriodIdent} excluído com sucesso!`, 'success');
    }

    setDeletingPeriodIdent(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      <Toast alert={toast} />

      {/* Delete Confirmation Modal Overlay */}
      <AnimatePresence>
        {deletingPeriodIdent && (
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-zinc-100 max-w-md w-full shadow-2xl p-8 space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                <Trash2 size={22} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-black text-zinc-900 uppercase">Confirmar Exclusão</h3>
                <p className="text-zinc-500 text-xs font-semibold leading-relaxed">
                  Deseja realmente excluir o período civil <strong className="text-zinc-800">{deletingPeriodIdent}</strong>? Esta ação apagará as ofertas vinculadas a todos os semestres deste período.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingPeriodIdent(null);
                    triggerToast("Exclusão cancelada pelo usuário.", "info");
                  }}
                  className="flex-1 h-12 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="flex-1 h-12 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-lg shadow-rose-600/10 transition-all active:scale-95"
                >
                  Excluir Período
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Page Title Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#32a041] animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Parametrização do Sistema</span>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-2">
            Lançar Semestre Letivo
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Gerencie o catálogo de disciplinas oferecidas, vincule os períodos civis e defina parâmetros de ativação imediata.
          </p>
        </div>
      </header>

      {/* Split Screens Layout */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* LADO ESQUERDO: Painel de Configuração da Oferta */}
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl shadow-zinc-150/5 p-8 md:p-10 space-y-8">
          
          <div className="space-y-2">
            <h3 className="text-xl font-black text-zinc-900 uppercase">
              {editingSemesterId ? "Editar Estrutura de Oferta" : "Configuração da Oferta"}
            </h3>
            <p className="text-zinc-400 text-xs font-semibold">
              Monte e vincule a matriz de disciplinas ao período civil do calendário acadêmico.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. SELETOR DE CURSO */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 pl-1 block">
                Curso Sob Gestão
              </label>
              <div className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 flex items-center justify-between text-xs font-black uppercase tracking-wider text-zinc-650 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{selectedCourse?.name || 'Administração Curricular'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-[9px] font-extrabold text-zinc-400 px-2 py-1 rounded-lg uppercase tracking-widest shrink-0">
                  <Lock size={10} />
                  <span>Vinculado</span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 font-semibold italic pl-1">Identificado automaticamente pelo perfil de coordenação ativo.</p>
            </div>

            {/* 2. SELETOR DE SEMESTRE MATRIZ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-455 pl-1 block">
                Semestre da Estrutura Curricular (Matriz) *
              </label>
              
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((s) => {
                  const isActive = matrixSemester === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMatrixSemester(s)}
                      className={`h-12 rounded-2xl text-[11px] font-black uppercase transition-all border block tracking-tight ${
                        isActive
                          ? 'bg-[#32a041]/10 border-[#32a041] text-[#32a041] shadow-sm'
                          : 'bg-zinc-50/50 border-zinc-150 text-zinc-500 hover:bg-zinc-50'
                      }`}
                    >
                      {s}º Período
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-400 font-semibold italic pl-1">Identifica o semestre correspondente do plano do curso de ADS (1º ao 5º).</p>
            </div>

            {/* 4. SELETOR DE PERÍODO CIVIL */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-450 pl-1 block">
                Período Civil do Calendário Acadêmico *
              </label>
              <div className="relative">
                <select
                  value={civilPeriod}
                  onChange={(e) => setCivilPeriod(e.target.value)}
                  className="w-full h-12 bg-[#fffbec]/30 border border-zinc-250 rounded-2xl pl-11 pr-10 text-xs font-black uppercase tracking-widest outline-none focus:border-[#32a041]/30 text-zinc-800 shadow-inner appearance-none cursor-pointer"
                >
                  {availablePeriods.map((period) => (
                    <option key={period} value={period}>
                      {period}
                    </option>
                  ))}
                </select>
                <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 flex items-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.1" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="text-[10px] text-zinc-400 font-semibold italic pl-1">Selecione o período civil correspondente (Formato: AAAA.P).</p>
            </div>

            {/* 3. GRADE DE DISCIPLINAS DISPONÍVEIS */}
            <div className="space-y-3 pt-3 border-t border-zinc-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-650 pl-0.5 block">
                    Grade de Disciplinas Curriculares *
                  </label>
                  <p className="text-[10px] text-zinc-400 font-semibold italic">
                    Selecione quais disciplinas farão parte do {matrixSemester}º Semestre Matriz no período {civilPeriod}.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      // Filters out blocked disciplines before select all
                      const matchAvailable = courseSubjects
                        .filter(sub => {
                          const otherSem = courseSemesters.find(
                            sem => sem.id !== editingSemesterId && 
                                   sem.identification.toUpperCase() === civilPeriod.trim().toUpperCase() && 
                                   sem.matrixSemester !== matrixSemester && 
                                   sem.offeredSubjectIds?.includes(sub.id)
                          );
                          return !otherSem && sub.status !== 'Inativa';
                        })
                        .map(s => s.id);
                      setSelectedSubjectIds(matchAvailable);
                      triggerToast("Todas as disciplinas disponíveis marcadas.", "info");
                    }}
                    className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-[8px] font-black uppercase tracking-wider transition-colors"
                  >
                    Marcar Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubjectIds([]);
                      triggerToast("Grade desmarcada.", "info");
                    }}
                    className="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-lg text-[8px] font-black uppercase tracking-wider transition-colors"
                  >
                    Desmarcar Todas
                  </button>
                </div>
              </div>

              {/* Box Containing unified course subjects with custom block warning */}
              <div className="space-y-5 max-h-[290px] overflow-y-auto border border-zinc-150 rounded-2xl p-4 bg-zinc-50/20 shadow-inner">
                {sortedCurricularPeriods.length === 0 ? (
                  <div className="text-center p-6 text-zinc-400 text-xs font-semibold uppercase">Nenhuma disciplina cadastrada neste curso.</div>
                ) : (
                  sortedCurricularPeriods.map(periodNum => {
                    const periodSubjects = subjectsByPeriod[periodNum] || [];
                    return (
                      <div key={periodNum} className="space-y-2">
                        <div className="flex items-center gap-2 border-b border-zinc-100 pb-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Estrutura Curricular: {periodNum}º Período
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {periodSubjects.map(sub => {
                            const isSelected = selectedSubjectIds.includes(sub.id);
                            
                            // Check rule: "uma disciplina nao pode estar em 2 semestres ao mesmo tempo"
                            const otherSem = courseSemesters.find(
                              sem => sem.id !== editingSemesterId && 
                                     sem.identification.toUpperCase() === civilPeriod.trim().toUpperCase() && 
                                     sem.matrixSemester !== matrixSemester && 
                                     sem.offeredSubjectIds?.includes(sub.id)
                            );
                            const isBlocked = !!otherSem;

                            return (
                              <div
                                key={sub.id}
                                onClick={() => {
                                  if (isBlocked) {
                                    triggerToast(`Disciplina já vinculada ao ${otherSem.matrixSemester}º Semestre deste mesmo período civil.`, 'error');
                                    return;
                                  }
                                  setSelectedSubjectIds(prev => 
                                    isSelected 
                                      ? prev.filter(id => id !== sub.id)
                                      : [...prev, sub.id]
                                  );
                                }}
                                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-left ${
                                  isBlocked
                                    ? 'bg-zinc-100/50 border-zinc-250 opacity-60 cursor-not-allowed select-none'
                                    : isSelected 
                                      ? 'bg-emerald-50/40 border-emerald-250 hover:bg-emerald-50/60 cursor-pointer shadow-sm' 
                                      : 'bg-white border-zinc-150 hover:bg-zinc-50/50 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-center justify-between w-full min-w-0">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                                      isBlocked
                                        ? 'border-zinc-200 bg-zinc-100 text-zinc-400'
                                        : isSelected 
                                          ? 'bg-[#32a041] border-[#32a041] text-white' 
                                          : 'border-zinc-300 bg-white'
                                    }`}>
                                      {isSelected && <Check size={10} strokeWidth={4} />}
                                    </div>
                                    <div className="truncate">
                                      <p className={`text-[11px] font-black leading-tight ${
                                        isBlocked 
                                          ? 'text-zinc-400 font-semibold line-through' 
                                          : isSelected 
                                            ? 'text-emerald-950' 
                                            : 'text-zinc-700'
                                      }`}>
                                        {sub.name}
                                      </p>
                                      <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[8px] font-mono font-bold uppercase text-zinc-400">
                                          {sub.code || sub.id.toUpperCase()}
                                        </span>
                                        <span className="text-zinc-200 text-[8px]">•</span>
                                        <span className="text-[8px] text-zinc-400 font-bold uppercase">
                                          {sub.workload}h
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {isBlocked && (
                                    <span className="text-[8px] font-black uppercase text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded shrink-0 leading-none">
                                      Já no {otherSem.matrixSemester}º Sem
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Indicator metrics badge */}
              <div className="flex items-center justify-between bg-zinc-50 rounded-xl p-3 border border-zinc-150 text-[10px] font-bold uppercase text-zinc-650">
                <span>Disciplinas Selecionadas: {selectedSubjectIds.length}</span>
                <span>Carga Horária: {selectedSubjectIds.reduce((sum, id) => sum + (courseSubjects.find(s => s.id === id)?.workload || 0), 0)}h</span>
              </div>
            </div>


            {/* Error messaging inside form */}
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-bold uppercase tracking-wider"
              >
                <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Actions Panel */}
            <div className="pt-4 border-t border-zinc-50 flex justify-end gap-3 font-sans">
              {editingSemesterId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="h-12 px-6 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all outline-none"
                >
                  Cancelar Edição
                </button>
              )}
              <button
                type="submit"
                className="h-12 px-8 bg-[#32a041] hover:bg-[#2a8737] text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-700/10 active:scale-95 transition-all flex items-center gap-2 outline-none"
              >
                <Plus size={16} />
                SALVAR PERÍODO E SEMESTRE
              </button>
            </div>
            
          </form>
        </div>

        {/* LADO DIREITO: Painel de Histórico e Auditoria */}

      </div>
      {/* History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-zinc-100 max-w-lg w-full shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 uppercase">Histórico de Períodos</h3>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">{periodsGrouped.length} registros</p>
                </div>
                <button onClick={() => setShowHistoryModal(false)}
                  className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-all">
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 px-6">
                {periodsGrouped.length === 0 ? (
                  <div className="py-16 text-center text-zinc-400">
                    <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                    <p className="text-xs font-black uppercase">Nenhum período lançado ainda.</p>
                  </div>
                ) : periodsGrouped.map(period => (
                  <SemesterCard
                    key={period.identification}
                    period={period}
                    onEdit={s => { handleEditClick(s); setShowHistoryModal(false); }}
                    onDeletePeriod={onDeleteSemester ? ident => { setDeletingPeriodIdent(ident); setShowHistoryModal(false); } : undefined}
                  />
                ))}
              </div>
              <div className="p-4 border-t border-zinc-100">
                <button onClick={() => setShowHistoryModal(false)}
                  className="w-full h-10 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all">
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
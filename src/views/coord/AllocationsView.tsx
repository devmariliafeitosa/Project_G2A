import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  UserCheck, 
  AlertTriangle, 
  Check, 
  HelpCircle, 
  Clock, 
  Calendar, 
  BookOpen, 
  Plus, 
  Trash2, 
  Sliders, 
  User, 
  Info, 
  X,
  Sparkles,
  Lock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Hash,
  Activity,
  Bookmark,
  UserPlus,
  ArrowLeft,
  ChevronLeft,
  BookMarked,
  Layers,
  GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, Course, Subject, AcademicSemester, ScheduleEntry, WorkRegime, LeaveType } from '../../index';

interface AllocationsViewProps {
  user: UserType | null;
  teachers: UserType[];
  subjects: Subject[];
  courses: Course[];
  semesters: AcademicSemester[];
  allocations: ScheduleEntry[];
  onAddAllocation: (newEntry: ScheduleEntry) => void;
  onDeleteAllocation: (id: string) => void;
  onNavigate?: (view: string) => void;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

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
  user,
  teachers,
  subjects,
  courses,
  semesters,
  allocations,
  onAddAllocation,
  onDeleteAllocation,
  onNavigate
}: AllocationsViewProps) => {

  // Newly added IDs in this session to mark as blue ("recém adicionado")
  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

  // Stepper Current Flow state: 1 = Planejamento, 2 = Montagem da Grade
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Side Drawer Open state for Flow 2 (agenda, rules, conflicts)
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // --- Filter states ---
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    const coordinated = courses.find(c => c.coordinatorId === user?.id) || courses[0];
    return coordinated ? coordinated.id : '';
  });

  const selectedCourse = useMemo(() => {
    return courses.find(c => c.id === selectedCourseId) || courses[0];
  }, [courses, selectedCourseId]);

  const courseSemesters = useMemo(() => {
    if (!selectedCourse) return [];
    const filtered = semesters.filter(s => s.courseId === selectedCourse.id);
    if (filtered.length === 0) {
      // Fallback semesters so we always have a dynamic semester available for allocation
      return [
        { id: `fallback-${selectedCourse.id}-2024.1`, identification: '2024.1', status: 'Inativo' as const, acceptPreferences: true, availableForAllocation: true, courseId: selectedCourse.id, createdAt: '' },
        { id: `fallback-${selectedCourse.id}-2024.2`, identification: '2024.2', status: 'Ativo' as const, acceptPreferences: true, availableForAllocation: true, courseId: selectedCourse.id, createdAt: '' },
        { id: `fallback-${selectedCourse.id}-2025.1`, identification: '2025.1', status: 'Inativo' as const, acceptPreferences: true, availableForAllocation: true, courseId: selectedCourse.id, createdAt: '' }
      ];
    }
    return filtered;
  }, [semesters, selectedCourse]);

  const activeSemesterIdent = useMemo(() => {
    const active = courseSemesters.find(s => s.status === 'Ativo');
    return active ? active.identification : (courseSemesters[0]?.identification || '2024.1');
  }, [courseSemesters]);

  const [selectedSemester, setSelectedSemester] = useState<string>(activeSemesterIdent);
  const [selectedMatrixSemester, setSelectedMatrixSemester] = useState<number>(1);

  useEffect(() => {
    if (activeSemesterIdent) {
      setSelectedSemester(activeSemesterIdent);
    }
  }, [activeSemesterIdent]);

  // Sync coordinated course automatically on login
  useEffect(() => {
    const coordinated = courses.find(c => c.coordinatorId === user?.id);
    if (coordinated) {
      setSelectedCourseId(coordinated.id);
    }
  }, [courses, user]);

  const currentSemesterObj = useMemo(() => {
    return courseSemesters.find(s => s.identification === selectedSemester);
  }, [courseSemesters, selectedSemester]);

  // Offered subjects for current Academic Semester & active Matrix Period
  const offeredSubjects = useMemo(() => {
    if (!selectedCourse) return [];
    // 1. Não exibir disciplinas de outros cursos
    // 2. Não exibir disciplinas desativadas ou fora da matriz vigente
    const activeCourseSubjects = subjects.filter(
      s => s.courseId === selectedCourse.id && s.status !== 'Inativa'
    );
    // 3. Não exibir disciplinas já concluídas em semestres anteriores quando não fizerem parte do semestre selecionado
    return activeCourseSubjects.filter(s => s.period === selectedMatrixSemester);
  }, [subjects, selectedCourse, selectedMatrixSemester]);

  // Active teachers
  const activeTeachers = useMemo(() => {
    return teachers.filter(t => t.status === 'Ativo');
  }, [teachers]);

  const getTeacherTimeLimit = (tUser: UserType) => {
    if (tUser.cargaHoraria && tUser.cargaHoraria > 0) return tUser.cargaHoraria;
    if (tUser.role) {
      const normalizedRole = String(tUser.role).trim().toLowerCase();
      if (
        normalizedRole === 'coordenador' ||
        normalizedRole === 'diretor' ||
        normalizedRole === 'vice-diretor' ||
        normalizedRole === 'vicediretor' ||
        normalizedRole === 'vice diretor'
      ) {
        return 10;
      }
    }
    if (tUser.regime === 'Dedicação Exclusiva' || tUser.regime === '40 Horas') return 20; 
    return 10; 
  };

  // Vínculo Selection form states
  const [allocatedSubjectId, setAllocatedSubjectId] = useState<string>('');
  const [allocatedTeacherId, setAllocatedTeacherId] = useState<string>('');
  const [allocatedRoom, setAllocatedRoom] = useState<string>('');
  const [allocatedBlock, setAllocatedBlock] = useState<string>('');

  // Smart select search & dropdown state
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>('');
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState<boolean>(false);

  const selectedSubject = useMemo(() => {
    return subjects.find(s => s.id === allocatedSubjectId);
  }, [subjects, allocatedSubjectId]);

  const selectedTeacher = useMemo(() => {
    return teachers.find(t => t.id === allocatedTeacherId);
  }, [teachers, allocatedTeacherId]);

  const requiredSlotsCount = useMemo(() => {
    if (!selectedSubject) return 0;
    return Math.max(1, Math.ceil(selectedSubject.workload / 20));
  }, [selectedSubject]);

  const [selectedSlots, setSelectedSlots] = useState<{ day: string; slotId: string }[]>([]);
  const [selectedTurn, setSelectedTurn] = useState<'Manhã' | 'Tarde' | 'Noite'>('Manhã');

  const filteredSlots = useMemo(() => {
    if (selectedTurn === 'Manhã') {
      return TIME_SLOTS.filter(s => s.id.startsWith('m'));
    }
    if (selectedTurn === 'Tarde') {
      return TIME_SLOTS.filter(s => s.id.startsWith('t') || s.id === 'lunch');
    }
    return TIME_SLOTS.filter(s => s.id.startsWith('n'));
  }, [selectedTurn]);

  // Reset selected slots on chosen subject/teacher changes
  useEffect(() => {
    setSelectedSlots([]);
  }, [allocatedSubjectId, allocatedTeacherId]);

  const DAYS_ORDER = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const getNextDay = (day: string): string | null => {
    const index = DAYS_ORDER.indexOf(day);
    if (index === -1 || index === DAYS_ORDER.length - 1) return null;
    return DAYS_ORDER[index + 1];
  };

  const getPrevDay = (day: string): string | null => {
    const index = DAYS_ORDER.indexOf(day);
    if (index <= 0) return null;
    return DAYS_ORDER[index - 1];
  };

  const checkInterjornadaConflict = (day: string, slotId: string, teacherId: string) => {
    if (!teacherId) return null;
    const prevDay = getPrevDay(day);
    const nextDay = getNextDay(day);

    if (slotId === 'm1' && prevDay) {
      const hasLateNightExisting = allocations.some(
        a => a.teacherId === teacherId && a.dayOfWeek === prevDay && a.timeSlotId === 'n4' && a.semester === selectedSemester
      );
      const hasLateNightTemp = selectedSlots.some(
        s => s.day === prevDay && s.slotId === 'n4'
      );
      if (hasLateNightExisting || hasLateNightTemp) {
        return {
          hasConflict: true,
          reason: `Primeira aula (${day} 07:25) após ministrar o último horário do dia anterior (${prevDay} 22:40).`
        };
      }
    }

    if (slotId === 'n4' && nextDay) {
      const hasEarlyMorningExisting = allocations.some(
        a => a.teacherId === teacherId && a.dayOfWeek === nextDay && a.timeSlotId === 'm1' && a.semester === selectedSemester
      );
      const hasEarlyMorningTemp = selectedSlots.some(
        s => s.day === nextDay && s.slotId === 'm1'
      );
      if (hasEarlyMorningExisting || hasEarlyMorningTemp) {
        return {
          hasConflict: true,
          reason: `Último horário (22:40) se houver primeira aula do dia seguinte (${nextDay} 07:25).`
        };
      }
    }

    return null;
  };

  // Sync choices defaults
  useEffect(() => {
    if (offeredSubjects.length > 0) {
      setAllocatedSubjectId(offeredSubjects[0].id);
    } else {
      setAllocatedSubjectId('');
    }
  }, [offeredSubjects]);

  useEffect(() => {
    if (activeTeachers.length > 0) {
      setAllocatedTeacherId(activeTeachers[0].id);
    } else {
      setAllocatedTeacherId('');
    }
  }, [activeTeachers]);

  // Notifications systems
  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // Validation detector based on selected parameters
  const conflictsAndWarnings = useMemo(() => {
    const errorList: string[] = [];
    const warningList: string[] = [];

    if (!allocatedSubjectId || !allocatedTeacherId) return { errorList, warningList };

    const selectedSub = subjects.find(s => s.id === allocatedSubjectId);
    if (!selectedSub) return { errorList, warningList };

    const teacher = teachers.find(t => t.id === allocatedTeacherId);
    if (!teacher) return { errorList, warningList };

    // Workload ceiling check
    const teacherAllocations = allocations.filter(
      entry => entry.teacherId === teacher.id && entry.semester === selectedSemester
    );
    const currentTeacherHours = teacherAllocations.length * 2; 
    const maxAllowedHours = getTeacherTimeLimit(teacher);

    if (currentTeacherHours + (requiredSlotsCount * 2) > maxAllowedHours) {
      warningList.push(`Limite de Horas excedido: Esta alocação (${requiredSlotsCount * 2}h) fará o docente ${teacher.name} ultrapassar sua carga máxima semanal de ${maxAllowedHours}h de aula (atualmente em ${currentTeacherHours}h).`);
    }

    // Leave check
    if (teacher.leaveType && teacher.leaveType !== LeaveType.Nenhum) {
      warningList.push(`Docente Afastado: ${teacher.name} está sob licença/afastamento oficial (${teacher.leaveType}).`);
    }

    // Classroom preference
    const preferredSubjects = teacher.disciplinasMinistradas || [];
    if (preferredSubjects.length > 0 && !preferredSubjects.includes(allocatedSubjectId)) {
      warningList.push(`Ausência de preferência: "${selectedSub.name}" não está listada no plano de interesse docente do professor ${teacher.name}.`);
    }

    // Dynamic conflict warning for each selected slot in Flow 2
    selectedSlots.forEach(slot => {
      const matrixCollided = allocations.find(
        entry => entry.courseId === selectedCourseId &&
                 entry.period === selectedMatrixSemester &&
                 entry.dayOfWeek === slot.day &&
                 entry.timeSlotId === slot.slotId &&
                 entry.semester === selectedSemester
      );
      if (matrixCollided) {
        const otherSub = subjects.find(s => s.id === matrixCollided.subjectId);
        errorList.push(`Conflito de Grade: Já existe a matéria "${otherSub?.name}" marcada para o ${selectedMatrixSemester}ºS na ${slot.day} (${TIME_SLOTS.find(ts => ts.id === slot.slotId)?.label}).`);
      }

      const teacherOccupied = allocations.find(
        entry => entry.teacherId === teacher.id &&
                 entry.dayOfWeek === slot.day &&
                 entry.timeSlotId === slot.slotId &&
                 entry.semester === selectedSemester
      );
      if (teacherOccupied) {
        const otherSubName = subjects.find(s => s.id === teacherOccupied.subjectId)?.name || 'Outro curso';
        errorList.push(`Professor Indisponível: ${teacher.name} já ministra "${otherSubName}" em outro horário ou turma na ${slot.day} (${TIME_SLOTS.find(ts => ts.id === slot.slotId)?.label}).`);
      }

      const interjornada = checkInterjornadaConflict(slot.day, slot.slotId, teacher.id);
      if (interjornada) {
        errorList.push(`Descanso Violado em ${slot.day} (${TIME_SLOTS.find(ts => ts.id === slot.slotId)?.label}): ${interjornada.reason}`);
      }
    });

    return { errorList, warningList };
  }, [allocatedSubjectId, allocatedTeacherId, selectedSemester, selectedMatrixSemester, allocations, selectedCourseId, teachers, subjects, selectedSlots, requiredSlotsCount]);

  // Execute Allocation Submit
  const handlePerformAllocation = () => {
    if (!allocatedSubjectId || !allocatedTeacherId) {
      showToast("Selecione docente e disciplina no planejamento primeiro.", "error");
      return;
    }

    if (selectedSlots.length !== requiredSlotsCount) {
      showToast(`Por favor, selecione exatamente ${requiredSlotsCount} horários na grade semanal antes de confirmar.`, "error");
      return;
    }

    if (conflictsAndWarnings.errorList.length > 0) {
      showToast("Conflito impeditivo identificado. Verifique os alertas no painel lateral de restrições.", "error");
      setIsDrawerOpen(true);
      return;
    }

    const newlyAdded: string[] = [];
    selectedSlots.forEach((slot, index) => {
      const newId = `sch-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 5)}`;
      const newEntry: ScheduleEntry = {
        id: newId,
        courseId: selectedCourseId,
        period: selectedMatrixSemester,
        dayOfWeek: slot.day,
        timeSlotId: slot.slotId,
        subjectId: allocatedSubjectId,
        teacherId: allocatedTeacherId,
        semester: selectedSemester,
        room: allocatedRoom.trim() || undefined,
        block: allocatedBlock.trim() || undefined
      };
      onAddAllocation(newEntry);
      newlyAdded.push(newId);
    });

    setNewlyAddedIds(prev => {
      const copy = new Set(prev);
      newlyAdded.forEach(id => copy.add(id));
      return copy;
    });

    showToast(`Alocação de ${selectedSubject?.name} concluída com sucesso!`, "success");
    setSelectedSlots([]);
    setAllocatedRoom('');
    setAllocatedBlock('');
    setCurrentStep(1); // Return to Step 1 automatically
    setIsDrawerOpen(false);
  };

  // Remove single reservation
  const handleRemoveAllocation = (id: string) => {
    onDeleteAllocation(id);
    setNewlyAddedIds(prev => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
    showToast("Vínculo de grade removido.", "info");
  };

  // Determine current teacher preferred subjects checklist match
  const isTeacherPreferring = useMemo(() => {
    if (!selectedTeacher || !allocatedSubjectId) return false;
    return selectedTeacher.disciplinasMinistradas?.includes(allocatedSubjectId) || false;
  }, [selectedTeacher, allocatedSubjectId]);

  // Teacher allocation list inside our Drawer
  const teacherCurrentAllocations = useMemo(() => {
    if (!allocatedTeacherId) return [];
    return allocations.filter(a => a.teacherId === allocatedTeacherId && a.semester === selectedSemester);
  }, [allocations, allocatedTeacherId, selectedSemester]);

  if (courseSemesters.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative font-sans">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-wider">
            <span>Início</span>
            <ChevronRight size={10} className="text-zinc-350" />
            <span>Alocações</span>
            <ChevronRight size={10} className="text-zinc-300" />
            <span className="text-[#32a041]">Distribuição</span>
          </div>

          <header>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-[#32a041] uppercase tracking-widest">Painel Coordenador</span>
            </div>
            <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight mb-2">Distribuição de Alocações</h1>
            <p className="text-zinc-500 text-sm font-medium">Assegure a grade de aulas vinculando disciplinas, do período letivo sob sua gestão.</p>
          </header>
        </div>

        <div className="bg-white rounded-[2rem] border border-zinc-150 p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto my-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="p-5 bg-amber-50 rounded-full text-amber-600/95 border border-amber-200">
            <Calendar size={48} className="stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-zinc-900 uppercase">Nenhum Semestre Lançado</h3>
            <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed font-semibold">
              Não há nenhum período ou semestre letivo lançado para o curso sob sua gestão neste momento. Para começar a gerenciar e alocar disciplinas na grade, você deve primeiro criar e ativar um semestre letivo.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 pt-2">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('new-semester')}
                className="h-11 px-6 bg-[#32a041] text-white hover:bg-[#277c32] text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 animate-pulse"
              >
                <Plus size={14} strokeWidth={3} />
                Lançar Primeiro Semestre
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 relative font-sans text-zinc-800">
      
      {/* Toast alert popup banner */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-5 py-3 rounded-xl border text-[11px] font-bold uppercase tracking-wider shadow-xl backdrop-blur-md transition-all
              ${alert.type === 'success' ? 'bg-[#32a041]/95 text-white border-emerald-600' : ''}
              ${alert.type === 'error' ? 'bg-rose-600/95 text-white border-rose-700' : ''}
              ${alert.type === 'info' ? 'bg-zinc-900/95 text-white border-zinc-800' : ''}
            `}
          >
            {alert.type === 'success' && <Check size={14} strokeWidth={2.5} />}
            {alert.type === 'error' && <AlertTriangle size={14} strokeWidth={2.5} />}
            {alert.type === 'info' && <Info size={14} strokeWidth={2.5} />}
            <span>{alert.message}</span>
            <button onClick={() => setAlert(null)} className="ml-2 hover:opacity-85 text-xs">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header and Stepper component */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">
            <span>Início</span>
            <ChevronRight size={10} className="text-zinc-300" />
            <span>Alocações</span>
            <ChevronRight size={10} className="text-zinc-300" />
            <span className="text-[#32a041]">{currentStep === 1 ? 'Planejamento' : 'Grade Semanal'}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Distribuição de Alocações</h1>
        </div>

        {/* Dynamic Stepper Bar (Progressive Disclosure indicator) */}
        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-[10px] font-black uppercase tracking-wider relative select-none">
          <button 
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep(1)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${currentStep === 1 ? 'bg-[#32a041] text-white shadow-xs' : 'text-zinc-450 hover:text-zinc-700'}`}
          >
            <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[8.5px]">1</span>
            Planejar Vínculo
          </button>
          <div className="flex items-center text-zinc-300 px-1">
            <ChevronRight size={12} strokeWidth={3.5} />
          </div>
          <button 
            type="button"
            disabled={currentStep === 2 || !allocatedSubjectId || !allocatedTeacherId}
            onClick={() => setCurrentStep(2)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${currentStep === 2 ? 'bg-[#32a041] text-white shadow-xs' : 'text-zinc-450 hover:text-zinc-700'}`}
          >
            <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[8.5px]">2</span>
            Montar Grade
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ======================================================== */}
        {/* STEP 1: PLANEJAMENTO DA ALOCAÇÃO (Planning form flow)    */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <motion.div
            key="planning-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Context panel */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 pl-1">Curso</label>
                <div className="relative">
                  <select 
                    value={selectedCourseId} 
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value);
                      setSelectedSlots([]);
                    }}
                    className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl pl-3 pr-8 text-xs font-bold uppercase tracking-widest outline-none focus:bg-white text-zinc-750 appearance-none cursor-pointer transition-all"
                  >
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 pl-1">Calendário Letivo</label>
                <div className="relative">
                  <select 
                    value={selectedSemester} 
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl pl-3 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:bg-white text-zinc-750 appearance-none cursor-pointer transition-all"
                  >
                    {courseSemesters.map(s => (
                      <option key={s.id} value={s.identification}>{s.identification} {s.status === 'Ativo' ? '(Ativo)' : ''}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 pl-1">Semestre da Matriz Curricular</label>
                <div className="relative">
                  <select 
                    value={selectedMatrixSemester} 
                    onChange={(e) => {
                      setSelectedMatrixSemester(Number(e.target.value));
                      setSelectedSlots([]);
                    }}
                    className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl pl-3 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:bg-white text-zinc-750 appearance-none cursor-pointer transition-all"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(pNum => (
                      <option key={pNum} value={pNum}>{pNum}º Semestre</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Status details of matched entries */}
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 h-10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-450 uppercase">Vínculos Realizados</span>
                <span className="text-xs font-black text-zinc-855 bg-white border border-zinc-200 px-3 py-1 rounded-lg">
                  {allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester && a.period === selectedMatrixSemester).length / 2} disciplinas
                </span>
              </div>
            </div>

            {/* Main Selection Area divided into compact cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Form controls */}
              <div className="lg:col-span-8 bg-white border border-zinc-150 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">Passo 1 – Escolher a Disciplina do Curso</h3>
                    {offeredSubjects.length > 0 && (
                      <span className="text-[10px] bg-[#32a041]/10 text-[#32a041] border border-[#32a041]/20 font-black uppercase px-2.5 py-0.5 rounded-full">
                        {offeredSubjects.length} {offeredSubjects.length === 1 ? 'disciplina disponível' : 'disciplinas disponíveis'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-semibold mb-3">As disciplinas abaixo pertencem ao {selectedMatrixSemester}º semestre letivo deste plano curricular.</p>
                  
                  {offeredSubjects.length === 0 ? (
                    <div className="p-6 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-center space-y-3">
                      <div className="w-10 h-10 bg-amber-100 text-amber-700 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-sm animate-pulse font-black">
                        ⚠️
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase text-amber-800">Sem Matérias</h4>
                        <p className="text-xs font-semibold text-amber-700">
                          Nenhuma disciplina ativa foi encontrada para este curso e semestre.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative" id="smart-subject-selector-container">
                      <button
                        type="button"
                        onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
                        className="w-full min-h-12 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-left font-bold outline-none flex items-center justify-between transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-[#32a041]/10 focus:border-[#32a041]/50"
                      >
                        {selectedSubject ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-zinc-850 text-sm uppercase">{selectedSubject.name}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                                selectedSubject.type === 'Obrigatória' 
                                  ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' 
                                  : 'bg-amber-50 border border-amber-100 text-amber-700'
                              }`}>
                                {selectedSubject.type}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-semibold mt-1">
                              {selectedSubject.code || selectedSubject.id.toUpperCase()} • {selectedSubject.workload}h • {selectedSubject.period}º Semestre
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-500 font-semibold">-- Escolha a Disciplina ({offeredSubjects.length} disponíveis) --</span>
                        )}
                        <div className="text-zinc-400">
                          <svg className={`w-4 h-4 transition-transform duration-200 ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m19 9-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {isSubjectDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl z-30 flex flex-col overflow-hidden max-h-[350px] animate-in fade-in slide-in-from-top-2 duration-200">
                          {/* Search Input inside Dropdown */}
                          <div className="p-3 bg-zinc-50 border-b border-zinc-150 flex items-center gap-2">
                            <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg>
                            <input
                              type="text"
                              placeholder="Pesquisar por nome ou código da disciplina..."
                              value={subjectSearchQuery}
                              onChange={(e) => setSubjectSearchQuery(e.target.value)}
                              className="w-full bg-transparent border-none text-xs font-semibold text-zinc-700 placeholder-zinc-400 outline-none"
                              autoFocus
                            />
                            {subjectSearchQuery && (
                              <button 
                                type="button" 
                                onClick={() => setSubjectSearchQuery('')} 
                                className="text-zinc-400 hover:text-zinc-650 font-bold text-xs px-1"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          {/* Dropdown Content */}
                          <div className="overflow-y-auto p-2 divide-y divide-zinc-100 max-h-[280px]">
                            {(() => {
                              // Filter matching subjects
                              const searchFiltered = offeredSubjects.filter(sub => {
                                const q = subjectSearchQuery.toLowerCase().trim();
                                if (!q) return true;
                                return sub.name.toLowerCase().includes(q) || (sub.code && sub.code.toLowerCase().includes(q));
                              });

                              if (searchFiltered.length === 0) {
                                return (
                                  <div className="p-6 text-center text-zinc-400 text-xs font-semibold uppercase italic">
                                    Nenhuma disciplina corresponde à pesquisa.
                                  </div>
                                );
                              }

                              // Group by semester/period of matrix curriculum
                              const semestersGroup: Record<number, Subject[]> = {};
                              searchFiltered.forEach(sub => {
                                if (!semestersGroup[sub.period]) {
                                  semestersGroup[sub.period] = [];
                                }
                                semestersGroup[sub.period].push(sub);
                              });

                              return Object.keys(semestersGroup).sort().map(semesterStr => {
                                const semNum = Number(semesterStr);
                                const list = semestersGroup[semNum];

                                return (
                                  <div key={semNum} className="py-2.5 first:pt-1">
                                    {/* Group header */}
                                    <div className="px-3 py-1 bg-zinc-50 rounded-lg text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 flex items-center justify-between">
                                      <span>{semNum}º Semestre Matriz</span>
                                      <span>{list.length} {list.length === 1 ? 'Matéria' : 'Matérias'}</span>
                                    </div>

                                    {/* Group items */}
                                    <div className="space-y-1">
                                      {list.map(sub => {
                                        const isSelected = allocatedSubjectId === sub.id;
                                        return (
                                          <button
                                            key={sub.id}
                                            type="button"
                                            onClick={() => {
                                              setAllocatedSubjectId(sub.id);
                                              setIsSubjectDropdownOpen(false);
                                              setSubjectSearchQuery('');
                                            }}
                                            className={`w-full px-3 py-2 border text-left transition-all flex items-center justify-between cursor-pointer rounded-xl ${
                                              isSelected 
                                                ? 'bg-[#32a041]/10 border-[#32a041] shadow-inner text-zinc-900' 
                                                : 'bg-white border-transparent hover:bg-zinc-50'
                                            }`}
                                          >
                                            <div className="flex-1 min-w-0 pr-3">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-extrabold text-zinc-800 text-xs uppercase truncate leading-tight">{sub.name}</span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none shrink-0 ${
                                                  sub.type === 'Obrigatória' 
                                                    ? 'bg-indigo-100 text-indigo-700' 
                                                    : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                  {sub.type}
                                                </span>
                                              </div>
                                              <div className="text-[10px] text-zinc-500 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                                                <span className="font-mono">Código: {sub.code || sub.id.toUpperCase()}</span>
                                                <span className="text-zinc-300">•</span>
                                                <span>{sub.workload}h</span>
                                                <span className="text-zinc-300">•</span>
                                                <span>{sub.period}º Semestre</span>
                                              </div>
                                            </div>

                                            {isSelected && (
                                              <div className="w-5 h-5 bg-[#32a041] text-white rounded-full flex items-center justify-center shrink-0">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                                              </div>
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Informational item check for current subject */}
                  {selectedSubject && (
                    <div className="mt-3 bg-[#e8f5e9]/20 border border-emerald-150 p-4 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-200 font-bold">
                      <div>
                        <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded leading-none">{selectedSubject.type}</span>
                        <h4 className="text-sm font-black text-zinc-800 leading-tight mt-1">{selectedSubject.name}</h4>
                        <p className="text-[10px] text-zinc-450 font-bold uppercase mt-1 leading-none">Matriz {selectedSubject.period}º Semestre • Próxima à Carga Horária Exigida</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black text-[#277c32] block leading-none">{selectedSubject.workload}h</span>
                        <span className="text-[9px] font-bold text-zinc-400 block mt-0.5">Exige {requiredSlotsCount} aulas p/ semana</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-1">Passo 2 – Escolher Docente Responsável</h3>
                  <p className="text-[11px] text-zinc-400 font-semibold mb-3">Somente docentes ativos e homologados na plataforma constam nesta listagem.</p>

                  <select
                    value={allocatedTeacherId}
                    onChange={(e) => setAllocatedTeacherId(e.target.value)}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#32a041]/50 focus:bg-white text-zinc-850 appearance-none shadow-xs"
                  >
                    <option value="">-- Escolha o Professor ({activeTeachers.length} disponíveis) --</option>
                    {activeTeachers.map(teach => {
                      const maxH = getTeacherTimeLimit(teach);
                      const weeklyHours = allocations.filter(a => a.teacherId === teach.id && a.semester === selectedSemester).length * 2;
                      return (
                        <option key={teach.id} value={teach.id}>
                          {teach.name} ({weeklyHours}h / max {maxH}h)
                        </option>
                      );
                    })}
                  </select>

                  {/* Informational teacher state */}
                  {selectedTeacher && (() => {
                    const maxH = getTeacherTimeLimit(selectedTeacher);
                    const weeklyHours = allocations.filter(a => a.teacherId === selectedTeacher.id && a.semester === selectedSemester).length * 2;
                    const valPercent = Math.min(100, Math.round((weeklyHours / maxH) * 100));
                    return (
                      <div className="mt-3 bg-zinc-50 p-4 border border-zinc-150 rounded-xl space-y-2 animate-in fade-in duration-200">
                        <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                          <span>Progresso da Carga Docente: {weeklyHours}h de {maxH}h Alocadas</span>
                          <span className={valPercent > 90 ? 'text-rose-600' : 'text-[#32a041]'}>{valPercent}% de Ocupação</span>
                        </div>
                        <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${valPercent > 90 ? 'bg-rose-500' : 'bg-[#32a041]'}`}
                            style={{ width: `${valPercent}%` }}
                          />
                        </div>
                        <div className="flex flex-wrap justify-between gap-2 text-[10px] leading-none pt-1">
                          <span className="font-bold text-zinc-450">Horário Disponível: <strong className="text-zinc-700 font-extrabold">{maxH - weeklyHours}h semanais</strong></span>
                          
                          {/* Preferred subject Match badge! */}
                          {isTeacherPreferring ? (
                            <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-250 px-2.5 py-0.5 rounded-lg flex items-center gap-1 leading-none shadow-inner animate-bounce">
                              <Sparkles size={9} className="text-amber-500 fill-amber-500" /> Preferencial d@ Docente
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase font-black tracking-wider text-zinc-400">{selectedTeacher.regime}</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Interactive Rooms information inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-zinc-450 uppercase tracking-widest mb-1.5 pl-1">Sala de Aulas (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: Sala 12"
                      value={allocatedRoom}
                      onChange={(e) => setAllocatedRoom(e.target.value)}
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#32a041]/55 focus:bg-white text-zinc-800 shadow-inner placeholder:text-zinc-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-zinc-450 uppercase tracking-widest mb-1.5 pl-1">Bloco Acadêmico (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ex: Bloco B"
                      value={allocatedBlock}
                      onChange={(e) => setAllocatedBlock(e.target.value)}
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#32a041]/55 focus:bg-white text-zinc-800 shadow-inner placeholder:text-zinc-300"
                    />
                  </div>
                </div>

                {/* Teacher warnings if leaving */}
                {selectedTeacher && selectedTeacher.leaveType !== LeaveType.Nenhum && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
                    <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-amber-800 uppercase leading-normal">
                        Alerta de Afastamento:
                      </p>
                      <p className="text-[10px] font-semibold text-zinc-600 mt-0.5">
                        O docente {selectedTeacher.name} possui uma pendência/afastamento oficial cadastrada no sistema ({selectedTeacher.leaveType}).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Summary Planning block */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Summary Card */}
                <div className="bg-zinc-900 text-white rounded-2xl border border-zinc-800 p-6 shadow-xl space-y-5">
                  <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#32a041]">Plano de Alocação</h3>
                      <p className="text-[9px] text-zinc-400">Resumo consolidado do vínculo planejado</p>
                    </div>
                    <Layers size={16} className="text-zinc-400 stroke-[1.5]" />
                  </div>

                  {selectedSubject && selectedTeacher ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Docente de Destino</span>
                        <h4 className="text-sm font-bold text-white uppercase">{selectedTeacher.name}</h4>
                        <span className="text-[9px] text-[#32a041] uppercase tracking-wider font-extrabold">{selectedTeacher.regime}</span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Matéria vinculada</span>
                        <h4 className="text-sm font-bold text-white uppercase">{selectedSubject.name}</h4>
                        <span className="text-[9px] text-emerald-400 font-extrabold">{selectedSubject.workload}h semanais • {requiredSlotsCount} horários</span>
                      </div>

                      {allocatedRoom && (
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Localidade Reservada</span>
                          <p className="text-xs text-white font-bold uppercase">Sala {allocatedRoom} {allocatedBlock ? `— ${allocatedBlock}` : ''}</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-zinc-800 bg-[#32a041]/10 p-3 rounded-lg border border-emerald-500/20 text-[11px] text-zinc-300 leading-normal font-semibold">
                        Para definir em quais dias e horários as aulas serão ministradas, clique no botão principal para herdar e alocar na grade horária semanal.
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-550 space-y-2">
                      <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-850 flex items-center justify-center mx-auto text-zinc-500 font-black">
                        ?
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-wider">Passos incompletos</p>
                      <p className="text-[10px] text-zinc-400 max-w-xs mx-auto leading-normal">
                        Selecione uma disciplina (Passo 1) e de seguida um docente (Passo 2) para liberar a montagem de grade.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(2);
                      showToast(`Iniciando montador de grade para ${selectedSubject?.name}.`, "info");
                    }}
                    disabled={!allocatedSubjectId || !allocatedTeacherId}
                    className="w-full h-11 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-650 disabled:border-zinc-800 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-[#32a041] border border-emerald-500 text-shadow shadow-md"
                  >
                    <span>Montar Grade de Aulas</span>
                    <ChevronRight size={14} strokeWidth={3} />
                  </button>
                </div>

                {/* List View of current allocations in Step 1 to let them edit or clean them */}
                <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="border-b border-zinc-100 pb-2 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-zinc-450 tracking-wider">Histórico de Alocações</span>
                    <span className="text-[9px] font-black text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-lg">
                      {allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).length} Total
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 max-h-[220px] overflow-y-auto pr-1">
                    {allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).length === 0 ? (
                      <p className="text-center py-8 text-[10px] text-zinc-400 font-semibold uppercase italic">Nenhuma alocação ativa registrada.</p>
                    ) : (
                      allocations
                        .filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester)
                        .map(alloc => {
                          const sub = subjects.find(s => s.id === alloc.subjectId);
                          const teach = teachers.find(t => t.id === alloc.teacherId);
                          return (
                            <div key={alloc.id} className="py-2.5 flex items-center justify-between gap-3 text-left">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-[10.5px] font-black text-zinc-800 uppercase leading-none truncate">{sub?.name}</h4>
                                <p className="text-[9px] text-zinc-450 font-bold uppercase mt-0.5 leading-none truncate">{teach?.name.split(' ')[0]} {teach?.name.split(' ').pop()}</p>
                                <span className="text-[8px] font-black text-zinc-400 uppercase mt-1 inline-block bg-zinc-55/40 px-1.5 rounded">{alloc.dayOfWeek} • {TIME_SLOTS.find(ts => ts.id === alloc.timeSlotId)?.label.split(' ')[0]}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveAllocation(alloc.id)}
                                className="w-8 h-8 rounded-lg bg-zinc-50 hover:bg-rose-50 border border-zinc-200 hover:border-rose-100 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: MONTAGEM DA GRADE (Focused visual grid builder)  */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <motion.div
            key="grid-step"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Header information Row (Compact - showing ONLY essential information) */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    setSelectedSlots([]);
                  }}
                  className="h-9 px-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-zinc-550 transition-colors shrink-0"
                >
                  <ArrowLeft size={12} strokeWidth={2.5} />
                  Planejamento
                </button>
                
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-black text-[#32a041] uppercase tracking-wider leading-none">Vinculando ao Semestre Matriz: {selectedMatrixSemester}ºS</p>
                  <h3 className="text-sm font-bold text-zinc-900 leading-tight uppercase truncate">
                    {selectedSubject?.name} • <span className="text-zinc-500 font-extrabold">{selectedTeacher?.name}</span>
                  </h3>
                </div>
              </div>

              {/* Workload required and Progress Counter indicators */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 bg-zinc-100 rounded-xl border border-zinc-200 text-center shrink-0">
                  <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Aulas Exigidas</span>
                  <p className="text-xs font-black text-zinc-700 leading-none mt-1 uppercase">{requiredSlotsCount} horários ({selectedSubject?.workload}h)</p>
                </div>

                <div className={`px-4 py-2 rounded-xl border text-center shrink-0 shadow-inner flex flex-col items-center justify-center min-w-[170px] transition-all
                  ${selectedSlots.length === requiredSlotsCount
                    ? 'bg-[#32a041]/10 border-emerald-200 text-emerald-800'
                    : 'bg-[#fffbec] border-amber-200 text-amber-800'
                  }
                `}>
                  <span className="block text-[8px] font-black uppercase tracking-widest leading-none opacity-85">Status da Seleção</span>
                  <p className="text-xs font-black leading-none mt-1 uppercase">
                    {selectedSlots.length === requiredSlotsCount ? (
                      <span>Pronto para Gravar ✓</span>
                    ) : (
                      <span>Selecionados: {selectedSlots.length} de {requiredSlotsCount}</span>
                    )}
                  </p>
                </div>

                {/* Side Drawer Toggle button containing badges */}
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(true)}
                  className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-[#32a041] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 transition-colors shadow-md relative cursor-pointer"
                >
                  <span>📋 Agenda & Regras</span>
                  {conflictsAndWarnings.errorList.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 rounded-full bg-rose-600 text-white font-sans font-black flex items-center justify-center text-[9px] px-1 shadow-lg animate-bounce border-2 border-white">
                      {conflictsAndWarnings.errorList.length}
                    </span>
                  )}
                </button>
              </div>

            </div>

            {/* Shift filter - MUST show only ONE shift at a time (Manhã, Tarde or Noite) */}
            <div className="flex justify-between items-center bg-white border border-zinc-150 rounded-2xl p-4 gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#32a041] animate-pulse"></span>
                <p className="text-[10px] font-black uppercase text-zinc-550 tracking-wider">
                  Isolando Turno na Grade: <span className="text-[#32a041]">{selectedTurn}</span>
                </p>
              </div>
              <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 shrink-0 gap-0.5 select-none text-[9px] font-black">
                {['Manhã', 'Tarde', 'Noite'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelectedTurn(t as any)}
                    className={`px-4 h-9 rounded-lg uppercase tracking-widest transition-all outline-none cursor-pointer
                      ${selectedTurn === t
                        ? 'bg-[#32a041] text-white shadow-sm font-black'
                        : 'text-zinc-500 hover:text-zinc-700 font-bold'
                      }
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Timetable grid occupying 100% of workspace width for high density */}
            <div className="overflow-x-auto border border-zinc-200 rounded-2xl shadow-sm bg-white">
              <table className="w-full min-w-[750px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="py-3 px-4 text-left text-[9px] font-black uppercase tracking-wider text-zinc-400 w-32">Horário</th>
                    {DAYS_ORDER.map(day => (
                      <th key={day} className="py-3 px-2 text-center text-[9px] font-black uppercase tracking-wider text-[#58595b] w-40">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map((slot) => {
                    if (slot.isBreak) {
                      return (
                        <tr key={slot.id} className="border-b border-zinc-150/70 bg-zinc-50/40">
                          <td className="py-2 px-4 text-[8px] font-black text-center text-zinc-400 uppercase tracking-widest w-30">{slot.period}</td>
                          <td colSpan={DAYS_ORDER.length} className="py-2 px-2 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/5">
                            {slot.label} — {slot.period}
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={slot.id} className="border-b border-zinc-100 hover:bg-zinc-50/5 transition-colors">
                        {/* Period designation slot */}
                        <td className="py-3 px-4 border-r border-zinc-150 text-left bg-zinc-50/20 w-30">
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block leading-none">{slot.period}</span>
                          <span className="text-[11px] font-black text-zinc-700 leading-none mt-1 block font-mono">{slot.label}</span>
                        </td>

                        {/* Calendar week cell cards */}
                        {DAYS_ORDER.map((day) => {
                          // Check if another subject occupies the Matrix Period in this course semester
                          const matrixOccupied = allocations.find(
                            a => a.courseId === selectedCourseId &&
                                 a.period === selectedMatrixSemester &&
                                 a.dayOfWeek === day &&
                                 a.timeSlotId === slot.id &&
                                 a.semester === selectedSemester
                          );
                          const matrixSubName = matrixOccupied ? subjects.find(s => s.id === matrixOccupied.subjectId)?.name : null;

                          // Check if selected teacher is busy at this slot
                          const teacherOccupied = allocations.find(
                            a => a.teacherId === allocatedTeacherId &&
                                 a.dayOfWeek === day &&
                                 a.timeSlotId === slot.id &&
                                 a.semester === selectedSemester
                          );
                          const teacherSubName = teacherOccupied ? subjects.find(s => s.id === teacherOccupied.subjectId)?.name : null;

                          // Check interjornada warnings
                          const interjornadaRest = checkInterjornadaConflict(day, slot.id, allocatedTeacherId);

                          // Check if currently picked in our temporary selection
                          const isSelected = selectedSlots.some(s => s.day === day && s.slotId === slot.id);

                          let style = "border-dashed border-zinc-200 hover:border-[#32a041] hover:bg-[#32a041]/5 text-zinc-400 hover:text-[#32a041] cursor-pointer";
                          let label = "Vago";
                          let detail = "Disponível para aula";
                          let actionPossible = true;

                          if (isSelected) {
                            style = "bg-[#32a041] border-[#277c32] text-white cursor-pointer shadow-md";
                            label = "Selecionado";
                            detail = `${selectedSubject?.code || 'Marcado'}`;
                          } else if (matrixOccupied) {
                            style = "bg-rose-50 border-rose-200 text-rose-800 opacity-80 cursor-not-allowed";
                            label = "Indisponível";
                            detail = matrixSubName ? `Matéria: ${matrixSubName}` : "Choque Matriz";
                            actionPossible = false;
                          } else if (teacherOccupied) {
                            style = "bg-zinc-100 border-zinc-200 text-zinc-500 opacity-65 cursor-not-allowed";
                            label = "Docente Ocupado";
                            detail = teacherSubName ? `Aulas: ${teacherSubName}` : "Agenda Ocupada";
                            actionPossible = false;
                          } else if (interjornadaRest) {
                            style = "bg-rose-50/50 border-rose-150 text-rose-700 opacity-70 cursor-not-allowed";
                            label = "Restrição";
                            detail = "Intervalo Interjornada";
                            actionPossible = false;
                          } else if (!isSelected && selectedSlots.length >= requiredSlotsCount) {
                            // Reached capacity constraints
                            style = "border-dashed border-zinc-150 text-zinc-300 bg-zinc-50/10 cursor-not-allowed opacity-50";
                            label = "Limite Atingido";
                            detail = "Seleção Completa";
                            actionPossible = false;
                          }

                          const handleCellToggle = () => {
                            if (!actionPossible && !isSelected) return;
                            if (isSelected) {
                              setSelectedSlots(prev => prev.filter(s => !(s.day === day && s.slotId === slot.id)));
                            } else {
                              setSelectedSlots(prev => [...prev, { day, slotId: slot.id }]);
                            }
                          };

                          return (
                            <td 
                              key={day} 
                              className="p-1 border-r border-zinc-100 text-center align-middle"
                              onClick={handleCellToggle}
                            >
                              <div className={`py-2 px-1.5 rounded-xl border flex flex-col items-center justify-center min-h-[50px] leading-tight select-none transition-all duration-150 hover:-translate-y-0.5 ${style}`}>
                                <h4 className="text-[9.5px] font-black uppercase tracking-wider truncate max-w-full">{label}</h4>
                                <span className="text-[7.5px] font-semibold opacity-80 leading-none truncate max-w-full mt-0.5">{detail}</span>
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

            {/* Bottom Floating/Stretched Save bar */}
            <div className="bg-zinc-50 p-4 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase text-[#32a041] tracking-wider leading-none">Salvar Grade Horária</span>
                <p className="text-zinc-500 text-[10.5px] font-bold mt-1">
                  {selectedSlots.length === requiredSlotsCount ? (
                    <span>Pronto para consolidar seu planejamento na agenda do curso.</span>
                  ) : (
                    <span>Selecione mais {requiredSlotsCount - selectedSlots.length} vaga(s) para habilitar o encerramento.</span>
                  )}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSlots([]);
                    setCurrentStep(1);
                  }}
                  className="h-11 px-4 border border-zinc-200 rounded-xl hover:bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handlePerformAllocation}
                  disabled={selectedSlots.length !== requiredSlotsCount}
                  className={`h-11 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5
                    ${selectedSlots.length === requiredSlotsCount
                      ? 'bg-[#32a041] text-white hover:bg-[#277c32] shadow-emerald-500/10 cursor-pointer'
                      : 'bg-zinc-100 border border-zinc-200 text-zinc-300 cursor-not-allowed shadow-none'
                    }
                  `}
                >
                  Confirmar e Finalizar Alocação ✓
                </button>
              </div>
            </div>

            {/* Slide-out side drawer for Progressive Disclosure layout elements */}
            <AnimatePresence>
              {isDrawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden font-sans">
                  {/* Overlay Backdrop */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsDrawerOpen(false)}
                    className="absolute inset-0 bg-black backdrop-blur-xs cursor-pointer"
                  />

                  {/* Slider panel drawer */}
                  <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                    className="absolute inset-y-0 right-0 w-full max-w-md bg-white border-l border-zinc-200 shadow-2xl p-6 flex flex-col justify-between"
                  >
                    
                    {/* Header space */}
                    <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                      
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-black text-zinc-900 uppercase">Agenda & Diagnósticos</h3>
                          <p className="text-[10px] text-[#32a041] uppercase font-black">Professor: {selectedTeacher?.name}</p>
                        </div>
                        <button 
                          onClick={() => setIsDrawerOpen(false)}
                          className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* Section 1: Validation Rules and Active Warnings list */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-450 uppercase tracking-widest pl-1">Vulnerabilidades de Agendamento</h4>
                        
                        {conflictsAndWarnings.errorList.length === 0 && conflictsAndWarnings.warningList.length === 0 ? (
                          <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center gap-2.5">
                            <CheckCircle2 size={16} className="text-[#32a041]" />
                            <p className="text-[10.5px] font-bold text-emerald-800">Livre de conflitos de horário e restrições graves!</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Rendering Errors */}
                            {conflictsAndWarnings.errorList.map((err, idx) => (
                              <div key={idx} className="p-3 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-2 text-[10.5px] leading-tight text-rose-800 font-semibold animate-in slide-in-from-right duration-200">
                                <AlertTriangle size={14} className="text-rose-550 mt-0.5 shrink-0" />
                                <span>{err}</span>
                              </div>
                            ))}

                            {/* Rendering Warnings */}
                            {conflictsAndWarnings.warningList.map((war, idx) => (
                              <div key={idx} className="p-3 bg-amber-50 border border-amber-150 rounded-xl flex items-start gap-2 text-[10.5px] leading-tight text-amber-800 font-semibold animate-in slide-in-from-right duration-250">
                                <Info size={14} className="text-amber-500 mt-0.5 shrink-0" />
                                <span>{war}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Section 2: Selected Teacher's Institutional Agenda Timeline */}
                      <div className="space-y-3 pt-4">
                        <div className="flex justify-between items-center pl-1">
                          <h4 className="text-[10px] font-black text-zinc-450 uppercase tracking-widest">Ocupações de {selectedTeacher?.name.split(' ')[0]}</h4>
                          <span className="text-[9px] font-bold text-zinc-500">{teacherCurrentAllocations.length * 2}h no semestre</span>
                        </div>

                        {teacherCurrentAllocations.length === 0 ? (
                          <div className="p-4 text-center bg-zinc-50 border border-zinc-150 rounded-xl">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">Professor limpo no calendário letivo.</p>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {teacherCurrentAllocations.map(a => {
                              const sub = subjects.find(s => s.id === a.subjectId);
                              return (
                                <div key={a.id} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between text-xs">
                                  <div>
                                    <h5 className="font-extrabold text-zinc-800 uppercase leading-none">{sub?.name}</h5>
                                    <span className="text-[8.5px] text-zinc-400 font-bold uppercase mt-1 inline-block">Semestre do Curso: {a.period}º per</span>
                                  </div>
                                  <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                                    {a.dayOfWeek} • {TIME_SLOTS.find(ts => ts.id === a.timeSlotId)?.label.split(' ')[0]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Section 3: Allocation Guidance criteria info */}
                      <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-2 pt-3">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Normas Institucionais</span>
                        <ul className="text-[10px] leading-relaxed text-zinc-500 font-medium space-y-1">
                          <li>• <strong>Limite de Jornada:</strong> Máximo de {selectedTeacher ? getTeacherTimeLimit(selectedTeacher) : '20'}h semanais de aula por docente.</li>
                          <li>• <strong>Descanso Interjornada:</strong> Repouso inviolável de 11h entre as grades de dias vizinhos (Ex: 22h40 de Seg e 07h25 de Ter).</li>
                          <li>• <strong>Choque de Matriz:</strong> O mesmo período curricular não pode preencher a mesma vaga semanal com matérias paralelas concorrentes.</li>
                        </ul>
                      </div>

                    </div>

                    {/* Bottom Close area */}
                    <div className="border-t border-zinc-100 pt-4 mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setIsDrawerOpen(false)}
                        className="w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer"
                      >
                        Fechar Painel
                      </button>
                    </div>

                  </motion.div>
                </div>
              )}
            </AnimatePresence>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default AllocationsView;

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ArrowRightLeft, 
  History,
  Search,
  ArrowRight,
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
  ChevronDown,
  ChevronUp,
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
  Zap,
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

const TEACHER_PREFS_MAP: Record<string, { preferredSubjects: string[], preferredDays: string[], unavailableDays: string[], preferredTurns: string[] }> = {
  'Anelise Daniela Schinaider': {
    preferredSubjects: ['Introdução à Programação', 'Pensamento Computacional', 'Comunicação e Expressão'],
    preferredDays: ['Segunda', 'Terça', 'Quarta'],
    unavailableDays: ['Sexta', 'Sábado'],
    preferredTurns: ['Manhã', 'Tarde']
  },
  'Antonio Savio Silva Oliveira': {
    preferredSubjects: ['Banco de Dados', 'Sistemas Operacionais', 'Engenharia de Software'],
    preferredDays: ['Terça', 'Quinta'],
    unavailableDays: ['Segunda', 'Quarta', 'Sexta'],
    preferredTurns: ['Noite', 'Tarde']
  },
  'Carlos Getúlio de Freitas Maia': {
    preferredSubjects: ['Introdução à Computação', 'Redes de Computadores', 'Inglês Técnico'],
    preferredDays: ['Segunda', 'Terça', 'Quinta'],
    unavailableDays: ['Quarta', 'Sexta'],
    preferredTurns: ['Manhã', 'Noite']
  },
  'Cledinaldo Alves Pinheiro Junior': {
    preferredSubjects: ['Tecnologias Web', 'Programação Web I', 'Pensamento Computacional'],
    preferredDays: ['Quarta', 'Quinta', 'Sexta'],
    unavailableDays: ['Segunda', 'Terça'],
    preferredTurns: ['Manhã', 'Noite']
  },
  'Erico Castro de Albuquerque Melo': {
    preferredSubjects: ['Engenharia de Software', 'Padrões de Projeto de Software', 'Análise e Projeto de Sistemas'],
    preferredDays: ['Segunda', 'Quarta'],
    unavailableDays: ['Terça', 'Quinta', 'Sexta'],
    preferredTurns: ['Manhã', 'Tarde']
  },
  'Jayme Felix Xavier Junior': {
    preferredSubjects: ['Redes de Computadores', 'Sistemas Operacionais', 'Fundamentos de Segurança da Informação'],
    preferredDays: ['Segunda', 'Terça', 'Quinta'],
    unavailableDays: ['Quarta', 'Sexta'],
    preferredTurns: ['Manhã', 'Noite']
  },
  'Jhonata da Costa Bezerra': {
    preferredSubjects: ['Banco de Dados', 'Bancos de Dados Não-Relacionais', 'Estrutura de Dados'],
    preferredDays: ['Segunda', 'Quarta', 'Sexta'],
    unavailableDays: ['Terça', 'Quinta'],
    preferredTurns: ['Manhã', 'Noite']
  },
  'Julio Serafim Martins': {
    preferredSubjects: ['Gestão de Projetos', 'Empreendedorismo', 'Ética e Responsabilidade Socioambiental'],
    preferredDays: ['Quinta', 'Sexta'],
    unavailableDays: ['Segunda', 'Terça', 'Quarta'],
    preferredTurns: ['Manhã', 'Tarde']
  },
  'Lucas Ferreira Mendes': {
    preferredSubjects: ['Programação Orientada a Objetos', 'Padrões de Projeto de Software', 'Estrutura de Dados'],
    preferredDays: ['Terça', 'Quarta', 'Quinta'],
    unavailableDays: ['Segunda', 'Sexta'],
    preferredTurns: ['Manhã', 'Tarde']
  },
  'Paulo Ricardo Barboza Gomes': {
    preferredSubjects: ['Estrutura de Dados', 'Introdução à Programação', 'Pensamento Computacional'],
    preferredDays: ['Segunda', 'Terça'],
    unavailableDays: ['Quarta', 'Quinta', 'Sexta'],
    preferredTurns: ['Manhã']
  },
  'Phyllipe do Carmo Felix': {
    preferredSubjects: ['Análise e Projeto de Sistemas', 'Engenharia de Software', 'Gestão de Projetos'],
    preferredDays: ['Segunda', 'Quarta', 'Quinta'],
    unavailableDays: ['Terça', 'Sexta'],
    preferredTurns: ['Manhã', 'Noite']
  },
  'Reginaldo Pereira Fernandes': {
    preferredSubjects: ['Fundamentos de Matemática', 'Pensamento Computacional'],
    preferredDays: ['Segunda', 'Sexta'],
    unavailableDays: ['Terça', 'Quarta', 'Quinta'],
    preferredTurns: ['Manhã', 'Tarde']
  },
  'Samuel Barbosa Silva': {
    preferredSubjects: ['Introdução à Programação', 'Tecnologias Web'],
    preferredDays: ['Terça', 'Quinta'],
    unavailableDays: ['Segunda', 'Quarta', 'Sexta'],
    preferredTurns: ['Tarde', 'Noite']
  },
  'Willame de Araujo Cavalcante': {
    preferredSubjects: ['Sistemas Operacionais', 'Redes de Computadores'],
    preferredDays: ['Segunda', 'Quarta', 'Sexta'],
    unavailableDays: ['Terça', 'Quinta'],
    preferredTurns: ['Manhã', 'Noite']
  }
};

interface AllocationChangeLog {
  id: string;
  teacherName: string;
  semester: number;
  subjectName: string;
  type: string;
  from: string;
  to: string;
  timestamp: string;
}

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

  const [newlyAddedIds, setNewlyAddedIds] = useState<Set<string>>(new Set());

  // 3 steps: 1 = Pré-Alocação, 2 = Planejar Vínculo, 3 = Montar Grade
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
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
    if (activeSemesterIdent) setSelectedSemester(activeSemesterIdent);
  }, [activeSemesterIdent]);

  useEffect(() => {
    const coordinated = courses.find(c => c.coordinatorId === user?.id);
    if (coordinated) setSelectedCourseId(coordinated.id);
  }, [courses, user]);

  const currentSemesterObj = useMemo(() => {
    return courseSemesters.find(s => s.identification === selectedSemester);
  }, [courseSemesters, selectedSemester]);

  const offeredSubjects = useMemo(() => {
    if (!selectedCourse) return [];
    const activeCourseSubjects = subjects.filter(
      s => s.courseId === selectedCourse.id && s.status !== 'Inativa'
    );
    return activeCourseSubjects.filter(s => s.period === selectedMatrixSemester);
  }, [subjects, selectedCourse, selectedMatrixSemester]);

  const activeTeachers = useMemo(() => {
    return teachers.filter(t => t.status === 'Ativo');
  }, [teachers]);

  const getTeacherTimeLimit = (tUser: UserType) => {
    if (tUser.cargaHoraria && tUser.cargaHoraria > 0) return tUser.cargaHoraria;
    if (tUser.role) {
      const normalizedRole = String(tUser.role).trim().toLowerCase();
      if (['coordenador', 'diretor', 'vice-diretor', 'vicediretor', 'vice diretor'].includes(normalizedRole)) {
        return 10;
      }
    }
    if (tUser.regime === 'Dedicação Exclusiva' || tUser.regime === '40 Horas') return 20;
    return 10;
  };

  // --- Teacher preference helpers ---
  const getTeacherPrefs = (teacher: UserType) => {
    const mapName = teacher.name;
    const cleanKey = Object.keys(TEACHER_PREFS_MAP).find(
      key => key.toLowerCase() === mapName.toLowerCase() ||
             key.toLowerCase().replace('prof. ', '').replace('prof.ª ', '').replace('dr. ', '').trim() ===
             mapName.toLowerCase().replace('prof. ', '').replace('prof.ª ', '').replace('dr. ', '').trim()
    );
    if (cleanKey && TEACHER_PREFS_MAP[cleanKey]) return TEACHER_PREFS_MAP[cleanKey];
    return {
      preferredSubjects: teacher.disciplinasMinistradas || [],
      preferredDays: ['Segunda', 'Terça', 'Quarta'],
      unavailableDays: ['Sexta', 'Sábado'],
      preferredTurns: [teacher.regime === '20 Horas' ? 'Noite' : 'Manhã', 'Tarde']
    };
  };

  const getPrefsByName = (name: string) => {
    const teacher = teachers.find(t => t.name.toLowerCase() === name.toLowerCase());
    if (teacher) return getTeacherPrefs(teacher);
    const cleanKey = Object.keys(TEACHER_PREFS_MAP).find(
      key => key.toLowerCase() === name.toLowerCase()
    );
    if (cleanKey && TEACHER_PREFS_MAP[cleanKey]) return TEACHER_PREFS_MAP[cleanKey];
    return { preferredSubjects: [], preferredDays: ['Segunda', 'Terça', 'Quarta'], unavailableDays: ['Sexta', 'Sábado'], preferredTurns: ['Manhã', 'Tarde'] };
  };

  const checkPreAllocationConflict = (teacherName: string, day: string, slotId: string, subjectName: string): 'high' | 'conflict' => {
    const teacher = teachers.find(t => t.name.toLowerCase() === teacherName.toLowerCase());
    if (!teacher) return 'high';
    const prefs = getTeacherPrefs(teacher);
    if (prefs.unavailableDays.includes(day)) return 'conflict';
    const turn = slotId.startsWith('m') ? 'Manhã' : slotId.startsWith('t') ? 'Tarde' : 'Noite';
    if (!prefs.preferredTurns.includes(turn)) return 'conflict';
    if (prefs.preferredSubjects.length > 0 && !prefs.preferredSubjects.some(s => s.toLowerCase() === subjectName.toLowerCase())) return 'conflict';
    return 'high';
  };

  // --- Pre-allocation state ---
  const [preAllocations, setPreAllocations] = useState<any[]>([]);

  const [changeLogs, setChangeLogs] = useState<AllocationChangeLog[]>([]);
  const prevPreAllocationsRef = useRef<any[]>([]);

  useEffect(() => {
    prevPreAllocationsRef.current = preAllocations;
  }, []);

  useEffect(() => {
    if (prevPreAllocationsRef.current === preAllocations) return;
    const prev = prevPreAllocationsRef.current;
    const added = preAllocations.filter(pa => !prev.some(p => p.id === pa.id));
    const removed = prev.filter(p => !preAllocations.some(pa => pa.id === p.id));
    const modified = preAllocations.map(pa => {
      const original = prev.find(p => p.id === pa.id);
      if (original && (original.dayOfWeek !== pa.dayOfWeek || original.timeSlotId !== pa.timeSlotId || original.teacherName !== pa.teacherName || original.subjectName !== pa.subjectName)) {
        return { current: pa, original };
      }
      return null;
    }).filter(Boolean) as { current: any; original: any }[];

    const newLogs: AllocationChangeLog[] = [];

    added.forEach(pa => {
      newLogs.push({
        id: `log-auto-${Date.now()}-${Math.random()}`,
        teacherName: pa.teacherName,
        semester: pa.semester,
        subjectName: pa.subjectName,
        type: "Inclusão de Horário",
        from: "Não Alocado",
        to: `${pa.dayOfWeek} (${TIME_SLOTS.find(ts => ts.id === pa.timeSlotId)?.label.split(' ')[0] || pa.timeSlotId})`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    });

    removed.forEach(pa => {
      newLogs.push({
        id: `log-auto-${Date.now()}-${Math.random()}`,
        teacherName: pa.teacherName,
        semester: pa.semester,
        subjectName: pa.subjectName,
        type: "Exclusão de Horário",
        from: `${pa.dayOfWeek} (${TIME_SLOTS.find(ts => ts.id === pa.timeSlotId)?.label.split(' ')[0] || pa.timeSlotId})`,
        to: "Não Alocado",
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    });

    modified.forEach(({ current, original }) => {
      let type = "Modificação";
      let from = "";
      let to = "";
      if (original.dayOfWeek !== current.dayOfWeek || original.timeSlotId !== current.timeSlotId) {
        type = "Movimentação";
        from = `${original.dayOfWeek} (${TIME_SLOTS.find(ts => ts.id === original.timeSlotId)?.label.split(' ')[0] || original.timeSlotId})`;
        to = `${current.dayOfWeek} (${TIME_SLOTS.find(ts => ts.id === current.timeSlotId)?.label.split(' ')[0] || current.timeSlotId})`;
      } else if (original.teacherName !== current.teacherName) {
        type = "Troca de Docente";
        from = original.teacherName;
        to = current.teacherName;
      } else if (original.subjectName !== current.subjectName) {
        type = "Edição de Disciplina";
        from = original.subjectName;
        to = current.subjectName;
      }
      newLogs.push({
        id: `log-auto-${Date.now()}-${Math.random()}`,
        teacherName: current.teacherName,
        semester: current.semester,
        subjectName: current.subjectName,
        type, from, to,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    });

    if (newLogs.length > 0) setChangeLogs(prev => [...newLogs, ...prev]);
    prevPreAllocationsRef.current = preAllocations;
  }, [preAllocations]);

  // --- Pre-allocation UI state ---
  const [editingSlot, setEditingSlot] = useState<{ day: string; slotId: string; existingId?: string; subjectName?: string; teacherName?: string } | null>(null);
  const [conflictResolutionSlot, setConflictResolutionSlot] = useState<{ day: string; slotId: string; matches: any[] } | null>(null);
  const [activeConflictTeacherName, setActiveConflictTeacherName] = useState<string>('');
  const [expandedConflictAgendas, setExpandedConflictAgendas] = useState<Record<string, boolean>>({});
  const [showAutoAnalysis, setShowAutoAnalysis] = useState<boolean>(false);
  const [saveClashModalData, setSaveClashModalData] = useState<{ show: boolean; doubleBookings: any[]; ruleConflicts: any[] } | null>(null);
  const [isChangeHistoryModalOpen, setIsChangeHistoryModalOpen] = useState(false);
  const [historySemesterFilter, setHistorySemesterFilter] = useState<string>('all');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [isPrefTeacherDropdownOpen, setIsPrefTeacherDropdownOpen] = useState(false);
  const [selectedPreferenceTeacher, setSelectedPreferenceTeacher] = useState<UserType | null>(null);

  const filteredLogs = useMemo(() => {
    return changeLogs.filter(log => {
      const matchSemester = historySemesterFilter === 'all' || log.semester === Number(historySemesterFilter);
      const matchTeacher = log.teacherName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
                           log.subjectName.toLowerCase().includes(historySearchQuery.toLowerCase());
      return matchSemester && matchTeacher;
    });
  }, [changeLogs, historySemesterFilter, historySearchQuery]);

  const totalHistoryPages = Math.ceil(filteredLogs.length / 5) || 1;

  useEffect(() => {
    if (historyCurrentPage > totalHistoryPages) setHistoryCurrentPage(1);
  }, [filteredLogs, totalHistoryPages, historyCurrentPage]);

  const historyPaginatedLogs = useMemo(() => {
    const start = (historyCurrentPage - 1) * 5;
    return filteredLogs.slice(start, start + 5);
  }, [filteredLogs, historyCurrentPage]);

  useEffect(() => {
    if (!conflictResolutionSlot) setShowAutoAnalysis(false);
  }, [conflictResolutionSlot]);

  const preAllocationsForTurn = useMemo(() => {
    return preAllocations.filter(pa => pa.semester === selectedMatrixSemester);
  }, [preAllocations, selectedMatrixSemester]);

  const [selectedSlots, setSelectedSlots] = useState<{ day: string; slotId: string }[]>([]);
  const [selectedTurn, setSelectedTurn] = useState<'Manhã' | 'Tarde' | 'Noite' | 'Todos'>('Manhã');

  const hasTurnConflicts = useMemo(() => {
    return preAllocationsForTurn.some((pa, index, arr) => {
      const isCurrentTurn = selectedTurn === 'Todos' || pa.timeSlotId.startsWith(selectedTurn === 'Manhã' ? 'm' : selectedTurn === 'Tarde' ? 't' : 'n');
      if (!isCurrentTurn) return false;
      if (checkPreAllocationConflict(pa.teacherName, pa.dayOfWeek, pa.timeSlotId, pa.subjectName) === 'conflict') return true;
      return arr.some((other, otherIdx) => otherIdx !== index && other.dayOfWeek === pa.dayOfWeek && other.timeSlotId === pa.timeSlotId && other.semester === pa.semester);
    });
  }, [preAllocationsForTurn, selectedTurn]);

  const totalRequiredSlots = useMemo(() => {
    return offeredSubjects.reduce((acc, sub) => acc + Math.max(1, Math.ceil(sub.workload / 20)), 0);
  }, [offeredSubjects]);

  const totalPreAllocatedSlots = useMemo(() => {
    if (selectedTurn === 'Todos') return preAllocations.filter(pa => pa.semester === selectedMatrixSemester).length;
    const turnPrefix = selectedTurn === 'Manhã' ? 'm' : selectedTurn === 'Tarde' ? 't' : 'n';
    return preAllocations.filter(pa => pa.semester === selectedMatrixSemester && pa.timeSlotId.startsWith(turnPrefix)).length;
  }, [preAllocations, selectedMatrixSemester, selectedTurn]);

  // --- Manual allocation form states ---
  const [allocatedSubjectId, setAllocatedSubjectId] = useState<string>('');
  const [allocatedTeacherId, setAllocatedTeacherId] = useState<string>('');
  const [allocatedRoom, setAllocatedRoom] = useState<string>('');
  const [allocatedBlock, setAllocatedBlock] = useState<string>('');
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>('');
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState<boolean>(false);

  const selectedSubject = useMemo(() => subjects.find(s => s.id === allocatedSubjectId), [subjects, allocatedSubjectId]);
  const selectedTeacher = useMemo(() => teachers.find(t => t.id === allocatedTeacherId), [teachers, allocatedTeacherId]);

  const requiredSlotsCount = useMemo(() => {
    if (!selectedSubject) return 0;
    return Math.max(1, Math.ceil(selectedSubject.workload / 20));
  }, [selectedSubject]);

  const filteredSlots = useMemo(() => {
    if (selectedTurn === 'Manhã') return TIME_SLOTS.filter(s => s.id.startsWith('m'));
    if (selectedTurn === 'Tarde') return TIME_SLOTS.filter(s => s.id.startsWith('t') || s.id === 'lunch');
    if (selectedTurn === 'Noite') return TIME_SLOTS.filter(s => s.id.startsWith('n'));
    return TIME_SLOTS;
  }, [selectedTurn]);

  useEffect(() => { setSelectedSlots([]); }, [allocatedSubjectId, allocatedTeacherId]);

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
      const hasLateNightExisting = allocations.some(a => a.teacherId === teacherId && a.dayOfWeek === prevDay && a.timeSlotId === 'n4' && a.semester === selectedSemester);
      const hasLateNightTemp = selectedSlots.some(s => s.day === prevDay && s.slotId === 'n4');
      if (hasLateNightExisting || hasLateNightTemp) return { hasConflict: true, reason: `Primeira aula (${day} 07:25) após ministrar o último horário do dia anterior (${prevDay} 22:40).` };
    }
    if (slotId === 'n4' && nextDay) {
      const hasEarlyMorningExisting = allocations.some(a => a.teacherId === teacherId && a.dayOfWeek === nextDay && a.timeSlotId === 'm1' && a.semester === selectedSemester);
      const hasEarlyMorningTemp = selectedSlots.some(s => s.day === nextDay && s.slotId === 'm1');
      if (hasEarlyMorningExisting || hasEarlyMorningTemp) return { hasConflict: true, reason: `Último horário (22:40) se houver primeira aula do dia seguinte (${nextDay} 07:25).` };
    }
    return null;
  };

  useEffect(() => {
    if (offeredSubjects.length > 0) setAllocatedSubjectId(offeredSubjects[0].id);
    else setAllocatedSubjectId('');
  }, [offeredSubjects]);

  useEffect(() => {
    if (activeTeachers.length > 0) setAllocatedTeacherId(activeTeachers[0].id);
    else setAllocatedTeacherId('');
  }, [activeTeachers]);

  const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };

  // --- Auto-generate grid ---
  const handleGenerateAutomaticGrid = () => {
    if (offeredSubjects.length === 0) {
      showToast("Nenhuma disciplina cadastrada para este semestre da matriz.", "error");
      return;
    }

    const updatedPreAllocations = preAllocations.filter(pa => {
      if (pa.semester !== selectedMatrixSemester) return true;
      if (selectedTurn === 'Todos') return false;
      const turnPrefix = selectedTurn === 'Manhã' ? 'm' : selectedTurn === 'Tarde' ? 't' : 'n';
      return !pa.timeSlotId.startsWith(turnPrefix);
    });

    let slotsToUse = TIME_SLOTS.filter(s => !s.isBreak);
    if (selectedTurn === 'Manhã') slotsToUse = slotsToUse.filter(s => s.id.startsWith('m'));
    else if (selectedTurn === 'Tarde') slotsToUse = slotsToUse.filter(s => s.id.startsWith('t'));
    else if (selectedTurn === 'Noite') slotsToUse = slotsToUse.filter(s => s.id.startsWith('n'));

    const availablePositions: { day: string, slotId: string }[] = [];
    ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'].forEach(day => {
      slotsToUse.forEach(slot => availablePositions.push({ day, slotId: slot.id }));
    });

    const shuffledPositions = [...availablePositions].sort(() => Math.random() - 0.5);
    const newGeneratedAllocations: any[] = [];
    let posIndex = 0;

    offeredSubjects.forEach((subject) => {
      const eligibleTeachers = activeTeachers.filter(t => {
        const prefs = getTeacherPrefs(t);
        return prefs.preferredSubjects.some(ps => ps.toLowerCase() === subject.name.toLowerCase());
      });
      const assignedTeacher = eligibleTeachers.length > 0
        ? eligibleTeachers[Math.floor(Math.random() * eligibleTeachers.length)]
        : activeTeachers[Math.floor(Math.random() * activeTeachers.length)] || { name: 'Docente Não Definido' };
      const slotsNeeded = Math.max(1, Math.ceil(subject.workload / 20));
      for (let i = 0; i < slotsNeeded; i++) {
        if (posIndex >= shuffledPositions.length) break;
        const pos = shuffledPositions[posIndex++];
        newGeneratedAllocations.push({
          id: `gen-pa-${subject.id}-${pos.day}-${pos.slotId}-${i}`,
          semester: selectedMatrixSemester,
          dayOfWeek: pos.day,
          timeSlotId: pos.slotId,
          subjectName: subject.name,
          teacherName: assignedTeacher.name
        });
      }
    });

    setPreAllocations([...updatedPreAllocations, ...newGeneratedAllocations]);
    showToast("Nova grade inteligente gerada de forma automática e otimizada!", "success");
  };

  // --- Save pre-allocation to real allocations ---
  const handleSavePreAllocation = () => {
    const currentSemesterPreAllocations = preAllocations.filter(
      pa => pa.semester === selectedMatrixSemester &&
            (selectedTurn === 'Todos' || pa.timeSlotId.startsWith(selectedTurn === 'Manhã' ? 'm' : selectedTurn === 'Tarde' ? 't' : 'n'))
    );

    if (currentSemesterPreAllocations.length === 0) {
      showToast("Nenhuma pré-alocação disponível para salvar neste turno e semestre.", "error");
      return;
    }

    const doubleBookings = currentSemesterPreAllocations.filter((pa, index) =>
      currentSemesterPreAllocations.some((other, otherIdx) =>
        otherIdx !== index && other.dayOfWeek === pa.dayOfWeek && other.timeSlotId === pa.timeSlotId
      )
    );
    const ruleConflicts = currentSemesterPreAllocations.filter(pa =>
      checkPreAllocationConflict(pa.teacherName, pa.dayOfWeek, pa.timeSlotId, pa.subjectName) === 'conflict'
    );

    if (doubleBookings.length > 0 || ruleConflicts.length > 0) {
      setSaveClashModalData({ show: true, doubleBookings, ruleConflicts });
      return;
    }

    let count = 0;
    currentSemesterPreAllocations.forEach(pa => {
      const existing = allocations.find(a => a.courseId === selectedCourseId && a.semester === selectedSemester && a.dayOfWeek === pa.dayOfWeek && a.timeSlotId === pa.timeSlotId);
      if (existing) onDeleteAllocation(existing.id);

      const sub = subjects.find(s => s.name.toLowerCase() === pa.subjectName.toLowerCase() && s.courseId === selectedCourseId);
      const teach = teachers.find(t => t.name.toLowerCase() === pa.teacherName.toLowerCase());
      if (sub && teach) {
        onAddAllocation({
          id: `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          courseId: selectedCourseId,
          period: selectedMatrixSemester,
          dayOfWeek: pa.dayOfWeek,
          timeSlotId: pa.timeSlotId,
          subjectId: sub.id,
          teacherId: teach.id,
          semester: selectedSemester,
          room: 'Sala IA',
          block: 'Bloco A'
        });
        count++;
      }
    });

    showToast(`Pré-Alocação salva! ${count} horários consolidados com sucesso.`, "success");
  };

  // --- Manual allocation conflict detection ---
  const conflictsAndWarnings = useMemo(() => {
    const errorList: string[] = [];
    const warningList: string[] = [];
    if (!allocatedSubjectId || !allocatedTeacherId) return { errorList, warningList };
    const selectedSub = subjects.find(s => s.id === allocatedSubjectId);
    if (!selectedSub) return { errorList, warningList };
    const teacher = teachers.find(t => t.id === allocatedTeacherId);
    if (!teacher) return { errorList, warningList };

    const teacherAllocations = allocations.filter(entry => entry.teacherId === teacher.id && entry.semester === selectedSemester);
    const currentTeacherHours = teacherAllocations.length * 2;
    const maxAllowedHours = getTeacherTimeLimit(teacher);
    if (currentTeacherHours + (requiredSlotsCount * 2) > maxAllowedHours) {
      warningList.push(`Limite de Horas excedido: Esta alocação (${requiredSlotsCount * 2}h) fará o docente ${teacher.name} ultrapassar sua carga máxima semanal de ${maxAllowedHours}h (atualmente em ${currentTeacherHours}h).`);
    }
    if (teacher.leaveType && teacher.leaveType !== LeaveType.Nenhum) {
      warningList.push(`Docente Afastado: ${teacher.name} está sob licença/afastamento oficial (${teacher.leaveType}).`);
    }
    const preferredSubjects = teacher.disciplinasMinistradas || [];
    if (preferredSubjects.length > 0 && !preferredSubjects.includes(allocatedSubjectId)) {
      warningList.push(`Ausência de preferência: "${selectedSub.name}" não está listada no plano de interesse docente do professor ${teacher.name}.`);
    }
    selectedSlots.forEach(slot => {
      const matrixCollided = allocations.find(entry => entry.courseId === selectedCourseId && entry.period === selectedMatrixSemester && entry.dayOfWeek === slot.day && entry.timeSlotId === slot.slotId && entry.semester === selectedSemester);
      if (matrixCollided) {
        const otherSub = subjects.find(s => s.id === matrixCollided.subjectId);
        errorList.push(`Conflito de Grade: Já existe a matéria "${otherSub?.name}" marcada para o ${selectedMatrixSemester}ºS na ${slot.day} (${TIME_SLOTS.find(ts => ts.id === slot.slotId)?.label}).`);
      }
      const teacherOccupied = allocations.find(entry => entry.teacherId === teacher.id && entry.dayOfWeek === slot.day && entry.timeSlotId === slot.slotId && entry.semester === selectedSemester);
      if (teacherOccupied) {
        const otherSubName = subjects.find(s => s.id === teacherOccupied.subjectId)?.name || 'Outro curso';
        errorList.push(`Professor Indisponível: ${teacher.name} já ministra "${otherSubName}" em outro horário ou turma na ${slot.day} (${TIME_SLOTS.find(ts => ts.id === slot.slotId)?.label}).`);
      }
      const interjornada = checkInterjornadaConflict(slot.day, slot.slotId, teacher.id);
      if (interjornada) errorList.push(`Descanso Violado em ${slot.day} (${TIME_SLOTS.find(ts => ts.id === slot.slotId)?.label}): ${interjornada.reason}`);
    });
    return { errorList, warningList };
  }, [allocatedSubjectId, allocatedTeacherId, selectedSemester, selectedMatrixSemester, allocations, selectedCourseId, teachers, subjects, selectedSlots, requiredSlotsCount]);

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
      onAddAllocation({
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
      });
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
    setCurrentStep(1);
    setIsDrawerOpen(false);
  };

  const handleRemoveAllocation = (id: string) => {
    onDeleteAllocation(id);
    setNewlyAddedIds(prev => { const copy = new Set(prev); copy.delete(id); return copy; });
    showToast("Vínculo de grade removido.", "info");
  };

  const isTeacherPreferring = useMemo(() => {
    if (!selectedTeacher || !allocatedSubjectId) return false;
    return selectedTeacher.disciplinasMinistradas?.includes(allocatedSubjectId) || false;
  }, [selectedTeacher, allocatedSubjectId]);

  const teacherCurrentAllocations = useMemo(() => {
    if (!allocatedTeacherId) return [];
    return allocations.filter(a => a.teacherId === allocatedTeacherId && a.semester === selectedSemester);
  }, [allocations, allocatedTeacherId, selectedSemester]);

  if (courseSemesters.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative font-sans">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-wider">
            <span>Início</span><ChevronRight size={10} className="text-zinc-350" /><span>Alocações</span><ChevronRight size={10} className="text-zinc-300" />
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
          <div className="p-5 bg-amber-50 rounded-full text-amber-600/95 border border-amber-200"><Calendar size={48} className="stroke-[1.5]" /></div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-zinc-900 uppercase">Nenhum Semestre Lançado</h3>
            <p className="text-zinc-500 text-sm max-w-md mx-auto leading-relaxed font-semibold">Não há nenhum período ou semestre letivo lançado para o curso sob sua gestão neste momento.</p>
          </div>
          {onNavigate && (
            <button type="button" onClick={() => onNavigate('new-semester')} className="h-11 px-6 bg-[#32a041] text-white hover:bg-[#277c32] text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2 animate-pulse">
              <Plus size={14} strokeWidth={3} />Lançar Primeiro Semestre
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 relative font-sans text-zinc-800">

      {/* Toast */}
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

      {/* Header + Stepper */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-1">
            <span>Início</span><ChevronRight size={10} className="text-zinc-300" /><span>Alocações</span><ChevronRight size={10} className="text-zinc-300" />
            <span className="text-[#32a041]">{currentStep === 1 ? 'Pré Alocação' : currentStep === 2 ? 'Planejar Vínculo' : 'Montar Grade'}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Distribuição de Alocações</h1>
        </div>

        <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-[10px] font-black uppercase tracking-wider relative select-none">
          <button
            type="button"
            onClick={() => { setCurrentStep(1); setSelectedSlots([]); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${currentStep === 1 ? 'bg-[#32a041] text-white shadow-xs' : 'text-zinc-440 hover:text-zinc-700'}`}
          >
            <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[8.5px]">1</span>
            Pré Alocação
          </button>
          <div className="flex items-center text-zinc-300 px-1"><ChevronRight size={12} strokeWidth={3.5} /></div>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${currentStep === 2 || currentStep === 3 ? 'bg-[#32a041] text-white shadow-xs' : 'text-zinc-440 hover:text-zinc-700'}`}
          >
            <span className="w-4 h-4 rounded-full bg-black/10 flex items-center justify-center text-[8.5px]">2</span>
            Alocar Manualmente
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ======================================================== */}
        {/* STEP 1: PRÉ-ALOCAÇÃO INTELIGENTE                         */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <motion.div key="pre-allocation-step" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-6">

            {/* AI Banner */}
            <div className="bg-[#32a041]/5 border border-[#32a041]/15 rounded-2xl p-5 flex items-center gap-4 shadow-xs animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-[#32a041] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Sparkles size={18} className="fill-white/10" />
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-emerald-700 tracking-wider bg-emerald-100/50 px-2.5 py-0.5 rounded leading-none">Assistente Inteligente Ativo</span>
                <p className="text-xs font-black text-zinc-800 leading-snug uppercase mt-1">
                  GRADE GERADA AUTOMATICAMENTE COM BASE NAS PREFERÊNCIAS DOS DOCENTES
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 pl-1">Curso</label>
                <div className="relative">
                  <select value={selectedCourseId} onChange={(e) => { setSelectedCourseId(e.target.value); setSelectedSlots([]); }} className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl pl-3 pr-8 text-xs font-bold uppercase tracking-widest outline-none focus:bg-white text-zinc-750 appearance-none cursor-pointer transition-all">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 pl-1">Semestres Ativos (Matriz)</label>
                <div className="relative">
                  <select value={selectedMatrixSemester} onChange={(e) => { setSelectedMatrixSemester(Number(e.target.value)); setSelectedSlots([]); }} className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl pl-3 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:bg-white text-zinc-750 appearance-none cursor-pointer transition-all">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(pNum => <option key={pNum} value={pNum}>{pNum}º Semestre</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 pl-1">Alternar Turno na Grade</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 gap-0.5 select-none text-[9.5px] font-black flex-1">
                    {['Manhã', 'Tarde', 'Noite', 'Todos'].map((t) => (
                      <button key={t} type="button" onClick={() => setSelectedTurn(t as any)} className={`flex-1 h-9 rounded-lg uppercase tracking-widest transition-all outline-none cursor-pointer ${selectedTurn === t ? 'bg-[#32a041] text-white shadow-sm font-black' : 'text-zinc-500 hover:text-zinc-700 font-bold'}`}>{t}</button>
                    ))}
                  </div>
                  <button type="button" onClick={handleGenerateAutomaticGrid} className="h-9 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#32a041] border border-emerald-200 rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shrink-0">
                    <Sparkles size={12} className="animate-pulse text-emerald-600" />
                    <span>Gerar Grade</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Validation Status + Workload + Teacher Prefs Panel */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-5 shadow-xs grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {/* Conflict status */}
              <div className="flex flex-col justify-between p-4 bg-zinc-50/50 rounded-xl border border-zinc-100">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Status de Validação</span>
                <div className="flex items-center gap-3">
                  {hasTurnConflicts ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0 animate-pulse"><AlertCircle size={20} strokeWidth={2.5} /></div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">Com Conflito</span>
                        <p className="text-[11px] font-semibold text-zinc-400 mt-1 uppercase tracking-wide leading-none">Há pendências ou violações de preferência.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#32a041] shrink-0"><CheckCircle2 size={20} strokeWidth={2.5} /></div>
                      <div>
                        <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Sem Conflito</span>
                        <p className="text-[11px] font-semibold text-zinc-400 mt-1 uppercase tracking-wide leading-none">A grade atual atende ao corpo docente.</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Workload counter */}
              <div className="flex flex-col justify-between p-4 bg-zinc-50/50 rounded-xl border border-zinc-100">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Carga Horária & Horários</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#32a041]/10 flex items-center justify-center text-[#32a041] shrink-0 font-mono text-sm font-black">{totalPreAllocatedSlots}</div>
                  <div>
                    <span className="text-[11px] font-black uppercase text-zinc-700">Exigidas: {totalRequiredSlots} Horários</span>
                    <p className="text-[11px] font-semibold text-zinc-450 mt-1 uppercase tracking-wide leading-none">Preenchido: {totalPreAllocatedSlots} / {totalRequiredSlots}</p>
                  </div>
                </div>
              </div>

              {/* Teacher preference picker */}
              <div className="flex flex-col p-4 bg-zinc-50/50 rounded-xl border border-zinc-100 justify-between relative">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest block mb-2">Fichas de Preferências</span>
                <div className="relative w-full">
                  <button type="button" onClick={() => setIsPrefTeacherDropdownOpen(!isPrefTeacherDropdownOpen)} className="w-full h-10 px-3.5 bg-white border border-zinc-200 hover:border-[#32a041]/40 rounded-xl flex items-center justify-between text-xs font-bold text-zinc-750 transition-all cursor-pointer shadow-3xs">
                    <div className="flex items-center gap-2"><User size={13} className="text-[#32a041]" /><span className="uppercase text-[10.5px] tracking-wide text-zinc-700 font-extrabold truncate max-w-[170px]">Selecionar Docente...</span></div>
                    {isPrefTeacherDropdownOpen ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
                  </button>
                  <AnimatePresence>
                    {isPrefTeacherDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.12 }} className="absolute left-0 right-0 mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden flex flex-col max-h-[220px]">
                        <div className="p-2 border-b border-zinc-100 bg-zinc-50 flex items-center gap-1.5 shrink-0">
                          <input type="text" placeholder="Buscar docente..." value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)} onClick={(e) => e.stopPropagation()} className="w-full h-8 px-2.5 text-xs font-bold border border-zinc-200 bg-white rounded-lg focus:outline-none focus:border-[#32a041]/50 text-zinc-700 placeholder:text-zinc-350" />
                        </div>
                        <div className="overflow-y-auto divide-y divide-zinc-50 flex-1">
                          {activeTeachers.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase())).map(t => (
                            <button key={t.id} type="button" onClick={() => { setSelectedPreferenceTeacher(t); setIsPrefTeacherDropdownOpen(false); }} className="w-full text-left px-4 py-2 hover:bg-[#32a041]/5 transition-all flex flex-col justify-center cursor-pointer group">
                              <span className="text-[11.5px] font-extrabold text-zinc-800 uppercase group-hover:text-[#32a041] transition-colors leading-snug truncate">{t.name}</span>
                              <span className="text-[8px] font-bold text-zinc-450 uppercase tracking-wider mt-0.5">{t.regime} • {t.role || 'Docente'}</span>
                            </button>
                          ))}
                          {activeTeachers.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase())).length === 0 && (
                            <div className="px-4 py-4 text-center text-[10px] text-zinc-400 italic font-medium">Nenhum docente encontrado.</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Pre-allocation Timetable Grid */}
            <div className="overflow-x-auto border border-zinc-200 rounded-2xl shadow-sm bg-white">
              <table className="w-full min-w-[750px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="py-3 px-4 text-left text-[9px] font-black uppercase tracking-wider text-zinc-400 w-32">Horário</th>
                    {DAYS_ORDER.map(day => <th key={day} className="py-3 px-2 text-center text-[9px] font-black uppercase tracking-wider text-[#58595b] w-40">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map((slot) => {
                    if (slot.isBreak) {
                      return (
                        <tr key={slot.id} className="border-b border-zinc-150/70 bg-zinc-50/40">
                          <td className="py-2 px-4 text-[8px] font-black text-center text-zinc-400 uppercase tracking-widest">{slot.period}</td>
                          <td colSpan={DAYS_ORDER.length} className="py-2 px-2 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-400">{slot.label} — {slot.period}</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={slot.id} className="border-b border-zinc-100 hover:bg-zinc-50/5 transition-colors">
                        <td className="py-3 px-4 border-r border-zinc-150 text-left bg-zinc-50/20">
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block leading-none">{slot.period}</span>
                          <span className="text-[11px] font-black text-zinc-700 leading-none mt-1 block font-mono">{slot.label}</span>
                        </td>
                        {DAYS_ORDER.map((day) => {
                          const cellMatches = preAllocationsForTurn.filter(pa => pa.dayOfWeek === day && pa.timeSlotId === slot.id);

                          if (cellMatches.length > 0) {
                            const cellConflicts: string[] = [];
                            if (cellMatches.length > 1) cellConflicts.push(`Choque de Horário: Mais de uma disciplina alocada neste mesmo horário (${cellMatches.map(m => m.subjectName).join(' e ')}).`);
                            cellMatches.forEach(m => {
                              const duplicates = preAllocations.filter(pa => pa.id !== m.id && pa.teacherName.toLowerCase() === m.teacherName.toLowerCase() && pa.dayOfWeek === day && pa.timeSlotId === slot.id);
                              duplicates.forEach(dup => cellConflicts.push(`Docente em Duplicidade: ${m.teacherName} está alocado ao mesmo tempo no ${dup.semester}º Semestre (${dup.subjectName}).`));
                              const teacherObj = teachers.find(t => t.name.toLowerCase() === m.teacherName.toLowerCase());
                              if (teacherObj) {
                                const prefs = getTeacherPrefs(teacherObj);
                                const turn = slot.id.startsWith('m') ? 'Manhã' : slot.id.startsWith('t') ? 'Tarde' : 'Noite';
                                if (prefs.unavailableDays.includes(day)) cellConflicts.push(`Indisponibilidade: ${m.teacherName} está indisponível na ${day}-feira.`);
                                if (!prefs.preferredTurns.includes(turn)) cellConflicts.push(`Turno Indesejado: ${m.teacherName} não prefere lecionar no turno da ${turn}.`);
                                if (prefs.preferredSubjects.length > 0 && !prefs.preferredSubjects.some(s => s.toLowerCase() === m.subjectName.toLowerCase())) cellConflicts.push(`Disciplina Não Preferida: "${m.subjectName}" não faz parte das preferências de ${m.teacherName}.`);
                              }
                            });

                            const isConflicted = cellConflicts.length > 0;
                            const hasClash = cellMatches.length > 1;
                            const cardStyle = isConflicted
                              ? "bg-rose-50/95 border-red-500 border-2 hover:bg-rose-100/90 text-rose-900 ring-2 ring-red-100 shadow-md animate-pulse"
                              : "bg-emerald-50 border-emerald-200 hover:bg-emerald-100/50 text-emerald-800";
                            const badgeStyle = isConflicted ? "bg-red-100 text-red-800 border border-red-300" : "bg-emerald-100 text-emerald-800 border border-emerald-200/50";
                            const scoreLabel = hasClash ? "Choque de Horários" : isConflicted ? "Com Conflito" : "Sem Conflito";

                            return (
                              <td key={day} className="p-1 border-r border-zinc-100 text-center align-middle relative group">
                                <div
                                  onClick={() => {
                                    if (isConflicted) {
                                      setConflictResolutionSlot({ day, slotId: slot.id, matches: cellMatches });
                                      if (cellMatches.length > 0) setActiveConflictTeacherName(cellMatches[0].teacherName);
                                    } else {
                                      setEditingSlot({ day, slotId: slot.id, existingId: cellMatches[0].id, subjectName: cellMatches[0].subjectName, teacherName: cellMatches[0].teacherName });
                                    }
                                  }}
                                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center min-h-[85px] leading-tight select-none transition-all duration-150 hover:-translate-y-0.5 shadow-xs cursor-pointer ${cardStyle}`}
                                >
                                  {hasClash ? (
                                    <div className="w-full space-y-1 text-center">
                                      <span className="text-[7.5px] font-black text-rose-700 bg-rose-200/50 px-1 py-0.5 rounded uppercase tracking-wider block mb-1">⚠️ Choque ({cellMatches.length})</span>
                                      {cellMatches.map((m, idx) => (
                                        <div key={m.id} className={idx > 0 ? "border-t border-rose-100 pt-1 mt-1 text-left" : "text-left"}>
                                          <h4 className="text-[9.5px] font-black uppercase tracking-tight text-rose-900 truncate max-w-full leading-none">{m.subjectName}</h4>
                                          <p className="text-[8px] font-bold text-zinc-500 truncate max-w-full mt-0.5">{m.teacherName}</p>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <>
                                      <h4 className="text-[10.5px] font-black uppercase tracking-wider text-center leading-normal truncate max-w-full">{cellMatches[0].subjectName}</h4>
                                      <span className="text-[9px] font-bold text-zinc-600 mt-1 truncate max-w-full">{cellMatches[0].teacherName}</span>
                                    </>
                                  )}
                                  <span className={`mt-1.5 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded leading-none flex items-center gap-0.5 ${badgeStyle}`}>
                                    {!isConflicted && <Sparkles size={6.5} className="fill-emerald-800/10" />}
                                    {isConflicted && <AlertTriangle size={6.5} className="text-red-600 animate-pulse" />}
                                    {scoreLabel}
                                  </span>
                                </div>
                                {cellConflicts.length > 0 && (
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-72 bg-zinc-950 text-white text-[10px] rounded-xl p-3 shadow-2xl border border-zinc-800 text-left pointer-events-none">
                                    <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1.5 mb-1.5">
                                      <AlertTriangle size={12} className="text-red-500 animate-pulse" />
                                      <span className="font-extrabold uppercase tracking-wider text-red-400 text-[8.5px]">⚠️ Erros de Alocação ({cellConflicts.length})</span>
                                    </div>
                                    <ul className="space-y-1.5 list-disc pl-3.5 text-zinc-300 font-medium leading-normal">
                                      {cellConflicts.map((err, errIdx) => <li key={errIdx} className="marker:text-red-500">{err}</li>)}
                                    </ul>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-[6px] border-transparent border-t-zinc-950" />
                                  </div>
                                )}
                              </td>
                            );
                          }

                          return (
                            <td key={day} className="p-1 border-r border-zinc-100 text-center align-middle">
                              <div onClick={() => setEditingSlot({ day, slotId: slot.id })} className="group py-3 px-2 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/20 hover:bg-zinc-50/85 hover:border-zinc-350 text-zinc-400 hover:text-zinc-600 flex flex-col items-center justify-center min-h-[75px] leading-tight select-none transition-all duration-150 cursor-pointer relative">
                                <h4 className="text-[9.5px] font-black uppercase tracking-wider group-hover:opacity-0 transition-opacity">Vago</h4>
                                <span className="text-[7.5px] font-semibold opacity-80 mt-0.5 group-hover:opacity-0 transition-opacity">Disponível</span>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[#32a041] transition-opacity duration-150">
                                  <Plus size={14} strokeWidth={3} />
                                  <span className="text-[8.5px] font-black uppercase tracking-wider mt-0.5">Adicionar</span>
                                </div>
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

            {/* Legend */}
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Validação da Grade Sugerida</span>
                <p className="text-[11px] text-zinc-400 font-medium">Os horários são auditados cruzando as restrições e preferências informadas pelo corpo docente.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></div>
                  <div className="text-left"><span className="text-xs font-black text-zinc-750 block leading-none">Sem Conflito (Verde)</span><span className="text-[9px] text-zinc-400 font-bold uppercase leading-none block mt-0.5">Atende às preferências do docente</span></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-rose-500" /></div>
                  <div className="text-left"><span className="text-xs font-black text-zinc-750 block leading-none">Com Conflito (Vermelho)</span><span className="text-[9px] text-zinc-400 font-bold uppercase leading-none block mt-0.5">Choque, indisponibilidade ou baixa aderência</span></div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-3.5 h-3.5 rounded border border-dashed border-zinc-200 bg-zinc-50/20 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 rounded-full bg-zinc-400" /></div>
                  <div className="text-left"><span className="text-xs font-black text-zinc-700 block leading-none">Vago</span><span className="text-[9px] text-zinc-400 font-bold uppercase leading-none block mt-0.5">Clique para alocar manualmente</span></div>
                </div>
              </div>
            </div>

            {/* Save / Continue actions */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-md flex flex-col md:flex-row justify-between items-center gap-5">
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-sm font-black uppercase tracking-wider text-[#32a041] flex items-center justify-center md:justify-start gap-1.5"><Sparkles size={14} className="fill-[#32a041]/10" />Salvar Pré-Alocação Inteligente</h3>
                <p className="text-xs text-zinc-500 max-w-2xl font-semibold uppercase tracking-wide">Os horários sugeridos serão consolidados no banco de dados e sincronizados com o dashboard.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button type="button" onClick={() => { setCurrentStep(2); showToast("Iniciando refinamento manual do planejamento de vínculos.", "success"); }} className="h-10 px-5 text-xs font-black uppercase tracking-widest rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                  <span>Refinar Manualmente</span><ChevronRight size={13} strokeWidth={2.5} />
                </button>
                <button type="button" onClick={handleSavePreAllocation} className="h-10 px-5 text-xs font-black uppercase tracking-widest rounded-lg bg-[#32a041] hover:bg-emerald-600 text-white border border-[#32a041]/30 shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer">
                  <CheckCircle2 size={14} strokeWidth={3} /><span>Confirmar e Finalizar</span>
                </button>
              </div>
            </div>

            {/* Change History card */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-6 shadow-md flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#32a041] shrink-0"><History size={18} /></div>
                <div className="text-left">
                  <h4 className="text-sm font-black uppercase tracking-wider text-zinc-750 flex items-center gap-1.5">
                    Histórico de Mudanças
                    <span className="bg-[#32a041]/10 text-[#32a041] text-[10px] px-2 py-0.5 rounded-full font-black">{changeLogs.length}</span>
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wide">Consulte as movimentações, trocas de docente e alterações realizadas.</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsChangeHistoryModalOpen(true)} className="h-10 px-5 text-xs font-black uppercase tracking-widest rounded-lg bg-zinc-50 hover:bg-zinc-100 text-[#32a041] border border-zinc-200 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0">
                <span>Visualizar Histórico</span><ArrowRightLeft size={13} strokeWidth={2.5} />
              </button>
            </div>

            {/* ---- MODAL: Change History ---- */}
            {isChangeHistoryModalOpen && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150" onClick={() => setIsChangeHistoryModalOpen(false)}>
                <div className="absolute inset-0 cursor-pointer" />
                <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-zinc-150 z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                  <div className="p-5 bg-zinc-50 border-b border-zinc-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#32a041]/10 flex items-center justify-center text-[#32a041]"><History size={16} /></div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-wide">Histórico de Mudanças</h3>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Registro em tempo real das alterações do planejamento atual</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => setIsChangeHistoryModalOpen(false)} className="w-8 h-8 rounded-lg hover:bg-zinc-100 flex items-center justify-center text-zinc-400 cursor-pointer"><X size={16} /></button>
                  </div>
                  <div className="p-4 bg-zinc-50/50 border-b border-zinc-100 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider shrink-0">Semestre:</span>
                      <select value={historySemesterFilter} onChange={(e) => { setHistorySemesterFilter(e.target.value); setHistoryCurrentPage(1); }} className="h-8 bg-white border border-zinc-250 rounded-lg px-2 text-xs font-bold outline-none text-zinc-700 cursor-pointer">
                        <option value="all">Todos os Semestres</option>
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}º Semestre</option>)}
                      </select>
                    </div>
                    <div className="relative w-full sm:w-64">
                      <input type="text" placeholder="Buscar por docente ou disciplina..." value={historySearchQuery} onChange={(e) => { setHistorySearchQuery(e.target.value); setHistoryCurrentPage(1); }} className="w-full h-8 pl-8 pr-3 text-xs font-bold border border-zinc-250 bg-white rounded-lg focus:outline-none focus:border-[#32a041]/50 text-zinc-700 placeholder:text-zinc-400" />
                      <Search size={12} className="absolute left-2.5 top-2.5 text-zinc-400" />
                    </div>
                  </div>
                  <div className="overflow-x-auto overflow-y-auto flex-1 min-h-0 p-4">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-150 bg-zinc-50">
                          <th className="p-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider">Docente</th>
                          <th className="p-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider">Matéria / Semestre</th>
                          <th className="p-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider">Tipo de Alteração</th>
                          <th className="p-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider">De</th>
                          <th className="p-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider text-center">Para</th>
                          <th className="p-3 text-[10px] font-black uppercase text-zinc-400 tracking-wider text-right">Horário</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {historyPaginatedLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="p-3"><span className="text-xs font-black text-zinc-750 block uppercase leading-tight">{log.teacherName}</span></td>
                            <td className="p-3"><span className="text-xs font-bold text-zinc-700 block leading-tight">{log.subjectName}</span><span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block mt-0.5">{log.semester}º Semestre</span></td>
                            <td className="p-3">
                              <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${log.type.includes('Inclusão') ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : log.type.includes('Exclusão') ? 'bg-rose-50 text-rose-700 border border-rose-100' : log.type.includes('Movimentação') ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-zinc-50 text-zinc-700 border border-zinc-150'}`}>{log.type}</span>
                            </td>
                            <td className="p-3"><span className="text-xs font-semibold text-zinc-500 italic block leading-tight">{log.from}</span></td>
                            <td className="p-3 text-center"><div className="flex items-center gap-1.5 justify-center"><ArrowRight size={10} className="text-zinc-400 shrink-0" /><span className="text-xs font-black text-zinc-800 uppercase block leading-tight bg-zinc-50 px-2 py-1 rounded-md border border-zinc-100">{log.to}</span></div></td>
                            <td className="p-3 text-right"><span className="text-[10px] font-mono font-bold text-zinc-400">{log.timestamp}</span></td>
                          </tr>
                        ))}
                        {historyPaginatedLogs.length === 0 && (
                          <tr><td colSpan={6} className="p-8 text-center text-xs text-zinc-400 italic font-medium">Nenhuma alteração encontrada com os filtros selecionados.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between shrink-0">
                    <span className="text-[10.5px] text-zinc-500 font-bold uppercase tracking-wide">
                      Exibindo <span className="font-extrabold text-zinc-700">{filteredLogs.length > 0 ? (historyCurrentPage - 1) * 5 + 1 : 0}</span>-<span className="font-extrabold text-zinc-700">{Math.min(historyCurrentPage * 5, filteredLogs.length)}</span> de <span className="font-extrabold text-zinc-700">{filteredLogs.length}</span> alterações
                    </span>
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={historyCurrentPage === 1} onClick={() => setHistoryCurrentPage(prev => Math.max(prev - 1, 1))} className="h-8 w-8 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronLeft size={14} strokeWidth={2.5} /></button>
                      <div className="flex items-center text-[10.5px] text-zinc-500 font-black uppercase tracking-wider px-2">PÁGINA {historyCurrentPage} DE {totalHistoryPages}</div>
                      <button type="button" disabled={historyCurrentPage === totalHistoryPages} onClick={() => setHistoryCurrentPage(prev => Math.min(prev + 1, totalHistoryPages))} className="h-8 w-8 rounded-lg border border-zinc-200 bg-white flex items-center justify-center text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"><ChevronRight size={14} strokeWidth={2.5} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---- MODAL: Save Clash Blocker ---- */}
            {saveClashModalData?.show && (() => {
              const { doubleBookings, ruleConflicts } = saveClashModalData;
              const uniqueConflictsMap: Record<string, { day: string; slotId: string; matches: any[] }> = {};
              [...doubleBookings, ...ruleConflicts].forEach(pa => {
                const key = `${pa.dayOfWeek}-${pa.timeSlotId}`;
                if (!uniqueConflictsMap[key]) {
                  uniqueConflictsMap[key] = {
                    day: pa.dayOfWeek,
                    slotId: pa.timeSlotId,
                    matches: preAllocations.filter(m => m.semester === selectedMatrixSemester && m.dayOfWeek === pa.dayOfWeek && m.timeSlotId === pa.timeSlotId)
                  };
                }
              });
              const uniqueConflictSlots = Object.values(uniqueConflictsMap);

              return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150" onClick={() => setSaveClashModalData(null)}>
                  <div className="absolute inset-0 cursor-pointer" />
                  <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-rose-200 z-10 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                    <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-650 shrink-0"><AlertTriangle size={20} className="animate-bounce" /></div>
                      <div>
                        <h3 className="text-sm font-black text-rose-800 uppercase tracking-wider leading-none">Salvamento Bloqueado!</h3>
                        <p className="text-[11px] font-bold text-zinc-500 mt-1 uppercase leading-none">Conflitos detectados na pré-alocação inteligente</p>
                      </div>
                    </div>
                    <div className="p-5 space-y-4 overflow-y-auto flex-1">
                      <p className="text-xs text-zinc-600 font-medium leading-relaxed">Detectamos inconsistências que impossibilitam a gravação automática. Corrija os conflitos abaixo para consolidar a grade horária final.</p>
                      <div className="space-y-3">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Pontos de Inconsistência ({uniqueConflictSlots.length})</span>
                        {uniqueConflictSlots.map((item, idx) => {
                          const timeLabel = TIME_SLOTS.find(ts => ts.id === item.slotId)?.label || item.slotId;
                          const hasClash = item.matches.length > 1;
                          return (
                            <div key={idx} className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/20 space-y-2">
                              <div className="flex items-center justify-between border-b border-rose-100/50 pb-1.5">
                                <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider">{item.day} — {timeLabel}</span>
                                <span className="text-[8px] font-black text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded uppercase">{hasClash ? 'Choque de Horários' : 'Violação de Preferência'}</span>
                              </div>
                              <div className="space-y-1">
                                {item.matches.map((m) => (
                                  <div key={m.id} className="text-xs">
                                    <span className="font-bold text-zinc-750 uppercase">{m.subjectName}</span>
                                    <span className="text-zinc-500 font-medium"> ministrada por </span>
                                    <span className="font-extrabold text-zinc-700 uppercase">{m.teacherName}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="pt-1.5 flex justify-end">
                                <button type="button" onClick={() => { setSaveClashModalData(null); setConflictResolutionSlot({ day: item.day, slotId: item.slotId, matches: item.matches }); if (item.matches.length > 0) setActiveConflictTeacherName(item.matches[0].teacherName); }} className="h-7 px-3 bg-white hover:bg-zinc-50 text-[9px] font-black uppercase text-zinc-700 border border-zinc-200 rounded-lg cursor-pointer transition-colors flex items-center gap-1">
                                  <Sliders size={10} />Ajustar este Horário
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-50 border-t border-zinc-150 flex gap-3">
                      <button type="button" onClick={() => setSaveClashModalData(null)} className="flex-1 h-11 text-xs font-black uppercase tracking-wider border border-zinc-200 hover:bg-zinc-100 text-zinc-550 rounded-xl transition-all cursor-pointer">Voltar à Grade</button>
                      <button type="button" onClick={() => { setSaveClashModalData(null); showToast("Ajuste manual iniciado.", "info"); }} className="flex-1 h-11 text-xs font-black uppercase tracking-wider bg-zinc-800 hover:bg-zinc-900 text-white rounded-xl shadow-xs transition-all cursor-pointer border-none">Ajustar Manualmente</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ---- MODAL: Teacher Preference Sheet ---- */}
            {selectedPreferenceTeacher && (() => {
              const prefs = getTeacherPrefs(selectedPreferenceTeacher);
              return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150" onClick={() => setSelectedPreferenceTeacher(null)}>
                  <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-150 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#32a041]/10 text-[#32a041] flex items-center justify-center font-black text-sm">{selectedPreferenceTeacher.name.replace('Prof.ª ', '').replace('Prof. ', '').charAt(0)}</div>
                        <div>
                          <h3 className="text-sm font-black text-zinc-800 uppercase tracking-wide">{selectedPreferenceTeacher.name}</h3>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{selectedPreferenceTeacher.regime} • SIAPE: {selectedPreferenceTeacher.registration}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedPreferenceTeacher(null)} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-all cursor-pointer border-none"><X size={16} strokeWidth={2.5} /></button>
                    </div>
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2.5">📚 Disciplinas de Preferência</span>
                        <div className="flex flex-wrap gap-1.5">
                          {prefs.preferredSubjects.length > 0 ? prefs.preferredSubjects.map(subName => (
                            <span key={subName} className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-black rounded-lg uppercase">{subName}</span>
                          )) : <span className="text-xs text-zinc-400 italic">Nenhuma preferência declarada.</span>}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2.5">⏰ Turnos Preferidos</span>
                        <div className="flex gap-2">
                          {['Manhã', 'Tarde', 'Noite'].map(turn => (
                            <div key={turn} className={`flex-1 py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${prefs.preferredTurns.includes(turn) ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-black' : 'bg-zinc-50 border-zinc-150 text-zinc-400 opacity-60'}`}>{turn}</div>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2.5">📅 Dias Preferidos</span>
                          <div className="space-y-1">
                            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => (
                              <div key={day} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between ${prefs.preferredDays.includes(day) ? 'bg-emerald-50/60 text-emerald-800 border border-emerald-100 font-black' : 'bg-zinc-50/30 text-zinc-400'}`}>
                                <span>{day}</span>
                                {prefs.preferredDays.includes(day) && <Check size={12} strokeWidth={3} className="text-emerald-600" />}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2.5">🚫 Indisponibilidade</span>
                          <div className="space-y-1">
                            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => (
                              <div key={day} className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-between ${prefs.unavailableDays.includes(day) ? 'bg-rose-50/85 text-rose-800 border border-rose-100 font-black' : 'bg-zinc-50/30 text-zinc-400'}`}>
                                <span>{day}</span>
                                {prefs.unavailableDays.includes(day) && <X size={12} strokeWidth={3} className="text-rose-600" />}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                      <button onClick={() => setSelectedPreferenceTeacher(null)} className="px-5 py-2 text-xs font-black uppercase tracking-wider bg-zinc-850 hover:bg-zinc-900 text-white rounded-xl cursor-pointer">Fechar Ficha</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ---- MODAL: Add/Edit Slot ---- */}
            {editingSlot && (() => {
              const isNew = !editingSlot.existingId;
              return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150" onClick={() => setEditingSlot(null)}>
                  <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-zinc-150 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="p-5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-black text-[#32a041] uppercase tracking-widest">{isNew ? 'Nova Pré-Alocação Manual' : 'Editar Alocação Sugerida'}</h3>
                        <p className="text-xs font-bold text-zinc-750 mt-1 uppercase">{editingSlot.day} — {TIME_SLOTS.find(ts => ts.id === editingSlot.slotId)?.label}</p>
                      </div>
                      <button onClick={() => setEditingSlot(null)} className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-400 flex items-center justify-center transition-all cursor-pointer border-none"><X size={16} strokeWidth={2.5} /></button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 pl-1">Escolha a Disciplina</label>
                        <select value={editingSlot.subjectName || ""} onChange={(e) => setEditingSlot(prev => prev ? { ...prev, subjectName: e.target.value } : null)} className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl px-3 text-xs font-bold uppercase outline-none focus:bg-white text-zinc-700 cursor-pointer">
                          <option value="">-- Escolha uma Disciplina --</option>
                          {offeredSubjects.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 pl-1">Escolha o Professor</label>
                        <select value={editingSlot.teacherName || ""} onChange={(e) => setEditingSlot(prev => prev ? { ...prev, teacherName: e.target.value } : null)} className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl px-3 text-xs font-bold uppercase outline-none focus:bg-white text-zinc-700 cursor-pointer">
                          <option value="">-- Escolha um Professor --</option>
                          {activeTeachers.map(teach => <option key={teach.id} value={teach.name}>{teach.name}</option>)}
                        </select>
                      </div>
                      {!isNew && (
                        <button type="button" onClick={() => { setPreAllocations(prev => prev.filter(pa => pa.id !== editingSlot.existingId)); setEditingSlot(null); showToast("Alocação removida do horário.", "info"); }} className="w-full h-10 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                          <Trash2 size={13} /><span>Tornar Horário Vago</span>
                        </button>
                      )}
                    </div>
                    <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-between gap-3">
                      <button type="button" onClick={() => setEditingSlot(null)} className="flex-1 h-10 text-xs font-black uppercase tracking-wider border border-zinc-200 hover:bg-zinc-100 text-zinc-550 rounded-xl transition-all cursor-pointer">Cancelar</button>
                      <button type="button" disabled={!editingSlot.subjectName || !editingSlot.teacherName}
                        onClick={() => {
                          if (editingSlot.subjectName && editingSlot.teacherName) {
                            if (isNew) {
                              setPreAllocations(prev => [...prev, { id: `pa-manual-${Date.now()}`, semester: selectedMatrixSemester, dayOfWeek: editingSlot.day, timeSlotId: editingSlot.slotId, subjectName: editingSlot.subjectName, teacherName: editingSlot.teacherName }]);
                              showToast(`Pré-alocação de ${editingSlot.subjectName} inserida!`, "success");
                            } else {
                              setPreAllocations(prev => prev.map(pa => pa.id === editingSlot.existingId ? { ...pa, subjectName: editingSlot.subjectName!, teacherName: editingSlot.teacherName! } : pa));
                              showToast(`Pré-alocação de ${editingSlot.subjectName} atualizada!`, "success");
                            }
                            setEditingSlot(null);
                          }
                        }}
                        className="flex-1 h-10 text-xs font-black uppercase tracking-wider bg-[#32a041] hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all cursor-pointer border-none"
                      >Confirmar</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ---- MODAL: Conflict Resolution ---- */}
            {conflictResolutionSlot && (() => {
              const { day, slotId, matches } = conflictResolutionSlot;
              const timeSlotLabel = TIME_SLOTS.find(ts => ts.id === slotId)?.label || slotId;
              const hasClash = matches.length > 1;

              const autoSuggestions = (() => {
                const list: { type: 'move' | 'swap'; title: string; description: string; benefits: string[]; actionText: string; onApply: () => void }[] = [];
                const DAYS_LIST = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

                matches.forEach((alloc) => {
                  const prefs = getPrefsByName(alloc.teacherName);
                  DAYS_LIST.forEach(dName => {
                    TIME_SLOTS.filter(s => !s.isBreak).forEach(slot => {
                      if (dName === day && slot.id === slotId) return;
                      const slotOccupied = preAllocations.some(pa => pa.semester === selectedMatrixSemester && pa.dayOfWeek === dName && pa.timeSlotId === slot.id);
                      if (slotOccupied) return;
                      const teacherHasClass = preAllocations.some(pa => pa.teacherName.toLowerCase() === alloc.teacherName.toLowerCase() && pa.dayOfWeek === dName && pa.timeSlotId === slot.id);
                      if (teacherHasClass) return;
                      const turn = slot.id.startsWith('m') ? 'Manhã' : slot.id.startsWith('t') ? 'Tarde' : 'Noite';
                      if (prefs.unavailableDays.includes(dName)) return;
                      const isPreferredTurn = prefs.preferredTurns.includes(turn);
                      const isPreferredDay = prefs.preferredDays.includes(dName);
                      const suitScore = (isPreferredTurn && isPreferredDay) ? 3 : (isPreferredTurn || isPreferredDay) ? 1 : 0;
                      if (suitScore >= 1) {
                        list.push({
                          type: 'move',
                          title: `Mover ${alloc.subjectName}`,
                          description: `Reorganizar "${alloc.subjectName}" com ${alloc.teacherName} para ${dName} às ${slot.label.split(' ')[0]} (${turn}).`,
                          benefits: [`Resolve conflito em ${day}`, `Horário livre no semestre`, `Aderência às preferências: ${suitScore === 3 ? 'Excelente' : 'Parcial'}`],
                          actionText: 'Aplicar Mudança',
                          onApply: () => {
                            setPreAllocations(prev => prev.map(pa => pa.id === alloc.id ? { ...pa, dayOfWeek: dName, timeSlotId: slot.id } : pa));
                            setConflictResolutionSlot(prev => {
                              if (!prev) return null;
                              const stillInSlot = prev.matches.filter(pa => pa.id !== alloc.id);
                              return stillInSlot.length <= 0 ? null : { ...prev, matches: stillInSlot };
                            });
                            setShowAutoAnalysis(false);
                            showToast(`Aula de ${alloc.subjectName} movida para ${dName}!`, "success");
                          }
                        });
                      }
                    });
                  });
                });

                return list.slice(0, 4);
              })();

              return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150" onClick={() => setConflictResolutionSlot(null)}>
                  <div className="absolute inset-0 cursor-pointer" />
                  <div className="relative w-full max-w-2xl bg-white max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-zinc-200 z-10 overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                    <div className="p-5 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-3xs"><AlertTriangle size={18} strokeWidth={2.5} className="animate-pulse" /></div>
                        <div>
                          <h3 className="text-xs font-black text-rose-700 uppercase tracking-widest leading-none">Central de Resolução de Conflitos</h3>
                          <p className="text-[11px] font-bold text-zinc-500 mt-1 uppercase leading-none">{day} — Horário: {timeSlotLabel}</p>
                        </div>
                      </div>
                      <button onClick={() => setConflictResolutionSlot(null)} className="w-8 h-8 rounded-full bg-rose-100/50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition-all cursor-pointer border-none"><X size={16} strokeWidth={2.5} /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 space-y-6">
                      <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                        <h4 className="text-[10px] font-black uppercase text-rose-800 tracking-wider mb-1">{hasClash ? '🚨 Alerta de Choque: Dupla Alocação de Turma' : '⚠️ Alerta de Restrição: Preferência Violada'}</h4>
                        <p className="text-[11px] text-zinc-650 font-medium leading-relaxed">
                          {hasClash ? `Existem ${matches.length} componentes disputando o mesmo horário nesta turma. Resolva alterando o ministrante, mudando a disciplina ou removendo um dos vínculos.` : 'O docente alocado apresenta choque com suas preferências cadastradas no sistema.'}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center pl-1">
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Alocações Envolvidas no Conflito</span>
                          <button type="button" onClick={() => setShowAutoAnalysis(!showAutoAnalysis)} className={`h-7 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${showAutoAnalysis ? 'bg-[#32a041] text-white border-[#32a041]' : 'bg-[#32a041]/10 hover:bg-[#32a041]/20 text-[#32a041] border-[#32a041]/20'}`}>
                            <Sparkles size={11} strokeWidth={2.5} />Análise Automática
                          </button>
                        </div>

                        {showAutoAnalysis && (
                          <div className="bg-emerald-50/50 border-2 border-[#32a041]/30 rounded-2xl p-4 space-y-4 animate-in slide-in-from-top-4 duration-200">
                            <div className="flex items-center gap-2"><Sparkles size={14} className="text-[#32a041]" /><h4 className="text-[10.5px] font-black uppercase text-[#32a041] tracking-wider">Sugestões da Análise Automática</h4></div>
                            {autoSuggestions.length > 0 ? (
                              <div className="space-y-3">
                                {autoSuggestions.map((sug, sIdx) => (
                                  <div key={sIdx} className="bg-white border border-zinc-150 rounded-xl p-3 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <div className="space-y-1.5 flex-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">↗ Reorganizar</span>
                                        <h5 className="text-[10px] font-extrabold text-zinc-800 uppercase">{sug.title}</h5>
                                      </div>
                                      <p className="text-[10px] text-zinc-650 font-medium leading-normal">{sug.description}</p>
                                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 pt-1 border-t border-dashed border-zinc-100">
                                        {sug.benefits.map((ben, bIdx) => <span key={bIdx} className="text-[8.5px] text-zinc-450 font-bold flex items-center gap-1">✨ {ben}</span>)}
                                      </div>
                                    </div>
                                    <button type="button" onClick={sug.onApply} className="h-8 px-3.5 bg-[#32a041] hover:bg-emerald-600 text-white text-[9.5px] font-black uppercase tracking-wider rounded-lg shadow-3xs transition-all cursor-pointer border-none flex items-center gap-1 shrink-0 self-end md:self-center">
                                      <Check size={11} strokeWidth={3} />{sug.actionText}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4 bg-white/50 border border-dashed border-zinc-200 rounded-xl space-y-1">
                                <HelpCircle className="mx-auto text-zinc-400" size={18} />
                                <p className="text-[10.5px] text-zinc-550 font-bold uppercase tracking-wide">Nenhuma sugestão compatível encontrada.</p>
                              </div>
                            )}
                          </div>
                        )}

                        {matches.map((allocation, idx) => {
                          const prefs = getPrefsByName(allocation.teacherName);
                          const turn = slotId.startsWith('m') ? 'Manhã' : slotId.startsWith('t') ? 'Tarde' : 'Noite';
                          const isTurnViolated = !prefs.preferredTurns.includes(turn);
                          const isDayViolated = prefs.unavailableDays.includes(day);
                          const isSubjectViolated = prefs.preferredSubjects.length > 0 && !prefs.preferredSubjects.some(s => s.toLowerCase() === allocation.subjectName.toLowerCase());
                          const hasViolations = isTurnViolated || isDayViolated || isSubjectViolated;
                          const isExpanded = !!expandedConflictAgendas[allocation.id];

                          const DAYS_LIST = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
                          const sortedSlots = DAYS_LIST.flatMap(dName =>
                            TIME_SLOTS.filter(s => !s.isBreak).map(slot => {
                              const isPreferredDay = prefs.preferredDays.includes(dName);
                              const isUnavailableDay = prefs.unavailableDays.includes(dName);
                              const slotTurn = slot.id.startsWith('m') ? 'Manhã' : slot.id.startsWith('t') ? 'Tarde' : 'Noite';
                              const isPreferredTurn = prefs.preferredTurns.includes(slotTurn);
                              if (isUnavailableDay) return null;
                              const slotOccupied = preAllocations.some(pa => pa.semester === selectedMatrixSemester && pa.dayOfWeek === dName && pa.timeSlotId === slot.id);
                              const score: 'excellent' | 'partial' | 'neutral' = (isPreferredDay && isPreferredTurn) ? 'excellent' : (isPreferredDay || isPreferredTurn) ? 'partial' : 'neutral';
                              return { day: dName, slotId: slot.id, score, occupied: slotOccupied, label: `${dName} às ${slot.label.split(' ')[0]} (${score === 'excellent' ? '⭐ Excelente' : score === 'partial' ? '✓ Parcial' : 'Neutro'} — ${slotOccupied ? '⚠️ Ocupado' : '✅ Livre'})` };
                            })
                          ).filter(Boolean).sort((a, b) => {
                            const scoreMap = { excellent: 3, partial: 2, neutral: 1 };
                            if (scoreMap[a!.score] !== scoreMap[b!.score]) return scoreMap[b!.score] - scoreMap[a!.score];
                            if (a!.occupied && !b!.occupied) return 1;
                            if (!a!.occupied && b!.occupied) return -1;
                            return 0;
                          }) as { day: string; slotId: string; score: string; occupied: boolean; label: string }[];

                          let bestSlot: { day: string; slotId: string; label: string } | null = null;
                          for (const s of sortedSlots) {
                            if (s.score === 'excellent' && !s.occupied) { bestSlot = { day: s.day, slotId: s.slotId, label: `${s.day} (${TIME_SLOTS.find(ts => ts.id === s.slotId)?.label.split(' ')[0]})` }; break; }
                          }
                          if (!bestSlot) for (const s of sortedSlots) {
                            if (s.score === 'partial' && !s.occupied) { bestSlot = { day: s.day, slotId: s.slotId, label: `${s.day} (${TIME_SLOTS.find(ts => ts.id === s.slotId)?.label.split(' ')[0]})` }; break; }
                          }

                          const applyMove = (targetDay: string, targetSlotId: string) => {
                            setPreAllocations(prev => prev.map(pa => pa.id === allocation.id ? { ...pa, dayOfWeek: targetDay, timeSlotId: targetSlotId } : pa));
                            setConflictResolutionSlot(prev => {
                              if (!prev) return null;
                              const stillInSlot = prev.matches.filter(pa => pa.id !== allocation.id);
                              return stillInSlot.length <= 0 ? null : { ...prev, matches: stillInSlot };
                            });
                            showToast(`Alocação de ${allocation.subjectName} transferida para ${targetDay}!`, "success");
                          };

                          return (
                            <div key={allocation.id} onClick={() => setActiveConflictTeacherName(allocation.teacherName)} className={`p-4 rounded-xl border transition-all cursor-pointer ${activeConflictTeacherName === allocation.teacherName ? 'border-[#32a041] bg-[#32a041]/5 shadow-md scale-[1.01]' : 'border-zinc-200 bg-white hover:bg-zinc-50/50 hover:border-zinc-300'}`}>
                              <div className="flex items-center justify-between mb-3" onClick={(e) => e.stopPropagation()}>
                                <span className="text-[9px] font-black uppercase text-[#32a041] bg-[#32a041]/10 px-2 py-0.5 rounded-md border border-[#32a041]/20">Lado {idx === 0 ? 'A' : 'B'} — Alocação #{idx + 1}</span>
                                <button type="button" onClick={() => { setPreAllocations(prev => prev.filter(pa => pa.id !== allocation.id)); setConflictResolutionSlot(prev => { if (!prev) return null; const filtered = prev.matches.filter(pa => pa.id !== allocation.id); return filtered.length === 0 ? null : { ...prev, matches: filtered }; }); showToast(`Alocação de ${allocation.subjectName} desfeita!`, "success"); }} className="text-[9.5px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2 py-1 rounded-lg border border-rose-150 cursor-pointer flex items-center gap-1 transition-colors">
                                  <Trash2 size={11} />Desalocar
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3" onClick={(e) => e.stopPropagation()}>
                                <div>
                                  <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 pl-1">Componente Curricular</label>
                                  <select value={allocation.subjectName} onChange={(e) => { const v = e.target.value; setPreAllocations(prev => prev.map(pa => pa.id === allocation.id ? { ...pa, subjectName: v } : pa)); setConflictResolutionSlot(prev => prev ? { ...prev, matches: prev.matches.map(pa => pa.id === allocation.id ? { ...pa, subjectName: v } : pa) } : null); showToast("Componente atualizado.", "info"); }} className="w-full h-8 bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-[10.5px] font-bold uppercase outline-none cursor-pointer">
                                    {offeredSubjects.map(sub => <option key={sub.id} value={sub.name}>{sub.name}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 pl-1">Docente Responsável</label>
                                  <select value={allocation.teacherName} onChange={(e) => { const v = e.target.value; setPreAllocations(prev => prev.map(pa => pa.id === allocation.id ? { ...pa, teacherName: v } : pa)); setConflictResolutionSlot(prev => prev ? { ...prev, matches: prev.matches.map(pa => pa.id === allocation.id ? { ...pa, teacherName: v } : pa) } : null); setActiveConflictTeacherName(v); showToast(`Professor trocado para ${v}.`, "success"); }} className="w-full h-8 bg-zinc-50 border border-zinc-200 rounded-lg px-2 text-[10.5px] font-bold uppercase outline-none cursor-pointer">
                                    {activeTeachers.map(teach => <option key={teach.id} value={teach.name}>{teach.name}</option>)}
                                  </select>
                                </div>
                              </div>

                              {hasViolations ? (
                                <div className="bg-rose-50/80 border border-rose-100 rounded-lg p-2.5 space-y-1">
                                  <span className="text-[8.5px] font-black uppercase text-rose-700 block">Divergências da Ficha de Preferência:</span>
                                  {isDayViolated && <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1 leading-none">🚫 • Docente indisponível às {day}s-feiras.</p>}
                                  {isTurnViolated && <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1 leading-none">⏰ • Docente não prefere o turno da {turn}.</p>}
                                  {isSubjectViolated && <p className="text-[10px] text-amber-700 font-bold flex items-center gap-1 leading-none">📚 • "{allocation.subjectName}" não faz parte das preferências do docente.</p>}
                                </div>
                              ) : (
                                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 flex items-center gap-2">
                                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                                  <span className="text-[9px] font-black uppercase text-emerald-800 leading-none">Alocação Saudável: Sem conflitos para este docente!</span>
                                </div>
                              )}

                              <div className="mt-4 pt-3.5 border-t border-zinc-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                                <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                                  <button type="button" onClick={() => setExpandedConflictAgendas(prev => ({ ...prev, [allocation.id]: !prev[allocation.id] }))} className={`flex-1 h-9 px-3 border rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${isExpanded ? 'bg-[#32a041] text-white border-[#32a041]' : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-650 border-zinc-200'}`}>
                                    <span>Analisar Agenda do Docente</span>
                                    {isExpanded ? <ChevronUp size={13} strokeWidth={2.5} /> : <ChevronDown size={13} strokeWidth={2.5} />}
                                  </button>
                                  {bestSlot && (
                                    <button type="button" onClick={() => applyMove(bestSlot!.day, bestSlot!.slotId)} className="h-9 px-3 bg-[#32a041]/15 hover:bg-[#32a041]/25 text-[#32a041] text-[10px] font-black uppercase tracking-wider rounded-xl border border-[#32a041]/30 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0">
                                      <Zap size={11} className="fill-[#32a041] text-[#32a041]" />
                                      <span>Troca Rápida ({bestSlot.label.split(' (')[0]})</span>
                                    </button>
                                  )}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest pl-1">Ou escolha outra transferência recomendada:</label>
                                  <select value="" onChange={(e) => { if (!e.target.value) return; const [td, ts] = e.target.value.split('|'); applyMove(td, ts); }} className="w-full h-8 bg-zinc-50 border border-zinc-200 text-zinc-700 text-[10px] font-bold uppercase rounded-lg px-2 outline-none cursor-pointer">
                                    <option value="">-- SELECIONE UM HORÁRIO RECOMENDADO --</option>
                                    {sortedSlots.slice(0, 15).map((s, sIdx) => <option key={sIdx} value={`${s.day}|${s.slotId}`}>{s.label}</option>)}
                                  </select>
                                </div>
                              </div>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden mt-4 pt-4 border-t border-dashed border-zinc-200 space-y-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
                                      <span className="text-[8.5px] font-black text-zinc-400 uppercase tracking-widest block leading-none">Visualização Auxiliar de Agenda — {allocation.teacherName}</span>
                                      <div className="overflow-x-auto border border-zinc-200 rounded-lg bg-white p-1.5">
                                        <table className="w-full text-center border-collapse">
                                          <thead>
                                            <tr className="border-b border-zinc-150">
                                              <th className="py-1 text-[7.5px] font-black text-zinc-400 uppercase tracking-wider w-16 text-left pl-1">Turno</th>
                                              {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <th key={d} className="py-1 text-[7.5px] font-black text-zinc-500 uppercase tracking-wider">{d}</th>)}
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {['Manhã', 'Tarde', 'Noite'].map(turnLabel => (
                                              <tr key={turnLabel} className="border-b border-zinc-100 last:border-0">
                                                <td className="py-1 text-[8px] font-black text-zinc-500 uppercase tracking-wider text-left pl-1">{turnLabel}</td>
                                                {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(dName => {
                                                  const isPreferredDay = prefs.preferredDays.includes(dName);
                                                  const isUnavailableDay = prefs.unavailableDays.includes(dName);
                                                  const isPreferredTurn = prefs.preferredTurns.includes(turnLabel);
                                                  let cellBg = "bg-white text-zinc-350";
                                                  let cellText = "✓";
                                                  if (isUnavailableDay) { cellBg = "bg-rose-50 text-rose-700 border border-rose-100"; cellText = "🚫"; }
                                                  else if (isPreferredDay && isPreferredTurn) { cellBg = "bg-emerald-50 text-emerald-800 border border-emerald-150 font-black"; cellText = "⭐️"; }
                                                  else if (isPreferredDay || isPreferredTurn) { cellBg = "bg-amber-50 text-amber-700 border border-amber-100"; cellText = "✓"; }
                                                  return <td key={dName} className="p-0.5"><div title={`${turnLabel} — ${dName}`} className={`py-1 rounded text-[7.5px] font-bold text-center uppercase select-none ${cellBg}`}>{cellText}</div></td>;
                                                })}
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                    {prefs.preferredSubjects.length > 0 && (
                                      <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-2">
                                        <span className="text-[8.5px] font-black text-zinc-400 uppercase tracking-widest block leading-none">Disciplinas de Preferência do Docente</span>
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                          {prefs.preferredSubjects.map((sub, sIdx) => <span key={sIdx} className="text-[8.5px] font-bold uppercase text-zinc-700 bg-white border border-zinc-200 px-2 py-0.5 rounded-md shadow-3xs flex items-center gap-1"><span>📚</span> {sub}</span>)}
                                        </div>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-3">
                      <button type="button" onClick={() => setConflictResolutionSlot(null)} className="flex-1 h-11 text-xs font-black uppercase tracking-wider border border-zinc-200 hover:bg-zinc-100 text-zinc-550 rounded-xl transition-all cursor-pointer">Fechar Painel</button>
                      <button type="button" onClick={() => { setConflictResolutionSlot(null); showToast("Atualizações de grade consolidadas com sucesso!", "success"); }} className="flex-1 h-11 text-xs font-black uppercase tracking-wider bg-[#32a041] hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-all cursor-pointer border-none">Salvar e Concluir</button>
                    </div>
                  </div>
                </div>
              );
            })()}

          </motion.div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PLANEJAMENTO DA ALOCAÇÃO                         */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <motion.div key="planning-step" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="space-y-6">

            {/* Quick Context panel */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-5 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 pl-1">Curso</label>
                <div className="relative">
                  <select value={selectedCourseId} onChange={(e) => { setSelectedCourseId(e.target.value); setSelectedSlots([]); }} className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl pl-3 pr-8 text-xs font-bold uppercase tracking-widest outline-none focus:bg-white text-zinc-750 appearance-none cursor-pointer transition-all">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 pl-1">Calendário Letivo</label>
                <div className="relative">
                  <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl pl-3 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:bg-white text-zinc-750 appearance-none cursor-pointer transition-all">
                    {courseSemesters.map(s => <option key={s.id} value={s.identification}>{s.identification} {s.status === 'Ativo' ? '(Ativo)' : ''}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 pl-1">Semestre da Matriz Curricular</label>
                <div className="relative">
                  <select value={selectedMatrixSemester} onChange={(e) => { setSelectedMatrixSemester(Number(e.target.value)); setSelectedSlots([]); }} className="w-full h-10 bg-zinc-50 border border-zinc-200 hover:border-[#32a041]/30 rounded-xl pl-3 pr-8 text-xs font-black uppercase tracking-widest outline-none focus:bg-white text-zinc-750 appearance-none cursor-pointer transition-all">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(pNum => <option key={pNum} value={pNum}>{pNum}º Semestre</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              </div>
              <div className="bg-zinc-50 border border-zinc-150 rounded-xl p-3 h-10 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-450 uppercase">Vínculos Realizados</span>
                <span className="text-xs font-black text-zinc-855 bg-white border border-zinc-200 px-3 py-1 rounded-lg">
                  {allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester && a.period === selectedMatrixSemester).length / 2} disciplinas
                </span>
              </div>
            </div>

            {/* Main 2-col layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left form */}
              <div className="lg:col-span-8 bg-white border border-zinc-150 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Subject selector */}
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
                      <div className="w-10 h-10 bg-amber-100 text-amber-700 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-sm animate-pulse font-black">⚠️</div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-black uppercase text-amber-800">Sem Matérias</h4>
                        <p className="text-xs font-semibold text-amber-700">Nenhuma disciplina ativa foi encontrada para este curso e semestre.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <button type="button" onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)} className="w-full min-h-12 bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-4 py-2.5 text-xs text-left font-bold outline-none flex items-center justify-between transition-all cursor-pointer shadow-xs focus:ring-2 focus:ring-[#32a041]/10 focus:border-[#32a041]/50">
                        {selectedSubject ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-zinc-850 text-sm uppercase">{selectedSubject.name}</span>
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${selectedSubject.type === 'Obrigatória' ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' : 'bg-amber-50 border border-amber-100 text-amber-700'}`}>{selectedSubject.type}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-semibold mt-1">{selectedSubject.code || selectedSubject.id.toUpperCase()} • {selectedSubject.workload}h • {selectedSubject.period}º Semestre</div>
                          </div>
                        ) : (
                          <span className="text-zinc-500 font-semibold">-- Escolha a Disciplina ({offeredSubjects.length} disponíveis) --</span>
                        )}
                        <div className="text-zinc-400"><svg className={`w-4 h-4 transition-transform duration-200 ${isSubjectDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m19 9-7 7-7-7" /></svg></div>
                      </button>

                      {isSubjectDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-xl z-30 flex flex-col overflow-hidden max-h-[350px] animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="p-3 bg-zinc-50 border-b border-zinc-150 flex items-center gap-2">
                            <svg className="w-4 h-4 text-zinc-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg>
                            <input type="text" placeholder="Pesquisar por nome ou código da disciplina..." value={subjectSearchQuery} onChange={(e) => setSubjectSearchQuery(e.target.value)} className="w-full bg-transparent border-none text-xs font-semibold text-zinc-700 placeholder-zinc-400 outline-none" autoFocus />
                            {subjectSearchQuery && <button type="button" onClick={() => setSubjectSearchQuery('')} className="text-zinc-400 hover:text-zinc-650 font-bold text-xs px-1">×</button>}
                          </div>
                          <div className="overflow-y-auto p-2 divide-y divide-zinc-100 max-h-[280px]">
                            {(() => {
                              const searchFiltered = offeredSubjects.filter(sub => { const q = subjectSearchQuery.toLowerCase().trim(); if (!q) return true; return sub.name.toLowerCase().includes(q) || (sub.code && sub.code.toLowerCase().includes(q)); });
                              if (searchFiltered.length === 0) return <div className="p-6 text-center text-zinc-400 text-xs font-semibold uppercase italic">Nenhuma disciplina corresponde à pesquisa.</div>;
                              const semestersGroup: Record<number, Subject[]> = {};
                              searchFiltered.forEach(sub => { if (!semestersGroup[sub.period]) semestersGroup[sub.period] = []; semestersGroup[sub.period].push(sub); });
                              return Object.keys(semestersGroup).sort().map(semesterStr => {
                                const semNum = Number(semesterStr);
                                const list = semestersGroup[semNum];
                                return (
                                  <div key={semNum} className="py-2.5 first:pt-1">
                                    <div className="px-3 py-1 bg-zinc-50 rounded-lg text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1.5 flex items-center justify-between"><span>{semNum}º Semestre Matriz</span><span>{list.length} {list.length === 1 ? 'Matéria' : 'Matérias'}</span></div>
                                    <div className="space-y-1">
                                      {list.map(sub => {
                                        const isSelected = allocatedSubjectId === sub.id;
                                        return (
                                          <button key={sub.id} type="button" onClick={() => { setAllocatedSubjectId(sub.id); setIsSubjectDropdownOpen(false); setSubjectSearchQuery(''); }} className={`w-full px-3 py-2 border text-left transition-all flex items-center justify-between cursor-pointer rounded-xl ${isSelected ? 'bg-[#32a041]/10 border-[#32a041] shadow-inner text-zinc-900' : 'bg-white border-transparent hover:bg-zinc-50'}`}>
                                            <div className="flex-1 min-w-0 pr-3">
                                              <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-extrabold text-zinc-800 text-xs uppercase truncate leading-tight">{sub.name}</span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded leading-none shrink-0 ${sub.type === 'Obrigatória' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>{sub.type}</span>
                                              </div>
                                              <div className="text-[10px] text-zinc-500 font-semibold mt-0.5 flex items-center gap-1.5 flex-wrap">
                                                <span className="font-mono">Código: {sub.code || sub.id.toUpperCase()}</span>
                                                <span className="text-zinc-300">•</span><span>{sub.workload}h</span>
                                                <span className="text-zinc-300">•</span><span>{sub.period}º Semestre</span>
                                              </div>
                                            </div>
                                            {isSelected && <div className="w-5 h-5 bg-[#32a041] text-white rounded-full flex items-center justify-center shrink-0"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg></div>}
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

                  {selectedSubject && (
                    <div className="mt-3 bg-[#e8f5e9]/20 border border-emerald-150 p-4 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-200 font-bold">
                      <div>
                        <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded leading-none">{selectedSubject.type}</span>
                        <h4 className="text-sm font-black text-zinc-800 leading-tight mt-1">{selectedSubject.name}</h4>
                        <p className="text-[10px] text-zinc-450 font-bold uppercase mt-1 leading-none">Matriz {selectedSubject.period}º Semestre</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black text-[#277c32] block leading-none">{selectedSubject.workload}h</span>
                        <span className="text-[9px] font-bold text-zinc-400 block mt-0.5">Exige {requiredSlotsCount} aulas p/ semana</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Teacher selector */}
                <div>
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider mb-1">Passo 2 – Escolher Docente Responsável</h3>
                  <p className="text-[11px] text-zinc-400 font-semibold mb-3">Somente docentes ativos e homologados na plataforma constam nesta listagem.</p>
                  <select value={allocatedTeacherId} onChange={(e) => setAllocatedTeacherId(e.target.value)} className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#32a041]/50 focus:bg-white text-zinc-850 appearance-none shadow-xs">
                    <option value="">-- Escolha o Professor ({activeTeachers.length} disponíveis) --</option>
                    {activeTeachers.map(teach => {
                      const maxH = getTeacherTimeLimit(teach);
                      const weeklyHours = allocations.filter(a => a.teacherId === teach.id && a.semester === selectedSemester).length * 2;
                      return <option key={teach.id} value={teach.id}>{teach.name} ({weeklyHours}h / max {maxH}h)</option>;
                    })}
                  </select>

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
                          <div className={`h-full rounded-full transition-all duration-300 ${valPercent > 90 ? 'bg-rose-500' : 'bg-[#32a041]'}`} style={{ width: `${valPercent}%` }} />
                        </div>
                        <div className="flex flex-wrap justify-between gap-2 text-[10px] leading-none pt-1">
                          <span className="font-bold text-zinc-450">Disponível: <strong className="text-zinc-700 font-extrabold">{maxH - weeklyHours}h semanais</strong></span>
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

                {/* Room / Block */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black text-zinc-450 uppercase tracking-widest mb-1.5 pl-1">Sala de Aulas (Opcional)</label>
                    <input type="text" placeholder="Ex: Sala 12" value={allocatedRoom} onChange={(e) => setAllocatedRoom(e.target.value)} className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#32a041]/55 focus:bg-white text-zinc-800 shadow-inner placeholder:text-zinc-300" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-zinc-450 uppercase tracking-widest mb-1.5 pl-1">Bloco Acadêmico (Opcional)</label>
                    <input type="text" placeholder="Ex: Bloco B" value={allocatedBlock} onChange={(e) => setAllocatedBlock(e.target.value)} className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#32a041]/55 focus:bg-white text-zinc-800 shadow-inner placeholder:text-zinc-300" />
                  </div>
                </div>

                {selectedTeacher && selectedTeacher.leaveType !== LeaveType.Nenhum && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
                    <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-amber-800 uppercase leading-normal">Alerta de Afastamento:</p>
                      <p className="text-[10px] font-semibold text-zinc-600 mt-0.5">O docente {selectedTeacher.name} possui uma pendência/afastamento oficial cadastrada no sistema ({selectedTeacher.leaveType}).</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Summary */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-zinc-900 text-white rounded-2xl border border-zinc-800 p-6 shadow-xl space-y-5">
                  <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
                    <div><h3 className="text-xs font-black uppercase tracking-widest text-[#32a041]">Plano de Alocação</h3><p className="text-[9px] text-zinc-400">Resumo consolidado do vínculo planejado</p></div>
                    <Layers size={16} className="text-zinc-400 stroke-[1.5]" />
                  </div>
                  {selectedSubject && selectedTeacher ? (
                    <div className="space-y-4">
                      <div className="space-y-1"><span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Docente de Destino</span><h4 className="text-sm font-bold text-white uppercase">{selectedTeacher.name}</h4><span className="text-[9px] text-[#32a041] uppercase tracking-wider font-extrabold">{selectedTeacher.regime}</span></div>
                      <div className="space-y-1"><span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Matéria vinculada</span><h4 className="text-sm font-bold text-white uppercase">{selectedSubject.name}</h4><span className="text-[9px] text-emerald-400 font-extrabold">{selectedSubject.workload}h semanais • {requiredSlotsCount} horários</span></div>
                      {allocatedRoom && <div className="space-y-1"><span className="text-[8px] font-black uppercase text-zinc-400 tracking-wider">Localidade Reservada</span><p className="text-xs text-white font-bold uppercase">Sala {allocatedRoom} {allocatedBlock ? `— ${allocatedBlock}` : ''}</p></div>}
                      <div className="pt-3 border-t border-zinc-800 bg-[#32a041]/10 p-3 rounded-lg border border-emerald-500/20 text-[11px] text-zinc-300 leading-normal font-semibold">Para definir os dias e horários das aulas, clique no botão abaixo para ir à montagem de grade.</div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-zinc-550 space-y-2">
                      <div className="w-12 h-12 rounded-full border border-zinc-800 bg-zinc-850 flex items-center justify-center mx-auto text-zinc-500 font-black">?</div>
                      <p className="text-[10px] font-black uppercase tracking-wider">Passos incompletos</p>
                      <p className="text-[10px] text-zinc-400 max-w-xs mx-auto leading-normal">Selecione uma disciplina e um docente para liberar a montagem de grade.</p>
                    </div>
                  )}
                  <button type="button" onClick={() => { setCurrentStep(3); showToast(`Iniciando montador de grade para ${selectedSubject?.name}.`, "info"); }} disabled={!allocatedSubjectId || !allocatedTeacherId} className="w-full h-11 text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:bg-zinc-800 disabled:text-zinc-650 disabled:border-zinc-800 disabled:cursor-not-allowed bg-emerald-600 text-white hover:bg-[#32a041] border border-emerald-500 shadow-md">
                    <span>Montar Grade de Aulas</span><ChevronRight size={14} strokeWidth={3} />
                  </button>
                </div>

                {/* Allocation list */}
                <div className="bg-white border border-zinc-150 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="border-b border-zinc-100 pb-2 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-zinc-450 tracking-wider">Histórico de Alocações</span>
                    <span className="text-[9px] font-black text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-lg">{allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).length} Total</span>
                  </div>
                  <div className="divide-y divide-zinc-100 max-h-[220px] overflow-y-auto pr-1">
                    {allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).length === 0 ? (
                      <p className="text-center py-8 text-[10px] text-zinc-400 font-semibold uppercase italic">Nenhuma alocação ativa registrada.</p>
                    ) : (
                      allocations.filter(a => a.courseId === selectedCourseId && a.semester === selectedSemester).map(alloc => {
                        const sub = subjects.find(s => s.id === alloc.subjectId);
                        const teach = teachers.find(t => t.id === alloc.teacherId);
                        return (
                          <div key={alloc.id} className="py-2.5 flex items-center justify-between gap-3 text-left">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[10.5px] font-black text-zinc-800 uppercase leading-none truncate">{sub?.name}</h4>
                              <p className="text-[9px] text-zinc-450 font-bold uppercase mt-0.5 leading-none truncate">{teach?.name.split(' ')[0]} {teach?.name.split(' ').pop()}</p>
                              <span className="text-[8px] font-black text-zinc-400 uppercase mt-1 inline-block bg-zinc-55/40 px-1.5 rounded">{alloc.dayOfWeek} • {TIME_SLOTS.find(ts => ts.id === alloc.timeSlotId)?.label.split(' ')[0]}</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveAllocation(alloc.id)} className="w-8 h-8 rounded-lg bg-zinc-50 hover:bg-rose-50 border border-zinc-200 hover:border-rose-100 hover:text-rose-600 flex items-center justify-center cursor-pointer transition-colors"><Trash2 size={11} /></button>
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
        {/* STEP 3: MONTAGEM DA GRADE                                */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <motion.div key="grid-step" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="space-y-5">

            {/* Header row */}
            <div className="bg-white rounded-2xl border border-zinc-150 p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button type="button" onClick={() => { setCurrentStep(2); setSelectedSlots([]); }} className="h-9 px-3 border border-zinc-200 rounded-xl hover:bg-zinc-50 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer text-zinc-550 transition-colors shrink-0">
                  <ArrowLeft size={12} strokeWidth={2.5} />Planejar Vínculo
                </button>
                <div className="space-y-0.5 min-w-0">
                  <p className="text-[10px] font-black text-[#32a041] uppercase tracking-wider leading-none">Vinculando ao Semestre Matriz: {selectedMatrixSemester}ºS</p>
                  <h3 className="text-sm font-bold text-zinc-900 leading-tight uppercase truncate">{selectedSubject?.name} • <span className="text-zinc-500 font-extrabold">{selectedTeacher?.name}</span></h3>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-4 py-2 bg-zinc-100 rounded-xl border border-zinc-200 text-center shrink-0">
                  <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Aulas Exigidas</span>
                  <p className="text-xs font-black text-zinc-700 leading-none mt-1 uppercase">{requiredSlotsCount} horários ({selectedSubject?.workload}h)</p>
                </div>
                <div className={`px-4 py-2 rounded-xl border text-center shrink-0 shadow-inner flex flex-col items-center justify-center min-w-[170px] transition-all ${selectedSlots.length === requiredSlotsCount ? 'bg-[#32a041]/10 border-emerald-200 text-emerald-800' : 'bg-[#fffbec] border-amber-200 text-amber-800'}`}>
                  <span className="block text-[8px] font-black uppercase tracking-widest leading-none opacity-85">Status da Seleção</span>
                  <p className="text-xs font-black leading-none mt-1 uppercase">{selectedSlots.length === requiredSlotsCount ? <span>Pronto para Gravar ✓</span> : <span>Selecionados: {selectedSlots.length} de {requiredSlotsCount}</span>}</p>
                </div>
                <button type="button" onClick={() => setIsDrawerOpen(true)} className="h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-[#32a041] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shrink-0 transition-colors shadow-md relative cursor-pointer">
                  <span>📋 Agenda & Regras</span>
                  {conflictsAndWarnings.errorList.length > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 rounded-full bg-rose-600 text-white font-sans font-black flex items-center justify-center text-[9px] px-1 shadow-lg animate-bounce border-2 border-white">{conflictsAndWarnings.errorList.length}</span>}
                </button>
              </div>
            </div>

            {/* Turn filter */}
            <div className="flex justify-between items-center bg-white border border-zinc-150 rounded-2xl p-4 gap-4 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#32a041] animate-pulse"></span>
                <p className="text-[10px] font-black uppercase text-zinc-550 tracking-wider">Isolando Turno na Grade: <span className="text-[#32a041]">{selectedTurn}</span></p>
              </div>
              <div className="flex bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 shrink-0 gap-0.5 select-none text-[9px] font-black">
                {['Manhã', 'Tarde', 'Noite'].map((t) => (
                  <button key={t} type="button" onClick={() => setSelectedTurn(t as any)} className={`px-4 h-9 rounded-lg uppercase tracking-widest transition-all outline-none cursor-pointer ${selectedTurn === t ? 'bg-[#32a041] text-white shadow-sm font-black' : 'text-zinc-500 hover:text-zinc-700 font-bold'}`}>{t}</button>
                ))}
              </div>
            </div>

            {/* Timetable */}
            <div className="overflow-x-auto border border-zinc-200 rounded-2xl shadow-sm bg-white">
              <table className="w-full min-w-[750px] border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/50">
                    <th className="py-3 px-4 text-left text-[9px] font-black uppercase tracking-wider text-zinc-400 w-32">Horário</th>
                    {DAYS_ORDER.map(day => <th key={day} className="py-3 px-2 text-center text-[9px] font-black uppercase tracking-wider text-[#58595b] w-40">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filteredSlots.map((slot) => {
                    if (slot.isBreak) {
                      return (
                        <tr key={slot.id} className="border-b border-zinc-150/70 bg-zinc-50/40">
                          <td className="py-2 px-4 text-[8px] font-black text-center text-zinc-400 uppercase tracking-widest w-30">{slot.period}</td>
                          <td colSpan={DAYS_ORDER.length} className="py-2 px-2 text-center text-[9px] font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50/5">{slot.label} — {slot.period}</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={slot.id} className="border-b border-zinc-100 hover:bg-zinc-50/5 transition-colors">
                        <td className="py-3 px-4 border-r border-zinc-150 text-left bg-zinc-50/20 w-30">
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block leading-none">{slot.period}</span>
                          <span className="text-[11px] font-black text-zinc-700 leading-none mt-1 block font-mono">{slot.label}</span>
                        </td>
                        {DAYS_ORDER.map((day) => {
                          const matrixOccupied = allocations.find(a => a.courseId === selectedCourseId && a.period === selectedMatrixSemester && a.dayOfWeek === day && a.timeSlotId === slot.id && a.semester === selectedSemester);
                          const matrixSubName = matrixOccupied ? subjects.find(s => s.id === matrixOccupied.subjectId)?.name : null;
                          const teacherOccupied = allocations.find(a => a.teacherId === allocatedTeacherId && a.dayOfWeek === day && a.timeSlotId === slot.id && a.semester === selectedSemester);
                          const teacherSubName = teacherOccupied ? subjects.find(s => s.id === teacherOccupied.subjectId)?.name : null;
                          const interjornadaRest = checkInterjornadaConflict(day, slot.id, allocatedTeacherId);
                          const isSelected = selectedSlots.some(s => s.day === day && s.slotId === slot.id);

                          let style = "border-dashed border-zinc-200 hover:border-[#32a041] hover:bg-[#32a041]/5 text-zinc-400 hover:text-[#32a041] cursor-pointer";
                          let label = "Vago";
                          let detail = "Disponível para aula";
                          let actionPossible = true;

                          if (isSelected) { style = "bg-[#32a041] border-[#277c32] text-white cursor-pointer shadow-md"; label = "Selecionado"; detail = `${selectedSubject?.code || 'Marcado'}`; }
                          else if (matrixOccupied) { style = "bg-rose-50 border-rose-200 text-rose-800 opacity-80 cursor-not-allowed"; label = "Indisponível"; detail = matrixSubName ? `Matéria: ${matrixSubName}` : "Choque Matriz"; actionPossible = false; }
                          else if (teacherOccupied) { style = "bg-zinc-100 border-zinc-200 text-zinc-500 opacity-65 cursor-not-allowed"; label = "Docente Ocupado"; detail = teacherSubName ? `Aulas: ${teacherSubName}` : "Agenda Ocupada"; actionPossible = false; }
                          else if (interjornadaRest) { style = "bg-rose-50/50 border-rose-150 text-rose-700 opacity-70 cursor-not-allowed"; label = "Restrição"; detail = "Intervalo Interjornada"; actionPossible = false; }
                          else if (!isSelected && selectedSlots.length >= requiredSlotsCount) { style = "border-dashed border-zinc-150 text-zinc-300 bg-zinc-50/10 cursor-not-allowed opacity-50"; label = "Limite Atingido"; detail = "Seleção Completa"; actionPossible = false; }

                          return (
                            <td key={day} className="p-1 border-r border-zinc-100 text-center align-middle" onClick={() => { if (!actionPossible && !isSelected) return; if (isSelected) setSelectedSlots(prev => prev.filter(s => !(s.day === day && s.slotId === slot.id))); else setSelectedSlots(prev => [...prev, { day, slotId: slot.id }]); }}>
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

            {/* Save bar */}
            <div className="bg-zinc-50 p-4 border border-zinc-200 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="text-left">
                <span className="text-[10px] font-black uppercase text-[#32a041] tracking-wider leading-none">Salvar Grade Horária</span>
                <p className="text-zinc-500 text-[10.5px] font-bold mt-1">
                  {selectedSlots.length === requiredSlotsCount ? <span>Pronto para consolidar seu planejamento na agenda do curso.</span> : <span>Selecione mais {requiredSlotsCount - selectedSlots.length} vaga(s) para habilitar o encerramento.</span>}
                </p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setSelectedSlots([]); setCurrentStep(1); }} className="h-11 px-4 border border-zinc-200 rounded-xl hover:bg-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-500 cursor-pointer">Cancelar</button>
                <button type="button" onClick={handlePerformAllocation} disabled={selectedSlots.length !== requiredSlotsCount} className={`h-11 px-6 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-1.5 ${selectedSlots.length === requiredSlotsCount ? 'bg-[#32a041] text-white hover:bg-[#277c32] cursor-pointer' : 'bg-zinc-100 border border-zinc-200 text-zinc-300 cursor-not-allowed shadow-none'}`}>
                  Confirmar e Finalizar Alocação ✓
                </button>
              </div>
            </div>

            {/* Side Drawer */}
            <AnimatePresence>
              {isDrawerOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden font-sans">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="absolute inset-0 bg-black backdrop-blur-xs cursor-pointer" />
                  <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 220 }} className="absolute inset-y-0 right-0 w-full max-w-md bg-white border-l border-zinc-200 shadow-2xl p-6 flex flex-col justify-between">
                    <div className="space-y-6 flex-1 overflow-y-auto pr-1">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                        <div className="space-y-0.5">
                          <h3 className="text-sm font-black text-zinc-900 uppercase">Agenda & Diagnósticos</h3>
                          <p className="text-[10px] text-[#32a041] uppercase font-black">Professor: {selectedTeacher?.name}</p>
                        </div>
                        <button onClick={() => setIsDrawerOpen(false)} className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 cursor-pointer"><X size={18} /></button>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-zinc-450 uppercase tracking-widest pl-1">Vulnerabilidades de Agendamento</h4>
                        {conflictsAndWarnings.errorList.length === 0 && conflictsAndWarnings.warningList.length === 0 ? (
                          <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl flex items-center gap-2.5"><CheckCircle2 size={16} className="text-[#32a041]" /><p className="text-[10.5px] font-bold text-emerald-800">Livre de conflitos de horário e restrições graves!</p></div>
                        ) : (
                          <div className="space-y-2">
                            {conflictsAndWarnings.errorList.map((err, idx) => (
                              <div key={idx} className="p-3 bg-rose-50 border border-rose-150 rounded-xl flex items-start gap-2 text-[10.5px] leading-tight text-rose-800 font-semibold animate-in slide-in-from-right duration-200"><AlertTriangle size={14} className="text-rose-550 mt-0.5 shrink-0" /><span>{err}</span></div>
                            ))}
                            {conflictsAndWarnings.warningList.map((war, idx) => (
                              <div key={idx} className="p-3 bg-amber-50 border border-amber-150 rounded-xl flex items-start gap-2 text-[10.5px] leading-tight text-amber-800 font-semibold animate-in slide-in-from-right duration-250"><Info size={14} className="text-amber-500 mt-0.5 shrink-0" /><span>{war}</span></div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-3 pt-4">
                        <div className="flex justify-between items-center pl-1">
                          <h4 className="text-[10px] font-black text-zinc-450 uppercase tracking-widest">Ocupações de {selectedTeacher?.name.split(' ')[0]}</h4>
                          <span className="text-[9px] font-bold text-zinc-500">{teacherCurrentAllocations.length * 2}h no semestre</span>
                        </div>
                        {teacherCurrentAllocations.length === 0 ? (
                          <div className="p-4 text-center bg-zinc-50 border border-zinc-150 rounded-xl"><p className="text-[10px] text-zinc-400 font-bold uppercase">Professor limpo no calendário letivo.</p></div>
                        ) : (
                          <div className="space-y-1.5">
                            {teacherCurrentAllocations.map(a => {
                              const sub = subjects.find(s => s.id === a.subjectId);
                              return (
                                <div key={a.id} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between text-xs">
                                  <div><h5 className="font-extrabold text-zinc-800 uppercase leading-none">{sub?.name}</h5><span className="text-[8.5px] text-zinc-400 font-bold uppercase mt-1 inline-block">Semestre do Curso: {a.period}º per</span></div>
                                  <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">{a.dayOfWeek} • {TIME_SLOTS.find(ts => ts.id === a.timeSlotId)?.label.split(' ')[0]}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl space-y-2 pt-3">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Normas Institucionais</span>
                        <ul className="text-[10px] leading-relaxed text-zinc-500 font-medium space-y-1">
                          <li>• <strong>Limite de Jornada:</strong> Máximo de {selectedTeacher ? getTeacherTimeLimit(selectedTeacher) : '20'}h semanais de aula por docente.</li>
                          <li>• <strong>Descanso Interjornada:</strong> Repouso inviolável de 11h entre as grades de dias vizinhos.</li>
                          <li>• <strong>Choque de Matriz:</strong> O mesmo período curricular não pode preencher a mesma vaga semanal com matérias paralelas.</li>
                        </ul>
                      </div>
                    </div>
                    <div className="border-t border-zinc-100 pt-4 mt-4 text-center">
                      <button type="button" onClick={() => setIsDrawerOpen(false)} className="w-full h-11 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[10.5px] font-black uppercase tracking-widest rounded-xl transition-colors cursor-pointer">Fechar Painel</button>
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

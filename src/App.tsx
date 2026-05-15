import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  Building2, 
  Settings, 
  FileText, 
  LogOut, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit2,
  Edit3, 
  Eye, 
  EyeOff,
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  UserPlus,
  BookPlus,
  Calendar,
  Clock,
  Activity,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Level, 
  User, 
  UserRole, 
  WorkRegime, 
  LeaveType, 
  Course, 
  CourseType, 
  Subject,
  ScheduleEntry
} from './types';

// --- Constants & Mock Data ---

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
];

const AREAS_DE_ATUACAO = [
  'Ciências Exatas e da Terra',
  'Ciências Humanas e Sociais',
  'Engenharias e Controle Industrial',
  'Informação e Comunicação',
  'Recursos Naturais e Produção',
  'Gestão, Negócios e Turismo',
  'Educação e Atendimento Especializado',
  'Infraestrutura e Design',
  'Saúde e Ambiente'
];

const PASTEL_COLORS = [
  'bg-rose-100 border-rose-200 text-rose-700',
  'bg-blue-100 border-blue-200 text-blue-700',
  'bg-emerald-100 border-emerald-200 text-emerald-700',
  'bg-amber-100 border-amber-200 text-amber-700',
  'bg-indigo-100 border-indigo-200 text-indigo-700',
  'bg-orange-100 border-orange-200 text-orange-700',
  'bg-purple-100 border-purple-200 text-purple-700',
  'bg-teal-100 border-teal-200 text-teal-700',
];

const INITIAL_TEACHERS: User[] = [];

const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Sistemas de Informação',
    campus: 'Tauá',
    level: Level.Superior,
    type: CourseType.Graduacao,
    durationType: 'Semestral'
  },
  {
    id: 'c2',
    name: 'Redes de Computadores',
    campus: 'Tauá',
    level: Level.Superior,
    type: CourseType.Graduacao,
    durationType: 'Semestral'
  }
];

const INITIAL_SUBJECTS: Subject[] = [];

const INITIAL_SCHEDULES: ScheduleEntry[] = [];

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode, variant?: 'default' | 'success' | 'alert' | 'highlight' }) => {
  const styles = {
    default: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    alert: 'bg-rose-50 text-rose-600 border-rose-100',
    highlight: 'bg-primary/10 text-primary border-primary/20'
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[variant]}`}>
      {children}
    </span>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-primary text-white shadow-sm' 
        : 'text-zinc-600 hover:bg-zinc-50 hover:text-primary'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

// --- Core Logic Helpers ---

const getWorkloadLimit = (role: UserRole): number => {
  if (['Coordenador', 'Diretor', 'Vice-Diretor'].includes(role)) return 10;
  return 20; // Professor
};

// --- View Components ---

const LoginView = ({ onLogin }: { onLogin: (email: string, pass: string) => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; pass?: string }>({});
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; pass?: string } = {};
    if (!email) newErrors.email = 'Campo obrigatório';
    if (!isForgotMode && !pass) newErrors.pass = 'Campo obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      setLoading(true);
      setMessage(null);
      try {
        await onLogin(email, pass);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgot = async () => {
    if (validate()) {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao processar solicitação");
        setMessage({ type: 'success', text: "Link de recuperação enviado!" });
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 font-sans">
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col items-center justify-center space-y-6 relative">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#32a041] rounded-full flex items-center justify-center text-white mb-2">
              <BookOpen size={24} />
            </div>
            <span className="text-xl font-black text-[#58595b] tracking-tight text-center">GESTÃO DE ALOCAÇÃO ACADÊMICA</span>
          </div>

          <h2 className="text-lg font-bold text-zinc-700">{isForgotMode ? 'Recuperar Senha' : 'Login'}</h2>

          {message && (
            <div className={`w-full max-w-sm p-3 rounded-lg text-xs font-bold text-center ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {message.text}
            </div>
          )}

          {!message && (
            <div className="w-full max-w-sm bg-white border border-[#32a041] rounded-xl p-4 text-center">
              <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                Login é <strong>exclusivo</strong> para usuários credenciados
              </p>
            </div>
          )}

          <div className="w-full max-w-sm space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Login:*</label>
              <input 
                type="text" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full h-11 ${errors.email ? 'bg-rose-50 border-rose-300' : 'bg-[#fffbec] border-zinc-200'} border rounded-lg px-4 text-sm outline-none transition-all`}
                placeholder="E-mail ou SIAPE"
              />
              {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email}</p>}
            </div>

            {!isForgotMode && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Senha:*</label>
                <div className="relative">
                  <input 
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    className={`w-full h-11 ${errors.pass ? 'bg-rose-50 border-rose-300' : 'bg-[#fffbec] border-zinc-200'} border rounded-lg px-4 text-sm outline-none transition-all pr-10`}
                    placeholder="Sua senha"
                  />
                  <button 
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.pass && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.pass}</p>}
                <div className="text-right">
                  <button 
                    onClick={() => { setIsForgotMode(true); setMessage(null); }}
                    className="text-[11px] text-[#32a041] font-bold hover:underline"
                  >
                    Esqueci a senha
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full max-w-sm gap-3 items-center">
            <button 
              onClick={isForgotMode ? handleForgot : handleLogin}
              disabled={loading}
              className="w-full max-w-[180px] h-10 bg-[#32a041] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#2b8a38] transition-all shadow-md flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isForgotMode ? 'Enviar' : 'Entrar')}
            </button>
            {isForgotMode && (
              <button 
                onClick={() => { setIsForgotMode(false); setMessage(null); }}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest"
              >
                Voltar ao Login
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Welcome Banner */}
        <div className="hidden md:flex md:w-1/2 bg-[#32a041] p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10 transition-transform duration-500 hover:translate-x-2">
            <p className="text-lg font-medium opacity-90 uppercase tracking-[0.2em] mb-4">Bem-vindo ao</p>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter">
              SISTEMA DE GESTÃO <br />
              ACADÊMICA IFCE TAUÁ
            </h1>
          </div>

          <div className="relative z-10 flex justify-center py-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl"
            >
              <Activity size={80} className="text-white opacity-80" />
            </motion.div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Versão Web: 1.0.0 (c764035)</p>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
};

const DashboardView = ({ 
  user, 
  stats, 
  courses, 
  subjects, 
  teachers,
  schedules,
  onAddSchedule
}: { 
  user: User, 
  stats: any, 
  courses: Course[], 
  subjects: Subject[],
  teachers: User[],
  schedules: ScheduleEntry[],
  onAddSchedule: (s: Omit<ScheduleEntry, 'id'>) => void
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);

  const course = useMemo(() => courses.find(c => c.id === selectedCourseId), [courses, selectedCourseId]);
  const availablePeriods = useMemo(() => {
    if (!course) return [];
    // Just a placeholder for periods, IFCE courses usually have many
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  }, [course]);

  const courseSubjects = useMemo(() => subjects.filter(s => s.courseId === selectedCourseId), [subjects, selectedCourseId]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-2xl font-bold text-zinc-900">
          Gestão Acadêmica
        </h1>
        <p className="text-zinc-500 text-sm">Bem-vindo, {user.name}. Campus Tauá.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Docentes', value: stats.teachers, icon: Users },
          { label: 'Total Cursos', value: stats.courses, icon: BookOpen },
          { label: 'Total Disciplinas', value: stats.subjects, icon: FileText }
        ].map((stat, i) => (
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
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
                      const entryInRange = schedules.find(s => 
                        s.courseId === selectedCourseId && 
                        s.period === selectedPeriod && 
                        s.dayOfWeek === day && 
                        s.timeSlotId === slot.id
                      );
                      const subject = entryInRange ? subjects.find(s => s.id === entryInRange.subjectId) : null;
                      const teacher = entryInRange && entryInRange.teacherId ? teachers.find(t => t.id === entryInRange.teacherId) : null;

                      if (slot.isBreak) {
                        return (
                          <div key={day} className="h-10 bg-zinc-50/50 border border-zinc-100 border-dashed rounded-lg flex items-center justify-center">
                            <span className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest">{slot.period}</span>
                          </div>
                        );
                      }

                      const isAdminUser = user.id === '99';

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
                                      onAddSchedule({
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
            {courses.length > 0 ? courses.map(course => {
              const courseSubjects = subjects.filter(s => s.courseId === course.id);
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

const CoursesView = ({ 
  courses, 
  teachers, 
  subjects, 
  onAddCourse, 
  onAddSubject,
  onUpdateCourse,
  onDeleteSubject,
  onUpdateSubject
}: { 
  courses: Course[], 
  teachers: User[], 
  subjects: Subject[], 
  onAddCourse: (name: string, level: Level, type: CourseType, duration: 'Semestral' | 'Anual') => void,
  onAddSubject: (name: string, workload: number, courseId: string, period: number, type: 'Obrigatória' | 'Opcional') => void,
  onUpdateCourse: (course: Course) => void,
  onDeleteSubject: (id: string) => void,
  onUpdateSubject: (subject: Subject) => void
}) => {
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [addingSubjectTo, setAddingSubjectTo] = useState<string | null>(null);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [confirmingDeleteSubjectId, setConfirmingDeleteSubjectId] = useState<string | null>(null);

  const [newCourse, setNewCourse] = useState({ 
    name: '', 
    level: Level.Superior, 
    type: CourseType.Graduacao, 
    durationType: 'Semestral' as 'Semestral' | 'Anual' 
  });
  
  const [newSubject, setNewSubject] = useState({ 
    name: '', 
    workload: 80, 
    period: 1, 
    type: 'Obrigatória' as 'Obrigatória' | 'Opcional' 
  });

  const filteredCourses = useMemo(() => {
    return courses.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [courses, searchTerm]);

  const getAvailableCoordinators = (currentCoordId?: string) => {
    // Teachers that are not coordinators of ANY other course
    return teachers.filter(t => !courses.some(c => c.coordinatorId === t.id && c.id !== expandedCourse) || t.id === currentCoordId);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Cursos e Disciplinas</h1>
          <p className="text-zinc-500 text-sm font-sans">Gerencie a matriz curricular do campus.</p>
        </div>
        <button 
          onClick={() => setIsAddingCourse(true)}
          className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Novo Curso
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
        <input 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Filtrar cursos..." 
          className="w-full bg-white h-10 pl-10 pr-4 rounded border border-zinc-200 text-sm outline-none focus:border-primary/30"
        />
      </div>

      {isAddingCourse && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 border border-zinc-200 rounded-xl space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Nome</label>
              <input value={newCourse.name} onChange={e => setNewCourse({...newCourse, name: e.target.value})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Tipo</label>
              <select value={newCourse.type} onChange={e => setNewCourse({...newCourse, type: e.target.value as CourseType})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none">
                {Object.values(CourseType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Nível</label>
              <select value={newCourse.level} onChange={e => setNewCourse({...newCourse, level: e.target.value as Level})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none">
                {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Duração</label>
              <select value={newCourse.durationType} onChange={e => setNewCourse({...newCourse, durationType: e.target.value as 'Semestral' | 'Anual'})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none">
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { onAddCourse(newCourse.name, newCourse.level, newCourse.type, newCourse.durationType); setIsAddingCourse(false); }}
              className="bg-primary text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider"
            >
              Confirmar
            </button>
            <button onClick={() => setIsAddingCourse(false)} className="text-zinc-500 text-xs font-bold uppercase tracking-wider px-2 hover:text-zinc-900 transition-colors">Cancelar</button>
          </div>
        </motion.div>
      )}

      <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-100 bg-white shadow-sm overflow-hidden font-sans">
        {filteredCourses.length > 0 ? filteredCourses.map(course => {
          const coordinator = teachers.find(t => t.id === course.coordinatorId);
          return (
            <div key={course.id} className="group">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
                onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-[10px] ${course.level === Level.Superior ? 'bg-primary/10 text-primary' : 'bg-zinc-100 text-zinc-400'}`}>
                    {course.durationType === 'Semestral' ? 'SEM' : 'ANO'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 leading-none">{course.name}</h4>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-tight font-medium">
                      {course.level} • {course.type} {coordinator ? `• Coord: ${coordinator.name}` : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className={`text-zinc-300 transition-transform ${expandedCourse === course.id ? 'rotate-90 text-primary' : ''}`} />
              </div>

              <AnimatePresence>
                {expandedCourse === course.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-zinc-50/30 border-t border-zinc-100">
                    <div className="p-6 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                        <div>
                          <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Coordenação do Curso</h5>
                          <p className="text-sm font-bold text-zinc-900">{coordinator ? coordinator.name : 'Nenhum coordenador definido'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">Trocar:</label>
                          <select 
                            value={course.coordinatorId || ''}
                            onChange={(e) => onUpdateCourse({...course, coordinatorId: e.target.value})}
                            className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-[10px] font-bold text-zinc-700 outline-none"
                          >
                            <option value="">Selecionar Coordenador...</option>
                            {getAvailableCoordinators(course.coordinatorId).map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                          <BookPlus size={14} /> Matriz Curricular
                        </h5>
                        <button onClick={() => setAddingSubjectTo(course.id)} className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline underline-offset-4">
                          <Plus size={12} /> Add Disciplina
                        </button>
                      </div>

                      {addingSubjectTo === course.id && (
                        <div className="p-4 bg-white border border-zinc-200 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-3 items-end shadow-sm animate-in zoom-in-95 duration-200">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Nome</label>
                            <input value={newSubject.name} onChange={e => setNewSubject({...newSubject, name: e.target.value})} className="w-full border border-zinc-200 h-8 px-2 rounded text-xs outline-none focus:border-primary/30" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Carga (h)</label>
                            <input type="number" value={newSubject.workload} onChange={e => setNewSubject({...newSubject, workload: parseInt(e.target.value)})} className="w-full border border-zinc-200 h-8 px-2 rounded text-xs outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Período</label>
                            <input type="number" value={newSubject.period} onChange={e => setNewSubject({...newSubject, period: parseInt(e.target.value)})} className="w-full border border-zinc-200 h-8 px-2 rounded text-xs outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Tipo</label>
                            <select 
                              value={newSubject.type} 
                              onChange={e => setNewSubject({...newSubject, type: e.target.value as 'Obrigatória' | 'Opcional'})} 
                              className="w-full border border-zinc-200 h-8 px-2 rounded text-xs outline-none bg-white font-bold"
                            >
                              <option value="Obrigatória">Obrigatória</option>
                              <option value="Opcional">Opcional</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => { 
                                if (!newSubject.name || !newSubject.workload || !newSubject.period) {
                                  alert("Preencha todos os campos da disciplina.");
                                  return;
                                }
                                onAddSubject(newSubject.name, newSubject.workload, course.id, newSubject.period, newSubject.type); 
                                setAddingSubjectTo(null); 
                                setNewSubject({ name: '', workload: 80, period: 1, type: 'Obrigatória' });
                              }} 
                              className="flex-1 bg-primary text-white h-8 rounded text-[10px] font-bold uppercase tracking-widest"
                            >
                              Salvar
                            </button>
                            <button onClick={() => setAddingSubjectTo(null)} className="flex-1 bg-zinc-100 text-zinc-500 h-8 rounded text-[10px] font-bold uppercase tracking-widest">Sair</button>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subjects.filter(s => s.courseId === course.id).sort((a,b) => a.period - b.period).map(sub => (
                          <div key={sub.id} className="bg-white p-3 border border-zinc-200 rounded-lg flex items-center justify-between group/sub hover:border-primary/20 transition-all">
                            <div>
                              <p className="text-xs font-bold text-zinc-800">{sub.name}</p>
                              <p className="text-[9px] text-zinc-400 mt-0.5 font-sans uppercase font-medium">
                                {sub.period}º Período • {sub.workload}h • <span className={sub.type === 'Obrigatória' ? 'text-zinc-500' : 'text-primary'}>{sub.type}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-all">
                              <button 
                                onClick={() => setEditingSubject(sub)}
                                className="p-1 text-zinc-400 hover:text-primary transition-all rounded hover:bg-zinc-50"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                onClick={() => setConfirmingDeleteSubjectId(sub.id)}
                                className="p-1 text-zinc-400 hover:text-alert transition-all rounded hover:bg-zinc-50"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {subjects.filter(s => s.courseId === course.id).length === 0 && !addingSubjectTo && (
                        <div className="text-center py-8">
                          <p className="text-xs text-zinc-400 italic">Nenhuma disciplina cadastrada.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        }) : (
          <div className="px-6 py-16 text-center">
            <BookOpen className="mx-auto text-zinc-200 mb-4" size={32} />
            <p className="text-sm font-medium text-zinc-400 font-sans italic tracking-tight">A base de cursos está vazia.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingSubject && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <h3 className="text-xl font-bold text-zinc-900">Editar Disciplina</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nome</label>
                  <input 
                    value={editingSubject.name}
                    onChange={e => setEditingSubject({...editingSubject, name: e.target.value})}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Carga (h)</label>
                    <input 
                      type="number"
                      value={editingSubject.workload}
                      onChange={e => setEditingSubject({...editingSubject, workload: parseInt(e.target.value)})}
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Período</label>
                    <input 
                      type="number"
                      value={editingSubject.period}
                      onChange={e => setEditingSubject({...editingSubject, period: parseInt(e.target.value)})}
                      className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tipo</label>
                  <select 
                    value={editingSubject.type} 
                    onChange={e => setEditingSubject({...editingSubject, type: e.target.value as 'Obrigatória' | 'Opcional'})}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none bg-white font-bold"
                  >
                    <option value="Obrigatória">Obrigatória</option>
                    <option value="Opcional">Opcional</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    if (!editingSubject.name || !editingSubject.workload || !editingSubject.period) {
                      alert("Preencha todos os campos.");
                      return;
                    }
                    onUpdateSubject(editingSubject);
                    setEditingSubject(null);
                  }}
                  className="flex-1 h-12 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg"
                >
                  Salvar Alterações
                </button>
                <button 
                  onClick={() => setEditingSubject(null)}
                  className="flex-1 h-12 bg-zinc-100 text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {confirmingDeleteSubjectId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900">Excluir Disciplina?</h3>
                <p className="text-zinc-500 text-sm">Esta ação não pode ser desfeita. Deseja realmente remover esta disciplina?</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    onDeleteSubject(confirmingDeleteSubjectId);
                    setConfirmingDeleteSubjectId(null);
                  }}
                  className="flex-1 h-12 bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg"
                >
                  Excluir
                </button>
                <button 
                  onClick={() => setConfirmingDeleteSubjectId(null)}
                  className="flex-1 h-12 bg-zinc-100 text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all"
                >
                  Manter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeacherProfileView = ({ 
  teacher, 
  onBack, 
  onUpdate,
  currentUserRole,
  currentUserId,
  onLogout
}: { 
  teacher: User, 
  onBack: () => void, 
  onUpdate: (u: User) => void,
  currentUserRole?: UserRole,
  currentUserId?: string,
  onLogout: () => void
}) => {
  const limit = getWorkloadLimit(teacher.role);
  const isAdmin = currentUserRole === 'Admin';
  const isOwnProfile = teacher.id === currentUserId;
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeactivatingAccount, setIsDeactivatingAccount] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    name: teacher.name,
    email: teacher.email,
    birthDate: teacher.birthDate || '',
    phone: teacher.phone || '',
    areaAtuacao: teacher.areaAtuacao || ''
  });
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const hasProfileChanges = useMemo(() => {
    return profileData.name !== teacher.name ||
           profileData.email !== teacher.email ||
           profileData.birthDate !== (teacher.birthDate || '') ||
           profileData.phone !== (teacher.phone || '') ||
           profileData.areaAtuacao !== (teacher.areaAtuacao || '');
  }, [profileData, teacher]);

  const validatePassword = (pass: string) => {
    const requirements = [];
    if (pass.length < 8) requirements.push("Mínimo de 8 caracteres");
    if (!/[A-Z]/.test(pass)) requirements.push("Letras maiúsculas");
    if (!/[a-z]/.test(pass)) requirements.push("Letras minúsculas");
    if (!/\d/.test(pass)) requirements.push("Ao menos um número");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) requirements.push("Ao menos um caractere especial (!@#$)");
    return requirements;
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Todos os campos são obrigatórios");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("A senha digitada e sua confirmação não correspondem.");
      return;
    }

    const requirements = validatePassword(passwordForm.newPassword);
    if (requirements.length > 0) {
      setPasswordError(`A nova senha não atende aos critérios:\n- ${requirements.join('\n- ')}`);
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError("A nova senha não pode ser igual à senha atual.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Senha alterada com sucesso!");
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // After success, maybe close modal after a delay
        setTimeout(() => setIsChangingPassword(false), 2000);
      } else {
        setPasswordError(data.error || "Erro ao alterar senha");
      }
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileMessage(null);
    if (!profileData.name || !profileData.email || !profileData.areaAtuacao) {
      setProfileMessage({ type: 'error', text: "Nome, E-mail e Área de Atuação são obrigatórios" });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      setProfileMessage({ type: 'error', text: "Formato de e-mail institucional inválido" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: 'success', text: "Perfil atualizado com sucesso!" });
        onUpdate(data);
        setTimeout(() => setProfileMessage(null), 4000);
      } else {
        setProfileMessage({ type: 'error', text: data.error || "Erro ao atualizar perfil" });
      }
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivatePassword) {
      setPasswordError("Senha é obrigatória para desativar a conta");
      return;
    }

    setIsSubmitting(true);
    setPasswordError(null);
    try {
      const res = await fetch("/api/deactivate-account", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ password: deactivatePassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Conta desativada com sucesso! Você será desconectado.");
        setTimeout(() => {
          onLogout();
        }, 3000);
      } else {
        setPasswordError(data.error || "Erro ao desativar conta");
      }
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-10 animate-in slide-in-from-right duration-500">
      <header className="flex items-center gap-6">
        <button onClick={onBack} className="p-3 bg-white border border-zinc-100 rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{teacher.name}</h1>
            <Badge variant="highlight">{teacher.role}</Badge>
            <Badge variant={teacher.status === 'Inativo' ? 'alert' : 'success'}>{teacher.status || 'Ativo'}</Badge>
          </div>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">{teacher.registration} • {teacher.campus}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-10">
              {profileMessage && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  {profileMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {profileMessage.text}
                </div>
              )}

              <div className="space-y-8">
                <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} /> Informações do Perfil
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Editable Fields for Own Profile */}
                  {isOwnProfile ? (
                    <>
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pl-1">Nome Completo</label>
                        <input 
                          value={profileData.name}
                          onChange={e => setProfileData({...profileData, name: e.target.value})}
                          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl h-11 px-4 text-sm font-bold text-zinc-800 outline-none focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pl-1">E-mail Institucional</label>
                        <input 
                          value={profileData.email}
                          onChange={e => setProfileData({...profileData, email: e.target.value})}
                          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl h-11 px-4 text-sm font-bold text-zinc-800 outline-none focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pl-1">Data de Nascimento</label>
                        <input 
                          type="date"
                          value={profileData.birthDate}
                          onChange={e => setProfileData({...profileData, birthDate: e.target.value})}
                          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl h-11 px-4 text-sm font-bold text-zinc-800 outline-none focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pl-1">Telefone</label>
                        <input 
                          value={profileData.phone}
                          onChange={e => setProfileData({...profileData, phone: e.target.value})}
                          placeholder="(00) 00000-0000"
                          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl h-11 px-4 text-sm font-bold text-zinc-800 outline-none focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-1.5 px-1 text-zinc-400">
                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pl-1">Área de Atuação</label>
                        <select 
                          value={profileData.areaAtuacao}
                          onChange={e => setProfileData({...profileData, areaAtuacao: e.target.value})}
                          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl h-11 px-4 text-sm font-bold text-zinc-800 outline-none focus:border-primary/30 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Selecione uma área...</option>
                          {AREAS_DE_ATUACAO.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Área de Atuação</p>
                        <p className="text-base font-bold text-zinc-800">{teacher.areaAtuacao || 'Não definida'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Vínculo Institucional</p>
                        <p className="text-base font-bold text-zinc-800">{teacher.regime}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Read-only Institutional Data */}
                <div className="pt-8 border-t border-zinc-50">
                  <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-6">Dados Institucionais (Somente Leitura)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-zinc-300 uppercase">SIAPE</p>
                      <p className="text-sm font-bold text-zinc-500">{teacher.registration}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-zinc-300 uppercase">CPF</p>
                      <p className="text-sm font-bold text-zinc-500">{teacher.cpf || '***.***.***-**'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-zinc-300 uppercase">Ano de Ingresso</p>
                      <p className="text-sm font-bold text-zinc-500">{teacher.ingressoYear || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-zinc-300 uppercase">Login</p>
                      <p className="text-sm font-bold text-zinc-500 text-lowercase">{teacher.login || teacher.email.split('@')[0]}</p>
                    </div>
                  </div>
                </div>

                {isOwnProfile && hasProfileChanges && (
                  <div className="pt-6 flex justify-end">
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={isSubmitting}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                      Salvar Alterações
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Alocações no Semestre</h4>
                  <button className="text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Nova Alocação
                  </button>
                </div>
                <div className="space-y-3">
                  {(teacher.disciplinasMinistradas || []).length === 0 ? (
                    <div className="p-10 border-2 border-dashed border-zinc-50 rounded-xl text-center">
                      <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Sem disciplinas alocadas</p>
                    </div>
                  ) : null}
                </div>
              </div>
           </div>
        </div>

        <aside className="space-y-8">
           <div className="bg-primary p-10 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden">
              <Activity className="absolute -right-4 -bottom-4 text-white/10" size={140} />
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Encargo Didático Semanal</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-6xl font-bold tracking-tighter leading-none">{(teacher.cargaHoraria || 0)}h</h4>
                  <span className="text-xl font-bold opacity-30">/ {limit}h</span>
                </div>
                <div className="pt-4 space-y-4">
                   <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((teacher.cargaHoraria || 0) / limit) * 100}%` }}
                        className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                      />
                   </div>
                   <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                     O {teacher.role.toLowerCase()} possui um limite normativo de {limit} horas aula semanais.
                   </p>
                </div>
              </div>
           </div>

            <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-zinc-400" />
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Painel Operacional</h4>
              </div>
              <div className="flex flex-col gap-2">
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full h-11 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Settings size={14} /> Alterar Senha
                  </button>
                )}
                {isAdmin && !isOwnProfile && (
                  <button 
                    onClick={() => onUpdate({ ...teacher, status: teacher.status === 'Inativo' ? 'Ativo' : 'Inativo' })}
                    className={`w-full h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${teacher.status === 'Inativo' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-900 hover:text-white'}`}
                  >
                    {teacher.status === 'Inativo' ? 'Reativar Usuário' : 'Desativar Usuário'}
                  </button>
                )}
                {isOwnProfile && (
                  <button 
                    onClick={() => {
                       setDeactivatePassword('');
                       setPasswordError(null);
                       setPasswordSuccess(null);
                       setIsDeactivatingAccount(true);
                    }}
                    className="w-full h-11 bg-rose-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Desativar minha conta
                  </button>
                )}
                {!isOwnProfile && (
                  <button className="w-full h-11 bg-rose-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all">Remover do Campus</button>
                )}
              </div>
           </div>
        </aside>
      </div>

      <AnimatePresence>
        {isChangingPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Alterar Senha</h3>
                <button onClick={() => setIsChangingPassword(false)} className="text-zinc-400 hover:text-zinc-600">
                  <ArrowLeft size={20} className="rotate-90 md:rotate-0" />
                </button>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold whitespace-pre-line leading-relaxed">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Senha Atual</label>
                  <input 
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nova Senha</label>
                  <input 
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Confirmação da Nova Senha</label>
                  <input 
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/30"
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed border-t border-zinc-100 pt-4">
                  Critérios: Min. 8 caracteres, letras maiúsculas/minúsculas, número e caractere especial (!@#$).
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleChangePassword}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Salvar Nova Senha"}
                </button>
                <button 
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 h-12 bg-zinc-100 text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all font-sans"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeactivatingAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Desativar Minha Conta</h3>
                <button onClick={() => setIsDeactivatingAccount(false)} className="text-zinc-400 hover:text-zinc-600">
                  <ArrowLeft size={20} className="rotate-90 md:rotate-0" />
                </button>
              </div>

              <div className="p-4 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-[10px] font-bold leading-relaxed">
                Atenção: Ao desativar sua conta, seu acesso será bloqueado. Seus registros acadêmicos e de alocação serão preservados como "Inativos". A reativação exige aprovação administrativa.
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Confirme sua senha para continuar</label>
                <input 
                  type="password"
                  value={deactivatePassword}
                  onChange={e => setDeactivatePassword(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-rose-500/20"
                  placeholder="Sua senha atual"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleDeactivateAccount}
                  disabled={isSubmitting || !!passwordSuccess}
                  className="flex-1 h-12 bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirmar Desativação"}
                </button>
                <button 
                  onClick={() => setIsDeactivatingAccount(false)}
                  disabled={isSubmitting || !!passwordSuccess}
                  className="flex-1 h-12 bg-zinc-100 text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all font-sans disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TeachersView = ({ 
  teachers, 
  onAddTeacher,
  onUpdateTeacher,
  onSelectTeacher,
  onDeleteTeacher,
  currentUserRole,
  currentUserId
}: { 
  teachers: User[], 
  onAddTeacher: (data: any) => void,
  onUpdateTeacher: (data: any) => void,
  onSelectTeacher: (id: string) => void,
  onDeleteTeacher: (id: string) => void,
  currentUserRole?: UserRole,
  currentUserId?: string
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'alert' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const isAdmin = currentUserRole === 'Admin';

  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    registration: '', // SIAPE
    ingressoYear: '', 
    birthDate: '', 
    areaAtuacao: '',
    phone: '',
    cpf: '',
    regime: WorkRegime.DE,
    leaveType: LeaveType.Nenhum,
    hasReducedWorkload: false,
    role: 'Professor' as UserRole,
    status: 'Ativo' as 'Ativo' | 'Inativo'
  });

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.registration.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'Todos' || t.role === roleFilter;
      const matchesStatus = statusFilter === 'Todos' || (t.status || 'Ativo') === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teachers, searchTerm, roleFilter, statusFilter]);

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.registration) return;
    
    if (editingId) {
      onUpdateTeacher({ ...formData, id: editingId });
      setNotification({ message: 'Docente atualizado com sucesso!', type: 'success' });
    } else {
      onAddTeacher(formData);
      setNotification({ message: 'Docente cadastrado com sucesso!', type: 'success' });
    }

    setFormData({
      name: '', email: '', registration: '', ingressoYear: '', birthDate: '', 
      areaAtuacao: '', phone: '', cpf: '', regime: WorkRegime.DE, 
      leaveType: LeaveType.Nenhum, hasReducedWorkload: false, role: 'Professor',
      status: 'Ativo'
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (teacher: User) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      registration: teacher.registration,
      ingressoYear: teacher.ingressoYear || '',
      birthDate: teacher.birthDate || '',
      areaAtuacao: teacher.areaAtuacao || '',
      phone: teacher.phone || '',
      cpf: teacher.cpf || '',
      regime: teacher.regime,
      leaveType: teacher.leaveType,
      hasReducedWorkload: teacher.hasReducedWorkload,
      role: teacher.role as UserRole,
      status: (teacher.status || 'Ativo') as 'Ativo' | 'Inativo'
    });
    setEditingId(teacher.id);
    setIsAdding(true);
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDeleteTeacher(deletingId);
      setNotification({ message: 'Docente excluído com sucesso!', type: 'success' });
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Docentes</h1>
          <p className="text-zinc-500 text-sm font-sans">Gestão de professores e encargos didáticos.</p>
        </div>
        <button 
          onClick={() => {
            setFormData({
              name: '', email: '', registration: '', ingressoYear: '', birthDate: '', 
              areaAtuacao: '', phone: '', cpf: '', regime: WorkRegime.DE, 
              leaveType: LeaveType.Nenhum, hasReducedWorkload: false, role: 'Professor',
              status: 'Ativo'
            });
            setEditingId(null);
            setIsAdding(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-opacity-90 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} /> Novo Docente
        </button>
      </header>

      {notification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg flex items-center gap-3 shadow-sm border ${
            notification.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <p className="text-sm font-bold">{notification.message}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 text-zinc-400" size={16} />
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou SIAPE..." 
            className="w-full bg-white h-10 pl-10 pr-4 rounded border border-zinc-200 text-sm outline-none focus:border-primary/30"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-white px-4 rounded border border-zinc-200 text-sm outline-none focus:border-primary/30 h-10"
        >
          <option value="Todos">Todas as Funções</option>
          <option value="Professor">Professores</option>
          <option value="Coordenador">Coordenadores</option>
          <option value="Diretor">Diretores</option>
        </select>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-white px-4 rounded border border-zinc-200 text-sm outline-none focus:border-primary/30 h-10"
        >
          <option value="Todos">Todos os Status</option>
          <option value="Ativo">Ativos</option>
          <option value="Inativo">Inativos</option>
        </select>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 border border-zinc-200 rounded-xl space-y-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">{editingId ? 'Editar Docente' : 'Novo Docente'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Nome Completo</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Data de Nascimento</label>
              <input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">E-mail Institucional</label>
              <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Telefone</label>
              <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30" placeholder="(00) 00000-0000" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Área de Atuação</label>
              <select 
                value={formData.areaAtuacao} 
                onChange={e => setFormData({...formData, areaAtuacao: e.target.value})} 
                className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30 bg-white"
              >
                <option value="" disabled>Selecione uma área...</option>
                {AREAS_DE_ATUACAO.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Ano de Ingresso</label>
              <input type="number" value={formData.ingressoYear} onChange={e => setFormData({...formData, ingressoYear: e.target.value})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30" placeholder="Ex: 2020" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">SIAPE</label>
              <input value={formData.registration} onChange={e => setFormData({...formData, registration: e.target.value})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30" placeholder="Ex: 1234567" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">CPF</label>
              <input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30" placeholder="000.000.000-00" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Função/Cargo</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30">
                <option value="Professor">Professor</option>
                <option value="Coordenador">Coordenador</option>
                <option value="Diretor">Diretor</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Regime de Trabalho</label>
              <select value={formData.regime} onChange={e => setFormData({...formData, regime: e.target.value as WorkRegime})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30">
                {Object.values(WorkRegime).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border border-zinc-200 h-9 px-3 rounded text-sm outline-none focus:border-primary/30">
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} className="bg-primary text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider">{editingId ? 'Salvar Alterações' : 'Cadastrar'}</button>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-zinc-500 text-xs font-bold uppercase tracking-wider px-2 hover:text-zinc-900 transition-colors">Cancelar</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <table className="w-full font-sans">
          <thead>
            <tr className="bg-zinc-50 text-left border-b border-zinc-100">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Docente</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Ano Egresso/SIAPE</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Carga</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50">
            {filteredTeachers.length > 0 ? filteredTeachers.map(teacher => (
              <tr key={teacher.id} className="hover:bg-zinc-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-zinc-900 leading-none">{teacher.name}</p>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">{teacher.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <p className="text-xs text-zinc-600 font-medium">{teacher.ingressoYear || 'N/A'}</p>
                  <p className="text-[10px] text-zinc-400 uppercase tracking-tight font-medium mt-0.5">{teacher.registration}</p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`text-sm font-bold ${(teacher.cargaHoraria || 0) > 20 ? 'text-alert' : 'text-zinc-900'}`}>{teacher.cargaHoraria || 0}h</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button 
                      onClick={() => onSelectTeacher(teacher.id)} 
                      className="p-2 text-zinc-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" 
                      title="Visualizar Perfil"
                    >
                      <Eye size={18} />
                    </button>
                    {isAdmin && (
                      <button 
                        onClick={() => handleEdit(teacher)} 
                        className="p-2 text-zinc-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" 
                        title="Editar Docente"
                      >
                        <Edit3 size={18} />
                      </button>
                    )}
                    {isAdmin && teacher.id !== currentUserId && (
                      <button 
                        onClick={() => setDeletingId(teacher.id)} 
                        className="p-2 text-zinc-400 hover:text-alert hover:bg-rose-50 rounded-lg transition-all" 
                        title="Excluir Docente"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center text-zinc-400 text-sm font-medium italic">
                  Nenhum docente encontrado nos registros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 space-y-6"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-zinc-900">Confirmar Exclusão?</h3>
                <p className="text-zinc-500 text-sm">
                  Ao excluir o docente <strong>{teachers.find(t => t.id === deletingId)?.name}</strong>, ele perderá permanentemente o acesso ao sistema e todas as suas alocações serão removidas.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={confirmDelete}
                  className="flex-1 h-11 bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200"
                >
                  Excluir Agora
                </button>
                <button 
                  onClick={() => setDeletingId(null)}
                  className="flex-1 h-11 bg-zinc-100 text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all font-sans"
                >
                  Manter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReportsView = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <header>
      <h1 className="text-2xl font-bold text-zinc-900 font-sans">Relatórios e Exportação</h1>
      <p className="text-zinc-500 text-sm font-sans mt-1">Gere documentos oficiais e visões consolidadas do campus.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { title: 'Grade de Horários', description: 'Exportação da grade unificada por curso.', icon: Calendar },
        { title: 'Lotação Docente', description: 'Relatório detalhado de encargos por docente.', icon: Users },
        { title: 'Quadro de Vagas', description: 'Análise de disciplinas sem docentes vinculados.', icon: AlertCircle },
      ].map((report, i) => (
        <div key={i} className="bg-white p-6 rounded-lg border border-zinc-200 hover:border-primary/30 transition-all cursor-pointer group shadow-sm">
          <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400 group-hover:bg-primary group-hover:text-white transition-all mb-4">
            <report.icon size={20} />
          </div>
          <h3 className="font-bold text-zinc-900 mb-1">{report.title}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed font-sans">{report.description}</p>
          <button className="mt-4 flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            <Download size={12} /> Baixar PDF
          </button>
        </div>
      ))}
    </div>
  </div>
);

const SettingsView = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <header>
      <h1 className="text-2xl font-bold text-zinc-900">Cronograma do Campus</h1>
      <p className="text-zinc-500 text-sm">Ajustes globais do sistema.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg border border-zinc-200 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 text-zinc-900">
          <Clock size={20} className="text-primary" />
          <h3 className="font-bold">Turnos de Aula</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Manhã', range: '07:25 às 11:45' },
            { label: 'Tarde', range: '13:00 às 17:20' },
            { label: 'Noite', range: '18:20 às 22:40' }
          ].map(shift => (
            <div key={shift.label} className="p-4 bg-zinc-50 rounded-lg flex items-center justify-between border border-zinc-100">
              <span className="text-xs font-bold uppercase text-zinc-400">{shift.label}</span>
              <span className="text-sm font-medium text-zinc-800">{shift.range}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-zinc-200 flex flex-col justify-center items-center text-center space-y-4 shadow-sm">
         <div className="w-16 h-16 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-300">
           <Activity size={32} />
         </div>
         <div>
           <p className="text-sm font-bold text-zinc-900">Unidade de Tempo</p>
           <p className="text-2xl font-bold text-primary">50 Minutos / Crédito</p>
           <p className="text-xs text-zinc-500 mt-2">Métrica normativa oficial do IFCE.</p>
         </div>
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [session, setSession] = useState<{ user: User | null, isLoggedIn: boolean }>({ user: null, isLoggedIn: false });
  const [currentView, setCurrentView] = useState<'dashboard' | 'courses' | 'teachers' | 'settings' | 'reports'>('dashboard');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(INITIAL_SCHEDULES);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // Fetch users if admin
  useEffect(() => {
    if (session.isLoggedIn && session.user?.role === 'Admin') {
      const fetchUsers = async () => {
        try {
          const res = await fetch("/api/users", {
            headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
          });
          const data = await res.json();
          if (res.ok) setTeachers(data);
        } catch (err) {
          console.error("Failed to fetch users", err);
        }
      };
      fetchUsers();
    } else if (!session.isLoggedIn) {
      setTeachers(INITIAL_TEACHERS);
    }
  }, [session.isLoggedIn, session.user]);

  const handleLogin = async (email: string, pass: string) => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao fazer login");

      localStorage.setItem("authToken", data.token);
      setSession({ user: data.user, isLoggedIn: true });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    setSession({ user: null, isLoggedIn: false });
    setSelectedTeacherId(null);
    setCurrentView('dashboard');
  };

  // Check for stored token and auto-refresh session
  useEffect(() => {
    const checkToken = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        try {
          const res = await fetch("/api/refresh", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: storedToken }),
          });
          const data = await res.json();
          if (res.ok) {
            localStorage.setItem("authToken", data.token);
            // For the demo, we reconstruct from token
            const decoded = JSON.parse(atob(data.token.split('.')[1]));
            const mockUser: User = {
              id: decoded.id,
              name: decoded.name,
              email: decoded.email,
              role: decoded.role,
              registration: decoded.registration,
              campus: decoded.campus,
              regime: WorkRegime.DE,
              leaveType: LeaveType.Nenhum,
              hasReducedWorkload: false,
              cargaHoraria: 20,
              disciplinasMinistradas: [],
              areaAtuacao: 'Docência'
            };
            setSession({ user: mockUser, isLoggedIn: true });
          } else {
            localStorage.removeItem("authToken");
          }
        } catch (err) {
          localStorage.removeItem("authToken");
        }
      }
    };
    checkToken();
  }, []);

  const addCourse = (name: string, level: Level, type: CourseType, durationType: 'Semestral' | 'Anual') => {
    setCourses([...courses, { id: Date.now().toString(), name, campus: 'Tauá', level, type, durationType }]);
  };

  const addSubject = (name: string, workload: number, courseId: string, period: number, type: 'Obrigatória' | 'Opcional') => {
    const colorIndex = subjects.length % PASTEL_COLORS.length;
    setSubjects([...subjects, { id: Date.now().toString(), name, workload, courseId, period, type, color: PASTEL_COLORS[colorIndex] }]);
  };

  const updateCourse = (course: Course) => {
    setCourses(courses.map(c => c.id === course.id ? course : c));
  };

  const deleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
    // Also remove from schedules
    setSchedules(schedules.filter(s => s.subjectId !== id));
  };

  const updateSubject = (subject: Subject) => {
    setSubjects(subjects.map(s => s.id === subject.id ? subject : s));
  };

  const addTeacher = async (data: any) => {
    if (session.user?.role !== 'Admin') {
      // Demo fallback
      setTeachers([...teachers, {
        ...data,
        id: Date.now().toString(),
        campus: 'Tauá',
        cargaHoraria: getWorkloadLimit(data.role),
        disciplinasMinistradas: [],
        status: 'Ativo'
      }]);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ ...data, campus: 'Tauá' }),
      });
      const newUser = await res.json();
      if (res.ok) {
        setTeachers([...teachers, { ...newUser, disciplinasMinistradas: [], cargaHoraria: getWorkloadLimit(newUser.role) }]);
      } else {
        throw new Error(newUser.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const addSchedule = (entry: Omit<ScheduleEntry, 'id'>) => {
    setSchedules([...schedules, { ...entry, id: Date.now().toString() }]);
  };

  const updateTeacher = async (data: any) => {
    if (session.user?.role !== 'Admin') {
      setTeachers(teachers.map(t => t.id === data.id ? { ...t, ...data } : t));
      return;
    }

    try {
      const res = await fetch(`/api/users/${data.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(data),
      });
      const updatedUser = await res.json();
      if (res.ok) {
        setTeachers(teachers.map(t => t.id === data.id ? { ...t, ...updatedUser } : t));
      } else {
        throw new Error(updatedUser.error);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteTeacher = async (id: string) => {
    if (session.user?.role !== 'Admin') {
      setTeachers(teachers.filter(t => t.id !== id));
      if (selectedTeacherId === id) setSelectedTeacherId(null);
      return;
    }

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("authToken")}` }
      });
      if (res.ok) {
        setTeachers(teachers.filter(t => t.id !== id));
        if (selectedTeacherId === id) setSelectedTeacherId(null);
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  if (!session.isLoggedIn) return <LoginView onLogin={handleLogin} />;

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col fixed h-full z-10">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary p-2 rounded-lg text-white">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="font-bold text-zinc-900 leading-none">Gestão Acadêmica</h1>
              <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Campus Tauá</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard' && !selectedTeacherId} onClick={() => { setCurrentView('dashboard'); setSelectedTeacherId(null); }} />
          <SidebarItem icon={Building2} label="Cursos e Disciplinas" active={currentView === 'courses' && !selectedTeacherId} onClick={() => { setCurrentView('courses'); setSelectedTeacherId(null); }} />
          <SidebarItem icon={Users} label="Docentes" active={(currentView === 'teachers' || !!selectedTeacherId) && !(selectedTeacherId === session.user?.id)} onClick={() => { setCurrentView('teachers'); setSelectedTeacherId(null); }} />
          <SidebarItem icon={FileText} label="Relatórios" active={currentView === 'reports' && !selectedTeacherId} onClick={() => { setCurrentView('reports'); setSelectedTeacherId(null); }} />
          <SidebarItem icon={Settings} label="Cronograma" active={currentView === 'settings' && !selectedTeacherId} onClick={() => { setCurrentView('settings'); setSelectedTeacherId(null); }} />
        </nav>

        <div className="p-4 mt-auto border-t border-zinc-100">
          <div 
            onClick={() => { setSelectedTeacherId(session.user?.id || null); }}
            className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg cursor-pointer transition-all ${selectedTeacherId === session.user?.id ? 'bg-zinc-100 border border-zinc-200' : 'hover:bg-zinc-50'}`}
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
              {session.user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">{session.user?.name}</p>
              <p className="text-[10px] text-zinc-500 truncate">{session.user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-500 hover:text-alert hover:bg-rose-50 transition-all font-medium text-sm"
          >
            <LogOut size={16} /> <span>Sair</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={selectedTeacherId ? `profile-${selectedTeacherId}` : currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {selectedTeacherId ? (
              <TeacherProfileView 
                teacher={teachers.find(t => t.id === selectedTeacherId)!} 
                onBack={() => setSelectedTeacherId(null)}
                onUpdate={updateTeacher}
                currentUserRole={session.user?.role}
                currentUserId={session.user?.id}
                onLogout={handleLogout}
              />
            ) : (
              <>
                {currentView === 'dashboard' && (
                  <DashboardView 
                    user={session.user!} 
                    stats={{ teachers: teachers.length, courses: courses.length, subjects: subjects.length }} 
                    courses={courses} 
                    subjects={subjects}
                    teachers={teachers}
                    schedules={schedules}
                    onAddSchedule={addSchedule}
                  />
                )}
                {currentView === 'courses' && (
                  <CoursesView 
                    courses={courses} 
                    teachers={teachers} 
                    subjects={subjects} 
                    onAddCourse={addCourse} 
                    onAddSubject={addSubject} 
                    onUpdateCourse={updateCourse} 
                    onDeleteSubject={deleteSubject}
                    onUpdateSubject={updateSubject}
                  />
                )}
                {currentView === 'teachers' && (
                  <TeachersView 
                    teachers={teachers} 
                    onAddTeacher={addTeacher} 
                    onUpdateTeacher={updateTeacher}
                    onSelectTeacher={setSelectedTeacherId} 
                    onDeleteTeacher={deleteTeacher} 
                    currentUserRole={session.user?.role}
                    currentUserId={session.user?.id}
                  />
                )}
                {currentView === 'reports' && <ReportsView />}
                {currentView === 'settings' && <SettingsView />}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

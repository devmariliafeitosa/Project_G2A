import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronRight, AlertCircle, X, Users, BookPlus, UserPlus as UserPlusIcon, Trash2, BookOpen, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Level, CourseType } from '../index';
import type { Course, Subject, User } from '../index';

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
  onAddCourse: (name: string, level: Level, type: CourseType, duration: 'Semestral' | 'Anual', coordinatorId?: string) => void,
  onAddSubject: (name: string, workload: number, courseId: string, period: number, type: 'Obrigatória' | 'Opcional') => void,
  onUpdateCourse: (course: Course) => void,
  onDeleteSubject: (id: string) => void,
  onUpdateSubject: (subject: Subject) => void
}) => {
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [addingSubjectTo, setAddingSubjectTo] = useState<string | null>(null);
  const [addingTeacherTo, setAddingTeacherTo] = useState<string | null>(null);
  const [selectedTeacherIdsForCourse, setSelectedTeacherIdsForCourse] = useState<string[]>([]);
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseValidationError, setCourseValidationError] = useState<string | null>(null);
  const [subjectValidationError, setSubjectValidationError] = useState<string | null>(null);
  const [editSubjectValidationError, setEditSubjectValidationError] = useState<string | null>(null);
  
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [confirmingDeleteSubjectId, setConfirmingDeleteSubjectId] = useState<string | null>(null);

  const [newCourse, setNewCourse] = useState({ 
    name: '', 
    level: '' as Level, 
    type: '' as CourseType, 
    durationType: '' as 'Semestral' | 'Anual',
    coordinatorId: '' 
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
    return teachers.filter(t =>
      t.role === 'Coordenador' &&
      (!courses.some(c => c.coordinatorId === t.id && c.id !== expandedCourse) || t.id === currentCoordId)
    );
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
          {courseValidationError && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{courseValidationError}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Nome</label>
              <input 
                value={newCourse.name} 
                onChange={e => { setNewCourse({...newCourse, name: e.target.value}); setCourseValidationError(null); }} 
                className={`w-full border ${courseValidationError && !newCourse.name ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30`} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Tipo</label>
              <select 
                value={newCourse.type} 
                onChange={e => { setNewCourse({...newCourse, type: e.target.value as CourseType}); setCourseValidationError(null); }} 
                className={`w-full border ${courseValidationError && !newCourse.type ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none`}
              >
                <option value="">Escolher...</option>
                {Object.values(CourseType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Nível</label>
              <select 
                value={newCourse.level} 
                onChange={e => { setNewCourse({...newCourse, level: e.target.value as Level}); setCourseValidationError(null); }} 
                className={`w-full border ${courseValidationError && !newCourse.level ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none`}
              >
                <option value="">Escolher...</option>
                {Object.values(Level).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Duração</label>
              <select 
                value={newCourse.durationType} 
                onChange={e => { setNewCourse({...newCourse, durationType: e.target.value as 'Semestral' | 'Anual'}); setCourseValidationError(null); }} 
                className={`w-full border ${courseValidationError && !newCourse.durationType ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none`}
              >
                <option value="">Escolher...</option>
                <option value="Semestral">Semestral</option>
                <option value="Anual">Anual</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Coordenador</label>
              <select 
                value={newCourse.coordinatorId} 
                onChange={e => { setNewCourse({...newCourse, coordinatorId: e.target.value}); setCourseValidationError(null); }} 
                className={`w-full border ${courseValidationError && !newCourse.coordinatorId ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none`}
              >
                <option value="">Escolher...</option>
                {getAvailableCoordinators().map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => { 
                if (!newCourse.name || !newCourse.type || !newCourse.level || !newCourse.durationType || !newCourse.coordinatorId) {
                  setCourseValidationError('Todos os campos são obrigatórios!');
                  return;
                }
                onAddCourse(newCourse.name, newCourse.level, newCourse.type, newCourse.durationType, newCourse.coordinatorId || undefined); 
                setIsAddingCourse(false); 
                setCourseValidationError(null);
                setNewCourse({ name: '', level: '' as Level, type: '' as CourseType, durationType: '' as 'Semestral' | 'Anual', coordinatorId: '' });
              }}
              className="bg-primary text-white px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider"
            >
              Confirmar
            </button>
            <button onClick={() => { setIsAddingCourse(false); setCourseValidationError(null); }} className="text-zinc-500 text-xs font-bold uppercase tracking-wider px-2 hover:text-zinc-900 transition-colors">Cancelar</button>
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

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Users size={14} /> Professores do Curso
                          </h5>
                          <button 
                            onClick={() => setAddingTeacherTo(course.id)} 
                            className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline underline-offset-4"
                          >
                            <UserPlusIcon size={12} /> Add Professor
                          </button>
                        </div>

                        {addingTeacherTo === course.id && (
                          <div className="p-4 bg-white border border-zinc-200 rounded-xl space-y-4 shadow-sm animate-in zoom-in-95 duration-200">
                            <div className="space-y-2">
                              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Selecionar Professores (Múltiplos)</label>
                              <div className="max-h-40 overflow-y-auto border border-zinc-100 rounded-lg p-2 space-y-1 bg-zinc-50/50">
                                {teachers
                                  .filter(t => !(course.teacherIds || []).includes(t.id))
                                  .map(t => (
                                    <label key={t.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-colors cursor-pointer group">
                                      <input 
                                        type="checkbox"
                                        checked={selectedTeacherIdsForCourse.includes(t.id)}
                                        onChange={e => {
                                          if (e.target.checked) setSelectedTeacherIdsForCourse([...selectedTeacherIdsForCourse, t.id]);
                                          else setSelectedTeacherIdsForCourse(selectedTeacherIdsForCourse.filter(id => id !== t.id));
                                        }}
                                        className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <div className="flex-1">
                                        <p className="text-[11px] font-bold text-zinc-800 leading-tight group-hover:text-emerald-700 transition-colors">{t.name}</p>
                                        <p className="text-[9px] text-zinc-400 font-sans">SIAPE: {t.siape || 'N/A'}</p>
                                      </div>
                                    </label>
                                  ))
                                }
                                {teachers.filter(t => !(course.teacherIds || []).includes(t.id)).length === 0 && (
                                  <p className="text-[10px] text-zinc-400 italic p-2 text-center">Todos os professores já estão vinculados.</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => {
                                  if (selectedTeacherIdsForCourse.length === 0) return;
                                  const updatedTeacherIds = [...(course.teacherIds || []), ...selectedTeacherIdsForCourse];
                                  onUpdateCourse({ ...course, teacherIds: updatedTeacherIds });
                                  setAddingTeacherTo(null);
                                  setSelectedTeacherIdsForCourse([]);
                                }}
                                disabled={selectedTeacherIdsForCourse.length === 0}
                                className="bg-emerald-600 text-white h-8 px-4 rounded text-[10px] font-bold uppercase tracking-widest disabled:opacity-50 transition-all hover:bg-emerald-700 shadow-sm"
                              >
                                Vincular {selectedTeacherIdsForCourse.length > 0 && `(${selectedTeacherIdsForCourse.length})`}
                              </button>
                              <button 
                                onClick={() => { setAddingTeacherTo(null); setSelectedTeacherIdsForCourse([]); }} 
                                className="bg-zinc-100 text-zinc-500 h-8 px-4 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {(course.teacherIds || []).map(tId => {
                            const teacher = teachers.find(t => t.id === tId);
                            if (!teacher) return null;
                            return (
                              <div key={tId} className="bg-white border border-zinc-200 px-3 py-1.5 rounded-full flex items-center gap-2 group/tag">
                                <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                                  {teacher.name.charAt(0)}
                                </div>
                                <span className="text-[11px] font-medium text-zinc-700">{teacher.name}</span>
                                <button 
                                  onClick={() => {
                                    const updatedTeacherIds = (course.teacherIds || []).filter(id => id !== tId);
                                    onUpdateCourse({ ...course, teacherIds: updatedTeacherIds });
                                  }}
                                  className="text-zinc-300 hover:text-alert transition-colors"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          })}
                          {(course.teacherIds || []).length === 0 && (
                            <p className="text-[10px] text-zinc-400 italic font-sans px-2">Nenhum professor vinculado além da coordenação.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                        <h5 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                          <BookPlus size={14} /> Matriz Curricular
                        </h5>
                        <button onClick={() => setAddingSubjectTo(course.id)} className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline underline-offset-4">
                          <Plus size={12} /> Add Disciplina
                        </button>
                      </div>

                      {addingSubjectTo === course.id && (
                        <div className="p-4 bg-white border border-zinc-200 rounded-xl grid grid-cols-1 md:grid-cols-5 gap-3 items-end shadow-sm animate-in zoom-in-95 duration-200">
                          <div className="md:col-span-1 space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Nome</label>
                            <input 
                              value={newSubject.name} 
                              onChange={e => { setNewSubject({...newSubject, name: e.target.value}); setSubjectValidationError(null); }} 
                              className={`w-full border ${subjectValidationError && !newSubject.name ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-8 px-2 rounded text-xs outline-none focus:border-primary/30`} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Carga</label>
                            <select 
                              value={newSubject.workload} 
                              onChange={e => { setNewSubject({...newSubject, workload: parseInt(e.target.value)}); setSubjectValidationError(null); }} 
                              className={`w-full border ${subjectValidationError && !newSubject.workload ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-8 px-2 rounded text-xs outline-none bg-white font-medium`}
                            >
                              <option value={40}>40h</option>
                              <option value={60}>60h</option>
                              <option value={80}>80h</option>
                              <option value={120}>120h</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Período</label>
                            <input 
                              type="number" 
                              value={newSubject.period} 
                              onChange={e => { setNewSubject({...newSubject, period: parseInt(e.target.value)}); setSubjectValidationError(null); }} 
                              className={`w-full border ${subjectValidationError && (!newSubject.period || newSubject.period < 1) ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-8 px-2 rounded text-xs outline-none`} 
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Tipo</label>
                            <select 
                              value={newSubject.type} 
                              onChange={e => { setNewSubject({...newSubject, type: e.target.value as 'Obrigatória' | 'Opcional'}); setSubjectValidationError(null); }} 
                              className="w-full border border-zinc-200 h-8 px-2 rounded text-xs outline-none bg-white font-bold"
                            >
                              <option value="Obrigatória">Obrigatória</option>
                              <option value="Opcional">Opcional</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1">
                            {subjectValidationError && (
                              <p className="text-[8px] text-rose-500 font-bold uppercase mb-1">{subjectValidationError}</p>
                            )}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => { 
                                  if (!newSubject.name || !newSubject.workload || !newSubject.period || newSubject.period < 1) {
                                    setSubjectValidationError("Campos obrigatórios!");
                                    return;
                                  }
                                  onAddSubject(newSubject.name, newSubject.workload, course.id, newSubject.period, newSubject.type); 
                                  setAddingSubjectTo(null); 
                                  setSubjectValidationError(null);
                                  setNewSubject({ name: '', workload: 80, period: 1, type: 'Obrigatória' });
                                }} 
                                className="flex-1 bg-primary text-white h-8 rounded text-[10px] font-bold uppercase tracking-widest"
                              >
                                Salvar
                              </button>
                              <button onClick={() => { setAddingSubjectTo(null); setSubjectValidationError(null); }} className="flex-1 bg-zinc-100 text-zinc-500 h-8 rounded text-[10px] font-bold uppercase tracking-widest">Sair</button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {subjects.filter(s => s.courseId === course.id).sort((a,b) => a.period - b.period).map(sub => (
                          <div 
                            key={sub.id} 
                            className={`p-3 border border-zinc-100 bg-white rounded-lg flex items-center justify-between group/sub transition-all duration-300 ${
                              sub.type === 'Obrigatória' 
                                ? 'hover:border-emerald-200 hover:shadow-[0_4px_12px_-4px_rgba(16,185,129,0.12)]' 
                                : 'hover:bg-orange-50/20 hover:border-orange-200 hover:shadow-[0_4px_12px_-4px_rgba(249,115,22,0.08)]'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-zinc-800 group-hover/sub:text-zinc-900 transition-colors">{sub.name}</p>
                              <p className="text-[9px] text-zinc-400 mt-1 font-sans uppercase font-medium flex items-center gap-2">
                                <span className="bg-zinc-50 border border-zinc-100/50 px-1.5 py-0.5 rounded text-zinc-500">{sub.period}º Período</span>
                                <span className="bg-zinc-50 border border-zinc-100/50 px-1.5 py-0.5 rounded text-zinc-500">{sub.workload}h</span>
                                <span className={`transition-colors duration-300 ${
                                  sub.type === 'Obrigatória' 
                                    ? 'text-zinc-300 group-hover/sub:text-emerald-600/80 font-bold' 
                                    : 'text-zinc-300 group-hover/sub:text-orange-600/80 font-bold'
                                }`}>
                                  {sub.type}
                                </span>
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
              
              {editSubjectValidationError && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">{editSubjectValidationError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nome</label>
                  <input 
                    value={editingSubject.name}
                    onChange={e => { setEditingSubject({...editingSubject, name: e.target.value}); setEditSubjectValidationError(null); }}
                    className={`w-full h-11 border ${editSubjectValidationError && !editingSubject.name ? 'border-rose-300 bg-rose-50' : 'bg-zinc-50 border-zinc-200'} rounded-xl px-4 text-sm outline-none focus:border-primary/30`}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Carga</label>
                    <select 
                      value={editingSubject.workload}
                      onChange={e => { setEditingSubject({...editingSubject, workload: parseInt(e.target.value)}); setEditSubjectValidationError(null); }}
                      className={`w-full h-11 border ${editSubjectValidationError && !editingSubject.workload ? 'border-rose-300 bg-rose-50' : 'bg-zinc-50 border-zinc-200'} rounded-xl px-4 text-sm outline-none bg-white font-bold`}
                    >
                      <option value={40}>40h</option>
                      <option value={60}>60h</option>
                      <option value={80}>80h</option>
                      <option value={120}>120h</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Período</label>
                    <input 
                      type="number"
                      value={editingSubject.period}
                      onChange={e => { setEditingSubject({...editingSubject, period: parseInt(e.target.value)}); setEditSubjectValidationError(null); }}
                      className={`w-full h-11 border ${editSubjectValidationError && (!editingSubject.period || editingSubject.period < 1) ? 'border-rose-300 bg-rose-50' : 'bg-zinc-50 border-zinc-200'} rounded-xl px-4 text-sm outline-none`}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Tipo</label>
                  <select 
                    value={editingSubject.type} 
                    onChange={e => { setEditingSubject({...editingSubject, type: e.target.value as 'Obrigatória' | 'Opcional'}); setEditSubjectValidationError(null); }}
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
                    if (!editingSubject.name || !editingSubject.workload || !editingSubject.period || editingSubject.period < 1) {
                      setEditSubjectValidationError("Todos os campos são obrigatórios!");
                      return;
                    }
                    onUpdateSubject(editingSubject);
                    setEditingSubject(null);
                    setEditSubjectValidationError(null);
                  }}
                  className="flex-1 h-12 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg"
                >
                  Salvar Alterações
                </button>
                <button 
                  onClick={() => { setEditingSubject(null); setEditSubjectValidationError(null); }}
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
export default CoursesView;

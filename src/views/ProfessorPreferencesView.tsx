import React, { useState, useMemo } from 'react';
import { UserCheck, Check, X, BookOpen, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DAYS } from '../constants';
import type { User, Course, Subject, AcademicSemester } from '../index';

const ProfessorPreferencesView = ({ 
  user, 
  courses, 
  subjects, 
  preferences,
  semesters = [],
  onSave
}: { 
  user: User, 
  courses: Course[], 
  subjects: Subject[],
  preferences: { teacherId: string, preferredSubjects: string[], preferredDays: string[], preferredShifts: string[] }[],
  semesters?: AcademicSemester[],
  onSave: (prefs: { preferredSubjects: string[], preferredDays: string[], preferredShifts: string[] }) => void
}) => {
  const userPrefs = useMemo(() => preferences.find(p => p.teacherId === user?.id) || { preferredSubjects: [], preferredDays: [], preferredShifts: [] }, [preferences, user?.id]);

  const openSemester = useMemo(() =>
    semesters.find(s => s.status === 'Ativo' && s.acceptPreferences)
  , [semesters]);

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>(userPrefs.preferredSubjects);
  const [preferredDays, setPreferredDays] = useState<string[]>(userPrefs.preferredDays);
  const [preferredShifts, setPreferredShifts] = useState<string[]>(userPrefs.preferredShifts);
  const [isSent, setIsSent] = useState(false);

  const courseSubjects = useMemo(() => subjects.filter(s => s.courseId === selectedCourseId), [subjects, selectedCourseId]);

  const toggleSubject = (id: string) => {
    setPreferredSubjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleDay = (day: string) => {
    setPreferredDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleShift = (shift: string) => {
    setPreferredShifts(prev => prev.includes(shift) ? prev.filter(s => s !== shift) : [...prev, shift]);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 relative">
      <header>
        <div className="flex items-center gap-3 text-primary mb-2">
          <UserCheck size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Área Professor</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900">Minhas Preferências</h1>
        <p className="text-zinc-500 text-sm">Defina seus interesses em disciplinas e horários.</p>
      </header>

      {openSemester ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Info size={16} />
          </div>
          <div>
            <p className="text-xs font-black text-emerald-800 uppercase">Semestre {openSemester.identification} aberto para preferências</p>
            <p className="text-[10px] text-emerald-600 font-medium">Preencha e envie suas preferências. O prazo é definido pela coordenação.</p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <Info size={16} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-xs font-black text-amber-800 uppercase">Nenhum semestre aberto para preferências</p>
            <p className="text-[10px] text-amber-600 font-medium">Aguarde a coordenação abrir o período de preferências para enviar sua solicitação.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">Interesse em Disciplinas</h3>
              <select 
                value={selectedCourseId}
                onChange={e => setSelectedCourseId(e.target.value)}
                className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold text-zinc-700 outline-none"
              >
                <option value="">Selecionar Curso...</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedCourseId ? (
                courseSubjects.length > 0 ? (
                  courseSubjects.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => toggleSubject(sub.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                        preferredSubjects.includes(sub.id)
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-zinc-100 hover:border-zinc-200 bg-white'
                      }`}
                    >
                      <div className="text-left">
                        <p className={`text-xs font-bold ${preferredSubjects.includes(sub.id) ? 'text-primary' : 'text-zinc-700'}`}>{sub.name}</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">{sub.workload}h • {sub.period}º Período</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${preferredSubjects.includes(sub.id) ? 'bg-primary border-primary' : 'border-zinc-200'}`}>
                        {preferredSubjects.includes(sub.id) && <Check size={12} className="text-white" />}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Nenhuma disciplina cadastrada</p>
                  </div>
                )
              ) : (
                <div className="py-12 text-center bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                  <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3 text-zinc-400">
                    <BookOpen size={20} />
                  </div>
                  <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Selecione um curso para ver as disciplinas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Dias da Semana</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`h-12 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      preferredDays.includes(day)
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-zinc-900 border-b border-zinc-100 pb-2">Turno de Interesse</h3>
              <div className="grid grid-cols-3 gap-3">
                {['Manhã', 'Tarde', 'Noite'].map(shift => (
                  <button
                    key={shift}
                    onClick={() => toggleShift(shift)}
                    className={`h-12 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      preferredShifts.includes(shift)
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {shift}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button 
                onClick={() => {
                  onSave({ preferredSubjects, preferredDays, preferredShifts });
                  setIsSent(true);
                }}
                disabled={!openSemester}
                className={`w-full h-12 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${!openSemester ? 'bg-zinc-100 border border-zinc-200 text-zinc-300 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-opacity-90 shadow-xl shadow-primary/10'}`}
              >
                <Check size={18} />
                <span>Salvar e Enviar Preferências</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isSent && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
              <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
                <Check size={40} strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-3 font-sans tracking-tight uppercase tracking-[0.1em]">Preferências Enviadas!</h3>
              <p className="text-sm text-zinc-500 mb-8 font-medium leading-relaxed font-sans">
                Suas disciplinas e horários de interesse foram encaminhados com sucesso ao coordenador. Estas informações serão revisadas para a montagem da grade.
              </p>
              
              <button 
                onClick={() => setIsSent(false)}
                className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-200 font-sans"
              >
                Entendido
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default ProfessorPreferencesView;

import React, { useState, useMemo } from 'react';
import { Search, BookOpen } from 'lucide-react';
import type { User, Course, Subject, ScheduleEntry, AcademicSemester } from '../../index';

interface MySubjectsViewProps {
  user: User | null;
  courses: Course[];
  subjects: Subject[];
  allocations?: ScheduleEntry[];
  schedules?: ScheduleEntry[];
  semesters?: AcademicSemester[];
}

const MySubjectsView = ({ user, courses, subjects, allocations: _alloc, schedules: _sched, semesters = [] }: MySubjectsViewProps) => {
  const allocations = _alloc || _sched || [];
  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const [selectedSemester, setSelectedSemester] = useState('all');

  // All subjects this user is allocated to teach
  const myAllocations = useMemo(() =>
    allocations.filter(a => a.teacherId === user?.id)
  , [allocations, user]);

  const mySubjectIds = useMemo(() => Array.from(new Set(myAllocations.map(a => a.subjectId))), [myAllocations]);
  const mySubjects = useMemo(() => subjects.filter(s => mySubjectIds.includes(s.id)), [subjects, mySubjectIds]);

  const availableSemesters = useMemo(() => Array.from(new Set(myAllocations.map(a => a.semester).filter(Boolean))).sort(), [myAllocations]);

  const filteredSubjects = useMemo(() => {
    return mySubjects.filter(sub => {
      const course = courses.find(c => c.id === sub.courseId);
      const matchesSearch = sub.name.toLowerCase().includes(search.toLowerCase()) || (sub.code || '').toLowerCase().includes(search.toLowerCase());
      const matchesCourse = selectedCourseId === 'all' || sub.courseId === selectedCourseId;
      const matchesSem = selectedSemester === 'all' || myAllocations.some(a => a.subjectId === sub.id && a.semester === selectedSemester);
      return matchesSearch && matchesCourse && matchesSem;
    });
  }, [mySubjects, search, selectedCourseId, selectedSemester, myAllocations, courses]);

  const myCourses = useMemo(() => courses.filter(c => mySubjects.some(s => s.courseId === c.id)), [courses, mySubjects]);
  const totalWorkload = useMemo(() => mySubjects.reduce((s, sub) => s + sub.workload, 0), [mySubjects]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#32a041] animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Área do Professor • Docência Multicurso</span>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-2">Minhas Disciplinas em Atividade</h1>
        <p className="text-zinc-500 text-sm font-medium">Todas as disciplinas de todos os cursos nos quais você atua de alguma forma (por alocação ou plano de preferência).</p>
      </header>

      {/* Teacher info bar */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex flex-wrap items-center gap-6 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-[#32a041]/10 text-[#32a041] flex items-center justify-center font-black text-sm">
          {user?.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Professor(a)</p>
          <p className="text-sm font-black text-zinc-800 uppercase">{user?.name}</p>
        </div>
        <div className="flex gap-6 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest border-l border-zinc-100 pl-6">
          <div>
            <p className="text-lg font-black text-zinc-800">{myCourses.length}</p>
            <p>Filtro Curso</p>
          </div>
          <div>
            <p className="text-lg font-black text-[#32a041]">{mySubjects.length}</p>
            <p>Minhas Disciplinas</p>
          </div>
          <div>
            <p className="text-lg font-black text-zinc-800">{totalWorkload}h</p>
            <p>Carga Horária</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por código ou nome de disciplina..."
            className="w-full h-10 pl-9 pr-4 bg-white border border-zinc-200 rounded-xl text-xs font-semibold outline-none focus:border-[#32a041]/30 text-zinc-700 placeholder:text-zinc-400" />
        </div>
        <select value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}
          className="h-10 px-4 bg-white border border-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none text-zinc-700 cursor-pointer">
          <option value="all">Todos os Cursos ({myCourses.length})</option>
          {myCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)}
          className="h-10 px-4 bg-white border border-zinc-200 rounded-xl text-xs font-black uppercase tracking-wider outline-none text-zinc-700 cursor-pointer">
          <option value="all">Todos os Semestres</option>
          {availableSemesters.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-wider">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{filteredSubjects.length} Disciplinas Registradas</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />{filteredSubjects.filter(s => s.status !== 'Inativa').length} Ativas</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" />{filteredSubjects.filter(s => s.status === 'Inativa').length} Inativas</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {filteredSubjects.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-zinc-300 gap-3">
            <BookOpen size={32} className="opacity-30" />
            <p className="text-xs font-black uppercase">Nenhuma disciplina encontrada.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="p-4 pl-6 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Disciplina</th>
                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-center">Status</th>
                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-center">Semestre</th>
                <th className="p-4 pr-6 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-right">Carga</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredSubjects.map(sub => {
                const course = courses.find(c => c.id === sub.courseId);
                return (
                  <tr key={sub.id} className="hover:bg-zinc-50/30 transition-all">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${sub.type === 'Obrigatória' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                          {sub.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-zinc-800 uppercase leading-none mb-0.5">{sub.name}</p>
                          <p className="text-[9px] text-zinc-400 font-medium">{sub.type}</p>
                          {course && <p className="text-[9px] text-[#32a041] font-black uppercase tracking-wide">{course.name}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${sub.status !== 'Inativa' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                        {sub.status || 'Ativa'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <p className="text-xs font-bold text-zinc-700">{sub.period}º</p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase">Semestre</p>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <p className="text-xs font-black text-zinc-800">{sub.workload}h</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MySubjectsView;

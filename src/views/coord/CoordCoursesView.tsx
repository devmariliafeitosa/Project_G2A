import React, { useState, useMemo } from 'react';
import { GraduationCap, BookOpen, Search, Filter } from 'lucide-react';
import type { User, Course, Subject } from '../../index';

const CoordCoursesView = ({ 
  user, 
  subjects, 
  courses 
}: { 
  user: User | null, 
  subjects: Subject[], 
  courses: Course[] 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Course coordinated by user
  const coordinatedCourse = useMemo(() => {
    return courses.find(c => c.coordinatorId === user?.id) || courses[0];
  }, [courses, user]);

  // Subjects belonging to this course
  const courseSubjects = useMemo(() => {
    if (!coordinatedCourse) return [];
    return subjects.filter(s => s.courseId === coordinatedCourse.id);
  }, [subjects, coordinatedCourse]);

  // Filtered subjects based on search & period selection
  const filteredSubjects = useMemo(() => {
    return courseSubjects.filter(sub => {
      const matchesSearch = 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (sub.code && sub.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPeriod = 
        selectedPeriod === 'all' || 
        sub.period.toString() === selectedPeriod;

      return matchesSearch && matchesPeriod;
    });
  }, [courseSubjects, searchTerm, selectedPeriod]);

  // Unique periods available in the course dynamically
  const availablePeriods = useMemo(() => {
    const periods = Array.from(new Set(courseSubjects.map(s => s.period))) as number[];
    return periods.sort((a, b) => a - b);
  }, [courseSubjects]);

  // Count active and inactive
  const stats = useMemo(() => {
    const total = courseSubjects.length;
    const active = courseSubjects.filter(s => s.status !== 'Inativa').length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [courseSubjects]);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#32a041] animate-pulse"></span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Matriz Curricular • {coordinatedCourse?.campus || 'Campus Tauá'}</span>
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-2">
            {coordinatedCourse?.name || 'Gestão da Matriz Curricular'}
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Consulta oficial das disciplinas ativas, cargas horárias e pré-requisitos para alocação.
          </p>
        </div>
        
        {coordinatedCourse && (
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-800 uppercase tracking-wider">
              {coordinatedCourse.level}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-800 uppercase tracking-wider">
              {coordinatedCourse.type}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200 text-[10px] font-black text-zinc-600 uppercase tracking-wider">
              Regime {coordinatedCourse.durationType}
            </span>
          </div>
        )}
      </header>

      {/* Info Card Coordinator */}
      {coordinatedCourse && (
        <div className="bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#32a041]">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Coordenador do Curso</p>
              <h4 className="text-sm font-black text-zinc-800 uppercase">
                {user?.id === coordinatedCourse.coordinatorId
                    ? user?.name
                    : 'Saulo Anderson'}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-6 text-zinc-400 text-xs font-semibold sm:border-l sm:border-zinc-100 sm:pl-6">
            <div>
              <span className="block text-[9px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">Campus</span>
              <span className="text-zinc-700">{coordinatedCourse.campus}</span>
            </div>
            <div>
              <span className="block text-[9px] font-black uppercase text-zinc-400 tracking-widest leading-none mb-1">Total Disciplinas</span>
              <span className="text-zinc-700 font-extrabold">{stats.total}</span>
            </div>

          </div>
        </div>
      )}

      {/* Main Body */}
      {courseSubjects.length === 0 ? (
        <div className="bg-white rounded-[3rem] border border-zinc-100 shadow-xl overflow-hidden p-16 text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 text-zinc-350 rounded-3xl flex items-center justify-center shadow-inner">
            <BookOpen size={36} />
          </div>
          <div className="max-w-md space-y-2">
            <h3 className="text-xl font-bold text-zinc-850 uppercase tracking-tight">Matriz Curricular</h3>
            <p className="text-zinc-500 text-sm font-medium">Nenhuma disciplina encontrada para este curso.</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-xs overflow-hidden">
          
          {/* Controls Panel */}
          <div className="p-8 border-b border-zinc-100 bg-zinc-50/20 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
            {/* Search Box */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por código ou nome de disciplina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-10 bg-white border border-zinc-200 rounded-2xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-[#32a041]/30 focus:ring-1 focus:ring-[#32a041]/10 placeholder:text-zinc-400 transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Filter Semestre Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
<span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider self-center">Semestre:</span>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setSelectedPeriod('all')}
                  className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${selectedPeriod === 'all' ? 'bg-[#32a041] text-white border-[#32a041] shadow-sm' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}>
                  Todos
                </button>
                {availablePeriods.map(p => (
                  <button key={p} onClick={() => setSelectedPeriod(p.toString())}
                    className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${selectedPeriod === p.toString() ? 'bg-[#32a041] text-white border-[#32a041] shadow-sm' : 'bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300'}`}>
                    {p}º Sem
                  </button>
                ))}
              </div>
            </div>
          </div>



          {/* Render Disciplines List */}
          {filteredSubjects.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center shadow-inner">
                <Search size={22} />
              </div>
              <div className="space-y-1">
                <h4 className="text-zinc-800 font-extrabold text-sm uppercase tracking-tight">Filtro sem resultados</h4>
                <p className="text-zinc-500 text-xs font-semibold max-w-sm mx-auto">Nenhuma disciplina encontrada para os filtros aplicados.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-100">
                    <th className="p-4 pl-6 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Disciplina</th>
                    
                    <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-center">Semestre</th>
                    <th className="p-4 pr-6 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-right">Carga</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredSubjects.map((sub) => {
                    const isMandatory = sub.type === 'Obrigatória';
                    return (
                      <tr key={sub.id} className="hover:bg-zinc-50/20 transition-all">
                        
                        {/* Disciplina Nome */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold uppercase shrink-0
                              ${isMandatory ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}
                            `}>
                              {sub.name ? sub.name.charAt(0) : "D"}
                            </div>
                            <div>
                              <p className="text-xs font-black text-zinc-800 uppercase leading-none mb-1">{sub.name}</p>
                              <p className="text-[10px] text-zinc-400 font-medium leading-none">
                                {sub.type}
                                {sub.prerequisites && sub.prerequisites.length > 0 && ` • Pré-requisitos: ${sub.prerequisites.map(pId => {
                                  const pr = subjects.find(s => s.id === pId);
                                  return pr ? (pr.code || pr.name) : pId;
                                }).join(', ')}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Semestre */}
                        <td className="p-4 text-center">
                          <p className="text-xs font-bold text-zinc-700">{sub.period}º</p>
                          <p className="text-[10px] text-zinc-400 font-extrabold uppercase mt-0.5">Semestre</p>
                        </td>

                        {/* Carga */}
                        <td className="p-4 pr-6 text-right">
                          <p className="text-xs font-black text-zinc-800">{sub.workload}h</p>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default CoordCoursesView;

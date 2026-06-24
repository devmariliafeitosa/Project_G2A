import React, { useState } from 'react';
import { 
  Calendar, 
  Users, 
  AlertTriangle, 
  BarChart3, 
  FileText, 
  RefreshCw, 
  Search, 
  Download, 
  Eye, 
  X, 
  Printer, 
  Check,
  TrendingUp,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType, Subject, Course, ScheduleEntry, AcademicSemester } from '../../index';

interface ReportsViewProps {
  user: UserType | null;
  teachers: UserType[];
  subjects: Subject[];
  courses: Course[];
  semesters: AcademicSemester[];
  allocations: ScheduleEntry[];
}

const getRoleBasedLimit = (role: string): number => {
  const normalizedRole = String(role).trim().toLowerCase();
  if (
    normalizedRole === 'coordenador' ||
    normalizedRole === 'diretor' ||
    normalizedRole === 'vice-diretor' ||
    normalizedRole === 'vicediretor' ||
    normalizedRole === 'vice diretor'
  ) {
    return 10;
  }
  return 20;
};

export default function ReportsView({
  user,
  teachers,
  subjects,
  courses,
  semesters,
  allocations
}: ReportsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('2024.1');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activePreviewType, setActivePreviewType] = useState<string | null>(null);
  
  // Simulation states
  const [downloadingReportId, setDownloadingReportId] = useState<string | null>(null);
  const [exportHistory, setExportHistory] = useState([
    { id: 'h1', name: 'Grade de Horários - 2024.1', date: 'Acabou de ser atualizado', user: 'Admin Geral' },
    { id: 'h2', name: 'Lotação Docente - Geral', date: '12/05/2026 09:15', user: 'Admin Geral' }
  ]);

  const reportsList = [
    {
      id: 'grade',
      title: 'Grade de Horários Consolidada',
      description: 'Exportação da grade unificada por curso, semestre, turno ou docente.',
      updateTime: 'HÁ 5 MINUTOS',
      icon: Calendar,
      iconColor: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    },
    {
      id: 'lotacao',
      title: 'Lotação Docente',
      description: 'Detalhado SIAPE, área, disciplinas e percentual de ocupação.',
      updateTime: 'HOJE, 08:30',
      icon: Users,
      iconColor: 'bg-emerald-50 text-[#32a041] border border-emerald-100',
    },
    {
      id: 'vagas',
      title: 'Quadro de Vagas e Pendências',
      description: 'Análise técnica de disciplinas sem docente ou com sobrecarga.',
      updateTime: 'EM TEMPO REAL',
      icon: AlertTriangle,
      iconColor: 'bg-amber-50 text-amber-600 border border-amber-100',
    },
    {
      id: 'resumo',
      title: 'Resumo Gerencial do Campus',
      description: 'Consolidado de indicadores, ocupação média e alertas críticos.',
      updateTime: 'SEMANAL',
      icon: BarChart3,
      iconColor: 'bg-rose-50 text-rose-600 border border-rose-100',
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleDownloadReport = (reportId: string, title: string) => {
    setDownloadingReportId(reportId);
    setTimeout(() => {
      setDownloadingReportId(null);
      // Add to history
      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const newHistoryItem = {
        id: 'h_' + Date.now(),
        name: `${title} - ${selectedSemester}`,
        date: formattedDate,
        user: user?.name || 'Coordenador Autenticado'
      };
      
      setExportHistory(prev => [newHistoryItem, ...prev]);
    }, 1500);
  };

  // Filter reports
  const filteredReports = reportsList.filter(rep => 
    rep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Math Helper for reports
  const getTeacherAllocatedHours = (tId: string) => {
    const tAllocations = allocations.filter(a => a.teacherId === tId);
    return tAllocations.length * 2; // Each slot is 2h
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-[10px] tracking-widest font-black text-emerald-600 uppercase mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Publicidade Acadêmica
          </div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-2">
            Relatórios Institucionais
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            Geração e exportação de documentos oficiais do sistema para o IFCE Campus Tauá.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="h-10 px-4 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 outline-none hover:border-zinc-300 transition-all shadow-xs"
          >
            <option value="2024.1">SEMESTRE 2024.1</option>
            <option value="2024.2">SEMESTRE 2024.2</option>
            <option value="2025.1">SEMESTRE 2025.1</option>
          </select>

          {/* Refresh Data */}
          <button
            onClick={handleRefresh}
            className="h-10 px-4 bg-white border border-zinc-200 hover:bg-zinc-50 border-zinc-200 rounded-xl text-xs font-bold text-zinc-700 flex items-center gap-2 transition-all active:scale-95 shadow-xs"
          >
            <RefreshCw size={13} className={`${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="uppercase text-[10px] tracking-wider">Atualizar Dados</span>
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          placeholder="Pesquisar relatórios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-12 pl-12 pr-4 bg-white border border-zinc-150 rounded-2xl text-xs font-semibold text-zinc-700 focus:outline-none focus:border-[#32a041]/30 focus:ring-1 focus:ring-[#32a041]/10 placeholder:text-zinc-400 transition-all shadow-xs"
        />
      </div>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-100 p-16 text-center space-y-4">
          <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Search size={22} className="text-zinc-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-zinc-800 font-extrabold text-sm uppercase tracking-tight">Relatório não encontrado</h4>
            <p className="text-zinc-500 text-xs font-semibold max-w-sm mx-auto">Nenhum relatório corresponde à sua pesquisa.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map((report) => {
            const IconComponent = report.icon;
            const isDownloading = downloadingReportId === report.id;
            
            return (
              <div 
                key={report.id}
                className="bg-white rounded-3xl border border-zinc-100 p-6 flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden hover:shadow-xs transition-all"
              >
                {/* Header row */}
                <div className="flex justify-between items-start">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${report.iconColor}`}>
                    <IconComponent size={20} />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                    ÚLTIMA ATUALIZAÇÃO • {report.updateTime}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-black text-zinc-850 uppercase tracking-tight">
                    {report.title}
                  </h3>
                  <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                    {report.description}
                  </p>
                </div>

                {/* Actions row */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => setActivePreviewType(report.id)}
                    className="h-11 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-[10px] font-black uppercase text-zinc-650 tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-98"
                  >
                    <Eye size={13} />
                    <span>Visualizar Prévia</span>
                  </button>

                  <button
                    onClick={() => handleDownloadReport(report.id, report.title)}
                    disabled={isDownloading}
                    className={`h-11 rounded-xl font-black uppercase text-[10px] tracking-wider flex items-center justify-center gap-1.5 transition-all text-white active:scale-98 ${
                      isDownloading 
                        ? 'bg-zinc-500 text-zinc-200 cursor-not-allowed' 
                        : 'bg-[#2d8a3e] hover:bg-[#257334]'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} />
                        <span>Baixar PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Export History Footer List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-[11px] font-black uppercase text-zinc-400 tracking-widest">
            Histórico de Exportações
          </h2>
          <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider">
            ACESSO AOS ÚLTIMOS DOCUMENTOS
          </span>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-xs divide-y divide-zinc-100">
          {exportHistory.map((hist) => (
            <div key={hist.id} className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50/30 transition-all">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-400 shink-0">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-700 uppercase leading-tight mb-1">
                    {hist.name}
                  </h4>
                  <p className="text-[10px] font-medium text-zinc-400">
                    Gerado por <span className="font-bold text-zinc-500">{hist.user}</span> em {hist.date}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => alert(`Visualizando histórico gerado anteriormente: ${hist.name}`)}
                className="h-8 px-3.5 border border-zinc-200 hover:bg-zinc-50 rounded-lg text-[9px] font-black uppercase text-zinc-600 transition-all"
              >
                Abrir
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Report Previews Modals */}
      <AnimatePresence>
        {activePreviewType && (
          <div className="fixed inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-[#32a041] flex items-center justify-center">
                    <FileText size={16} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">Visualizador de Prévia Oficial</span>
                    <h2 className="text-base font-black uppercase text-zinc-800 tracking-tight">
                      {reportsList.find(r => r.id === activePreviewType)?.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="h-8 px-3 bg-white border border-zinc-200 rounded-lg text-[9px] font-black uppercase text-zinc-650 flex items-center gap-1.5 hover:bg-zinc-50"
                  >
                    <Printer size={12} /> Imprimir
                  </button>
                  <button
                    onClick={() => setActivePreviewType(null)}
                    className="w-8 h-8 rounded-lg border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600 flex items-center justify-center hover:bg-zinc-50 transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Scrollable Modal Content */}
              <div className="p-8 overflow-y-auto flex-1 space-y-6">
                
                {/* --- 1. GRADE DE HORÁRIOS CONSOLIDADA --- */}
                {activePreviewType === 'grade' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl">
                      <p className="text-xs text-indigo-800 font-semibold leading-relaxed">
                        Este relatório apresenta a unificação de todas as alocações registradas agrupadas por período acadêmico. Verifique a conformidade de horários cruzados.
                      </p>
                    </div>

                    {/* Simple nested structure: Course -> Period -> Table */}
                    {courses.map(course => {
                      const courseAllocations = allocations.filter(a => a.courseId === course.id);
                      if (courseAllocations.length === 0) return null;

                      // Get active periods
                      const periods = Array.from(new Set(courseAllocations.map(a => a.period))).sort();

                      return (
                        <div key={course.id} className="space-y-4">
                          <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wide border-b border-zinc-100 pb-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded bg-indigo-500"></span>
                            {course.name} ({course.level})
                          </h3>

                          {periods.map(period => {
                            const periodAllocs = courseAllocations.filter(a => a.period === period);
                            return (
                              <div key={period} className="pl-4 border-l-2 border-zinc-100 space-y-2">
                                <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">{period}º Semestre</h4>
                                
                                <div className="bg-zinc-50/50 border border-zinc-150 rounded-xl overflow-hidden text-left">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-zinc-100/60 border-b border-zinc-150 text-[10px] uppercase font-bold text-zinc-500">
                                        <th className="p-3">Dia</th>
                                        <th className="p-3">Horário</th>
                                        <th className="p-3">Disciplina</th>
                                        <th className="p-3">Docente</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                      {periodAllocs.map(alloc => {
                                        const sub = subjects.find(s => s.id === alloc.subjectId);
                                        const teach = teachers.find(t => t.id === alloc.teacherId);
                                        return (
                                          <tr key={alloc.id} className="text-zinc-650 font-medium">
                                            <td className="p-3 font-bold uppercase text-[10px] text-zinc-500">{alloc.dayOfWeek}</td>
                                            <td className="p-3 font-mono">{alloc.timeSlotId.toUpperCase()}</td>
                                            <td className="p-3 font-black text-zinc-800 uppercase text-[10px]">{sub?.name || 'Não cadastrada'}</td>
                                            <td className="p-3 text-[10px]">
                                              {teach ? (
                                                <span className="font-bold text-[#32a041]">{teach.name}</span>
                                              ) : (
                                                <span className="text-rose-500 font-extrabold uppercase">Não Alocado</span>
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* --- 2. LOTAÇÃO DOCENTE --- */}
                {activePreviewType === 'lotacao' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-xl">
                      <p className="text-xs text-[#2d8a3e] font-semibold leading-relaxed">
                        Visualização completa dos docentes ativos no IFCE, suas respectivas funções e a relação de horas de aula em comparação com as suas metas regulamentares de regime de trabalho.
                      </p>
                    </div>

                    <div className="border border-zinc-150 bg-white rounded-2xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-zinc-50 border-b border-zinc-150 text-[10px] font-black uppercase text-zinc-500 tracking-wider">
                            <th className="p-4 pl-6">Nome / SIAPE</th>
                            <th className="p-4">Regime / Cargo</th>
                            <th className="p-4">Carga Alocada</th>
                            <th className="p-4 pr-6 text-right">Ocupação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                          {teachers.filter(t => t.status !== 'Inativo').map(teach => {
                            const currentHours = getTeacherAllocatedHours(teach.id);
                            const limitHours = getRoleBasedLimit(teach.role);
                            const occupancyRate = (currentHours / limitHours) * 100;
                            
                            // Colors for progress bar
                            let progressColor = 'bg-emerald-500';
                            let bgColor = 'bg-emerald-50 text-emerald-800';
                            if (occupancyRate > 100) {
                              progressColor = 'bg-rose-500';
                              bgColor = 'bg-rose-50 text-rose-800';
                            } else if (occupancyRate < 50) {
                              progressColor = 'bg-amber-500';
                              bgColor = 'bg-amber-50 text-amber-800';
                            }

                            return (
                              <tr key={teach.id} className="hover:bg-zinc-50/10">
                                <td className="p-4 pl-6">
                                  <p className="font-extrabold text-zinc-800 uppercase">{teach.name}</p>
                                  <p className="text-[10px] font-mono text-zinc-400">SIAPE: {teach.registration}</p>
                                </td>
                                <td className="p-4">
                                  <p className="font-bold text-zinc-600">{teach.regime}</p>
                                  <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">{teach.role}</p>
                                </td>
                                <td className="p-4 text-xs font-black">
                                  <span className="text-zinc-850">{currentHours}h</span>
                                  <span className="text-zinc-400 font-bold"> / {limitHours}h semanais</span>
                                </td>
                                <td className="p-4 pr-6 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                    <div className="w-24 bg-zinc-100 rounded-full h-1.5 hidden sm:block overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${progressColor}`} 
                                        style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                                      />
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${bgColor}`}>
                                      {occupancyRate.toFixed(0)}%
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- 3. QUADRO DE VAGAS E PENDÊNCIAS --- */}
                {activePreviewType === 'vagas' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-amber-50/50 border border-amber-150 rounded-xl flex gap-3 text-amber-850">
                      <AlertTriangle className="shrink-0 text-amber-600" size={18} />
                      <div className="text-xs font-semibold leading-relaxed">
                        Este relatório exibe disciplinas sem professor devidamente alocado ou professores que ultrapassaram a regulamentação do limite de carga horária.
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Vagas Sem Professor */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> 
                          Disciplinas Sem Docente
                        </h3>
                        
                        <div className="bg-white border border-rose-100 rounded-xl overflow-hidden divide-y divide-zinc-100">
                          {subjects.filter(sub => {
                            const isAllocated = allocations.some(a => a.subjectId === sub.id && a.teacherId);
                            const hasAllocationAtAll = allocations.some(a => a.subjectId === sub.id);
                            return sub.status !== 'Inativa' && (!isAllocated || !hasAllocationAtAll);
                          }).length === 0 ? (
                            <div className="p-6 text-center text-zinc-405 font-bold text-xs uppercase leading-none">
                              Nenhuma pendência encontrada!
                            </div>
                          ) : (
                            subjects.filter(sub => {
                              const isAllocated = allocations.some(a => a.subjectId === sub.id && a.teacherId);
                              const hasAllocationAtAll = allocations.some(a => a.subjectId === sub.id);
                              return sub.status !== 'Inativa' && (!isAllocated || !hasAllocationAtAll);
                            }).map(sub => (
                              <div key={sub.id} className="p-3.5 flex justify-between items-center hover:bg-rose-50/10">
                                <div>
                                  <p className="text-xs font-extrabold text-zinc-800 uppercase leading-none mb-1">{sub.name}</p>
                                  <p className="text-[10px] font-medium text-zinc-400">Código: {sub.code || sub.id.toUpperCase()}</p>
                                </div>
                                <span className="bg-rose-50 border border-rose-100 text-rose-700 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase">
                                  {sub.workload}h pendentes
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Professores com Sobrecarga */}
                      <div className="space-y-3">
                        <h3 className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> 
                          Docentes Sobrecarregados
                        </h3>

                        <div className="bg-white border border-amber-100 rounded-xl overflow-hidden divide-y divide-zinc-100">
                          {teachers.filter(t => getTeacherAllocatedHours(t.id) > getRoleBasedLimit(t.role)).length === 0 ? (
                            <div className="p-6 text-center text-zinc-405 font-bold text-xs uppercase leading-none">
                              Nenhum docente com excesso de horas!
                            </div>
                          ) : (
                            teachers.filter(t => getTeacherAllocatedHours(t.id) > getRoleBasedLimit(t.role)).map(teach => {
                              const hrs = getTeacherAllocatedHours(teach.id);
                              const limit = getRoleBasedLimit(teach.role);
                              return (
                                <div key={teach.id} className="p-3.5 flex justify-between items-center hover:bg-amber-50/10">
                                  <div>
                                    <p className="text-xs font-extrabold text-zinc-800 uppercase leading-none mb-1">{teach.name}</p>
                                    <p className="text-[10px] font-mono text-zinc-400">SIAPE: {teach.registration}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-black text-amber-700 leading-none mb-0.5">{hrs}h / {limit}h</p>
                                    <p className="text-[8px] font-black uppercase text-zinc-405 tracking-wider">Metas regulatórias</p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- 4. RESUMO GERENCIAL --- */}
                {activePreviewType === 'resumo' && (() => {
                  // Math calculations
                  const activeTeachers = teachers.filter(t => t.status !== 'Inativo');
                  const totalLimitsArray = activeTeachers.map(t => getRoleBasedLimit(t.role));
                  const sumLimits = totalLimitsArray.reduce((acc, curr) => acc + curr, 0) || 1;
                  const activeTeachersHours = activeTeachers.map(t => getTeacherAllocatedHours(t.id));
                  const sumAllocated = activeTeachersHours.reduce((acc, curr) => acc + curr, 0);
                  const averageOccupancy = (sumAllocated / sumLimits) * 100;

                  const totalSubjects = subjects.filter(s => s.status !== 'Inativa').length;
                  const unallocatedSubjectsCount = subjects.filter(s => {
                    const isAllocated = allocations.some(a => a.subjectId === s.id && a.teacherId);
                    const hasAllocationAtAll = allocations.some(a => a.subjectId === s.id);
                    return s.status !== 'Inativa' && (!isAllocated || !hasAllocationAtAll);
                  }).length;

                  return (
                    <div className="space-y-8">
                      {/* KPI cards in pre-preview layout */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        <div className="p-4 bg-zinc-50/50 border border-zinc-150 rounded-2xl">
                          <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                            <TrendingUp size={14} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ocupação Média</p>
                          <h4 className="text-2xl font-black text-zinc-800 tracking-tight mt-1">{averageOccupancy.toFixed(1)}%</h4>
                        </div>

                        <div className="p-4 bg-zinc-50/50 border border-zinc-150 rounded-2xl">
                          <div className="w-8 h-8 rounded bg-rose-100 text-rose-800 flex items-center justify-center mb-3">
                            <AlertTriangle size={14} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Vagas Pendentes</p>
                          <h4 className="text-2xl font-black text-rose-700 tracking-tight mt-1">{unallocatedSubjectsCount} slots</h4>
                        </div>

                        <div className="p-4 bg-zinc-50/50 border border-zinc-150 rounded-2xl">
                          <div className="w-8 h-8 rounded bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                            <Users size={14} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Docentes Ativos</p>
                          <h4 className="text-2xl font-black text-zinc-800 tracking-tight mt-1">{activeTeachers.length} pessoas</h4>
                        </div>

                        <div className="p-4 bg-zinc-50/50 border border-zinc-150 rounded-2xl">
                          <div className="w-8 h-8 rounded bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                            <BookOpen size={14} />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Disciplinas Ativas</p>
                          <h4 className="text-2xl font-black text-zinc-800 tracking-tight mt-1">{totalSubjects} ativas</h4>
                        </div>
                      </div>

                      {/* Audit summaries */}
                      <div className="space-y-2.5">
                        <h3 className="text-xs font-black text-zinc-800 uppercase tracking-widest">Resumo Analítico da Gestão</h3>
                        <div className="bg-zinc-50/30 border border-zinc-155 p-5 rounded-2xl space-y-3 text-xs leading-relaxed text-zinc-700 font-medium">
                          <p>
                            O corpo docente ativo do IFCE Campus Tauá atualmente conta com <strong className="text-zinc-850 font-black">{activeTeachers.length} professores</strong> atuando nas divisões de ensino. A carga horária total vinculada à sala de aula neste semestre é de <strong className="text-zinc-850 font-black">{sumAllocated} horas semanais</strong>, correspondendo a uma taxa de utilização regulamentar de <strong className="text-zinc-850 font-black">{averageOccupancy.toFixed(1)}%</strong> da capacidade funcional permitida pelas portarias vigentes.
                          </p>
                          <p>
                            Foram reportadas <strong className="text-rose-600 font-bold">{unallocatedSubjectsCount} vagas com ausência de alocação de docentes</strong>. Recomenda-se a reavaliação de novas contratações temporárias ou remanejamento interno de carga horária para cumprimento integral das ementas pedagógicas regulamentadas.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-zinc-100 bg-zinc-50/30 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setActivePreviewType(null)}
                  className="px-6 h-10 border border-zinc-200 hover:bg-zinc-100 rounded-xl text-xs font-black uppercase text-zinc-700 tracking-wider transition-all"
                >
                  Fechar Painel
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

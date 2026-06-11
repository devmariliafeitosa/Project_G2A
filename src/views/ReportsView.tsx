import React, { useState, useMemo } from 'react';
import { Search, Download, FileText, ArrowLeft, RefreshCw, BarChart3, AlertTriangle, Activity, BookOpen, Users, ClipboardList, FileBadge, Building2, Calendar, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Course, Subject, User, ScheduleEntry, ReportHistory } from '../index';

const ReportsView = ({ 
  courses, 
  teachers, 
  subjects, 
  schedules,
  reportHistory,
  onAddHistory
}: { 
  courses: Course[], 
  teachers: User[], 
  subjects: Subject[], 
  schedules: ScheduleEntry[],
  reportHistory: ReportHistory[],
  onAddHistory: (reportName: string) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const reports = [
    {
      id: 'horarios',
      title: 'Grade de Horários Consolidada',
      description: 'Exportação da grade unificada por curso, semestre, turno ou docente.',
      icon: Calendar,
      color: 'bg-indigo-50 text-indigo-600',
      update: 'Há 5 minutos'
    },
    {
      id: 'lotacao',
      title: 'Lotação Docente',
      description: 'Detalhado SIAPE, área, disciplinas e percentual de ocupação.',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600',
      update: 'Hoje, 08:30'
    },
    {
      id: 'vagas',
      title: 'Quadro de Vagas e Pendências',
      description: 'Análise técnica de disciplinas sem docente ou com sobrecarga.',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600',
      update: 'Em tempo real'
    },
    {
      id: 'gerencial',
      title: 'Resumo Gerencial do Campus',
      description: 'Consolidado de indicadores, ocupação média e alertas críticos.',
      icon: BarChart3,
      color: 'bg-rose-50 text-rose-600',
      update: 'Semanal'
    }
  ];

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = useMemo(() => {
    const totalTeachers = teachers.length;
    const totalSubjects = subjects.length;
    const assignedSubjects = new Set(schedules.map(s => s.subjectId)).size;
    const vacancies = totalSubjects - assignedSubjects;
    
    // Average occupation (Workload hours / limit)
    const occupationSum = teachers.reduce((sum, t) => {
      const teacherSchedules = schedules.filter(s => s.teacherId === t.id);
      const currentWorkload = teacherSchedules.length * 2; // Rough estimate 2h per slot
      const limit = 20; // Default
      return sum + (currentWorkload / limit);
    }, 0);
    
    const avgOccupation = totalTeachers > 0 ? (occupationSum / totalTeachers) * 100 : 0;

    return { totalTeachers, totalSubjects, avgOccupation: avgOccupation.toFixed(1), vacancies };
  }, [teachers, subjects, schedules]);

  const handleDownload = (reportName: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      onAddHistory(reportName);
      alert(`Download de "${reportName}" iniciado com sucesso!`);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Relatórios Institucionais</h1>
          <p className="text-zinc-500 text-sm font-sans">Geração e exportação de documentos oficiais do sistema para o IFCE Campus Tauá.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="h-10 bg-white border border-zinc-200 rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/30">
            <option>Semestre 2024.1</option>
            <option>Semestre 2023.2</option>
          </select>
          <button className="h-10 px-4 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2">
            <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} /> Atualizar Dados
          </button>
        </div>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Pesquisar relatórios..."
          className="w-full h-14 bg-white border border-zinc-200 rounded-2xl pl-12 pr-4 text-sm outline-none focus:border-primary/20 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReports.map(report => (
          <motion.div 
            key={report.id}
            whileHover={{ y: -4 }}
            className="bg-white border border-zinc-100 rounded-3xl p-8 space-y-6 shadow-sm hover:shadow-xl hover:border-primary/10 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className={`p-4 rounded-2xl ${report.color}`}>
                <report.icon size={28} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Última Atualização</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase">{report.update}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-zinc-900 leading-tight">{report.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-sans">{report.description}</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => { setSelectedReport(report.id); setIsPreviewing(true); }}
                className="flex-1 h-12 border border-zinc-200 text-zinc-500 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-50 transition-all"
              >
                Visualizar Prévia
              </button>
              <button 
                onClick={() => handleDownload(report.title)}
                className="flex-1 h-12 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20"
              >
                Baixar PDF
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-zinc-50 rounded-3xl p-8 space-y-6 border border-zinc-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">Histórico de Exportações</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Acesso aos últimos documentos</p>
        </div>
        <div className="space-y-2">
          {reportHistory.map(h => (
            <div key={h.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-zinc-50 group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-400">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-800">{h.name}</p>
                  <p className="text-[10px] text-zinc-400 font-sans mt-0.5">Gerado por {h.user} em {h.date}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(h.name)}
                className="text-zinc-300 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
              >
                <Download size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isPreviewing && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl p-10 space-y-8 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900">Pré-visualização</h3>
                  <p className="text-sm text-zinc-500 font-sans">Documento Institucional • IFCE Campus Tauá</p>
                </div>
                <button onClick={() => setIsPreviewing(false)} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-full transition-all">
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="aspect-[1/1.4] w-full bg-zinc-50 border border-zinc-200 rounded-3xl p-12 overflow-hidden shadow-inner flex flex-col items-center">
                <div className="w-full text-center space-y-4 border-b border-zinc-200 pb-8">
                  <div className="w-16 h-16 bg-primary/10 mx-auto rounded-full flex items-center justify-center text-primary">
                    <Building2 size={32} />
                  </div>
                  <div>
                    <h4 className="font-black text-xl uppercase tracking-widest text-zinc-900">IFCE CAMPUS TAUÁ</h4>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Gestão Acadêmica e Lotação Docente</p>
                  </div>
                </div>

                <div className="w-full py-10 space-y-8">
                  <div className="flex justify-between items-end border-b border-zinc-100 pb-4">
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Relatório</p>
                      <h5 className="text-2xl font-bold text-zinc-800">{reports.find(r => r.id === selectedReport)?.title}</h5>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Referência</p>
                      <p className="text-sm font-bold text-zinc-700">Semestre 2024.1</p>
                    </div>
                  </div>

                  {selectedReport === 'gerencial' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-white border border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Ocupação Média</p>
                        <p className="text-4xl font-black text-primary">{stats.avgOccupation}%</p>
                      </div>
                      <div className="p-6 bg-white border border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Vagas em Aberto</p>
                        <p className="text-4xl font-black text-rose-500">{stats.vacancies}</p>
                      </div>
                      <div className="p-6 bg-white border border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Docentes Ativos</p>
                        <p className="text-4xl font-black text-zinc-800">{stats.totalTeachers}</p>
                      </div>
                      <div className="p-6 bg-white border border-zinc-200 rounded-3xl flex flex-col items-center justify-center gap-2">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase">Disciplinas</p>
                        <p className="text-4xl font-black text-zinc-800">{stats.totalSubjects}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">Filtros Aplicados</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase">Todos os Cursos</span>
                      <span className="px-3 py-1 bg-zinc-100 rounded-full text-[10px] font-bold text-zinc-500 uppercase">Geral</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto w-full pt-8 border-t border-zinc-100 flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  <p>Gerado em: {new Date().toLocaleDateString()}</p>
                  <p>Gestão Administrativa v1.0</p>
                  <p>Página 1 de 1</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => handleDownload(reports.find(r => r.id === selectedReport)?.title || 'Relatório')}
                  disabled={isGenerating}
                  className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:opacity-90 transition-all"
                >
                  {isGenerating ? <RefreshCw size={18} className="animate-spin" /> : <><Download size={18} /> BAIXAR PDF OFICIAL</>}
                </button>
                <button onClick={() => setIsPreviewing(false)} className="flex-1 h-14 bg-zinc-100 text-zinc-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all">
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
export default ReportsView;

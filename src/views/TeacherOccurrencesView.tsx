import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, AlertTriangle, UserX, ArrowRightLeft, History, UserCheck, X, Check, ClipboardList, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Occurrence, OccurrenceType, OccurrenceStatus, User, Subject } from '../index';

const TeacherOccurrencesView = ({ 
  occurrences,
  teachers,
  subjects,
  onCreateOccurrence,
  onUpdateOccurrence
}: { 
  occurrences: Occurrence[],
  teachers: User[],
  subjects: Subject[],
  onCreateOccurrence: (occ: Omit<Occurrence, 'id' | 'status'>) => void,
  onUpdateOccurrence: (id: string, updates: Partial<Occurrence>) => void
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<OccurrenceType | 'Todos'>('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [viewHistoryId, setViewHistoryId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Occurrence>>({
    type: 'Afastamento',
    needReplacement: false,
    affectedSubjectIds: []
  });

  const filteredOccurrences = useMemo(() => {
    return occurrences.filter(occ => {
      const teacher = teachers.find(t => t.id === occ.teacherId);
      const matchesSearch = teacher?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           occ.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'Todos' || occ.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [occurrences, teachers, searchTerm, typeFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedOccurrence) {
      onUpdateOccurrence(selectedOccurrence.id, formData);
    } else {
      onCreateOccurrence(formData as any);
    }
    setIsModalOpen(false);
    setSelectedOccurrence(null);
    setFormData({ type: 'Afastamento', needReplacement: false, affectedSubjectIds: [] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            <ClipboardList className="text-primary" />
            Ocorrências Docentes
          </h1>
          <p className="text-zinc-500 text-sm font-sans">Gerenciamento de afastamentos, substituições e movimentações institucionais.</p>
        </div>
        <button 
          onClick={() => { setSelectedOccurrence(null); setFormData({ type: 'Afastamento', needReplacement: false, affectedSubjectIds: [] }); setIsModalOpen(true); }}
          className="h-10 px-6 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={16} /> Nova Ocorrência
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por docente ou motivo..."
            className="w-full h-12 bg-white border border-zinc-200 rounded-xl pl-12 pr-4 text-sm outline-none focus:border-primary/20 transition-all"
          />
        </div>
        <select 
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as any)}
          className="h-12 bg-white border border-zinc-200 rounded-xl px-4 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-primary/20"
        >
          <option value="Todos">Todos os Tipos</option>
          <option value="Afastamento">Afastamento</option>
          <option value="Substituição">Substituição</option>
          <option value="Alteração de Vínculo">Alteração de Vínculo</option>
          <option value="Remanejamento">Remanejamento</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredOccurrences.map(occ => {
          const teacher = teachers.find(t => t.id === occ.teacherId);
          const substitute = teachers.find(t => t.id === occ.substituteTeacherId);
          
          return (
            <motion.div 
              layout
              key={occ.id}
              className="bg-white border border-zinc-100 rounded-2xl p-6 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        occ.type === 'Afastamento' ? 'bg-amber-50 text-amber-600' :
                        occ.type === 'Substituição' ? 'bg-indigo-50 text-indigo-600' :
                        occ.type === 'Alteração de Vínculo' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {occ.type}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                        occ.status === 'Ativa' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-zinc-400'
                      }`}>
                        {occ.status}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      Ref: {occ.id}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Docente</p>
                      <p className="text-sm font-bold text-zinc-900">{teacher?.name || 'Desconhecido'}</p>
                      <p className="text-[10px] text-zinc-500 font-sans mt-0.5">SIAPE: {teacher?.siape || '---'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Período</p>
                      <p className="text-sm font-bold text-zinc-700">
                        {new Date(occ.startDate).toLocaleDateString('pt-BR')} 
                        {occ.endDate ? ` — ${new Date(occ.endDate).toLocaleDateString('pt-BR')}` : ' (Indeterminado)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Motivo</p>
                      <p className="text-sm text-zinc-600 font-sans italic">"{occ.reason}"</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-50 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                       <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Impacto:</p>
                       <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded">
                        {occ.affectedSubjectIds.length} Disciplina(s) afetada(s)
                       </span>
                    </div>
                    {occ.substituteTeacherId && (
                      <div className="flex items-center gap-2">
                         <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Substituto:</p>
                         <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <UserCheck size={10} /> {substitute?.name}
                         </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2 justify-center">
                  <button 
                    onClick={() => { setSelectedOccurrence(occ); setFormData(occ); setIsModalOpen(true); }}
                    className="h-9 px-4 bg-zinc-50 text-zinc-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center gap-2"
                  >
                    <Edit size={12} /> Editar
                  </button>
                  <button 
                    onClick={() => setViewHistoryId(viewHistoryId === occ.id ? null : occ.id)}
                    className={`h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                      viewHistoryId === occ.id ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                    }`}
                  >
                    <History size={12} /> Log
                  </button>
                  {occ.status === 'Ativa' && (
                    <button 
                      onClick={() => onUpdateOccurrence(occ.id, { status: 'Concluída' })}
                      className="h-9 px-4 border border-zinc-100 text-zinc-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-emerald-200 hover:text-emerald-500 transition-all flex items-center gap-2"
                    >
                      <Check size={12} /> Encerrar
                    </button>
                  )}
                </div>
              </div>

              {viewHistoryId === occ.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mt-6 pt-6 border-t border-zinc-100 overflow-hidden"
                >
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                    <History size={12} /> Histórico de Alterações
                  </h4>
                  <div className="space-y-3">
                    {occ.auditLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-3 bg-zinc-50 rounded-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 mt-1.5" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] font-bold text-zinc-900">{log.action}</span>
                            <span className="text-[9px] text-zinc-400 font-sans">
                              {new Date(log.timestamp).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-500 font-sans">Realizado por: <span className="font-bold">{log.user}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}

        {filteredOccurrences.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center bg-white border border-dashed border-zinc-200 rounded-3xl text-zinc-300 gap-4">
            <ClipboardList size={48} className="opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">Nenhuma ocorrência encontrada.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-50 w-full max-w-2xl rounded-[40px] shadow-2xl p-8 space-y-6"
            >
              <header className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">{selectedOccurrence ? 'Editar Ocorrência' : 'Nova Ocorrência'}</h3>
                  <p className="text-sm text-zinc-500">Preencha os dados oficiais para registro institucional.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-200 rounded-full transition-all">
                  <X size={20} />
                </button>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tipo de Ocorrência</label>
                    <select 
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as OccurrenceType })}
                      className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/20"
                      required
                    >
                      <option value="Afastamento">Afastamento</option>
                      <option value="Substituição">Substituição</option>
                      <option value="Alteração de Vínculo">Alteração de Vínculo</option>
                      <option value="Remanejamento">Remanejamento</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Docente Principal</label>
                    <select 
                      value={formData.teacherId}
                      onChange={e => setFormData({ ...formData, teacherId: e.target.value })}
                      className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/20"
                      required
                    >
                      <option value="">Selecione o docente</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.siape})</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Início</label>
                    <input 
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/20"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Término Previsto</label>
                    <input 
                      type="date"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/20"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Motivo e Descrição</label>
                  <textarea 
                    value={formData.reason}
                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full min-h-[80px] bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary/20 resize-none"
                    placeholder="Ex: Licença médica conforme atestado..."
                    required
                  />
                </div>

                {formData.type === 'Substituição' && (
                  <div className="space-y-4 p-6 bg-indigo-50/50 border border-indigo-100 rounded-3xl">
                     <div className="flex items-center gap-2 text-indigo-600 mb-2">
                        <UserCheck size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Configuração de Substituição</span>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Docente Substituto</label>
                        <select 
                          value={formData.substituteTeacherId}
                          onChange={e => setFormData({ ...formData, substituteTeacherId: e.target.value })}
                          className="w-full h-12 bg-white border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-indigo-500/20"
                        >
                          <option value="">Selecione o substituto</option>
                          {teachers.filter(t => t.id !== formData.teacherId).map(t => (
                            <option key={t.id} value={t.id}>{t.name} (Vagas: {20 - (t.disciplinasMinistradas?.length || 0) * 2}h)</option>
                          ))}
                        </select>
                     </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 h-14 bg-primary text-white rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20"
                  >
                    Salvar Ocorrência
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-14 bg-white border border-zinc-200 text-zinc-500 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-zinc-50 transition-all"
                  >
                    Descartar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default TeacherOccurrencesView;

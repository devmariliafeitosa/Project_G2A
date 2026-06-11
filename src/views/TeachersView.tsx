import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Trash2, Edit, Eye, CheckCircle2, AlertCircle, UserPlus, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WorkRegime, LeaveType } from '../index';
import { AREAS_DE_ATUACAO } from '../areasDeAtuacao';
import { User, UserRole } from '../index';

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
    regime: WorkRegime.DE,
    leaveType: LeaveType.Nenhum,
    hasReducedWorkload: false,
    hasTeachingRole: false,
    role: 'Professor' as UserRole,
    status: 'Ativo' as 'Ativo' | 'Inativo'
  });

  const [formErrors, setFormErrors] = useState<string[]>([]);

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
    const requiredFields = [
      { key: 'name', label: 'Nome Completo' },
      { key: 'email', label: 'E-mail Institucional' },
      { key: 'registration', label: 'SIAPE' },
      { key: 'birthDate', label: 'Data de Nascimento' },
      { key: 'ingressoYear', label: 'Ano de Ingresso' },
      { key: 'areaAtuacao', label: 'Área de Atuação' },
      { key: 'role', label: 'Função/Cargo' },
      { key: 'regime', label: 'Regime de Trabalho' },
      { key: 'status', label: 'Status' }
    ];

    const errors = requiredFields
      .filter(f => !formData[f.key as keyof typeof formData])
      .map(f => f.label);

    if (formData.email && !formData.email.endsWith('@ifce.edu.br')) {
      errors.push('E-mail deve ser institucional (@ifce.edu.br)');
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      setNotification({ message: errors[0], type: 'alert' });
      return;
    }

    setFormErrors([]);
    
    if (editingId) {
      onUpdateTeacher({ ...formData, id: editingId });
      setNotification({ message: 'Docente atualizado com sucesso!', type: 'success' });
    } else {
      onAddTeacher(formData);
      setNotification({ message: 'Docente cadastrado com sucesso!', type: 'success' });
    }

    setFormData({
      name: '', email: '', registration: '', ingressoYear: '', birthDate: '', 
      areaAtuacao: '', regime: WorkRegime.DE, 
      leaveType: LeaveType.Nenhum, hasReducedWorkload: false, hasTeachingRole: false, role: UserRole.Professor,
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
      regime: teacher.regime,
      leaveType: teacher.leaveType,
      hasReducedWorkload: teacher.hasReducedWorkload,
      hasTeachingRole: (teacher as any).hasTeachingRole || false,
      role: teacher.role as UserRole,
      status: (teacher.status || 'Ativo') as 'Ativo' | 'Inativo'
    });
    setEditingId(teacher.id);
    setIsAdding(true);
    setFormErrors([]);
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
              areaAtuacao: '', regime: WorkRegime.DE, 
              leaveType: LeaveType.Nenhum, hasReducedWorkload: false, hasTeachingRole: false, role: UserRole.Professor,
              status: 'Ativo'
            });
            setEditingId(null);
            setIsAdding(true);
            setFormErrors([]);
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
          <option value="Afastamento">Afastamento</option>
          <option value="Substituição">Substituição</option>
          <option value="Alteração de Vínculo">Alt. de Vínculo</option>
          <option value="Remanejamento">Remanejado</option>
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
              <input value={formData.name} onChange={e => { setFormData({...formData, name: e.target.value}); setFormErrors(prev => prev.filter(err => err !== 'Nome Completo')); }} className={`w-full border ${formErrors.includes('Nome Completo') ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30`} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Data de Nascimento</label>
              <input type="date" value={formData.birthDate} onChange={e => { setFormData({...formData, birthDate: e.target.value}); setFormErrors(prev => prev.filter(err => err !== 'Data de Nascimento')); }} className={`w-full border ${formErrors.includes('Data de Nascimento') ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30`} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">E-mail Institucional</label>
              <input 
                value={formData.email} 
                onChange={e => { 
                  setFormData({...formData, email: e.target.value}); 
                  setFormErrors(prev => prev.filter(err => !err.includes('E-mail') && !err.includes('@ifce.edu.br'))); 
                }} 
                className={`w-full border ${formErrors.some(err => err.includes('E-mail') || err.includes('@ifce.edu.br')) ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30`} 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Área de Atuação</label>
              <select 
                value={formData.areaAtuacao} 
                onChange={e => { setFormData({...formData, areaAtuacao: e.target.value}); setFormErrors(prev => prev.filter(err => err !== 'Área de Atuação')); }} 
                className={`w-full border ${formErrors.includes('Área de Atuação') ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30 bg-white`}
              >
                <option value="" disabled>Selecione uma área...</option>
                {AREAS_DE_ATUACAO.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Ano de Ingresso</label>
              <input type="number" value={formData.ingressoYear} onChange={e => { setFormData({...formData, ingressoYear: e.target.value}); setFormErrors(prev => prev.filter(err => err !== 'Ano de Ingresso')); }} className={`w-full border ${formErrors.includes('Ano de Ingresso') ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30`} placeholder="Ex: 2020" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">SIAPE</label>
              <input value={formData.registration} onChange={e => { setFormData({...formData, registration: e.target.value}); setFormErrors(prev => prev.filter(err => err !== 'SIAPE')); }} className={`w-full border ${formErrors.includes('SIAPE') ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30`} placeholder="Ex: 1234567" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Função/Cargo</label>
              <select value={formData.role} onChange={e => { setFormData({...formData, role: e.target.value as UserRole}); setFormErrors(prev => prev.filter(err => err !== 'Função/Cargo')); }} className={`w-full border ${formErrors.includes('Função/Cargo') ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30`}>
                <option value="Professor">Professor</option>
                <option value="Coordenador">Coordenador</option>
                <option value="Diretor">Diretor</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Regime de Trabalho</label>
              <select value={formData.regime} onChange={e => { setFormData({...formData, regime: e.target.value as WorkRegime}); setFormErrors(prev => prev.filter(err => err !== 'Regime de Trabalho')); }} className={`w-full border ${formErrors.includes('Regime de Trabalho') ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30`}>
                {Object.values(WorkRegime).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-sans">Status</label>
              <select value={formData.status} onChange={e => { setFormData({...formData, status: e.target.value as any}); setFormErrors(prev => prev.filter(err => err !== 'Status')); }} className={`w-full border ${formErrors.includes('Status') ? 'border-rose-300 bg-rose-50' : 'border-zinc-200'} h-9 px-3 rounded text-sm outline-none focus:border-primary/30`}>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Afastamento">Afastamento</option>
                <option value="Substituição">Substituição</option>
                <option value="Alteração de Vínculo">Alteração de Vínculo</option>
                <option value="Remanejamento">Remanejamento</option>
              </select>
            </div>
          </div>
          {formData.role === 'Coordenador' && (
            <label className="flex items-center gap-2 text-xs font-bold text-zinc-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={(formData as any).hasTeachingRole || false}
                onChange={e => setFormData(p => ({ ...p, hasTeachingRole: e.target.checked }))}
                className="rounded accent-primary"
              />
              Também possui atividades docentes (habilita Área do Professor)
            </label>
          )}
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
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Status</th>
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
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    teacher.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' :
                    teacher.status === 'Afastamento' ? 'bg-rose-50 text-rose-600' :
                    teacher.status === 'Substituição' ? 'bg-amber-50 text-amber-600' :
                    teacher.status === 'Inativo' ? 'bg-zinc-100 text-zinc-400' :
                    'bg-sky-50 text-sky-600'
                  }`}>
                    {teacher.status || 'Ativo'}
                  </span>
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
                <td colSpan={5} className="px-6 py-16 text-center text-zinc-400 text-sm font-medium italic">
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
export default TeachersView;

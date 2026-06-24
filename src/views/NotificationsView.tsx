import React, { useState, useMemo } from 'react';
import { Bell, Archive, X, AlertCircle, Info, AlertTriangle, CheckCircle2, Filter, Trash2, UserPlus, Activity, LogOut, Eye, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification, NotificationType, NotificationStatus, NotificationPriority } from '../index';

const NotificationsView = ({ 
  notifications,
  onUpdateNotification,
  onDeleteNotification,
  onNavigate
}: { 
  notifications: Notification[],
  onUpdateNotification: (id: string, updates: Partial<Notification>) => void,
  onDeleteNotification: (id: string) => void,
  onNavigate: (path: string) => void
}) => {
  const [filter, setFilter] = useState<'Todas' | 'Não lidas' | 'Alta prioridade' | 'Alertas' | 'Solicitações' | 'Arquivada'>('Todas');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const filteredNotifications = useMemo(() => {
    let list = [...notifications];
    
    // Ordered by priority (Alta first) then by date
    list.sort((a, b) => {
      const priorityMap = { 'Alta': 0, 'Média': 1, 'Baixa': 2 };
      if (priorityMap[a.priority] !== priorityMap[b.priority]) {
        return priorityMap[a.priority] - priorityMap[b.priority];
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    if (filter === 'Não lidas') return list.filter(n => n.status === 'Não lida');
    if (filter === 'Alta prioridade') return list.filter(n => n.priority === 'Alta');
    if (filter === 'Alertas') return list.filter(n => n.type === 'Alerta');
    if (filter === 'Solicitações') return list.filter(n => n.type === 'Solicitação');
    if (filter === 'Arquivada') return list.filter(n => n.status === 'Arquivada');
    
    // 'Todas' shows everything EXCEPT archived by default? 
    // Requirement says "Todas", "Histórico arquivado". So "Todas" usually means active ones.
    return list.filter(n => n.status !== 'Arquivada');
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => n.status === 'Não lida').length;

  const handleDeleteClick = (id: string) => {
    const skip = localStorage.getItem('skip_delete_notif_confirm') === 'true';
    if (skip) {
      onDeleteNotification(id);
    } else {
      setConfirmDeleteId(id);
    }
  };

  const confirmDelete = () => {
    if (confirmDeleteId) {
      onDeleteNotification(confirmDeleteId);
      if (dontShowAgain) {
        localStorage.setItem('skip_delete_notif_confirm', 'true');
      }
      setConfirmDeleteId(null);
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'Alerta': return <AlertCircle size={18} className="text-amber-500" />;
      case 'Solicitação': return <UserPlus size={18} className="text-primary" />;
      case 'Atualização': return <Activity size={18} className="text-emerald-500" />;
      case 'Erro': return <LogOut size={18} className="text-rose-500" />;
      default: return <Bell size={18} className="text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
            Notificações
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                {unreadCount} novas
              </span>
            )}
          </h1>
          <p className="text-zinc-500 text-sm font-sans">Acompanhe alertas operacionais e solicitações pendentes.</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 pb-2">
        {['Todas', 'Não lidas', 'Alta prioridade', 'Alertas', 'Solicitações', 'Arquivada'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${
              filter === f 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white text-zinc-500 border-zinc-200 hover:border-primary/30'
            }`}
          >
            {f === 'Arquivada' ? 'Histórico Arquivado' : f}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <motion.div 
              layout
              key={notif.id} 
              className={`bg-white border rounded-2xl p-6 flex flex-col md:flex-row gap-6 hover:shadow-md transition-all group relative ${notif.status === 'Não lida' ? 'border-primary/20 bg-primary/5 shadow-sm' : 'border-zinc-100'}`}
            >
              {notif.status === 'Não lida' && (
                <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full" />
              )}
              
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  notif.priority === 'Alta' ? 'bg-rose-50' : 
                  notif.priority === 'Média' ? 'bg-amber-50' : 'bg-zinc-50'
                }`}>
                  {getTypeIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${notif.priority === 'Alta' ? 'text-rose-500' : 'text-zinc-400'}`}>
                    Prioridade {notif.priority}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest">
                    {new Date(notif.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
                <h3 className={`text-base font-bold ${notif.status === 'Não lida' ? 'text-zinc-900' : 'text-zinc-600'}`}>
                  {notif.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">{notif.description}</p>
                
                <div className="pt-2 flex flex-wrap gap-2">
                 {notif.status === NotificationStatus.NaoLida && (
  <button
    onClick={() =>
      onUpdateNotification(notif.id, {
        status: NotificationStatus.Lida
      })
    }
    className="h-8 px-4 bg-primary text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all"
  >
    Marcar como lida
  </button>
)}

      {notif.relatedPath && (
        <button
          onClick={() => {
            onUpdateNotification(notif.id, {
              status: NotificationStatus.Lida
            });
            onNavigate(notif.relatedPath!);
          }}
          className="h-8 px-4 bg-zinc-100 text-zinc-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2"
        >
          <Eye size={12} />
          Ver Relacionado
        </button>
      )}

      {notif.status !== NotificationStatus.Arquivada ? (
        <button
          onClick={() =>
            onUpdateNotification(notif.id, {
              status: NotificationStatus.Arquivada
            })
          }
          className="h-8 px-4 border border-zinc-200 text-zinc-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-zinc-50 hover:text-zinc-600 transition-all flex items-center gap-2"
        >
          <Archive size={12} />
          Arquivar
        </button>
      ) : (
        <button
          onClick={() =>
            onUpdateNotification(notif.id, {
              status: NotificationStatus.Lida
            })
          }
          className="h-8 px-4 border border-zinc-200 text-zinc-400 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-zinc-50 hover:text-zinc-600 transition-all"
        >
          Desarquivar
        </button>
      )}
                   <button 
                    onClick={() => handleDeleteClick(notif.id)}
                    className="h-8 px-4 text-zinc-300 hover:text-rose-500 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center bg-white border border-dashed border-zinc-200 rounded-3xl text-zinc-300 gap-4">
            <Bell size={48} className="opacity-20" />
            <p className="text-sm font-bold uppercase tracking-widest">Nenhuma notificação pendente no momento.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2 font-sans">Excluir Notificação?</h3>
              <p className="text-sm text-zinc-500 mb-6 font-medium leading-relaxed font-sans">
                Esta ação não pode ser desfeita. A notificação será removida permanentemente do sistema.
              </p>

              <div className="flex items-center gap-3 mb-6 bg-zinc-50 p-4 rounded-2xl group cursor-pointer" onClick={() => setDontShowAgain(!dontShowAgain)}>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${dontShowAgain ? 'bg-primary border-primary' : 'border-zinc-300 bg-white group-hover:border-zinc-400'}`}>
                  {dontShowAgain && <Check size={14} className="text-white" />}
                </div>
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-sans">Não perguntar novamente</span>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={confirmDelete}
                  className="flex-1 h-12 bg-rose-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 font-sans"
                >
                  Excluir
                </button>
                <button 
                  onClick={() => { setConfirmDeleteId(null); setDontShowAgain(false); }}
                  className="flex-1 h-12 bg-zinc-100 text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all font-sans"
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
export default NotificationsView;

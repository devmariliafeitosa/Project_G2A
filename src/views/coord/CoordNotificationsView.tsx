import React, { useState, useMemo } from 'react';
import { Bell, Archive, Eye, UserX, ArrowRightLeft, RefreshCw, X, AlertCircle, Info, AlertTriangle, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationType, NotificationStatus, NotificationPriority } from '../../index';
import type { Notification } from '../../index';

const CoordNotificationsView = ({ 
  notifications,
  onUpdateNotification,
  onDeleteNotification,
  onNavigate
}: { 
  notifications: Notification[],
  onUpdateNotification: (id: string, updates: Partial<Notification>) => void,
  onDeleteNotification: (id: string) => void,
  onNavigate: (path: any) => void
}) => {
  const [filter, setFilter] = useState<'Todas' | 'Não lidas' | 'Alta prioridade' | 'Preferências' | 'Alocações' | 'Afastamentos' | 'Alertas' | 'Arquivada'>('Todas');

  const filteredNotifications = useMemo(() => {
    let list = [...notifications];
    
    list.sort((a, b) => {
  const priorityMap: Record<NotificationPriority, number> = {
    Alta: 0,
    Média: 1,
    Baixa: 2
  };

  if (priorityMap[a.priority] !== priorityMap[b.priority]) {
    return priorityMap[a.priority] - priorityMap[b.priority];
  }

  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
});

    if (filter === 'Não lidas') return list.filter(n => n.status === 'Não lida');
    if (filter === 'Alta prioridade') return list.filter(n => n.priority === 'Alta');
    if (filter === 'Preferências') return list.filter(n => n.type === NotificationType.Preferencia);
    if (filter === 'Alocações') return list.filter(n => n.type === NotificationType.Alocacao);
    if (filter === 'Afastamentos') return list.filter(n => n.type === NotificationType.Afastamento);
    if (filter === 'Alertas') return list.filter(n => n.type === NotificationType.Alerta);
    if (filter === 'Arquivada') return list.filter(n => n.status === 'Arquivada');
    
    // Default 'Todas' shows everything except archived
    return list.filter(n => n.status !== 'Arquivada');
  }, [notifications, filter]);

  const unreadCount = notifications.filter(n => n.status === 'Não lida').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Alerta': return <AlertTriangle size={18} className="text-amber-500" />;
      case 'Preferência': return <MessageSquare size={18} className="text-emerald-500" />;
      case 'Afastamento': return <UserX size={18} className="text-rose-500" />;
      case 'Alocação': return <ArrowRightLeft size={18} className="text-blue-500" />;
      case 'Atualização': return <RefreshCw size={18} className="text-indigo-500" />;
      default: return <Bell size={18} className="text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight flex items-center gap-4">
            Notificações
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                {unreadCount} PENDENTES
              </span>
            )}
          </h1>
          <p className="text-zinc-500 text-sm font-medium">Acompanhe as ocorrências e solicitações do curso.</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {['Todas', 'Não lidas', 'Alta prioridade', 'Preferências', 'Alocações', 'Afastamentos', 'Alertas', 'Arquivada'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
              filter === f 
                ? 'bg-[#32a041] text-white border-[#32a041] shadow-lg shadow-emerald-900/10' 
                : 'bg-white text-zinc-500 border-zinc-200 hover:border-[#32a041]/30'
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
              className={`bg-white border rounded-[2rem] p-8 flex flex-col md:flex-row gap-8 hover:shadow-xl transition-all group relative ${notif.status === 'Não lida' ? 'border-emerald-500/20 bg-emerald-50/10 shadow-sm' : 'border-zinc-50'}`}
            >
              {notif.status === 'Não lida' && (
                <div className="absolute top-8 left-4 w-2 h-2 bg-emerald-500 rounded-full" />
              )}
              
              <div className="flex-shrink-0">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  notif.priority === 'Alta' ? 'bg-rose-50' : 
                  notif.priority === 'Média' ? 'bg-amber-50' : 'bg-zinc-50'
                }`}>
                  {getTypeIcon(notif.type)}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${notif.priority === 'Alta' ? 'text-rose-500' : 'text-zinc-300'}`}>
                    Prioridade {notif.priority}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {new Date(notif.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
                <h3 className={`text-xl font-black ${notif.status === 'Não lida' ? 'text-zinc-900' : 'text-zinc-600'}`}>
                  {notif.title}
                </h3>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-3xl">{notif.description}</p>
                
                <div className="pt-4 flex flex-wrap gap-3">
                  {notif.status === 'Não lida' && (
                    <button 
                      onClick={() => onUpdateNotification(notif.id, { status: NotificationStatus.Lida })}
                      className="h-10 px-6 bg-[#32a041] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all"
                    >
                      Marcar como lida
                    </button>
                  )}
                  {notif.relatedPath && (
                    <button 
                      onClick={() => {
                        onUpdateNotification(notif.id, { status: NotificationStatus.Lida });
                        onNavigate(notif.relatedPath);
                      }}
                      className="h-10 px-6 bg-zinc-100 text-zinc-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2"
                    >
                      <Eye size={14} /> Tratar ocorrência
                    </button>
                  )}
                  {notif.status !== 'Arquivada' ? (
                    <button 
                      onClick={() => onUpdateNotification(notif.id, { status: NotificationStatus.Arquivada })}
                      className="h-10 px-6 border border-zinc-200 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 hover:text-zinc-600 transition-all flex items-center gap-2"
                    >
                      <Archive size={14} /> Arquivar
                    </button>
                  ) : (
                    <button 
                      onClick={() => onUpdateNotification(notif.id, { status: NotificationStatus.Lida })}
                      className="h-10 px-6 border border-zinc-200 text-zinc-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 hover:text-zinc-600 transition-all"
                    >
                      Desarquivar
                    </button>
                  )}
                   <button 
                    onClick={() => onDeleteNotification(notif.id)}
                    className="h-10 px-6 text-zinc-300 hover:text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="py-32 flex flex-col items-center justify-center bg-white border border-dashed border-zinc-200 rounded-[3rem] text-zinc-300 gap-6">
            <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center opacity-40">
               <Bell size={48} />
            </div>
            <p className="text-sm font-black uppercase tracking-widest">Nenhuma notificação pendente no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default CoordNotificationsView;

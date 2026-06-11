import React from 'react';
import {
  GraduationCap, LayoutDashboard, Bell, BookOpen, Calendar,
  ArrowRightLeft, Users, FileText, Clock, ClipboardList, Settings,
  LogOut, User
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import type { User as UserType, Notification } from '../index';

export type CoordViewName =
  | 'dashboard'
  | 'notifications'
  | 'courses'
  | 'new-semester'
  | 'allocations'
  | 'teachers'
  | 'reports'
  | 'my-schedule'
  | 'my-subjects'
  | 'preferences'
  | 'profile';

interface CoordSidebarProps {
  user: UserType;
  currentView: CoordViewName;
  notifications: Notification[];
  onNavigate: (view: CoordViewName) => void;
  onLogout: () => void;
}

const CoordSidebar = ({ user, currentView, notifications, onNavigate, onLogout }: CoordSidebarProps) => {
  const unread = notifications.filter(n => n.status === 'Não lida').length;

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col fixed h-full z-20">
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3.5 mb-2">
          <div className="w-10 h-10 bg-[#32a041]/10 rounded-xl flex items-center justify-center text-[#32a041]">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="font-semibold text-zinc-900 text-xs leading-tight tracking-tight">Alocação Acadêmica</h1>
            <p className="text-[8px] font-black text-[#32a041] uppercase tracking-widest mt-0.5">IFCE Campus Tauá</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto pb-10">
        <div>
          <p className="px-4 text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">Funcionalidades</p>
          <div className="space-y-1">
            <SidebarItem icon={LayoutDashboard} label="Dashboard"       active={currentView === 'dashboard'}      onClick={() => onNavigate('dashboard')} />
            <SidebarItem icon={Bell}            label="Notificações"    active={currentView === 'notifications'}  onClick={() => onNavigate('notifications')} badge={unread} />
            <SidebarItem icon={BookOpen}        label="Disciplinas"     active={currentView === 'courses'}        onClick={() => onNavigate('courses')} />
          </div>
        </div>

        <div>
          <p className="px-4 text-[9px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">Gerenciamento</p>
          <div className="space-y-1">
            <SidebarItem icon={Calendar}        label="Lançar Semestre" active={currentView === 'new-semester'}   onClick={() => onNavigate('new-semester')} />
            <SidebarItem icon={ArrowRightLeft}  label="Alocações"       active={currentView === 'allocations'}    onClick={() => onNavigate('allocations')} />
            <SidebarItem icon={Users}           label="Docentes"        active={currentView === 'teachers'}       onClick={() => onNavigate('teachers')} />
            <SidebarItem icon={FileText}        label="Relatórios"      active={currentView === 'reports'}        onClick={() => onNavigate('reports')} />
          </div>
        </div>

        {user.hasTeachingRole && (
          <div>
            <p className="px-4 text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">Área do Professor</p>
            <div className="space-y-1">
              <SidebarItem icon={Clock}         label="Minha Grade"     active={currentView === 'my-schedule'}    onClick={() => onNavigate('my-schedule')} />
              <SidebarItem icon={ClipboardList} label="Minhas Disciplinas" active={currentView === 'my-subjects'} onClick={() => onNavigate('my-subjects')} />
              <SidebarItem icon={Settings}      label="Preferências"    active={currentView === 'preferences'}    onClick={() => onNavigate('preferences')} />
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-100 bg-white">
        <div
          onClick={() => onNavigate('profile')}
          className={`rounded-xl p-2.5 flex items-center gap-2.5 border mb-2 cursor-pointer transition-all ${
            currentView === 'profile' ? 'bg-zinc-100 border-zinc-200' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-[#32a041]/10 text-[#32a041] flex items-center justify-center font-black text-xs">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[10px] font-black text-zinc-800 truncate uppercase tracking-tight">
              {user.name.split(' ')[0]} {user.name.split(' ').pop()}
            </p>
            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full h-10 flex items-center justify-center gap-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <LogOut size={14} /> <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default CoordSidebar;

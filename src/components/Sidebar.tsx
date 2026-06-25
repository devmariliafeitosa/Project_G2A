import React from 'react';
import {
  BookOpen, Users, LayoutDashboard, Building2, Settings, FileText,
  LogOut, Bell, Calendar, UserCheck, ClipboardList
} from 'lucide-react';
import SidebarItem from './SidebarItem';
import { type User, type Notification, UserRole } from '../index';

type ViewName = 'dashboard' | 'courses' | 'teachers' | 'settings' | 'reports' | 'notifications' | 'occurrences' | 'professor_schedule' | 'professor_preferences';

interface SidebarProps {
  user: User;
  currentView: ViewName;
  selectedTeacherId: string | null;
  notifications: Notification[];
  onNavigate: (view: ViewName) => void;
  onSelectProfile: () => void;
  onLogout: () => void;
}

const Sidebar = ({
  user,
  currentView,
  selectedTeacherId,
  notifications,
  onNavigate,
  onSelectProfile,
  onLogout
}: SidebarProps) => {
  const nav = (view: ViewName) => onNavigate(view);

  return (
    <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col fixed h-full z-10">
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2 rounded-lg text-white">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="font-bold text-zinc-900 leading-none">Gestão Acadêmica</h1>
            <span className="text-[10px] text-primary font-bold tracking-widest uppercase">Campus Tauá</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-4 overflow-y-auto pb-8">
        <div className="space-y-1">
          <h3 className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Área Administrador</h3>
          <SidebarItem
            icon={LayoutDashboard}
            label="Dashboard"
            active={currentView === 'dashboard' && !selectedTeacherId}
            onClick={() => nav('dashboard')}
          />
          {user?.role === UserRole.Admin && (
            <SidebarItem
              icon={Bell}
              label="Notificações"
              active={currentView === 'notifications' && !selectedTeacherId}
              onClick={() => nav('notifications')}
              badge={notifications.filter(n => n.status === 'Não lida').length}
            />
          )}
          <SidebarItem
            icon={Building2}
            label="Cursos e Disciplinas"
            active={currentView === 'courses' && !selectedTeacherId}
            onClick={() => nav('courses')}
          />
          {user?.role === UserRole.Admin && (
            <SidebarItem
              icon={ClipboardList}
              label="Ocorrências"
              active={currentView === 'occurrences'}
              onClick={() => nav('occurrences')}
            />
          )}
          <SidebarItem
            icon={Users}
            label="Docentes"
            active={(currentView === 'teachers' || !!selectedTeacherId) && !(selectedTeacherId === user?.id)}
            onClick={() => nav('teachers')}
          />
          <SidebarItem
            icon={FileText}
            label="Relatórios"
            active={currentView === 'reports' && !selectedTeacherId}
            onClick={() => nav('reports')}
          />
          <SidebarItem
            icon={Settings}
            label="Cronograma"
            active={currentView === 'settings' && !selectedTeacherId}
            onClick={() => nav('settings')}
          />
        </div>

        <div className="pt-2 space-y-1">
          <h3 className="px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2">Área Professor</h3>
          <SidebarItem
            icon={Calendar}
            label="Minha Grade Semanal"
            active={currentView === 'professor_schedule'}
            onClick={() => nav('professor_schedule')}
          />
          <SidebarItem
            icon={UserCheck}
            label="Preferências"
            active={currentView === 'professor_preferences'}
            onClick={() => nav('professor_preferences')}
          />
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-100">
        <div
          onClick={onSelectProfile}
          className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg cursor-pointer transition-all ${selectedTeacherId === user?.id ? 'bg-zinc-100 border border-zinc-200' : 'hover:bg-zinc-50'}`}
        >
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-900 truncate">{user?.name}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-500 hover:text-alert hover:bg-rose-50 transition-all font-medium text-sm"
        >
          <LogOut size={16} /> <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import {
  User, Course, Subject, ScheduleEntry, Notification, Occurrence,
  AcademicSemester, Level, CourseType, WorkRegime, LeaveType, UserRole,
  NotificationType,
  NotificationPriority
} from './index';

import { PASTEL_COLORS, TIME_SLOTS } from './constants';
import { INITIAL_TEACHERS, INITIAL_COURSES, INITIAL_SUBJECTS, INITIAL_SCHEDULES, INITIAL_SEMESTERS } from './mockData';
import { getWorkloadLimit } from './workload';
import Sidebar from './components/Sidebar';
import MainLayout from './components/MainLayout';
import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import CoursesView from './views/CoursesView';
import TeacherProfileView from './views/TeacherProfileView';
import ReportsView from './views/ReportsView';
import NotificationsView from './views/NotificationsView';
import TeacherOccurrencesView from './views/TeacherOccurrencesView';
import ProfessorScheduleView from './views/ProfessorScheduleView';
import ProfessorPreferencesView from './views/ProfessorPreferencesView';
import SettingsView from './views/SettingsView';
import CoordSidebar, { CoordViewName } from './components/CoordSidebar';
import CoordDashboardView from './views/coord/CoordDashboardView';
import CoordNotificationsView from './views/coord/CoordNotificationsView';
import CoordProfileView from './views/coord/CoordProfileView';
import { AllocationsView } from './views/coord/AllocationsView';
import { NewSemesterView } from './views/coord/NewSemesterView';
import { TeachersView } from './views/coord/TeachersView';
import CoordReportsView from './views/ReportsView';
import MyScheduleView from './views/coord/MyScheduleView';
import MySubjectsView from './views/coord/MySubjectsView';
import CoordCoursesView from './views/coord/CoordCoursesView';
import ProfessorSidebar, { ProfViewName } from './components/ProfessorSidebar';

const isCoordinator = (user: User | null) =>
  user?.role === UserRole.Coordenador;

const isProfessor = (user: User | null) =>
  user?.role === UserRole.Professor;

type AdminViewName =
  | 'dashboard'
  | 'courses'
  | 'teachers'
  | 'settings'
  | 'reports'
  | 'notifications'
  | 'occurrences';

type ProfessorViewName =
  | 'dashboard'
  | 'notifications'
  | 'professor_schedule';

type ViewName = AdminViewName | ProfessorViewName;

const isAdminView = (view: ViewName): view is AdminViewName => {
  return [
    'dashboard',
    'courses',
    'teachers',
    'settings',
    'reports',
    'notifications',
    'occurrences'
  ].includes(view);
};

const isProfessorView = (view: ViewName): view is ProfessorViewName => {
  return [
    'dashboard',
    'notifications',
    'professor_schedule'
  ].includes(view);
};

export default function App() {

  const [session, setSession] = useState<{ user: User | null; isLoggedIn: boolean }>({ user: null, isLoggedIn: false });

  const [adminView, setAdminView] = useState<AdminViewName>('dashboard');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [professorPreferences, setProfessorPreferences] = useState<
    { teacherId: string; preferredSubjects: string[]; preferredDays: string[]; preferredShifts: string[] }[]
  >([]);
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>(INITIAL_SCHEDULES);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);

  const [coordView, setCoordView] = useState<CoordViewName>('dashboard');
  const [profView, setProfView] = useState<ProfViewName>('dashboard');
  const [allocations, setAllocations] = useState<ScheduleEntry[]>(() => {
    try { const s = localStorage.getItem('course_allocations'); return s ? JSON.parse(s) : INITIAL_SCHEDULES; } catch { return INITIAL_SCHEDULES; }
  });
  const [semesters, setSemesters] = useState<AcademicSemester[]>(() => {
    try { const s = localStorage.getItem('academic_semesters'); return s ? JSON.parse(s) : INITIAL_SEMESTERS; } catch { return INITIAL_SEMESTERS; }
  });

  useEffect(() => { localStorage.setItem('course_allocations', JSON.stringify(allocations)); }, [allocations]);
  useEffect(() => { localStorage.setItem('academic_semesters', JSON.stringify(semesters)); }, [semesters]);

  useEffect(() => {
    const check = async () => {
      const t = localStorage.getItem('authToken');
      if (!t) return;
      try {
        const r = await fetch('/api/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: t }) });
        const d = await r.json();
        if (r.ok) { localStorage.setItem('authToken', d.token); setSession({ user: d.user, isLoggedIn: true }); }
        else localStorage.removeItem('authToken');
      } catch { localStorage.removeItem('authToken'); }
    };
    check();
  }, []);

  useEffect(() => {
    if (!session.isLoggedIn) { setTeachers(INITIAL_TEACHERS); setNotifications([]); return; }
    const h = { Authorization: `Bearer ${localStorage.getItem('authToken')}` };
    const go = async (url: string, cb: (d: any) => void) => { try { const r = await fetch(url, { headers: h }); const d = await r.json(); if (r.ok) cb(d); } catch {} };
    const fetchUsers = async () => {
  try {
    const r = await fetch('/api/users', { headers: h });
    const d = await r.json();

    if (r.ok) {
      setTeachers(d);
    } else if (session.user) {
      setTeachers(p =>
        p.find(t => t.id === session.user!.id)
          ? p
          : [session.user!, ...p]
      );
    }
  } catch {
    if (session.user) {
      setTeachers(p =>
        p.find(t => t.id === session.user!.id)
          ? p
          : [session.user!, ...p]
      );
    }
  }
};

fetchUsers();
    go('/api/reports/history', setReportHistory);
    go('/api/occurrences', setOccurrences);
    const fn = () => go('/api/notifications', setNotifications);
    fn();
    const iv = setInterval(fn, 5000);
    return () => clearInterval(iv);
  }, [session.isLoggedIn]);

  const handleLogin = async (email: string, pass: string) => {
    const r = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: pass }) });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || 'Erro ao fazer login');
    localStorage.setItem('authToken', d.token);
    setSession({ user: d.user, isLoggedIn: true });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setSession({ user: null, isLoggedIn: false });
    setSelectedTeacherId(null);
  };

  const addCourse = (name: string, level: Level, type: CourseType, durationType: 'Semestral' | 'Anual', coordinatorId?: string) =>
    setCourses(p => [...p, { id: Date.now().toString(), name, campus: 'Tauá', level, type, durationType, coordinatorId }]);
  const updateCourse = (c: Course) => setCourses(p => p.map(x => x.id === c.id ? c : x));

  const addSubject = (name: string, workload: number, courseId: string, period: number, type: 'Obrigatória' | 'Opcional') =>
    setSubjects(p => [...p, { id: Date.now().toString(), name, workload, courseId, period, type, color: PASTEL_COLORS[p.length % PASTEL_COLORS.length] }]);
  const updateSubject = (s: Subject) => setSubjects(p => p.map(x => x.id === s.id ? s : x));
  const deleteSubject = (id: string) => { setSubjects(p => p.filter(s => s.id !== id)); setSchedules(p => p.filter(s => s.subjectId !== id)); };

  const addTeacher = async (data: any) => {
    if (session.user?.role !== 'Admin') { setTeachers(p => [...p, { ...data, id: Date.now().toString(), campus: 'Tauá', cargaHoraria: getWorkloadLimit(data.role), disciplinasMinistradas: [], status: 'Ativo' }]); return; }
    try { const r = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify({ ...data, campus: 'Tauá' }) }); const u = await r.json(); if (r.ok) setTeachers(p => [...p, { ...u, disciplinasMinistradas: [], cargaHoraria: getWorkloadLimit(u.role) }]); else throw new Error(u.error); } catch (e: any) { alert(e.message); }
  };
  const updateTeacher = async (data: any) => {
    if (session.user?.role !== 'Admin') { setTeachers(p => p.map(t => t.id === data.id ? { ...t, ...data } : t)); return; }
    try { const r = await fetch(`/api/users/${data.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify(data) }); const u = await r.json(); if (r.ok) setTeachers(p => p.map(t => t.id === data.id ? { ...t, ...u } : t)); else throw new Error(u.error); } catch (e: any) { alert(e.message); }
  };
  const deleteTeacher = async (id: string) => {
    if (session.user?.role !== 'Admin') { setTeachers(p => p.filter(t => t.id !== id)); if (selectedTeacherId === id) setSelectedTeacherId(null); return; }
    try { const r = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }); if (r.ok) { setTeachers(p => p.filter(t => t.id !== id)); if (selectedTeacherId === id) setSelectedTeacherId(null); } } catch {}
  };

  const handleAddSemester = (s: AcademicSemester) =>
    setSemesters(p => { const i = p.findIndex(x => x.id === s.id); if (i !== -1) { const n = [...p]; n[i] = s; return n; } return [...p, s]; });
  const handleDeleteSemester = (id: string) => setSemesters(p => p.filter(s => s.id !== id));

  const createNotification = async (notif: Omit<Notification, 'id' | 'status' | 'timestamp'>) => {
    try { const r = await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify(notif) }); const d = await r.json(); if (r.ok) setNotifications(p => [d, ...p]); } catch {}
  };
  const updateNotification = async (id: string, updates: Partial<Notification>) => {
    try { const r = await fetch(`/api/notifications/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify(updates) }); if (r.ok) setNotifications(p => p.map(n => n.id === id ? { ...n, ...updates } : n)); } catch {}
  };
  const deleteNotification = async (id: string) => {
    try { const r = await fetch(`/api/notifications/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }); if (r.ok) setNotifications(p => p.filter(n => n.id !== id)); } catch {}
  };

  const addSchedule = (entry: Omit<ScheduleEntry, 'id'>) => {
    if (entry.teacherId) {
      const teacher = teachers.find(t => t.id === entry.teacherId);
      const slot = TIME_SLOTS.find(ts => ts.id === entry.timeSlotId);
      const course = courses.find(c => c.id === entry.courseId);
      const tc = schedules.find(s => s.teacherId === entry.teacherId && s.dayOfWeek === entry.dayOfWeek && s.timeSlotId === entry.timeSlotId);
      if (tc) {
        const cs = subjects.find(s => s.id === tc.subjectId);

        createNotification({
          type: NotificationType.Alerta,
          title: 'Conflito de Horário: Docente',
          description: `${teacher?.name} já tem aula de "${cs?.name}" nas ${slot?.label} na ${entry.dayOfWeek}.`,
          priority: NotificationPriority.Alta,
          relatedPath: 'dashboard'
        });

        if (!window.confirm(`AVISO: ${teacher?.name} já tem aula neste horário (${cs?.name}). Continuar?`)) return;
      }

      const cc = schedules.find(
        s =>
          s.courseId === entry.courseId &&
          s.period === entry.period &&
          s.dayOfWeek === entry.dayOfWeek &&
          s.timeSlotId === entry.timeSlotId
      );

      if (cc) {
        const cs = subjects.find(s => s.id === cc.subjectId);

        createNotification({
          type: NotificationType.Alerta,
          title: 'Conflito de Horário: Turma',
          description: `${course?.name} (${entry.period}º Período) já tem "${cs?.name}" neste horário.`,
          priority: NotificationPriority.Alta,
          relatedPath: 'dashboard'
        });

        if (!window.confirm(`AVISO: Esta turma já tem aula neste horário (${cs?.name}). Continuar?`)) return;
      }

      const limit = teacher ? getWorkloadLimit(teacher.role) : 20;

      if (
        schedules.filter(s => s.teacherId === entry.teacherId).length + 1 > limit
      ) {
        createNotification({
          type: NotificationType.Alerta,
          title: 'Carga Horária Excedida',
          description: `${teacher?.name} excedeu o limite de ${limit}h semanais.`,
          priority: NotificationPriority.Alta,
          relatedPath: 'teachers'
        });
      }
    }
    setSchedules(p => [...p, { ...entry, id: Date.now().toString() }]);
  };

  const addReportToHistory = async (name: string) => {
    try { const r = await fetch('/api/reports/history', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify({ name }) }); const d = await r.json(); if (r.ok) setReportHistory(p => [d, ...p]); } catch {}
  };

  const createOccurrence = async (occ: Omit<Occurrence, 'id' | 'status'>) => {
    try { const r = await fetch('/api/occurrences', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify(occ) }); const d = await r.json(); if (r.ok) setOccurrences(p => [d, ...p]); } catch {}
  };
  const updateOccurrence = async (id: string, updates: Partial<Occurrence>) => {
    try { const r = await fetch(`/api/occurrences/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify(updates) }); const d = await r.json(); if (r.ok) setOccurrences(p => p.map(o => o.id === id ? d : o)); } catch {}
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!session.user?.id) return;
    try {
      const r = await fetch(`/api/profile/${session.user?.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify(updates) });
      if (r.ok) { const u = await r.json(); setSession(s => ({ ...s, user: u })); } else { const e = await r.json(); throw new Error(e.error); }
    } catch (err) { throw err; }
  };
  const handleDeactivateAccount = async (password: string) => {
    if (!session.user?.id) return;
    try {
      const r = await fetch('/api/deactivate-account', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify({ id: session.user.id, password }) });
      const d = await r.json();
      if (r.ok) { localStorage.removeItem('authToken'); setSession({ user: null, isLoggedIn: false }); } else throw new Error(d.error);
    } catch (err) { throw err; }
  };

  if (!session.isLoggedIn) return <LoginView onLogin={handleLogin} />;

  if (isCoordinator(session.user)) {
    const EmptyState = ({ title = 'Em breve' }: { title?: string }) => (
      <div className="h-[500px] border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center text-zinc-300 gap-4">
        <p className="text-sm font-black uppercase tracking-widest">{title}</p>
        <p className="text-xs text-zinc-400 font-bold uppercase">Funcionalidade ainda não disponível.</p>
      </div>
    );

    const renderCoordView = () => {
      switch (coordView) {
        case 'dashboard':    return <CoordDashboardView user={session.user} teachers={teachers} subjects={subjects} courses={courses} allocations={allocations} semesters={semesters} onAddAllocation={e => setAllocations(p => [...p, e])} onDeleteAllocation={id => setAllocations(p => p.filter(a => a.id !== id))} />;
        case 'notifications':return <CoordNotificationsView notifications={notifications} onUpdateNotification={updateNotification} onDeleteNotification={deleteNotification} onNavigate={v => setCoordView(v as CoordViewName)} />;
        case 'courses':      return <CoordCoursesView user={session.user} subjects={subjects} courses={courses} />;
        case 'new-semester': return <NewSemesterView user={session.user} courses={courses} subjects={subjects} semesters={semesters} onAddSemester={handleAddSemester} onDeleteSemester={handleDeleteSemester} />;
        case 'allocations':  return <AllocationsView user={session.user} teachers={teachers} subjects={subjects} courses={courses} semesters={semesters} allocations={allocations} onAddAllocation={e => setAllocations(p => [...p, e])} onDeleteAllocation={id => setAllocations(p => p.filter(a => a.id !== id))} onNavigate={v => setCoordView(v as any)} />;
        case 'teachers':     return <TeachersView user={session.user} teachers={teachers} subjects={subjects} allocations={allocations} onAddTeacher={t => setTeachers(p => [t, ...p])} onUpdateTeacher={t => setTeachers(p => p.map(x => x.id === t.id ? t : x))} onDeleteTeacher={id => setTeachers(p => p.filter(t => t.id !== id))} />;
        case 'reports':
          return (
            <CoordReportsView
              courses={courses}
              teachers={teachers}
              subjects={subjects}
              schedules={allocations}
              reportHistory={reportHistory}
              onAddHistory={addReportToHistory}
            />
          );
        case 'my-schedule':  return <MyScheduleView user={session.user} courses={courses} subjects={subjects} allocations={allocations} />;
        case 'my-subjects':  return <MySubjectsView user={session.user} courses={courses} subjects={subjects} allocations={allocations} semesters={semesters} />;
        case 'preferences':  return <EmptyState title="Minhas Preferências" />;
        case 'profile':      return <CoordProfileView user={session.user!} onUpdate={handleUpdateProfile} onDeactivate={handleDeactivateAccount} />;
        default:             return null;
      }
    };

    return (
      <div className="flex min-h-screen bg-zinc-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <CoordSidebar user={session.user!} currentView={coordView} notifications={notifications} onNavigate={setCoordView} onLogout={handleLogout} />
        <main className="flex-1 ml-64 p-8 md:p-10 overflow-x-hidden min-h-screen">
          {renderCoordView()}
        </main>
      </div>
    );
  }

const navigate = (view: ViewName) => {
  if (isCoordinator(session.user) && isAdminView(view)) {
    setAdminView(view);
    setSelectedTeacherId(null);
  }

  if (isProfessor(session.user) && isProfessorView(view)) {
    setProfView(view as any);
  }
};

  const renderProfessorView = () => {
    switch (profView) {
      case 'dashboard':
        return (
          <DashboardView
            user={session.user!}
            stats={{ teachers: teachers.length, courses: courses.length, subjects: subjects.length }}
            courses={courses}
            subjects={subjects}
            teachers={teachers}
            schedules={allocations}
            allocations={allocations}
            onAddSchedule={addSchedule}
          />
        );

      case 'notifications':
        return (
          <NotificationsView
            notifications={notifications}
            onUpdateNotification={updateNotification}
            onDeleteNotification={deleteNotification}
            onNavigate={(path: string) => setProfView(path as any)}
          />
        );

      case 'my-subjects':
        return (
          <MySubjectsView
            user={session.user}
            courses={courses}
            subjects={subjects}
            allocations={allocations}
            semesters={semesters}
          />
        );

      case 'my-schedule':
        return (
          <ProfessorScheduleView
            user={session.user!}
            courses={courses}
            subjects={subjects}
            teachers={teachers}
            schedules={allocations}
          />
        );

      case 'preferences':
        return (
          <ProfessorPreferencesView
            user={session.user!}
            courses={courses}
            subjects={subjects}
            semesters={semesters}
            preferences={professorPreferences}
            onSave={prefs => {
              if (!session.user) return;

              const i = professorPreferences.findIndex(
                p => p.teacherId === session.user!.id
              );

              const np = [...professorPreferences];

              if (i >= 0) {
                np[i] = {
                  ...prefs,
                  teacherId: session.user.id
                };
              } else {
                np.push({
                  ...prefs,
                  teacherId: session.user.id
                });
              }

              setProfessorPreferences(np);
            }}
          />
        );

      default:
        return null;
    }
  };

      if (isProfessor(session.user)) {
    return (
      <div className="flex min-h-screen bg-zinc-50 font-sans">
        <ProfessorSidebar
          user={session.user!}
          currentView={profView}
          notifications={notifications}
          onNavigate={setProfView}
          onLogout={handleLogout}
        />

        <main className="flex-1 ml-64 p-8 md:p-10 overflow-x-hidden min-h-screen">
          {renderProfessorView()}
        </main>
      </div>
    );
  }

  const renderAdminView = () => {
    if (selectedTeacherId)
      return (
        <TeacherProfileView
          teacher={teachers.find(t => t.id === selectedTeacherId)!}
          onBack={() => setSelectedTeacherId(null)}
          onUpdate={updateTeacher}
          currentUserRole={session.user?.role}
          currentUserId={session.user?.id}
          onLogout={handleLogout}
        />
      );

    switch (adminView) {
      case 'dashboard':
        return (
          <DashboardView
            user={session.user!}
            stats={{
              teachers: teachers.length,
              courses: courses.length,
              subjects: subjects.length
            }}
            courses={courses}
            subjects={subjects}
            teachers={teachers}
            schedules={schedules}
            allocations={allocations}
            onAddSchedule={addSchedule}
          />
        );

      case 'courses':
        return (
          <CoursesView
            courses={courses}
            teachers={teachers}
            subjects={subjects}
            onAddCourse={addCourse}
            onAddSubject={addSubject}
            onUpdateCourse={updateCourse}
            onDeleteSubject={deleteSubject}
            onUpdateSubject={updateSubject}
          />
        );

      case 'teachers':
        return (
          <TeachersView
            user={session.user}
            teachers={teachers}
            subjects={subjects}
            allocations={schedules}
            onAddTeacher={addTeacher}
            onUpdateTeacher={updateTeacher}
            onSelectTeacher={setSelectedTeacherId}
            onDeleteTeacher={deleteTeacher}
            currentUserRole={session.user?.role}
            currentUserId={session.user?.id}
          />
        );

      case 'reports':
        return (
          <ReportsView
            courses={courses}
            teachers={teachers}
            subjects={subjects}
            schedules={schedules}
            reportHistory={reportHistory}
            onAddHistory={addReportToHistory}
          />
        );

      case 'occurrences':
        return (
          <TeacherOccurrencesView
            occurrences={occurrences}
            teachers={teachers}
            subjects={subjects}
            onCreateOccurrence={createOccurrence}
            onUpdateOccurrence={updateOccurrence}
          />
        );

      case 'notifications':
        return (
          <NotificationsView
            notifications={notifications}
            onUpdateNotification={updateNotification}
            onDeleteNotification={deleteNotification}
            onNavigate={(path) => setAdminView(path as AdminViewName)}
          />
        );

      case 'settings':
        return <SettingsView />;

      default:
        return null;
    }
  };

  return (
    <MainLayout
      animationKey={selectedTeacherId ? `profile-${selectedTeacherId}` : adminView}
      sidebar={
        session.user && (
          <Sidebar
            user={session.user}
            currentView={adminView}
            selectedTeacherId={selectedTeacherId}
            notifications={notifications}
            onNavigate={(view: any) => navigate(view)}
            onSelectProfile={() => setSelectedTeacherId(session.user?.id || null)}
            onLogout={handleLogout}
          />
        )
      }
    >
      {renderAdminView()}
    </MainLayout>
  );
}

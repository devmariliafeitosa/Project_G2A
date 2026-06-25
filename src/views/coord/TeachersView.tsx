import React, { useState, useMemo } from "react";
import { 
  Users, 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  X, 
  Check, 
  Trash2, 
  UserPlus, 
  Award, 
  Briefcase, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Mail, 
  Phone, 
  Calendar, 
  CreditCard,
  Building,
  Activity,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "../../index";
import { UserRole, WorkRegime, LeaveType } from "../../index";

interface TeachersViewProps {
  user: User | null;
  teachers: User[];
  subjects: any[];
  allocations: any[];
  onAddTeacher?: (newTeacher: User) => void;
  onUpdateTeacher?: (updatedTeacher: User) => void;
  onDeleteTeacher?: (id: string) => void;
  onSelectTeacher?: (teacherId: string) => void;
  currentUserRole?: UserRole;
  currentUserId?: string;
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

export function TeachersView({
  user,
  teachers,
  subjects,
  allocations,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onSelectTeacher,
  currentUserRole,
  currentUserId
}: TeachersViewProps): React.ReactElement {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: UserRole.Professor,
    registration: "",
    campus: "Tauá",
    regime: WorkRegime.DE,
    leaveType: LeaveType.Nenhum,
    hasReducedWorkload: false,
    cargaHoraria: 20,
    areaAtuacao: "",
    birthDate: "",
    phone: "",
    cpf: "",
    ingressoYear: "",
    status: "Ativo" as User["status"],
    password: "password123"
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- Filtering & Calculations ---
  const getTeacherWeeklyHours = (teacherId: string) => {
    // each allocation is typically 2 hours
    const teacherAllocations = allocations.filter(a => a.teacherId === teacherId);
    return teacherAllocations.length * 2;
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const isPhyllipe = t.id === "t_phyllipe" || t.name.toLowerCase().includes("phyllipe");

      const matchesSearch = 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.registration && t.registration.includes(searchTerm)) ||
        (t.siape && t.siape.includes(searchTerm)) ||
        (isPhyllipe && searchTerm.toLowerCase().includes("admin"));
      
      const matchesRole = 
        selectedRole === "all" || 
        t.role === selectedRole ||
        (isPhyllipe && (selectedRole === "Admin" || selectedRole === "Professor"));

      const matchesStatus = selectedStatus === "all" || t.status === selectedStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teachers, searchTerm, selectedRole, selectedStatus]);

  // --- Actions ---
  const handleOpenCreate = () => {
    setModalMode("create");
    setFormData({
      name: "",
      email: "",
      role: UserRole.Professor,
      registration: "",
      campus: "Tauá",
      regime: WorkRegime.DE,
      leaveType: LeaveType.Nenhum,
      hasReducedWorkload: false,
      cargaHoraria: 20,
      areaAtuacao: "",
      birthDate: "",
      phone: "",
      cpf: "",
      ingressoYear: new Date().getFullYear().toString(),
      status: "Ativo",
      password: "password123"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: User) => {
    setModalMode("edit");
    setSelectedTeacher(t);
    setFormData({
      name: t.name || "",
      email: t.email || "",
      role: t.role || UserRole.Professor,
      registration: t.registration || t.siape || "",
      campus: t.campus || "Tauá",
      regime: t.regime || WorkRegime.DE,
      leaveType: t.leaveType || LeaveType.Nenhum,
      hasReducedWorkload: t.hasReducedWorkload || false,
      cargaHoraria: t.cargaHoraria || 20,
      areaAtuacao: t.areaAtuacao || "",
      birthDate: t.birthDate || "",
      phone: t.phone || "",
      cpf: t.cpf || "",
      ingressoYear: t.ingressoYear || "",
      status: t.status || "Ativo",
      password: "password123"
    });
    setIsModalOpen(true);
  };

  const handleOpenView = (t: User) => {
    setModalMode("view");
    setSelectedTeacher(t);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      triggerToast("Por favor, preencha o Nome e o E-mail.", "error");
      return;
    }

    if (modalMode === "create") {
      const newTeacher: User = {
        id: "t_manual_" + Math.random().toString(36).substring(2, 9),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        registration: formData.registration,
        siape: formData.registration,
        campus: formData.campus,
        regime: formData.regime,
        leaveType: formData.leaveType,
        hasReducedWorkload: formData.hasReducedWorkload,
        cargaHoraria: Number(formData.cargaHoraria),
        areaAtuacao: formData.areaAtuacao,
        birthDate: formData.birthDate,
        phone: formData.phone,
        cpf: formData.cpf,
        ingressoYear: formData.ingressoYear,
        status: formData.status,
        login: formData.email.split("@")[0]
      };

      if (onAddTeacher) {
        onAddTeacher(newTeacher);
      }
      triggerToast(`Docente ${newTeacher.name} cadastrado com sucesso.`);
    } else if (modalMode === "edit" && selectedTeacher) {
      const updatedTeacher: User = {
        ...selectedTeacher,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        registration: formData.registration,
        siape: formData.registration,
        campus: formData.campus,
        regime: formData.regime,
        leaveType: formData.leaveType,
        hasReducedWorkload: formData.hasReducedWorkload,
        cargaHoraria: Number(formData.cargaHoraria),
        areaAtuacao: formData.areaAtuacao,
        birthDate: formData.birthDate,
        phone: formData.phone,
        cpf: formData.cpf,
        ingressoYear: formData.ingressoYear,
        status: formData.status
      };

      if (onUpdateTeacher) {
        onUpdateTeacher(updatedTeacher);
      }
      triggerToast(`Docente ${updatedTeacher.name} atualizado com sucesso.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (teacherId: string, teacherName: string) => {
    if (confirm(`Tem certeza que deseja excluir o(a) docente "${teacherName}"?`)) {
      if (onDeleteTeacher) {
        onDeleteTeacher(teacherId);
      }
      triggerToast(`Docente ${teacherName} excluído com sucesso.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-16 font-sans">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl border text-xs font-black uppercase tracking-wider
              ${toast.type === "success" ? "bg-emerald-600 text-white border-emerald-700" : "bg-rose-600 text-white border-rose-700"}
            `}
          >
            <Check size={16} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight leading-none mb-1">Docentes</h1>
          <p className="text-zinc-500 text-sm font-medium">Gestão de professores e encargos didáticos.</p>
        </div>
      </header>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou SIAPE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl pl-11 pr-4 text-xs font-medium text-zinc-800 outline-none focus:border-emerald-600/50 transition-all font-sans"
          />
        </div>

        <div className="w-full md:w-56">
          <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold text-zinc-700 outline-none focus:border-emerald-600/50 transition-all"
            >
            <option value="all">Todas as Funções</option>

            {(Object.values(UserRole) as UserRole[]).map(role => (
                <option key={role} value={role}>
                {role}
                </option>
            ))}
            </select>
        </div>

        <div className="w-full md:w-56">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold text-zinc-700 outline-none focus:border-emerald-600/50 transition-all"
          >
            <option value="all">Todos os Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      {/* Teachers List Datatable */}
      <div className="bg-white rounded-3xl border border-zinc-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-zinc-50/50 border-b border-zinc-100">
                <th className="p-4 pl-6 text-[10px] font-black uppercase text-zinc-500 tracking-wider">Docente</th>
                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-center">Status</th>
                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-center">Ano Egresso/SIAPE</th>
                <th className="p-4 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-center">Carga</th>
                <th className="p-4 pr-6 text-[10px] font-black uppercase text-zinc-500 tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-zinc-400 font-bold uppercase text-xs">
                    Nenhum docente corresponde aos critérios de filtragem.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map(t => {
                  const hours = getTeacherWeeklyHours(t.id);
                  const isCoord = t.role === UserRole.Coordenador;

                  return (
                    <tr key={t.id} className="hover:bg-zinc-50/20 transition-all">
                      {/* Name and Email */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold uppercase 
                            ${isCoord ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}
                          `}>
                            {t.name ? t.name.charAt(0) : "D"}
                          </div>
                          <div>
                            <p className="text-xs font-black text-zinc-800 uppercase leading-none mb-1">{t.name}</p>
                            <p className="text-[10px] text-zinc-400 font-medium leading-none">{t.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="p-4 text-center">
                        <span className={`inline-block px-2 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider leading-none
                          ${t.status === "Ativo" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                            : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                          }
                        `}>
                          {t.status || "Ativo"}
                        </span>
                      </td>

                      {/* SIAPE & Egresso Year */}
                      <td className="p-4 text-center">
                        <p className="text-xs font-bold text-zinc-700">{t.ingressoYear || "N/A"}</p>
                        <p className="text-[10px] text-zinc-400 font-extrabold uppercase mt-0.5">{t.registration || t.siape || "ADMIN01"}</p>
                      </td>

                      {/* Carga Horaria de Aulas */}
                      <td className="p-4 text-center">
                        <p className="text-xs font-black text-zinc-800">{hours}h</p>
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenView(t)}
                            className="w-8 h-8 rounded-lg border border-zinc-200 hover:bg-zinc-100 hover:text-zinc-950 text-zinc-650 flex items-center justify-center transition-all cursor-pointer"
                            title="Visualizar Detalhes"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Modal for Edit, Create or View */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 className="text-md font-black text-zinc-900 uppercase">
                      {modalMode === "create" && "Cadastrar Novo Docente"}
                      {modalMode === "edit" && "Editar Informações do Docente"}
                      {modalMode === "view" && "Ficha Cadastral do Docente"}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-wider">
                      {modalMode === "view" ? "Consulte a ficha completa e encargos didáticos" : "Preencha as informações funcionais obrigatórias"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-zinc-200 text-zinc-400 flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Content Scrollable */}
              <div className="overflow-y-auto p-6 flex-1">
                {modalMode === "view" && selectedTeacher ? (
                  /* Detail View Mode */
                  <div className="space-y-6">
                    {/* Header snapshot */}
                    <div className="flex items-center gap-4 bg-zinc-50 border border-zinc-150 rounded-2xl p-4">
                      <div className="w-14 h-14 bg-emerald-150 text-emerald-900 text-xl font-black uppercase rounded-2xl flex items-center justify-center shrink-0">
                        {selectedTeacher.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          {selectedTeacher.role}
                        </span>
                        <h4 className="text-lg font-black text-zinc-900 uppercase mt-1 leading-none">{selectedTeacher.name}</h4>
                        <p className="text-xs text-zinc-400 font-semibold mt-1">{selectedTeacher.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Functional specifications */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-100 pb-1 flex items-center gap-1.5">
                          <Briefcase size={12} /> Vínculo e Regime
                        </h5>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-400 uppercase text-[10px]">SIAPE</span>
                            <span className="font-bold text-zinc-700">{selectedTeacher.registration || selectedTeacher.siape || "Não informado"}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-400 uppercase text-[10px]">Regime de Trabalho</span>
                            <span className="font-bold text-zinc-700">{selectedTeacher.regime}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-400 uppercase text-[10px]">Carga Horária Máxima</span>
                            <span className="font-bold text-zinc-700">{getRoleBasedLimit(selectedTeacher.role)}h semanais</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-400 uppercase text-[10px]">Área de Atuação</span>
                            <span className="font-bold text-zinc-750 uppercase">{selectedTeacher.areaAtuacao || "Informação e Comunicação"}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-400 uppercase text-[10px]">Ano de Ingresso</span>
                            <span className="font-bold text-zinc-700">{selectedTeacher.ingressoYear || "Não registrado"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Personal Specifications */}
                      <div className="space-y-4">
                        <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-100 pb-1 flex items-center gap-1.5">
                          <Activity size={12} /> Situação de Calendário
                        </h5>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-400 uppercase text-[10px]">Situação Ativa</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${selectedTeacher.status === "Ativo" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-500"}`}>
                              {selectedTeacher.status || "Ativo"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-400 uppercase text-[10px]">Afastamentos Ativo</span>
                            <span className="font-bold text-zinc-700">{selectedTeacher.leaveType || "Nenhum"}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-400 uppercase text-[10px]">Redução de Carga</span>
                            <span className="font-bold text-zinc-700">{selectedTeacher.hasReducedWorkload ? "Incluso" : "Não incluso"}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-zinc-400 uppercase text-[10px]">Campus Pertencente</span>
                            <span className="font-bold text-zinc-700">{selectedTeacher.campus || "Tauá"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Allocated courses/subjects */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-zinc-100 pb-1 flex items-center gap-1.5">
                        <FileText size={12} /> Encargos Didáticos Homologados
                      </h5>

                      <div className="space-y-2">
                        {allocations.filter(a => a.teacherId === selectedTeacher.id).length === 0 ? (
                          <p className="text-zinc-400 text-xs italic">Nenhuma disciplina alocada para este docente nas distribuições sob gestão.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {allocations.filter(a => a.teacherId === selectedTeacher.id).map(alloc => {
                              const relatedSub = subjects.find(s => s.id === alloc.subjectId);
                              return (
                                <div key={alloc.id} className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <span className="text-[8px] font-mono font-bold text-zinc-405 leading-none block uppercase">{alloc.dayOfWeek} • {alloc.timeSlotId.toUpperCase()}</span>
                                    <p className="text-xs font-black text-zinc-800 uppercase mt-1 leading-none truncate">{relatedSub?.name || alloc.subjectId}</p>
                                  </div>
                                  <span className="text-[8px] font-mono bg-zinc-200 px-1.5 py-0.5 rounded text-zinc-640 shrink-0 uppercase">2h Class</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Form Input Mode for Edit / Create */
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Name Form block */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Ex: Anelise Daniela"
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-emerald-600/50"
                        />
                      </div>

                      {/* Email Form block */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">E-mail Institucional *</label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="nome@ifce.edu.br"
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-emerald-600/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Função Acadêmica</label>
                        <select
                          value={formData.role}
                          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold text-zinc-700 outline-none focus:border-emerald-600/50"
                        >
                          {Object.values(UserRole).map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Matrícula SIAPE</label>
                        <input
                          type="text"
                          value={formData.registration}
                          onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                          placeholder="Ex: 3301011"
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-emerald-600/50"
                        />
                      </div>

                      {/* Workregime selection block */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Regime de Trabalho</label>
                        <select
                          value={formData.regime}
                          onChange={(e) => setFormData({ ...formData, regime: e.target.value as WorkRegime })}
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold text-zinc-700 outline-none focus:border-emerald-600/50"
                        >
                          {Object.values(WorkRegime).map(reg => (
                            <option key={reg} value={reg}>{reg}</option>
                          ))}
                        </select>
                      </div>

                      {/* Workload ceiling input block */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Carga Horária Limite (Semanal)</label>
                        <input
                          type="number"
                          value={formData.cargaHoraria}
                          onChange={(e) => setFormData({ ...formData, cargaHoraria: Number(e.target.value) })}
                          placeholder="Ex: 12"
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-emerald-600/50"
                        />
                      </div>

                      {/* Area of expertise */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Área de Atuação</label>
                        <input
                          type="text"
                          value={formData.areaAtuacao}
                          onChange={(e) => setFormData({ ...formData, areaAtuacao: e.target.value })}
                          placeholder="Ex: Ciência da Computação"
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-emerald-600/50"
                        />
                      </div>

                      {/* Ingresso Year */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Ano de Ingresso</label>
                        <input
                          type="text"
                          value={formData.ingressoYear}
                          onChange={(e) => setFormData({ ...formData, ingressoYear: e.target.value })}
                          placeholder="Ex: 2015"
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-semibold outline-none focus:border-emerald-600/50"
                        />
                      </div>

                      {/* Active Status */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Status Cadastral</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as "Ativo" | "Inativo" })}
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold text-zinc-700 outline-none focus:border-emerald-600/50"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                        </select>
                      </div>

                      {/* Leave Specification */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 pl-1">Situação de Afastamento</label>
                        <select
                          value={formData.leaveType}
                          onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as LeaveType })}
                          className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold text-zinc-700 outline-none focus:border-emerald-600/50"
                        >
                          {Object.values(LeaveType).map(lt => (
                            <option key={lt} value={lt}>{lt}</option>
                          ))}
                        </select>
                      </div>

                    </div>

                    <div className="flex gap-4 items-center bg-zinc-50 border border-zinc-150 p-4 rounded-2xl">
                      <input
                        type="checkbox"
                        id="hasReducedWorkload"
                        checked={formData.hasReducedWorkload}
                        onChange={(e) => setFormData({ ...formData, hasReducedWorkload: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                      />
                      <label htmlFor="hasReducedWorkload" className="text-xs text-zinc-500 font-semibold select-none cursor-pointer">
                        Solicitante de Redução de Carga Horária Didático-Pedagógica (Ex: Atividades administrativas, PIT ou cargos colegiados).
                      </label>
                    </div>

                    {/* Submit / Action Button */}
                    <button
                      type="submit"
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {modalMode === "create" ? "Confirmar Cadastro" : "Salvar Alterações"}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

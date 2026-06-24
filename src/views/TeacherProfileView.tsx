import React, { useState, useMemo } from 'react';
import { ArrowLeft, Activity, Settings, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AREAS_DE_ATUACAO } from '../areasDeAtuacao';
import { getWorkloadLimit } from '../workload';
import Badge from '../components/Badge';
import type { User, UserRole } from '../index';
import { Plus } from 'lucide-react';

const TeacherProfileView = ({ 
  teacher, 
  onBack, 
  onUpdate,
  currentUserRole,
  currentUserId,
  onLogout
}: { 
  teacher: User, 
  onBack: () => void, 
  onUpdate: (u: User) => void,
  currentUserRole?: UserRole,
  currentUserId?: string,
  onLogout: () => void
}) => {
  const limit = getWorkloadLimit(teacher.role);
  const isAdmin = currentUserRole === 'Admin';
  const isOwnProfile = teacher.id === currentUserId;
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeactivatingAccount, setIsDeactivatingAccount] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState({
    name: teacher.name,
    email: teacher.email,
    birthDate: teacher.birthDate || '',
    areaAtuacao: teacher.areaAtuacao || ''
  });

  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const hasProfileChanges = useMemo(() => {
    return profileData.name !== teacher.name ||
           profileData.email !== teacher.email ||
           profileData.birthDate !== (teacher.birthDate || '') ||
           profileData.areaAtuacao !== (teacher.areaAtuacao || '');
  }, [profileData, teacher]);

  const validatePassword = (pass: string) => {
    const requirements = [];
    if (pass.length < 8) requirements.push("Mínimo de 8 caracteres");
    if (!/[A-Z]/.test(pass)) requirements.push("Letras maiúsculas");
    if (!/[a-z]/.test(pass)) requirements.push("Letras minúsculas");
    if (!/\d/.test(pass)) requirements.push("Ao menos um número");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pass)) requirements.push("Ao menos um caractere especial (!@#$)");
    return requirements;
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Todos os campos são obrigatórios");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("A senha digitada e sua confirmação não correspondem.");
      return;
    }

    const requirements = validatePassword(passwordForm.newPassword);
    if (requirements.length > 0) {
      setPasswordError(`A nova senha não atende aos critérios:\n- ${requirements.join('\n- ')}`);
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordError("A nova senha não pode ser igual à senha atual.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Senha alterada com sucesso!");
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // After success, maybe close modal after a delay
        setTimeout(() => setIsChangingPassword(false), 2000);
      } else {
        setPasswordError(data.error || "Erro ao alterar senha");
      }
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProfile = async () => {
    setProfileMessage(null);
    if (!profileData.name || !profileData.email || !profileData.areaAtuacao || !profileData.birthDate) {
      setProfileMessage({ type: 'error', text: "Nome, E-mail, Data de Nascimento e Área de Atuação são obrigatórios" });
      return;
    }

    if (!profileData.email.endsWith('@ifce.edu.br')) {
      setProfileMessage({ type: 'error', text: "O e-mail deve ser institucional (@ifce.edu.br)" });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      setProfileMessage({ type: 'error', text: "Formato de e-mail institucional inválido" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (res.ok) {
        setProfileMessage({ type: 'success', text: "Perfil atualizado com sucesso!" });
        onUpdate(data);
        setTimeout(() => setProfileMessage(null), 4000);
      } else {
        setProfileMessage({ type: 'error', text: data.error || "Erro ao atualizar perfil" });
      }
    } catch (err: any) {
      setProfileMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivateAccount = async () => {
    if (!deactivatePassword) {
      setPasswordError("Senha é obrigatória para desativar a conta");
      return;
    }

    setIsSubmitting(true);
    setPasswordError(null);
    try {
      const res = await fetch("/api/deactivate-account", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify({ password: deactivatePassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess("Conta desativada com sucesso! Você será desconectado.");
        setTimeout(() => {
          onLogout();
        }, 3000);
      } else {
        setPasswordError(data.error || "Erro ao desativar conta");
      }
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-10 animate-in slide-in-from-right duration-500">
      <header className="flex items-center gap-6">
        <button onClick={onBack} className="p-3 bg-white border border-zinc-100 rounded-2xl text-zinc-400 hover:text-zinc-900 transition-all shadow-sm">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{teacher.name}</h1>
            <Badge variant="highlight">{teacher.role}</Badge>
            <Badge variant={teacher.status === 'Inativo' ? 'alert' : 'success'}>{teacher.status || 'Ativo'}</Badge>
          </div>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest">{teacher.registration} • {teacher.campus}</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm space-y-10">
              {profileMessage && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                  {profileMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {profileMessage.text}
                </div>
              )}

              <div className="space-y-8">
                <h3 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={14} /> Informações do Perfil
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Editable Fields for Own Profile */}
                  {isOwnProfile ? (
                    <>
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pl-1">Nome Completo</label>
                        <input 
                          value={profileData.name}
                          onChange={e => setProfileData({...profileData, name: e.target.value})}
                          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl h-11 px-4 text-sm font-bold text-zinc-800 outline-none focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pl-1">E-mail Institucional</label>
                        <input 
                          value={profileData.email}
                          onChange={e => setProfileData({...profileData, email: e.target.value})}
                          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl h-11 px-4 text-sm font-bold text-zinc-800 outline-none focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pl-1">Data de Nascimento</label>
                        <input 
                          type="date"
                          value={profileData.birthDate}
                          onChange={e => setProfileData({...profileData, birthDate: e.target.value})}
                          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl h-11 px-4 text-sm font-bold text-zinc-800 outline-none focus:border-primary/30 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 px-1">
                        <label className="text-[10px] font-black text-zinc-300 uppercase tracking-widest pl-1">Área de Atuação</label>
                        <select 
                          value={profileData.areaAtuacao}
                          onChange={e => setProfileData({...profileData, areaAtuacao: e.target.value})}
                          className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl h-11 px-4 text-sm font-bold text-zinc-800 outline-none focus:border-primary/30 transition-all appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Selecione uma área...</option>
                          {AREAS_DE_ATUACAO.map(area => (
                            <option key={area} value={area}>{area}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Área de Atuação</p>
                        <p className="text-base font-bold text-zinc-800">{teacher.areaAtuacao || 'Não definida'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Vínculo Institucional</p>
                        <p className="text-base font-bold text-zinc-800">{teacher.regime}</p>
                      </div>
                    </>
                  )}
                </div>

                {/* Read-only Institutional Data */}
                <div className="pt-8 border-t border-zinc-50">
                  <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-6">Dados Institucionais (Somente Leitura)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-zinc-300 uppercase">SIAPE</p>
                      <p className="text-sm font-bold text-zinc-500">{teacher.registration}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-zinc-300 uppercase">Ano de Ingresso</p>
                      <p className="text-sm font-bold text-zinc-500">{teacher.ingressoYear || 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-zinc-300 uppercase">Login</p>
                      <p className="text-sm font-bold text-zinc-500 text-lowercase">{teacher.login || teacher.email.split('@')[0]}</p>
                    </div>
                  </div>
                </div>

                {isOwnProfile && hasProfileChanges && (
                  <div className="pt-6 flex justify-end">
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={isSubmitting}
                      className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 size={16} />}
                      Salvar Alterações
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest">Alocações no Semestre</h4>
                  <button className="text-primary font-bold text-[10px] uppercase tracking-widest flex items-center gap-1 hover:underline">
                    <Plus size={14} /> Nova Alocação
                  </button>
                </div>
                <div className="space-y-3">
                  {(teacher.disciplinasMinistradas || []).length === 0 ? (
                    <div className="p-10 border-2 border-dashed border-zinc-50 rounded-xl text-center">
                      <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Sem disciplinas alocadas</p>
                    </div>
                  ) : null}
                </div>
              </div>
           </div>
        </div>

        <aside className="space-y-8">
           <div className="bg-primary p-10 rounded-[2.5rem] text-white shadow-xl shadow-primary/20 relative overflow-hidden">
              <Activity className="absolute -right-4 -bottom-4 text-white/10" size={140} />
              <div className="relative z-10 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Encargo Didático Semanal</p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-6xl font-bold tracking-tighter leading-none">{(teacher.cargaHoraria || 0)}h</h4>
                  <span className="text-xl font-bold opacity-30">/ {limit}h</span>
                </div>
                <div className="pt-4 space-y-4">
                   <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((teacher.cargaHoraria || 0) / limit) * 100}%` }}
                        className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                      />
                   </div>
                   <p className="text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                     O {teacher.role.toLowerCase()} possui um limite normativo de {limit} horas aula semanais.
                   </p>
                </div>
              </div>
           </div>

            <div className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-zinc-400" />
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Painel Operacional</h4>
              </div>
              <div className="flex flex-col gap-2">
                {isOwnProfile && (
                  <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="w-full h-11 bg-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Settings size={14} /> Alterar Senha
                  </button>
                )}
                {isAdmin && !isOwnProfile && (
                  <button 
                    onClick={() => onUpdate({ ...teacher, status: teacher.status === 'Inativo' ? 'Ativo' : 'Inativo' })}
                    className={`w-full h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${teacher.status === 'Inativo' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-900 hover:text-white'}`}
                  >
                    {teacher.status === 'Inativo' ? 'Reativar Usuário' : 'Desativar Usuário'}
                  </button>
                )}
                {isOwnProfile && (
                  <button 
                    onClick={() => {
                       setDeactivatePassword('');
                       setPasswordError(null);
                       setPasswordSuccess(null);
                       setIsDeactivatingAccount(true);
                    }}
                    className="w-full h-11 bg-rose-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Desativar minha conta
                  </button>
                )}
                {!isOwnProfile && (
                  <button className="w-full h-11 bg-rose-50 rounded-xl text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:bg-rose-500 hover:text-white transition-all">Remover do Campus</button>
                )}
              </div>
           </div>
        </aside>
      </div>

      <AnimatePresence>
        {isChangingPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Alterar Senha</h3>
                <button onClick={() => setIsChangingPassword(false)} className="text-zinc-400 hover:text-zinc-600">
                  <ArrowLeft size={20} className="rotate-90 md:rotate-0" />
                </button>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold whitespace-pre-line leading-relaxed">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Senha Atual</label>
                  <input 
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nova Senha</label>
                  <input 
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Confirmação da Nova Senha</label>
                  <input 
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-primary/30"
                  />
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed border-t border-zinc-100 pt-4">
                  Critérios: Min. 8 caracteres, letras maiúsculas/minúsculas, número e caractere especial (!@#$).
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleChangePassword}
                  disabled={isSubmitting}
                  className="flex-1 h-12 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : "Salvar Nova Senha"}
                </button>
                <button 
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1 h-12 bg-zinc-100 text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all font-sans"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeactivatingAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900">Desativar Minha Conta</h3>
                <button onClick={() => setIsDeactivatingAccount(false)} className="text-zinc-400 hover:text-zinc-600">
                  <ArrowLeft size={20} className="rotate-90 md:rotate-0" />
                </button>
              </div>

              <div className="p-4 bg-amber-50 text-amber-700 border border-amber-100 rounded-xl text-[10px] font-bold leading-relaxed">
                Atenção: Ao desativar sua conta, seu acesso será bloqueado. Seus registros acadêmicos e de alocação serão preservados como "Inativos". A reativação exige aprovação administrativa.
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[10px] font-bold">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {passwordSuccess}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Confirme sua senha para continuar</label>
                <input 
                  type="password"
                  value={deactivatePassword}
                  onChange={e => setDeactivatePassword(e.target.value)}
                  className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-rose-500/20"
                  placeholder="Sua senha atual"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={handleDeactivateAccount}
                  disabled={isSubmitting || !!passwordSuccess}
                  className="flex-1 h-12 bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Confirmar Desativação"}
                </button>
                <button 
                  onClick={() => setIsDeactivatingAccount(false)}
                  disabled={isSubmitting || !!passwordSuccess}
                  className="flex-1 h-12 bg-zinc-100 text-zinc-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all font-sans disabled:opacity-50"
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
export default TeacherProfileView;

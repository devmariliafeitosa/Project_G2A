import React, { useState, useMemo } from 'react';
import { AlertTriangle, X, CheckCircle2, Edit3, Check, Eye, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { User } from '../../index';

const CoordProfileView = ({ user, onUpdate, onDeactivate }: { 
  user: User, 
  onUpdate: (updates: Partial<User>) => Promise<void>,
  onDeactivate: (password: string) => Promise<void>
}) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    birthDate: user.birthDate || '',
    email: user.email || '',
    phone: user.phone || '',
    areaAtuacao: user.areaAtuacao || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Deactivation states
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const hasChanges = useMemo(() => {
    return formData.name !== (user.name || '') ||
           formData.birthDate !== (user.birthDate || '') ||
           formData.email !== (user.email || '') ||
           formData.phone !== (user.phone || '') ||
           formData.areaAtuacao !== (user.areaAtuacao || '');
  }, [formData, user]);

  const validate = () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.areaAtuacao.trim()) {
      return "Campos obrigatórios: Nome, E-mail institucional e Área de atuação.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "E-mail institucional inválido.";
    }
    // Simple phone regex for (XX) XXXXX-XXXX or similar
    const phoneRegex = /^(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      return "Telefone em formato inválido.";
    }
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onUpdate(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError("Falha ao salvar alterações.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatePassword) {
      setDeactivateError("A senha é obrigatória para confirmar a desativação.");
      return;
    }
    setDeactivating(true);
    setDeactivateError(null);
    try {
      await onDeactivate(deactivatePassword);
    } catch (err: any) {
      setDeactivateError(err.message || "Erro ao desativar conta.");
      setDeactivating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight">Meu Perfil</h1>
        <p className="text-zinc-500 text-sm font-medium">Gerencie suas informações pessoais e acadêmicas.</p>
      </header>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in slide-in-from-top-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-600 text-xs font-bold animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} />
          Alterações salvas com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Edit3 size={18} className="text-emerald-500" />
            <h2 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5">Informações Editáveis</h2>
          </div>
          
          <div className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-sm space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Nome Completo:*</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-emerald-500/30 transition-all text-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Data de Nascimento:</label>
              <input 
                type="date" 
                value={formData.birthDate}
                onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-emerald-500/30 transition-all text-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">E-mail Institucional:*</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-emerald-500/30 transition-all text-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Telefone:</label>
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-emerald-500/30 transition-all text-zinc-700"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">Área de Atuação:*</label>
              <input 
                type="text" 
                value={formData.areaAtuacao}
                onChange={e => setFormData({ ...formData, areaAtuacao: e.target.value })}
                className="w-full h-12 bg-zinc-50 border border-zinc-100 rounded-xl px-4 text-sm font-bold outline-none focus:border-emerald-500/30 transition-all text-zinc-700"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Eye size={18} className="text-zinc-300" />
            <h2 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.2em] mb-0.5">Apenas Visualização</h2>
          </div>
          
          <div className="bg-zinc-100/50 border border-zinc-50 rounded-[2rem] p-8 shadow-inner space-y-6">
            <div className="grid grid-cols-1 gap-6">
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Matrícula SIAPE</p>
                  <p className="text-sm font-black text-zinc-600">{user.siape || 'Não informado'}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">CPF</p>
                  <p className="text-sm font-black text-zinc-600">{user.cpf || 'Não informado'}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Ano de Ingresso</p>
                  <p className="text-sm font-black text-zinc-600">{user.ingressoYear || '2015'}</p>
               </div>
               <div className="space-y-1">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Login de Acesso</p>
                  <p className="text-sm font-black text-zinc-600">{user.email || 'maria.silva'}</p>
               </div>
               <div className="space-y-1 pt-4 border-t border-zinc-200/50">
                  <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Vínculo Institucional</p>
                  <p className="text-sm font-black text-emerald-600">{user.role} • {user.campus}</p>
               </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-4">
             <button 
                onClick={() => setShowDeactivateModal(true)}
                className="h-10 px-6 text-zinc-400 hover:text-rose-500 transition-all text-[10px] font-black uppercase tracking-widest underline underline-offset-4"
              >
                Desativar minha conta
              </button>
            <AnimatePresence>
              {hasChanges && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleSave}
                  disabled={loading}
                  className="h-14 px-10 bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check size={18} />
                      Salvar Alterações
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <AnimatePresence>
        {showDeactivateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-500" />
              
              <div className="space-y-6">
                <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                  <AlertTriangle size={32} />
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-black text-zinc-800 tracking-tight uppercase">DESATIVAR CONTA?</h3>
                  <p className="text-sm text-zinc-500 font-medium">
                    Esta ação é intencional. Seu acesso será bloqueado, mas seu histórico institucional será preservado.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest pl-1">CONFIRME SUA SENHA:*</label>
                  <input 
                    type="password" 
                    value={deactivatePassword}
                    onChange={e => setDeactivatePassword(e.target.value)}
                    className="w-full h-12 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm font-bold outline-none focus:border-rose-500/30 transition-all text-zinc-700"
                    placeholder="Sua senha atual"
                  />
                  {deactivateError && <p className="text-[10px] text-rose-500 font-bold uppercase mt-1 pl-1">{deactivateError}</p>}
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <button 
                    onClick={handleDeactivate}
                    disabled={deactivating}
                    className="h-12 bg-rose-500 text-white rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {deactivating ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : "DESATIVAR CONTA AGORA"}
                  </button>
                  <button 
                    onClick={() => {
                      setShowDeactivateModal(false);
                      setDeactivatePassword('');
                      setDeactivateError(null);
                    }}
                    disabled={deactivating}
                    className="h-12 text-zinc-400 font-bold text-[11px] uppercase tracking-widest hover:text-zinc-600 transition-all"
                  >
                    Não, quero continuar ativo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default CoordProfileView;

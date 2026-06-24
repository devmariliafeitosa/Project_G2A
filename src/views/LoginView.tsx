import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Activity } from 'lucide-react';
import { motion } from 'motion/react';

const LoginView = ({ onLogin }: { onLogin: (email: string, pass: string) => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; pass?: string }>({});
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; pass?: string } = {};
    if (!email) newErrors.email = 'Campo obrigatório';
    if (!isForgotMode && !pass) newErrors.pass = 'Campo obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (validate()) {
      setLoading(true);
      setMessage(null);
      try {
        await onLogin(email, pass);
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleForgot = async () => {
    if (validate()) {
      setLoading(true);
      setMessage(null);
      try {
        const res = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao processar solicitação");
        setMessage({ type: 'success', text: "Link de recuperação enviado!" });
      } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 font-sans">
      <div className="w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[600px]">
        {/* Left Side: Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col items-center justify-center space-y-6 relative">
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-[#32a041] rounded-full flex items-center justify-center text-white mb-2">
              <BookOpen size={24} />
            </div>
            <span className="text-xl font-black text-[#58595b] tracking-tight text-center">GESTÃO DE ALOCAÇÃO ACADÊMICA</span>
          </div>

          <h2 className="text-lg font-bold text-zinc-700">{isForgotMode ? 'Recuperar Senha' : 'Login'}</h2>

          {message && (
            <div className={`w-full max-w-sm p-3 rounded-lg text-xs font-bold text-center ${message.type === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
              {message.text}
            </div>
          )}

          {!message && (
            <div className="w-full max-w-sm bg-white border border-[#32a041] rounded-xl p-4 text-center">
              <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                Login é <strong>exclusivo</strong> para usuários credenciados
              </p>
            </div>
          )}

          <div className="w-full max-w-sm space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Login:*</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full h-11 ${errors.email ? 'bg-rose-50 border-rose-300' : 'bg-[#fffbec] border-zinc-200'} border rounded-lg px-4 text-sm outline-none transition-all`}
                placeholder="E-mail ou SIAPE"
              />
              {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.email}</p>}
            </div>

            {!isForgotMode && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Senha:*</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                    className={`w-full h-11 ${errors.pass ? 'bg-rose-50 border-rose-300' : 'bg-[#fffbec] border-zinc-200'} border rounded-lg px-4 text-sm outline-none transition-all pr-10`}
                    placeholder="Sua senha"
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.pass && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.pass}</p>}
                <div className="text-right">
                  <button
                    onClick={() => { setIsForgotMode(true); setMessage(null); }}
                    className="text-[11px] text-[#32a041] font-bold hover:underline"
                  >
                    Esqueci a senha
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full max-w-sm gap-3 items-center">
            <button
              onClick={isForgotMode ? handleForgot : handleLogin}
              disabled={loading}
              className="w-full max-w-[180px] h-10 bg-[#32a041] text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#2b8a38] transition-all shadow-md flex items-center justify-center disabled:opacity-50"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isForgotMode ? 'Enviar' : 'Entrar')}
            </button>
            {isForgotMode && (
              <button
                onClick={() => { setIsForgotMode(false); setMessage(null); }}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest"
              >
                Voltar ao Login
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Welcome Banner */}
        <div className="hidden md:flex md:w-1/2 bg-[#32a041] p-12 flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10 transition-transform duration-500 hover:translate-x-2">
            <p className="text-lg font-medium opacity-90 uppercase tracking-[0.2em] mb-4">Bem-vindo ao</p>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter">
              SISTEMA DE GESTÃO <br />
              ACADÊMICA IFCE TAUÁ
            </h1>
          </div>

          <div className="relative z-10 flex justify-center py-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 shadow-2xl"
            >
              <Activity size={80} className="text-white opacity-80" />
            </motion.div>
          </div>

          <div className="relative z-10">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Versão Web: 1.0.0 (c764035)</p>
          </div>

          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-900/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;

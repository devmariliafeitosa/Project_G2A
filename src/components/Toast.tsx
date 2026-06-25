import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertTriangle, Info } from 'lucide-react';

export interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  alert: ToastState | null;
}

const Toast = ({ alert }: ToastProps) => (
  <AnimatePresence>
    {alert && (
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-xs font-black uppercase tracking-wider
          ${alert.type === 'success' ? 'bg-[#32a041]/95 text-white border-emerald-600 backdrop-blur-md' : ''}
          ${alert.type === 'error'   ? 'bg-rose-600/95 text-white border-rose-700 backdrop-blur-md' : ''}
          ${alert.type === 'info'    ? 'bg-zinc-900/95 text-white border-zinc-800 backdrop-blur-md' : ''}
        `}
      >
        {alert.type === 'success' && <Check size={16} strokeWidth={3} />}
        {alert.type === 'error'   && <AlertTriangle size={16} strokeWidth={3} />}
        {alert.type === 'info'    && <Info size={16} strokeWidth={3} />}
        <span>{alert.message}</span>
      </motion.div>
    )}
  </AnimatePresence>
);

export const useToast = () => {
  const [alert, setAlert] = React.useState<ToastState | null>(null);
  const showToast = (message: string, type: ToastState['type']) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 5000);
  };
  return { alert, showToast };
};

export default Toast;

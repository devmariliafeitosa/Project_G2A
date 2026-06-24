import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItemProps {
  icon: any;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: number;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, badge }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
      active
        ? 'bg-primary text-white shadow-sm'
        : 'text-zinc-600 hover:bg-zinc-50 hover:text-primary'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
    <AnimatePresence>
      {badge !== undefined && badge > 0 && (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={badge}
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white text-primary' : 'bg-rose-500 text-white'}`}
        >
          {badge}
        </motion.span>
      )}
    </AnimatePresence>
  </button>
);

export default SidebarItem;

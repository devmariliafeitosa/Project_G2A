import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'alert' | 'highlight';
}

const Badge = ({ children, variant = 'default' }: BadgeProps) => {
  const styles = {
    default: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    alert: 'bg-rose-50 text-rose-600 border-rose-100',
    highlight: 'bg-primary/10 text-primary border-primary/20'
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles[variant]}`}>
      {children}
    </span>
  );
};

export default Badge;

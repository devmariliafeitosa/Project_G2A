import React from 'react';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  subtext: string;
  icon: React.ReactNode;
  iconBg?: string;
  valueClass?: string;
  className?: string;
}

const StatCard = ({ label, value, subtext, icon, iconBg = 'bg-zinc-50 text-zinc-400', valueClass = 'text-zinc-800', className = '' }: StatCardProps) => (
  <div className={`bg-white border border-zinc-150 p-5 rounded-3xl shadow-xs space-y-3 ${className}`}>
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{label}</span>
      <div className={`p-2 rounded-xl ${iconBg}`}>{icon}</div>
    </div>
    <div>
      <h4 className={`text-2xl font-black leading-none ${valueClass}`}>{value}</h4>
      <p className="text-[9px] text-zinc-500 font-semibold mt-1">{subtext}</p>
    </div>
  </div>
);

export default StatCard;

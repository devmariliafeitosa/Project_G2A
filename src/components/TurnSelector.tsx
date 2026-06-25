import React from 'react';

interface TurnSelectorProps {
  value: string;
  onChange: (turn: string) => void;
  variant?: 'compact' | 'normal';
}

const TURNS = ['Manhã', 'Tarde', 'Noite', 'Todos'];

const TurnSelector = ({ value, onChange, variant = 'normal' }: TurnSelectorProps) => (
  <div className="flex flex-col sm:flex-row justify-between items-center bg-zinc-50/50 border border-zinc-150 rounded-xl p-2.5 gap-3">
    <div className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full bg-[#32a041] animate-pulse" />
      <p className="text-[10px] font-black uppercase text-zinc-650 tracking-wider">
        Turno: <span className="text-[#32a041]">{value}</span>
      </p>
    </div>
    <div className="flex bg-zinc-200/50 p-0.5 rounded-lg border border-zinc-250 shrink-0 gap-0.5 select-none">
      {TURNS.map(t => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`px-3 py-1.5 text-[8.5px] font-black uppercase tracking-widest rounded-md transition-all outline-none cursor-pointer
            ${value === t ? 'bg-[#32a041] text-white shadow-xs' : 'text-zinc-550 hover:text-zinc-805'}
          `}
        >
          {t}
        </button>
      ))}
    </div>
  </div>
);

export default TurnSelector;

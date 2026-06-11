import React from 'react';
import { Clock, Activity } from 'lucide-react';

const SettingsView = () => (
  <div className="space-y-8 animate-in fade-in duration-500">
    <header>
      <h1 className="text-2xl font-bold text-zinc-900">Cronograma do Campus</h1>
      <p className="text-zinc-500 text-sm">Ajustes globais do sistema.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-lg border border-zinc-200 space-y-6 shadow-sm">
        <div className="flex items-center gap-3 text-zinc-900">
          <Clock size={20} className="text-primary" />
          <h3 className="font-bold">Turnos de Aula</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Manhã', range: '07:25 às 11:45' },
            { label: 'Tarde', range: '13:00 às 17:20' },
            { label: 'Noite', range: '18:20 às 22:40' }
          ].map(shift => (
            <div key={shift.label} className="p-4 bg-zinc-50 rounded-lg flex items-center justify-between border border-zinc-100">
              <span className="text-xs font-bold uppercase text-zinc-400">{shift.label}</span>
              <span className="text-sm font-medium text-zinc-800">{shift.range}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-zinc-200 flex flex-col justify-center items-center text-center space-y-4 shadow-sm">
         <div className="w-16 h-16 bg-zinc-50 rounded-lg flex items-center justify-center text-zinc-300">
           <Activity size={32} />
         </div>
         <div>
           <p className="text-sm font-bold text-zinc-900">Unidade de Tempo</p>
           <p className="text-2xl font-bold text-primary">50 Minutos / Crédito</p>
           <p className="text-xs text-zinc-500 mt-2">Métrica normativa oficial do IFCE.</p>
         </div>
      </div>
    </div>
  </div>
);

// --- Main App ----e 
export default SettingsView;

import React from 'react';
import { Plus, X, Clock } from 'lucide-react';
import { DAYS, TIME_SLOTS, PASTEL_COLORS } from '../../constants';
import type { User, Subject, ScheduleEntry } from '../../index';

interface WeeklyGridProps {
  allocations: ScheduleEntry[];
  subjects: Subject[];
  teachers: User[];
  onDeleteAllocation: (id: string) => void;
  onOpenAddModal: (day: string, slotId: string) => void;
  selectedTurn?: string;
}

const ACTIVE_SLOTS = TIME_SLOTS.filter(s => !s.isBreak);

const WeeklyGrid = ({ allocations, subjects, teachers, onDeleteAllocation, onOpenAddModal, selectedTurn = 'Todos' }: WeeklyGridProps) => {
    const filteredSlots = ACTIVE_SLOTS.filter(slot => {
    if (selectedTurn === 'Manhã') return slot.id.startsWith('m');
    if (selectedTurn === 'Tarde') return slot.id.startsWith('t');
    if (selectedTurn === 'Noite') return slot.id.startsWith('n');
    return true;
  });

  return (
<div className="p-4 sm:p-8 overflow-x-auto">
    <table className="w-full min-w-[900px] border-collapse">
      <thead>
        <tr>
          <th className="p-4 text-left text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b border-r border-zinc-100 w-40">
            Horário / Aula
          </th>
          {DAYS.map(day => (
            <th key={day} className="p-4 text-center text-[10px] font-black uppercase text-zinc-800 tracking-widest border-b border-zinc-100">
              {day}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filteredSlots.map(slot => (
          <tr key={slot.id} className="border-b border-zinc-50 hover:bg-zinc-50/20 transition-all">
            <td className="p-4 border-r border-zinc-100 font-semibold space-y-1">
              <p className="text-xs text-zinc-700">{slot.label}</p>
              <div className="flex items-center gap-1.5">
                <Clock size={10} className="text-zinc-400" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{slot.period}</span>
              </div>
            </td>
            {DAYS.map(day => {
              const allocation = allocations.find(a => a.dayOfWeek === day && a.timeSlotId === slot.id);
              const subject = allocation ? subjects.find(s => s.id === allocation.subjectId) : null;
              const teacher = allocation ? teachers.find(t => t.id === allocation.teacherId) : null;

              return (
                <td key={day} className="p-2 border-r border-zinc-50 w-44">
                  {allocation && subject && teacher ? (
                    <div className={`group relative p-4 rounded-2xl border transition-all shadow-sm ${subject.color || PASTEL_COLORS[0]} hover:scale-[1.02] hover:shadow-md`}>
                      <button
                        onClick={() => {
                          if (confirm(`Deseja remover a alocação de ${subject.name}?`)) {
                            onDeleteAllocation(allocation.id);
                          }
                        }}
                        className="absolute top-2 right-2 w-5 h-5 rounded-full bg-black/5 hover:bg-rose-500 hover:text-white flex items-center justify-center text-zinc-600 transition-all opacity-0 group-hover:opacity-100"
                        title="Remover alocação"
                      >
                        <X size={12} />
                      </button>
                      <div className="space-y-1 pr-3">
                        <p className="text-[10px] font-black uppercase tracking-tight text-zinc-800 line-clamp-2 leading-tight">
                          {subject.name}
                        </p>
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] font-black uppercase tracking-wider text-black/40">
                            P{subject.period} • {subject.workload}h
                          </span>
                        </div>
                        <div className="text-[10px] font-bold text-zinc-600 truncate pt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {teacher.name.split(' ')[0]} {teacher.name.split(' ').pop()}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenAddModal(day, slot.id)}
                      className="w-full h-[72px] border-2 border-dashed border-zinc-100 hover:border-[#32a041]/30 rounded-2xl flex items-center justify-center text-zinc-300 hover:text-[#32a041] hover:bg-[#32a041]/5 transition-all group/cell"
                      title="Clique para vincular disciplina"
                    >
                      <Plus size={16} className="transition-transform group-hover/cell:scale-125" />
                    </button>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)};

export default WeeklyGrid;
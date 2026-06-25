import React from 'react';
import { Plus, Info, Sparkles } from 'lucide-react';
import { User as UserType, Subject, ScheduleEntry } from '../../index';

const TIME_SLOTS = [
  { id: 'm1', label: '07:25 às 08:25' }, { id: 'm2', label: '08:25 às 09:25' },
  { id: 'm3', label: '09:45 às 10:45' }, { id: 'm4', label: '10:45 às 11:45' },
  { id: 't1', label: '13:00 às 14:00' }, { id: 't2', label: '14:00 às 15:00' },
  { id: 't3', label: '15:20 às 16:25' }, { id: 't4', label: '16:25 às 17:30' },
  { id: 'n1', label: '18:30 às 19:30' }, { id: 'n2', label: '19:30 às 20:30' },
  { id: 'n3', label: '20:40 às 21:40' }, { id: 'n4', label: '21:40 às 22:40' },
];

interface AllocationFormProps {
  offeredSubjects: Subject[];
  activeTeachers: UserType[];
  allocations: ScheduleEntry[];
  selectedSemester: string;
  allocatedSubjectId: string;
  allocatedTeacherId: string;

  selectedSlots: { day: string; slotId: string }[];
  requiredSlotsCount: number;
  formProgress: number;
  selectedSubject: Subject | undefined;
  selectedTeacher: UserType | undefined;
  getTeacherTimeLimit: (t: UserType) => number;
  preferencesSummary: UserType[];
  anyCoursePreferences: boolean;
  onSubjectChange: (id: string) => void;
  onTeacherChange: (id: string) => void;

  onClearSlots: () => void;
  onRemoveSlot: (day: string, slotId: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

const StepDot = ({ done, step }: { done: boolean; step: number }) => (
  <div className="absolute -left-[9px] top-0.5 w-[18px] h-[18px] rounded-full bg-white border-2 border-zinc-200 flex items-center justify-center">
    {done
      ? <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
      : <span className="text-[8px] font-black text-zinc-400">{step}</span>
    }
  </div>
);

const AllocationForm = ({
  offeredSubjects, activeTeachers, allocations, selectedSemester,
  allocatedSubjectId, allocatedTeacherId,
  selectedSlots, requiredSlotsCount, formProgress,
  selectedSubject, selectedTeacher, getTeacherTimeLimit,
  preferencesSummary, anyCoursePreferences,
  onSubjectChange, onTeacherChange,
  onClearSlots, onRemoveSlot, onSubmit,
}: AllocationFormProps) => (
  <div className="lg:col-span-4 space-y-6">

    {/* Ficha de Vínculo */}
    <div className="bg-white rounded-[2.5rem] border border-zinc-150 shadow-sm p-8 space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-md font-black text-zinc-900 uppercase">Ficha de Vínculo</h3>
            <p className="text-zinc-400 text-[10px] font-bold">Assistente inteligente de alocação</p>
          </div>
          <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl">{formProgress}% Completo</span>
        </div>
        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#32a041] h-1.5 rounded-full transition-all duration-300" style={{ width: `${formProgress}%` }} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Passo 1 */}
        <div className="space-y-2 border-l-2 pl-4 border-zinc-150 focus-within:border-[#32a041] transition-colors relative">
          <StepDot done={!!allocatedSubjectId} step={1} />
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#58595b]">Passo 1: Disciplina Oferecida *</label>
            {allocatedSubjectId && <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">OK</span>}
          </div>
          <select value={allocatedSubjectId} onChange={e => onSubjectChange(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#32a041] text-zinc-800 shadow-inner focus:bg-white">
            <option value="">-- Escolha a Disciplina ({offeredSubjects.length}) --</option>
            {offeredSubjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name} [{sub.code || sub.id.toUpperCase()}] ({sub.workload}h)</option>
            ))}
          </select>
          {offeredSubjects.length === 0 && <p className="text-[9px] text-zinc-450 italic font-semibold">Nenhuma disciplina cadastrada na oferta do semestre atual.</p>}
          {selectedSubject && (
            <div className="bg-emerald-50/20 border border-emerald-150 p-3.5 rounded-2xl flex flex-col gap-1 text-[11px] animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-zinc-805 uppercase leading-none truncate max-w-[70%]">{selectedSubject.name}</span>
                <span className="text-[8px] font-black bg-[#32a041]/15 text-[#32a041] px-2 py-0.5 rounded uppercase">{selectedSubject.type}</span>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-semibold mt-1">
                <span>Carga: <strong className="text-zinc-800 font-extrabold">{selectedSubject.workload}h</strong></span>
                <span>Horários Necessários: <strong className="text-zinc-805 font-black">{requiredSlotsCount} aulas</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Passo 2 */}
        <div className="space-y-2 border-l-2 pl-4 border-zinc-150 focus-within:border-[#32a041] transition-colors relative">
          <StepDot done={!!allocatedTeacherId} step={2} />
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#58595b]">Passo 2: Docente de Destino *</label>
            {allocatedTeacherId && <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">OK</span>}
          </div>
          <select value={allocatedTeacherId} onChange={e => onTeacherChange(e.target.value)}
            className="w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-xs font-bold outline-none focus:border-[#32a041] text-zinc-800 shadow-inner focus:bg-white">
            <option value="">-- Escolha o Professor ({activeTeachers.length}) --</option>
            {activeTeachers.map(teach => {
              const maxH = getTeacherTimeLimit(teach);
              const wh = allocations.filter(a => a.teacherId === teach.id && a.semester === selectedSemester).length * 2;
              return <option key={teach.id} value={teach.id}>{teach.name} ({wh}h / max {maxH}h)</option>;
            })}
          </select>
          {selectedTeacher && (() => {
            const maxH = getTeacherTimeLimit(selectedTeacher);
            const wh = allocations.filter(a => a.teacherId === selectedTeacher.id && a.semester === selectedSemester).length * 2;
            const pct = Math.min(100, Math.round((wh / maxH) * 100));
            return (
              <div className="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-150 text-[11px] space-y-2 animate-in fade-in duration-200">
                <div className="flex justify-between text-[9px] font-black uppercase text-zinc-400">
                  <span>Carga: {wh}h / {maxH}h</span><span>{pct}%</span>
                </div>
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${pct > 90 ? 'bg-rose-500' : 'bg-[#32a041]'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-zinc-450">
                  <span>Disponível: <strong className="text-zinc-700">{maxH - wh}h restantes</strong></span>
                  <span className="uppercase tracking-widest">{selectedTeacher.regime}</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Passo 3 */}
        <div className="space-y-2 border-l-2 pl-4 border-zinc-150 relative">
          <StepDot done={selectedSlots.length === requiredSlotsCount && requiredSlotsCount > 0} step={3} />
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#58595b]">Passo 3: Escolha na Grade</label>
            <span className="text-[8px] font-extrabold text-[#32a041] bg-emerald-50 px-1.5 py-0.5 rounded">MULTISELEÇÃO</span>
          </div>
          <p className="text-[10px] text-zinc-450 leading-normal font-medium">
            {allocatedSubjectId
              ? <>Clique nos blocos livres na <strong>Grade</strong> para preencher os <strong className="text-zinc-800">{requiredSlotsCount} horários</strong> necessários.</>
              : <>Selecione uma disciplina (Passo 1) para habilitar as células.</>}
          </p>
          {selectedSlots.length > 0 && (
            <div className="bg-zinc-50 border border-zinc-200 p-2.5 rounded-xl space-y-1.5 max-h-[140px] overflow-y-auto">
              <div className="flex justify-between items-center text-[8px] font-black text-zinc-400 uppercase tracking-widest">
                <span>Horários Selecionados</span>
                <button type="button" onClick={onClearSlots} className="hover:text-rose-600 transition-colors uppercase font-black text-[7px]">Limpar Tudo</button>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedSlots.map((s, idx) => (
                  <span key={idx} className="text-[9px] font-black uppercase bg-[#32a041]/10 text-[#32a041] px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 leading-none">
                    {s.day.substring(0, 3)} • {TIME_SLOTS.find(ts => ts.id === s.slotId)?.label.split(' ')[0]}
                    <button type="button" onClick={() => onRemoveSlot(s.day, s.slotId)} className="hover:text-rose-600 font-extrabold text-xs ml-0.5">×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>


        {selectedTeacher?.leaveType && selectedTeacher.leaveType !== 'Nenhum' && (
          <div className="pl-4">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-2.5">
              <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-amber-700 uppercase leading-normal">
                Afastamento: {selectedTeacher.name} possui afastamento registrado ({selectedTeacher.leaveType}).
              </p>
            </div>
          </div>
        )}

        <button type="submit" disabled={selectedSlots.length !== requiredSlotsCount}
          className={`w-full h-12 text-xs font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2
            ${selectedSlots.length !== requiredSlotsCount
              ? 'bg-zinc-100 border border-zinc-200 text-zinc-300 cursor-not-allowed shadow-none'
              : 'bg-[#32a041] hover:bg-[#277c32] text-white'}`}>
          <Plus size={14} strokeWidth={3} />
          {selectedSlots.length === requiredSlotsCount
            ? <>CONFIRMAR ALOCAÇÃO ({selectedSlots.length}/{requiredSlotsCount})</>
            : <>SELECIONE MAIS {requiredSlotsCount - selectedSlots.length} HORÁRIO(S)</>}
        </button>
      </form>
    </div>

    {/* Preferências Docentes */}
    <div className="bg-white rounded-[2.5rem] border border-zinc-150 shadow-sm p-8 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-md font-black text-zinc-900 uppercase">Preferências Docentes</h3>
          <p className="text-[10px] text-zinc-400 font-semibold italic">Professores interessados nesta matéria.</p>
        </div>
        <Sparkles size={16} className="text-amber-400 animate-pulse mt-1" />
      </div>
      <div className="space-y-2">
        {!anyCoursePreferences ? (
          <div className="p-5 text-center bg-zinc-50 border border-zinc-150 rounded-2xl space-y-2">
            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider block">Nenhuma preferência registrada.</span>
          </div>
        ) : preferencesSummary.length === 0 ? (
          <div className="p-4 text-center bg-zinc-50 border border-zinc-150 rounded-2xl">
            <p className="text-[10px] text-zinc-400 font-bold uppercase">Nenhum professor elegeu esta disciplina como preferência.</p>
          </div>
        ) : preferencesSummary.map(prefTeach => (
          <div key={prefTeach.id}
            className="p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer hover:bg-emerald-50/20 hover:border-emerald-250 border-zinc-150 bg-white transition-all">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-black text-zinc-800 leading-tight uppercase truncate">{prefTeach.name}</p>
              <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{prefTeach.regime}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AllocationForm;

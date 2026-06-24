import React from 'react';
import { Trash2, Calendar } from 'lucide-react';
import { AcademicSemester } from '../../index';

interface PeriodGroup {
  identification: string;
  semestersList: AcademicSemester[];
}

interface SemesterCardProps {
  period: PeriodGroup;
  onEdit: (sem: AcademicSemester) => void;
  onDeletePeriod?: (ident: string) => void;
}

const SemesterCard = ({ period, onEdit, onDeletePeriod }: SemesterCardProps) => {
  const totalSubjectsNum = period.semestersList.reduce((sum, s) => sum + (s.offeredSubjectIds?.length || 0), 0);
  const activeMatrixOnes = period.semestersList.filter(s => s.status === 'Ativo').map(s => s.matrixSemester || 1).sort((a, b) => a - b);

  return (
    <div className="py-5 flex flex-col justify-between gap-3 group">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-md font-extrabold text-zinc-800 tracking-tight">Período Letivo {period.identification}</span>
            {activeMatrixOnes.length > 0 ? (
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-250/20">Planejamento Aberto</span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-zinc-50 text-zinc-400 border border-zinc-150">Finalizado / Fechado</span>
            )}
          </div>

          <div className="text-[10px] text-zinc-500 font-semibold space-y-1">
            <span className="text-zinc-400 text-[9px] block uppercase font-bold">Estruturas salvas no período:</span>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {period.semestersList.map(sem => (
                <button key={sem.id} onClick={() => onEdit(sem)}
                  className={`px-2 py-1 rounded-lg border text-[9px] font-black uppercase tracking-tight flex items-center gap-1.5 transition-all active:scale-95 ${sem.status === 'Ativo' ? 'bg-emerald-50 border-emerald-200 text-[#32a041]' : 'bg-zinc-50 border-zinc-200 text-zinc-500'}`}>
                  <span>{sem.matrixSemester || 1}º Semestre</span>
                  <span className="text-[8px] font-semibold text-zinc-405">({sem.offeredSubjectIds?.length || 0} Disc)</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {onDeletePeriod && (
          <div className="flex items-center gap-1.5 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button type="button" onClick={() => onDeletePeriod(period.identification)}
              className="w-8 h-8 rounded-lg active:scale-90 flex items-center justify-center bg-zinc-50 border border-zinc-150 text-zinc-400 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-605 transition-all shadow-sm">
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wide bg-zinc-50/50 p-2 rounded-xl border border-zinc-100">
        <span>Total de Ofertas: {totalSubjectsNum} disciplinas</span>
        <span className="px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-500 font-extrabold">
          Ativos: {activeMatrixOnes.length > 0 ? activeMatrixOnes.map(n => `${n}º`).join(', ') : 'Nenhum'}
        </span>
      </div>
    </div>
  );
};

export default SemesterCard;

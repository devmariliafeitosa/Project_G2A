export const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const TIME_SLOTS = [
  { id: 'm1', label: '07:25 às 08:25', period: 'Manhã' },
  { id: 'm2', label: '08:25 às 09:25', period: 'Manhã' },
  { id: 'm-int', label: '09:25 às 09:45', period: 'Intervalo', isBreak: true },
  { id: 'm3', label: '09:45 às 10:45', period: 'Manhã' },
  { id: 'm4', label: '10:45 às 11:45', period: 'Manhã' },
  { id: 'lunch', label: '11:45 às 13:00', period: 'Almoço', isBreak: true },
  { id: 't1', label: '13:00 às 14:00', period: 'Tarde' },
  { id: 't2', label: '14:00 às 15:00', period: 'Tarde' },
  { id: 't-int', label: '15:00 às 15:20', period: 'Intervalo', isBreak: true },
  { id: 't3', label: '15:20 às 16:25', period: 'Tarde' },
  { id: 't4', label: '16:25 às 17:30', period: 'Tarde' },
];

export const PASTEL_COLORS = [
  'bg-rose-100 border-rose-200 text-rose-700',
  'bg-blue-100 border-blue-200 text-blue-700',
  'bg-emerald-100 border-emerald-200 text-emerald-700',
  'bg-amber-100 border-amber-200 text-amber-700',
  'bg-indigo-100 border-indigo-200 text-indigo-700',
  'bg-orange-100 border-orange-200 text-orange-700',
  'bg-purple-100 border-purple-200 text-purple-700',
  'bg-teal-100 border-teal-200 text-teal-700',
];

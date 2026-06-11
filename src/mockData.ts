import { Level, CourseType, WorkRegime, LeaveType, UserRole } from './index';
import type { User, Course, Subject, ScheduleEntry, AcademicSemester } from './index';
import { PASTEL_COLORS } from './constants';

export const INITIAL_TEACHERS: User[] = [];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c1',
    name: 'Análise e Desenvolvimento de Sistemas',
    campus: 'Tauá',
    level: Level.Superior,
    type: CourseType.Tecnologia,
    durationType: 'Semestral',
    coordinatorId: '99'
  },
  {
    id: 'c2',
    name: 'Licenciatura em Telemática',
    campus: 'Tauá',
    level: Level.Superior,
    type: CourseType.Licenciatura,
    durationType: 'Semestral'
  }
];

export const INITIAL_SUBJECTS: Subject[] = [
  // ADS 1º Período
  { id: 's6',    code: '17.301.1',  name: 'Banco de Dados',                    workload: 80, courseId: 'c1', period: 1, type: 'Obrigatória', color: PASTEL_COLORS[0], status: 'Ativa' },
  { id: 'sfm1',  code: '17.301.2',  name: 'Fundamentos de Matemática',          workload: 80, courseId: 'c1', period: 1, type: 'Obrigatória', color: PASTEL_COLORS[1], status: 'Ativa' },
  { id: 'sit1',  code: '17.301.3',  name: 'Inglês Técnico',                     workload: 40, courseId: 'c1', period: 1, type: 'Obrigatória', color: PASTEL_COLORS[2], status: 'Ativa' },
  { id: 's3',    code: '17.301.4',  name: 'Introdução à Computação',            workload: 40, courseId: 'c1', period: 1, type: 'Obrigatória', color: PASTEL_COLORS[3], status: 'Ativa' },
  { id: 's1',    code: '17.301.5',  name: 'Introdução à Programação',           workload: 80, courseId: 'c1', period: 1, type: 'Obrigatória', color: PASTEL_COLORS[4], status: 'Ativa' },
  { id: 'spc1',  code: '17.301.6',  name: 'Pensamento Computacional',           workload: 40, courseId: 'c1', period: 1, type: 'Obrigatória', color: PASTEL_COLORS[5], status: 'Ativa' },
  { id: 'stw1',  code: '17.301.7',  name: 'Tecnologias Web',                    workload: 80, courseId: 'c1', period: 1, type: 'Obrigatória', color: PASTEL_COLORS[6], status: 'Ativa' },

  // ADS 2º Período
  { id: 'sce2',  code: '17.301.8',  name: 'Comunicação e Expressão',            workload: 40, courseId: 'c1', period: 2, type: 'Obrigatória', color: PASTEL_COLORS[0], status: 'Ativa' },
  { id: 'semp2', code: '17.301.9',  name: 'Empreendedorismo',                   workload: 40, courseId: 'c1', period: 2, type: 'Obrigatória', color: PASTEL_COLORS[1], status: 'Ativa' },
  { id: 's8',    code: '17.301.10', name: 'Engenharia de Software',              workload: 80, courseId: 'c1', period: 2, type: 'Obrigatória', color: PASTEL_COLORS[2], status: 'Ativa' },
  { id: 's4',    code: '17.301.11', name: 'Estrutura de Dados',                 workload: 80, courseId: 'c1', period: 2, type: 'Obrigatória', color: PASTEL_COLORS[3], prerequisites: ['s1'], status: 'Ativa' },
  { id: 'sers2', code: '17.301.12', name: 'Ética e Responsabilidade',           workload: 40, courseId: 'c1', period: 2, type: 'Obrigatória', color: PASTEL_COLORS[4], status: 'Ativa' },
  { id: 's7',    code: '17.301.13', name: 'Programação Orientada a Objetos',    workload: 80, courseId: 'c1', period: 2, type: 'Obrigatória', color: PASTEL_COLORS[5], status: 'Ativa' },
  { id: 's5',    code: '17.301.14', name: 'Redes de Computadores',              workload: 80, courseId: 'c1', period: 2, type: 'Obrigatória', color: PASTEL_COLORS[6], status: 'Ativa' },

  // ADS 3º Período
  { id: 'saps3', code: '17.301.15', name: 'Análise e Projeto de Sistemas',      workload: 80, courseId: 'c1', period: 3, type: 'Obrigatória', color: PASTEL_COLORS[0], status: 'Ativa' },
  { id: 'sbdn3', code: '17.301.16', name: 'Bancos de Dados Não-Relacionais',    workload: 80, courseId: 'c1', period: 3, type: 'Obrigatória', color: PASTEL_COLORS[1], status: 'Ativa' },
  { id: 'sgp3',  code: '17.301.17', name: 'Gestão de Projetos',                 workload: 80, courseId: 'c1', period: 3, type: 'Obrigatória', color: PASTEL_COLORS[2], status: 'Ativa' },
  { id: 'sihc3', code: '17.301.18', name: 'Interação Humano-Computador',        workload: 40, courseId: 'c1', period: 3, type: 'Obrigatória', color: PASTEL_COLORS[3], status: 'Ativa' },
  { id: 'spdm3', code: '17.301.19', name: 'Programação para Dispositivos Móveis', workload: 80, courseId: 'c1', period: 3, type: 'Obrigatória', color: PASTEL_COLORS[4], status: 'Ativa' },
  { id: 'spw1',  code: '17.301.20', name: 'Programação Web I',                  workload: 80, courseId: 'c1', period: 3, type: 'Obrigatória', color: PASTEL_COLORS[5], status: 'Ativa' },
  { id: 'sso3',  code: '17.301.21', name: 'Sistemas Operacionais',              workload: 80, courseId: 'c1', period: 3, type: 'Obrigatória', color: PASTEL_COLORS[6], status: 'Ativa' },

  // ADS 4º Período
  { id: 'sfsi4', code: '17.301.22', name: 'Fundamentos de Segurança da Informação', workload: 80, courseId: 'c1', period: 4, type: 'Obrigatória', color: PASTEL_COLORS[0], status: 'Ativa' },
  { id: 'sic4',  code: '17.301.23', name: 'Inteligência Computacional',         workload: 80, courseId: 'c1', period: 4, type: 'Obrigatória', color: PASTEL_COLORS[1], status: 'Ativa' },
  { id: 'spps4', code: '17.301.24', name: 'Padrões de Projeto de Software',     workload: 80, courseId: 'c1', period: 4, type: 'Obrigatória', color: PASTEL_COLORS[2], status: 'Ativa' },
  { id: 'spim1', code: '17.301.25', name: 'Projeto Integrador I',               workload: 80, courseId: 'c1', period: 4, type: 'Obrigatória', color: PASTEL_COLORS[3], status: 'Ativa' },
  { id: 'spw2',  code: '17.301.26', name: 'Programação Web II',                 workload: 80, courseId: 'c1', period: 4, type: 'Obrigatória', color: PASTEL_COLORS[4], status: 'Ativa' },
  { id: 'slib4', code: '17.301.35', name: 'Libras',                             workload: 45, courseId: 'c1', period: 4, type: 'Obrigatória', color: PASTEL_COLORS[1], status: 'Ativa' },

  // ADS 5º Período
  { id: 'scd5',  code: '17.301.32', name: 'Ciência de Dados',                   workload: 80, courseId: 'c1', period: 5, type: 'Obrigatória', color: PASTEL_COLORS[0], status: 'Ativa' },
  { id: 'spe5',  code: '17.301.37', name: 'Probabilidade e Estatística',        workload: 80, courseId: 'c1', period: 5, type: 'Obrigatória', color: PASTEL_COLORS[2], status: 'Ativa' },
  { id: 'sdo5',  code: '17.301.27', name: 'Desenvolvimento e Operações',        workload: 80, courseId: 'c1', period: 5, type: 'Obrigatória', color: PASTEL_COLORS[2], status: 'Ativa' },
  { id: 'spim2', code: '17.301.28', name: 'Projeto Integrador II',              workload: 80, courseId: 'c1', period: 5, type: 'Obrigatória', color: PASTEL_COLORS[3], status: 'Ativa' },
  { id: 'stqs5', code: '17.301.30', name: 'Testes e Qualidade de Software',     workload: 80, courseId: 'c1', period: 5, type: 'Obrigatória', color: PASTEL_COLORS[5], status: 'Ativa' },

  // Telemática
  { id: 'stel1', code: 'TEL101',    name: 'Eletromagnetismo',                   workload: 80, courseId: 'c2', period: 1, type: 'Obrigatória', color: PASTEL_COLORS[2], status: 'Ativa' },
];

export const INITIAL_SCHEDULES: ScheduleEntry[] = [
  { id: 'sch1', courseId: 'c1', period: 1, dayOfWeek: 'Segunda', timeSlotId: 'm1', subjectId: 's1', teacherId: '1', semester: '2024.1' },
  { id: 'sch2', courseId: 'c1', period: 1, dayOfWeek: 'Segunda', timeSlotId: 'm2', subjectId: 's1', teacherId: '1', semester: '2024.1' },
  { id: 'sch3', courseId: 'c1', period: 1, dayOfWeek: 'Terça',   timeSlotId: 'm1', subjectId: 's3', teacherId: '99', semester: '2024.1' },
  { id: 'sch4', courseId: 'c1', period: 1, dayOfWeek: 'Quarta',  timeSlotId: 'm1', subjectId: 's1', teacherId: '1', semester: '2024.1' },
  { id: 'sch5', courseId: 'c1', period: 1, dayOfWeek: 'Quarta',  timeSlotId: 'm2', subjectId: 's1', teacherId: '1', semester: '2024.1' },
  { id: 'sch6', courseId: 'c1', period: 2, dayOfWeek: 'Quinta',  timeSlotId: 'm3', subjectId: 's4', teacherId: '3', semester: '2024.1' },
  { id: 'sch7', courseId: 'c1', period: 2, dayOfWeek: 'Quinta',  timeSlotId: 'm4', subjectId: 's4', teacherId: '3', semester: '2024.1' },
  { id: 'sch8', courseId: 'c1', period: 2, dayOfWeek: 'Sexta',   timeSlotId: 'm1', subjectId: 's5', teacherId: '4', semester: '2024.1' },
  { id: 'sch9', courseId: 'c1', period: 2, dayOfWeek: 'Sexta',   timeSlotId: 'm2', subjectId: 's5', teacherId: '4', semester: '2024.1' },
];

export const INITIAL_SEMESTERS: AcademicSemester[] = [
  { id: 'sem-2023-2', identification: '2023.2', status: 'Inativo', acceptPreferences: false, availableForAllocation: true, courseId: 'c1', createdAt: new Date(2023, 7, 10).toISOString() },
  { id: 'sem-2024-1', identification: '2024.1', status: 'Ativo',   acceptPreferences: true,  availableForAllocation: true, courseId: 'c1', createdAt: new Date(2024, 1, 15).toISOString() },
  { id: 'sem-2024-2', identification: '2024.2', status: 'Inativo', acceptPreferences: false, availableForAllocation: true, courseId: 'c1', createdAt: new Date(2024, 6, 20).toISOString() },
];

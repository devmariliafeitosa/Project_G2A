export enum Level {
  Medio = 'Médio',
  Superior = 'Superior',
  Espec = 'Espec./Mestrado/Doutorado'
}
export type UserRole = 'Admin' | 'Coordenador' | 'Professor' | 'Diretor' | 'Vice-Diretor';

export enum WorkRegime {
  DE = '40h/DE (Dedicação Exclusiva)',
  Parcial40 = '40h (Tempo Parcial)',
  Parcial20 = '20h (Tempo Parcial)'
}

export enum LeaveType {
  Nenhum = 'Ativo',
  Mestrado = 'Pós-Graduação (Mestrado)',
  Doutorado = 'Pós-Graduação (Doutorado)',
  PosDoc = 'Pós-Doutorado',
  Cessao = 'Cessão para Serviço Público'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registration: string;
  campus: string;
  regime: WorkRegime;
  leaveType: LeaveType;
  hasReducedWorkload: boolean;
  ingressoYear?: string;
  birthDate?: string;
  areaAtuacao?: string;
  cargaHoraria: number; // In-classroom hours
  disciplinasMinistradas: string[];
  courseId?: string; // If coordinator, which course
  avatarUrl?: string;
  password?: string;
}

export enum CourseType {
  ABI = 'Área Básica de Ingresso (ABI) - Licenciatura/Bacharelado',
  Bacharelado = 'Bacharelado',
  Doutorado = 'Doutorado Acadêmico',
  Especializacao = 'Especialização',
  Extensao = 'Extensão',
  FIC = 'Formação Inicial e Continuada (FIC)',
  Graduacao = 'Graduação',
  GraduacaoBacharelado = 'Graduação Bacharelado',
  GraduacaoLicenciatura = 'Graduação em Licenciatura',
  GraduacaoTecnologica = 'Graduação Tecnológica',
  Licenciatura = 'Licenciatura',
  MestradoAcademico = 'Mestrado Acadêmico',
  MestradoProfissional = 'Mestrado Profissional',
  PosGraduacao = 'Pós-graduação',
  PosTecnico = 'Pós-técnico',
  TecnicoConcomitante = 'Técnico Concomitante',
  TecnicoConcomitanteEJA = 'Técnico Concomitante (EJA)',
  TecnicoIntegrado = 'Técnico Integrado',
  TecnicoIntegradoEJA = 'Técnico Integrado (EJA)',
  TecnicoSubsequente = 'Técnico Subsequente',
  Tecnologia = 'Tecnologia'
}

export interface Course {
  id: string;
  name: string;
  campus: string;
  level: Level;
  type: CourseType;
  durationType: 'Semestral' | 'Anual';
  coordinatorId?: string;
}

export interface Subject {
  id: string;
  name: string;
  workload: number;
  courseId: string;
  period: number; // Semester or Year
  type: 'Obrigatória' | 'Optativa';
  color?: string; // For the pastel colors requested
}

export interface ScheduleEntry {
  id: string;
  courseId: string;
  period: number;
  dayOfWeek: string;
  timeSlotId: string;
  subjectId: string;
}

export interface Allocation {
  id: string;
  subjectId: string;
  teacherId: string;
  semester: string;
  year: number;
}

export interface TeacherPreference {
  id: string;
  teacherId: string;
  subjectIds: string[];
  availabilityNotes: string;
  lastUpdated: string;
}

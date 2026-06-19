export enum Level {
  Medio = 'Médio',
  Tecnico = 'Técnico',
  Superior = 'Superior',
  PosGraduacao = 'Pós-Graduação'
}

export enum CourseType {
  Bacharelado = 'Bacharelado',
  Licenciatura = 'Licenciatura',
  Tecnologia = 'Tecnologia',
  Integrado = 'Médio Integrado',
  Graduacao = 'Graduação'
}

export enum UserRole {
  Admin = 'Admin',
  Coordenador = 'Coordenador',
  Professor = 'Professor',
  Diretor = 'Diretor',
  ViceDiretor = 'Vice-Diretor'
}

export type { UserRole as UserRoleType };

export enum WorkRegime {
  DE = 'Dedicação Exclusiva',
  R20 = '20 Horas',
  R40 = '40 Horas'
}

export enum LeaveType {
  Nenhum = 'Nenhum',
  Capacitacao = 'Capacitação',
  Saude = 'Saúde',
  Maternidade = 'Maternidade',
  Especial = 'Licença Especial'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  registration: string;
  siape?: string;
  campus: string;
  regime: WorkRegime;
  leaveType: LeaveType;
  hasReducedWorkload: boolean;
  cargaHoraria?: number;
  disciplinasMinistradas?: string[];
  areaAtuacao?: string;
  status?: 
    | 'Ativo'
    | 'Inativo'
    | 'Afastamento'
    | 'Substituição';
  birthDate?: string;
  phone?: string;
  cpf?: string;
  ingressoYear?: string;
  login?: string;
  hasTeachingRole?: boolean;
}

export interface Course {
  id: string;
  name: string;
  campus: string;
  level: Level;
  type: CourseType;
  durationType: 'Semestral' | 'Anual';
  coordinatorId?: string;
  teacherIds?: string[];
}

export interface Subject {
  id: string;
  code?: string;
  name: string;
  workload: number;
  courseId: string;
  period: number;
  type: 'Obrigatória' | 'Opcional';
  color?: string;
  prerequisites?: string[];
  status?: 'Ativa' | 'Inativa';
}

export interface ScheduleEntry {
  id: string;
  courseId: string;
  period: number;
  dayOfWeek: string;
  timeSlotId: string;
  subjectId: string;
  teacherId?: string;
  semester?: string;
  room?: string;
  block?: string;
}

export interface AcademicSemester {
  id: string;
  identification: string;
  status: 'Ativo' | 'Inativo';
  acceptPreferences: boolean;
  availableForAllocation: boolean;
  courseId: string;
  createdAt: string;
  offeredSubjectIds?: string[];
  matrixSemester?: number;
  activeSemesters?: number[];
  startDate?: string;
  endDate?: string;
  durationSemesters?: number;
  turn?: string;
}

export enum NotificationType {
  Alerta = 'Alerta',
  Solicitacao = 'Solicitação',
  Atualizacao = 'Atualização',
  Erro = 'Erro',
  Preferencia = 'Preferência',
  Alocacao = 'Alocação',
  Afastamento = 'Afastamento'
}

export enum NotificationPriority {
  Alta = 'Alta',
  Media = 'Média',
  Baixa = 'Baixa'
}

export enum NotificationStatus {
  Lida = 'Lida',
  NaoLida = 'Não lida',
  Arquivada = 'Arquivada'
}

export interface Notification {
  id: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  relatedPath?: string;
}

export interface ReportHistory {
  id: string;
  name: string;
  date: string;
  user: string;
}

export type OccurrenceType = 'Afastamento' | 'Substituição' | 'Alteração de Vínculo' | 'Remanejamento' | 'Licença';
export type OccurrenceStatus = 'Ativa' | 'Concluída';

export interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  user: string;
}

export interface Occurrence {
  id: string;
  type: OccurrenceType;
  status: OccurrenceStatus;
  teacherId: string;
  substituteTeacherId?: string;
  startDate: string;
  endDate?: string;
  reason: string;
  affectedSubjectIds: string[];
  auditLogs: AuditLog[];
  needReplacement: boolean;
}

import type { UserRole } from './index';

export const getWorkloadLimit = (role: UserRole): number => {
  if (['Coordenador', 'Diretor', 'Vice-Diretor'].includes(role)) return 10;
  return 20;
};

export type Gender = 'masculino' | 'feminino' | 'outro' | 'prefiro_nao_dizer';

export type ActivityType = 'correr' | 'caminhar' | 'pedalar' | 'musculacao';

export interface UserProfile {
  nomeCompleto: string;
  email: string;
  genero: Gender;
  peso: number; // in kg
  altura: number; // in cm
  idade: number; // in years
  fotoPerfil?: string; // Base64 data URL or image URL
  aceitouLgpd: boolean;
  dataAceiteLgpd: string; // ISO date string
  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
}

export interface Exercise {
  id: string;
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: number;
  cargaKg?: number;
  descansoSegundos?: number;
  observacoes?: string;
}

export interface WorkoutRoutine {
  id: string;
  titulo: string;
  categoria: string;
  descricao?: string;
  duracaoEstimadaMin: number;
  exercicios: Exercise[];
  criadoPeloUsuario?: boolean;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
  speedKmH?: number;
}

export interface WorkoutRecord {
  id: string;
  data: string; // YYYY-MM-DD
  diaSemanaIndex: number; // 0 = Seg, 1 = Ter, 2 = Qua, 3 = Qui, 4 = Sex, 5 = Sáb, 6 = Dom
  diaSemanaNome: string; // "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sabado", "Domingo".
  tipo: 'gps' | 'rotina';
  modalidadeGps?: ActivityType;
  tituloTreino: string;
  duracaoSegundos: number;
  distanciaKm?: number;
  velocidadeMediaKmH?: number;
  caloriasQueimadas: number;
  detalhesExercicios?: (string | { nome: string; info: string; tempoSegundos: number; calorias: number })[];
}

export interface LgpdConsentRecord {
  versaoTermos: string;
  dataAceite: string;
  ipSimulado: string;
  consentimentoDadosSaude: boolean;
  consentimentoLocalizacao: boolean;
}

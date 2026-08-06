import { UserProfile, WorkoutRoutine, WorkoutRecord } from '../types';
import { DEFAULT_WORKOUTS } from '../data/mockWorkouts';

const PROFILE_KEY = 'neonfit_user_profile';
const WORKOUTS_KEY = 'neonfit_routines';
const RECORDS_KEY = 'neonfit_records';

export const INITIAL_USER_PROFILE: UserProfile = {
  nomeCompleto: '',
  email: '',
  genero: 'masculino',
  peso: 72,
  altura: 175,
  idade: 25,
  aceitouLgpd: false,
  dataAceiteLgpd: '',
  isLoggedIn: false,
  hasCompletedOnboarding: false,
};

export function getStoredProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading profile from localStorage', e);
  }
  return INITIAL_USER_PROFILE;
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile', e);
  }
}

export function getStoredWorkouts(): WorkoutRoutine[] {
  try {
    const raw = localStorage.getItem(WORKOUTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading workouts', e);
  }
  return DEFAULT_WORKOUTS;
}

export function saveStoredWorkouts(workouts: WorkoutRoutine[]): void {
  try {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch (e) {
    console.error('Error saving workouts', e);
  }
}

export function getStoredRecords(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading records', e);
  }
  // Default mock history for a realistic week view
  const today = new Date();
  const todayDay = today.getDay(); // 0 = Sun, 1 = Mon, ...
  const getPastDateStr = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 'rec-1',
      data: getPastDateStr(2),
      diaSemanaIndex: (todayDay - 2 + 7) % 7 === 0 ? 6 : ((todayDay - 2 + 7) % 7) - 1,
      diaSemanaNome: 'Treino Anterior',
      tipo: 'rotina',
      tituloTreino: 'Peito & Tríceps Neon',
      duracaoSegundos: 2820,
      caloriasQueimadas: 430,
      detalhesExercicios: ['Supino Reto (4x10)', 'Supino Inclinado (3x12)', 'Tríceps Pulley (4x12)'],
    },
    {
      id: 'rec-2',
      data: getPastDateStr(1),
      diaSemanaIndex: (todayDay - 1 + 7) % 7 === 0 ? 6 : ((todayDay - 1 + 7) % 7) - 1,
      diaSemanaNome: 'Ontem',
      tipo: 'gps',
      modalidadeGps: 'correr',
      tituloTreino: 'Corrida Noturna GPS',
      duracaoSegundos: 1680,
      distanciaKm: 4.85,
      velocidadeMediaKmH: 10.4,
      caloriasQueimadas: 340,
    }
  ];
}

export function saveStoredRecords(records: WorkoutRecord[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving records', e);
  }
}

import { WorkoutRoutine } from '../types';

export const DEFAULT_WORKOUTS: WorkoutRoutine[] = [
  {
    id: 'w1',
    titulo: 'Peito & Tríceps Neon',
    categoria: 'Hipertrofia',
    duracaoEstimadaMin: 50,
    descricao: 'Foco no desenvolvimento do peitoral e fortalecimento de tríceps.',
    exercicios: [
      { id: 'e1', nome: 'Supino Reto com Barra', grupoMuscular: 'Peito', series: 4, repeticoes: 10, cargaKg: 60, descansoSegundos: 60 },
      { id: 'e2', nome: 'Supino Inclinado com Halteres', grupoMuscular: 'Peito', series: 3, repeticoes: 12, cargaKg: 22, descansoSegundos: 45 },
      { id: 'e3', nome: 'Crossover na Polia', grupoMuscular: 'Peito', series: 3, repeticoes: 15, cargaKg: 15, descansoSegundos: 45 },
      { id: 'e4', nome: 'Tríceps Pulley V', grupoMuscular: 'Tríceps', series: 4, repeticoes: 12, cargaKg: 25, descansoSegundos: 45 },
      { id: 'e5', nome: 'Tríceps Testa com Halteres', grupoMuscular: 'Tríceps', series: 3, repeticoes: 10, cargaKg: 12, descansoSegundos: 45 },
    ],
  },
  {
    id: 'w2',
    titulo: 'Pernas & Glúteos Power',
    categoria: 'Força & Pernas',
    duracaoEstimadaMin: 60,
    descricao: 'Treino completo de membros inferiores com foco em quadríceps e posterior.',
    exercicios: [
      { id: 'e6', nome: 'Agachamento Livre com Barra', grupoMuscular: 'Quadríceps', series: 4, repeticoes: 8, cargaKg: 70, descansoSegundos: 90 },
      { id: 'e7', nome: 'Leg Press 45°', grupoMuscular: 'Quadríceps', series: 4, repeticoes: 12, cargaKg: 140, descansoSegundos: 60 },
      { id: 'e8', nome: 'Cadeira Extensora', grupoMuscular: 'Quadríceps', series: 3, repeticoes: 15, cargaKg: 45, descansoSegundos: 45 },
      { id: 'e9', nome: 'Mesa Flexora', grupoMuscular: 'Posterior', series: 4, repeticoes: 12, cargaKg: 35, descansoSegundos: 45 },
      { id: 'e10', nome: 'Elevação Pélvica', grupoMuscular: 'Glúteos', series: 4, repeticoes: 12, cargaKg: 60, descansoSegundos: 60 },
    ],
  },
  {
    id: 'w3',
    titulo: 'Costas & Bíceps Extreme',
    categoria: 'Hipertrofia',
    duracaoEstimadaMin: 55,
    descricao: 'Desenvolvimento de dorsais largas e braços trincados.',
    exercicios: [
      { id: 'e11', nome: 'Puxada Frontal Aberta', grupoMuscular: 'Costas', series: 4, repeticoes: 10, cargaKg: 50, descansoSegundos: 60 },
      { id: 'e12', nome: 'Remada Curvada com Barra', grupoMuscular: 'Costas', series: 4, repeticoes: 10, cargaKg: 45, descansoSegundos: 60 },
      { id: 'e13', nome: 'Remada Unilateral (Serrote)', grupoMuscular: 'Costas', series: 3, repeticoes: 12, cargaKg: 20, descansoSegundos: 45 },
      { id: 'e14', nome: 'Rosca Direta no Banco W', grupoMuscular: 'Bíceps', series: 4, repeticoes: 10, cargaKg: 14, descansoSegundos: 45 },
      { id: 'e15', nome: 'Rosca Martelo com Halteres', grupoMuscular: 'Bíceps', series: 3, repeticoes: 12, cargaKg: 12, descansoSegundos: 45 },
    ],
  },
  {
    id: 'w4',
    titulo: 'Cardio Sprint & Abdominais',
    categoria: 'Resistência & Queima',
    duracaoEstimadaMin: 35,
    descricao: 'Treino de alta intensidade para acelerar o metabolismo.',
    exercicios: [
      { id: 'e16', nome: 'Corrida na Esteira (HIIT 1/1)', grupoMuscular: 'Cardio', series: 10, repeticoes: 1, descansoSegundos: 30 },
      { id: 'e17', nome: 'Polichinelos Intensos', grupoMuscular: 'Cardio', series: 4, repeticoes: 50, descansoSegundos: 30 },
      { id: 'e18', nome: 'Abdominal Supra na Prancha', grupoMuscular: 'Abdômen', series: 4, repeticoes: 20, descansoSegundos: 30 },
      { id: 'e19', nome: 'Prancha Isométrica', grupoMuscular: 'Core', series: 3, repeticoes: 60, descansoSegundos: 45 },
    ],
  },
];

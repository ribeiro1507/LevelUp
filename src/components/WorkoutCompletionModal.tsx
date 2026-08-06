import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Flame, Clock, Navigation, Trophy, ArrowLeft, Dumbbell, Award, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WorkoutRecord } from '../types';

interface WorkoutCompletionModalProps {
  workoutRecord: WorkoutRecord | null;
  onCloseAndReturnHome: () => void;
}

export const WorkoutCompletionModal: React.FC<WorkoutCompletionModalProps> = ({
  workoutRecord,
  onCloseAndReturnHome,
}) => {
  useEffect(() => {
    if (workoutRecord) {
      // Fire festive neon green confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#78FF00', '#ffffff', '#22c55e', '#a3e635'],
        });
      } catch (e) {
        console.log('Confetti effect', e);
      }
    }
  }, [workoutRecord]);

  if (!workoutRecord) return null;

  const minutes = Math.floor(workoutRecord.duracaoSegundos / 60);
  const seconds = workoutRecord.duracaoSegundos % 60;
  const timeFormatted = minutes > 0 ? `${minutes}min ${seconds < 10 ? '0' : ''}${seconds}s` : `${seconds}s`;
  const isMusculacao = workoutRecord.tipo === 'rotina';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0D0B] text-white animate-fadeIn select-none overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center text-center my-auto py-6">
        {/* Animated Green Check Circle */}
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="relative mb-4"
        >
          {/* Outer glowing ring */}
          <div className="absolute inset-0 rounded-full bg-[#78FF00] blur-2xl opacity-50 animate-pulse" />

          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#121814] border-4 border-[#78FF00] flex items-center justify-center shadow-[0_0_50px_rgba(120,255,0,0.5)]">
            <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-[#78FF00]" />
          </div>
        </motion.div>

        {/* Celebratory Title */}
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-black italic tracking-tight text-white uppercase"
        >
          Treino <span className="text-[#78FF00] not-italic">Concluído!</span>
        </motion.h2>

        <p className="text-xs text-gray-400 mt-1 font-semibold">
          {workoutRecord.tituloTreino}
        </p>

        {/* Stats Summary Box */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full bg-[#121814] border border-[#78FF00]/40 rounded-2xl p-4 mt-5 space-y-3 shadow-xl"
        >
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
            <span className="flex items-center gap-1.5 font-bold text-gray-300">
              {isMusculacao ? <Dumbbell className="w-4 h-4 text-[#78FF00]" /> : <Navigation className="w-4 h-4 text-[#78FF00]" />}
              {isMusculacao ? 'Estatísticas de Musculação' : 'Resumo da Atividade'}
            </span>
            <span className="font-bold text-white">{workoutRecord.diaSemanaNome}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1">
            {/* Duration / Tempo de Treino */}
            <div className="flex flex-col items-center bg-[#1A231C] p-3 rounded-xl border border-[#78FF00]/30 shadow-inner">
              <Clock className="w-5 h-5 text-[#78FF00] mb-1" />
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Tempo</span>
              <span className="text-xs sm:text-sm font-black text-[#78FF00] mt-0.5">{timeFormatted}</span>
            </div>

            {/* Calories / Calorias Gastas */}
            <div className="flex flex-col items-center bg-[#1A231C] p-3 rounded-xl border border-orange-500/30 shadow-inner">
              <Flame className="w-5 h-5 text-orange-400 mb-1" />
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Calorias</span>
              <span className="text-xs sm:text-sm font-black text-orange-400 mt-0.5">{workoutRecord.caloriasQueimadas} kcal</span>
            </div>

            {/* Distance or Exercises */}
            <div className="flex flex-col items-center bg-[#1A231C] p-3 rounded-xl border border-gray-800">
              {workoutRecord.tipo === 'gps' ? (
                <>
                  <Navigation className="w-5 h-5 text-[#78FF00] mb-1" />
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Distância</span>
                  <span className="text-xs sm:text-sm font-black text-white mt-0.5">{workoutRecord.distanciaKm || 0} km</span>
                </>
              ) : (
                <>
                  <Trophy className="w-5 h-5 text-[#78FF00] mb-1" />
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Exercícios</span>
                  <span className="text-xs sm:text-sm font-black text-white mt-0.5">{workoutRecord.detalhesExercicios?.length || 4} ex</span>
                </>
              )}
            </div>
          </div>

          {/* Detailed Musculação Exercises Breakdown */}
          {isMusculacao && workoutRecord.detalhesExercicios && workoutRecord.detalhesExercicios.length > 0 && (
            <div className="pt-2 border-t border-gray-800 text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#78FF00]" />
                  Exercícios Realizados
                </span>
                <span className="text-[#78FF00]">{workoutRecord.detalhesExercicios.length} de {workoutRecord.detalhesExercicios.length}</span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {workoutRecord.detalhesExercicios.map((exDetail, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#1A231C] p-2 rounded-xl text-xs border border-gray-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#78FF00] shrink-0" />
                      <span className="font-bold text-gray-200">{exDetail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Return Button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={onCloseAndReturnHome}
          className="w-full mt-5 py-3.5 px-4 bg-[#78FF00] hover:bg-[#6be600] active:scale-[0.99] text-[#0A0D0B] font-extrabold text-sm rounded-xl shadow-[0_0_25px_rgba(120,255,0,0.4)] transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5 text-[#0A0D0B]" />
          <span>
            {workoutRecord.tipo === 'gps' ? 'Voltar para Gravar Atividade' : 'Voltar para Tela Inicial'}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

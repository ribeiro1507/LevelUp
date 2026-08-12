import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Flame, Clock, Navigation } from 'lucide-react';
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
    if (workoutRecord && workoutRecord.tipo !== 'rotina') {
      // Fire festive neon green confetti for non-musculação
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black text-white animate-fadeIn select-none overflow-y-auto">
      {isMusculacao ? (
        <div className="w-full max-w-sm flex flex-col my-auto py-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full text-left"
          >
            <div className="flex items-center text-white font-bold text-[22px] mb-4 tracking-tight ml-1">
              Detalhes do Exercício <span className="text-gray-500 ml-2 text-2xl font-medium">{'>'}</span>
            </div>
            
            <div className="bg-[#1C1C1E] rounded-3xl p-6 shadow-2xl w-full">
              {/* Tempo de Exercício */}
              <div className="mb-2">
                <div className="text-gray-100 text-lg font-semibold mb-1">
                  Tempo de Exercício
                </div>
                <div className="text-[#FFE600] text-6xl font-bold tracking-tighter leading-none font-sans" style={{ letterSpacing: '-0.03em' }}>
                  {Math.floor(workoutRecord.duracaoSegundos / 3600)}:
                  {Math.floor((workoutRecord.duracaoSegundos % 3600) / 60).toString().padStart(2, '0')}:
                  {(workoutRecord.duracaoSegundos % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="h-[1px] bg-gray-600/50 w-full my-6" />

              {/* Calorias */}
              <div>
                <div className="text-gray-100 text-lg font-semibold mb-1">
                  Total de Calorias
                </div>
                <div className="text-[#FF2A4D] text-[52px] font-bold tracking-tighter leading-none font-sans" style={{ letterSpacing: '-0.03em' }}>
                  {workoutRecord.caloriasQueimadas}CAL
                </div>
              </div>
            </div>

            {/* Return Button */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              onClick={onCloseAndReturnHome}
              className="w-full mt-8 py-4 px-4 bg-[#78FF00] active:bg-[#6be600] text-[#0A0D0B] font-extrabold text-lg rounded-2xl transition-all text-center"
            >
              Finalizar
            </motion.button>
          </motion.div>
        </div>
      ) : (
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

          {/* Stats Summary Box for non-musculação */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-[#121814] border border-[#78FF00]/40 rounded-2xl p-4 mt-5 space-y-3 shadow-xl"
          >
            <div className="flex items-center justify-between text-xs text-gray-400 border-b border-gray-800 pb-2">
              <span className="flex items-center gap-1.5 font-bold text-gray-300">
                <Navigation className="w-4 h-4 text-[#78FF00]" />
                Resumo da Atividade
              </span>
              <span className="font-bold text-white">{workoutRecord.diaSemanaNome}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-1">
              <div className="flex flex-col items-center justify-center bg-[#1A231C] p-3 rounded-xl border border-[#78FF00]/30 shadow-inner">
                <Clock className="w-5 h-5 text-[#78FF00] mb-1" />
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Tempo</span>
                <span className="text-xs font-black text-[#78FF00] mt-0.5">{timeFormatted}</span>
              </div>

              <div className="flex flex-col items-center justify-center bg-[#1A231C] p-3 rounded-xl border border-orange-500/30 shadow-inner">
                <Flame className="w-5 h-5 text-orange-400 mb-1" />
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Gasto</span>
                <span className="text-xs font-black text-orange-400 mt-0.5">{workoutRecord.caloriasQueimadas} kcal</span>
              </div>

              <div className="flex flex-col items-center justify-center bg-[#1A231C] p-3 rounded-xl border border-gray-800">
                <Navigation className="w-5 h-5 text-[#78FF00] mb-1" />
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Distância</span>
                <span className="text-xs sm:text-sm font-black text-white mt-0.5">{workoutRecord.distanciaKm || 0} km</span>
              </div>
            </div>
          </motion.div>

          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={onCloseAndReturnHome}
            className="w-full mt-5 py-3.5 px-4 bg-[#78FF00] hover:bg-[#6be600] active:scale-[0.99] text-[#0A0D0B] font-extrabold text-sm rounded-xl shadow-[0_0_25px_rgba(120,255,0,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <span>Finalizar</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};


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

  const exerciseCount = workoutRecord.detalhesExercicios?.length || 1;
  const avgCalPerEx = Math.round(workoutRecord.caloriasQueimadas / exerciseCount);
  const avgTimeSeconds = Math.round(workoutRecord.duracaoSegundos / exerciseCount);
  const avgTimeMins = Math.floor(avgTimeSeconds / 60);
  const avgTimeSecs = avgTimeSeconds % 60;
  const avgTimeFormatted = avgTimeMins > 0 ? `${avgTimeMins}m ${avgTimeSecs}s` : `${avgTimeSecs}s`;

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

          <div className={`grid ${isMusculacao ? 'grid-cols-2' : 'grid-cols-3'} gap-2 py-1`}>
            {/* Duration / Tempo Geral */}
            <div className="flex flex-col items-center justify-center bg-[#1A231C] p-3 rounded-xl border border-[#78FF00]/30 shadow-inner">
              <Clock className="w-5 h-5 text-[#78FF00] mb-1" />
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Tempo Geral</span>
              <span className="text-xs font-black text-[#78FF00] mt-0.5">{timeFormatted}</span>
            </div>

            {/* Calories / Calorias Gastas */}
            <div className="flex flex-col items-center justify-center bg-[#1A231C] p-3 rounded-xl border border-orange-500/30 shadow-inner">
              <Flame className="w-5 h-5 text-orange-400 mb-1" />
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Gasto Total</span>
              <span className="text-xs font-black text-orange-400 mt-0.5">{workoutRecord.caloriasQueimadas} kcal</span>
            </div>

            {isMusculacao ? (
              <>
                {/* Tempo Médio por Exercício */}
                <div className="flex flex-col items-center justify-center bg-[#1A231C] p-3 rounded-xl border border-[#78FF00]/10 shadow-inner">
                  <Clock className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-center">Tempo/Exercício</span>
                  <span className="text-xs font-black text-white mt-0.5">{avgTimeFormatted}</span>
                </div>

                {/* Gasto Médio por Exercício */}
                <div className="flex flex-col items-center justify-center bg-[#1A231C] p-3 rounded-xl border border-orange-500/10 shadow-inner">
                  <Flame className="w-4 h-4 text-gray-400 mb-1" />
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider text-center">Gasto Médio/Ex</span>
                  <span className="text-xs font-black text-white mt-0.5">{avgCalPerEx} kcal</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center bg-[#1A231C] p-3 rounded-xl border border-gray-800">
                <Navigation className="w-5 h-5 text-[#78FF00] mb-1" />
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">Distância</span>
                <span className="text-xs sm:text-sm font-black text-white mt-0.5">{workoutRecord.distanciaKm || 0} km</span>
              </div>
            )}
          </div>

          {/* Detailed Musculação Exercises Breakdown */}
          {isMusculacao && workoutRecord.detalhesExercicios && workoutRecord.detalhesExercicios.length > 0 && (
            <div className="pt-2.5 border-t border-gray-800 text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#78FF00]" />
                  Exercícios & Gasto Médio
                </span>
                <span className="text-[#78FF00] font-extrabold bg-[#78FF00]/10 border border-[#78FF00]/20 px-2 py-0.5 rounded-md text-[10px]">
                  ~{avgCalPerEx} kcal/ex
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                {workoutRecord.detalhesExercicios.map((ex, idx) => {
                  const isObject = typeof ex === 'object' && ex !== null;
                  const nome = isObject ? ex.nome : String(ex);
                  const info = isObject ? ex.info : '';
                  const cals = isObject ? ex.calorias : avgCalPerEx;
                  
                  const exMinutes = isObject ? Math.floor((ex.tempoSegundos || 0) / 60) : 0;
                  const exSeconds = isObject ? (ex.tempoSegundos || 0) % 60 : 0;
                  const exTimeFormatted = exMinutes > 0 ? `${exMinutes}m ${exSeconds}s` : `${exSeconds}s`;

                  return (
                    <div key={idx} className="flex flex-col bg-[#1A231C] p-2.5 rounded-xl text-xs border border-gray-800">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0 pr-2">
                          <CheckCircle2 className="w-4 h-4 text-[#78FF00] shrink-0 mt-0.5" />
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-200 line-clamp-1">{nome}</span>
                            {info && <span className="text-[10px] text-gray-500 mt-0.5">{info}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0 gap-1">
                          <span className="text-[11px] font-extrabold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded-md">
                            ~{cals} kcal
                          </span>
                          {isObject && (
                            <span className="text-[10px] font-semibold text-[#78FF00] flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {exTimeFormatted}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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

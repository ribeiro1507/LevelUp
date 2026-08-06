import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck } from 'lucide-react';
import { LevelUpLogo } from './LevelUpLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onFinish();
          }, 300);
          return 100;
        }
        return prev + 4;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#0A0D0B] p-6 text-white overflow-hidden select-none">
      {/* Background Decorative Glow Effect */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#78FF00]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#78FF00]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Tag */}
      <div className="pt-10 flex items-center gap-2 text-xs font-semibold text-[#78FF00] tracking-widest uppercase">
        <Zap className="w-4 h-4 animate-pulse text-[#78FF00]" />
        <span>Performance & Fitness Engine</span>
      </div>

      {/* Central Icon & Title */}
      <div className="flex flex-col items-center text-center my-auto">
        {/* Animated App Icon Container */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-8"
        >
          {/* Outer Pulsing Neon Ring */}
          <div className="absolute inset-0 rounded-3xl bg-[#78FF00] blur-xl opacity-50 animate-pulse" />
          <LevelUpLogo size="xl" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl sm:text-5xl font-black tracking-tight text-white italic"
        >
          LEVEL<span className="text-[#78FF00] not-italic">UP</span>
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm text-gray-400 mt-2 max-w-xs"
        >
          Seu treino levado ao próximo nível com rastreamento em tempo real.
        </motion.p>
      </div>

      {/* Bottom Loading Progress Indicator */}
      <div className="w-full max-w-xs mb-8 flex flex-col items-center">
        <div className="flex justify-between w-full text-xs text-gray-400 mb-2 font-medium">
          <span>Iniciando sistema...</span>
          <span className="text-[#78FF00] font-bold">{progress}%</span>
        </div>

        {/* Progress bar container */}
        <div className="w-full h-2 bg-[#1A231C] rounded-full overflow-hidden p-0.5 border border-gray-800">
          <div
            className="h-full bg-[#78FF00] rounded-full transition-all duration-100 shadow-[0_0_10px_#78FF00]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={onFinish}
          className="mt-6 text-xs text-gray-500 hover:text-[#78FF00] underline transition-colors"
        >
          Pular carregamento →
        </button>
      </div>

      {/* Footer LGPD badge */}
      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#78FF00]" />
        <span>Em conformidade com a LGPD Brasil</span>
      </div>
    </div>
  );
};

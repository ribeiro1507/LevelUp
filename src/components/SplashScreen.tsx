import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Zap, ShieldCheck } from 'lucide-react';
import { LevelUpLogo } from './LevelUpLogo';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [bgImageLoaded, setBgImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Check if user uploaded Tela_Carregamento.JPEG to public folder
    const img = new Image();
    img.src = '/Tela_Carregamento.JPEG';
    img.onload = () => setBgImageLoaded(true);
    img.onerror = () => {
      // Try lowercase extension if uppercase failed
      const imgLower = new Image();
      imgLower.src = '/Tela_Carregamento.jpeg';
      imgLower.onload = () => setBgImageLoaded(true);
    };
  }, []);

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
      {/* Background Image if Tela_Carregamento.JPEG is placed in public/ folder */}
      {bgImageLoaded ? (
        <div className="absolute inset-0 z-0">
          <img
            src="/Tela_Carregamento.JPEG"
            alt="Tela de Carregamento"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D0B] via-[#0A0D0B]/70 to-[#0A0D0B]/80" />
        </div>
      ) : (
        <>
          {/* Background Decorative Glow Effect */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#78FF00]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#78FF00]/10 rounded-full blur-3xl pointer-events-none" />
        </>
      )}

      {/* Top Brand Tag */}
      <div className="relative z-10 pt-10 flex items-center gap-2 text-xs font-semibold text-[#78FF00] tracking-widest uppercase">
        <Zap className="w-4 h-4 animate-pulse text-[#78FF00]" />
        <span>Performance & Fitness Engine</span>
      </div>

      {/* Central Icon & Title */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto">
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
          className="text-4xl sm:text-5xl font-black tracking-tight text-white italic drop-shadow-lg"
        >
          LEVEL<span className="text-[#78FF00] not-italic">UP</span>
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm text-gray-300 mt-2 max-w-xs font-medium"
        >
          Seu treino levado ao próximo nível com rastreamento em tempo real.
        </motion.p>
      </div>

      {/* Bottom Loading Progress Indicator */}
      <div className="relative z-10 w-full max-w-xs mb-8 flex flex-col items-center">
        <div className="flex justify-between w-full text-xs text-gray-400 mb-2 font-medium">
          <span>Iniciando sistema...</span>
          <span className="text-[#78FF00] font-bold">{progress}%</span>
        </div>

        {/* Progress bar container */}
        <div className="w-full h-2 bg-[#1A231C]/90 rounded-full overflow-hidden p-0.5 border border-gray-800 backdrop-blur-md">
          <div
            className="h-full bg-[#78FF00] rounded-full transition-all duration-100 shadow-[0_0_10px_#78FF00]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={onFinish}
          className="mt-6 text-xs text-gray-400 hover:text-[#78FF00] underline transition-colors"
        >
          Pular carregamento →
        </button>
      </div>

      {/* Footer LGPD badge */}
      <div className="relative z-10 flex items-center gap-1.5 text-[10px] text-gray-400 mb-2 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-[#78FF00]" />
        <span>Em conformidade com a LGPD Brasil</span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Smartphone, Monitor, RotateCcw, Wifi, Battery, Signal } from 'lucide-react';
import { DownloadAppButton } from './DownloadAppButton';
import { ThemeToggleButton } from './ThemeToggleButton';

interface DeviceFrameProps {
  children: React.ReactNode;
  onRestartSplash?: () => void;
  onResetDemoData?: () => void;
  onGoToLogin?: () => void;
  onOpenInstallModal?: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  onRestartSplash,
  onResetDemoData,
  onGoToLogin,
}) => {
  const [isMobileView, setIsMobileView] = useState<boolean>(true);

  // Time for mock phone status bar
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#060607] text-white flex flex-col items-center justify-start p-2 sm:p-4">
      {/* Top Controls Bar */}
      <div className="w-full max-w-md mb-3 flex flex-wrap items-center justify-between gap-2 bg-[var(--lu-surface)] border border-gray-800 px-3 py-2 rounded-2xl shadow-lg text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMobileView(true)}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
              isMobileView
                ? 'bg-[var(--lu-accent)] text-[var(--lu-on-accent)]'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Visualização Mobile Frame"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>

          <button
            onClick={() => setIsMobileView(false)}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer ${
              !isMobileView
                ? 'bg-[var(--lu-accent)] text-[var(--lu-on-accent)]'
                : 'text-gray-400 hover:text-white'
            }`}
            title="Visualização Tela Cheia"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tela Cheia</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <ThemeToggleButton variant="compact" />

          <DownloadAppButton variant="compact" label="Baixar App" />

          {onGoToLogin && (
            <button
              onClick={onGoToLogin}
              className="px-2 py-1 bg-[var(--lu-surface-alt)] hover:bg-[var(--lu-surface-hover)] text-[var(--lu-accent)] border border-[var(--lu-accent-30)] rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
              title="Ir para a Tela de Login"
            >
              Tela Login
            </button>
          )}

          {onRestartSplash && (
            <button
              onClick={onRestartSplash}
              className="px-2 py-1 bg-[var(--lu-surface-alt)] hover:bg-[var(--lu-surface-hover)] text-gray-300 border border-gray-800 hover:border-[var(--lu-accent-40)] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Ver tela de carregamento (Splash)"
            >
              <RotateCcw className="w-3 h-3 text-[var(--lu-accent)]" />
              <span className="hidden sm:inline">Splash</span>
            </button>
          )}

          {onResetDemoData && (
            <button
              onClick={onResetDemoData}
              className="px-2 py-1 bg-[var(--lu-surface-alt)] hover:bg-[var(--lu-surface-hover)] text-gray-300 border border-gray-800 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
              title="Resetar dados para padrão"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      {isMobileView ? (
        <div className="relative w-full max-w-[410px] h-[850px] max-h-[92vh] bg-[var(--lu-bg)] border-[10px] border-[var(--lu-surface-alt)] rounded-[48px] shadow-[0_0_55px_var(--lu-glow-soft),0_0_40px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden ring-1 ring-[var(--lu-accent-30)]">
          {/* Phone Speaker Notch & Dynamic Island */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-[var(--lu-surface-alt)] rounded-b-2xl z-40 flex items-center justify-center">
            <div className="w-12 h-1 bg-black/60 rounded-full" />
            <div className="w-2.5 h-2.5 bg-[var(--lu-accent-50)] rounded-full ml-3" />
          </div>

          {/* Smartphone Status Bar */}
          <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[11px] font-bold text-gray-400 z-30 select-none bg-[var(--lu-bg)]">
            <span>{timeStr}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-gray-400" />
              <Wifi className="w-3 h-3 text-gray-400" />
              <Battery className="w-3.5 h-3.5 text-[var(--lu-accent)]" />
            </div>
          </div>

          {/* Inner Phone Content */}
          <div className="flex-1 overflow-y-auto relative bg-[var(--lu-bg)]">
            {children}
          </div>

          {/* Bottom iOS Home Indicator */}
          <div className="py-2 flex justify-center bg-[var(--lu-bg)] z-30">
            <div className="w-32 h-1 bg-[var(--lu-accent-50)] rounded-full" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl min-h-[800px] bg-[var(--lu-bg)] border border-[var(--lu-accent-20)] rounded-3xl shadow-[0_0_50px_var(--lu-glow-soft)] overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};

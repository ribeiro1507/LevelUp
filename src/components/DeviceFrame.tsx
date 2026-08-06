import React, { useState } from 'react';
import { Smartphone, Monitor, RotateCcw, ShieldCheck, Wifi, Battery, Signal } from 'lucide-react';

interface DeviceFrameProps {
  children: React.ReactNode;
  onRestartSplash: () => void;
  onResetDemoData: () => void;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  onRestartSplash,
  onResetDemoData,
}) => {
  const [isMobileView, setIsMobileView] = useState<boolean>(true);

  // Time for mock phone status bar
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#060806] text-white flex flex-col items-center justify-start p-2 sm:p-4">
      {/* Top Controls Bar */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between bg-[#121814] border border-gray-800 px-3 py-2 rounded-2xl shadow-lg text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMobileView(true)}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all ${
              isMobileView ? 'bg-[#78FF00] text-[#0A0D0B]' : 'text-gray-400 hover:text-white'
            }`}
            title="Visualização Mobile Frame"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mobile</span>
          </button>

          <button
            onClick={() => setIsMobileView(false)}
            className={`p-1.5 rounded-lg flex items-center gap-1 text-[11px] font-bold transition-all ${
              !isMobileView ? 'bg-[#78FF00] text-[#0A0D0B]' : 'text-gray-400 hover:text-white'
            }`}
            title="Visualização Tela Cheia"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tela Cheia</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRestartSplash}
            className="px-2 py-1 bg-[#1A231C] hover:bg-gray-800 text-[#78FF00] border border-gray-800 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
            title="Ver tela de carregamento (Splash)"
          >
            <RotateCcw className="w-3 h-3 text-[#78FF00]" />
            <span>Splash</span>
          </button>

          <button
            onClick={onResetDemoData}
            className="px-2 py-1 bg-[#1A231C] hover:bg-gray-800 text-gray-300 border border-gray-800 rounded-lg text-[10px] font-bold transition-colors"
            title="Resetar dados para padrão"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Container */}
      {isMobileView ? (
        <div className="relative w-full max-w-[410px] h-[850px] max-h-[92vh] bg-[#0A0D0B] border-[10px] border-[#18201A] rounded-[48px] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden ring-1 ring-[#78FF00]/30">
          {/* Phone Speaker Notch & Dynamic Island */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-[#18201A] rounded-b-2xl z-40 flex items-center justify-center">
            <div className="w-12 h-1 bg-black/60 rounded-full" />
            <div className="w-2.5 h-2.5 bg-black/80 rounded-full ml-3" />
          </div>

          {/* Smartphone Status Bar */}
          <div className="pt-2 px-6 pb-1 flex justify-between items-center text-[11px] font-bold text-gray-400 z-30 select-none bg-[#0A0D0B]">
            <span>{timeStr}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="w-3 h-3 text-gray-400" />
              <Wifi className="w-3 h-3 text-gray-400" />
              <Battery className="w-3.5 h-3.5 text-[#78FF00]" />
            </div>
          </div>

          {/* Inner Phone Content */}
          <div className="flex-1 overflow-y-auto relative bg-[#0A0D0B]">
            {children}
          </div>

          {/* Bottom iOS Home Indicator */}
          <div className="py-2 flex justify-center bg-[#0A0D0B] z-30">
            <div className="w-32 h-1 bg-gray-700 rounded-full" />
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl min-h-[800px] bg-[#0A0D0B] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};

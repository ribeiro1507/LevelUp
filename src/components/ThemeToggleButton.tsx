import React from 'react';
import { Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleButtonProps {
  variant?: 'pill' | 'compact' | 'full';
  className?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { isPink, toggleTheme } = useTheme();

  const nextColorDot = isPink ? 'bg-[#78FF00]' : 'bg-[#FF4DA6]';
  const nextLabelShort = isPink ? 'Verde' : 'Rosa';
  const nextLabelFull = isPink ? 'Mudar para Preto & Verde' : 'Mudar para Preto & Rosa';
  const currentLabelFull = isPink ? 'Tema Atual: Preto & Rosa' : 'Tema Atual: Preto & Verde';

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={nextLabelFull}
        className={`w-full flex items-center justify-between p-3.5 bg-[var(--lu-surface)] hover:bg-[var(--lu-surface-alt)] border border-[var(--lu-accent-30)] hover:border-[var(--lu-accent)] rounded-2xl text-left transition-all active:scale-[0.99] shadow-[0_0_20px_var(--lu-glow-soft)] cursor-pointer ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--lu-accent-15)] border border-[var(--lu-accent-30)] text-[var(--lu-accent)] flex items-center justify-center shrink-0">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black text-white">{nextLabelFull}</div>
            <div className="text-xs text-gray-400">{currentLabelFull}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`w-3.5 h-3.5 rounded-full ${nextColorDot} ring-2 ring-white/20 shadow-md`}
            aria-hidden="true"
          />
          <span className="text-xs font-extrabold text-[var(--lu-accent)] whitespace-nowrap">
            Trocar
          </span>
        </div>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={nextLabelFull}
        aria-label={nextLabelFull}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--lu-surface-alt)] hover:bg-[var(--lu-surface)] text-white border border-[var(--lu-accent-30)] hover:border-[var(--lu-accent)] rounded-xl text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer ${className}`}
      >
        <span className={`w-2.5 h-2.5 rounded-full ${nextColorDot} shrink-0`} aria-hidden="true" />
        <Palette className="w-3.5 h-3.5 text-[var(--lu-accent)] shrink-0" />
        <span>{nextLabelShort}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={nextLabelFull}
      aria-label={nextLabelFull}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] bg-[var(--lu-surface)] hover:bg-[var(--lu-surface-alt)] text-white border border-[var(--lu-accent-40)] hover:border-[var(--lu-accent)] rounded-xl text-xs font-bold transition-all active:scale-95 shadow-[0_0_12px_var(--lu-glow-soft)] whitespace-nowrap shrink-0 cursor-pointer ${className}`}
    >
      <span className={`w-2.5 h-2.5 rounded-full ${nextColorDot} shrink-0`} aria-hidden="true" />
      <Palette className="w-3.5 h-3.5 text-[var(--lu-accent)] shrink-0" />
      <span>{nextLabelShort}</span>
    </button>
  );
};

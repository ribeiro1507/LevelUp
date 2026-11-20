import React, { useState } from 'react';
import { TrendingUp, Dumbbell } from 'lucide-react';
import levelupLogoImg from '../assets/images/levelup_app_icon_60x60_1785602066571.jpg';
import { useTheme } from '../context/ThemeContext';

interface LevelUpLogoProps {
  className?: string;
  size?: 'sm' | 'md' | '60x60' | 'lg' | 'xl';
}

export const LevelUpLogo: React.FC<LevelUpLogoProps> = ({ className = '', size = '60x60' }) => {
  const [imgError, setImgError] = useState(false);
  const { isPink } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    '60x60': 'w-[60px] h-[60px] rounded-2xl text-lg',
    lg: 'w-16 h-16 rounded-2xl text-xl',
    xl: 'w-32 h-32 rounded-3xl text-3xl',
  };

  if (!imgError) {
    return (
      <div className={`relative overflow-hidden bg-[var(--lu-surface)] border border-[var(--lu-accent-50)] shadow-[0_0_20px_var(--lu-glow)] flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
        <img
          src={levelupLogoImg}
          alt="LevelUp Logo"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          style={isPink ? { filter: 'hue-rotate(235deg) saturate(1.2)' } : undefined}
          className="w-full h-full object-cover transition-[filter] duration-300"
        />
      </div>
    );
  }

  // Fallback SVG badge if image ever fails to load
  return (
    <div className={`relative overflow-hidden bg-[var(--lu-surface)] border-2 border-[var(--lu-accent)] shadow-[0_0_25px_var(--lu-glow)] flex flex-col items-center justify-center p-1 text-[var(--lu-accent)] ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center gap-0.5 font-black italic tracking-tighter">
        <Dumbbell className="w-1/2 h-1/2 text-[var(--lu-accent)]" />
        <TrendingUp className="w-1/2 h-1/2 text-[var(--lu-accent)] -ml-1" />
      </div>
      <span className="font-extrabold text-[0.45em] tracking-widest text-white uppercase mt-0.5">LU</span>
    </div>
  );
};

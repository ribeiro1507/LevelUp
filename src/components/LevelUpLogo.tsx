import React, { useState } from 'react';
import { TrendingUp, Dumbbell } from 'lucide-react';
import levelupLogoImg from '../assets/images/levelup_app_icon_60x60_1785602066571.jpg';

interface LevelUpLogoProps {
  className?: string;
  size?: 'sm' | 'md' | '60x60' | 'lg' | 'xl';
}

export const LevelUpLogo: React.FC<LevelUpLogoProps> = ({ className = '', size = '60x60' }) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-10 h-10 rounded-xl text-sm',
    '60x60': 'w-[60px] h-[60px] rounded-2xl text-lg',
    lg: 'w-16 h-16 rounded-2xl text-xl',
    xl: 'w-32 h-32 rounded-3xl text-3xl',
  };

  if (!imgError) {
    return (
      <div className={`relative overflow-hidden bg-[#121814] border border-[#78FF00]/50 shadow-[0_0_20px_rgba(120,255,0,0.35)] flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}>
        <img
          src={levelupLogoImg}
          alt="LevelUp Logo"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Fallback SVG badge if image ever fails to load
  return (
    <div className={`relative overflow-hidden bg-[#121814] border-2 border-[#78FF00] shadow-[0_0_25px_rgba(120,255,0,0.4)] flex flex-col items-center justify-center p-1 text-[#78FF00] ${sizeClasses[size]} ${className}`}>
      <div className="flex items-center gap-0.5 font-black italic tracking-tighter">
        <Dumbbell className="w-1/2 h-1/2 text-[#78FF00]" />
        <TrendingUp className="w-1/2 h-1/2 text-[#78FF00] -ml-1" />
      </div>
      <span className="font-extrabold text-[0.45em] tracking-widest text-white uppercase mt-0.5">LU</span>
    </div>
  );
};

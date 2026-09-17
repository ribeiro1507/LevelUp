import React, { useState } from 'react';
import { Download, CheckCircle, AlertCircle, Smartphone } from 'lucide-react';

interface LevelUpDownloadApkButtonProps {
  /** Rota do arquivo APK (padrão: '/levelup.apk') */
  apkUrl?: string;
  /** Nome sugerido para o arquivo baixado (padrão: 'LevelUp.apk') */
  fileName?: string;
  /** Texto do botão */
  buttonText?: string;
  /** Variante de estilo: 'full' (largura 100%) ou 'compact' (ajustado ao conteúdo) */
  variant?: 'full' | 'compact';
  /** Classes Tailwind adicionais */
  className?: string;
}

export const LevelUpDownloadApkButton: React.FC<LevelUpDownloadApkButtonProps> = ({
  apkUrl = '/levelup.apk',
  fileName = 'LevelUp.apk',
  buttonText = 'Baixar o App (APK)',
  variant = 'full',
  className = '',
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  /**
   * Dispara o download programaticamente injetando uma tag <a> no DOM.
   * Este padrão previne bloqueios de pop-ups e restrições de navegadores mobile (Chrome, Samsung Internet, etc.).
   */
  const handleDownloadApk = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    // Detecção básica de iOS para alertar sobre incompatibilidade de arquivo APK
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (isIOS) {
        alert(
          '⚠️ Aviso: O arquivo .APK é exclusivo para celulares Android.\n\nNo iPhone, abra este site no navegador Safari e use a opção "Adicionar à Tela de Início" para instalar o app.'
        );
        return;
      }
    }

    try {
      setDownloading(true);

      // Criação dinâmica do link no DOM
      const link = document.createElement('a');
      link.href = apkUrl;
      link.setAttribute('download', fileName);
      link.setAttribute('target', '_self');
      link.rel = 'noopener noreferrer';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Feedback visual para o usuário
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloading(false);
        setDownloadSuccess(false);
      }, 3500);
    } catch (err) {
      console.error('Erro ao disparar download do APK:', err);
      // Fallback padrão se houver qualquer bloqueio de DOM
      window.location.href = apkUrl;
      setDownloading(false);
    }
  };

  const baseStyles =
    'relative inline-flex items-center justify-center gap-2.5 bg-[#78FF00] hover:bg-[#8aff1e] active:scale-[0.98] text-[#000000] font-black tracking-wider uppercase rounded-2xl transition-all select-none cursor-pointer border-none';
  const shadowStyles =
    'shadow-[0_0_15px_rgba(120,255,0,0.4)] hover:shadow-[0_0_25px_rgba(120,255,0,0.6)]';
  const sizeStyles = variant === 'full' ? 'w-full py-4 px-6 text-sm sm:text-base' : 'py-3 px-5 text-xs sm:text-sm';

  return (
    <div className={`flex flex-col items-center gap-2 ${variant === 'full' ? 'w-full' : 'inline-block'}`}>
      <button
        type="button"
        id="btnLevelUpDownloadApk"
        onClick={handleDownloadApk}
        disabled={downloading}
        className={`${baseStyles} ${shadowStyles} ${sizeStyles} ${className}`}
      >
        {downloadSuccess ? (
          <>
            <CheckCircle className="w-5 h-5 text-black stroke-[3]" />
            <span>Download Iniciado!</span>
          </>
        ) : (
          <>
            <Download className={`w-5 h-5 text-black stroke-[3] ${downloading ? 'animate-bounce' : ''}`} />
            <span>{buttonText}</span>
          </>
        )}
      </button>

      {/* Subtexto auxiliar informativo */}
      <span className="text-[11px] font-bold text-gray-400 flex items-center gap-1">
        <Smartphone className="w-3.5 h-3.5 text-[#78FF00]" />
        Pacote Android Direto • Versão Oficial
      </span>
    </div>
  );
};

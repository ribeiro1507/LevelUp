import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, X, Smartphone, Apple } from 'lucide-react';

interface DirectApkDownloadButtonProps {
  /** Caminho do arquivo APK (padrão: '/levelup.apk') */
  apkUrl?: string;
  /** Nome do arquivo baixado (padrão: 'levelup.apk') */
  filename?: string;
  /** Texto do botão (padrão: 'Baixar o App (APK)') */
  label?: string;
  /** Estilo visual: 'full' (largura total) ou 'inline' */
  variant?: 'full' | 'inline' | 'banner';
  /** Classes extras de estilo */
  className?: string;
}

export const DirectApkDownloadButton: React.FC<DirectApkDownloadButtonProps> = ({
  apkUrl = '/levelup.apk',
  filename = 'levelup.apk',
  label = 'Baixar o App (APK)',
  variant = 'full',
  className = '',
}) => {
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSAlert, setShowIOSAlert] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const ua = navigator.userAgent || '';
      const platform =
        (navigator as any).userAgentData?.platform || navigator.platform || '';
      const isAppleMobile =
        /iPad|iPhone|iPod/.test(ua) ||
        (platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      setIsIOS(isAppleMobile);
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isIOS) {
      e.preventDefault();
      setShowIOSAlert(true);
    }
  };

  return (
    <>
      {variant === 'banner' ? (
        <div className={`p-4 bg-gradient-to-r from-[#121814] to-[#1A231C] border border-[#78FF00]/40 rounded-2xl shadow-[0_0_20px_rgba(120,255,0,0.15)] space-y-3 ${className}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#78FF00]/20 text-[#78FF00] flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Instalar LevelUp no Celular</h4>
                <p className="text-[11px] text-gray-400">Download direto do pacote APK Android</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#78FF00]/20 text-[#78FF00] border border-[#78FF00]/30 uppercase">
              APK v1.0
            </span>
          </div>

          <a
            href={apkUrl}
            download={filename}
            onClick={handleClick}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[#78FF00] hover:bg-[#6be600] active:scale-[0.98] text-[#0A0D0B] font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(120,255,0,0.3)] select-none no-underline cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#0A0D0B] stroke-[2.5]" />
            <span>{label}</span>
          </a>
        </div>
      ) : variant === 'inline' ? (
        <a
          href={apkUrl}
          download={filename}
          onClick={handleClick}
          className={`inline-flex items-center justify-center gap-2 py-2.5 px-5 bg-[#78FF00] hover:bg-[#6be600] active:scale-95 text-[#0A0D0B] font-black text-xs uppercase tracking-wide rounded-xl transition-all shadow-[0_0_15px_rgba(120,255,0,0.3)] select-none no-underline cursor-pointer ${className}`}
        >
          <Download className="w-4 h-4 text-[#0A0D0B] stroke-[2.5]" />
          <span>{label}</span>
        </a>
      ) : (
        <a
          href={apkUrl}
          download={filename}
          onClick={handleClick}
          className={`w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-[#78FF00] hover:bg-[#6be600] active:scale-[0.98] text-[#0A0D0B] font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-[0_0_25px_rgba(120,255,0,0.35)] hover:shadow-[0_0_35px_rgba(120,255,0,0.5)] select-none no-underline cursor-pointer ${className}`}
        >
          <Download className="w-5 h-5 text-[#0A0D0B] stroke-[2.5]" />
          <span>{label}</span>
        </a>
      )}

      {/* Alerta amigável no caso de acesso via iPhone / iPad (iOS) */}
      {showIOSAlert && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#121814] border border-[#78FF00]/50 rounded-3xl p-5 shadow-[0_0_35px_rgba(120,255,0,0.25)] space-y-4 text-white animate-scaleUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Dispositivo iOS Detectado</h3>
                  <p className="text-[11px] text-gray-400">Instalador APK exclusivo para Android</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSAlert(false)}
                className="p-1 text-gray-400 hover:text-white rounded-lg bg-gray-800/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#1A231C] border border-gray-800 rounded-xl space-y-2 text-xs text-gray-300">
              <p className="font-semibold text-white">
                O arquivo <strong>.APK</strong> é um pacote de instalação nativo exclusivo para sistemas <strong>Android</strong>.
              </p>
              <div className="pt-2 border-t border-gray-800/80 flex items-start gap-2">
                <Apple className="w-4 h-4 text-white shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-300">
                  Para instalar no seu iPhone, abra este site no navegador <strong>Safari</strong>, toque em <strong>Compartilhar (⎋)</strong> e selecione <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSAlert(false)}
              className="w-full py-2.5 bg-[#78FF00] hover:bg-[#6be600] text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

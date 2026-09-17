import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone, Share2, Check } from 'lucide-react';

interface PwaInstallBannerProps {
  /**
   * Forçar exibição para testes mesmo em desktop
   * @default false
   */
  forceVisibleForTesting?: boolean;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({
  forceVisibleForTesting = false,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Verificar se já está rodando instalado como PWA (modo standalone)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Verificar se foi dispensado nesta sessão
    const wasDismissed = sessionStorage.getItem('levelup_pwa_dismissed');
    if (wasDismissed === 'true' && !forceVisibleForTesting) {
      return;
    }

    // Detecção se é mobile (Android ou iOS)
    const ua = navigator.userAgent || '';
    const platform =
      (navigator as any).userAgentData?.platform || navigator.platform || '';
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
      (platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    const isAppleDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    setIsIOS(isAppleDevice);

    // 1. Escutar evento nativo beforeinstallprompt do navegador
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Evita a barra mini-infobar padrão do Chrome
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    // 2. Escutar quando for instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Se estiver no celular (mesmo no iOS onde o beforeinstallprompt não dispara)
    // ou se o desenvolvedor solicitou exibição de teste
    if ((isMobileDevice && !isStandalone) || forceVisibleForTesting) {
      // Exibir após 1.5 segundo para não conflitar com a animação inicial da tela
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [forceVisibleForTesting]);

  // Função principal de instalação ao clicar no botão
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Dispara o prompt nativo de instalação do PWA
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      setIsVisible(false);
      return;
    }

    // Caso seja iOS Safari (não há prompt automático do navegador)
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    // Se não houver prompt capturado (ex: Chrome em modo estrito ou desktop)
    setIsVisible(false);
  };

  // Dispensar o banner nesta sessão
  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('levelup_pwa_dismissed', 'true');
  };

  if (!isVisible || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Contêiner de Banner Inferior Fixo */}
      <aside
        role="dialog"
        aria-label="Instalar LevelUp na tela inicial"
        className="fixed bottom-3 inset-x-3 sm:bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md z-50 animate-slideUp"
      >
        <div className="bg-[#0A0D0B] border border-[#78FF00]/50 rounded-2xl p-3.5 sm:p-4 shadow-[0_0_30px_rgba(120,255,0,0.25)] backdrop-blur-md flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Ícone com Glow Verde Neon */}
              <div className="w-10 h-10 rounded-xl bg-[#78FF00]/15 border border-[#78FF00]/40 flex items-center justify-center text-[#78FF00] shrink-0 shadow-[0_0_15px_rgba(120,255,0,0.2)]">
                <Smartphone className="w-5 h-5 text-[#78FF00]" />
              </div>

              {/* Textos Informativos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded bg-[#78FF00] text-[#0A0D0B]">
                    App Rápido
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400">PWA Nativo</span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-white truncate tracking-tight">
                  Instale o LevelUp na sua tela inicial
                </h3>
                <p className="text-[11px] text-gray-400 truncate">
                  Acesso rápido com 1 toque, sem precisar de loja
                </p>
              </div>
            </div>

            {/* Botão de Fechar / Descartar */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Fechar aviso"
              className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-[#121814] hover:bg-gray-800 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Botão de Ação Principal (Baixar / Instalar) */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#78FF00] hover:bg-[#6be600] active:scale-[0.98] text-[#0A0D0B] font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(120,255,0,0.3)] cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#0A0D0B] stroke-[2.5]" />
              <span>Baixar / Instalar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Guiado para usuários de iPhone (Safari iOS) */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0A0D0B] border border-[#78FF00]/50 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(120,255,0,0.3)] space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#78FF00]/20 border border-[#78FF00]/40 flex items-center justify-center text-[#78FF00]">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Como Instalar no iPhone</h4>
                  <p className="text-xs text-gray-400">3 passos simples pelo Safari</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowIOSInstructions(false);
                  setIsVisible(false);
                }}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-gray-300">
              <div className="p-3 bg-[#121814] border border-gray-800 rounded-xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#78FF00] text-black font-black flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <p>
                  Abra este site no navegador oficial <strong>Safari</strong> da Apple.
                </p>
              </div>

              <div className="p-3 bg-[#121814] border border-gray-800 rounded-xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#78FF00] text-black font-black flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <p>
                  Toque no ícone de <strong>Compartilhar</strong> na barra inferior do Safari (quadrado com seta para cima ⎋).
                </p>
              </div>

              <div className="p-3 bg-[#121814] border border-gray-800 rounded-xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#78FF00] text-black font-black flex items-center justify-center text-[10px] shrink-0">
                  3
                </span>
                <p>
                  Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSInstructions(false);
                setIsVisible(false);
              }}
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

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Download,
  Smartphone,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  X,
  Share2,
  Apple,
  Chrome,
  ArrowDownToLine,
  ChevronRight,
  Info,
  Sparkles,
} from 'lucide-react';

export type DetectedPlatform = 'android' | 'ios' | 'desktop';

export interface DownloadAppButtonProps {
  /**
   * Caminho ou link direto para o download do APK no Android
   * @default '/downloads/levelup.apk'
   */
  apkUrl?: string;

  /**
   * Link da Google Play Store (opcional)
   */
  playStoreUrl?: string;

  /**
   * Link da Apple App Store (opcional)
   */
  appStoreUrl?: string;

  /**
   * URL do Web App / PWA para apontar no QR Code
   * @default URL atual ou link do projeto
   */
  webAppUrl?: string;

  /**
   * Se true, prioriza instalação direta do PWA (via prompt do navegador)
   * Se false, baixa diretamente o APK no Android
   * @default true
   */
  preferPwaOnAndroid?: boolean;

  /**
   * Estilo visual do botão:
   * - 'primary': Botão principal com gradiente/glow e badge de versão
   * - 'compact': Botão menor para barras de navegação ou headers
   * - 'full': Botão em largura 100% (ideal para sidebars e telas mobile)
   * - 'navbar': Botão estilizado para barra superior
   * @default 'primary'
   */
  variant?: 'primary' | 'compact' | 'full' | 'navbar';

  /**
   * Classes extras de Tailwind CSS
   */
  className?: string;

  /**
   * Rótulo principal do botão
   * @default 'Baixar o App'
   */
  label?: string;

  /**
   * Subrótulo indicativo
   * @default 'Android & iOS' (ou dinâmico pela plataforma)
   */
  subLabel?: string;

  /**
   * Exibir indicador/badge da plataforma detectada no botão
   * @default true
   */
  showDetectedBadge?: boolean;

  /**
   * Callback para analytics ou rastreamento de conversão
   */
  onAction?: (
    platform: DetectedPlatform,
    action: 'pwa' | 'apk' | 'playstore' | 'appstore' | 'desktop_modal'
  ) => void;
}

// Detecção inteligente de plataforma
export function detectDevicePlatform(): DetectedPlatform {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'desktop';
  }

  const ua = navigator.userAgent || '';
  const platform =
    (navigator as any).userAgentData?.platform || navigator.platform || '';

  // Android
  if (/Android/i.test(ua)) {
    return 'android';
  }

  // iOS (iPhone, iPad, iPod ou iPadOS no Safari desktop)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    return 'ios';
  }

  return 'desktop';
}

/**
 * Componente oficial de Download / Instalação do LevelUp
 * 
 * - Detecta automaticamente se o usuário está no Android, iOS ou Desktop.
 * - No Android: Permite instalação PWA com 1 clique ou download direto do APK / Google Play.
 * - No iOS: Abre instruções de PWA ("Adicionar à Tela de Início") ou link da App Store.
 * - No Desktop: Abre modal com QR Code escaneável por smartphone e links de download direto.
 */
export const DownloadAppButton: React.FC<DownloadAppButtonProps> = ({
  apkUrl = '/levelup.apk',
  playStoreUrl,
  appStoreUrl,
  webAppUrl,
  preferPwaOnAndroid = true,
  variant = 'primary',
  className = '',
  label = 'Baixar o App',
  subLabel,
  showDetectedBadge = true,
  onAction,
}) => {
  const [platform, setPlatform] = useState<DetectedPlatform>('desktop');
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);
  const [isAndroidSheetOpen, setIsAndroidSheetOpen] = useState(false);
  const [isIosSheetOpen, setIsIosSheetOpen] = useState(false);

  // Estado PWA (beforeinstallprompt)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // URL final para o QR Code
  const resolvedUrl =
    webAppUrl ||
    (typeof window !== 'undefined'
      ? window.location.origin.includes('run.app')
        ? window.location.origin
        : 'https://ais-pre-js5yg3vvb7a54obpxlgwzr-198877110875.us-east1.run.app'
      : 'https://ais-pre-js5yg3vvb7a54obpxlgwzr-198877110875.us-east1.run.app');

  // Inicialização e detecção de plataforma & suporte PWA
  useEffect(() => {
    const detected = detectDevicePlatform();
    setPlatform(detected);

    // Detectar se já está rodando em modo standalone (PWA instalado)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsPwaInstalled(isStandalone);

    // Capturar o evento nativo beforeinstallprompt do navegador
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsPwaInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Executar instalação nativa do PWA
  const triggerPwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsPwaInstalled(true);
        setDeferredPrompt(null);
        onAction?.(platform, 'pwa');
      }
      return true;
    }
    return false;
  };

  // Disparo do download do APK
  const triggerApkDownload = () => {
    onAction?.('android', 'apk');
    const link = document.createElement('a');
    link.href = apkUrl;
    link.download = 'levelup.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clique principal no botão
  const handleClick = async () => {
    if (platform === 'android') {
      // Se há o prompt PWA e foi configurado para preferir PWA
      if (preferPwaOnAndroid && deferredPrompt) {
        const installed = await triggerPwaInstall();
        if (installed) return;
      }

      // Se temos múltiplas opções no Android (APK, PWA ou PlayStore), abrir folha de escolha
      if (apkUrl || playStoreUrl || deferredPrompt) {
        setIsAndroidSheetOpen(true);
        return;
      }

      // Caso padrão: download do APK
      triggerApkDownload();
      return;
    }

    if (platform === 'ios') {
      // Se tiver link direto da App Store configurado, pode redirecionar ou exibir opções
      if (appStoreUrl && !isIosSheetOpen) {
        window.open(appStoreUrl, '_blank', 'noopener,noreferrer');
        onAction?.('ios', 'appstore');
        return;
      }

      // Padrão iOS: abrir guia visual de instalação PWA (Adicionar à Tela de Início)
      setIsIosSheetOpen(true);
      onAction?.('ios', 'pwa');
      return;
    }

    // No Desktop: abre o modal de download com QR Code
    setIsDesktopModalOpen(true);
    onAction?.('desktop', 'desktop_modal');
  };

  // Texto descritivo de plataforma
  const displaySubLabel =
    subLabel ||
    (platform === 'android'
      ? 'Versão Android (APK & PWA)'
      : platform === 'ios'
      ? 'Versão iOS (iPhone & iPad)'
      : 'Android & iOS');

  // Variantes visuais do botão
  const renderButtonContent = () => {
    switch (variant) {
      case 'compact':
        return (
          <button
            type="button"
            onClick={handleClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#78FF00] hover:bg-[#6be600] active:scale-95 text-black font-extrabold text-xs transition-all shadow-[0_0_15px_rgba(120,255,0,0.25)] ${className}`}
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        );

      case 'navbar':
        return (
          <button
            type="button"
            onClick={handleClick}
            className={`flex items-center gap-1.5 px-2.5 py-1 bg-[#78FF00]/15 hover:bg-[#78FF00]/25 text-[#78FF00] border border-[#78FF00]/40 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-[0_0_10px_rgba(120,255,0,0.15)] ${className}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        );

      case 'full':
        return (
          <button
            type="button"
            onClick={handleClick}
            className={`w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-[#121814] to-[#1A231C] hover:from-[#1a241d] hover:to-[#223025] border border-[#78FF00]/40 hover:border-[#78FF00] rounded-2xl text-left transition-all active:scale-[0.99] shadow-[0_0_25px_rgba(120,255,0,0.15)] group ${className}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#78FF00]/20 text-[#78FF00] border border-[#78FF00]/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-white">{label}</span>
                  {showDetectedBadge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#78FF00]/20 text-[#78FF00] border border-[#78FF00]/30 uppercase">
                      {platform === 'android'
                        ? 'Android'
                        : platform === 'ios'
                        ? 'iOS'
                        : 'Celular'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{displaySubLabel}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#78FF00] transition-colors" />
          </button>
        );

      case 'primary':
      default:
        return (
          <button
            type="button"
            onClick={handleClick}
            className={`relative group inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-[#78FF00] to-[#5ec900] hover:from-[#89ff1e] hover:to-[#6be600] active:scale-95 text-black font-black transition-all duration-200 shadow-[0_0_30px_rgba(120,255,0,0.35)] hover:shadow-[0_0_40px_rgba(120,255,0,0.5)] ${className}`}
          >
            <div className="w-8 h-8 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-black animate-bounce group-hover:animate-none" />
            </div>
            <div className="text-left leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-tight">{label}</span>
                {showDetectedBadge && (
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-md bg-black/20 text-black">
                    {platform === 'android'
                      ? 'Android'
                      : platform === 'ios'
                      ? 'iOS'
                      : 'App'}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-black/80">{displaySubLabel}</p>
            </div>
          </button>
        );
    }
  };

  return (
    <>
      {renderButtonContent()}

      {/* 1. MODAL DESKTOP (QR Code e Links Diretos) */}
      <DesktopQrModal
        isOpen={isDesktopModalOpen}
        onClose={() => setIsDesktopModalOpen(false)}
        appUrl={resolvedUrl}
        apkUrl={apkUrl}
        playStoreUrl={playStoreUrl}
        appStoreUrl={appStoreUrl}
      />

      {/* 2. BOTTOM SHEET ANDROID (Opções de Instalação: PWA vs APK) */}
      <AndroidInstallSheet
        isOpen={isAndroidSheetOpen}
        onClose={() => setIsAndroidSheetOpen(false)}
        apkUrl={apkUrl}
        playStoreUrl={playStoreUrl}
        hasPwaPrompt={!!deferredPrompt}
        onTriggerPwa={triggerPwaInstall}
        onTriggerApk={triggerApkDownload}
      />

      {/* 3. BOTTOM SHEET IOS (Instruções Safari "Adicionar à Tela de Início") */}
      <IosInstallSheet
        isOpen={isIosSheetOpen}
        onClose={() => setIsIosSheetOpen(false)}
        appStoreUrl={appStoreUrl}
      />
    </>
  );
};

/* =========================================================================
   SUB-COMPONENTES: MODAIS E SHEETS MODULARES
   ========================================================================= */

/**
 * Modal para usuários no Desktop: exibe QR Code para escanear com a câmera do celular
 */
interface DesktopQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
  apkUrl: string;
  playStoreUrl?: string;
  appStoreUrl?: string;
}

const DesktopQrModal: React.FC<DesktopQrModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  apkUrl,
  playStoreUrl,
  appStoreUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(appUrl, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0A0D0B',
        light: '#FFFFFF',
      },
    })
      .then(setQrCodeDataUrl)
      .catch((err) => console.error('Erro ao gerar QR Code:', err));
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#121814] border border-[#78FF00]/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(120,255,0,0.25)] space-y-4 text-white relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#78FF00]/20 border border-[#78FF00]/40 flex items-center justify-center text-[#78FF00]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Instalar no Celular</h3>
              <p className="text-xs text-gray-400">Escaneie com a câmera do seu smartphone</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-800/60 hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#1A231C] border border-gray-800 rounded-2xl text-center space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#78FF00]">
            <QrCode className="w-4 h-4" />
            <span>Aponte a câmera para abrir no celular</span>
          </div>

          <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code LevelUp"
                className="w-48 h-48 object-contain"
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-xs text-gray-400">
                Gerando código...
              </div>
            )}
          </div>
          <p className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
            Funciona diretamente no Android (Chrome) e iPhone (Safari) sem necessidade de cadastro prévio.
          </p>
        </div>

        {/* Copiar Link */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Ou abra o link diretamente:
          </label>
          <div className="flex items-center gap-2 bg-[#0A0D0B] border border-gray-800 rounded-xl p-2 pl-3">
            <span className="text-xs text-gray-300 truncate flex-1 font-mono select-all">
              {appUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-[#78FF00] hover:bg-[#6be600] active:scale-95 text-black font-black text-xs rounded-lg transition-all flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        {/* Downloads Diretos (Desktop) */}
        <div className="pt-2 border-t border-gray-800 space-y-2">
          <p className="text-[11px] text-gray-400 font-semibold">Downloads diretos:</p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href={apkUrl}
              download="levelup.apk"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#1A231C] hover:bg-[#233026] border border-gray-800 hover:border-[#78FF00]/40 text-xs font-bold text-gray-200 transition-all text-center"
            >
              <ArrowDownToLine className="w-4 h-4 text-[#78FF00]" />
              <span>Baixar APK</span>
            </a>

            {appStoreUrl ? (
              <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#1A231C] hover:bg-[#233026] border border-gray-800 hover:border-gray-600 text-xs font-bold text-gray-200 transition-all text-center"
              >
                <Apple className="w-4 h-4 text-white" />
                <span>App Store</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#1A231C] hover:bg-[#233026] border border-gray-800 hover:border-gray-600 text-xs font-bold text-gray-200 transition-all text-center"
              >
                <Apple className="w-4 h-4 text-white" />
                <span>iOS (PWA)</span>
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

/**
 * Bottom Sheet para Android com opções de instalação (PWA nativo vs Arquivo APK)
 */
interface AndroidInstallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  apkUrl: string;
  playStoreUrl?: string;
  hasPwaPrompt: boolean;
  onTriggerPwa: () => void;
  onTriggerApk: () => void;
}

const AndroidInstallSheet: React.FC<AndroidInstallSheetProps> = ({
  isOpen,
  onClose,
  apkUrl,
  playStoreUrl,
  hasPwaPrompt,
  onTriggerPwa,
  onTriggerApk,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#121814] border border-[#78FF00]/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(120,255,0,0.25)] space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#78FF00]/20 border border-[#78FF00]/40 flex items-center justify-center text-[#78FF00]">
              <Chrome className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Instalar no Android</h3>
              <p className="text-xs text-gray-400">Escolha o método de sua preferência</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {/* Opção 1: PWA (Recomendado) */}
          <button
            type="button"
            onClick={() => {
              onTriggerPwa();
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-[#1A231C] to-[#141c16] hover:from-[#212f24] hover:to-[#1a261d] border border-[#78FF00]/50 flex items-center justify-between group transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#78FF00] text-black flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">Instalar como App (PWA)</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#78FF00] text-black">
                    Mais Rápido
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Instalação instantânea sem ocupar espaço e com atualizações automáticas
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#78FF00]" />
          </button>

          {/* Opção 2: Download do APK */}
          <button
            type="button"
            onClick={() => {
              onTriggerApk();
              onClose();
            }}
            className="w-full p-3.5 rounded-2xl bg-[#1A231C] hover:bg-[#222f25] border border-gray-800 hover:border-[#78FF00]/40 flex items-center justify-between group transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-800 text-[#78FF00] flex items-center justify-center font-bold">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-white">Baixar Pacote APK (.apk)</span>
                <p className="text-[11px] text-gray-400">
                  Download direto do instalador para o armazenamento do celular
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#78FF00]" />
          </button>

          {/* Opção 3: Google Play (se configurado) */}
          {playStoreUrl && (
            <a
              href={playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-3.5 rounded-2xl bg-[#1A231C] hover:bg-[#222f25] border border-gray-800 flex items-center justify-between group transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black text-white">Google Play Store</span>
                  <p className="text-[11px] text-gray-400">Acessar página oficial na Play Store</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white" />
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

/**
 * Bottom Sheet para iOS com instruções visuais do Safari ("Adicionar à Tela de Início")
 */
interface IosInstallSheetProps {
  isOpen: boolean;
  onClose: () => void;
  appStoreUrl?: string;
}

const IosInstallSheet: React.FC<IosInstallSheetProps> = ({
  isOpen,
  onClose,
  appStoreUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#121814] border border-gray-700/60 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(255,255,255,0.1)] space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center text-white">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Instalar no iPhone / iPad</h3>
              <p className="text-xs text-gray-400">Funciona diretamente pelo Safari</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Passo a Passo Apple */}
        <div className="p-3.5 bg-[#1A231C]/90 border border-gray-800 rounded-2xl space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-white/20 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              1
            </span>
            <p className="text-gray-200 leading-snug">
              Certifique-se de estar abrindo este site no navegador <strong>Safari</strong> da Apple.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-white/20 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              2
            </span>
            <p className="text-gray-200 leading-snug">
              Toque no botão <strong>Compartilhar</strong> na barra inferior do Safari (ícone de quadrado com uma seta para cima <Share2 className="w-3.5 h-3.5 inline text-[#78FF00]" />).
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-white/20 text-white font-bold flex items-center justify-center shrink-0 text-xs">
              3
            </span>
            <p className="text-gray-200 leading-snug">
              Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>. Depois toque em <strong>"Adicionar"</strong>.
            </p>
          </div>
        </div>

        {/* Se houver link da App Store */}
        {appStoreUrl && (
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-white text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-gray-200"
          >
            <Apple className="w-4 h-4 fill-current" />
            <span>Ver na Apple App Store</span>
          </a>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default DownloadAppButton;

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
  Sparkles,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { LevelUpDownloadApkButton } from './LevelUpDownloadApkButton';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const { isInstallable, install } = usePWAInstall();

  // URL do aplicativo
  // Usa o domínio compartilhado se disponível, ou window.location.origin
  const rawUrl =
    typeof window !== 'undefined'
      ? window.location.origin.includes('run.app')
        ? window.location.origin
        : 'https://ais-pre-js5yg3vvb7a54obpxlgwzr-198877110875.us-east1.run.app'
      : 'https://ais-pre-js5yg3vvb7a54obpxlgwzr-198877110875.us-east1.run.app';

  const appUrl = rawUrl;

  // Gerar QR Code de alta resolução com QRCode
  useEffect(() => {
    if (!isOpen) return;

    QRCode.toDataURL(appUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#0A0D0B',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Erro ao gerar QR Code:', err);
      });
  }, [isOpen, appUrl]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-[#121814] border border-[#78FF00]/40 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(120,255,0,0.25)] space-y-4 text-white relative max-h-[92vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#78FF00]/20 border border-[#78FF00]/40 flex items-center justify-center text-[#78FF00]">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Baixar no Celular</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#78FF00] text-black">
                  App PWA
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Instale o LevelUp direto no seu Android ou iPhone
              </p>
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

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#1A231C] border border-gray-800 rounded-2xl text-center space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#78FF00]">
            <QrCode className="w-4 h-4" />
            <span>Aponte a câmera do celular para escanear</span>
          </div>

          <div className="bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="QR Code para baixar LevelUp no celular"
                className="w-44 h-44 sm:w-48 sm:h-48 object-contain"
              />
            ) : (
              <div className="w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center text-gray-400 text-xs">
                Gerando QR Code...
              </div>
            )}
          </div>

          <p className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
            Ao escanear, o link abrirá diretamente no navegador do seu smartphone para instalação instantânea.
          </p>
        </div>

        {/* Link direto & Botão de Copiar */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Ou acesse pelo link direto:
          </label>
          <div className="flex items-center gap-2 bg-[#0A0D0B] border border-gray-800 rounded-xl p-2 pl-3">
            <span className="text-xs text-gray-300 truncate flex-1 font-mono select-all">
              {appUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#78FF00] hover:bg-[#6be600] active:scale-95 text-black font-extrabold text-xs rounded-lg transition-all flex items-center gap-1.5 shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Download Direto APK para Android */}
        <div className="pt-1">
          <LevelUpDownloadApkButton buttonText="Baixar o App (APK Direto)" />
        </div>

        {/* Se o navegador suportar instalação nativa direta (beforeinstallprompt) */}
        {isInstallable && (
          <button
            type="button"
            onClick={install}
            className="w-full py-3 bg-[#78FF00] hover:bg-[#6be600] text-black font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(120,255,0,0.3)] transition-all"
          >
            <Smartphone className="w-4 h-4" />
            <span>Instalar Aplicativo Agora</span>
          </button>
        )}

        {/* Instruções passo a passo por sistema operacional */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2 border-b border-gray-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'android'
                  ? 'bg-[#1A231C] text-[#78FF00] border border-[#78FF00]/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Chrome className="w-3.5 h-3.5" />
              <span>Android (Chrome)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ios'
                  ? 'bg-[#1A231C] text-white border border-gray-600'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone (Safari)</span>
            </button>
          </div>

          {activeTab === 'android' ? (
            <div className="p-3 bg-[#1A231C]/80 border border-gray-800/80 rounded-xl space-y-2 text-xs text-gray-300">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#78FF00]/20 text-[#78FF00] flex items-center justify-center text-[11px]">1</span>
                Abra o link no <strong>Google Chrome</strong> do seu celular.
              </p>
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#78FF00]/20 text-[#78FF00] flex items-center justify-center text-[11px]">2</span>
                Toque no menu de 3 pontinhos (<strong>⋮</strong>) no canto superior.
              </p>
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#78FF00]/20 text-[#78FF00] flex items-center justify-center text-[11px]">3</span>
                Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
              </p>
              <p className="text-[11px] text-[#78FF00] pt-1">
                Pronto! O LevelUp funcionará em tela cheia com ícone próprio como um aplicativo da Play Store.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-[#1A231C]/80 border border-gray-800/80 rounded-xl space-y-2 text-xs text-gray-300">
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[11px]">1</span>
                Abra o link no navegador <strong>Safari</strong> do iPhone.
              </p>
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[11px]">2</span>
                Toque no botão <strong>Compartilhar</strong> (quadrado com seta para cima ⎋).
              </p>
              <p className="font-bold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[11px]">3</span>
                Role e escolha <strong>"Adicionar à Tela de Início"</strong>.
              </p>
              <p className="text-[11px] text-gray-300 pt-1">
                Pronto! O app aparecerá na grade de aplicativos do seu iPhone sem barras de navegador.
              </p>
            </div>
          )}
        </div>

        {/* Botão de Fechar */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl transition-colors"
        >
          Entendido, fechar
        </button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  ArrowLeft,
  X,
  Plus,
  ChevronRight,
  Shield,
  Smartphone,
  Loader2,
  SlidersHorizontal,
  Fingerprint,
  Download,
} from 'lucide-react';
import {
  Gender,
  UserProfile,
  DeviceSocialAccount,
  DeviceSocialAuthStatus,
} from '../types';
import {
  checkDeviceSocialAuthStatus,
  executeGoogleSignIn,
  executeAppleSignIn,
  setDeviceGoogleEnabled,
  setDeviceAppleEnabled,
  resetDeviceDetectionToAuto,
} from '../services/deviceAuthService';
import { LgpdModal } from './LgpdModal';
import { LevelUpLogo } from './LevelUpLogo';
import { DownloadAppButton } from './DownloadAppButton';

interface SignUpScreenProps {
  initialMode?: 'login' | 'signup';
  onSignUpSuccess: (profileData: Partial<UserProfile>) => void;
  onSwitchMode?: (mode: 'login' | 'signup') => void;
  onBack?: () => void;
  onOpenInstallModal?: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  initialMode = 'signup',
  onSignUpSuccess,
  onSwitchMode,
  onBack,
  onOpenInstallModal,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [genero, setGenero] = useState<Gender>('masculino');
  const [aceitouLgpd, setAceitouLgpd] = useState(false);
  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Estado da Detecção Dinâmica de Contas no Dispositivo
  const [deviceAuth, setDeviceAuth] = useState<DeviceSocialAuthStatus>({
    hasGoogleAccounts: false,
    googleAccounts: [],
    hasAppleAccount: false,
    appleAccount: null,
    isChecking: true,
  });

  // Estado dos modais de autenticação e feedback
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isAppleSheetOpen, setIsAppleSheetOpen] = useState(false);
  const [isAuthenticatingSocial, setIsAuthenticatingSocial] = useState<'google' | 'apple' | null>(null);
  const [isDeviceSimulatorOpen, setIsDeviceSimulatorOpen] = useState(false);

  // Custom email fallback form
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Sincroniza modo inicial
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  /**
   * Executa a verificação nativa das contas do dispositivo ao montar o componente
   * e assina eventos de atualização de contas.
   */
  const loadDeviceAccounts = async () => {
    try {
      const status = await checkDeviceSocialAuthStatus();
      setDeviceAuth(status);
    } catch (e) {
      console.error('Erro ao verificar contas nativas do dispositivo:', e);
      setDeviceAuth((prev) => ({ ...prev, isChecking: false }));
    }
  };

  useEffect(() => {
    loadDeviceAccounts();

    const handleAccountsChanged = () => {
      loadDeviceAccounts();
    };

    window.addEventListener('device_accounts_changed', handleAccountsChanged);
    return () => {
      window.removeEventListener('device_accounts_changed', handleAccountsChanged);
    };
  }, []);

  const toggleMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMessage('');
    if (onSwitchMode) {
      onSwitchMode(newMode);
    }
  };

  // Envio padrão de login / cadastro com e-mail e senha
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, insira um e-mail válido.');
      return;
    }

    if (!senha || senha.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    // MODO LOGIN
    if (mode === 'login') {
      onSignUpSuccess({
        email: email.trim(),
        nomeCompleto: nome.trim() || email.split('@')[0] || 'Atleta LevelUp',
        isLoggedIn: true,
      });
      return;
    }

    // MODO CADASTRO
    if (!nome.trim()) {
      setErrorMessage('Por favor, informe seu Nome Completo.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErrorMessage('As senhas não coincidem!');
      return;
    }

    if (!aceitouLgpd) {
      setErrorMessage('Você deve aceitar os termos da LGPD para criar sua conta.');
      return;
    }

    onSignUpSuccess({
      nomeCompleto: nome.trim(),
      email: email.trim(),
      genero,
      aceitouLgpd: true,
      dataAceiteLgpd: new Date().toISOString(),
      isLoggedIn: true,
    });
  };

  /**
   * FLUXO DE AUTENTICAÇÃO COM CONTA GOOGLE DO DISPOSITIVO
   */
  const handleSelectGoogleAccount = async (account: DeviceSocialAccount) => {
    try {
      setIsAuthenticatingSocial('google');
      setErrorMessage('');

      // Executa chamada do SDK do Google com o token nativo
      const result = await executeGoogleSignIn(account);

      setIsGoogleModalOpen(false);
      setShowCustomEmailInput(false);

      onSignUpSuccess({
        nomeCompleto: result.name,
        email: result.email,
        genero: 'masculino',
        aceitouLgpd: true,
        dataAceiteLgpd: new Date().toISOString(),
        isLoggedIn: true,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar com a conta Google selecionada.');
    } finally {
      setIsAuthenticatingSocial(null);
    }
  };

  const handleCustomGoogleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@')) {
      alert('Por favor, informe um e-mail válido.');
      return;
    }
    const finalName = customName.trim() || customEmail.split('@')[0] || 'Atleta LevelUp';
    handleSelectGoogleAccount({
      id: `custom-google-${Date.now()}`,
      provider: 'google',
      name: finalName,
      email: customEmail.trim(),
      avatarColor: 'bg-indigo-600',
    });
  };

  /**
   * FLUXO DE AUTENTICAÇÃO COM APPLE ID (SIGN IN WITH APPLE)
   */
  const handleConfirmAppleSignIn = async () => {
    try {
      setIsAuthenticatingSocial('apple');
      setErrorMessage('');

      // Executa chamada do SDK nativo da Apple (AuthenticationServices / FaceID)
      const result = await executeAppleSignIn();

      setIsAppleSheetOpen(false);

      onSignUpSuccess({
        nomeCompleto: result.name,
        email: result.email,
        genero: 'masculino',
        aceitouLgpd: true,
        dataAceiteLgpd: new Date().toISOString(),
        isLoggedIn: true,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar com Apple ID.');
    } finally {
      setIsAuthenticatingSocial(null);
    }
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#0A0D0B] text-white p-5 sm:p-8 select-none relative">
      <LgpdModal
        isOpen={isLgpdModalOpen}
        onClose={() => setIsLgpdModalOpen(false)}
        onAcceptAndClose={() => {
          setAceitouLgpd(true);
          setIsLgpdModalOpen(false);
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 1. MODAL GOOGLE: LISTA APENAS AS CONTAS ENCONTRADAS NO DISPOSITIVO */}
      {/* ------------------------------------------------------------- */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#121814] border border-[#78FF00]/40 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_50px_rgba(120,255,0,0.2)] space-y-4 text-white relative animate-slideUp">
            {/* Cabeçalho do Modal Google */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2.5">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Fazer login com o Google
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    Contas Google salvas no seu aparelho
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsGoogleModalOpen(false);
                  setShowCustomEmailInput(false);
                }}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-800/50 hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Escolha uma conta Google detectada neste dispositivo para entrar:
            </p>

            {/* Listagem das Contas do Google Ativas no Aparelho */}
            {!showCustomEmailInput ? (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {deviceAuth.googleAccounts.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    disabled={isAuthenticatingSocial !== null}
                    onClick={() => handleSelectGoogleAccount(acc)}
                    className="w-full p-3 rounded-2xl bg-[#1A231C] border border-gray-800 hover:border-[#78FF00]/60 hover:bg-[#222d25] transition-all flex items-center justify-between group text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${acc.avatarColor || 'bg-blue-600'} flex items-center justify-center font-bold text-sm shadow-md shrink-0`}
                      >
                        {acc.name.charAt(0)}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-bold text-white group-hover:text-[#78FF00] transition-colors truncate">
                          {acc.name}
                        </h4>
                        <p className="text-[11px] text-gray-400 truncate">{acc.email}</p>
                      </div>
                    </div>
                    {isAuthenticatingSocial === 'google' ? (
                      <Loader2 className="w-4 h-4 text-[#78FF00] animate-spin shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-[#78FF00] group-hover:translate-x-0.5 transition-all shrink-0" />
                    )}
                  </button>
                ))}

                {/* Opção para adicionar outro e-mail Google */}
                <button
                  type="button"
                  onClick={() => setShowCustomEmailInput(true)}
                  className="w-full p-3 rounded-2xl bg-[#121814] border border-dashed border-gray-700 hover:border-[#78FF00] hover:text-[#78FF00] transition-all flex items-center justify-center gap-2 text-xs font-bold text-gray-400 mt-2"
                >
                  <Plus className="w-4 h-4 text-[#78FF00]" />
                  <span>Usar outra conta Google</span>
                </button>
              </div>
            ) : (
              /* Formulário manual de e-mail */
              <form onSubmit={handleCustomGoogleAccountSubmit} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">Seu Nome</label>
                  <input
                    type="text"
                    placeholder="Ex: Carlos Silva"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-[#1A231C] border border-gray-700 focus:border-[#78FF00] rounded-xl py-2 px-3 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 mb-1">E-mail Google</label>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@gmail.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full bg-[#1A231C] border border-gray-700 focus:border-[#78FF00] rounded-xl py-2 px-3 text-xs text-white outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#78FF00] text-black font-extrabold text-xs rounded-xl hover:bg-[#6be600]"
                  >
                    Entrar com esta Conta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomEmailInput(false)}
                    className="py-2.5 px-3 bg-[#1A231C] text-gray-300 text-xs font-bold rounded-xl"
                  >
                    Voltar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MODAL / SHEET NATIVO APPLE: SIGN IN WITH APPLE ID */}
      {/* ------------------------------------------------------------- */}
      {isAppleSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#18181B] border border-zinc-700 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 text-white relative animate-slideUp">
            {/* Header Estilo Apple ID */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.13c.67-.82 1.12-1.96.99-3.13-1 .04-2.18.67-2.88 1.49-.63.73-1.18 1.9-1.03 3.04 1.12.09 2.25-.58 2.92-1.4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Iniciar sessão com o ID Apple
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Conta Apple ativa neste aparelho
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAppleSheetOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg bg-zinc-800/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Deseja usar o seu ID Apple configurado para iniciar sessão no app <strong>LevelUp</strong>?
            </p>

            {/* Cartão de Detalhes da Conta Apple do Aparelho */}
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">Nome:</span>
                <span className="font-semibold text-white">
                  {deviceAuth.appleAccount?.name || 'Luiz Felipe'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400">ID Apple:</span>
                <span className="font-semibold text-white">
                  {deviceAuth.appleAccount?.email || 'lfgames108@icloud.com'}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isAuthenticatingSocial === 'apple'}
                onClick={handleConfirmAppleSignIn}
                className="w-full py-3.5 bg-white hover:bg-zinc-200 active:scale-[0.98] text-black font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                {isAuthenticatingSocial === 'apple' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Autenticando via Apple ID...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4 text-black" />
                    <span>Continuar com Face ID / Senha</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsAppleSheetOpen(false)}
                className="w-full py-2.5 text-zinc-400 hover:text-white text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. SIMULADOR DE CONTAS DO DISPOSITIVO (FERRAMENTA DE TESTE) */}
      {/* ------------------------------------------------------------- */}
      {isDeviceSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-[#121814] border border-[#78FF00]/50 rounded-t-3xl sm:rounded-3xl p-5 shadow-[0_0_50px_rgba(120,255,0,0.3)] space-y-4 text-white relative animate-slideUp">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#78FF00]" />
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    Simulador de Contas no Aparelho
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    Teste a omissão dinâmica dos botões em tempo real
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeviceSimulatorOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-gray-800/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Toggle Contas Google */}
              <div className="p-3 bg-[#1A231C] border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
                    Contas Google (Gmail):
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      deviceAuth.hasGoogleAccounts
                        ? 'bg-[#78FF00]/20 text-[#78FF00]'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {deviceAuth.hasGoogleAccounts
                      ? `${deviceAuth.googleAccounts.length} conta(s) salvas`
                      : 'Nenhuma conta'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {deviceAuth.hasGoogleAccounts
                    ? 'O botão do Google é exibido e lista as contas ao clicar.'
                    : 'Como NÃO há contas Google no celular, o botão é 100% OMITIDO da tela.'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDeviceGoogleEnabled(!deviceAuth.hasGoogleAccounts);
                    }}
                    className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                      deviceAuth.hasGoogleAccounts
                        ? 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/50'
                        : 'bg-[#78FF00] hover:bg-[#6be600] text-black'
                    }`}
                  >
                    {deviceAuth.hasGoogleAccounts
                      ? 'Remover Contas Google do Aparelho'
                      : 'Adicionar Contas Google ao Aparelho'}
                  </button>
                </div>
              </div>

              {/* Toggle Conta Apple ID */}
              <div className="p-3 bg-[#1A231C] border border-gray-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    Apple ID / Sign in with Apple:
                  </span>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      deviceAuth.hasAppleAccount
                        ? 'bg-[#78FF00]/20 text-[#78FF00]'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {deviceAuth.hasAppleAccount ? 'Conta Ativa' : 'Incompatível / Sem conta'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {deviceAuth.hasAppleAccount
                    ? 'O botão da Apple é exibido normalmente.'
                    : 'Sem Apple ID no aparelho, a opção da Apple é 100% OMITIDA da tela.'}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDeviceAppleEnabled(!deviceAuth.hasAppleAccount);
                    }}
                    className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all ${
                      deviceAuth.hasAppleAccount
                        ? 'bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/50'
                        : 'bg-[#78FF00] hover:bg-[#6be600] text-black'
                    }`}
                  >
                    {deviceAuth.hasAppleAccount
                      ? 'Desvincular Apple ID do Aparelho'
                      : 'Ativar Apple ID no Aparelho'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                resetDeviceDetectionToAuto();
                setIsDeviceSimulatorOpen(false);
              }}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold rounded-xl"
            >
              Restaurar Detecção Automática do Aparelho
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="pt-2">
        {/* App Logo Header + Simulator Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="w-10" />
          <div className="flex items-center justify-center gap-2">
            <LevelUpLogo size="sm" />
            <span className="font-extrabold text-base tracking-tight italic">
              LEVEL<span className="text-[#78FF00] not-italic">UP</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <DownloadAppButton variant="navbar" label="Baixar App" showDetectedBadge={false} />

            {/* Botão discreto para testar/simular contas do aparelho */}
            <button
              type="button"
              onClick={() => setIsDeviceSimulatorOpen(true)}
              className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1 rounded-xl bg-[#121814] border border-gray-800 hover:border-[#78FF00]/50 text-gray-400 hover:text-[#78FF00] transition-all text-[10px] font-bold"
              title="Configurar/simular contas salvas no aparelho"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#78FF00]" />
              <span className="hidden sm:inline">Contas</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Header Toggle */}
        <div className="flex items-center gap-2 mt-2 mb-2 p-1 bg-[#121814] border border-gray-800 rounded-xl">
          <button
            type="button"
            onClick={() => toggleMode('login')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-[#78FF00] text-black shadow-[0_0_10px_rgba(120,255,0,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login</span>
          </button>
          <button
            type="button"
            onClick={() => toggleMode('signup')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              mode === 'signup'
                ? 'bg-[#78FF00] text-black shadow-[0_0_10px_rgba(120,255,0,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Cadastro</span>
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-3">
          {mode === 'login' ? 'Entrar na Conta' : 'Criar Conta'}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          {mode === 'login'
            ? 'Bem-vindo de volta! Digite seu e-mail e senha para acessar.'
            : 'Preencha seus dados para iniciar seu plano de treino personalizado.'}
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Nome Completo (Apenas no Cadastro) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="text"
                required
                placeholder="Ex: Carlos Silva"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-[#121814] border border-gray-800 focus:border-[#78FF00] focus:ring-1 focus:ring-[#78FF00] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="email"
              required
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#121814] border border-gray-800 focus:border-[#78FF00] focus:ring-1 focus:ring-[#78FF00] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
            />
          </div>
        </div>

        {/* Gênero Dropdown (Apenas no Cadastro) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Gênero</label>
            <select
              value={genero}
              onChange={(e) => setGenero(e.target.value as Gender)}
              className="w-full bg-[#121814] border border-gray-800 focus:border-[#78FF00] focus:ring-1 focus:ring-[#78FF00] rounded-xl py-2.5 px-4 text-sm text-white outline-none transition-all"
            >
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro / Não-binário</option>
              <option value="prefiro_nao_dizer">Prefiro não responder</option>
            </select>
          </div>
        )}

        {/* Senha */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full bg-[#121814] border border-gray-800 focus:border-[#78FF00] focus:ring-1 focus:ring-[#78FF00] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
            />
          </div>
        </div>

        {/* Confirmar Senha (Apenas no Cadastro) */}
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">Confirmar Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-[#121814] border border-gray-800 focus:border-[#78FF00] focus:ring-1 focus:ring-[#78FF00] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Termos LGPD (Apenas no Cadastro) */}
        {mode === 'signup' && (
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={aceitouLgpd}
                onChange={(e) => setAceitouLgpd(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#78FF00] bg-[#121814] border-gray-700 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-300 leading-snug">
                Aceito os termos da{' '}
                <button
                  type="button"
                  onClick={() => setIsLgpdModalOpen(true)}
                  className="text-[#78FF00] hover:underline font-semibold"
                >
                  LGPD (Lei Geral de Proteção de Dados)
                </button>{' '}
                e concordo com o processamento dos meus dados de saúde.
              </span>
            </label>
          </div>
        )}

        {/* Botão de Envio */}
        <button
          type="submit"
          className="w-full mt-3 py-3.5 px-4 bg-[#78FF00] hover:bg-[#6be600] active:scale-[0.99] text-[#0A0D0B] font-extrabold text-sm rounded-xl shadow-[0_0_20px_rgba(120,255,0,0.35)] transition-all flex items-center justify-center gap-2"
        >
          {mode === 'login' ? (
            <>
              <LogIn className="w-5 h-5 text-[#0A0D0B]" />
              <span>Entrar</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-[#0A0D0B]" />
              <span>Cadastrar e Continuar</span>
            </>
          )}
        </button>

        {/* Rodapé Alternar Modo */}
        <div className="text-center pt-2">
          {mode === 'login' ? (
            <p className="text-xs text-gray-400">
              Não tem uma conta ainda?{' '}
              <button
                type="button"
                onClick={() => toggleMode('signup')}
                className="text-[#78FF00] font-bold hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          ) : (
            <p className="text-xs text-gray-400">
              Já tem uma conta?{' '}
              <button
                type="button"
                onClick={() => toggleMode('login')}
                className="text-[#78FF00] font-bold hover:underline"
              >
                Faça Login
              </button>
            </p>
          )}
        </div>
      </form>

      {/* ------------------------------------------------------------- */}
      {/* SEÇÃO DINÂMICA DE AUTENTICAÇÃO SOCIAL (OAuth) */}
      {/* Baseada na disponibilidade de contas salvas no aparelho */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-4 border-t border-gray-900 mt-4 animate-fadeIn">
        {deviceAuth.hasGoogleAccounts || deviceAuth.hasAppleAccount ? (
          <>
            <p className="text-center text-[11px] uppercase tracking-wider text-gray-500 mb-3 font-semibold">
              Ou conecte-se rapidamente
            </p>

            <div
              className={`grid ${
                deviceAuth.hasGoogleAccounts && deviceAuth.hasAppleAccount
                  ? 'grid-cols-2'
                  : 'grid-cols-1'
              } gap-3`}
            >
              {/* 1. BOTÃO GOOGLE: EXIBIDO APENAS SE HOUVER CONTAS GOOGLE NO DISPOSITIVO */}
              {deviceAuth.hasGoogleAccounts && (
                <button
                  type="button"
                  disabled={isAuthenticatingSocial !== null}
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#121814] hover:bg-[#1a231c] border border-gray-800 hover:border-[#78FF00]/50 rounded-xl text-xs font-bold text-gray-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isAuthenticatingSocial === 'google' ? (
                    <Loader2 className="w-4 h-4 text-[#78FF00] animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                      />
                    </svg>
                  )}
                  <span>Conectar com Google</span>
                </button>
              )}

              {/* 2. BOTÃO APPLE: EXIBIDO APENAS SE HOUVER SUPORTE E CONTA APPLE ID NO DISPOSITIVO */}
              {deviceAuth.hasAppleAccount && (
                <button
                  type="button"
                  disabled={isAuthenticatingSocial !== null}
                  onClick={() => setIsAppleSheetOpen(true)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#121814] hover:bg-[#1a231c] border border-gray-800 hover:border-[#78FF00]/50 rounded-xl text-xs font-bold text-gray-200 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isAuthenticatingSocial === 'apple' ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.13c.67-.82 1.12-1.96.99-3.13-1 .04-2.18.67-2.88 1.49-.63.73-1.18 1.9-1.03 3.04 1.12.09 2.25-.58 2.92-1.4" />
                    </svg>
                  )}
                  <span>Continuar com a Apple</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="p-3 rounded-xl bg-[#121814] border border-gray-800/80 text-center">
            <p className="text-[11px] text-gray-400">
              Nenhuma conta Google ou Apple vinculada ao aparelho. Opções omitidas da interface.
            </p>
          </div>
        )}

        {/* Simulador rápido de hardware/contas na tela de login */}
        <div className="mt-3 pt-2 border-t border-gray-900/60 flex items-center justify-between text-[10px]">
          <span className="text-gray-500 font-semibold flex items-center gap-1">
            <Smartphone className="w-3 h-3 text-[#78FF00]" />
            Contas no Aparelho:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setDeviceGoogleEnabled(!deviceAuth.hasGoogleAccounts)}
              className={`px-2 py-0.5 rounded-full font-bold transition-all border ${
                deviceAuth.hasGoogleAccounts
                  ? 'bg-blue-950/60 border-blue-800/70 text-blue-400 hover:bg-blue-900/60'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-white'
              }`}
              title="Clique para alternar presença de contas Google no aparelho"
            >
              Google: {deviceAuth.hasGoogleAccounts ? 'Ativo' : 'Omitido'}
            </button>
            <button
              type="button"
              onClick={() => setDeviceAppleEnabled(!deviceAuth.hasAppleAccount)}
              className={`px-2 py-0.5 rounded-full font-bold transition-all border ${
                deviceAuth.hasAppleAccount
                  ? 'bg-zinc-800 border-zinc-600 text-white hover:bg-zinc-700'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-white'
              }`}
              title="Clique para alternar presença de Apple ID no aparelho"
            >
              Apple: {deviceAuth.hasAppleAccount ? 'Ativo' : 'Omitido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

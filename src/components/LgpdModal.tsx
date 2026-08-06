import React from 'react';
import { ShieldCheck, X, FileText, Lock, UserCheck, Trash2, Download } from 'lucide-react';

interface LgpdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptAndClose?: () => void;
}

export const LgpdModal: React.FC<LgpdModalProps> = ({
  isOpen,
  onClose,
  onAcceptAndClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#121814] border border-[#78FF00]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-[#0A0D0B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#78FF00]/10 border border-[#78FF00]/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#78FF00]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Privacidade & LGPD</h3>
              <p className="text-xs text-gray-400">Lei nº 13.709/2018 - Brasil</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-gray-300 leading-relaxed">
          <div className="p-3 bg-[#1A231C] border border-[#78FF00]/20 rounded-xl text-xs text-[#78FF00] flex items-start gap-2">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Sua privacidade é nossa prioridade absoluta. Todos os seus dados de localização, biometria e treinos são mantidos sob sigilo rigoroso.
            </span>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#78FF00]" /> 1. Coleta de Dados Sensíveis de Saúde
            </h4>
            <p className="text-xs text-gray-400">
              Coletamos seu peso, altura, idade e gênero exclusivamente para calcular o IMC, estimativa de gasto calórico e métricas de desempenho físico.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#78FF00]" /> 2. Rastreamento por GPS
            </h4>
            <p className="text-xs text-gray-400">
              O acesso à sua localização ocorre unicamente durante a gravação ativa de corridas, caminhadas ou pedaladas para cálculo de distância e mapa de percurso. O GPS pode ser desativado a qualquer momento nas configurações.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-1 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#78FF00]" /> 3. Seus Direitos (Titular dos Dados)
            </h4>
            <ul className="text-xs text-gray-400 list-disc pl-5 space-y-1">
              <li>Confirmação da existência de tratamento dos seus dados.</li>
              <li>Acesso facilitado e exportação de todo o seu histórico de treinos.</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Revogação do consentimento a qualquer momento sem custos.</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-gray-800 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => alert('Download do relatório de dados iniciado! Todos os seus dados foram empacotados em JSON.')}
                className="flex-1 py-2 px-3 bg-[#1A231C] hover:bg-gray-800 text-xs text-gray-200 border border-gray-700 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#78FF00]" />
                Baixar Meus Dados (JSON)
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-800 bg-[#0A0D0B] flex gap-3">
          {onAcceptAndClose ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm font-semibold transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={onAcceptAndClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#78FF00] hover:bg-[#68e000] text-[#0A0D0B] text-sm font-bold shadow-[0_0_15px_rgba(120,255,0,0.3)] transition-all"
              >
                Aceitar & Concordar
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-[#78FF00] text-[#0A0D0B] font-bold text-sm"
            >
              Ciente dos Termos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

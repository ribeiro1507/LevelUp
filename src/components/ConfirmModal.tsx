import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = 'Confirmar Ação',
  message = 'Deseja realmente cancelar o treino?',
  confirmLabel = 'Sim, cancelar treino',
  cancelLabel = 'Não, continuar',
  isDanger = true,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          className="w-full max-w-sm bg-[#121814] border border-red-500/40 rounded-2xl p-5 shadow-[0_0_30px_rgba(239,68,68,0.25)] text-white space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-white">{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm text-gray-300 font-medium leading-relaxed">
            {message}
          </p>

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl transition-all active:scale-95"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 py-3 px-3 font-extrabold text-xs rounded-xl transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                isDanger
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                  : 'bg-[#78FF00] hover:bg-[#6be600] text-[#0A0D0B]'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>{confirmLabel}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

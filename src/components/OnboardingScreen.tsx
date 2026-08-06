import React, { useState } from 'react';
import { Weight, Ruler, Calendar, ArrowRight, Activity, Flame, ShieldAlert, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../types';

interface OnboardingScreenProps {
  userProfile: UserProfile;
  onComplete: (updatedData: Partial<UserProfile>) => void;
  onBack?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ userProfile, onComplete, onBack }) => {
  const [peso, setPeso] = useState<number>(userProfile.peso || 72);
  const [altura, setAltura] = useState<number>(userProfile.altura || 175);
  const [idade, setIdade] = useState<number>(userProfile.idade || 25);

  // Calculate IMC (BMI = kg / (m^2))
  const alturaMetros = altura / 100;
  const imc = alturaMetros > 0 ? (peso / (alturaMetros * alturaMetros)).toFixed(1) : '0';
  const imcVal = parseFloat(imc);

  let imcStatus = 'Peso Normal';
  let imcColor = 'text-[#78FF00]';

  if (imcVal < 18.5) {
    imcStatus = 'Abaixo do peso';
    imcColor = 'text-yellow-400';
  } else if (imcVal >= 25 && imcVal < 29.9) {
    imcStatus = 'Sobrepeso leve';
    imcColor = 'text-orange-400';
  } else if (imcVal >= 30) {
    imcStatus = 'Obesidade';
    imcColor = 'text-red-400';
  }

  // Calculate estimated daily baseline water and calories
  const aguaRecomendadaMl = Math.round(peso * 35);
  const caloriasBasais = Math.round(10 * peso + 6.25 * altura - 5 * idade + 5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      peso,
      altura,
      idade,
      hasCompletedOnboarding: true,
    });
  };

  return (
    <div className="min-h-full flex flex-col justify-between bg-[#0A0D0B] text-white p-5 sm:p-8 select-none">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="p-2.5 rounded-xl bg-[#121814] border border-gray-800 text-gray-300 hover:text-[#78FF00] hover:border-[#78FF00]/40 transition-all flex items-center gap-1 text-xs font-bold active:scale-95"
              title="Voltar para a tela anterior"
            >
              <ArrowLeft className="w-4 h-4 text-[#78FF00]" />
              <span>Voltar</span>
            </button>
          ) : (
            <div />
          )}

          <span className="text-xs font-bold uppercase tracking-widest text-[#78FF00] px-2.5 py-1 bg-[#78FF00]/10 border border-[#78FF00]/30 rounded-full">
            Etapa 2 de 2
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Medidas & Perfil Físico</h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Olá, <span className="text-[#78FF00] font-bold">{userProfile.nomeCompleto || 'Atleta'}</span>! Informe suas métricas para calibrarmos seus treinos e gasto calórico.
        </p>

        {/* Inputs */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Peso (kg) */}
          <div className="bg-[#121814] border border-gray-800 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <Weight className="w-4 h-4 text-[#78FF00]" /> Peso Corporal
              </label>
              <span className="text-xs text-gray-400">Digite seu peso em kg</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPeso((p) => Math.max(30, Number((p - 0.5).toFixed(1))))}
                className="w-10 h-10 rounded-xl bg-[#1A231C] border border-gray-700 text-white font-extrabold text-lg flex items-center justify-center hover:border-[#78FF00] hover:text-[#78FF00] active:scale-95 shrink-0 transition-colors"
              >
                -
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min={30}
                  max={250}
                  value={peso || ''}
                  onChange={(e) => setPeso(Number(e.target.value))}
                  className="w-full bg-[#1A231C] border border-[#78FF00]/50 focus:border-[#78FF00] focus:ring-1 focus:ring-[#78FF00] rounded-xl py-2 px-3 pr-9 text-center font-black text-xl text-[#78FF00] outline-none"
                  placeholder="72"
                  required
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-gray-400 pointer-events-none">
                  kg
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPeso((p) => Math.min(250, Number((p + 0.5).toFixed(1))))}
                className="w-10 h-10 rounded-xl bg-[#1A231C] border border-gray-700 text-white font-extrabold text-lg flex items-center justify-center hover:border-[#78FF00] hover:text-[#78FF00] active:scale-95 shrink-0 transition-colors"
              >
                +
              </button>
            </div>

            <input
              type="range"
              min={35}
              max={180}
              step={0.5}
              value={peso || 70}
              onChange={(e) => setPeso(Number(e.target.value))}
              className="w-full accent-[#78FF00] bg-gray-800 h-1.5 rounded-lg cursor-pointer mt-3"
            />
          </div>

          {/* Altura (cm) */}
          <div className="bg-[#121814] border border-gray-800 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-[#78FF00]" /> Altura
              </label>
              <span className="text-xs text-gray-400">Digite sua altura em cm</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAltura((a) => Math.max(100, a - 1))}
                className="w-10 h-10 rounded-xl bg-[#1A231C] border border-gray-700 text-white font-extrabold text-lg flex items-center justify-center hover:border-[#78FF00] hover:text-[#78FF00] active:scale-95 shrink-0 transition-colors"
              >
                -
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={100}
                  max={250}
                  value={altura || ''}
                  onChange={(e) => setAltura(Number(e.target.value))}
                  className="w-full bg-[#1A231C] border border-[#78FF00]/50 focus:border-[#78FF00] focus:ring-1 focus:ring-[#78FF00] rounded-xl py-2 px-3 pr-10 text-center font-black text-xl text-[#78FF00] outline-none"
                  placeholder="175"
                  required
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-gray-400 pointer-events-none">
                  cm
                </span>
              </div>
              <button
                type="button"
                onClick={() => setAltura((a) => Math.min(250, a + 1))}
                className="w-10 h-10 rounded-xl bg-[#1A231C] border border-gray-700 text-white font-extrabold text-lg flex items-center justify-center hover:border-[#78FF00] hover:text-[#78FF00] active:scale-95 shrink-0 transition-colors"
              >
                +
              </button>
            </div>

            <input
              type="range"
              min={120}
              max={220}
              step={1}
              value={altura || 170}
              onChange={(e) => setAltura(Number(e.target.value))}
              className="w-full accent-[#78FF00] bg-gray-800 h-1.5 rounded-lg cursor-pointer mt-3"
            />
          </div>

          {/* Idade */}
          <div className="bg-[#121814] border border-gray-800 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#78FF00]" /> Idade
              </label>
              <span className="text-xs text-gray-400">Digite sua idade em anos</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIdade((i) => Math.max(12, i - 1))}
                className="w-10 h-10 rounded-xl bg-[#1A231C] border border-gray-700 text-white font-extrabold text-lg flex items-center justify-center hover:border-[#78FF00] hover:text-[#78FF00] active:scale-95 shrink-0 transition-colors"
              >
                -
              </button>
              <div className="relative flex-1">
                <input
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min={12}
                  max={120}
                  value={idade || ''}
                  onChange={(e) => setIdade(Number(e.target.value))}
                  className="w-full bg-[#1A231C] border border-[#78FF00]/50 focus:border-[#78FF00] focus:ring-1 focus:ring-[#78FF00] rounded-xl py-2 px-3 pr-12 text-center font-black text-xl text-[#78FF00] outline-none"
                  placeholder="25"
                  required
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-gray-400 pointer-events-none">
                  anos
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIdade((i) => Math.min(120, i + 1))}
                className="w-10 h-10 rounded-xl bg-[#1A231C] border border-gray-700 text-white font-extrabold text-lg flex items-center justify-center hover:border-[#78FF00] hover:text-[#78FF00] active:scale-95 shrink-0 transition-colors"
              >
                +
              </button>
            </div>

            <input
              type="range"
              min={12}
              max={90}
              step={1}
              value={idade || 25}
              onChange={(e) => setIdade(Number(e.target.value))}
              className="w-full accent-[#78FF00] bg-gray-800 h-1.5 rounded-lg cursor-pointer mt-3"
            />
          </div>

          {/* Auto Calculated BMI & Health Summary Widget */}
          <div className="p-4 bg-[#161F1A] border border-[#78FF00]/30 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-800">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-200">
                <Activity className="w-4 h-4 text-[#78FF00]" />
                <span>Índice de Massa Corporal (IMC)</span>
              </div>
              <span className={`text-xl font-black ${imcColor}`}>{imc}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Classificação:</span>
              <span className={`font-bold ${imcColor}`}>{imcStatus}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-800/80 text-[11px]">
              <div className="flex items-center gap-1.5 text-gray-300">
                <Flame className="w-3.5 h-3.5 text-[#78FF00]" />
                <span>Metabolismo Basal: <strong className="text-white">{caloriasBasais} kcal</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-300">
                <ShieldAlert className="w-3.5 h-3.5 text-[#78FF00]" />
                <span>Hidratação Ideal: <strong className="text-white">{(aguaRecomendadaMl / 1000).toFixed(1)} L/dia</strong></span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3.5 px-4 bg-[#78FF00] hover:bg-[#6be600] active:scale-[0.99] text-[#0A0D0B] font-extrabold text-sm rounded-xl shadow-[0_0_20px_rgba(120,255,0,0.35)] transition-all flex items-center justify-center gap-2"
          >
            <span>Concluir Cadastro & Entrar</span>
            <ArrowRight className="w-5 h-5 text-[#0A0D0B]" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Calendar, CheckCircle, Flame, Clock, Navigation, Dumbbell, ShieldCheck, ChevronRight, User, Scale, ArrowLeft, Trash2 } from 'lucide-react';
import { UserProfile, WorkoutRecord } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface HomeScreenProps {
  userProfile: UserProfile;
  records: WorkoutRecord[];
  onNavigateToRecord: () => void;
  onNavigateToBuilder: () => void;
  onNavigateToProfile?: () => void;
  onOpenLgpd: () => void;
  onBack?: () => void;
  onDeleteRecord?: (recordId: string) => void;
}

const DIAS_SEMANA_ABR = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const DIAS_SEMANA_FULL = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  records,
  onNavigateToRecord,
  onNavigateToBuilder,
  onNavigateToProfile,
  onOpenLgpd,
  onBack,
  onDeleteRecord,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    // Current day index 0=Mon, ..., 6=Sun
    const d = new Date().getDay();
    return d === 0 ? 6 : d - 1;
  });

  const [recordToDeleteId, setRecordToDeleteId] = useState<string | null>(null);

  // Calculate IMC
  const alturaM = userProfile.altura / 100;
  const imc = alturaM > 0 ? (userProfile.peso / (alturaM * alturaM)).toFixed(1) : '--';

  // Group workouts by day of the week index (0 to 6)
  const workoutsByDay: { [key: number]: WorkoutRecord[] } = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  records.forEach((r) => {
    if (r.diaSemanaIndex >= 0 && r.diaSemanaIndex <= 6) {
      workoutsByDay[r.diaSemanaIndex].push(r);
    }
  });

  // Calculate total weekly stats
  const totalCalorias = records.reduce((acc, r) => acc + (r.caloriasQueimadas || 0), 0);
  const totalMinutos = Math.round(records.reduce((acc, r) => acc + (r.duracaoSegundos || 0), 0) / 60);

  const selectedDayWorkouts = workoutsByDay[selectedDayIndex] || [];

  return (
    <div className="p-4 sm:p-6 space-y-4 pb-24 text-white select-none">
      {/* Top Header Bar with Back Button */}
      <div className="flex items-center justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="p-2.5 rounded-xl bg-[#121814] border border-gray-800 text-gray-300 hover:text-[#78FF00] hover:border-[#78FF00]/40 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
            title="Voltar para a tela anterior"
          >
            <ArrowLeft className="w-4 h-4 text-[#78FF00]" />
            <span>Voltar</span>
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#78FF00] bg-[#78FF00]/10 px-3 py-1 rounded-full border border-[#78FF00]/20">
          <span>LevelUp Fit</span>
        </div>
      </div>

      {/* User Header Profile Bar */}
      <div className="flex items-center justify-between bg-[#121814] border border-[#78FF00]/20 p-4 rounded-2xl shadow-lg">
        <button
          onClick={onNavigateToProfile}
          className="flex items-center gap-3 text-left hover:opacity-90 transition-opacity"
        >
          <div className="w-12 h-12 rounded-2xl bg-[#78FF00]/10 border border-[#78FF00] flex items-center justify-center font-black text-[#78FF00] text-lg shadow-[0_0_15px_rgba(120,255,0,0.3)] overflow-hidden">
            {userProfile.fotoPerfil ? (
              <img
                src={userProfile.fotoPerfil}
                alt="Foto de Perfil"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              userProfile.nomeCompleto ? userProfile.nomeCompleto.charAt(0).toUpperCase() : 'A'
            )}
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white flex items-center gap-1.5">
              <span>{userProfile.nomeCompleto || 'Atleta LevelUp'}</span>
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span>{userProfile.peso}kg</span> • <span>{userProfile.altura}cm</span> • <span>IMC: <strong className="text-[#78FF00]">{imc}</strong></span>
            </div>
          </div>
        </button>

        <button
          onClick={onOpenLgpd}
          className="p-2 rounded-xl bg-[#1A231C] border border-gray-800 text-[#78FF00] hover:bg-gray-800 transition-colors flex items-center gap-1 text-[11px] font-semibold"
          title="Ver LGPD e Privacidade"
        >
          <ShieldCheck className="w-4 h-4 text-[#78FF00]" />
          <span className="hidden sm:inline">LGPD</span>
        </button>
      </div>

      {/* Days of the Week Trained Tracker Widget */}
      <div className="bg-[#121814] border border-gray-800 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#78FF00]">
            <Calendar className="w-4 h-4" />
            <span>Frequência da Semana</span>
          </div>
          <span className="text-[11px] text-gray-400">
            <strong className="text-white">{Object.values(workoutsByDay).filter((w) => w.length > 0).length}</strong> de 7 dias treinados
          </span>
        </div>

        {/* Days Pill Buttons */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {DIAS_SEMANA_ABR.map((dia, idx) => {
            const hasWorkout = workoutsByDay[idx] && workoutsByDay[idx].length > 0;
            const isSelected = selectedDayIndex === idx;

            return (
              <button
                key={dia}
                onClick={() => setSelectedDayIndex(idx)}
                className={`relative flex flex-col items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#78FF00] text-[#0A0D0B] shadow-[0_0_15px_rgba(120,255,0,0.4)] scale-105 z-10'
                    : hasWorkout
                    ? 'bg-[#1F2E22] text-[#78FF00] border border-[#78FF00]/40'
                    : 'bg-[#1A231C] text-gray-500 border border-gray-800'
                }`}
              >
                <span>{dia}</span>
                {hasWorkout ? (
                  <CheckCircle className={`w-3.5 h-3.5 mt-1 ${isSelected ? 'text-[#0A0D0B]' : 'text-[#78FF00]'}`} />
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full mt-2 ${isSelected ? 'bg-[#0A0D0B]' : 'bg-gray-700'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Workout Details */}
        <div className="pt-2 border-t border-gray-800/80">
          <div className="text-xs font-bold text-gray-300 mb-2">
            Treinos em <span className="text-[#78FF00]">{DIAS_SEMANA_FULL[selectedDayIndex]}</span>:
          </div>

          {selectedDayWorkouts.length > 0 ? (
            <div className="space-y-2">
              {selectedDayWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-[#1A231C] border border-[#78FF00]/20 p-3 rounded-xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#78FF00]/10 text-[#78FF00]">
                      {workout.tipo === 'gps' ? <Navigation className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{workout.tituloTreino}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                        <span>{Math.round(workout.duracaoSegundos / 60)} min</span>
                        <span>•</span>
                        <span>{workout.caloriasQueimadas} kcal</span>
                        {workout.distanciaKm && (
                          <>
                            <span>•</span>
                            <span className="text-[#78FF00] font-semibold">{workout.distanciaKm} km</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#78FF00]/20 text-[#78FF00] font-bold px-2 py-1 rounded-full uppercase">
                    Concluído
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-[#1A231C]/60 border border-dashed border-gray-800 rounded-xl text-center text-xs text-gray-500">
              Nenhum treino registrado nesta {DIAS_SEMANA_FULL[selectedDayIndex].toLowerCase()}.
            </div>
          )}
        </div>
      </div>

      {/* Weekly Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#121814] border border-gray-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Gasto Semanal</span>
            <p className="text-lg font-black text-white">{totalCalorias} <span className="text-xs font-normal text-gray-400">kcal</span></p>
          </div>
        </div>

        <div className="bg-[#121814] border border-gray-800 p-4 rounded-2xl flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#78FF00]/10 text-[#78FF00] border border-[#78FF00]/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400">Tempo Ativo</span>
            <p className="text-lg font-black text-white">{totalMinutos} <span className="text-xs font-normal text-gray-400">min</span></p>
          </div>
        </div>
      </div>

      {/* Quick Launch Action Cards */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ações Rápidas</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onNavigateToRecord}
            className="p-4 bg-[#121814] hover:bg-[#1a231c] border border-gray-800 hover:border-[#78FF00] rounded-2xl text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#78FF00]/10 text-[#78FF00] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Navigation className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-[#78FF00]">Gravar GPS</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Correr, caminhar ou pedalar</p>
          </button>

          <button
            onClick={onNavigateToBuilder}
            className="p-4 bg-[#121814] hover:bg-[#1a231c] border border-gray-800 hover:border-[#78FF00] rounded-2xl text-left transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#78FF00]/10 text-[#78FF00] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-[#78FF00]">Meus Treinos</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Montar, editar e iniciar</p>
          </button>
        </div>
      </div>

      {/* Historic Log List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
          <span>Histórico Recente</span>
          <span className="text-[10px] text-[#78FF00] font-normal">{records.length} treinos no total</span>
        </h3>

        <div className="space-y-2">
          {records.slice(0, 10).map((r) => (
            <div
              key={r.id}
              className="p-3.5 bg-[#121814] border border-gray-800/80 rounded-2xl flex items-center justify-between hover:border-[#78FF00]/30 transition-colors gap-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#1A231C] border border-[#78FF00]/30 flex items-center justify-center text-[#78FF00] shrink-0">
                  {r.tipo === 'gps' ? <Navigation className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{r.tituloTreino}</h4>
                  <p className="text-[11px] text-gray-400 truncate">
                    {r.diaSemanaNome} • {Math.round(r.duracaoSegundos / 60)} min • {r.caloriasQueimadas} kcal
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {r.distanciaKm && (
                  <span className="text-xs font-extrabold text-[#78FF00] bg-[#78FF00]/10 px-2 py-0.5 rounded-full">
                    {r.distanciaKm} km
                  </span>
                )}
                {onDeleteRecord && (
                  <button
                    type="button"
                    onClick={() => setRecordToDeleteId(r.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/30 transition-colors"
                    title="Deletar registro de treino"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!recordToDeleteId}
        title="Excluir Treino"
        message="Deseja realmente cancelar e apagar este treino do seu histórico?"
        confirmLabel="Sim, apagar treino"
        cancelLabel="Não, manter"
        onConfirm={() => {
          if (recordToDeleteId && onDeleteRecord) {
            onDeleteRecord(recordToDeleteId);
          }
          setRecordToDeleteId(null);
        }}
        onCancel={() => setRecordToDeleteId(null)}
      />
    </div>
  );
};

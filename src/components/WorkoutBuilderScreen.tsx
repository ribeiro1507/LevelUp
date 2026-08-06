import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Dumbbell, Play, CheckCircle2, Clock, ShieldCheck, ChevronRight, Save, X, RotateCcw, ArrowLeft, AlertTriangle } from 'lucide-react';
import { WorkoutRoutine, Exercise, WorkoutRecord } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface WorkoutBuilderScreenProps {
  routines: WorkoutRoutine[];
  onSaveRoutines: (updatedRoutines: WorkoutRoutine[]) => void;
  onFinishWorkout: (record: WorkoutRecord) => void;
  onBack?: () => void;
}

export const WorkoutBuilderScreen: React.FC<WorkoutBuilderScreenProps> = ({
  routines,
  onSaveRoutines,
  onFinishWorkout,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'escolher' | 'montar'>('escolher');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(routines[0]?.id || '');
  const [executingRoutine, setExecutingRoutine] = useState<WorkoutRoutine | null>(null);
  const [completedExercises, setCompletedExercises] = useState<{ [key: string]: boolean }>({});
  const [executionSeconds, setExecutionSeconds] = useState<number>(0);
  const [executionTimerActive, setExecutionTimerActive] = useState<boolean>(false);
  
  // Track time per exercise
  const [exerciseMetrics, setExerciseMetrics] = useState<Record<string, { tempoSegundos: number; calorias: number }>>({});
  const [lastActionTime, setLastActionTime] = useState<number>(0);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Form states for creating/editing routine
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Hipertrofia');
  const [formDescription, setFormDescription] = useState('');
  const [formExercises, setFormExercises] = useState<Exercise[]>([]);

  // Form state for adding an exercise
  const [exName, setExName] = useState('');
  const [exMuscle, setExMuscle] = useState('Geral');
  const [exSets, setExSets] = useState(4);
  const [exReps, setExReps] = useState(10);
  const [exWeight, setExWeight] = useState(20);

  // Timer effect when executing routine
  React.useEffect(() => {
    let timer: any = null;
    if (executionTimerActive) {
      timer = setInterval(() => {
        setExecutionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [executionTimerActive]);

  // Open modal / section to create or edit routine
  const handleStartCreateNew = () => {
    setEditingRoutineId('NEW');
    setFormTitle('');
    setFormCategory('Hipertrofia');
    setFormDescription('');
    setFormExercises([
      { id: `ex-${Date.now()}-1`, nome: 'Supino Reto', grupoMuscular: 'Peito', series: 4, repeticoes: 10, cargaKg: 50 },
    ]);
    setActiveTab('montar');
  };

  const handleStartEdit = (routine: WorkoutRoutine) => {
    setEditingRoutineId(routine.id);
    setFormTitle(routine.titulo);
    setFormCategory(routine.categoria);
    setFormDescription(routine.descricao || '');
    setFormExercises([...routine.exercicios]);
    setActiveTab('montar');
  };

  const handleDeleteRoutine = (routineId: string) => {
    const routineObj = routines.find((r) => r.id === routineId);
    const routineName = routineObj ? `"${routineObj.titulo}"` : 'este treino';

    setConfirmModal({
      isOpen: true,
      title: 'Excluir Treino',
      message: `Deseja realmente cancelar e apagar ${routineName}?`,
      onConfirm: () => {
        const updated = routines.filter((r) => r.id !== routineId);
        onSaveRoutines(updated);
        if (selectedRoutineId === routineId && updated.length > 0) {
          setSelectedRoutineId(updated[0].id);
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handlePromptCancelExecution = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Cancelar Treino',
      message: 'Deseja realmente cancelar o treino em andamento?',
      onConfirm: () => {
        setExecutionTimerActive(false);
        setExecutingRoutine(null);
        setExecutionSeconds(0);
        setCompletedExercises({});
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleAddExerciseToForm = () => {
    if (!exName.trim()) return;
    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      nome: exName,
      grupoMuscular: exMuscle,
      series: exSets,
      repeticoes: exReps,
      cargaKg: exWeight,
    };
    setFormExercises([...formExercises, newEx]);
    setExName('');
  };

  const handleRemoveExerciseFromForm = (exId: string) => {
    setFormExercises(formExercises.filter((e) => e.id !== exId));
  };

  const handleSaveRoutineForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingRoutineId === 'NEW') {
      const newRoutine: WorkoutRoutine = {
        id: `w-${Date.now()}`,
        titulo: formTitle,
        categoria: formCategory,
        descricao: formDescription,
        duracaoEstimadaMin: Math.max(30, formExercises.length * 10),
        exercicios: formExercises,
        criadoPeloUsuario: true,
      };
      onSaveRoutines([...routines, newRoutine]);
      setSelectedRoutineId(newRoutine.id);
    } else if (editingRoutineId) {
      const updated = routines.map((r) =>
        r.id === editingRoutineId
          ? {
              ...r,
              titulo: formTitle,
              categoria: formCategory,
              descricao: formDescription,
              exercicios: formExercises,
            }
          : r
      );
      onSaveRoutines(updated);
    }

    setEditingRoutineId(null);
    setActiveTab('escolher');
  };

  // Start executing selected routine
  const handleStartWorkoutExecution = (routine: WorkoutRoutine) => {
    setExecutingRoutine(routine);
    setCompletedExercises({});
    setExerciseMetrics({});
    setLastActionTime(0);
    setExecutionSeconds(0);
    setExecutionTimerActive(true);
  };

  const handleToggleExerciseCheck = (exId: string) => {
    setCompletedExercises((prev) => {
      const isNowChecked = !prev[exId];
      
      if (isNowChecked) {
        // Calculate time spent since last action
        const timeSpent = executionSeconds - lastActionTime;
        const cals = Math.round((timeSpent / 60) * 7.5); // 7.5 kcal/min avg
        
        setExerciseMetrics((m) => ({
          ...m,
          [exId]: { tempoSegundos: timeSpent, calorias: cals }
        }));
        setLastActionTime(executionSeconds);
      } else {
        // Remove metrics if unchecked
        setExerciseMetrics((m) => {
          const newM = { ...m };
          delete newM[exId];
          return newM;
        });
      }

      return {
        ...prev,
        [exId]: isNowChecked,
      };
    });
  };

  const handleFinishRoutineExecution = () => {
    if (!executingRoutine) return;

    setExecutionTimerActive(false);

    const now = new Date();
    const dayOfWeekIdx = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const diasNome = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

    const completedExs = executingRoutine.exercicios.filter(e => completedExercises[e.id]);
    
    // Total time is just executionSeconds
    let secondsWorked = executionSeconds;
    const minutesWorked = Math.max(1, Math.round(secondsWorked / 60));
    
    let totalCaloriesBurned = 0;
    
    const detalhes = completedExs.map((e) => {
      const metric = exerciseMetrics[e.id] || { tempoSegundos: 0, calorias: 0 };
      totalCaloriesBurned += metric.calorias;
      return {
        nome: e.nome,
        info: `${e.series}x${e.repeticoes}`,
        tempoSegundos: metric.tempoSegundos,
        calorias: metric.calorias
      };
    });

    // If no calories were tracked (e.g. they didn't check any or checked them instantly), fallback to general time
    if (totalCaloriesBurned === 0) {
      totalCaloriesBurned = Math.round(minutesWorked * 7.5);
    }

    const newRecord: WorkoutRecord = {
      id: `rec-routine-${Date.now()}`,
      data: now.toISOString().split('T')[0],
      diaSemanaIndex: dayOfWeekIdx,
      diaSemanaNome: diasNome[dayOfWeekIdx],
      tipo: 'rotina',
      tituloTreino: executingRoutine.titulo,
      duracaoSegundos: secondsWorked,
      caloriasQueimadas: totalCaloriesBurned,
      detalhesExercicios: detalhes.length > 0 ? detalhes : executingRoutine.exercicios.map((e) => ({
        nome: e.nome,
        info: `${e.series}x${e.repeticoes}`,
        tempoSegundos: Math.round(secondsWorked / executingRoutine.exercicios.length),
        calorias: Math.round(totalCaloriesBurned / executingRoutine.exercicios.length)
      })),
    };

    setExecutingRoutine(null);
    setExecutionSeconds(0);
    onFinishWorkout(newRecord);
  };

  const selectedRoutine = routines.find((r) => r.id === selectedRoutineId) || routines[0];

  // If active execution screen is open
  if (executingRoutine) {
    const mins = Math.floor(executionSeconds / 60);
    const secs = executionSeconds % 60;
    const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return (
      <div className="p-4 sm:p-6 space-y-4 pb-24 text-white select-none">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            type="button"
            onClick={handlePromptCancelExecution}
            className="p-2.5 rounded-xl bg-[#121814] border border-gray-800 text-gray-300 hover:text-[#78FF00] hover:border-[#78FF00]/40 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
            title="Sair / Voltar"
          >
            <ArrowLeft className="w-4 h-4 text-[#78FF00]" />
            <span>Voltar</span>
          </button>

          <button
            type="button"
            onClick={handlePromptCancelExecution}
            className="py-2.5 px-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95"
            title="Cancelar o treino em andamento"
          >
            <Trash2 className="w-4 h-4" />
            <span>Cancelar Treino</span>
          </button>
        </div>

        <div className="p-4 bg-[#121814] border border-[#78FF00]/40 rounded-2xl flex items-center justify-between shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#78FF00] tracking-wider">Treino em Andamento</span>
            <h2 className="text-xl font-extrabold text-white">{executingRoutine.titulo}</h2>
          </div>
          <div className="flex items-center gap-2 bg-[#1A231C] px-3 py-1.5 rounded-xl border border-[#78FF00]/30 font-mono text-lg font-black text-[#78FF00]">
            <Clock className="w-4 h-4 text-[#78FF00]" />
            <span>{formattedTime}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Marque as séries concluídas:</h3>

          <div className="space-y-2">
            {executingRoutine.exercicios.map((ex, idx) => {
              const isChecked = !!completedExercises[ex.id];
              return (
                <div
                  key={ex.id}
                  onClick={() => handleToggleExerciseCheck(ex.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-[#122216] border-[#78FF00] text-white'
                      : 'bg-[#121814] border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isChecked ? 'bg-[#78FF00] text-[#0A0D0B]' : 'bg-[#1A231C] text-gray-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${isChecked ? 'line-through text-gray-400' : 'text-white'}`}>
                        {ex.nome}
                      </h4>
                      <p className="text-xs text-gray-400">
                        {ex.series} séries x {ex.repeticoes} reps {ex.cargaKg ? `• ${ex.cargaKg} kg` : ''}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-[#78FF00] border-[#78FF00]' : 'border-gray-700 bg-[#1A231C]'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-5 h-5 text-[#0A0D0B]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleFinishRoutineExecution}
          className="w-full mt-4 py-4 px-4 bg-[#78FF00] hover:bg-[#6be600] active:scale-[0.99] text-[#0A0D0B] font-extrabold text-base rounded-2xl shadow-[0_0_25px_rgba(120,255,0,0.4)] transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-6 h-6 text-[#0A0D0B]" />
          <span>FINALIZAR TREINO</span>
        </button>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          confirmLabel="Sim, cancelar treino"
          cancelLabel="Continuar treino"
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        />
      </div>
    );
  }

  const handleHeaderBackClick = () => {
    if (activeTab === 'montar') {
      setActiveTab('escolher');
    } else if (onBack) {
      onBack();
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 pb-24 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {(onBack || activeTab === 'montar') && (
            <button
              type="button"
              onClick={handleHeaderBackClick}
              className="p-2.5 rounded-xl bg-[#121814] border border-gray-800 text-gray-300 hover:text-[#78FF00] hover:border-[#78FF00]/40 transition-all flex items-center gap-1 text-xs font-bold shrink-0 active:scale-95"
              title="Voltar para a tela anterior"
            >
              <ArrowLeft className="w-4 h-4 text-[#78FF00]" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Dumbbell className="w-6 h-6 text-[#78FF00]" />
              <span>Treinos & Rotinas</span>
            </h2>
            <p className="text-xs text-gray-400">Monte, edite e escolha qual treino realizar hoje.</p>
          </div>
        </div>

        <button
          onClick={handleStartCreateNew}
          className="py-2 px-3 bg-[#78FF00] hover:bg-[#6be600] text-[#0A0D0B] font-bold text-xs rounded-xl flex items-center gap-1 shadow-[0_0_12px_rgba(120,255,0,0.3)] transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Treino</span>
        </button>
      </div>

      {/* Sub-Nav Toggle: Escolher Treino / Montar & Editar */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#121814] border border-gray-800 rounded-2xl">
        <button
          onClick={() => setActiveTab('escolher')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'escolher'
              ? 'bg-[#78FF00] text-[#0A0D0B] shadow-[0_0_12px_rgba(120,255,0,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Escolher Treino
        </button>
        <button
          onClick={() => setActiveTab('montar')}
          className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'montar'
              ? 'bg-[#78FF00] text-[#0A0D0B] shadow-[0_0_12px_rgba(120,255,0,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {editingRoutineId ? 'Editar Treino' : 'Gerenciar Treinos'}
        </button>
      </div>

      {/* VIEW 1: ESCOLHER TREINO */}
      {activeTab === 'escolher' && (
        <div className="space-y-4">
          {/* Dropdown / Selector for Routine */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1.5">Selecione o Treino:</label>
            <select
              value={selectedRoutineId}
              onChange={(e) => setSelectedRoutineId(e.target.value)}
              className="w-full bg-[#121814] border border-gray-800 focus:border-[#78FF00] rounded-2xl py-3 px-4 text-sm text-white outline-none font-bold"
            >
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.titulo} ({r.exercicios.length} exercícios)
                </option>
              ))}
            </select>
          </div>

          {/* Routine Detail Card */}
          {selectedRoutine && (
            <div className="bg-[#121814] border border-[#78FF00]/30 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#78FF00] bg-[#78FF00]/10 px-2.5 py-1 rounded-full border border-[#78FF00]/30">
                    {selectedRoutine.categoria}
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-2">{selectedRoutine.titulo}</h3>
                  <p className="text-xs text-gray-400 mt-1">{selectedRoutine.descricao}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleStartEdit(selectedRoutine)}
                    className="p-2 bg-[#1A231C] text-[#78FF00] hover:bg-gray-800 rounded-xl border border-gray-800"
                    title="Editar treino"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRoutine(selectedRoutine.id)}
                    className="p-2 bg-[#1A231C] text-red-400 hover:bg-gray-800 rounded-xl border border-gray-800"
                    title="Excluir treino"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-2 pt-2 border-t border-gray-800">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Exercícios Inclusos:</h4>
                <div className="space-y-2">
                  {selectedRoutine.exercicios.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="p-3 bg-[#1A231C] border border-gray-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-black text-[#78FF00] w-5">{idx + 1}.</span>
                        <div>
                          <h5 className="text-xs font-bold text-white">{ex.nome}</h5>
                          <span className="text-[10px] text-gray-400">{ex.grupoMuscular}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs font-semibold text-gray-200">
                        {ex.series}x{ex.repeticoes} {ex.cargaKg ? `(${ex.cargaKg}kg)` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Start Execution */}
              <div className="space-y-2 mt-4">
                <button
                  type="button"
                  onClick={() => handleStartWorkoutExecution(selectedRoutine)}
                  className="w-full py-4 px-4 bg-[#78FF00] hover:bg-[#6be600] active:scale-[0.99] text-[#0A0D0B] font-extrabold text-base rounded-xl shadow-[0_0_20px_rgba(120,255,0,0.35)] transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>INICIAR TREINO</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: MONTAR E EDITAR TREINOS */}
      {activeTab === 'montar' && (
        <div className="space-y-4">
          {/* List of existing routines with edit / delete controls */}
          <div className="bg-[#121814] border border-gray-800 p-4 rounded-2xl space-y-3">
            <h3 className="text-xs font-bold text-[#78FF00] uppercase tracking-wider flex items-center justify-between">
              <span>Seus Treinos Cadastrados ({routines.length})</span>
              <button
                type="button"
                onClick={handleStartCreateNew}
                className="text-[11px] font-bold text-[#78FF00] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Criar Novo
              </button>
            </h3>

            <div className="space-y-2">
              {routines.map((r) => (
                <div
                  key={r.id}
                  className="p-3 bg-[#1A231C] border border-gray-800 rounded-xl flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{r.titulo}</h4>
                    <span className="text-[10px] text-gray-400 block">{r.categoria} • {r.exercicios.length} exercícios</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(r)}
                      className="p-1.5 bg-[#121814] hover:bg-gray-800 text-[#78FF00] rounded-lg border border-gray-700 text-xs font-semibold flex items-center gap-1"
                      title="Editar este treino"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRoutine(r.id)}
                      className="p-1.5 bg-[#121814] hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 text-xs font-semibold flex items-center gap-1"
                      title="Deletar este treino"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Deletar</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveRoutineForm} className="bg-[#121814] border border-gray-800 p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#78FF00] uppercase tracking-wider">
              {editingRoutineId === 'NEW' ? 'Criar Novo Treino' : 'Editar Treino Existente'}
            </h3>

            {/* Titulo */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Nome do Treino</label>
              <input
                type="text"
                required
                placeholder="Ex: Treino de Peito & Ombro"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full bg-[#1A231C] border border-gray-800 focus:border-[#78FF00] rounded-xl py-2.5 px-3.5 text-sm text-white outline-none"
              />
            </div>

            {/* Categoria & Descricao */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Categoria</label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-[#1A231C] border border-gray-800 focus:border-[#78FF00] rounded-xl py-2 px-3 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Descrição Breve</label>
                <input
                  type="text"
                  placeholder="Ex: Foco em hipertrofia"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-[#1A231C] border border-gray-800 focus:border-[#78FF00] rounded-xl py-2 px-3 text-xs text-white outline-none"
                />
              </div>
            </div>

            {/* Add Exercise Box */}
            <div className="p-3 bg-[#1A231C] border border-gray-800 rounded-xl space-y-2">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-[#78FF00]" /> Adicionar Exercício
              </span>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Nome do Exercício"
                  value={exName}
                  onChange={(e) => setExName(e.target.value)}
                  className="bg-[#121814] border border-gray-700 rounded-lg py-1.5 px-2 text-xs text-white outline-none"
                />
                <input
                  type="text"
                  placeholder="Grupo Muscular"
                  value={exMuscle}
                  onChange={(e) => setExMuscle(e.target.value)}
                  className="bg-[#121814] border border-gray-700 rounded-lg py-1.5 px-2 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400">Séries:</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={exSets}
                    onChange={(e) => setExSets(Number(e.target.value))}
                    className="w-full bg-[#121814] border border-gray-700 rounded-lg py-1 px-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">Reps:</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={exReps}
                    onChange={(e) => setExReps(Number(e.target.value))}
                    className="w-full bg-[#121814] border border-gray-700 rounded-lg py-1 px-2 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400">Carga (kg):</span>
                  <input
                    type="number"
                    min={0}
                    max={500}
                    value={exWeight}
                    onChange={(e) => setExWeight(Number(e.target.value))}
                    className="w-full bg-[#121814] border border-gray-700 rounded-lg py-1 px-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddExerciseToForm}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-[#78FF00] font-bold text-xs rounded-lg border border-gray-700 transition-colors"
              >
                + Incluir Exercício
              </button>
            </div>

            {/* Current Form Exercises List */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-400">Exercícios da Lista ({formExercises.length}):</label>
              {formExercises.map((e) => (
                <div
                  key={e.id}
                  className="p-2.5 bg-[#1A231C] border border-gray-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white">{e.nome}</span>
                    <span className="text-gray-400 text-[11px] block">{e.series}x{e.repeticoes} • {e.cargaKg || 0}kg</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExerciseFromForm(e.id)}
                    className="p-1.5 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingRoutineId(null);
                  setActiveTab('escolher');
                }}
                className="flex-1 py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 bg-[#78FF00] hover:bg-[#6be600] text-[#0A0D0B] font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(120,255,0,0.3)]"
              >
                Salvar Treino
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Sim, apagar treino"
        cancelLabel="Não, cancelar"
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

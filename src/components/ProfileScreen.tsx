import React, { useState, useRef } from 'react';
import {
  Camera,
  User,
  Mail,
  ShieldCheck,
  Scale,
  Ruler,
  Calendar,
  Edit3,
  Trash2,
  Check,
  Lock,
  LogOut,
  UserX,
  AlertTriangle,
  ArrowLeft,
} from 'lucide-react';
import { UserProfile, WorkoutRecord, Gender } from '../types';

interface ProfileScreenProps {
  userProfile: UserProfile;
  records: WorkoutRecord[];
  onUpdateProfile: (updatedData: Partial<UserProfile>) => void;
  onOpenLgpd: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onBack?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  records,
  onUpdateProfile,
  onOpenLgpd,
  onLogout,
  onDeleteAccount,
  onBack,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form edit states
  const [nome, setNome] = useState<string>(userProfile.nomeCompleto);
  const [email, setEmail] = useState<string>(userProfile.email);
  const [genero, setGenero] = useState<Gender>(userProfile.genero || 'masculino');
  const [peso, setPeso] = useState<number>(userProfile.peso || 70);
  const [altura, setAltura] = useState<number>(userProfile.altura || 170);
  const [idade, setIdade] = useState<number>(userProfile.idade || 25);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Calculate IMC
  const alturaM = (userProfile.altura || 170) / 100;
  const imc = alturaM > 0 ? ((userProfile.peso || 70) / (alturaM * alturaM)).toFixed(1) : '--';
  const imcVal = parseFloat(imc);

  let imcStatus = 'Peso Saudável';
  let imcColor = 'text-[#78FF00]';
  if (!isNaN(imcVal)) {
    if (imcVal < 18.5) {
      imcStatus = 'Abaixo do peso';
      imcColor = 'text-yellow-400';
    } else if (imcVal >= 25 && imcVal < 30) {
      imcStatus = 'Sobrepeso';
      imcColor = 'text-orange-400';
    } else if (imcVal >= 30) {
      imcStatus = 'Obesidade';
      imcColor = 'text-red-400';
    }
  }

  // Handle Photo File Select & Conversion to Base64
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma imagem de até 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        onUpdateProfile({ fotoPerfil: dataUrl });
        showSuccess('Foto de perfil atualizada com sucesso!');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    if (confirm('Deseja remover sua foto de perfil?')) {
      onUpdateProfile({ fotoPerfil: undefined });
      showSuccess('Foto de perfil removida.');
    }
  };

  const handleSaveProfileData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, informe seu nome.');
      return;
    }

    onUpdateProfile({
      nomeCompleto: nome.trim(),
      email: email.trim(),
      genero,
      peso: Number(peso),
      altura: Number(altura),
      idade: Number(idade),
    });

    setIsEditing(false);
    showSuccess('Dados do perfil atualizados com sucesso!');
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24 text-white select-none relative">
      {/* Hidden File Input for Avatar Photo */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Confirmation Modal for Deleting Account */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#121814] border-2 border-red-500/80 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mx-auto text-red-500">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Deletar a Conta?</h3>
              <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                Tem certeza que deseja deletar a conta? Todos os seus dados, histórico de treinos e estatísticas serão permanentemente excluídos.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Option Não -> Return to Profile Screen */}
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="py-2.5 px-4 bg-[#1A231C] border border-gray-700 text-white font-bold text-xs rounded-xl hover:bg-gray-800 transition-all active:scale-95"
              >
                Não
              </button>

              {/* Option Sim -> Confirm Account Deletion */}
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  onDeleteAccount();
                }}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Deletar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Header with Back Arrow */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {(onBack || isEditing) && (
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                } else if (onBack) {
                  onBack();
                }
              }}
              className="p-2.5 rounded-xl bg-[#121814] border border-gray-800 text-gray-300 hover:text-[#78FF00] hover:border-[#78FF00]/40 transition-all flex items-center gap-1 text-xs font-bold shrink-0 active:scale-95"
              title="Voltar para a tela anterior"
            >
              <ArrowLeft className="w-4 h-4 text-[#78FF00]" />
              <span className="hidden sm:inline">Voltar</span>
            </button>
          )}

          <h1 className="text-xl font-black text-white italic tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-[#78FF00]" />
            <span>MEU PERFIL</span>
          </h1>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A231C] border border-[#78FF00]/40 text-[#78FF00] hover:bg-[#78FF00] hover:text-black font-bold text-xs transition-all"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancelar' : 'Editar'}</span>
        </button>
      </div>

      {/* Alert Banner for Success */}
      {successMessage && (
        <div className="p-3 bg-[#78FF00]/10 border border-[#78FF00] rounded-xl text-xs text-[#78FF00] font-bold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#78FF00]" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Main Avatar & Hero Section */}
      <div className="bg-[#121814] border border-[#78FF00]/30 p-5 rounded-2xl shadow-xl flex flex-col items-center justify-center relative overflow-hidden text-center">
        {/* Glow backdrop effect */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#78FF00]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Avatar Container with Camera Overlay */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#1A231C] border-2 border-[#78FF00] shadow-[0_0_25px_rgba(120,255,0,0.35)] overflow-hidden flex items-center justify-center text-[#78FF00]">
            {userProfile.fotoPerfil ? (
              <img
                src={userProfile.fotoPerfil}
                alt="Foto de Perfil"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-3xl font-black italic">
                {userProfile.nomeCompleto ? userProfile.nomeCompleto.charAt(0).toUpperCase() : 'A'}
              </span>
            )}
          </div>

          {/* Camera Trigger Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#78FF00] text-black hover:scale-110 active:scale-95 shadow-lg border-2 border-[#0A0D0B] transition-transform flex items-center justify-center"
            title="Trocar Foto de Perfil"
          >
            <Camera className="w-4 h-4 font-bold" />
          </button>
        </div>

        {/* User Name & Email */}
        <h2 className="text-lg font-black text-white tracking-tight">
          {userProfile.nomeCompleto || 'Atleta LevelUp'}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 justify-center">
          <Mail className="w-3 h-3 text-[#78FF00]" />
          <span>{userProfile.email || 'atleta@levelup.app'}</span>
        </p>

        {/* Photo Actions Pills */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 rounded-full bg-[#1A231C] border border-[#78FF00]/30 text-[#78FF00] text-[11px] font-bold hover:bg-[#78FF00]/20 transition-all flex items-center gap-1"
          >
            <Camera className="w-3 h-3" />
            <span>{userProfile.fotoPerfil ? 'Alterar Foto' : 'Adicionar Foto'}</span>
          </button>

          {userProfile.fotoPerfil && (
            <button
              onClick={handleRemovePhoto}
              className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-bold hover:bg-red-500/20 transition-all flex items-center gap-1"
              title="Remover Foto"
            >
              <Trash2 className="w-3 h-3" />
              <span>Remover</span>
            </button>
          )}
        </div>
      </div>

      {/* Edit Form Modal/Drawer */}
      {isEditing ? (
        <form onSubmit={handleSaveProfileData} className="bg-[#121814] border border-[#78FF00] p-4 sm:p-5 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <h3 className="text-sm font-extrabold text-[#78FF00] uppercase tracking-wider flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              <span>Editar Informações Pessoais</span>
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full px-3 py-2 bg-[#1A231C] border border-gray-700 focus:border-[#78FF00] rounded-xl text-xs text-white outline-none"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#1A231C] border border-gray-700 focus:border-[#78FF00] rounded-xl text-xs text-white outline-none"
                placeholder="seu.email@exemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                  Gênero
                </label>
                <select
                  value={genero}
                  onChange={(e) => setGenero(e.target.value as Gender)}
                  className="w-full px-3 py-2 bg-[#1A231C] border border-gray-700 focus:border-[#78FF00] rounded-xl text-xs text-white outline-none"
                >
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                  Idade (Anos)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={idade || ''}
                    onChange={(e) => setIdade(Number(e.target.value))}
                    min={12}
                    max={120}
                    className="w-full px-3 py-2 bg-[#1A231C] border border-gray-700 focus:border-[#78FF00] rounded-xl text-xs text-white outline-none pr-12 font-bold"
                    placeholder="25"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[11px] font-bold text-gray-400 pointer-events-none">
                    anos
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                  Peso (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    value={peso || ''}
                    onChange={(e) => setPeso(Number(e.target.value))}
                    min={30}
                    max={300}
                    className="w-full px-3 py-2 bg-[#1A231C] border border-gray-700 focus:border-[#78FF00] rounded-xl text-xs text-white outline-none pr-8 font-bold"
                    placeholder="70.0"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[11px] font-bold text-gray-400 pointer-events-none">
                    kg
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">
                  Altura (cm)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={altura || ''}
                    onChange={(e) => setAltura(Number(e.target.value))}
                    min={100}
                    max={250}
                    className="w-full px-3 py-2 bg-[#1A231C] border border-gray-700 focus:border-[#78FF00] rounded-xl text-xs text-white outline-none pr-9 font-bold"
                    placeholder="175"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[11px] font-bold text-gray-400 pointer-events-none">
                    cm
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#78FF00] text-black font-extrabold text-xs rounded-xl hover:bg-[#68e000] active:scale-95 transition-all shadow-[0_0_15px_rgba(120,255,0,0.3)] flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="py-2.5 px-4 bg-[#1A231C] border border-gray-700 text-gray-300 font-bold text-xs rounded-xl hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        /* Physical Measures & IMC Cards */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
            <span>Medidas Corporais</span>
            <span className="text-[#78FF00] text-[10px] font-normal">Base de cálculo de calorias</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-[#121814] border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
              <Scale className="w-4 h-4 text-[#78FF00] mb-1" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Peso</span>
              <p className="text-base font-black text-white mt-0.5">
                {userProfile.peso || 70} <span className="text-[10px] text-gray-500 font-normal">kg</span>
              </p>
            </div>

            <div className="bg-[#121814] border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
              <Ruler className="w-4 h-4 text-[#78FF00] mb-1" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Altura</span>
              <p className="text-base font-black text-white mt-0.5">
                {userProfile.altura || 170} <span className="text-[10px] text-gray-500 font-normal">cm</span>
              </p>
            </div>

            <div className="bg-[#121814] border border-gray-800 p-3 rounded-2xl flex flex-col items-center justify-center text-center">
              <Calendar className="w-4 h-4 text-[#78FF00] mb-1" />
              <span className="text-[10px] text-gray-400 uppercase font-bold">Idade</span>
              <p className="text-base font-black text-white mt-0.5">
                {userProfile.idade || 25} <span className="text-[10px] text-gray-500 font-normal">anos</span>
              </p>
            </div>
          </div>

          {/* IMC Banner */}
          <div className="bg-[#121814] border border-gray-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#78FF00]/10 text-[#78FF00] border border-[#78FF00]/20 font-black text-sm">
                IMC
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-white">Índice de Massa Corporal</h4>
                <p className={`text-xs font-bold ${imcColor} mt-0.5`}>{imcStatus}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-white">{imc}</span>
            </div>
          </div>
        </div>
      )}

      {/* Security & LGPD Consent Section */}
      <div className="space-y-2 pt-1">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Privacidade & Segurança</h3>

        <div className="bg-[#121814] border border-gray-800 p-4 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#78FF00]" />
              <div>
                <h4 className="text-xs font-bold text-white">Conformidade LGPD</h4>
                <p className="text-[10px] text-gray-400">
                  {userProfile.aceitouLgpd ? 'Consentimento ativo e registrado' : 'Pendente de aceite'}
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-[#78FF00]/10 text-[#78FF00] font-bold px-2 py-0.5 rounded-full border border-[#78FF00]/30">
              Ativo
            </span>
          </div>

          <button
            onClick={onOpenLgpd}
            className="w-full py-2 bg-[#1A231C] border border-gray-800 hover:border-[#78FF00]/40 rounded-xl text-xs font-bold text-gray-300 hover:text-[#78FF00] transition-colors flex items-center justify-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5 text-[#78FF00]" />
            <span>Consultar Termos & LGPD</span>
          </button>
        </div>
      </div>

      {/* Action Buttons: Sair do App & Deletar a Conta */}
      <div className="pt-2 space-y-2.5">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ações da Conta</h3>

        {/* Button 1: Sair do App */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-3 px-4 bg-[#121814] hover:bg-[#1A231C] border border-[#78FF00]/40 text-[#78FF00] rounded-2xl text-xs font-extrabold transition-all shadow-[0_0_15px_rgba(120,255,0,0.15)] flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <LogOut className="w-4 h-4 text-[#78FF00]" />
          <span>Sair do App</span>
        </button>

        {/* Button 2: Deletar a Conta */}
        <button
          type="button"
          onClick={() => setShowDeleteConfirmModal(true)}
          className="w-full py-3 px-4 bg-red-950/20 hover:bg-red-950/40 border border-red-500/40 text-red-400 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <UserX className="w-4 h-4 text-red-400" />
          <span>Deletar a Conta</span>
        </button>
      </div>
    </div>
  );
};

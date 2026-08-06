import React, { useState, useEffect } from 'react';
import { Home, PlayCircle, Dumbbell, ShieldCheck, User } from 'lucide-react';
import { SplashScreen } from './components/SplashScreen';
import { SignUpScreen } from './components/SignUpScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { HomeScreen } from './components/HomeScreen';
import { RecordScreen } from './components/RecordScreen';
import { WorkoutBuilderScreen } from './components/WorkoutBuilderScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { WorkoutCompletionModal } from './components/WorkoutCompletionModal';
import { LgpdModal } from './components/LgpdModal';
import { DeviceFrame } from './components/DeviceFrame';
import { UserProfile, WorkoutRoutine, WorkoutRecord } from './types';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredWorkouts,
  saveStoredWorkouts,
  getStoredRecords,
  saveStoredRecords,
  INITIAL_USER_PROFILE,
} from './utils/storage';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [userProfile, setUserProfile] = useState<UserProfile>(getStoredProfile);
  const [workouts, setWorkouts] = useState<WorkoutRoutine[]>(getStoredWorkouts);
  const [records, setRecords] = useState<WorkoutRecord[]>(getStoredRecords);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [activeTab, setActiveTab] = useState<'inicio' | 'gravar' | 'treinos' | 'perfil'>('inicio');
  const [tabHistory, setTabHistory] = useState<('inicio' | 'gravar' | 'treinos' | 'perfil')[]>(['inicio']);
  const [completedRecord, setCompletedRecord] = useState<WorkoutRecord | null>(null);
  const [isLgpdModalOpen, setIsLgpdModalOpen] = useState<boolean>(false);

  const handleNavigateTab = (tab: 'inicio' | 'gravar' | 'treinos' | 'perfil') => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setTabHistory((prev) => [...prev, tab]);
    }
  };

  const handleBackNavigation = () => {
    if (tabHistory.length > 1) {
      const newHistory = [...tabHistory];
      newHistory.pop();
      const prevTab = newHistory[newHistory.length - 1];
      setTabHistory(newHistory);
      setActiveTab(prevTab);
    } else {
      // If at root 'inicio' tab, log out back to login screen
      handleLogout();
    }
  };

  // Sync state changes with localStorage
  useEffect(() => {
    saveStoredProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveStoredWorkouts(workouts);
  }, [workouts]);

  useEffect(() => {
    saveStoredRecords(records);
  }, [records]);

  // Handle user registration completion
  const handleSignUpSuccess = (data: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...data, isLoggedIn: true };
    setUserProfile(updated);
  };

  // Handle onboarding measures completion
  const handleOnboardingComplete = (data: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...data, hasCompletedOnboarding: true };
    setUserProfile(updated);
  };

  // Handle workout completion
  const handleFinishWorkout = (newRecord: WorkoutRecord) => {
    setRecords((prev) => [newRecord, ...prev]);
    setCompletedRecord(newRecord);
  };

  // Close completion modal and return to appropriate tab
  const handleCloseCompletionModal = () => {
    if (completedRecord?.tipo === 'gps') {
      setActiveTab('gravar');
    } else {
      setActiveTab('inicio');
    }
    setCompletedRecord(null);
  };

  // Handle Logout -> Goes to Login Screen
  const handleLogout = () => {
    setAuthMode('login');
    setUserProfile((prev) => ({ ...prev, isLoggedIn: false }));
  };

  // Handle Account Deletion -> Permanently clears user data & Goes to Cadastro Screen
  const handleDeleteAccount = () => {
    localStorage.clear();
    setUserProfile(INITIAL_USER_PROFILE);
    setRecords([]);
    setWorkouts(getStoredWorkouts());
    setAuthMode('signup');
    setActiveTab('inicio');
  };

  const renderContent = () => {
    // 1. Splash Screen
    if (showSplash) {
      return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    // 2. Sign Up / Login Screen
    if (!userProfile.isLoggedIn) {
      return (
        <SignUpScreen
          initialMode={authMode}
          onSignUpSuccess={handleSignUpSuccess}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      );
    }

    // 3. Onboarding Screen (Peso, Altura, Idade)
    if (!userProfile.hasCompletedOnboarding) {
      return (
        <OnboardingScreen
          userProfile={userProfile}
          onComplete={handleOnboardingComplete}
          onBack={() => setUserProfile((prev) => ({ ...prev, isLoggedIn: false }))}
        />
      );
    }

    // 4. Main Tab Views
    return (
      <div className="relative min-h-full flex flex-col justify-between bg-[#0A0D0B]">
        {/* Active Tab Screen */}
        <div className="flex-1">
          {activeTab === 'inicio' && (
            <HomeScreen
              userProfile={userProfile}
              records={records}
              onNavigateToRecord={() => handleNavigateTab('gravar')}
              onNavigateToBuilder={() => handleNavigateTab('treinos')}
              onNavigateToProfile={() => handleNavigateTab('perfil')}
              onOpenLgpd={() => setIsLgpdModalOpen(true)}
              onBack={handleBackNavigation}
              onDeleteRecord={(recordId) => setRecords((prev) => prev.filter((r) => r.id !== recordId))}
            />
          )}

          {activeTab === 'gravar' && (
            <RecordScreen
              onFinishWorkout={handleFinishWorkout}
              onBack={handleBackNavigation}
            />
          )}

          {activeTab === 'treinos' && (
            <WorkoutBuilderScreen
              routines={workouts}
              onSaveRoutines={setWorkouts}
              onFinishWorkout={handleFinishWorkout}
              onBack={handleBackNavigation}
            />
          )}

          {activeTab === 'perfil' && (
            <ProfileScreen
              userProfile={userProfile}
              records={records}
              onUpdateProfile={(updatedData) =>
                setUserProfile((prev) => ({ ...prev, ...updatedData }))
              }
              onOpenLgpd={() => setIsLgpdModalOpen(true)}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
              onBack={handleBackNavigation}
            />
          )}
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="sticky bottom-0 left-0 right-0 z-40 bg-[#0A0D0B]/95 backdrop-blur-lg border-t border-gray-800/90 px-2 py-2 flex items-center justify-around">
          {/* Tab 1: Início */}
          <button
            onClick={() => handleNavigateTab('inicio')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'inicio'
                ? 'text-[#78FF00] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-300 font-medium'
            }`}
          >
            <Home className={`w-5 h-5 ${activeTab === 'inicio' ? 'text-[#78FF00]' : ''}`} />
            <span className="text-[10px]">Início</span>
          </button>

          {/* Tab 2: Gravar */}
          <button
            onClick={() => handleNavigateTab('gravar')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'gravar'
                ? 'text-[#78FF00] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-300 font-medium'
            }`}
          >
            <PlayCircle className={`w-5 h-5 ${activeTab === 'gravar' ? 'text-[#78FF00]' : ''}`} />
            <span className="text-[10px]">Gravar</span>
          </button>

          {/* Tab 3: Treinos */}
          <button
            onClick={() => handleNavigateTab('treinos')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'treinos'
                ? 'text-[#78FF00] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-300 font-medium'
            }`}
          >
            <Dumbbell className={`w-5 h-5 ${activeTab === 'treinos' ? 'text-[#78FF00]' : ''}`} />
            <span className="text-[10px]">Treinos</span>
          </button>

          {/* Tab 4: Perfil */}
          <button
            onClick={() => handleNavigateTab('perfil')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'perfil'
                ? 'text-[#78FF00] font-bold scale-105'
                : 'text-gray-500 hover:text-gray-300 font-medium'
            }`}
          >
            <User className={`w-5 h-5 ${activeTab === 'perfil' ? 'text-[#78FF00]' : ''}`} />
            <span className="text-[10px]">Perfil</span>
          </button>
        </nav>

        {/* Green Check Circle Completion Overlay */}
        {completedRecord && (
          <WorkoutCompletionModal
            record={completedRecord}
            onClose={handleCloseCompletionModal}
          />
        )}

        {/* LGPD Modal */}
        <LgpdModal
          isOpen={isLgpdModalOpen}
          onClose={() => setIsLgpdModalOpen(false)}
          onAcceptAndClose={() => {
            setUserProfile((prev) => ({
              ...prev,
              aceitouLgpd: true,
              dataAceiteLgpd: new Date().toISOString(),
            }));
            setIsLgpdModalOpen(false);
          }}
        />
      </div>
    );
  };

  return <DeviceFrame>{renderContent()}</DeviceFrame>;
}

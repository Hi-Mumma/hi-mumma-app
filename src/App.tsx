/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useMaternalStore } from './store/useMaternalStore';
import { MobileContainer } from './components/layout/MobileContainer';
import { TopHeader } from './components/layout/TopHeader';
import { MainNavigation } from './components/layout/MainNavigation';
import { HomeView } from './components/views/HomeView';
import { JourneyView } from './components/views/JourneyView';
import { TrackView } from './components/views/TrackView';
import { LearnView } from './components/views/LearnView';
import { MoreView } from './components/views/MoreView';
import { RecordsView } from './components/records/RecordsView';
import { AuthFlow } from './components/auth/AuthFlow';
import { GuardianDashboardView } from './components/views/GuardianDashboardView';
import { BrandLogo } from './components/common/BrandLogo';
import { getTrimesterNumber } from './utils/pregnancyStage';

export default function App() {
  const {
    currentTab,
    setCurrentTab,
    currentWeek,
    setCurrentWeek,
    phase,
    setPhase,
    postpartumDay,
    setPostpartumDay,
    weekInfo,
    supplements,
    toggleSupplement,
    pregnancyTestTracking,
    togglePregnancyTest,
    ultrasoundMilestones,
    toggleUltrasoundMilestone,
    bpEntries,
    addBPEntry,
    bpSuccessModal,
    closeBpSuccessModal,
    daysLogged,
    weeklyBPCount,
    bloodSugarEntries,
    addBloodSugarEntry,
    movementEntries,
    addMovementEntry,
    records,
    selectedRecordFolder,
    setSelectedRecordFolder,
    uploadMockRecord,
    visits,
    addOBQuestion,
    bagItems,
    toggleBagItem,
    communityPosts,
    addCommunityPost,
    expertQuestions,
    addExpertQuestion,
    caregiverLinks,
    updateCaregiverPermissions,
    revokeCaregiverLink,
    addCaregiverByEmail,
    guardianLinkedData,
    currentUser,
    setCurrentUser,
    logout,
    isAuthLoading
  } = useMaternalStore();



  // ── 0. AUTH SESSION RESTORATION LOADING ──
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4FA] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#EA81AA] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#5A677D]">Opening Hi Mumma Sanctuary...</span>
        </div>
      </div>
    );
  }

  // ── 1. GUEST / ONBOARDING AUTHENTICATION FLOW ──
  if (!currentUser || (!currentUser.isOnboarded && currentTab !== 'login')) {
    return (
      <MobileContainer>
        <AuthFlow
          initialRole={currentUser?.role || 'patient'}
          initialStage={currentUser ? 'patient-onboarding' : 'splash'}
          onAuthComplete={(user) => {
            setCurrentUser(user);
            setCurrentTab('home');
          }}
        />
      </MobileContainer>
    );
  }

  // ── 2. GUARDIAN DASHBOARD VIEW (WHEN LOGGED IN AS GUARDIAN) ──
  if (currentUser.role === 'guardian' && currentTab !== 'login') {
    return (
      <MobileContainer>
        <GuardianDashboardView
          currentUser={currentUser}
          currentWeek={currentWeek}
          guardianLinkedData={guardianLinkedData}
          onSwitchToPatientView={() => {
            // Allows guardian to preview patient application
            setCurrentUser({
              ...currentUser,
              role: 'patient'
            });
          }}
          onLogout={logout}
          onToggleSharedTask={toggleBagItem}
        />
      </MobileContainer>
    );
  }

  // ── 3. PATIENT SANCTUARY APPLICATION (MAIN FLOW) ──
  return (
    <MobileContainer>
      {/* ── TOP HEADER (Gestational Week & Trimester) ── */}
      <TopHeader
        week={currentWeek}
        trimester={getTrimesterNumber(currentWeek)}
        onWeekChange={(w) => setCurrentWeek(w)}
        currentUser={currentUser}
        onOpenLogin={() => setCurrentTab('login')}
        onLogout={logout}
      />

      {/* ── ACTIVE VIEW ROUTING ── */}
      {currentTab === 'login' && (
        <AuthFlow
          initialRole={currentUser.role}
          initialStage="role-select"
          onAuthComplete={(user) => {
            setCurrentUser(user);
            setCurrentTab('home');
          }}
        />
      )}

      {currentTab === 'home' && (
        <HomeView
          currentWeek={currentWeek}
          weekInfo={weekInfo}
          supplements={supplements}
          onToggleSupplement={toggleSupplement}
          bpEntries={bpEntries}
          weeklyBPCount={weeklyBPCount}
          daysLogged={daysLogged}
          onNavigate={(tab) => setCurrentTab(tab)}
          currentUser={currentUser}
        />
      )}

      {currentTab === 'journey' && (
        <JourneyView
          currentWeek={currentWeek}
          weekInfo={weekInfo}
          onSelectWeek={(w) => setCurrentWeek(w)}
        />
      )}

      {currentTab === 'track' && (
        <TrackView
          bpEntries={bpEntries}
          daysLogged={daysLogged}
          weeklyBPCount={weeklyBPCount}
          onAddBPLog={addBPEntry}
          bloodSugarEntries={bloodSugarEntries}
          onAddBloodSugar={addBloodSugarEntry}
          movementEntries={movementEntries}
          onAddMovement={addMovementEntry}
          visits={visits}
          onAddOBQuestion={addOBQuestion}
          bagItems={bagItems}
          onToggleBagItem={toggleBagItem}
          pregnancyTestTracking={pregnancyTestTracking}
          onTogglePregnancyTest={togglePregnancyTest}
          ultrasoundMilestones={ultrasoundMilestones}
          onToggleUltrasoundMilestone={toggleUltrasoundMilestone}
        />
      )}

      {currentTab === 'learn' && (
        <LearnView
          phase={phase}
          communityPosts={communityPosts}
          onAddCommunityPost={addCommunityPost}
          expertQuestions={expertQuestions}
          onAddExpertQuestion={addExpertQuestion}
        />
      )}

      {currentTab === 'more' && (
        <MoreView
          phase={phase}
          onTogglePhase={setPhase}
          postpartumDay={postpartumDay}
          onUpdatePostpartumDay={setPostpartumDay}
          currentUser={currentUser}
          onOpenLogin={() => setCurrentTab('login')}
          onLogout={logout}
          caregiverLinks={caregiverLinks}
          onUpdatePermissions={updateCaregiverPermissions}
          onRevokeLink={revokeCaregiverLink}
          onAddCaregiver={addCaregiverByEmail}
        />
      )}

      {currentTab === 'records' && (
        <RecordsView
          records={records}
          selectedFolder={selectedRecordFolder}
          onSelectFolder={setSelectedRecordFolder}
          onUploadRecord={uploadMockRecord}
          phase={phase}
          onBackToHome={() => setCurrentTab('home')}
        />
      )}

      {/* ── BLOOD PRESSURE LOG CONFIRMATION TOAST ── */}
      {bpSuccessModal && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#192231] text-white px-4 py-2.5 rounded-full shadow-lg border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-300">
          <span className="w-2 h-2 rounded-full bg-[#EA81AA] animate-ping" />
          <span className="text-xs font-bold">Blood pressure reading logged successfully</span>
          <button
            onClick={closeBpSuccessModal}
            className="text-xs opacity-70 hover:opacity-100 ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── BOTTOM NAVIGATION WITH PROMINENT FLOATING RECORDS VAULT ── */}
      {currentTab !== 'login' && (
        <MainNavigation
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          recordCount={records.length}
        />
      )}
    </MobileContainer>
  );
}

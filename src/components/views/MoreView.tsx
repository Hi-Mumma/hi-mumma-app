import React, { useState } from 'react';
import { PregnancyPhase, UserProfile, DatabaseGuardianPatientLink, CaregiverPermissions } from '../../types';

interface MoreViewProps {
  phase: PregnancyPhase;
  onTogglePhase: (phase: PregnancyPhase) => void;
  postpartumDay: number;
  onUpdatePostpartumDay: (day: number) => void;
  currentUser?: UserProfile | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  caregiverLinks?: DatabaseGuardianPatientLink[];
  onUpdatePermissions?: (linkId: string, permissions: Partial<CaregiverPermissions>) => void;
  onRevokeLink?: (linkId: string) => void;
  onAddCaregiver?: (email: string, relationship: string) => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  phase,
  onTogglePhase,
  postpartumDay,
  onUpdatePostpartumDay,
  currentUser,
  onOpenLogin,
  onLogout,
  caregiverLinks = [],
  onUpdatePermissions,
  onRevokeLink,
  onAddCaregiver
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [relationship, setRelationship] = useState('Partner');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (caregiverEmail.trim() && onAddCaregiver) {
      onAddCaregiver(caregiverEmail.trim(), relationship);
      setCaregiverEmail('');
      setShowAddModal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── 0. MATERNAL ACCOUNT & PROFILE (MOCK AUTH) ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2.5">
          <div>
            <h3 className="text-xs font-black text-[#192231]">Maternal Account</h3>
            <p className="text-[10px] text-[#8F9EB3]">Cloud sync & encrypted records access</p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FDF2F7] border border-[#FBCFE8] text-[#EA81AA]">
            {currentUser ? 'Active Sanctuary' : 'Guest Mode'}
          </span>
        </div>

        {currentUser ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 rounded-2xl bg-[#F8FAFD] border border-[#E8EFF7] gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white shadow-xs shrink-0">
                <img
                  src={currentUser.avatarUrl || '/mother-hero.jpg'}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-black text-[#192231] truncate">{currentUser.name}</h4>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase border shrink-0 ${
                    currentUser.role === 'guardian'
                      ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#2563EB]'
                      : 'bg-[#FFF5F8] border-[#FBCFE8] text-[#EA81AA]'
                  }`}>
                    {currentUser.role === 'guardian' ? 'Guardian' : 'Mother'}
                  </span>
                </div>
                <p className="text-[10px] text-[#7A8B9E] break-words">{currentUser.email}</p>
                {currentUser.role === 'patient' && currentUser.dueDate && (
                  <p className="text-[9px] text-[#5A677D] truncate">Due: {currentUser.dueDate}</p>
                )}
                {currentUser.role === 'guardian' && currentUser.guardianProfile && (
                  <p className="text-[9px] text-[#5A677D] break-words">
                    Supporting: {currentUser.guardianProfile.connectedPatientName} ({currentUser.guardianProfile.relationship})
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col min-[340px]:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-[#E8EFF7]/60 sm:border-t-0">
              <button
                onClick={onOpenLogin}
                className="flex-1 sm:flex-none px-3 py-2 min-h-[44px] rounded-xl bg-white border border-[#E2ECF7] text-[11px] font-bold text-[#192231] hover:bg-[#F3F8FE] transition-colors cursor-pointer flex items-center justify-center"
              >
                Switch Role
              </button>
              <button
                onClick={onLogout}
                className="flex-1 sm:flex-none px-3 py-2 min-h-[44px] rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[11px] font-bold text-[#DC2626] hover:bg-[#FEE2E2] transition-colors cursor-pointer flex items-center justify-center"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#FFF5F8] to-[#F0F7FF] border border-[#FCE7F3]">
            <div>
              <p className="text-xs font-bold text-[#192231]">Sign in to sync vitals</p>
              <p className="text-[10px] text-[#7A8B9E]">Access your private sanctuary across devices</p>
            </div>
            <button
              onClick={onOpenLogin}
              className="px-4 py-1.5 rounded-full bg-[#192231] text-white text-xs font-black shadow-xs hover:bg-[#2D3748] transition-all cursor-pointer"
            >
              Sign In
            </button>
          </div>
        )}
      </section>

      {/* ── 1. CAREGIVER & PERMISSION MANAGEMENT (MOTHER CONTROLLED) ── */}
      {currentUser?.role === 'patient' && (
        <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2.5">
            <div>
              <h3 className="text-xs font-black text-[#192231]">Caregiver & Guardian Access</h3>
              <p className="text-[10px] text-[#8F9EB3]">Control permissions for partners & support team</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-full bg-[#192231] text-white text-xs font-bold shadow-xs hover:bg-[#2e3b52] active:scale-95 transition-all cursor-pointer"
            >
              + Add Caregiver
            </button>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#FFF5F8] border border-[#FCE7F3] text-[10px] text-[#EA81AA] space-y-1">
            <p className="font-extrabold flex items-center gap-1">
              🛡️ Privacy & Medical Control Notice:
            </p>
            <p className="text-[#5A677D] leading-relaxed">
              Caregivers only see areas explicitly enabled below. <strong>Fetal Movement (kick counts)</strong>, <strong>Clinical Vitals (BP/Sugar)</strong>, and <strong>Private Medical Vault</strong> records remain strictly private (Mother Only).
            </p>
          </div>

          {caregiverLinks.length === 0 ? (
            <div className="p-4 text-center rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
              <p className="text-xs font-bold text-[#5A677D]">No caregivers linked yet</p>
              <p className="text-[10px] text-[#8F9EB3]">
                Tap "+ Add Caregiver" to invite your partner or support person.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {caregiverLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-3.5 rounded-2xl bg-[#FAFBFD] border border-[#E8EFF7] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black text-[#192231]">
                        {link.guardianName || 'Caregiver'}
                      </h4>
                      <p className="text-[10px] text-[#8F9EB3]">{link.guardianEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#EBFBF4] text-[#1FA662] border border-[#BBF7D0]">
                        Active Link
                      </span>
                      <button
                        onClick={() => onRevokeLink && onRevokeLink(link.id)}
                        className="text-[10px] font-bold text-[#DC2626] hover:underline cursor-pointer"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>

                  {/* Granular Permission Toggles */}
                  <div className="pt-2 border-t border-[#F0F4FA] space-y-2">
                    <p className="text-[10px] font-extrabold uppercase text-[#7A8B9E] tracking-wider">
                      Granted Permissions:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { key: 'allowJourneyView', label: '🗺️ Gestational Progress' },
                        { key: 'allowCareView', label: '🥗 Supplement Summary' },
                        { key: 'allowDeliveryPrepView', label: '🎒 Delivery Bag Prep' },
                        { key: 'allowSharedTasksView', label: '🤝 Shared Tasks' },
                        { key: 'allowRemindersView', label: '⏰ Reminders (UI Preference)' },
                        { key: 'allowPostpartumView', label: '🌸 Postpartum (UI Preference)' }
                      ].map((perm) => (
                        <label
                          key={perm.key}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E8EFF7] cursor-pointer hover:border-[#6FAFED] transition-colors"
                        >
                          <span className="text-xs font-bold text-[#192231]">
                            {perm.label}
                          </span>
                          <input
                            type="checkbox"
                            checked={!!link.permissions[perm.key as keyof CaregiverPermissions]}
                            onChange={(e) =>
                              onUpdatePermissions &&
                              onUpdatePermissions(link.id, {
                                [perm.key]: e.target.checked
                              })
                            }
                            className="accent-[#EA81AA] w-4 h-4 cursor-pointer shrink-0 ml-2"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── 2. PREGNANCY / POSTPARTUM PHASE CONTROLLER ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black text-[#192231]">Maternal Journey Phase</h3>
            <p className="text-[10px] text-[#8F9EB3]">Controls timeline and postpartum vault access</p>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FAFBFD] border border-[#E2ECF7] text-[#6FAFED]">
            {phase === 'pregnancy' ? 'Pregnancy Mode' : 'Postpartum Mode'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTogglePhase('pregnancy')}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              phase === 'pregnancy'
                ? 'bg-[#192231] text-white border-[#192231] shadow-xs'
                : 'bg-[#FAFBFD] text-[#5A677D] border-[#E8EFF7] hover:border-[#6FAFED]'
            }`}
          >
            🤰 Pregnancy (Weeks 1–40+)
          </button>
          <button
            onClick={() => onTogglePhase('postpartum')}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
              phase === 'postpartum'
                ? 'bg-gradient-to-r from-[#EA81AA] to-[#6FAFED] text-white border-transparent shadow-xs'
                : 'bg-[#FAFBFD] text-[#5A677D] border-[#E8EFF7] hover:border-[#EA81AA]'
            }`}
          >
            🌸 Postpartum (Days 1–42)
          </button>
        </div>

        {phase === 'postpartum' && (
          <div className="p-3 rounded-2xl bg-[#FDF5F8] border border-[#F5D5E3] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-[#192231]">
                Postpartum Recovery: Day {postpartumDay} of 42
              </span>
              <span className="text-[10px] font-bold text-[#EA81AA]">
                Vault Unlocked 🔓
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="42"
              value={postpartumDay}
              onChange={(e) => onUpdatePostpartumDay(Number(e.target.value))}
              className="w-full accent-[#EA81AA] cursor-pointer"
            />
          </div>
        )}
      </section>

      {/* ── 3. CLINICAL CARE TEAM REPOSITORY ── */}
      <section className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-2.5">
        <h4 className="text-xs font-black text-[#192231] border-b border-[#F0F4FA] pb-2">
          Your Maternal Care Team
        </h4>
        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[#FAFBFD] border border-[#EBF1F9] flex justify-between items-center">
            <div>
              <p className="font-bold text-[#192231]">Dr. A. Sharma, MD, DGO</p>
              <p className="text-[10px] text-[#8F9EB3]">Lead Obstetrician & Gynecologist</p>
            </div>
            <span className="text-xs">🩺</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FAFBFD] border border-[#EBF1F9] flex justify-between items-center">
            <div>
              <p className="font-bold text-[#192231]">City Maternal Care Hospital</p>
              <p className="text-[10px] text-[#8F9EB3]">Registration: #MUM-2026-8819</p>
            </div>
            <span className="text-xs">🏥</span>
          </div>
        </div>
      </section>

      {/* ── 4. NON-DIAGNOSTIC ARCHITECTURAL DISCLAIMER ── */}
      <section className="p-4 rounded-3xl bg-[#FAFBFD] border border-[#E8EFF7] text-center space-y-1 text-[#8F9EB3]">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A677D]">
          Maternal Companion Notice
        </p>
        <p className="text-[10px] leading-relaxed">
          HI MUMMA is a digital journey companion and tracking tool. It does not provide medical diagnoses, treatment plans, clinical decision scoring, or emergency triage. Always consult your attending OB-GYN for all health evaluations.
        </p>
      </section>

      {/* Add Caregiver Dialog Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E2ECF7] shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
              <h3 className="text-sm font-black text-[#192231]">Add Caregiver / Support Person</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-sm font-bold text-[#8F9EB3] hover:text-[#192231]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Caregiver Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="partner@example.com"
                  value={caregiverEmail}
                  onChange={(e) => setCaregiverEmail(e.target.value)}
                  className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-xl py-2 px-3 text-xs text-[#192231] placeholder-[#A0B0C4] focus:outline-none focus:border-[#6FAFED]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Relationship
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-xl py-2 px-3 text-xs text-[#192231]"
                >
                  <option value="Partner">Partner / Spouse</option>
                  <option value="Mother">Mother</option>
                  <option value="Sister">Sister</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Friend">Support Friend</option>
                </select>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAFBFD] border border-[#EBF1F9] text-[10px] text-[#8F9EB3] leading-relaxed">
                ℹ️ All permissions default to enabled. You can adjust or revoke permissions at any time.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#EA81AA] to-[#6FAFED] text-white text-xs font-black shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  Link Caregiver
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


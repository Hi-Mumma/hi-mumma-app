import React, { useState } from 'react';
import { governmentSchemesData } from '../../mock/maternalData';
import { PregnancyPhase } from '../../types';

interface LearnViewProps {
  phase: PregnancyPhase;
}

export const LearnView: React.FC<LearnViewProps> = ({ phase }) => {
  const [activeTab, setActiveTab] = useState<'meds' | 'travel' | 'schemes' | 'postpartum'>('meds');

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E8EFF7] rounded-2xl shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'meds', label: 'Medicine & Side Effects', icon: '💊' },
          { id: 'travel', label: 'Travel & Lifestyle', icon: '✈️' },
          { id: 'schemes', label: 'Maternity Schemes', icon: '🏛️' },
          ...(phase === 'postpartum' ? [{ id: 'postpartum' as const, label: 'Postpartum Restoration', icon: '🌸' }] : [])
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-[#192231] text-white shadow-xs'
                : 'text-[#5A677D] hover:text-[#192231] hover:bg-[#F3F8FE]'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── 1. MEDICINE & SUPPLEMENT EDUCATION ── */}
      {activeTab === 'meds' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#F0F4FA] pb-2">
              <span className="p-1.5 rounded-xl bg-[#FBE8F0] text-sm">💊</span>
              <h3 className="text-xs font-black text-[#192231]">
                Maternal Supplements & Gastrointestinal Tolerability
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-[#5A677D] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Iron Salts & Mild GI Side Effects</h4>
                <p>
                  Ferrous sulfate and other oral iron preparations are essential to build maternal hemoglobin, but frequently cause mild nausea, darker stool color, or constipation.
                </p>
                <p className="text-[11px] text-[#6FAFED] font-medium pt-1">
                  Supportive Tip: Take with Vitamin C (citrus juice) to maximize absorption, and ensure gentle daily movement.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. TRAVEL & LIFESTYLE SAFETY ── */}
      {activeTab === 'travel' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#F0F4FA] pb-2">
              <span className="p-1.5 rounded-xl bg-[#EAF2FD] text-sm">✈️</span>
              <h3 className="text-xs font-black text-[#192231]">
                Travel & Mobility Safety Standards
              </h3>
            </div>

            <div className="space-y-2 text-xs text-[#5A677D] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Optimal Gestational Travel Window</h4>
                <p>
                  The safest period for travel in an uncomplicated pregnancy is generally between Weeks 14 and 28, when nausea has subsided and mobility is comfortable.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Automobile Lap Belt Placement</h4>
                <p>
                  Always place the lap belt flat across your hips and pelvic bones below your bump, never directly across the abdomen. Position the diagonal strap across the center of your chest.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Circulation & Hydration on Longer Trips</h4>
                <p>
                  Pause every 90 minutes during road trips to stretch calf muscles. On flights, wear mild compression stockings and hydrate frequently with electrolytes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. GOVERNMENT MATERNITY SCHEMES ── */}
      {activeTab === 'schemes' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FBE8F0] to-[#E4EFFC] border border-white">
            <h3 className="text-xs font-black text-[#192231]">National Maternal Health Schemes</h3>
            <p className="text-[10px] text-[#5A677D]">
              Verified public healthcare initiatives for prenatal care, financial assistance, and institutional delivery.
            </p>
          </div>

          <div className="space-y-3">
            {governmentSchemesData.map((scheme) => (
              <div
                key={scheme.id}
                className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-2"
              >
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FAFBFD] border border-[#E2ECF7] text-[#6FAFED]">
                  {scheme.authority}
                </span>

                <h4 className="text-xs font-black text-[#192231]">{scheme.schemeName}</h4>
                <p className="text-[11px] text-[#5A677D]">{scheme.objective}</p>

                <div className="pt-2 border-t border-[#F0F4FA] space-y-1">
                  <span className="text-[10px] font-bold text-[#8F9EB3] uppercase tracking-wider block">
                    Key Entitlements:
                  </span>
                  {scheme.keyBenefits.map((b, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-[#192231]">
                      <span className="text-[#EA81AA] font-black">•</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-1">
                  <span className="text-[10px] font-bold text-[#8F9EB3] uppercase tracking-wider block">
                    Required Records:
                  </span>
                  {scheme.documentationChecklist.map((d, i) => (
                    <span
                      key={i}
                      className="inline-block text-[10px] bg-[#FAFBFD] border border-[#E8EFF7] px-2 py-0.5 rounded-md text-[#5A677D] mr-1.5 mb-1"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. POSTPARTUM RESTORATION & MOOD EDUCATION (NON-DIAGNOSTIC) ── */}
      {activeTab === 'postpartum' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#F0F4FA] pb-2">
              <span className="p-1.5 rounded-xl bg-[#FDF5F8] text-sm">🌸</span>
              <h3 className="text-xs font-black text-[#192231]">
                The 42-Day Restorative Window (Puerperium)
              </h3>
            </div>

            <div className="space-y-2 text-xs text-[#5A677D] leading-relaxed">
              <p>
                The 6 weeks (42 days) following birth represent profound physiological recalibration. Uterine involution, fluid equilibrium, and hormonal stabilization require prioritized rest and supportive nourishment.
              </p>

              <div className="p-3.5 rounded-2xl bg-[#F3F8FE] border border-[#C7DFF9] space-y-1 mt-2">
                <h4 className="font-black text-[#192231] text-xs">
                  Understanding Postpartum Mood Changes (PDD Education)
                </h4>
                <p className="text-[11px] leading-normal text-[#4A576D]">
                  Mild mood fluctuations ("baby blues") frequently occur during the first 10 days due to rapid estrogen and progesterone withdrawal. However, persistent feelings of sadness, profound fatigue, or excessive anxiety beyond two weeks warrant open discussion with your doctor.
                </p>
                <p className="text-[10px] text-[#6FAFED] font-bold pt-1">
                  Non-diagnostic guidance: Always share how you feel with your partner, family, and obstetric provider without hesitation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

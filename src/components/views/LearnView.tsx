import React, { useState } from 'react';
import { governmentSchemesData } from '../../mock/maternalData';
import { PregnancyPhase, CommunityPost, ExpertQuestion } from '../../types';

interface LearnViewProps {
  phase: PregnancyPhase;
  communityPosts?: CommunityPost[];
  onAddCommunityPost?: (category: CommunityPost['category'], title: string, content: string) => void;
  expertQuestions?: ExpertQuestion[];
  onAddExpertQuestion?: (topic: string, questionText: string) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  phase,
  communityPosts = [],
  onAddCommunityPost,
  expertQuestions = [],
  onAddExpertQuestion
}) => {
  const [activeTab, setActiveTab] = useState<
    'nutrition' | 'meds' | 'travel' | 'lactation' | 'schemes' | 'postpartum' | 'community' | 'expert'
  >('nutrition');

  // Form states for Community Post submission
  const [postCategory, setPostCategory] = useState<CommunityPost['category']>('General Support');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);

  // Form states for Expert Q&A submission
  const [expertTopic, setExpertTopic] = useState('Nutrition & Iron');
  const [expertQuestionText, setExpertQuestionText] = useState('');
  const [showExpertModal, setShowExpertModal] = useState(false);

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postTitle.trim() && postContent.trim() && onAddCommunityPost) {
      onAddCommunityPost(postCategory, postTitle.trim(), postContent.trim());
      setPostTitle('');
      setPostContent('');
      setShowPostModal(false);
    }
  };

  const handleExpertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (expertQuestionText.trim() && onAddExpertQuestion) {
      onAddExpertQuestion(expertTopic, expertQuestionText.trim());
      setExpertQuestionText('');
      setShowExpertModal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E8EFF7] rounded-2xl shadow-xs overflow-x-auto no-scrollbar">
        {[
          { id: 'nutrition', label: 'Diet & Nutrition', icon: '🥗' },
          { id: 'meds', label: 'Medicine & Side Effects', icon: '💊' },
          { id: 'travel', label: 'Travel & Lifestyle', icon: '✈️' },
          { id: 'lactation', label: 'Lactation & Baby Care', icon: '👶' },
          { id: 'schemes', label: 'Maternity Schemes', icon: '🏛️' },
          { id: 'community', label: 'Community Hub', icon: '👥' },
          { id: 'expert', label: 'Expert Q&A', icon: '🩺' },
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

      {/* ── 1. DIET & NUTRITION EDUCATION ── */}
      {activeTab === 'nutrition' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#F0F4FA] pb-2">
              <span className="p-1.5 rounded-xl bg-[#E6F4EA] text-sm">🥗</span>
              <h3 className="text-xs font-black text-[#192231]">
                Maternal Dietary Balance & Key Micronutrients
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-[#5A677D] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Folate & Iron Balance</h4>
                <p>
                  Dietary folate (found in leafy green vegetables, lentils, and citrus fruits) supports early neural tube development. Elemental iron builds red blood cell volume.
                </p>
                <p className="text-[11px] text-[#6FAFED] font-medium pt-1">
                  💡 Supportive Tip: Pair plant-based non-heme iron sources with Vitamin C rich foods to enhance natural absorption.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Calcium & Hydration Baseline</h4>
                <p>
                  Dairy products, fortified plant milks, and sesame seeds provide foundational calcium for fetal bone development. Aim for 8–10 glasses of water daily to support amniotic fluid volume.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. MEDICINE & SUPPLEMENT EDUCATION ── */}
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
                  Ferrous sulfate and oral iron preparations build maternal hemoglobin, but frequently cause mild nausea, darker stool color, or constipation.
                </p>
                <p className="text-[11px] text-[#6FAFED] font-medium pt-1">
                  Supportive Tip: Take with Vitamin C (citrus juice) to maximize absorption, and maintain gentle daily movement.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Safe OTC Medication Rule</h4>
                <p>
                  Always consult your attending OB-GYN before taking over-the-counter pain relievers, antacids, or herbal teas during pregnancy.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3. TRAVEL & LIFESTYLE SAFETY ── */}
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
                  The safest period for travel in an uncomplicated pregnancy is generally between Weeks 14 and 28, when early nausea has subsided.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Automobile Lap Belt Placement</h4>
                <p>
                  Always place the lap belt flat across your hips and pelvic bones below your bump, never directly across the abdomen. Position the diagonal strap across the center of your chest.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. LACTATION & BABY CARE ESSENTIALS ── */}
      {activeTab === 'lactation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-[#F0F4FA] pb-2">
              <span className="p-1.5 rounded-xl bg-[#FFF3E0] text-sm">👶</span>
              <h3 className="text-xs font-black text-[#192231]">
                Lactation Foundations & Newborn Care Basics
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-[#5A677D] leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Colostrum: First Liquid Gold</h4>
                <p>
                  In the first few days after birth, breasts produce thick, nutrient-dense colostrum rich in maternal antibodies (IgA) to seal baby’s intestinal lining.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1">
                <h4 className="font-bold text-[#192231]">Safe Newborn Sleep Environment</h4>
                <p>
                  Always place baby to sleep on their back on a firm, flat mattress free of soft pillows, loose blankets, or heavy toys to encourage clear breathing.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. GOVERNMENT MATERNITY SCHEMES ── */}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 6. COMMUNITY HUB ── */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#F0F7FF] text-sm">👥</span>
                <div>
                  <h3 className="text-xs font-black text-[#192231]">Sanctuary Community Hub</h3>
                  <p className="text-[10px] text-[#8F9EB3]">Safe, peer-supported discussion forum</p>
                </div>
              </div>
              <button
                onClick={() => setShowPostModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#192231] text-white text-xs font-bold shadow-xs hover:bg-[#2e3b52] active:scale-95 transition-all"
              >
                + New Post
              </button>
            </div>

            <div className="space-y-3">
              {communityPosts.map((post) => (
                <div
                  key={post.id}
                  className="p-3.5 rounded-2xl bg-[#FAFBFD] border border-[#EBF1F9] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#EA81AA] bg-[#FDF2F7] px-2 py-0.5 rounded-full border border-[#FCE7F3]">
                      {post.category}
                    </span>
                    <span className="text-[10px] text-[#8F9EB3]">{post.createdAt}</span>
                  </div>

                  <h4 className="text-xs font-black text-[#192231]">{post.title}</h4>
                  <p className="text-[11px] text-[#5A677D] leading-relaxed">{post.content}</p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-[#8F9EB3] border-t border-[#F0F4FA]">
                    <span>Posted by {post.authorName}</span>
                    <span className="text-[#6FAFED] font-semibold">Community Member</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 7. EXPERT Q&A ── */}
      {activeTab === 'expert' && (
        <div className="space-y-4">
          <div className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#FDF5F8] text-sm">🩺</span>
                <div>
                  <h3 className="text-xs font-black text-[#192231]">Clinician-Reviewed Expert Q&A</h3>
                  <p className="text-[10px] text-[#8F9EB3]">Submit questions for obstetric & clinical review</p>
                </div>
              </div>
              <button
                onClick={() => setShowExpertModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#192231] text-white text-xs font-bold shadow-xs hover:bg-[#2e3b52] active:scale-95 transition-all"
              >
                + Ask Question
              </button>
            </div>

            <div className="space-y-3">
              {expertQuestions.map((eq) => (
                <div
                  key={eq.id}
                  className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F0F7FF] text-[#0284C7] border border-[#BAE6FD]">
                      Topic: {eq.topic}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        eq.status === 'answered'
                          ? 'bg-[#EBFBF4] text-[#1FA662] border-[#BBF7D0]'
                          : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                      }`}
                    >
                      {eq.status === 'answered' ? 'Clinician Answered' : 'Pending Review'}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-[#192231]">Q: {eq.question}</h4>

                  {eq.answer ? (
                    <div className="p-3 rounded-2xl bg-[#F0F7FF] border border-[#C7DFF9] text-xs text-[#192231] space-y-1">
                      <span className="text-[10px] font-extrabold uppercase text-[#0284C7] block">
                        🩺 Expert Clinician Response:
                      </span>
                      <p className="text-[11px] text-[#475569] leading-relaxed">{eq.answer}</p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#8F9EB3] italic">
                      Submitted to clinical team for review. Check back for answer updates.
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 8. POSTPARTUM RESTORATION & MOOD EDUCATION (NON-DIAGNOSTIC) ── */}
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
                  Mild mood fluctuations ("baby blues") frequently occur during the first 10 days due to rapid estrogen and progesterone withdrawal. However, persistent feelings of sadness or profound fatigue beyond two weeks warrant open discussion with your doctor.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Community Submission Dialog Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E2ECF7] shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
              <h3 className="text-sm font-black text-[#192231]">New Community Post</h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-sm font-bold text-[#8F9EB3] hover:text-[#192231]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Category
                </label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value as any)}
                  className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-xl py-2 px-3 text-xs text-[#192231]"
                >
                  <option value="General Support">General Support</option>
                  <option value="Trimester Tips">Trimester Tips</option>
                  <option value="Postpartum Care">Postpartum Care</option>
                  <option value="Nutrition">Nutrition</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Post Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tips for staying hydrated during walks?"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-xl py-2 px-3 text-xs text-[#192231] placeholder-[#A0B0C4] focus:outline-none focus:border-[#6FAFED]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Content / Details
                </label>
                <textarea
                  rows={3}
                  placeholder="Share your experience or ask a question for peer support..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-xl py-2 px-3 text-xs text-[#192231] placeholder-[#A0B0C4] focus:outline-none focus:border-[#6FAFED]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#EA81AA] to-[#6FAFED] text-white text-xs font-black shadow-sm active:scale-95 transition-all"
                >
                  Post to Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expert Q&A Submission Dialog Modal */}
      {showExpertModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-[#E2ECF7] shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#F0F4FA] pb-2">
              <h3 className="text-sm font-black text-[#192231]">Submit Question for Expert Q&A</h3>
              <button
                onClick={() => setShowExpertModal(false)}
                className="text-sm font-bold text-[#8F9EB3] hover:text-[#192231]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExpertSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Clinical Topic
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nutrition, Ultrasound Scans, Side Effects"
                  value={expertTopic}
                  onChange={(e) => setExpertTopic(e.target.value)}
                  className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-xl py-2 px-3 text-xs text-[#192231] placeholder-[#A0B0C4] focus:outline-none focus:border-[#6FAFED]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#5A677D] block mb-1">
                  Your Question
                </label>
                <textarea
                  rows={3}
                  placeholder="Ask a non-emergency educational question for clinician review..."
                  value={expertQuestionText}
                  onChange={(e) => setExpertQuestionText(e.target.value)}
                  className="w-full bg-[#FAFBFD] border border-[#E2ECF7] rounded-xl py-2 px-3 text-xs text-[#192231] placeholder-[#A0B0C4] focus:outline-none focus:border-[#6FAFED]"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAFBFD] border border-[#EBF1F9] text-[10px] text-[#8F9EB3] leading-relaxed">
                ℹ️ Questions are reviewed by clinical advisors for general educational responses. Emergency concerns should be directed to your local obstetric hospital.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#192231] text-white text-xs font-black shadow-sm active:scale-95 transition-all"
                >
                  Submit Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import {
  PregnancyTestTrackingEntry,
  UltrasoundMilestoneTrackingEntry
} from '../../types';

interface TestsAndUltrasoundSectionProps {
  pregnancyTestTracking: PregnancyTestTrackingEntry[];
  onTogglePregnancyTest: (id: string) => void;
  ultrasoundMilestones: UltrasoundMilestoneTrackingEntry[];
  onToggleUltrasoundMilestone: (id: string) => void;
}

export const TestsAndUltrasoundSection: React.FC<TestsAndUltrasoundSectionProps> = ({
  pregnancyTestTracking,
  onTogglePregnancyTest,
  ultrasoundMilestones,
  onToggleUltrasoundMilestone
}) => {
  const [activeTab, setActiveTab] = useState<'scans' | 'tests'>('scans');
  const [selectedTrimester, setSelectedTrimester] = useState<'all' | '1' | '2' | '3'>('all');

  const scans = [
    {
      id: 'scan-1',
      title: 'First Ultrasound: Dating & Viability Scan',
      timing: 'Weeks 6–10',
      trimester: 1,
      tag: 'First Ultrasound',
      purpose: 'Confirms intrauterine pregnancy, verifies embryonic cardiac activity, measures crown-rump length (CRL), and establishes an accurate clinical Estimated Due Date (EDD).',
      prep: 'Maintain a moderately full bladder for optimal transabdominal acoustic window.',
      icon: '🩺',
      highlight: true
    },
    {
      id: 'scan-2',
      title: 'Nuchal Translucency (NT) Scan',
      timing: 'Weeks 11–14',
      trimester: 1,
      tag: 'Aneuploidy Screen',
      purpose: 'Measures fluid collection behind the fetal neck alongside maternal serum markers (Dual Marker) to assess chromosomal risk non-invasively.',
      prep: 'Standard scan; wear comfortable two-piece attire.',
      icon: '🔍',
      highlight: false
    },
    {
      id: 'scan-3',
      title: 'Third Ultrasound: Level II Anomaly / Anatomy Scan',
      timing: 'Weeks 18–22',
      trimester: 2,
      tag: 'Third Ultrasound',
      purpose: 'Thorough, comprehensive structural examination of fetal anatomy including cranial structures, facial profile, four cardiac chambers, spine, stomach, kidneys, and umbilical vessels.',
      prep: 'Takes 30–45 minutes. A light snack beforehand can encourage active fetal repositioning.',
      icon: '🤍',
      highlight: true
    },
    {
      id: 'scan-4',
      title: 'Fourth Ultrasound: Late Gestation Growth & Wellbeing Scan',
      timing: 'Weeks 28–36',
      trimester: 3,
      tag: 'Fourth Ultrasound (Growth)',
      purpose: 'Evaluates fetal growth velocity, estimated fetal weight (EFW), amniotic fluid index (AFI), placental maturity, and umbilical artery Doppler blood flow patterns.',
      prep: 'Stay well hydrated. Non-invasive ultrasound assessing third-trimester vitality.',
      icon: '🌟',
      highlight: true
    },
    {
      id: 'scan-5',
      title: 'Fetal Presentation & Position Scan',
      timing: 'Weeks 36–38',
      trimester: 3,
      tag: 'Delivery Readiness',
      purpose: 'Verifies whether baby is in cephalic (head-down) presentation or breech, confirms placental distance from internal cervical os, and checks amniotic fluid.',
      prep: 'Brief scan to finalize delivery room planning with your obstetric team.',
      icon: '👶',
      highlight: false
    }
  ];

  const labTests = [
    {
      id: 'test-1',
      title: 'Complete Blood Count (CBC) & Hemoglobin',
      timing: 'Weeks 8–12 & repeat at 28 weeks',
      trimester: 1,
      purpose: 'Baseline evaluation of maternal red blood cells to screen for iron-deficiency anemia, white blood cells for subclinical infection, and platelets for clotting.',
      note: 'Crucial baseline for safe blood volume expansion during gestation.'
    },
    {
      id: 'test-2',
      title: 'Blood Grouping & Rh Factor',
      timing: 'Initial Prenatal Visit (Week 8–10)',
      trimester: 1,
      purpose: 'Identifies ABO blood type and Rh factor. If mother is Rh-negative and baby is Rh-positive, Anti-D prophylaxis is scheduled to protect future pregnancies.',
      note: 'Routine standard of care for maternal-fetal compatibility.'
    },
    {
      id: 'test-3',
      title: 'Thyroid Stimulating Hormone (TSH)',
      timing: 'Weeks 8–12',
      trimester: 1,
      purpose: 'Evaluates maternal thyroid function. Normal maternal thyroid hormone is critical for early fetal neurodevelopment before the fetal thyroid activates.',
      note: 'Dose adjustments made promptly by your OB-GYN if indicated.'
    },
    {
      id: 'test-4',
      title: 'Oral Glucose Tolerance Test (OGTT / GTT)',
      timing: 'Weeks 24–28',
      trimester: 2,
      purpose: 'Screens for gestational diabetes mellitus (GDM). Fasting blood draw followed by consumption of standard glucose beverage and interval blood draws.',
      note: 'Early lifestyle and dietary alignment ensures optimal maternal-fetal metabolism.'
    },
    {
      id: 'test-5',
      title: 'Group B Streptococcus (GBS) Screening',
      timing: 'Weeks 35–37',
      trimester: 3,
      purpose: 'Gentle swab to detect natural colonization of GBS bacteria. If positive, simple prophylactic IV antibiotics are administered during active labor.',
      note: 'Protects newborn from respiratory exposure during vaginal delivery.'
    },
    {
      id: 'test-6',
      title: 'Non-Stress Test (NST) / Cardiotocography',
      timing: 'Weeks 36+ (as advised)',
      trimester: 3,
      purpose: 'External monitoring belt placed over mother’s abdomen to record fetal heart rate acceleration in response to baby’s natural movements.',
      note: 'Reassuring evidence of healthy placenta and fetal oxygenation.'
    }
  ];

  const filteredScans = scans.filter(
    (s) => selectedTrimester === 'all' || s.trimester === Number(selectedTrimester)
  );

  const filteredTests = labTests.filter(
    (t) => selectedTrimester === 'all' || t.trimester === Number(selectedTrimester)
  );

  const initialTestIcons = ['🧪', '🩸', '🧬', '🛡️', '🔬', '🧫', '🦋', '🧪', '🧫', '⚖️'];
  const milestoneIcons = ['✦', '◌', '◈', '✧'];
  const recordedTests = pregnancyTestTracking.filter((test) => test.status === 'recorded').length;
  const recordedMilestones = ultrasoundMilestones.filter((milestone) => milestone.status === 'recorded').length;

  const statusPill = (recorded: boolean) => (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-black ${
        recorded
          ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
          : 'border-[#E2ECF7] bg-[#F8FAFD] text-[#8F9EB3]'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${recorded ? 'bg-[#22C55E]' : 'bg-[#CBD5E1]'}`} />
      {recorded ? 'Recorded' : 'Not recorded'}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* Informative Header Banner (Baby Pink & Baby Blue Blend) */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF0F5] via-white to-[#F0F8FF] border border-[#E2ECF7] shadow-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-white text-xs border border-[#FBCFE8] shadow-xs">🔬</span>
          <h2 className="text-xs font-black text-[#192231] tracking-tight">
            Tests & Ultrasound Guide
          </h2>
        </div>
        <p className="text-[11px] text-[#5A677D] leading-relaxed">
          Clinician-approved educational schedule of vital antenatal sonograms and laboratory evaluations throughout each trimester.
        </p>
      </div>

      {/* Main Mode Toggle: Scans vs Lab Tests */}
      <div className="flex items-center gap-2 p-1 bg-white border border-[#E8EFF7] rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('scans')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'scans'
              ? 'bg-[#38BDF8] text-white shadow-xs'
              : 'text-[#7A8B9E] hover:text-[#192231] hover:bg-[#F3F8FE]'
          }`}
        >
          <span>🩺</span>
          <span>Ultrasound Scans (5)</span>
        </button>
        <button
          onClick={() => setActiveTab('tests')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'tests'
              ? 'bg-[#EA81AA] text-white shadow-xs'
              : 'text-[#7A8B9E] hover:text-[#192231] hover:bg-[#FDF2F7]'
          }`}
        >
          <span>🧪</span>
          <span>Laboratory Tests (6)</span>
        </button>
      </div>

      {/* Trimester Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { id: 'all', label: 'All Trimesters' },
          { id: '1', label: 'Trimester 1 (Weeks 1–12)' },
          { id: '2', label: 'Trimester 2 (Weeks 13–27)' },
          { id: '3', label: 'Trimester 3 (Weeks 28–40+)' }
        ].map((chip) => (
          <button
            key={chip.id}
            onClick={() => setSelectedTrimester(chip.id as any)}
            className={`px-3 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedTrimester === chip.id
                ? 'bg-[#192231] text-white shadow-xs'
                : 'bg-white text-[#7A8B9E] border border-[#E8EFF7] hover:border-[#6FAFED]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ── ULTRASOUND SCANS LIST ── */}
      {activeTab === 'scans' && (
        <div className="space-y-3">
          <section className="relative overflow-hidden rounded-3xl border border-[#E2ECF7] bg-gradient-to-br from-[#FFF5F8] via-white to-[#F0F7FF] p-4 shadow-xs">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[#FCE7F3] blur-3xl opacity-70" />
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-[#BAE6FD] bg-white p-1.5 text-sm shadow-xs">✦</span>
                  <h3 className="text-sm font-black tracking-tight text-[#192231]">Ultrasound &amp; Scan Journey</h3>
                </div>
                <p className="mt-1 text-[10px] leading-relaxed text-[#5A677D]">
                  A simple place to keep track of the scan milestones in your pregnancy journey.
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-[#BAE6FD] bg-white px-2.5 py-1 text-[10px] font-black text-[#0284C7]">
                {recordedMilestones}/{ultrasoundMilestones.length}
              </span>
            </div>

            <div className="relative z-10 mt-4 space-y-3 pl-1">
              <div className="absolute bottom-7 left-[15px] top-3 w-0.5 origin-top animate-timeline-draw bg-gradient-to-b from-[#EA81AA] via-[#6FAFED] to-[#CBD5E1]" />
              {ultrasoundMilestones.map((milestone, index) => {
                const isRecorded = milestone.status === 'recorded';
                return (
                  <article key={milestone.id} className="relative flex gap-3 animate-fade-slide-up" style={{ animationDelay: `${index * 90}ms` }}>
                    <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white text-xs font-black transition-all duration-300 ${isRecorded ? 'border-[#22C55E] text-[#16A34A] shadow-[0_0_0_4px_rgba(34,197,94,0.10)]' : index === 0 ? 'border-[#EA81AA] text-[#DB2777] shadow-[0_0_0_4px_rgba(234,129,170,0.12)]' : 'border-[#BAE6FD] text-[#0284C7]'}`}>
                      {isRecorded ? '✓' : milestoneIcons[index]}
                    </div>
                    <div className={`min-w-0 flex-1 rounded-2xl border p-3 transition-all duration-300 ${isRecorded ? 'border-[#BBF7D0] bg-[#F7FEF9]' : 'border-[#E8EFF7] bg-white/80 hover:-translate-y-0.5 hover:border-[#BAE6FD]'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#6FAFED]">{milestone.timing}</span>
                          <h4 className="mt-0.5 text-xs font-black text-[#192231]">{milestone.title}</h4>
                        </div>
                        <span className="text-base">{milestoneIcons[index]}</span>
                      </div>
                      {milestone.description && <p className="mt-1.5 text-[10px] leading-relaxed text-[#5A677D]">{milestone.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#F0F4FA] pt-2">
                        {statusPill(isRecorded)}
                        <button
                          onClick={() => onToggleUltrasoundMilestone(milestone.id)}
                          className={`rounded-full px-3 py-1 text-[10px] font-black transition-all active:scale-95 ${isRecorded ? 'border border-[#BBF7D0] bg-white text-[#15803D]' : 'bg-[#192231] text-white shadow-xs hover:bg-[#2D3748]'}`}
                        >
                          {isRecorded ? 'Mark not recorded' : 'Mark as recorded'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <div className="flex items-center justify-between px-1 pt-1">
            <h3 className="text-xs font-black text-[#192231]">Existing scan guide</h3>
            <span className="text-[10px] font-bold text-[#8F9EB3]">Educational reference</span>
          </div>
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className={`p-4 rounded-3xl border transition-all shadow-xs space-y-2 ${
                scan.highlight
                  ? 'bg-gradient-to-br from-white via-[#FDF9FB] to-[#F2F7FD] border-[#CBD5E1] ring-1 ring-[#EA81AA]/20'
                  : 'bg-white border-[#E8EFF7]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                      {scan.timing}
                    </span>
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#FDF2F7] text-[#DB2777] border border-[#FCE7F3]">
                      {scan.tag}
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-[#192231] tracking-tight pt-1">
                    {scan.title}
                  </h3>
                </div>
                <span className="text-lg p-1.5 rounded-2xl bg-[#FAFBFD] border border-[#E8EFF7]">
                  {scan.icon}
                </span>
              </div>

              <p className="text-[11px] text-[#5A677D] leading-relaxed">
                {scan.purpose}
              </p>

              <div className="pt-2 border-t border-[#F0F4FA] flex items-center justify-between text-[10px]">
                <span className="text-[#8F9EB3] font-medium">Preparation:</span>
                <span className="font-semibold text-[#192231] text-right">{scan.prep}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LABORATORY TESTS LIST ── */}
      {activeTab === 'tests' && (
        <div className="space-y-3">
          <section className="rounded-3xl border border-[#FBCFE8] bg-gradient-to-br from-[#FFF5F8] via-white to-[#F8FAFD] p-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl border border-[#FBCFE8] bg-white p-1.5 text-sm shadow-xs">🧪</span>
                  <h3 className="text-sm font-black tracking-tight text-[#192231]">Initial Pregnancy Tests</h3>
                </div>
                <p className="mt-1 text-[10px] text-[#5A677D]">Keep a simple record of your early pregnancy checks.</p>
              </div>
              <span className="shrink-0 rounded-full border border-[#FBCFE8] bg-white px-2.5 py-1 text-[10px] font-black text-[#DB2777]">
                {recordedTests}/{pregnancyTestTracking.length}
              </span>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {pregnancyTestTracking.map((test, index) => {
                const isRecorded = test.status === 'recorded';
                return (
                  <div key={test.id} className={`rounded-2xl border p-3 transition-all duration-300 animate-fade-slide-up ${isRecorded ? 'border-[#BBF7D0] bg-[#F7FEF9]' : 'border-[#E8EFF7] bg-white hover:-translate-y-0.5 hover:border-[#F9A8D4]'}`} style={{ animationDelay: `${index * 45}ms` }}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FDF2F7] text-sm">{initialTestIcons[index]}</span>
                        <h4 className="text-xs font-black text-[#192231]">{test.name}</h4>
                      </div>
                      {statusPill(isRecorded)}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#F0F4FA] pt-2">
                      <span className="text-[10px] text-[#8F9EB3]">Initial pregnancy test</span>
                      <button
                        onClick={() => onTogglePregnancyTest(test.id)}
                        className={`rounded-full px-3 py-1 text-[10px] font-black transition-all active:scale-95 ${isRecorded ? 'border border-[#BBF7D0] bg-white text-[#15803D]' : 'bg-[#192231] text-white shadow-xs hover:bg-[#2D3748]'}`}
                      >
                        {isRecorded ? 'Undo' : 'Mark as recorded'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex items-center justify-between px-1 pt-1">
            <h3 className="text-xs font-black text-[#192231]">Existing laboratory guide</h3>
            <span className="text-[10px] font-bold text-[#8F9EB3]">Educational reference</span>
          </div>
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="p-4 rounded-3xl bg-white border border-[#E8EFF7] shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FDF2F7] text-[#DB2777] border border-[#FCE7F3]">
                    {test.timing}
                  </span>
                  <h3 className="text-xs font-black text-[#192231] tracking-tight pt-1">
                    {test.title}
                  </h3>
                </div>
                <span className="text-xs font-bold text-[#6FAFED] bg-[#F0F7FF] px-2 py-0.5 rounded-full">
                  T{test.trimester}
                </span>
              </div>

              <p className="text-[11px] text-[#5A677D] leading-relaxed">
                {test.purpose}
              </p>

              <div className="p-2 rounded-xl bg-[#FAFBFD] border border-[#EBF1F9] text-[10px] text-[#6FAFED] font-medium">
                💡 Clinical context: {test.note}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clinical Disclaimer */}
      <div className="p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2ECF7] text-[10px] text-[#8F9EB3] text-center leading-normal">
        Educational overview only. Clinical schedules may vary based on your individual health history and attending obstetrician’s protocols.
      </div>
    </div>
  );
};

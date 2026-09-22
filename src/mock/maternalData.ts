import {
  FetalDevelopmentWeek,
  UltrasoundStageInfo,
  GovernmentSchemeInfo,
  MedicalRecordItem,
  PrenatalVisit,
  ChecklistItem,
  TrimesterVisualExperience,
  PregnancyTestTrackingEntry,
  UltrasoundMilestoneTrackingEntry
} from '../types';

export const initialPregnancyTestTracking: PregnancyTestTrackingEntry[] = [
  { id: 'initial-urine', name: 'Urine Pregnancy Test', status: 'not_recorded' },
  { id: 'initial-blood-grouping', name: 'Blood Grouping', status: 'not_recorded' },
  { id: 'initial-hemoglobin', name: 'Hemoglobin', status: 'not_recorded' },
  { id: 'initial-hiv', name: 'HIV / ICTC', status: 'not_recorded' },
  { id: 'initial-hcv', name: 'HCV', status: 'not_recorded' },
  { id: 'initial-hbsag', name: 'HBsAg', status: 'not_recorded' },
  { id: 'initial-tsh', name: 'Serum TSH', status: 'not_recorded' },
  { id: 'initial-rbs', name: 'RBS', status: 'not_recorded' },
  { id: 'initial-urine-routine', name: 'Urine Routine / Microscopy', status: 'not_recorded' },
  { id: 'initial-weight', name: 'Weight of Pregnant Mother', status: 'not_recorded' }
];

export const initialUltrasoundMilestones: UltrasoundMilestoneTrackingEntry[] = [
  {
    id: 'milestone-first-usg',
    title: 'USG — 1st Scan',
    timing: 'After the first missed period and a positive urine pregnancy test',
    status: 'not_recorded'
  },
  {
    id: 'milestone-nt',
    title: 'Nuchal Translucency Test',
    timing: 'Around 11–14 weeks',
    description: 'Used to assess for chromosomal abnormalities such as Down syndrome.',
    status: 'not_recorded'
  },
  {
    id: 'milestone-level-ii',
    title: 'Level II Scan',
    timing: 'Around 18–20 weeks',
    description: 'Used to assess fetal anatomy, amniotic fluid index, and placental abnormalities/localization.',
    status: 'not_recorded'
  },
  {
    id: 'milestone-growth',
    title: 'Growth Scan',
    timing: 'Around 34 weeks',
    description: 'Provides an estimated fetal weight and information about placental localization.',
    status: 'not_recorded'
  }
];

export const mockWeekData: Record<number, FetalDevelopmentWeek> = {
  4: {
    week: 4,
    trimester: 1,
    fruitMetaphor: 'Poppy Seed',
    fruitIllustrationUrl: '🌱',
    approxLengthCm: 0.1,
    approxWeightGrams: 0.1,
    developmentalMilestone: 'Blastocyst implants into the uterine lining. The amniotic sac and early placenta begin to form.',
    maternalBodyChanges: 'Early hormonal shifts (hCG) begin. Mild fatigue and heightened sense of smell may be noticed.'
  },
  8: {
    week: 8,
    trimester: 1,
    fruitMetaphor: 'Kidney Bean',
    fruitIllustrationUrl: '🫘',
    approxLengthCm: 1.6,
    approxWeightGrams: 1.0,
    developmentalMilestone: 'Webbed fingers and toes start forming. Tiny neural pathways branch as brain hemispheres develop.',
    maternalBodyChanges: 'Uterine blood volume expands. Mild morning nausea and tender breast tissue are common.'
  },
  12: {
    week: 12,
    trimester: 1,
    fruitMetaphor: 'Plum',
    fruitIllustrationUrl: '🫐',
    approxLengthCm: 5.4,
    approxWeightGrams: 14.0,
    developmentalMilestone: 'Reflexes begin; fingers can curl and eyelids are fused closed for retinal protection.',
    maternalBodyChanges: 'Uterus ascends above the pubic bone. Early nausea often begins to soften toward second trimester.'
  },
  16: {
    week: 16,
    trimester: 2,
    fruitMetaphor: 'Avocado',
    fruitIllustrationUrl: '🥑',
    approxLengthCm: 11.6,
    approxWeightGrams: 100.0,
    developmentalMilestone: 'Facial muscles practice subtle expressions. The circulatory system pumps about 25 quarts of blood per day.',
    maternalBodyChanges: 'Energy resurgence often arrives. Gentle skin pigmentation changes (linea nigra) may appear.'
  },
  20: {
    week: 20,
    trimester: 2,
    fruitMetaphor: 'Banana',
    fruitIllustrationUrl: '🍌',
    approxLengthCm: 25.6,
    approxWeightGrams: 300.0,
    developmentalMilestone: 'Vernix caseosa and lanugo protect baby’s delicate skin. Inner ear hearing bones allow perceiving your voice.',
    maternalBodyChanges: 'Uterine fundus reaches the navel. Subtle butterfly flutters (quickening) may become unmistakable.'
  },
  24: {
    week: 24,
    trimester: 2,
    fruitMetaphor: 'Cantaloupe Melon',
    fruitIllustrationUrl: '🍈',
    approxLengthCm: 30.0,
    approxWeightGrams: 600.0,
    developmentalMilestone: 'Inner ear vestibular structures are completely formed; baby responds to movement and maternal heartbeat rhythms.',
    maternalBodyChanges: 'Uterus is situated approximately 2 inches above the navel as baby’s growth accelerates.'
  },
  28: {
    week: 28,
    trimester: 3,
    fruitMetaphor: 'Large Eggplant',
    fruitIllustrationUrl: '🍆',
    approxLengthCm: 37.6,
    approxWeightGrams: 1005.0,
    developmentalMilestone: 'Eyelids can open and blink. Rapid eye movement (REM) cycles initiate during resting periods.',
    maternalBodyChanges: 'Third trimester begins. Occasional mild Braxton Hicks contractions and lower back strain may be felt.'
  },
  32: {
    week: 32,
    trimester: 3,
    fruitMetaphor: 'Jicama',
    fruitIllustrationUrl: '🥔',
    approxLengthCm: 42.4,
    approxWeightGrams: 1700.0,
    developmentalMilestone: 'Skeletal bones are fully formed but remain soft and pliable. Subcutaneous fat smooths out baby’s skin.',
    maternalBodyChanges: 'Diaphragm compression may cause slight shortness of breath with physical exertion.'
  },
  36: {
    week: 36,
    trimester: 3,
    fruitMetaphor: 'Honeydew Melon',
    fruitIllustrationUrl: '🍈',
    approxLengthCm: 47.4,
    approxWeightGrams: 2600.0,
    developmentalMilestone: 'Pulmonary alveoli synthesize vital surfactant. Most babies transition into the head-down cephalic position.',
    maternalBodyChanges: 'Pelvic fullness increases as baby engages downward. Frequent bathroom visits are standard.'
  },
  40: {
    week: 40,
    trimester: 3,
    fruitMetaphor: 'Small Watermelon',
    fruitIllustrationUrl: '🍉',
    approxLengthCm: 51.2,
    approxWeightGrams: 3400.0,
    developmentalMilestone: 'Full term maturity achieved. Skull sutures remain flexible to ease passage through the birth canal.',
    maternalBodyChanges: 'Cervical softening and maternal nesting instincts heighten in anticipation of delivery.'
  }
};

export const ultrasoundScheduleData: UltrasoundStageInfo[] = [
  {
    stageNumber: 'First Ultrasound',
    title: 'Dating & Early Viability Scan',
    timingWindow: 'Typically conducted between Weeks 6–10 (timing determined by your OB-GYN)',
    clinicalPurpose: 'Confirms intrauterine pregnancy, identifies heartbeat activity, and calculates gestational age/estimated due date.',
    whatToExpect: 'An ultrasound probe (transabdominal or transvaginal) uses sound waves to image the gestational sac and early embryo.',
    disclaimer: 'Provider scheduling may vary based on your individual medical history.'
  },
  {
    stageNumber: 'Third Ultrasound',
    title: 'Mid-Pregnancy Fetal Anatomy Evaluation',
    timingWindow: 'Typically scheduled between Weeks 18–22 (or provider-specified window)',
    clinicalPurpose: 'Detailed structural assessment of baby’s organs, spine, limbs, amniotic fluid volume, and placental placement.',
    whatToExpect: 'A comprehensive 30–45 minute transabdominal scan examining fetal anatomical progression.',
    disclaimer: 'Detailed clinical readings are conducted and interpreted solely by your certified radiologist/sonologist.'
  },
  {
    stageNumber: 'Fourth Ultrasound',
    title: 'Late Gestation Growth & Biophysical Assessment',
    timingWindow: 'Typically conducted between Weeks 28–36 (subject to OB-GYN assessment)',
    clinicalPurpose: 'Assesses fetal growth trajectory, presentation (head down or breech), fluid index, and placental health.',
    whatToExpect: 'Evaluation of fetal position and biometric parameters to help your care team plan third-trimester care.',
    disclaimer: 'Follows individual clinician guidance; not every low-risk pregnancy requires identical third-trimester scanning frequencies.'
  }
];

export const initialMockRecords: MedicalRecordItem[] = [
  {
    id: 'rec-1',
    name: 'Early_Dating_USG_Report.pdf',
    folder: 'first_trimester',
    date: '12 May 2026',
    fileType: 'pdf',
    fileSize: '1.8 MB'
  },
  {
    id: 'rec-2',
    name: 'CBC_Ferritin_Panel.pdf',
    folder: 'first_trimester',
    date: '18 May 2026',
    fileType: 'pdf',
    fileSize: '420 KB'
  },
  {
    id: 'rec-3',
    name: 'Anatomy_Scan_Still.jpg',
    folder: 'second_trimester',
    date: '28 Jul 2026',
    fileType: 'gallery',
    fileSize: '2.4 MB'
  },
  {
    id: 'rec-4',
    name: 'Glucose_Screening_Result.pdf',
    folder: 'second_trimester',
    date: '10 Aug 2026',
    fileType: 'pdf',
    fileSize: '680 KB'
  }
];

export const governmentSchemesData: GovernmentSchemeInfo[] = [
  {
    id: 'scheme-1',
    schemeName: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
    authority: 'Ministry of Women & Child Development (Central)',
    objective: 'Maternity cash benefit conditional on institutional registration, early antenatal visits, and approved check-ups.',
    keyBenefits: [
      'Direct cash transfer assistance across pregnancy milestones',
      'Encourages proper clinical nutrition and structured rest'
    ],
    documentationChecklist: [
      'Mother and Child Protection (MCP) Card copy',
      'Identity proof (Aadhaar / National ID)',
      'Bank passbook linked with identification'
    ]
  },
  {
    id: 'scheme-2',
    schemeName: 'Janani Suraksha Yojana (JSY)',
    authority: 'National Health Mission',
    objective: 'Safe motherhood intervention promoting institutional delivery in public and accredited health facilities.',
    keyBenefits: [
      'Cash assistance associated with delivery care in registered clinics',
      'Transport assistance support in designated community clusters'
    ],
    documentationChecklist: [
      'MCP card stamped by health center/hospital',
      'Registration with local primary healthcare provider (ASHA/ANM)'
    ]
  },
  {
    id: 'scheme-3',
    schemeName: 'Surakshit Matritva Aashwasan (SUMAN)',
    authority: 'Ministry of Health and Family Welfare',
    objective: 'Provides assured, dignified, respectful, and zero-cost quality healthcare for all pregnant women visiting public facilities.',
    keyBenefits: [
      'Zero-cost prenatal check-ups, iron-folic acid supplementation, and diagnostics',
      'Free transport to and from healthcare facilities'
    ],
    documentationChecklist: [
      'MCP Card / Hospital Registration Slip'
    ]
  }
];

export const initialVisits: PrenatalVisit[] = [
  {
    id: 'v-24',
    weekDue: 24,
    title: 'Routine 24-Week Follow-up & Glucose Screening',
    description: 'Fundal height assessment, routine blood pressure check, and glucose tolerance screen.',
    completed: true,
    scheduledDate: '2026-09-12',
    doctorQuestions: ['Normal baseline blood pressure expectations?', 'Safe lower back stretches during sleep?']
  },
  {
    id: 'v-28',
    weekDue: 28,
    title: 'Third Trimester Check-in & Rh Factor Review',
    description: 'Gestational growth curve review, Rh immunoglobulin review if indicated, and kick count routine coaching.',
    completed: false,
    scheduledDate: '2026-10-04',
    doctorQuestions: ['What is the expected movement frequency pattern at 28 weeks?']
  },
  {
    id: 'v-32',
    weekDue: 32,
    title: '32-Week Growth Scan',
    description: 'Ultrasound check for fetal positioning, placental maturity, and amniotic fluid index.',
    completed: false,
    scheduledDate: '2026-11-01',
    doctorQuestions: []
  }
];

export const initialHospitalBag: ChecklistItem[] = [
  { id: 'hb-1', label: 'Identity card, health insurance documents & birth plan folder', completed: true, category: 'documents' },
  { id: 'hb-2', label: 'Comfortable maternity robe & non-slip warm socks', completed: true, category: 'mum' },
  { id: 'hb-3', label: 'Lip balm, electrolyte powders, and hair ties', completed: false, category: 'mum' },
  { id: 'hb-4', label: 'Extra-long phone charging cables', completed: false, category: 'partner' },
  { id: 'hb-5', label: 'Newborn going-home outfit & organic cotton swaddles', completed: false, category: 'baby' },
  { id: 'hb-6', label: 'Infant car seat safely installed in vehicle', completed: false, category: 'baby' }
];

export const trimesterVisualConfigs: Record<number, TrimesterVisualExperience> = {
  1: {
    id: 'first_trimester',
    trimesterNumber: 1,
    weekRangeText: 'Weeks 1–12',
    title: 'Embryonic Genesis & Foundational Anatomy',
    colorPalette: {
      primaryGlow: 'rgba(234, 129, 170, 0.28)',   // Soft maternal blush
      secondaryGlow: 'rgba(111, 175, 237, 0.28)', // Powder blue
      canvasAmbient: 'linear-gradient(160deg, #FAF4F8 0%, #FFFFFF 50%, #F1F6FD 100%)',
      particleTint: '#EA81AA'
    },
    subStages: [
      {
        week: 4,
        label: 'Week 2–4',
        milestoneTitle: 'Blastocyst Implantation',
        fetalAnatomyFocus: 'Zygote transitions to a microscopic blastocyst, attaching securely into the nutrient-rich endometrium.',
        approxDimensions: '< 1 mm • Microscopic cellular cluster'
      },
      {
        week: 6,
        label: 'Week 6',
        milestoneTitle: 'Neural Tube & Cardiac Pulsation',
        fetalAnatomyFocus: 'The foundational neural groove closes; early cardiac tubular cells initiate rhythmic contractions.',
        approxDimensions: '4–6 mm • Lentil size'
      },
      {
        week: 8,
        label: 'Week 8',
        milestoneTitle: 'Limb Budding & Organogenesis',
        fetalAnatomyFocus: 'Paddle-shaped extremity buds differentiate into fingers; major digestive and sensory foundations establish.',
        approxDimensions: '1.6 cm • Kidney bean size'
      },
      {
        week: 12,
        label: 'Week 12',
        milestoneTitle: 'Embryo to Fetus Transition',
        fetalAnatomyFocus: 'Eyelids fuse to protect developing retinas; miniature vocal cords form, and reflex movement begins.',
        approxDimensions: '5.4 cm • Plum size'
      }
    ],
    mediaAsset: {
      videoUrl: '/animations/fetal-development.mp4', 
      posterPlaceholder: '/animations/fetal-development-still.jpg',
      description: 'Soft luminous 3D embryonic cellular visualization showing neural fold closure and early development.'
    }
  },

  2: {
    id: 'second_trimester',
    trimesterNumber: 2,
    weekRangeText: 'Weeks 13–27',
    title: 'Growth, Facial Sculpting & Sensory Genesis',
    colorPalette: {
      primaryGlow: 'rgba(234, 129, 170, 0.28)',
      secondaryGlow: 'rgba(111, 175, 237, 0.32)',
      canvasAmbient: 'linear-gradient(160deg, #F9F3F9 0%, #FFFFFF 50%, #EBF4FE 100%)',
      particleTint: '#6FAFED'
    },
    subStages: [
      {
        week: 16,
        label: 'Week 16',
        milestoneTitle: 'Facial Definition & Light Sensitivity',
        fetalAnatomyFocus: 'Facial muscles practice subtle expressions; retinas can faintly detect light shifts through the abdominal wall.',
        approxDimensions: '11.6 cm • Avocado size'
      },
      {
        week: 20,
        label: 'Week 20',
        milestoneTitle: 'Vernix Coating & Auditory Reception',
        fetalAnatomyFocus: 'A delicate vernix protective film shields the epidermis; auditory ossicles harden to register maternal voice and pulse.',
        approxDimensions: '25.6 cm • Banana size'
      },
      {
        week: 24,
        label: 'Week 24',
        milestoneTitle: 'Inner Ear Equilibrium & Quickening',
        fetalAnatomyFocus: 'Vestibular system achieves balance awareness; distinct active movement and relaxation cycles emerge.',
        approxDimensions: '30.0 cm • Active Sensory Stage'
      }
    ],
    mediaAsset: {
      videoUrl: '/animations/fetal-development.mp4',
      posterPlaceholder: '/animations/fetal-development-still.jpg',
      description: 'Serene 3D fetal render floating in calm amniotic fluid with soft blue and pink volumetric rim lighting.'
    }
  },

  3: {
    id: 'third_trimester',
    trimesterNumber: 3,
    weekRangeText: 'Weeks 28–40+',
    title: 'Maturation, Neural Density & Birth Readiness',
    colorPalette: {
      primaryGlow: 'rgba(234, 129, 170, 0.30)',
      secondaryGlow: 'rgba(111, 175, 237, 0.26)',
      canvasAmbient: 'linear-gradient(160deg, #FBF4F7 0%, #FFFFFF 50%, #EDF5FE 100%)',
      particleTint: '#D8A657'
    },
    subStages: [
      {
        week: 28,
        label: 'Week 28',
        milestoneTitle: 'Eyelid Opening & REM Brainwaves',
        fetalAnatomyFocus: 'Eyelids unfurl; sleep telemetry patterns indicate active rapid eye movement (REM) cycles.',
        approxDimensions: '37.6 cm • Eggplant size'
      },
      {
        week: 32,
        label: 'Week 32',
        milestoneTitle: 'Adipose Smoothing & Bone Mineralization',
        fetalAnatomyFocus: 'Subcutaneous adipose reserves accumulate, softening skin folds; maternal calcium rapidly deposits into the fetal skeleton.',
        approxDimensions: '42.4 cm • Jicama size'
      },
      {
        week: 36,
        label: 'Week 36',
        milestoneTitle: 'Alveolar Expansion & Full Maturity',
        fetalAnatomyFocus: 'Lungs synthesize vital pulmonary surfactant; baby moves into the pelvic resting position.',
        approxDimensions: '47.4 cm • Honeydew size'
      }
    ],
    mediaAsset: {
      videoUrl: '/animations/fetal-development.mp4',
      posterPlaceholder: '/animations/fetal-development-still.jpg',
      description: 'Full-term tranquil 3D maternal visualization, displaying subtle chest rise and peaceful curled resting posture.'
    }
  }
};

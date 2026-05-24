// BioMed Hub — Curriculum data
// Source: B.E. Biomedical Engineering, Regulation 2021 (R2021),
// KPR Institute of Engineering and Technology, Coimbatore.
//
// Subjects are grouped by semester (I–VIII). Categories follow AICTE/CBCS:
//   BSC  – Basic Science Course
//   ESC  – Engineering Science Course
//   HSMC – Humanities, Social Sciences & Management Course
//   PCC  – Professional Core Course (biomed-specific)
//   PEC  – Professional Elective Course
//   OEC  – Open Elective Course
//   MNC  – Mandatory Non-Credit Course
//   EEC  – Employability Enhancement Course

export const SEM_LABEL = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];

// Year ↔ Semester mapping
export const YEARS = [
  { y: 1, label: 'Year 1', sems: [1, 2], blurb: 'Foundation in mathematics, sciences, electronics, programming and engineering basics.' },
  { y: 2, label: 'Year 2', sems: [3, 4], blurb: 'Core biomedical engineering begins — anatomy, biomaterials, sensors and signals.' },
  { y: 3, label: 'Year 3', sems: [5, 6], blurb: 'Specialised systems — microcontrollers, biosignal processing, diagnostic equipment.' },
  { y: 4, label: 'Year 4', sems: [7, 8], blurb: 'Imaging, rehabilitation, electives and the final-year project.' },
];

export const CATEGORY_META = {
  BSC:  { color: '#60a5fa', label: 'Basic Science' },
  ESC:  { color: '#22d3ee', label: 'Eng. Science' },
  HSMC: { color: '#fbbf24', label: 'Humanities' },
  PCC:  { color: '#a78bfa', label: 'Professional Core' },
  PEC:  { color: '#f472b6', label: 'Prof. Elective' },
  OEC:  { color: '#34d399', label: 'Open Elective' },
  MNC:  { color: '#9aa6bd', label: 'Mandatory' },
  EEC:  { color: '#fb7185', label: 'Project / EEC' },
};

export const SUBJECTS = [
  // ---------- SEMESTER I ----------
  { id: 'U21MA101', sem: 1, name: 'Calculus and Differential Equations',     category: 'BSC',  credits: 4, type: 'Theory',
    blurb: 'Limits, continuity, differential and integral calculus, ODEs — the mathematical backbone of engineering.' },
  { id: 'U21EEG01', sem: 1, name: 'Basics of Electrical and Electronics Engineering', category: 'ESC', credits: 3, type: 'Theory',
    blurb: 'DC/AC circuits, networks, transformers, machines, and semiconductor fundamentals.' },
  { id: 'U21EN101', sem: 1, name: 'English for Technologists',               category: 'HSMC', credits: 2, type: 'Theory + Lab',
    blurb: 'Technical English — listening, speaking, reading, writing and presentation skills.' },
  { id: 'U21PH101', sem: 1, name: 'Engineering Physics',                     category: 'BSC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Mechanics of solids, properties of matter, lasers, fibre optics and quantum essentials.' },
  { id: 'U21CY101', sem: 1, name: 'Engineering Chemistry',                   category: 'BSC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Water technology, electrochemistry, corrosion, polymers and instrumental analysis.' },
  { id: 'U21CSG01', sem: 1, name: 'Problem Solving and C Programming',       category: 'ESC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Algorithmic thinking, control flow, functions, arrays, pointers and structures in C.' },
  { id: 'U21MEG01', sem: 1, name: 'Engineering Graphics',                    category: 'ESC',  credits: 2, type: 'Lab',
    blurb: 'Projections, sections, isometric and orthographic views with hand & CAD drawings.' },
  { id: 'U21MYC01', sem: 1, name: 'Induction Program',                       category: 'MNC',  credits: 0, type: 'Mandatory',
    blurb: 'Three-week induction — orientation, mentor sessions, lectures and creative activities.' },

  // ---------- SEMESTER II ----------
  { id: 'U21MA202', sem: 2, name: 'Transforms and its Applications',         category: 'BSC',  credits: 3, type: 'Theory',
    blurb: 'Laplace, Fourier and Z transforms — tools you’ll re-use in signals, control and instrumentation.' },
  { id: 'U21PH202', sem: 2, name: 'Medical Physics',                         category: 'BSC',  credits: 3, type: 'Theory',
    blurb: 'Physics of the human body — radiation, ultrasound, lasers and physical principles behind imaging.' },
  { id: 'U21BM201', sem: 2, name: 'Linear Integrated Circuits',              category: 'ESC',  credits: 3, type: 'Theory',
    blurb: 'Op-amps, active filters, oscillators, timers, ADC/DAC and 555 timer-based circuits.' },
  { id: 'U21EN201', sem: 2, name: 'Personality Enhancement',                 category: 'HSMC', credits: 2, type: 'Theory + Lab',
    blurb: 'Soft skills — interpersonal, group dynamics, leadership and professional communication.' },
  { id: 'U21CSG02', sem: 2, name: 'Python Programming',                      category: 'ESC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Pythonic problem solving — data structures, files, NumPy/pandas hints for biomedical data.' },
  { id: 'U21CY201', sem: 2, name: 'Fundamentals of Biochemistry',            category: 'BSC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Carbs, lipids, proteins, nucleic acids, enzymes, metabolism and clinical biochemistry essentials.' },
  { id: 'U21BM202', sem: 2, name: 'Linear Integrated Circuits Laboratory',   category: 'ESC',  credits: 2, type: 'Lab',
    blurb: 'Hands-on op-amp circuits, filters, oscillators and waveform generators.' },
  { id: 'U21MEG02', sem: 2, name: 'Manufacturing Practices',                 category: 'ESC',  credits: 2, type: 'Lab',
    blurb: 'Carpentry, fitting, welding, machining — get a feel for how things are made.' },
  { id: 'U21MYC02', sem: 2, name: 'Environmental Sciences',                  category: 'MNC',  credits: 0, type: 'Mandatory',
    blurb: 'Ecosystems, biodiversity, pollution and sustainable development.' },

  // ---------- SEMESTER III ----------
  { id: 'U21MA302', sem: 3, name: 'Linear Algebra and Complex Analysis',     category: 'BSC',  credits: 4, type: 'Theory',
    blurb: 'Matrices, vector spaces, eigenvalues, complex functions — used everywhere from imaging to control.' },
  { id: 'U21BM301', sem: 3, name: 'Human Anatomy and Physiology',            category: 'PCC',  credits: 3, type: 'Theory',
    blurb: 'Structural and functional organisation of the body — cells, tissues and major organ systems.' },
  { id: 'U21BM303', sem: 3, name: 'Biomaterials and Artificial Organs',      category: 'PCC',  credits: 3, type: 'Theory',
    blurb: 'Metals, ceramics, polymers and composites in implants; design of artificial organs.' },
  { id: 'U21ECG01', sem: 3, name: 'Digital Electronics',                     category: 'ESC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Combinational and sequential logic, flip-flops, counters, memories and HDL basics.' },
  { id: 'U21CSG03', sem: 3, name: 'Data Structures',                         category: 'ESC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Stacks, queues, linked lists, trees, hash tables and basic algorithm analysis.' },
  { id: 'U21BM302', sem: 3, name: 'Biomedical Sensors and Instrumentation',  category: 'PCC',  credits: 4, type: 'Theory + Project',
    blurb: 'Bioelectric signals, transducers, biopotential amplifiers, electrodes and patient safety.' },
  { id: 'U21BM304', sem: 3, name: 'Biomedical Sensors and Instrumentation Laboratory', category: 'PCC', credits: 2, type: 'Lab',
    blurb: 'Hands-on ECG, EMG, EEG acquisition, amplifier design and calibration of biomedical sensors.' },
  { id: 'U21BM305', sem: 3, name: 'Human Anatomy and Physiology Laboratory', category: 'PCC',  credits: 2, type: 'Lab',
    blurb: 'Microscopy, spirometry, blood pressure, ECG recording and physiological measurement practicals.' },
  { id: 'U21MYC03', sem: 3, name: 'Essence of Indian Traditional Knowledge', category: 'MNC',  credits: 0, type: 'Mandatory',
    blurb: 'Indian knowledge systems — science, technology, medicine and culture.' },

  // ---------- SEMESTER IV ----------
  { id: 'U21MA406', sem: 4, name: 'Probability and Stochastic Processes',    category: 'BSC',  credits: 3, type: 'Theory',
    blurb: 'Probability, random variables, distributions and Markov processes — foundation for biosignal analysis.' },
  { id: 'U21BM401', sem: 4, name: 'Microbiology and Pathology',              category: 'PCC',  credits: 3, type: 'Theory',
    blurb: 'Bacteria, virology, immunology, infection, inflammation and disease processes.' },
  { id: 'U21AMG04', sem: 4, name: 'Artificial Intelligence and Machine Learning', category: 'ESC', credits: 3, type: 'Theory',
    blurb: 'AI fundamentals, supervised/unsupervised learning, neural networks and biomedical applications.' },
  { id: 'OE-I',     sem: 4, name: 'Open Elective – I',                       category: 'OEC',  credits: 3, type: 'Theory',
    blurb: 'A subject from another department — broaden your perspective beyond biomed.' },
  { id: 'U21CSG04', sem: 4, name: 'Java Programming',                        category: 'ESC',  credits: 3, type: 'Theory + Lab',
    blurb: 'OOP, classes, inheritance, polymorphism, exceptions, multithreading and Swing basics.' },
  { id: 'U21BM402', sem: 4, name: 'Biophysical Signals and Systems',         category: 'PCC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Signal classification, LTI systems, convolution, sampling and frequency response in biomed context.' },
  { id: 'U21BM403', sem: 4, name: 'Microbiology and Pathology Laboratory',   category: 'PCC',  credits: 2, type: 'Lab',
    blurb: 'Staining, culture, sterilisation, microscopic identification and pathology slide studies.' },
  { id: 'U21SSG01', sem: 4, name: 'Soft Skills – I',                         category: 'HSMC', credits: 1, type: 'Lab',
    blurb: 'Reasoning, aptitude and verbal ability for placements.' },
  { id: 'U21MYC04', sem: 4, name: 'Indian Constitution',                     category: 'MNC',  credits: 0, type: 'Mandatory',
    blurb: 'Fundamental rights, duties, structure of government and constitutional values.' },

  // ---------- SEMESTER V ----------
  { id: 'U21BM501', sem: 5, name: 'Microcontroller and its Applications',    category: 'PCC',  credits: 3, type: 'Theory',
    blurb: '8051 / ARM architecture, interfacing, embedded C and biomedical microcontroller projects.' },
  { id: 'PE-I',     sem: 5, name: 'Professional Elective – I',               category: 'PEC',  credits: 3, type: 'Theory',
    blurb: 'Pick one — usually a deep-dive subject in your area of interest.' },
  { id: 'PE-II',    sem: 5, name: 'Professional Elective – II',              category: 'PEC',  credits: 3, type: 'Theory',
    blurb: 'A second elective for breadth across the biomed engineering spectrum.' },
  { id: 'OE-II',    sem: 5, name: 'Open Elective – II',                      category: 'OEC',  credits: 3, type: 'Theory',
    blurb: 'Another inter-disciplinary option from across the institute.' },
  { id: 'U21BM502', sem: 5, name: 'Biosignal Processing',                    category: 'PCC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Filters, FFT, wavelets, ECG/EEG/EMG processing and feature extraction.' },
  { id: 'U21BM503', sem: 5, name: 'Biocontrol Systems',                      category: 'PCC',  credits: 4, type: 'Theory + Project',
    blurb: 'Modelling physiological systems, feedback control, PID and biomedical control applications.' },
  { id: 'U21SSG02', sem: 5, name: 'Soft Skills – II',                        category: 'HSMC', credits: 1, type: 'Lab',
    blurb: 'Advanced aptitude, group discussion and interview skills.' },
  { id: 'U21BM504', sem: 5, name: 'Microcontroller Laboratory',              category: 'PCC',  credits: 2, type: 'Lab',
    blurb: 'Programming microcontrollers for biomedical instrumentation experiments.' },
  { id: 'U21MYC05', sem: 5, name: 'Cyber Security Essentials',               category: 'MNC',  credits: 0, type: 'Mandatory',
    blurb: 'Cyber threats, cryptography basics, secure coding and digital privacy.' },

  // ---------- SEMESTER VI ----------
  { id: 'U21BM601', sem: 6, name: 'Diagnostic and Therapeutic Equipment',    category: 'PCC',  credits: 3, type: 'Theory',
    blurb: 'Patient monitors, ventilators, dialysis, lithotripsy, lasers in medicine and therapy devices.' },
  { id: 'U21BM602', sem: 6, name: 'Hospital Management',                     category: 'HSMC', credits: 3, type: 'Theory',
    blurb: 'Hospital organisation, equipment management, biomedical waste, MIS and quality systems.' },
  { id: 'PE-III',   sem: 6, name: 'Professional Elective – III',             category: 'PEC',  credits: 3, type: 'Theory',
    blurb: 'Deeper elective — often picked to align with project / placement.' },
  { id: 'PE-IV',    sem: 6, name: 'Professional Elective – IV',              category: 'PEC',  credits: 3, type: 'Theory',
    blurb: 'Another biomed elective to round out specialisation.' },
  { id: 'OE-III',   sem: 6, name: 'Open Elective – III',                     category: 'OEC',  credits: 3, type: 'Theory',
    blurb: 'Open elective option across departments.' },
  { id: 'U21BM603', sem: 6, name: 'Biomechanics',                            category: 'PCC',  credits: 3, type: 'Theory + Lab',
    blurb: 'Mechanics of bones, joints, cardiovascular flow, gait analysis and prosthetic design.' },
  { id: 'U21SSG03', sem: 6, name: 'Soft Skills – III',                       category: 'HSMC', credits: 1, type: 'Lab',
    blurb: 'Final pre-placement soft-skills sprint.' },
  { id: 'U21BM604', sem: 6, name: 'Diagnostic and Therapeutic Equipment Laboratory', category: 'PCC', credits: 2, type: 'Lab',
    blurb: 'Hands-on experiments with patient monitors, defibrillators, ventilators and other equipment.' },
  { id: 'U21MYC06', sem: 6, name: 'Introduction to UN SDGs',                 category: 'MNC',  credits: 0, type: 'Mandatory',
    blurb: 'Sustainable development goals — an integrative perspective on real-world impact.' },

  // ---------- SEMESTER VII ----------
  { id: 'U21BM701', sem: 7, name: 'Radiological Equipment',                  category: 'PCC',  credits: 3, type: 'Theory',
    blurb: 'X-ray, CT, MRI, ultrasound, nuclear imaging — physics, instrumentation and image quality.' },
  { id: 'U21BM702', sem: 7, name: 'Medical Image Processing',                category: 'PCC',  credits: 3, type: 'Theory',
    blurb: 'Image enhancement, segmentation, registration, classification with DICOM and deep learning.' },
  { id: 'U21BM703', sem: 7, name: 'Rehabilitation Engineering',              category: 'PCC',  credits: 3, type: 'Theory',
    blurb: 'Prosthetics, orthotics, wheelchairs, sensory aids and assistive devices.' },
  { id: 'PE-V',     sem: 7, name: 'Professional Elective – V',               category: 'PEC',  credits: 3, type: 'Theory',
    blurb: 'Advanced elective in your chosen track.' },
  { id: 'PE-VI',    sem: 7, name: 'Professional Elective – VI',              category: 'PEC',  credits: 3, type: 'Theory',
    blurb: 'Final professional elective.' },
  { id: 'OE-IV',    sem: 7, name: 'Open Elective – IV',                      category: 'OEC',  credits: 3, type: 'Theory',
    blurb: 'Last open elective slot.' },
  { id: 'U21BM704', sem: 7, name: 'Medical Image Processing Laboratory',     category: 'PCC',  credits: 2, type: 'Lab',
    blurb: 'MATLAB / Python image processing pipelines on real medical images.' },
  { id: 'U21BM705', sem: 7, name: 'Rehabilitation Laboratory',               category: 'PCC',  credits: 2, type: 'Lab',
    blurb: 'Hands-on experiments with assistive and rehabilitation devices.' },
  { id: 'U21BM706', sem: 7, name: 'Project Work – Phase 1',                  category: 'EEC',  credits: 2, type: 'Project',
    blurb: 'Problem identification, literature survey and design proposal for your final-year project.' },

  // ---------- SEMESTER VIII ----------
  { id: 'U21BM801', sem: 8, name: 'Project Work – Phase II',                 category: 'EEC',  credits: 10, type: 'Project',
    blurb: 'Build, test and document the final-year biomedical engineering project.' },
  { id: 'U21BMI01', sem: 8, name: 'Industrial Training / Internship',        category: 'EEC',  credits: 2, type: 'Internship',
    blurb: 'Four-week industry exposure during any vacation from Sem III to Sem VI.' },
];

// --- Helpers ---------------------------------------------------------
export const subjectsOf = (sem) => SUBJECTS.filter(s => s.sem === sem);
export const subjectById = (id) => SUBJECTS.find(s => s.id === id);

// --- Lab equipment glossary -----------------------------------------
export const EQUIPMENT = [
  { name: 'Patient Monitor',     desc: 'Bedside multi-parameter monitor: ECG, SpO₂, NIBP, RR, temperature.', tag: 'Ward' },
  { name: 'Defibrillator',       desc: 'Delivers therapeutic shock to convert arrhythmias to sinus rhythm.', tag: 'Emergency' },
  { name: 'Ventilator',          desc: 'Mechanical breathing support for ICU and OR patients.', tag: 'ICU' },
  { name: 'Anaesthesia Machine', desc: 'Delivers a controlled mixture of medical gases and anaesthetic vapours.', tag: 'OR' },
  { name: 'Pulse Oximeter',      desc: 'Two-wavelength photoplethysmography for SpO₂ and pulse rate.', tag: 'Vital' },
  { name: 'Spirometer',          desc: 'Measures lung volumes — FVC, FEV1, peak expiratory flow.', tag: 'PFT' },
  { name: 'Infusion Pump',       desc: 'Precise IV fluid / drug delivery in mL per hour or drug-library mode.', tag: 'Ward' },
  { name: 'Electrosurgical Unit',desc: 'High-frequency current for cutting and coagulating tissue.', tag: 'OR' },
  { name: 'ECG Machine',         desc: '12-lead acquisition with paper printout; baseline of every cardiology workup.', tag: 'Cardiology' },
  { name: 'X-ray Machine',       desc: 'Rotating-anode X-ray tube + collimator + detector for projection imaging.', tag: 'Imaging' },
  { name: 'Ultrasound Scanner',  desc: 'Piezoelectric probe + B-mode / Doppler processing for soft-tissue imaging.', tag: 'Imaging' },
  { name: 'Dialysis Machine',    desc: 'Extracorporeal blood circuit + dialyser for renal replacement therapy.', tag: 'Nephrology' },
];

// --- Calendar seed events --------------------------------------------
const today = new Date();
function offset(days) { const d = new Date(today); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
export const STARTER_EVENTS = [
  { id: 'e1', date: offset(5),  title: 'Submission deadline',  type: 'assign' },
  { id: 'e2', date: offset(14), title: 'Mid-Semester exams',   type: 'exam' },
];

// --- Starter flashcards (subject-tagged via course codes) ------------
export const STARTER_FLASHCARDS = [
  { id: 'f1', subjectId: 'U21BM301', front: 'Normal resting heart rate (adult)?',  back: '60–100 bpm' },
  { id: 'f2', subjectId: 'U21BM301', front: 'Pacemaker of the heart?',             back: 'Sinoatrial (SA) node' },
  { id: 'f3', subjectId: 'U21CY201', front: 'Net ATP from glycolysis?',            back: '2 ATP (substrate-level), 2 NADH' },
  { id: 'f4', subjectId: 'U21BM302', front: 'CMRR for an ECG amplifier (min)?',    back: '~100 dB' },
  { id: 'f5', subjectId: 'U21BM302', front: 'Microshock current threshold?',       back: '~10 µA through the heart' },
  { id: 'f6', subjectId: 'U21BM701', front: 'Bone is bright on which CT setting?', back: 'High HU (bone window ≈ +1000)' },
  { id: 'f7', subjectId: 'U21BM701', front: 'T1-weighted MRI: fat appears…',       back: 'Bright (short T1)' },
  { id: 'f8', subjectId: 'U21BM502', front: 'Nyquist for ECG (signal ≤ 150 Hz)?',  back: 'Fs ≥ 300 Hz; typical 500 Hz' },
  { id: 'f9', subjectId: 'U21BM603', front: 'Wolff’s law summarises…',             back: 'Bone remodels along lines of mechanical stress.' },
  { id: 'f10',subjectId: 'U21BM602', front: 'Biomedical waste — yellow bag holds…',back: 'Anatomical, pathological and soiled waste (incineration).' },
];

// --- AI Study Buddy knowledge snippets (rule-based) ------------------
export const KB = [
  { keys: ['cmrr', 'common mode', 'right leg'],
    a: 'CMRR (Common-Mode Rejection Ratio) = 20·log10(Ad/Acm). For ECG amplifiers, aim for ≥100 dB; the right-leg-drive circuit actively cancels 50/60 Hz interference picked up equally by both inputs.' },
  { keys: ['nyquist', 'sampling', 'aliasing'],
    a: 'Nyquist criterion: Fs ≥ 2·f_max. For ECG (signal ≤ ~150 Hz) use ≥ 300 Hz; in practice 500–1000 Hz is standard. Under-sampling causes aliasing — high-frequency content folds back into the band of interest.' },
  { keys: ['t1', 't2', 'mri', 'larmor'],
    a: 'In MRI, ω₀ = γ·B₀ (Larmor). T1 = longitudinal recovery (fat short → bright on T1). T2 = transverse decay (water long → bright on T2). Mnemonic: "Water is White on T2".' },
  { keys: ['pulse', 'oximeter', 'spo2'],
    a: 'Pulse oximetry uses 660 nm (red) and 940 nm (IR). Ratio R = (AC/DC)660 / (AC/DC)940 maps to SpO2 via an empirical curve. Beer–Lambert + the pulsatile AC component cancels the static tissue absorption.' },
  { keys: ['pan tompkins', 'qrs'],
    a: 'Pan–Tompkins: band-pass → derivative → square → moving-window integrate → adaptive threshold with searchback. Window ≈ 150 ms at 200 Hz Fs. Tuned for real-time QRS detection.' },
  { keys: ['michaelis', 'menten', 'enzyme'],
    a: 'v = Vmax·[S] / (Km + [S]). Km is the substrate concentration at half Vmax — a measure of enzyme affinity (lower Km = higher affinity). Derivation uses the steady-state assumption d[ES]/dt = 0.' },
  { keys: ['iec 60601', 'leakage', 'macroshock', 'microshock'],
    a: 'IEC 60601-1 caps patient leakage current at 10 µA (CF-type, normal) and 50 µA (BF-type). Macroshock ≥ 1 mA through skin; microshock as low as 10 µA if applied directly to the heart.' },
  { keys: ['biomaterial', 'implant', 'titanium', 'biocompat'],
    a: 'Common biomaterials: 316L stainless steel and Ti-6Al-4V (orthopaedics), PMMA (bone cement), UHMWPE (joints), HA & bioglass (bone bonding), PLA/PGA (resorbable). Biocompatibility = appropriate host response for the intended application.' },
  { keys: ['op-amp', 'opamp', 'inverting', 'noninverting'],
    a: 'Inverting amp gain = −Rf/Rin; non-inverting = 1+Rf/Rin. Instrumentation amp = three op-amps with very high CMRR — the workhorse of biopotential acquisition.' },
];

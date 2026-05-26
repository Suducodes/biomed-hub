import { h, mount, icon } from '../ui.js?v=5f017ca';
import { SUBJECTS, SEM_LABEL, CATEGORY_META, subjectById } from '../data.js?v=5f017ca';
import { navigate } from '../router.js?v=5f017ca';

// Labs hub — every lab course from R2021 + a detail page per lab.
//
// Each lab detail page is intentionally a "structured placeholder" right now:
// equipment, experiment list and per-experiment "how to perform" notes are
// authored here. Add real protocols later (or upload PDFs to the cloud
// library and they will show up in the subject's Admin Notes tab).

// ---------- Authored lab metadata (extend over time) ----------
const LAB_DATA = {
  'U21BM202': {
    equipment: ['Op-amp ICs (LM741 / LM358)', 'Breadboard + DC supply', 'Function generator', 'Dual-trace CRO', 'Multimeter'],
    experiments: [
      { name: 'Inverting & non-inverting amplifier — gain measurement', steps: ['Build circuit with chosen Rf / Rin', 'Apply sine input from function generator', 'Measure Vin and Vout on CRO', 'Compute gain, compare with theoretical −Rf/Rin or 1+Rf/Rin'] },
      { name: 'Summing amplifier (analogue mixer)', steps: ['Tie three inputs to the inverting node via R1, R2, R3', 'Verify Vout = −Rf · (V1/R1 + V2/R2 + V3/R3)'] },
      { name: 'Differentiator and Integrator', steps: ['Build RC-coupled diff / int circuit', 'Apply triangular & square waves', 'Observe shape transformation on CRO'] },
      { name: 'Active low-pass / high-pass filter', steps: ['Sallen-Key topology, design fc ≈ 1 kHz', 'Sweep frequency, plot magnitude response'] },
      { name: '555 Astable & Monostable timer', steps: ['Calculate R, C for desired frequency / pulse width', 'Verify with CRO'] },
      { name: 'Schmitt trigger & comparator', steps: ['Choose threshold via voltage divider', 'Apply slow triangle, observe hysteresis'] },
      { name: 'ADC / DAC interfacing', steps: ['Use 0804 or R-2R ladder', 'Convert known voltages, tabulate'] },
    ],
  },
  'U21BM304': {
    equipment: ['ECG / EMG / EEG patient simulator', 'Instrumentation amp (AD620)', 'Right-leg drive op-amp', 'DSO', 'Pulse-oximeter probe', 'Strain gauge bridge', 'Type-K thermocouple'],
    experiments: [
      { name: 'Build a 3-lead ECG amplifier (gain ≥ 1000)', steps: ['Use AD620 instrumentation amp', 'Calculate Rg for desired gain', 'Apply 1 mV simulator signal', 'Measure CMRR using common-mode source', 'Record output on DSO'] },
      { name: 'EMG acquisition from forearm', steps: ['Place surface electrodes on flexor / extensor', 'High-pass at 20 Hz, low-pass at 500 Hz', 'Observe muscle activation'] },
      { name: 'EEG acquisition (alpha rhythm)', steps: ['Electrode placement Fp1, Fp2, ground at mastoid', 'Subject closes eyes for 30 s', 'Observe ~10 Hz alpha enhancement'] },
      { name: 'Non-invasive blood pressure (Korotkoff)', steps: ['Inflate cuff above systolic', 'Slowly deflate, listen for first / last sound', 'Record SBP & DBP'] },
      { name: 'Pulse oximetry (SpO₂)', steps: ['Place finger probe', 'Record red & IR PPG', 'Compute R ratio, map to SpO₂ via curve'] },
      { name: 'Strain gauge bridge — force measurement', steps: ['Build quarter-bridge with Rg + 3 fixed R', 'Calibrate with known weights', 'Plot mV/V vs grams'] },
      { name: 'Temperature: thermistor vs thermocouple', steps: ['Submerge both in water bath', 'Vary 25 → 50 °C', 'Compare linearity, response time'] },
    ],
  },
  'U21BM305': {
    equipment: ['Compound microscope', 'Spirometer', 'BP apparatus', 'Stethoscope', 'ECG paper recorder', 'Pulse oximeter', 'Snellen chart'],
    experiments: [
      { name: 'Microscopic study of major tissues', steps: ['Examine slides of epithelial, connective, muscle and nervous tissue', 'Identify, sketch, label characteristic features'] },
      { name: 'Spirometry — lung volumes', steps: ['Subject breathes through mouthpiece', 'Measure tidal volume, IRV, ERV, vital capacity', 'Compute FEV1 / FVC ratio'] },
      { name: 'Blood pressure recording (auscultatory)', steps: ['Use BP cuff & stethoscope', 'Take three readings 2 min apart', 'Compute MAP'] },
      { name: 'Resting 12-lead ECG', steps: ['Place limb + chest electrodes per Einthoven / Goldberger / Wilson', 'Record at 25 mm/s, 10 mm/mV', 'Calculate rate, axis, intervals'] },
      { name: 'Reflex testing', steps: ['Test biceps, knee, ankle, plantar reflexes', 'Grade 0–4'] },
      { name: 'Visual acuity & colour vision', steps: ['Snellen chart at 6 m', 'Ishihara plates'] },
      { name: 'Pulse rate & respiratory rate', steps: ['Palpate radial pulse 60 s', 'Count breaths 60 s'] },
    ],
  },
  'U21BM403': {
    equipment: ['Compound microscope', 'Autoclave', 'Laminar air-flow hood', 'Bunsen burner / spirit lamp', 'Inoculation loop', 'Petri dishes, slides', 'Standard stains (gram, ZN)'],
    experiments: [
      { name: 'Aseptic technique & sterilisation', steps: ['Demonstrate flame, autoclave, filtration', 'Compare sterility post-procedure'] },
      { name: 'Preparation of culture media', steps: ['Weigh nutrient agar', 'Sterilise, pour plates', 'Verify sterility'] },
      { name: 'Gram staining', steps: ['Heat-fix smear', 'Crystal violet → iodine → decolourise → safranin', 'Microscopy: identify Gram + / −'] },
      { name: 'Acid-fast (Ziehl-Neelsen) staining', steps: ['Carbol fuchsin under heat', 'Decolourise with acid-alcohol', 'Methylene blue counter-stain'] },
      { name: 'Antibiotic sensitivity (Kirby-Bauer)', steps: ['Inoculate lawn on Mueller-Hinton agar', 'Place antibiotic discs', 'Measure zones of inhibition'] },
      { name: 'Identification of common bacteria', steps: ['Lactose fermentation', 'Catalase / oxidase tests'] },
      { name: 'Pathology slides', steps: ['Identify granuloma, neoplasia, infarct, inflammation under microscope'] },
    ],
  },
  'U21BM504': {
    equipment: ['8051 dev board / Arduino Uno', 'LCD 16×2', 'ADC0808 / on-chip ADC', 'LM35 / DHT11', 'Stepper motor + driver', 'Relay module', 'ECG-AD8232 module'],
    experiments: [
      { name: 'LED blinking via Port pin', steps: ['Wire LED to P1.0', 'Toggle with delay loop', 'Vary delay, observe frequency'] },
      { name: 'LCD display "Hello BME"', steps: ['Connect LCD in 4-bit mode', 'Initialise, set cursor, write string'] },
      { name: 'ADC interfacing — read LM35 temperature', steps: ['Connect LM35 to ADC input', 'Convert ADC count to °C', 'Display on LCD'] },
      { name: 'Stepper motor control', steps: ['Generate 4-step or half-step sequence', 'Rotate clockwise then anticlockwise'] },
      { name: 'PWM-based DC motor speed control', steps: ['Use Timer to generate PWM', 'Vary duty cycle from 0–100 %'] },
      { name: 'Biomedical mini-project: ECG monitor with AD8232', steps: ['Wire AD8232 module to ADC', 'Sample at 200 Hz', 'Stream over UART, plot on PC'] },
    ],
  },
  'U21BM604': {
    equipment: ['Multi-parameter patient monitor (training)', 'Defibrillator simulator', 'Ventilator (training)', 'Anaesthesia workstation', 'Infusion pump', 'Dialysis demonstrator'],
    experiments: [
      { name: 'Patient monitor — set up + alarms', steps: ['Connect ECG, SpO₂, NIBP, temp probes', 'Set alarm limits', 'Demonstrate arrhythmia & low SpO₂ alarms'] },
      { name: 'Defibrillator — synchronised vs unsynchronised shock', steps: ['Charge to 200 J', 'Discharge on test load', 'Demonstrate sync mode behaviour'] },
      { name: 'Ventilator — modes', steps: ['Set VC, PC and SIMV modes', 'Observe pressure / flow / volume loops'] },
      { name: 'Anaesthesia workstation safety check', steps: ['Pre-use checklist', 'Pipeline & cylinder pressure', 'Vapouriser test'] },
      { name: 'Infusion pump — flow accuracy', steps: ['Set 100 mL/h', 'Collect output over 30 min', 'Verify ±5 % accuracy'] },
      { name: 'Pulse oximeter accuracy under motion', steps: ['Compare reading at rest vs hand motion', 'Discuss artefact rejection'] },
    ],
  },
  'U21BM704': {
    equipment: ['MATLAB / Python (NumPy, OpenCV, scikit-image)', 'Sample DICOM datasets (free from TCIA)', 'GPU optional for ML experiments'],
    experiments: [
      { name: 'Read DICOM, view metadata, render slice', steps: ['Load .dcm with pydicom', 'Print PatientID, modality, slice thickness', 'Display pixel array with proper window/level'] },
      { name: 'Histogram equalisation on chest X-ray', steps: ['Compute histogram', 'Apply CLAHE', 'Compare before/after'] },
      { name: 'Median + Gaussian filtering of MR slices', steps: ['Add salt-pepper noise', 'Apply 3×3 median', 'Compare to Gaussian'] },
      { name: 'Thresholding & region growing segmentation', steps: ['Otsu threshold on lungs', 'Seed-based region growing on tumour ROI'] },
      { name: 'Edge detection (Sobel, Canny)', steps: ['Compare on retinal fundus image', 'Tune Canny thresholds'] },
      { name: 'Morphological clean-up', steps: ['Erosion / dilation / opening / closing', 'Remove small artefacts'] },
      { name: 'CT slice reconstruction from projections', steps: ['Compute Radon transform', 'Apply filtered back-projection', 'Compare with original phantom'] },
      { name: 'Mini-ML: pneumonia classification (CXR)', steps: ['Use small CNN (transfer from ResNet18)', 'Train on labelled subset', 'Evaluate AUC'] },
    ],
  },
  'U21BM705': {
    equipment: ['Sample prosthetic / orthotic devices', 'Goniometer', 'Hand dynamometer', 'Force plate', 'Wheelchair (training)', 'Communication board'],
    experiments: [
      { name: 'Joint range of motion — goniometry', steps: ['Measure shoulder, elbow, knee, ankle ROM', 'Compare with normative values'] },
      { name: 'Hand-grip strength', steps: ['Use dynamometer, dominant vs non-dominant hand', 'Three trials each, take mean'] },
      { name: 'Gait observation', steps: ['Subject walks 10 m', 'Identify stance/swing phases', 'Note any abnormalities'] },
      { name: 'Wheelchair ergonomics & wheelies', steps: ['Adjust seat, footrest, armrest', 'Demonstrate safe transfer'] },
      { name: 'Lower-limb prosthesis donning', steps: ['Demonstrate stump sock, suction socket', 'Walk with prosthesis between parallel bars'] },
      { name: 'Communication aid for ALS', steps: ['Use eye-gaze / switch-scan board', 'Construct simple sentence'] },
    ],
  },
};

// ---------- Routes ----------
export function renderLabs() {
  const labs = SUBJECTS.filter(s => /Laboratory|Practices|Graphics/i.test(s.name) || s.type === 'Lab')
    .sort((a, b) => a.sem - b.sem);

  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'All <span class="accent">Labs</span>' }),
      h('p', {}, 'Every laboratory course in the R2021 curriculum. Click a lab to see equipment used, the full list of experiments, and step-by-step procedures.'),
    ),
  );

  const grid = h('div', { class: 'lab-grid' },
    ...labs.map(s => {
      const meta = CATEGORY_META[s.category];
      const data = LAB_DATA[s.id];
      const expCount = data?.experiments.length ?? 0;
      const eqCount = data?.equipment.length ?? 0;
      return h('a', { class: 'lab-card', href: `#/lab/${s.id}`, style: { '--accent': meta.color } },
        h('div', { class: 'lab-card__band' }),
        h('div', { class: 'lab-card__body' },
          h('div', { class: 'lab-card__head' },
            h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, s.id),
            h('span', { class: 'chip' }, `Sem ${SEM_LABEL[s.sem-1]}`),
          ),
          h('h4', {}, s.name),
          h('p', {}, s.blurb),
          h('div', { class: 'lab-card__stats' },
            h('span', {}, '🧪 ', h('b', {}, expCount), ' experiments'),
            h('span', {}, '🔧 ', h('b', {}, eqCount), ' equipment'),
            h('span', {}, '📊 ', h('b', {}, s.credits), ' credits'),
          ),
          !data ? h('div', { class: 'chip chip--amber', style: { marginTop: 10 } }, 'Details coming soon') : null,
        ),
      );
    }),
  );

  mount('#view', head, grid);
}

export function renderLab({ id }) {
  const s = subjectById(id);
  if (!s) return mount('#view', h('div', { class: 'empty' }, h('h4', {}, 'Lab not found')));
  const meta = CATEGORY_META[s.category];
  const data = LAB_DATA[id];

  const hero = h('section', { class: 'subject-hero', style: { background: `linear-gradient(135deg, ${meta.color}22 0%, ${meta.color}08 100%), rgba(15,23,42,0.5)` } },
    h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
      h('span', { class: 'chip', style: { color: meta.color, borderColor: meta.color + '40', background: meta.color + '14' } }, s.id),
      h('span', { class: 'chip' }, `Sem ${SEM_LABEL[s.sem-1]}`),
      h('span', { class: 'chip' }, `${s.credits} credits`),
      h('span', { class: 'chip chip--cyan' }, 'Laboratory'),
    ),
    h('h1', {}, s.name),
    h('p', {}, s.blurb),
  );

  let content;
  if (!data) {
    content = h('div', { class: 'empty' },
      h('h4', {}, 'Detailed protocols coming soon'),
      h('p', {}, 'In the meantime, upload PDF lab manuals via the admin panel — they\'ll show under "Admin Notes" of this subject.'),
      h('button', { class: 'btn btn--primary', style: { marginTop: 10 }, onclick: () => navigate(`#/subject/${id}`) }, 'Open subject page'),
    );
  } else {
    content = h('div', {},
      // Equipment
      h('div', { class: 'card' },
        h('h3', { style: { margin: '0 0 10px', fontFamily: 'Space Grotesk' } }, '🔧 Equipment used'),
        h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 6 } },
          ...data.equipment.map(eq => h('span', { class: 'chip' }, eq)),
        ),
      ),
      // Experiments
      h('div', { class: 'section-title', style: { marginTop: 22 } }, h('h3', {}, '🧪 Experiments  ', h('span', { class: 'chip chip--cyan' }, `${data.experiments.length}`))),
      h('div', { class: 'cl-grid' },
        ...data.experiments.map((e, i) => h('details', { class: 'cl-card exp-card', style: { '--accent': accents[i % accents.length] } },
          h('summary', { class: 'cl-card__head', style: { cursor: 'pointer' } },
            h('div', { class: 'cl-card__num', style: { background: accents[i % accents.length] } }, i + 1),
            h('div', { class: 'cl-card__title' },
              h('h4', {}, e.name),
              h('div', { class: 'cl-card__sub' }, `${e.steps.length} steps`),
            ),
          ),
          h('div', { class: 'exp-card__body' },
            h('ol', { class: 'exp-steps' }, ...e.steps.map(s => h('li', {}, s))),
            h('div', { style: { color: 'var(--muted)', fontSize: 12, marginTop: 8 } }, 'Tip: take a photo of each step on your phone — graders love a clean lab record.'),
          ),
        )),
      ),
    );
  }

  mount('#view',
    h('nav', { class: 'crumbs' },
      h('a', { class: 'crumbs__link', href: '#/labs' }, 'All labs'),
      h('span', { class: 'crumbs__sep' }, '›'),
      h('span', { class: 'crumbs__cur' }, s.name),
    ),
    h('div', { class: 'page-head' },
      h('div', {}),
      h('div', { class: 'page-head__actions' },
        h('button', { class: 'btn btn--ghost', onclick: () => navigate('#/labs') }, '← All labs'),
        h('button', { class: 'btn btn--ghost', onclick: () => navigate(`#/subject/${id}`) }, 'Open subject page →'),
      ),
    ),
    hero,
    content,
  );
}

const accents = ['#22d3ee', '#a78bfa', '#34d399', '#f472b6', '#fbbf24', '#60a5fa', '#fb7185', '#2dd4bf'];

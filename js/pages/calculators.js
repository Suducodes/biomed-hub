import { h, mount } from '../ui.js';

// A toolkit of biomedical / clinical calculators.

function field(label, attrs) {
  return h('div', { class: 'field' },
    h('label', { class: 'label' }, label),
    h('input', { class: 'input', type: 'number', step: 'any', ...attrs }),
  );
}

const CALCS = [
  {
    title: 'Body Mass Index (BMI)',
    help: 'WHO classification — under 18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, ≥30 obese.',
    build(out) {
      const w = field('Weight (kg)', { value: 65, oninput: calc });
      const ht = field('Height (cm)', { value: 170, oninput: calc });
      function calc() {
        const W = +w.querySelector('input').value;
        const H = +ht.querySelector('input').value / 100;
        const v = W / (H * H);
        let cls = '—';
        if (v < 18.5) cls = 'Underweight';
        else if (v < 25) cls = 'Normal';
        else if (v < 30) cls = 'Overweight';
        else cls = 'Obese';
        out.textContent = isFinite(v) ? `BMI = ${v.toFixed(2)}  ·  ${cls}` : '—';
      }
      calc();
      return [w, ht];
    },
  },
  {
    title: 'Mean Arterial Pressure (MAP)',
    help: 'MAP = DBP + 1/3 (SBP − DBP). Target ≥ 65 mmHg for adequate organ perfusion.',
    build(out) {
      const s = field('Systolic (mmHg)', { value: 120, oninput: calc });
      const d = field('Diastolic (mmHg)', { value: 80, oninput: calc });
      function calc() {
        const S = +s.querySelector('input').value, D = +d.querySelector('input').value;
        const v = D + (S - D) / 3;
        out.textContent = isFinite(v) ? `MAP = ${v.toFixed(1)} mmHg` : '—';
      }
      calc();
      return [s, d];
    },
  },
  {
    title: 'eGFR (Cockcroft–Gault)',
    help: 'Creatinine clearance estimate. Multiply by 0.85 for females.',
    build(out) {
      const a = field('Age (years)', { value: 40, oninput: calc });
      const w = field('Weight (kg)', { value: 70, oninput: calc });
      const c = field('Serum creatinine (mg/dL)', { value: 1, oninput: calc });
      const sex = h('div', { class: 'field' },
        h('label', { class: 'label' }, 'Sex'),
        h('select', { class: 'select', onchange: calc }, h('option', { value: 'm' }, 'Male'), h('option', { value: 'f' }, 'Female')),
      );
      function calc() {
        const A = +a.querySelector('input').value;
        const W = +w.querySelector('input').value;
        const C = +c.querySelector('input').value;
        const f = sex.querySelector('select').value === 'f' ? 0.85 : 1;
        const v = ((140 - A) * W) / (72 * C) * f;
        out.textContent = isFinite(v) ? `eGFR ≈ ${v.toFixed(1)} mL/min` : '—';
      }
      calc();
      return [a, w, c, sex];
    },
  },
  {
    title: 'Drug Dose (mg/kg)',
    help: 'Standard weight-based dose. Always cross-check with formulary.',
    build(out) {
      const d = field('Dose (mg/kg)', { value: 10, oninput: calc });
      const w = field('Weight (kg)', { value: 25, oninput: calc });
      function calc() {
        const D = +d.querySelector('input').value, W = +w.querySelector('input').value;
        const v = D * W;
        out.textContent = isFinite(v) ? `Total dose = ${v.toFixed(2)} mg` : '—';
      }
      calc();
      return [d, w];
    },
  },
  {
    title: 'IV Drip Rate (gtt/min)',
    help: 'gtt/min = (volume × drop factor) / time (min)',
    build(out) {
      const v = field('Volume (mL)', { value: 1000, oninput: calc });
      const t = field('Time (min)', { value: 480, oninput: calc });
      const df = field('Drop factor (gtt/mL)', { value: 20, oninput: calc });
      function calc() {
        const V = +v.querySelector('input').value, T = +t.querySelector('input').value, D = +df.querySelector('input').value;
        const r = (V * D) / T;
        out.textContent = isFinite(r) ? `Rate = ${r.toFixed(1)} gtt/min` : '—';
      }
      calc();
      return [v, t, df];
    },
  },
  {
    title: 'Nyquist Sampling Rate',
    help: 'For a band-limited biosignal: Fs ≥ 2·f_max. We recommend ×3 oversample.',
    build(out) {
      const f = field('Highest frequency in signal (Hz)', { value: 150, oninput: calc });
      function calc() {
        const F = +f.querySelector('input').value;
        out.textContent = `Minimum Fs = ${(2 * F).toFixed(0)} Hz  ·  Recommended ≈ ${(3 * F).toFixed(0)} Hz`;
      }
      calc();
      return [f];
    },
  },
  {
    title: 'CMRR (dB)',
    help: 'CMRR = 20 · log10 (Ad / Acm). For ECG amps, aim for ≥ 100 dB.',
    build(out) {
      const ad = field('Differential gain (Ad)', { value: 1000, oninput: calc });
      const ac = field('Common-mode gain (Acm)', { value: 0.01, oninput: calc });
      function calc() {
        const A = +ad.querySelector('input').value, C = +ac.querySelector('input').value;
        const v = 20 * Math.log10(A / C);
        out.textContent = isFinite(v) ? `CMRR = ${v.toFixed(1)} dB` : '—';
      }
      calc();
      return [ad, ac];
    },
  },
  {
    title: 'Beer–Lambert Transmission',
    help: 'I = I₀ · e^(-μx). Useful for X-ray attenuation & spectrophotometry.',
    build(out) {
      const u = field('Linear attenuation μ (cm⁻¹)', { value: 0.2, oninput: calc });
      const x = field('Thickness x (cm)', { value: 5, oninput: calc });
      function calc() {
        const U = +u.querySelector('input').value, X = +x.querySelector('input').value;
        const v = Math.exp(-U * X);
        out.textContent = isFinite(v) ? `I / I₀ = ${(v * 100).toFixed(2)} %` : '—';
      }
      calc();
      return [u, x];
    },
  },
  {
    title: 'Pulse Pressure & SV (rough)',
    help: 'PP = SBP − DBP. Rough SV estimate ≈ PP × 2 (highly approximate — for teaching only).',
    build(out) {
      const s = field('Systolic (mmHg)', { value: 120, oninput: calc });
      const d = field('Diastolic (mmHg)', { value: 80,  oninput: calc });
      function calc() {
        const S = +s.querySelector('input').value, D = +d.querySelector('input').value;
        const pp = S - D;
        out.textContent = `PP = ${pp} mmHg · estimated SV ≈ ${pp * 2} mL`;
      }
      calc();
      return [s, d];
    },
  },
  {
    title: 'X-ray Half-Value Layer (HVL)',
    help: 'HVL = ln(2) / μ. The thickness that halves the X-ray intensity.',
    build(out) {
      const u = field('Linear attenuation μ (cm⁻¹)', { value: 0.2, oninput: calc });
      function calc() {
        const U = +u.querySelector('input').value;
        const v = Math.log(2) / U;
        out.textContent = isFinite(v) ? `HVL = ${v.toFixed(3)} cm` : '—';
      }
      calc();
      return [u];
    },
  },
  {
    title: 'Op-amp Gain (Inverting / Non-inverting)',
    help: 'Inverting: −Rf/Rin · Non-inverting: 1 + Rf/Rin.',
    build(out) {
      const rin = field('Rin (kΩ)', { value: 10, oninput: calc });
      const rf  = field('Rf (kΩ)',  { value: 100, oninput: calc });
      function calc() {
        const RIN = +rin.querySelector('input').value, RF = +rf.querySelector('input').value;
        const inv = -RF / RIN;
        const non = 1 + RF / RIN;
        out.textContent = `Inverting gain = ${inv.toFixed(2)}  ·  Non-inverting gain = ${non.toFixed(2)}`;
      }
      calc();
      return [rin, rf];
    },
  },
  {
    title: 'Ohm’s Law',
    help: 'V = I · R. Fill any two, calculate the third.',
    build(out) {
      const V = field('V (volts)', { placeholder: '?', oninput: calc });
      const I = field('I (amps)',  { placeholder: '?', oninput: calc });
      const R = field('R (ohms)',  { placeholder: '?', oninput: calc });
      function calc() {
        const v = parseFloat(V.querySelector('input').value);
        const i = parseFloat(I.querySelector('input').value);
        const r = parseFloat(R.querySelector('input').value);
        if (!isNaN(v) && !isNaN(i)) out.textContent = `R = V / I = ${(v/i).toFixed(3)} Ω`;
        else if (!isNaN(v) && !isNaN(r)) out.textContent = `I = V / R = ${(v/r).toFixed(3)} A`;
        else if (!isNaN(i) && !isNaN(r)) out.textContent = `V = I · R = ${(i*r).toFixed(3)} V`;
        else out.textContent = 'Fill any two fields.';
      }
      calc();
      return [V, I, R];
    },
  },
];

export function renderCalculators() {
  const head = h('div', { class: 'page-head' },
    h('div', {},
      h('h1', { html: 'Biomed <span class="accent">Calculators</span>' }),
      h('p', {}, 'Quick toolkit for the lab, the ward, and exam prep.'),
    ),
  );

  const grid = h('div', { class: 'calc-grid' });
  CALCS.forEach(c => {
    const out = h('div', { class: 'calc__result' }, '—');
    const fields = c.build(out);
    grid.appendChild(h('div', { class: 'calc' },
      h('h4', {}, c.title),
      h('p', { class: 'help' }, c.help),
      ...fields,
      out,
    ));
  });

  mount('#view', head, grid);
}

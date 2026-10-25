import type { AddChemicalResult, ChemicalDefinition, ChemicalId, ContainerState, IonId, ReactionRecord, VesselKind } from './types';

export const CHEMICALS: ChemicalDefinition[] = [
  { id: 'hcl', name: 'Hydrochloric acid', formula: 'HCl', category: 'Acids', color: '#e68b70', stockMolarity: 1, ionComposition: { 'H+': 1, 'Cl-': 1 }, acidEquivalents: 1, doseLabel: 'mL', shortDescription: 'Strong acid · 1.0 M' },
  { id: 'nitric-acid', name: 'Nitric acid', formula: 'HNO₃', category: 'Acids', color: '#e8a26e', stockMolarity: 1, ionComposition: { 'H+': 1, 'NO₃-': 1 }, acidEquivalents: 1, doseLabel: 'mL', shortDescription: 'Strong acid · 1.0 M' },
  { id: 'sulfuric-acid', name: 'Sulfuric acid', formula: 'H₂SO₄', category: 'Acids', color: '#db8b72', stockMolarity: 0.5, ionComposition: { 'H+': 2, 'SO₄²-': 1 }, acidEquivalents: 2, doseLabel: 'mL', shortDescription: 'Diprotic acid · 0.5 M' },
  { id: 'naoh', name: 'Sodium hydroxide', formula: 'NaOH', category: 'Bases', color: '#78a8ed', stockMolarity: 1, ionComposition: { 'Na+': 1, 'OH-': 1 }, baseEquivalents: 1, doseLabel: 'mL', shortDescription: 'Strong base · 1.0 M' },
  { id: 'koh', name: 'Potassium hydroxide', formula: 'KOH', category: 'Bases', color: '#799be9', stockMolarity: 1, ionComposition: { 'K+': 1, 'OH-': 1 }, baseEquivalents: 1, doseLabel: 'mL', shortDescription: 'Strong base · 1.0 M' },
  { id: 'calcium-hydroxide', name: 'Calcium hydroxide', formula: 'Ca(OH)₂', category: 'Bases', color: '#9ab4df', stockMolarity: 0.02, ionComposition: { 'Ca²+': 1, 'OH-': 2 }, baseEquivalents: 2, doseLabel: 'mL', shortDescription: 'Saturated solution · ~0.02 M' },
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'C₂₀H₁₄O₄', category: 'Indicators', color: '#e7b2d0', doseLabel: 'mL', shortDescription: 'Clear in acid · pink in base' },
  { id: 'universal', name: 'Universal indicator', formula: 'pH', category: 'Indicators', color: '#88bf86', doseLabel: 'mL', shortDescription: 'Colour shifts with pH' },
  { id: 'magnesium', name: 'Magnesium ribbon', formula: 'Mg', category: 'Metals', color: '#b9c7c0', molarMass: 24.305, solidKey: 'Mg(s)', doseLabel: 'g', shortDescription: 'Reactive metal · 0.15 g' },
  { id: 'zinc', name: 'Zinc granules', formula: 'Zn', category: 'Metals', color: '#a3b4ad', molarMass: 65.38, solidKey: 'Zn(s)', doseLabel: 'g', shortDescription: 'Reactive metal · 0.15 g' },
  { id: 'iron', name: 'Iron filings', formula: 'Fe', category: 'Metals', color: '#9caaa2', molarMass: 55.845, solidKey: 'Fe(s)', doseLabel: 'g', shortDescription: 'Reacts with acid · 0.15 g' },
  { id: 'copper-sulfate', name: 'Copper(II) sulfate', formula: 'CuSO₄', category: 'Salts', color: '#4aa9d1', stockMolarity: 0.5, ionComposition: { 'Cu²+': 1, 'SO₄²-': 1 }, doseLabel: 'mL', shortDescription: 'Blue solution · 0.5 M' },
  { id: 'silver-nitrate', name: 'Silver nitrate', formula: 'AgNO₃', category: 'Salts', color: '#b8c4dd', stockMolarity: 0.5, ionComposition: { 'Ag+': 1, 'NO₃-': 1 }, doseLabel: 'mL', shortDescription: 'Chloride test · 0.5 M' },
  { id: 'barium-chloride', name: 'Barium chloride', formula: 'BaCl₂', category: 'Salts', color: '#91b9cf', stockMolarity: 0.5, ionComposition: { 'Ba²+': 1, 'Cl-': 2 }, doseLabel: 'mL', shortDescription: 'Sulfate test · 0.5 M' },
  { id: 'sodium-carbonate', name: 'Sodium carbonate', formula: 'Na₂CO₃', category: 'Salts', color: '#96c7a9', stockMolarity: 0.5, ionComposition: { 'Na+': 2, 'CO₃²-': 1 }, doseLabel: 'mL', shortDescription: 'Carbonate test · 0.5 M' },
  { id: 'iron-chloride', name: 'Iron(III) chloride', formula: 'FeCl₃', category: 'Salts', color: '#b28c61', stockMolarity: 0.5, ionComposition: { 'Fe³+': 1, 'Cl-': 3 }, doseLabel: 'mL', shortDescription: 'Iron(III) ions · 0.5 M' },
  { id: 'potassium-iodide', name: 'Potassium iodide', formula: 'KI', category: 'Salts', color: '#c6b873', stockMolarity: 0.5, ionComposition: { 'K+': 1, 'I-': 1 }, doseLabel: 'mL', shortDescription: 'Halide solution · 0.5 M' },
  { id: 'phosphoric-acid', name: 'Phosphoric acid', formula: 'H₃PO₄', category: 'Acids', color: '#da9877', stockMolarity: 0.5, ionComposition: { 'H+': 3, 'PO₄³-': 1 }, acidEquivalents: 3, doseLabel: 'mL', shortDescription: 'Triprotic acid · simplified model', information: 'A triprotic acid used in fertilizers and food chemistry. This model treats all three acidic protons as fully dissociated.' },
  { id: 'acetic-acid', name: 'Acetic acid', formula: 'CH₃COOH', category: 'Acids', color: '#e0a878', stockMolarity: 1, ionComposition: { 'H+': 1, 'CH₃COO-': 1 }, acidEquivalents: 1, doseLabel: 'mL', shortDescription: 'Weak acid · simplified model', information: 'The acid in vinegar. It is weak in water; this teaching model approximates it as fully dissociated.' },
  { id: 'citric-acid', name: 'Citric acid', formula: 'C₆H₈O₇', category: 'Acids', color: '#e1b172', stockMolarity: 0.5, ionComposition: { 'H+': 3, 'C₆H₅O₇³-': 1 }, acidEquivalents: 3, doseLabel: 'mL', shortDescription: 'Triprotic acid · simplified model', information: 'A triprotic organic acid found in citrus fruits. Its staged dissociation is simplified here.' },
  { id: 'formic-acid', name: 'Formic acid', formula: 'HCOOH', category: 'Acids', color: '#d59682', stockMolarity: 0.5, ionComposition: { 'H+': 1, 'HCOO-': 1 }, acidEquivalents: 1, doseLabel: 'mL', shortDescription: 'Weak acid · simplified model', information: 'The simplest carboxylic acid. It is weak in water; this teaching model approximates it as fully dissociated.' },
  { id: 'ammonia', name: 'Ammonia solution', formula: 'NH₃(aq)', category: 'Bases', color: '#83a8de', stockMolarity: 0.5, ionComposition: { 'NH₄+': 1, 'OH-': 1 }, baseEquivalents: 1, doseLabel: 'mL', shortDescription: 'Weak base · simplified model', information: 'A weak base that reacts with water to form ammonium and hydroxide ions. Equilibrium is simplified.' },
  { id: 'methyl-orange', name: 'Methyl orange', formula: 'C₁₄H₁₄N₃NaO₃S', category: 'Indicators', color: '#ef9b52', doseLabel: 'mL', shortDescription: 'Red in acid · yellow above pH 4.4', information: 'Acid-base indicator: red below about pH 3.1, orange through its transition, and yellow above about pH 4.4.' },
  { id: 'litmus', name: 'Litmus solution', formula: 'indicator', category: 'Indicators', color: '#9c78d1', doseLabel: 'mL', shortDescription: 'Red in acid · blue in base', information: 'A broad-range indicator that appears red in acidic solutions, purple near neutral, and blue in basic solutions.' },
  { id: 'bromothymol-blue', name: 'Bromothymol blue', formula: 'C₂₇H₂₈Br₂O₅S', category: 'Indicators', color: '#64bca6', doseLabel: 'mL', shortDescription: 'Yellow → green → blue around neutral', information: 'Indicator transition is approximately yellow below pH 6.0, green near neutral, and blue above pH 7.6.' },
  { id: 'aluminum', name: 'Aluminum foil', formula: 'Al', category: 'Metals', color: '#c1cbc5', molarMass: 26.982, solidKey: 'Al(s)', doseLabel: 'g', shortDescription: 'Reactive metal · oxide layer simplified', information: 'Aluminum can release hydrogen with acid; its protective oxide layer and reaction kinetics are omitted.' },
  { id: 'copper', name: 'Copper turnings', formula: 'Cu', category: 'Metals', color: '#d18858', molarMass: 63.546, solidKey: 'Cu(s)', doseLabel: 'g', shortDescription: 'Does not displace H₂ from dilute HCl', information: 'Copper is below hydrogen in the activity series, so it does not displace hydrogen from dilute hydrochloric acid.' },
  { id: 'sodium-chloride', name: 'Sodium chloride', formula: 'NaCl', category: 'Salts', color: '#d5d3c7', stockMolarity: 1, ionComposition: { 'Na+': 1, 'Cl-': 1 }, doseLabel: 'mL', shortDescription: 'Soluble salt · 1.0 M', information: 'Table salt; dissolves to give sodium and chloride ions. Chloride can form a white AgCl precipitate with silver ions.' },
  { id: 'sodium-sulfate', name: 'Sodium sulfate', formula: 'Na₂SO₄', category: 'Salts', color: '#b4cfc4', stockMolarity: 0.5, ionComposition: { 'Na+': 2, 'SO₄²-': 1 }, doseLabel: 'mL', shortDescription: 'Soluble sulfate · 0.5 M', information: 'A soluble sulfate source. Sulfate forms a white BaSO₄ precipitate with barium ions.' },
  { id: 'magnesium-sulfate', name: 'Magnesium sulfate', formula: 'MgSO₄', category: 'Salts', color: '#94bdb4', stockMolarity: 0.5, ionComposition: { 'Mg²+': 1, 'SO₄²-': 1 }, doseLabel: 'mL', shortDescription: 'Soluble salt · 0.5 M', information: 'Epsom salt in solution: supplies magnesium and sulfate ions.' },
  { id: 'calcium-chloride', name: 'Calcium chloride', formula: 'CaCl₂', category: 'Salts', color: '#a9bfce', stockMolarity: 0.5, ionComposition: { 'Ca²+': 1, 'Cl-': 2 }, doseLabel: 'mL', shortDescription: 'Soluble salt · 0.5 M', information: 'A soluble calcium salt. It can form a sparingly soluble calcium carbonate precipitate.' },
  { id: 'potassium-nitrate', name: 'Potassium nitrate', formula: 'KNO₃', category: 'Salts', color: '#b1c6d5', stockMolarity: 0.5, ionComposition: { 'K+': 1, 'NO₃-': 1 }, doseLabel: 'mL', shortDescription: 'Soluble salt · 0.5 M', information: 'A soluble nitrate salt; potassium and nitrate remain dissolved in this model.' },
  { id: 'potassium-carbonate', name: 'Potassium carbonate', formula: 'K₂CO₃', category: 'Salts', color: '#a0c39d', stockMolarity: 0.5, ionComposition: { 'K+': 2, 'CO₃²-': 1 }, doseLabel: 'mL', shortDescription: 'Carbonate source · 0.5 M', information: 'A soluble carbonate salt. Adding acid can release carbon dioxide gas.' },
  { id: 'ammonium-chloride', name: 'Ammonium chloride', formula: 'NH₄Cl', category: 'Salts', color: '#a8b7c7', stockMolarity: 0.5, ionComposition: { 'NH₄+': 1, 'Cl-': 1 }, doseLabel: 'mL', shortDescription: 'Soluble salt · 0.5 M', information: 'A soluble ammonium salt used in demonstrations of salts and aqueous ions.' },
  { id: 'sodium-phosphate', name: 'Sodium phosphate', formula: 'Na₃PO₄', category: 'Salts', color: '#a9c4a1', stockMolarity: 0.5, ionComposition: { 'Na+': 3, 'PO₄³-': 1 }, doseLabel: 'mL', shortDescription: 'Phosphate source · 0.5 M', information: 'A soluble phosphate source. Calcium ions can form calcium phosphate precipitate.' },
  { id: 'calcium-carbonate', name: 'Calcium carbonate', formula: 'CaCO₃', category: 'Salts', color: '#e0dccd', molarMass: 100.086, solidKey: 'CaCO₃(s)', doseLabel: 'g', shortDescription: 'Insoluble solid · reacts with acid', information: 'Chalk/limestone. It is sparingly soluble and releases carbon dioxide when it reacts with acid.' },
  { id: 'sodium-bicarbonate', name: 'Sodium bicarbonate', formula: 'NaHCO₃', category: 'Salts', color: '#b9d2b9', stockMolarity: 0.5, ionComposition: { 'Na+': 1, 'HCO₃-': 1 }, doseLabel: 'mL', shortDescription: 'Bicarbonate · acid releases CO₂', information: 'Baking soda in solution. Bicarbonate reacts with acid to release carbon dioxide bubbles.' },
  { id: 'ethanol', name: 'Ethanol', formula: 'C₂H₅OH', category: 'Solvents', color: '#90b8b4', solvent: true, doseLabel: 'mL', shortDescription: 'Miscible solvent · no modeled reaction', information: 'A polar organic solvent that mixes with water. No reaction or safety behavior is simulated.' },
];

const stockWaterMl = 50;
const heatCapacity = 4.184;
const freshIons = (): Record<IonId, number> => ({});
export function createContainer(kind: VesselKind = 'Beaker', number = 1): ContainerState {
  return { id: crypto.randomUUID(), label: `${kind} ${number}`, kind, volumeMl: stockWaterMl, temperatureC: 20, ionsMol: freshIons(), solidsMol: {}, indicators: [], solvents: [], gasMoles: 0, gasBySpecies: {}, reactions: [] };
}
function record(state: ContainerState, event: Omit<ReactionRecord, 'id' | 'at'>): ReactionRecord {
  const saved = { ...event, id: crypto.randomUUID(), at: Date.now() };
  state.reactions = [...state.reactions, saved];
  state.gasMoles += event.gasMoles;
  if (event.gasSpecies && event.gasMoles > 0) {
    state.gasBySpecies[event.gasSpecies] = (state.gasBySpecies[event.gasSpecies] || 0) + event.gasMoles;
    state.gasSpecies = Object.keys(state.gasBySpecies).join(' + ');
  }
  if (event.heatJ > 0) state.temperatureC += event.heatJ / (Math.max(state.volumeMl, 1) * heatCapacity);
  return saved;
}
function react(state: ContainerState): ReactionRecord[] {
  const events: ReactionRecord[] = [], ions = state.ionsMol;
  const neutralized = Math.min(ions['H+'] || 0, ions['OH-'] || 0);
  if (neutralized > 1e-8) {
    ions['H+'] -= neutralized; ions['OH-'] -= neutralized;
    events.push(record(state, { title: 'Neutralization', equation: 'H⁺(aq) + OH⁻(aq) → H₂O(l)', detail: `${(neutralized * 1000).toFixed(2)} mmol of hydrogen and hydroxide ions formed water.`, heatJ: 57_100 * neutralized, gasMoles: 0 }));
  }
  const precipitations = [
    { cation: 'Cu²+', anion: 'OH-', ratio: 2, solid: 'Cu(OH)₂(s)', equation: 'Cu²⁺(aq) + 2OH⁻(aq) → Cu(OH)₂(s)↓', title: 'Copper hydroxide precipitation', color: 'blue' },
    { cation: 'Ag+', anion: 'Cl-', ratio: 1, solid: 'AgCl(s)', equation: 'Ag⁺(aq) + Cl⁻(aq) → AgCl(s)↓', title: 'Silver chloride precipitation', color: 'white' },
    { cation: 'Ba²+', anion: 'SO₄²-', ratio: 1, solid: 'BaSO₄(s)', equation: 'Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)↓', title: 'Barium sulfate precipitation', color: 'white' },
    { cation: 'Ag+', anion: 'I-', ratio: 1, solid: 'AgI(s)', equation: 'Ag⁺(aq) + I⁻(aq) → AgI(s)↓', title: 'Silver iodide precipitation', color: 'yellow' },
    { cation: 'Ca²+', anion: 'CO₃²-', ratio: 1, solid: 'CaCO₃(s)', equation: 'Ca²⁺(aq) + CO₃²⁻(aq) → CaCO₃(s)↓', title: 'Calcium carbonate precipitation', color: 'white' },
    { cation: 'Ca²+', anion: 'PO₄³-', cationRatio: 3, ratio: 2, solid: 'Ca₃(PO₄)₂(s)', equation: '3Ca²⁺(aq) + 2PO₄³⁻(aq) → Ca₃(PO₄)₂(s)↓', title: 'Calcium phosphate precipitation', color: 'white' },
  ];
  for (const rule of precipitations) {
    const cationRatio = ('cationRatio' in rule ? rule.cationRatio : 1) || 1;
    const amount = Math.min((ions[rule.cation] || 0) / cationRatio, (ions[rule.anion] || 0) / rule.ratio);
    if (amount <= 1e-8) continue;
    ions[rule.cation] -= amount * cationRatio; ions[rule.anion] -= amount * rule.ratio;
    state.solidsMol[rule.solid] = (state.solidsMol[rule.solid] || 0) + amount;
    events.push(record(state, { title: rule.title, equation: rule.equation, detail: `${(amount * 1000).toFixed(2)} mmol of insoluble ${rule.solid.replace('(s)', '')} formed as a ${rule.color} precipitate.`, heatJ: 0, gasMoles: 0, precipitate: rule.solid }));
  }
  for (const [anion, protonRatio, equation] of [['CO₃²-', 2, 'CO₃²⁻(aq) + 2H⁺(aq) → CO₂(g)↑ + H₂O(l)'], ['HCO₃-', 1, 'HCO₃⁻(aq) + H⁺(aq) → CO₂(g)↑ + H₂O(l)']] as const) {
    const carbonate = Math.min((ions[anion] || 0), (ions['H+'] || 0) / protonRatio);
    if (carbonate <= 1e-8) continue;
    ions[anion] -= carbonate; ions['H+'] -= protonRatio * carbonate;
    events.push(record(state, { title: 'Carbon dioxide evolution', equation, detail: `${(carbonate * 1000).toFixed(2)} mmol of carbon dioxide gas evolved.`, heatJ: 0, gasMoles: carbonate, gasSpecies: 'CO₂' }));
  }
  const limeMoles = Math.min(state.solidsMol['CaCO₃(s)'] || 0, (ions['H+'] || 0) / 2);
  if (limeMoles > 1e-8) {
    state.solidsMol['CaCO₃(s)'] -= limeMoles; ions['H+'] -= limeMoles * 2; ions['Ca²+'] = (ions['Ca²+'] || 0) + limeMoles;
    events.push(record(state, { title: 'Carbon dioxide from carbonate', equation: 'CaCO₃(s) + 2H⁺(aq) → Ca²⁺(aq) + CO₂(g)↑ + H₂O(l)', detail: `${(limeMoles * 1000).toFixed(2)} mmol of carbon dioxide gas evolved.`, heatJ: 0, gasMoles: limeMoles, gasSpecies: 'CO₂' }));
  }
  for (const [metal, ionKey, heatPerMol] of [['Mg', 'Mg²+', 466_000], ['Zn', 'Zn²+', 153_000], ['Fe', 'Fe²+', 95_000], ['Al', 'Al³+', 0]] as const) {
    const solidKey = `${metal}(s)`, available = state.solidsMol[solidKey] || 0;
    const protonsPerMetal = metal === 'Al' ? 3 : 2;
    const hydrogenPerMetal = metal === 'Al' ? 1.5 : 1;
    const reactedMetalMoles = Math.min(available, (ions['H+'] || 0) / protonsPerMetal);
    if (reactedMetalMoles <= 1e-8) continue;
    const protonsUsed = reactedMetalMoles * protonsPerMetal;
    const hydrogen = reactedMetalMoles * hydrogenPerMetal;
    ions['H+'] -= protonsUsed; ions[ionKey] = (ions[ionKey] || 0) + reactedMetalMoles;
    state.solidsMol[solidKey] = Math.max(0, available - reactedMetalMoles);
    const equation = metal === 'Al' ? '2Al(s) + 6H⁺(aq) → 2Al³⁺(aq) + 3H₂(g)↑' : `${metal}(s) + 2H⁺(aq) → ${ionKey}(aq) + H₂(g)↑`;
    events.push(record(state, { title: 'Single displacement', equation, detail: `${(reactedMetalMoles * 1000).toFixed(2)} mmol of ${metal} reacted; hydrogen bubbles formed.`, heatJ: reactedMetalMoles * heatPerMol, gasMoles: hydrogen, gasSpecies: 'H₂' }));
  }
  return events;
}
export function addChemical(current: ContainerState, chemicalId: ChemicalId, amount: number): AddChemicalResult {
  const chemical = CHEMICALS.find(item => item.id === chemicalId);
  if (!chemical) throw new Error('That chemical is not on the shelf.');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than zero.');
  const state: ContainerState = { ...current, ionsMol: { ...current.ionsMol }, solidsMol: { ...current.solidsMol }, gasBySpecies: { ...current.gasBySpecies }, indicators: [...current.indicators], solvents: [...current.solvents], reactions: [...current.reactions] };
  const dose = chemical.doseLabel === 'g' ? Math.min(amount, 5) : Math.min(amount, 250);
  if (chemical.stockMolarity && chemical.ionComposition) {
    const moles = chemical.stockMolarity * dose / 1000;
    for (const [ion, ratio] of Object.entries(chemical.ionComposition)) state.ionsMol[ion] = (state.ionsMol[ion] || 0) + moles * ratio;
    state.volumeMl += dose;
  } else if (chemical.solidKey) {
    state.solidsMol[chemical.solidKey] = (state.solidsMol[chemical.solidKey] || 0) + dose / (chemical.molarMass || 1);
  } else if (chemical.solvent) {
    state.solvents = [...new Set([...state.solvents, chemicalId])]; state.volumeMl += dose;
  } else {
    state.indicators = [...new Set([...state.indicators, chemicalId])]; state.volumeMl += dose;
  }
  const events = react(state);
  return { state, addedLabel: `${dose} ${chemical.doseLabel} ${chemical.formula}`, events };
}
export function pHOf(state: ContainerState): number {
  const volumeL = Math.max(state.volumeMl / 1000, 0.001), h = (state.ionsMol['H+'] || 0) / volumeL, oh = (state.ionsMol['OH-'] || 0) / volumeL;
  if (h > oh) return clamp(-Math.log10(Math.max(h - oh, 1e-14)), 0, 14);
  if (oh > h) return clamp(14 + Math.log10(Math.max(oh - h, 1e-14)), 0, 14);
  return 7;
}
export function ionConcentrations(state: ContainerState): Array<{ ion: IonId; molarity: number; moles: number }> {
  const volumeL = Math.max(state.volumeMl / 1000, 0.001);
  return Object.entries(state.ionsMol).filter(([, n]) => n > 1e-8).map(([ion, moles]) => ({ ion, moles, molarity: moles / volumeL }));
}
export function contentsOf(state: ContainerState): string[] {
  const contents = ionConcentrations(state).map(({ ion, molarity }) => `${ion} · ${molarity.toFixed(3)} M`);
  for (const [solid, moles] of Object.entries(state.solidsMol)) if (moles > 1e-8) contents.push(`${solid} · ${(moles * 1000).toFixed(2)} mmol`);
  if (state.indicators.includes('phenolphthalein')) contents.push('Phenolphthalein indicator');
  if (state.indicators.includes('universal')) contents.push('Universal indicator');
  for (const solvent of state.solvents) contents.push(`${CHEMICALS.find(item => item.id === solvent)?.name || solvent} solvent`);
  for (const [species, moles] of Object.entries(state.gasBySpecies)) if (moles > 1e-7) contents.push(`${species}(g) · ${(moles * 1000).toFixed(2)} mmol evolved`);
  return contents.length ? contents : ['Deionized water'];
}
export function liquidColor(state: ContainerState): string {
  const pH = pHOf(state);
  if (state.indicators.includes('phenolphthalein') && pH >= 8.2) return '#f05aa6';
  if (state.indicators.includes('methyl-orange')) return pH < 3.1 ? '#ef594e' : pH < 4.4 ? '#ed9d42' : '#e7d34e';
  if (state.indicators.includes('litmus')) return pH < 4.5 ? '#e94f62' : pH > 8.3 ? '#5488d8' : '#9169bb';
  if (state.indicators.includes('bromothymol-blue')) return pH < 6 ? '#e8d342' : pH < 7.6 ? '#57c27e' : '#4292db';
  if (state.indicators.includes('universal')) {
    if (pH < 3) return '#e8484f'; if (pH < 5) return '#f28c42'; if (pH < 6.5) return '#e9ce4d'; if (pH < 7.5) return '#58be76'; if (pH < 9) return '#3aaaca'; if (pH < 11) return '#477ce0'; return '#8753c7';
  }
  if ((state.ionsMol['Cu²+'] || 0) > 0.001) return '#48a6d4';
  if ((state.ionsMol['Fe³+'] || 0) > 0.001) return '#be9863';
  return '#b9e5d6';
}
export function makeContainer(kind: VesselKind, number: number) { return createContainer(kind, number); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

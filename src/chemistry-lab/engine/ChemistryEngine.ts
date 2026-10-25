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
];

const stockWaterMl = 50;
const heatCapacity = 4.184;
const freshIons = (): Record<IonId, number> => ({});
export function createContainer(kind: VesselKind = 'Beaker', number = 1): ContainerState {
  return { id: crypto.randomUUID(), label: `${kind} ${number}`, kind, volumeMl: stockWaterMl, temperatureC: 20, ionsMol: freshIons(), solidsMol: {}, indicators: [], gasMoles: 0, gasBySpecies: {}, reactions: [] };
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
  ];
  for (const rule of precipitations) {
    const amount = Math.min((ions[rule.cation] || 0), (ions[rule.anion] || 0) / rule.ratio);
    if (amount <= 1e-8) continue;
    ions[rule.cation] -= amount; ions[rule.anion] -= amount * rule.ratio;
    state.solidsMol[rule.solid] = (state.solidsMol[rule.solid] || 0) + amount;
    events.push(record(state, { title: rule.title, equation: rule.equation, detail: `${(amount * 1000).toFixed(2)} mmol of insoluble ${rule.solid.replace('(s)', '')} formed as a ${rule.color} precipitate.`, heatJ: 0, gasMoles: 0, precipitate: rule.solid }));
  }
  const carbonate = Math.min((ions['CO₃²-'] || 0), (ions['H+'] || 0) / 2);
  if (carbonate > 1e-8) {
    ions['CO₃²-'] -= carbonate; ions['H+'] -= 2 * carbonate;
    events.push(record(state, { title: 'Carbon dioxide evolution', equation: 'CO₃²⁻(aq) + 2H⁺(aq) → CO₂(g)↑ + H₂O(l)', detail: `${(carbonate * 1000).toFixed(2)} mmol of carbon dioxide gas evolved.`, heatJ: 0, gasMoles: carbonate, gasSpecies: 'CO₂' }));
  }
  for (const [metal, ionKey, heatPerMol] of [['Mg', 'Mg²+', 466_000], ['Zn', 'Zn²+', 153_000], ['Fe', 'Fe²+', 95_000]] as const) {
    const solidKey = `${metal}(s)`, available = state.solidsMol[solidKey] || 0;
    const reacted = Math.min(available, (ions['H+'] || 0) / 2);
    if (reacted <= 1e-8) continue;
    ions['H+'] -= 2 * reacted; ions[ionKey] = (ions[ionKey] || 0) + reacted;
    state.solidsMol[solidKey] = Math.max(0, available - reacted);
    events.push(record(state, { title: 'Single displacement', equation: `${metal}(s) + 2H⁺(aq) → ${ionKey}(aq) + H₂(g)↑`, detail: `${(reacted * 1000).toFixed(2)} mmol of ${metal} reacted; hydrogen bubbles formed.`, heatJ: reacted * heatPerMol, gasMoles: reacted, gasSpecies: 'H₂' }));
  }
  return events;
}
export function addChemical(current: ContainerState, chemicalId: ChemicalId, amount: number): AddChemicalResult {
  const chemical = CHEMICALS.find(item => item.id === chemicalId);
  if (!chemical) throw new Error('That chemical is not on the shelf.');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than zero.');
  const state: ContainerState = { ...current, ionsMol: { ...current.ionsMol }, solidsMol: { ...current.solidsMol }, gasBySpecies: { ...current.gasBySpecies }, indicators: [...current.indicators], reactions: [...current.reactions] };
  const dose = chemical.doseLabel === 'g' ? Math.min(amount, 5) : Math.min(amount, 250);
  if (chemical.stockMolarity && chemical.ionComposition) {
    const moles = chemical.stockMolarity * dose / 1000;
    for (const [ion, ratio] of Object.entries(chemical.ionComposition)) state.ionsMol[ion] = (state.ionsMol[ion] || 0) + moles * ratio;
    state.volumeMl += dose;
  } else if (chemical.solidKey) {
    state.solidsMol[chemical.solidKey] = (state.solidsMol[chemical.solidKey] || 0) + dose / (chemical.molarMass || 1);
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
  for (const [species, moles] of Object.entries(state.gasBySpecies)) if (moles > 1e-7) contents.push(`${species}(g) · ${(moles * 1000).toFixed(2)} mmol evolved`);
  return contents.length ? contents : ['Deionized water'];
}
export function liquidColor(state: ContainerState): string {
  const pH = pHOf(state);
  if (state.indicators.includes('phenolphthalein') && pH >= 8.2) return '#f05aa6';
  if (state.indicators.includes('universal')) {
    if (pH < 3) return '#e8484f'; if (pH < 5) return '#f28c42'; if (pH < 6.5) return '#e9ce4d'; if (pH < 7.5) return '#58be76'; if (pH < 9) return '#3aaaca'; if (pH < 11) return '#477ce0'; return '#8753c7';
  }
  if ((state.ionsMol['Cu²+'] || 0) > 0.001) return '#48a6d4';
  return '#b9e5d6';
}
export function makeContainer(kind: VesselKind, number: number) { return createContainer(kind, number); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

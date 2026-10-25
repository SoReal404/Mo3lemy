import type { AddChemicalResult, ChemicalDefinition, ChemicalId, ContainerState, IonId, ReactionRecord, VesselKind } from './types';

export const CHEMICALS: ChemicalDefinition[] = [
  { id: 'hcl', name: 'Hydrochloric acid', formula: 'HCl', category: 'Acids', color: '#e68b70', stockMolarity: 1, doseLabel: 'mL', shortDescription: 'Strong acid · 1.0 M' },
  { id: 'naoh', name: 'Sodium hydroxide', formula: 'NaOH', category: 'Bases', color: '#78a8ed', stockMolarity: 1, doseLabel: 'mL', shortDescription: 'Strong base · 1.0 M' },
  { id: 'phenolphthalein', name: 'Phenolphthalein', formula: 'C₂₀H₁₄O₄', category: 'Indicators', color: '#e7b2d0', doseLabel: 'mL', shortDescription: 'Clear in acid · pink in base' },
  { id: 'universal', name: 'Universal indicator', formula: 'pH', category: 'Indicators', color: '#88bf86', doseLabel: 'mL', shortDescription: 'Colour shifts with pH' },
  { id: 'magnesium', name: 'Magnesium ribbon', formula: 'Mg', category: 'Metals', color: '#b9c7c0', molarMass: 24.305, doseLabel: 'g', shortDescription: 'Reactive metal · 0.15 g' },
  { id: 'zinc', name: 'Zinc granules', formula: 'Zn', category: 'Metals', color: '#a3b4ad', molarMass: 65.38, doseLabel: 'g', shortDescription: 'Reactive metal · 0.15 g' },
  { id: 'copper-sulfate', name: 'Copper(II) sulfate', formula: 'CuSO₄', category: 'Salts', color: '#4aa9d1', stockMolarity: 0.5, doseLabel: 'mL', shortDescription: 'Blue solution · 0.5 M' },
];

const stockWaterMl = 50;
const heatCapacity = 4.184; // J g⁻¹ °C⁻¹, approximate aqueous solution
const freshIons = (): Record<IonId, number> => ({ 'H+': 0, 'Cl-': 0, 'Na+': 0, 'OH-': 0, 'Cu2+': 0, 'SO4_2-': 0, 'Mg2+': 0, 'Zn2+': 0 });

export function createContainer(kind: VesselKind = 'Beaker', number = 1): ContainerState {
  return {
    id: crypto.randomUUID(), label: `${kind} ${number}`, kind, volumeMl: stockWaterMl, temperatureC: 20,
    ionsMol: freshIons(), solidsMol: {}, indicators: [], gasMoles: 0, reactions: [],
  };
}

function record(state: ContainerState, event: Omit<ReactionRecord, 'id' | 'at'>): ReactionRecord {
  const saved: ReactionRecord = { ...event, id: crypto.randomUUID(), at: Date.now() };
  state.reactions = [...state.reactions, saved].slice(-8);
  state.gasMoles += event.gasMoles;
  if (event.heatJ > 0) state.temperatureC += event.heatJ / (Math.max(state.volumeMl, 1) * heatCapacity);
  return saved;
}

function react(state: ContainerState): ReactionRecord[] {
  const events: ReactionRecord[] = [];
  const ions = state.ionsMol;

  // Strong acid + strong base: H⁺ + OH⁻ → H₂O.
  const neutralized = Math.min(ions['H+'], ions['OH-']);
  if (neutralized > 1e-8) {
    ions['H+'] -= neutralized;
    ions['OH-'] -= neutralized;
    events.push(record(state, {
      title: 'Neutralization', equation: 'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)',
      detail: `${(neutralized * 1000).toFixed(2)} mmol of H⁺ and OH⁻ formed water. About ${(57_100 * neutralized).toFixed(0)} J of heat was released.`,
      heatJ: 57_100 * neutralized, gasMoles: 0,
    }));
  }

  // Insoluble copper(II) hydroxide forms when Cu²⁺ meets enough OH⁻.
  const precipitated = Math.min(ions['Cu2+'], ions['OH-'] / 2);
  if (precipitated > 1e-8) {
    ions['Cu2+'] -= precipitated;
    ions['OH-'] -= 2 * precipitated;
    state.solidsMol['Cu(OH)2(s)'] = (state.solidsMol['Cu(OH)2(s)'] || 0) + precipitated;
    events.push(record(state, {
      title: 'Precipitation', equation: 'CuSO₄(aq) + 2NaOH(aq) → Cu(OH)₂(s)↓ + Na₂SO₄(aq)',
      detail: `${(precipitated * 1000).toFixed(2)} mmol of insoluble copper(II) hydroxide formed as a blue precipitate.`,
      heatJ: 0, gasMoles: 0, precipitate: 'Cu(OH)₂(s)',
    }));
  }

  // Magnesium and zinc displace hydrogen from a strong acid.
  for (const metal of ['Mg', 'Zn'] as const) {
    const solidKey = `${metal}(s)` as 'Mg(s)' | 'Zn(s)';
    const ionKey = `${metal}2+` as 'Mg2+' | 'Zn2+';
    const available = state.solidsMol[solidKey] || 0;
    const reacted = Math.min(available, ions['H+'] / 2);
    if (reacted <= 1e-8) continue;
    ions['H+'] -= 2 * reacted;
    ions[ionKey] += reacted;
    state.solidsMol[solidKey] = Math.max(0, available - reacted);
    const heatJ = reacted * (metal === 'Mg' ? 466_000 : 153_000);
    events.push(record(state, {
      title: 'Single displacement', equation: `${metal}(s) + 2HCl(aq) → ${metal}Cl₂(aq) + H₂(g)↑`,
      detail: `${(reacted * 1000).toFixed(2)} mmol of ${metal} reacted; hydrogen bubbles formed. The temperature rise is an idealized estimate.`,
      heatJ, gasMoles: reacted,
    }));
  }
  return events;
}

export function addChemical(current: ContainerState, chemicalId: ChemicalId, amount: number): AddChemicalResult {
  const chemical = CHEMICALS.find(item => item.id === chemicalId);
  if (!chemical) throw new Error('That chemical is not on the shelf.');
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter an amount greater than zero.');

  const state: ContainerState = {
    ...current, ionsMol: { ...current.ionsMol }, solidsMol: { ...current.solidsMol },
    indicators: [...current.indicators], reactions: [...current.reactions],
  };
  const previousEventCount = state.reactions.length;
  const dose = chemicalId === 'magnesium' || chemicalId === 'zinc' ? Math.min(amount, 5) : Math.min(amount, 250);

  if (chemical.stockMolarity) {
    const volumeL = dose / 1000;
    const moles = chemical.stockMolarity * volumeL;
    state.volumeMl += dose;
    if (chemicalId === 'hcl') { state.ionsMol['H+'] += moles; state.ionsMol['Cl-'] += moles; }
    if (chemicalId === 'naoh') { state.ionsMol['Na+'] += moles; state.ionsMol['OH-'] += moles; }
    if (chemicalId === 'copper-sulfate') { state.ionsMol['Cu2+'] += moles; state.ionsMol['SO4_2-'] += moles; }
  } else if (chemicalId === 'magnesium' || chemicalId === 'zinc') {
    const key = chemicalId === 'magnesium' ? 'Mg(s)' : 'Zn(s)';
    state.solidsMol[key] = (state.solidsMol[key] || 0) + dose / (chemical.molarMass || 1);
  } else {
    state.indicators = [...new Set([...state.indicators, chemicalId])];
    state.volumeMl += dose;
  }

  const events = react(state);
  const addedLabel = `${dose} ${chemical.doseLabel} ${chemical.formula}`;
  if (!events.length) {
    state.reactions = state.reactions.slice(0, previousEventCount);
  }
  return { state, addedLabel, events };
}

export function pHOf(state: ContainerState): number {
  const volumeL = Math.max(state.volumeMl / 1000, 0.001);
  const h = state.ionsMol['H+'] / volumeL;
  const oh = state.ionsMol['OH-'] / volumeL;
  if (h > oh) return clamp(-Math.log10(Math.max(h - oh, 1e-14)), 0, 14);
  if (oh > h) return clamp(14 + Math.log10(Math.max(oh - h, 1e-14)), 0, 14);
  return 7;
}

export function ionConcentrations(state: ContainerState): Array<{ ion: IonId; molarity: number; moles: number }> {
  const volumeL = Math.max(state.volumeMl / 1000, 0.001);
  return (Object.entries(state.ionsMol) as Array<[IonId, number]>)
    .filter(([, moles]) => moles > 1e-8)
    .map(([ion, moles]) => ({ ion, moles, molarity: moles / volumeL }));
}

export function contentsOf(state: ContainerState): string[] {
  const contents = ionConcentrations(state).map(({ ion, molarity }) => `${ion} · ${molarity.toFixed(3)} M`);
  for (const [solid, moles] of Object.entries(state.solidsMol)) if (moles && moles > 1e-8) contents.push(`${solid} · ${(moles * 1000).toFixed(2)} mmol`);
  if (state.indicators.includes('phenolphthalein')) contents.push('Phenolphthalein indicator');
  if (state.indicators.includes('universal')) contents.push('Universal indicator');
  if (state.gasMoles > 1e-7) contents.push(`H₂(g) · ${(state.gasMoles * 1000).toFixed(2)} mmol evolved`);
  return contents.length ? contents : ['Deionized water'];
}

export function liquidColor(state: ContainerState): string {
  const pH = pHOf(state);
  if (state.indicators.includes('phenolphthalein') && pH >= 8.2) return '#f05aa6';
  if (state.indicators.includes('universal')) {
    if (pH < 3) return '#e8484f';
    if (pH < 5) return '#f28c42';
    if (pH < 6.5) return '#e9ce4d';
    if (pH < 7.5) return '#58be76';
    if (pH < 9) return '#3aaaca';
    if (pH < 11) return '#477ce0';
    return '#8753c7';
  }
  if (state.ionsMol['Cu2+'] > 0.001) return '#48a6d4';
  return '#b9e5d6';
}

export function makeContainer(kind: VesselKind, number: number): ContainerState { return createContainer(kind, number); }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }

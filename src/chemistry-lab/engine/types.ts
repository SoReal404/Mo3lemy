export type ChemicalId = 'hcl' | 'nitric-acid' | 'sulfuric-acid' | 'phosphoric-acid' | 'acetic-acid' | 'citric-acid' | 'formic-acid' | 'naoh' | 'koh' | 'calcium-hydroxide' | 'ammonia' | 'phenolphthalein' | 'universal' | 'methyl-orange' | 'litmus' | 'bromothymol-blue' | 'magnesium' | 'zinc' | 'iron' | 'aluminum' | 'copper' | 'copper-sulfate' | 'silver-nitrate' | 'barium-chloride' | 'sodium-carbonate' | 'sodium-bicarbonate' | 'iron-chloride' | 'potassium-iodide' | 'sodium-chloride' | 'sodium-sulfate' | 'magnesium-sulfate' | 'calcium-chloride' | 'potassium-nitrate' | 'potassium-carbonate' | 'ammonium-chloride' | 'sodium-phosphate' | 'calcium-carbonate' | 'ethanol';
export type VesselKind = 'Beaker' | 'Erlenmeyer flask' | 'Test tube';
export type IonId = string;

export interface ChemicalDefinition {
  id: ChemicalId;
  name: string;
  formula: string;
  category: 'Acids' | 'Bases' | 'Indicators' | 'Metals' | 'Salts' | 'Solvents';
  color: string;
  stockMolarity?: number;
  molarMass?: number;
  ionComposition?: Record<string, number>;
  solidKey?: string;
  acidEquivalents?: number;
  baseEquivalents?: number;
  solvent?: boolean;
  information?: string;
  doseLabel: string;
  shortDescription: string;
}

export interface ReactionRecord {
  id: string;
  equation: string;
  title: string;
  detail: string;
  heatJ: number;
  gasMoles: number;
  gasSpecies?: string;
  precipitate?: string;
  at: number;
}

export interface ContainerState {
  id: string;
  label: string;
  kind: VesselKind;
  volumeMl: number;
  temperatureC: number;
  ionsMol: Record<IonId, number>;
  solidsMol: Record<string, number>;
  indicators: ChemicalId[];
  solvents: ChemicalId[];
  gasMoles: number;
  gasBySpecies: Record<string, number>;
  gasSpecies?: string;
  reactions: ReactionRecord[];
}

export const IONS: IonId[] = ['H+', 'Cl-', 'Na+', 'OH-', 'Cu2+', 'SO4_2-', 'Mg2+', 'Zn2+'];

export interface AddChemicalResult {
  state: ContainerState;
  addedLabel: string;
  events: ReactionRecord[];
}

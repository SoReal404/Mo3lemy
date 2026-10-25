export type ChemicalId = 'hcl' | 'nitric-acid' | 'sulfuric-acid' | 'naoh' | 'koh' | 'calcium-hydroxide' | 'phenolphthalein' | 'universal' | 'magnesium' | 'zinc' | 'iron' | 'copper-sulfate' | 'silver-nitrate' | 'barium-chloride' | 'sodium-carbonate' | 'iron-chloride' | 'potassium-iodide';
export type VesselKind = 'Beaker' | 'Erlenmeyer flask' | 'Test tube';
export type IonId = string;

export interface ChemicalDefinition {
  id: ChemicalId;
  name: string;
  formula: string;
  category: 'Acids' | 'Bases' | 'Indicators' | 'Metals' | 'Salts';
  color: string;
  stockMolarity?: number;
  molarMass?: number;
  ionComposition?: Record<string, number>;
  solidKey?: string;
  acidEquivalents?: number;
  baseEquivalents?: number;
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

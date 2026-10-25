export type ChemicalId = 'hcl' | 'naoh' | 'phenolphthalein' | 'universal' | 'magnesium' | 'zinc' | 'copper-sulfate';
export type VesselKind = 'Beaker' | 'Erlenmeyer flask' | 'Test tube';
export type IonId = 'H+' | 'Cl-' | 'Na+' | 'OH-' | 'Cu2+' | 'SO4_2-' | 'Mg2+' | 'Zn2+';

export interface ChemicalDefinition {
  id: ChemicalId;
  name: string;
  formula: string;
  category: 'Acids' | 'Bases' | 'Indicators' | 'Metals' | 'Salts';
  color: string;
  stockMolarity?: number;
  molarMass?: number;
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
  solidsMol: Partial<Record<'Mg(s)' | 'Zn(s)' | 'Cu(OH)2(s)', number>>;
  indicators: ChemicalId[];
  gasMoles: number;
  reactions: ReactionRecord[];
}

export const IONS: IonId[] = ['H+', 'Cl-', 'Na+', 'OH-', 'Cu2+', 'SO4_2-', 'Mg2+', 'Zn2+'];

export interface AddChemicalResult {
  state: ContainerState;
  addedLabel: string;
  events: ReactionRecord[];
}

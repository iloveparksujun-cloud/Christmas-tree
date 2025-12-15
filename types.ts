export type Vector3 = [number, number, number];

export enum AppState {
  SCATTERED = 'SCATTERED',
  FORMING_CORE = 'FORMING_CORE',
  FORMING_MASS = 'FORMING_MASS',
  FORMING_GOLD = 'FORMING_GOLD',
  COMPLETED = 'COMPLETED'
}

export interface ParticleProps {
  count: number;
  color: string;
  size: number;
  noiseStrength: number;
  type: 'green' | 'gold' | 'red';
}

export interface AudioState {
  intensity: number; // 0 to 1
  isFormed: boolean;
}
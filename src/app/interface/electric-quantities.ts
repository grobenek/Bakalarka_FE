import { ElectricPhase } from './electric-phase';
export enum ElectricQuantities {
  CURRENT = 'CURRENT',
  GRID_FREQUENCY = 'GRID_FREQUENCY',
  VOLTAGE = 'VOLTAGE',
}

export interface Voltage {
  voltage: number;
  time: Date;
  phase: ElectricPhase;
}

export interface GridFrequency {
  frequency: number;
  time: Date;
}

export interface Current {
  current: number;
  time: string;
  phase: ElectricPhase;
}

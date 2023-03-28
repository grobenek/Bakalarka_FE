export enum ElectricQuantities {
  CURRENT = 'CURRENT',
  GRID_FREQUENCY = 'GRID_FREQUENCY',
  VOLTAGE = 'VOLTAGE',
}

export interface Voltage {
  voltage: number;
  time: string;
  phase: string;
}

export interface GridFrequency {
  frequency: number;
  time: string;
}

export interface Current {
  current: number;
  time: string;
  phase: string;
}

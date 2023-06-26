import { Current, Voltage, GridFrequency } from './electric-quantities';
export interface ElectricData {
  currents: Current[],
  voltages: Voltage[],
  gridFrequencies: GridFrequency[]
}

export interface ElectricDataMinMaxMean {
  minCurrents: Current[],
  maxCurrents: Current[],
  meanCurrents: Current[],
  minVoltages: Voltage[],
  maxVoltages: Voltage[],
  meanVoltages: Voltage[],
  minGridFrequencies: GridFrequency[],
  maxGridFrequencies: GridFrequency[],
  meanGridFrequencies: GridFrequency[]
}

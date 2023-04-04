import { Current, ElectricQuantities, Voltage } from './electric-quantities';
export interface PieChartElectricData {
  currents: Current[],
  voltages: Voltage[]
}

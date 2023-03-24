import { Temperature } from "./temperature";

export interface TemperatureMinMaxMean {
  minTemperatures: Temperature[];
  maxTemperatures: Temperature[];
  meanTemperatures: Temperature[];
}

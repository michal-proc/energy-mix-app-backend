import { FuelType } from '../enums/fuel-type.enum';

export interface FuelShare {
  fuel: FuelType;
  percentage: number;
}

export interface DailyEnergyMix {
  date: string;
  intervals: number;
  generationMix: FuelShare[];
  cleanEnergyPercentage: number;
}

export interface ChargingWindow {
  windowHours: number;
  from: string;
  to: string;
  averageCleanEnergyPercentage: number;
}

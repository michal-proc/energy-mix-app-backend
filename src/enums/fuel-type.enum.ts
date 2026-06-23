export enum FuelType {
  BIOMASS = 'biomass',
  COAL = 'coal',
  IMPORTS = 'imports',
  GAS = 'gas',
  NUCLEAR = 'nuclear',
  OTHER = 'other',
  HYDRO = 'hydro',
  SOLAR = 'solar',
  WIND = 'wind'
}

export const CLEAN_FUEL_TYPES: ReadonlySet<FuelType> = new Set([
  FuelType.BIOMASS,
  FuelType.NUCLEAR,
  FuelType.HYDRO,
  FuelType.WIND,
  FuelType.SOLAR
]);

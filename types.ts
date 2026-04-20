export interface EnergyDataPoint {
  date: string; // Format: 'YYYY-MM-DD'
  consumption: number; // in kWh
}

export interface Forecast {
  forecastData: EnergyDataPoint[];
  analysis: string;
}
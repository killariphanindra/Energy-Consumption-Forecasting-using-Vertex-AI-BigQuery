import React, { useState, useCallback } from 'react';
import type { EnergyDataPoint } from './types';
import type { Forecast } from './types';
import Header from './components/Header';
import EnergyChart from './components/Chart';
import ForecastPanel from './components/ForecastPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ManualInputPanel from './components/ManualInputPanel';
import { HISTORICAL_DATA } from './data/energyData';
import { getEnergyForecast } from './services/geminiService';

const App: React.FC = () => {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<EnergyDataPoint[]>(HISTORICAL_DATA);
  const [forecastDays, setForecastDays] = useState<number>(14);

  const clearState = () => {
    setError(null);
    setForecast(null);
  };

  const handleDataChange = useCallback((newData: EnergyDataPoint[]) => {
    clearState();
    setChartData(newData);
  }, []);
  
  const handleReset = useCallback(() => {
    clearState();
    setChartData(HISTORICAL_DATA);
    setForecastDays(14);
  }, []);

  const handleForecast = useCallback(async () => {
    if (chartData.length < 5) {
        setError("Please provide at least 5 data points for a meaningful forecast.");
        return;
    }
    
    if (forecastDays < 1 || forecastDays > 365) {
        setError("Please enter a forecast period between 1 and 365 days.");
        return;
    }

    setIsLoading(true);
    clearState();
    try {
      const forecastResult = await getEnergyForecast(chartData, forecastDays);
      setForecast(forecastResult);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [chartData, forecastDays]);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <ManualInputPanel
          initialData={chartData}
          onDataChange={handleDataChange}
          onReset={handleReset}
          forecastDays={forecastDays}
          onForecastDaysChange={setForecastDays}
        />
        
        <div className="mt-8 bg-slate-800/50 rounded-2xl shadow-2xl p-4 md:p-6 ring-1 ring-white/10 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-bold text-cyan-300 mb-4">Energy Consumption Data</h2>
          <div className="h-80 md:h-96 w-full">
            <EnergyChart historicalData={chartData} forecastData={forecast?.forecastData ?? []} />
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleForecast}
            disabled={isLoading}
            className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-bold py-3 px-8 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg shadow-cyan-500/20"
          >
            {isLoading ? 'Forecasting...' : `Generate ${forecastDays}-Day Forecast`}
          </button>
        </div>

        <div className="mt-8">
          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <LoadingSpinner />
            </div>
          )}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center my-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          {forecast && !isLoading && <ForecastPanel forecast={forecast} />}
        </div>
      </main>
      <footer className="text-center py-6 text-slate-500 text-sm">
        <p>Powered by React, Tailwind CSS, and Gemini API</p>
      </footer>
    </div>
  );
};

export default App;

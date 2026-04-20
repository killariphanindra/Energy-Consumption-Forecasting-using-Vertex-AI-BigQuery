import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_NAME } from '../constants';
import type { EnergyDataPoint, Forecast } from '../types';

const getEnergyForecast = async (
  historicalData: EnergyDataPoint[],
  forecastDays: number,
): Promise<Forecast> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const historicalDataString = historicalData
    .map((d) => `${d.date},${d.consumption}`)
    .join('\n');

  const prompt = `
    You are an expert in energy consumption time-series forecasting.
    Based on the following historical data (in format YYYY-MM-DD,Consumption in kWh), please provide a forecast for the next ${forecastDays} days.

    Historical Data:
    ${historicalDataString}

    Provide your response as a JSON object. The JSON object should have two keys:
    1. "forecastData": An array of ${forecastDays} objects, where each object represents a forecasted day and has "date" (in "YYYY-MM-DD" format) and "consumption" (a number) keys. Ensure the dates are sequential, starting from the day after the last historical data point.
    2. "analysis": A brief, insightful text analysis (2-3 sentences) of the forecast. Highlight key trends, potential peak consumption days, and any notable patterns.
    `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      forecastData: {
        type: Type.ARRAY,
        description: `An array of ${forecastDays} forecasted data points.`,
        items: {
          type: Type.OBJECT,
          properties: {
            date: {
              type: Type.STRING,
              description: "The date of the forecast in 'YYYY-MM-DD' format.",
            },
            consumption: {
              type: Type.NUMBER,
              description: "The forecasted energy consumption in kWh.",
            },
          },
          required: ['date', 'consumption']
        },
      },
      analysis: {
        type: Type.STRING,
        description: "A brief analysis of the forecast trends."
      }
    },
    required: ['forecastData', 'analysis']
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.5,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse: Forecast = JSON.parse(jsonText);
    
    // Validate the response structure
    if (!Array.isArray(parsedResponse.forecastData) || parsedResponse.forecastData.length === 0 || !parsedResponse.analysis) {
        throw new Error("Invalid forecast data structure received from API.");
    }
    
    return parsedResponse;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to retrieve forecast from the AI model. Please check your API key and try again.");
  }
};

export { getEnergyForecast };
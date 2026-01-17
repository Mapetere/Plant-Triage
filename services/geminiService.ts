
import { GoogleGenAI, Type } from "@google/genai";
import { PlantDiagnosis, DiaryEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzePlant(base64Image: string, history?: DiaryEntry[]): Promise<PlantDiagnosis> {
  const parts: any[] = [
    { inlineData: { mimeType: "image/jpeg", data: base64Image } }
  ];

  let historyPrompt = "";
  if (history && history.length > 0) {
    const lastEntry = history[history.length - 1];
    parts.push({ inlineData: { mimeType: "image/jpeg", data: lastEntry.imageBase64 } });
    historyPrompt = `I have provided a second image which is the previous state of this plant from ${lastEntry.date}. 
    Please compare the current image with this previous state. Detect any changes in health, color, or growth. 
    In your 'mathematicalAnalysis', include a 'Delta Change' insight.`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: {
      parts: [
        ...parts,
        {
          text: `CRITICAL INSTRUCTION: First, determine if the image shows a plant or a plant part (leaf, stem, flower). 
          If the image shows a person, an animal, or any non-plant object, you MUST set "isPlant" to false.
          If "isPlant" is false, do not provide any actual analysis. Set names to "N/A" and scores to 0.
          
          If it IS a plant, set "isPlant" to true and perform a mathematical botanical triage.
          Return the data in a structured JSON format. ${historyPrompt}
          
          Include a 'mathematicalAnalysis' property describing health using quantitative concepts.
          Provide 'mathMetrics' (5 key indicators: Chlorophyll Density, Surface Area, Fractal Dimension, Stomatal Conductance, Turgor Pressure).
          Provide 'growthProjection' (10 points, day 1-30).`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isPlant: { type: Type.BOOLEAN },
          commonName: { type: Type.STRING },
          scientificName: { type: Type.STRING },
          healthScore: { type: Type.NUMBER },
          diagnosis: { type: Type.STRING },
          symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
          mathematicalAnalysis: { type: Type.STRING },
          mathMetrics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                max: { type: Type.NUMBER }
              },
              required: ["label", "value", "unit", "max"]
            }
          },
          careInstructions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                action: { type: Type.STRING },
                frequency: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["action", "frequency", "description"]
            }
          },
          growthProjection: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                health: { type: Type.NUMBER },
                size: { type: Type.NUMBER }
              },
              required: ["day", "health", "size"]
            }
          }
        },
        required: ["isPlant", "commonName", "scientificName", "healthScore", "diagnosis", "symptoms", "mathematicalAnalysis", "mathMetrics", "careInstructions", "growthProjection"]
      }
    }
  });

  return JSON.parse(response.text) as PlantDiagnosis;
}

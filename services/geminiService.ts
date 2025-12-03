import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CastingRole } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Schema for the AI output
const castingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    roles: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the character or role (e.g., 'Narrator', 'Dad')" },
          description: { type: Type.STRING, description: "Brief description of the role's personality and context" },
          gender: { type: Type.STRING, description: "Gender of the voice (Male, Female, Non-binary, Any)" },
          ageRange: { type: Type.STRING, description: "Estimated age range (e.g., '30-40', 'Child', 'Senior')" },
          voiceType: { type: Type.STRING, description: "Adjectives describing the voice tone (e.g., Warm, Energetic, Raspy, Corporate)" }
        },
        required: ["name", "description", "gender", "ageRange", "voiceType"]
      }
    },
    projectTitleSuggestion: { type: Type.STRING, description: "A catchy title for this casting project based on the description" }
  },
  required: ["roles", "projectTitleSuggestion"]
};

export const analyzeCastingRequirements = async (promptText: string): Promise<{ roles: Omit<CastingRole, 'id'>[], title: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        You are an expert Casting Director assistant. 
        Analyze the following project description provided by an advertising agency or production company.
        Extract the distinct roles required for voice over or dubbing.
        
        Input Description:
        "${promptText}"
        
        Be precise with age ranges and voice textures.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: castingSchema,
        systemInstruction: "You are a helpful assistant for a Voice Over casting platform. Reply in Spanish."
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");

    const parsed = JSON.parse(jsonText);
    
    return {
      roles: parsed.roles,
      title: parsed.projectTitleSuggestion
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze casting requirements.");
  }
};

import { GoogleGenAI, Type } from "@google/genai";
import { Job, CandidateProfile } from "../types";

const isValidApiKey = (key: string | undefined): boolean => {
  if (!key || key === 'votre_cle_gemini_ici' || key === '') return false;
  return key.length > 10;
};

export const geminiService = {
  analyzeMatch: async (job: Job, candidate: Partial<CandidateProfile>) => {
    try {
      const apiKey = process.env.API_KEY;
      
      // Validate API key before making request
      if (!isValidApiKey(apiKey)) {
        throw new Error("API_KEY_REQUIRED");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `En tant qu'expert RH pour la région Souss-Massa, analyse la compatibilité entre ce poste et ce profil.
        
        POSTE :
        Titre: ${job.title}
        Description: ${job.description}
        Exigences: ${job.requirements.join(', ')}

        CANDIDAT :
        Nom: ${candidate.name}
        Compétences: ${candidate.skills}
        Expérience: ${candidate.experience}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Score de 0 à 100" },
              feedback: { type: Type.STRING, description: "Feedback constructif en français" },
              pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Points forts" },
              cons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lacunes identifiées" }
            },
            required: ["score", "feedback", "pros", "cons"]
          }
        }
      });

      const jsonStr = response.text || "{}";
      return JSON.parse(jsonStr);
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      // If the error indicates a missing key or project not found, we might need the user to re-select
      if (error?.message?.includes("Requested entity was not found")) {
        // This is a hint to the UI to trigger openSelectKey
        throw new Error("API_KEY_REQUIRED");
      }
      
      return null;
    }
  }
};

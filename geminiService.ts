import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosticData, Product, AIRecommendation } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSkin = async (
  data: DiagnosticData,
  inventory: Product[]
): Promise<AIRecommendation> => {
  
  // Construct the prompt
  const inventoryList = inventory.map(p => 
    `- ID: ${p.id}, Name: ${p.name}, Type: ${p.type}, Price: ${p.price}, Desc: ${p.description}`
  ).join('\n');

  const promptText = `
    You are a professional dermatologist and skincare expert acting for a Russian audience.
    Analyze the user's skin profile and recommend a personalized skincare routine using ONLY the products from the provided inventory list.
    
    IMPORTANT: ALL OUTPUT MUST BE IN RUSSIAN LANGUAGE.
    
    USER PROFILE:
    - Skin Type: ${data.skinType}
    - Concerns: ${data.concerns.join(', ')}
    - Season: ${data.season}
    - Allergies: ${data.allergies || 'None'}
    - Budget Level: ${data.budget}
    - User Description: "${data.description}"
    
    INVENTORY (You MUST pick products ONLY from this list using their IDs):
    ${inventoryList}
    
    REQUIREMENTS:
    1. Select a set of products that form a complete routine (Cleanser, Treat/Serum, Moisturizer, SPF).
    2. Respect the user's budget if possible.
    3. Explain the strategy and why each product was chosen in RUSSIAN.
    4. Provide a morning and evening routine guide in RUSSIAN.
  `;

  // Define Schema
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      analysis: { type: Type.STRING, description: "Detailed analysis of the user's skin state based on inputs (IN RUSSIAN)." },
      causes: { type: Type.STRING, description: "Potential causes for their skin concerns (IN RUSSIAN)." },
      strategy: { type: Type.STRING, description: "The strategic approach to treating their skin (e.g., 'Focus on barrier repair') (IN RUSSIAN)." },
      routine: {
        type: Type.OBJECT,
        properties: {
          morning: { type: Type.STRING, description: "Step-by-step morning instructions (IN RUSSIAN)." },
          evening: { type: Type.STRING, description: "Step-by-step evening instructions (IN RUSSIAN)." }
        },
        required: ["morning", "evening"]
      },
      productIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of EXACT IDs of the products selected from the inventory."
      },
      reasoning: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            productId: { type: Type.STRING },
            explanation: { type: Type.STRING, description: "Explanation in RUSSIAN" }
          },
          required: ["productId", "explanation"]
        },
        description: "List containing an explanation for each selected product."
      }
    },
    required: ["analysis", "causes", "strategy", "routine", "productIds", "reasoning"]
  };

  const parts: any[] = [{ text: promptText }];

  // Add image if available
  if (data.photoBase64) {
    // data:image/jpeg;base64,... -> split to get just the base64 part
    const base64Data = data.photoBase64.split(',')[1];
    if (base64Data) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data
        }
      });
    }
  }

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const responseText = result.text;
    if (!responseText) throw new Error("No response from AI");

    const rawData = JSON.parse(responseText);

    // Transform reasoning array back to map object for the frontend interface
    const reasoningMap: { [key: string]: string } = {};
    if (Array.isArray(rawData.reasoning)) {
      rawData.reasoning.forEach((item: { productId: string; explanation: string }) => {
        reasoningMap[item.productId] = item.explanation;
      });
    }

    return {
      ...rawData,
      reasoning: reasoningMap
    } as AIRecommendation;

  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw new Error("Не удалось сформировать рекомендации. Попробуйте еще раз.");
  }
};
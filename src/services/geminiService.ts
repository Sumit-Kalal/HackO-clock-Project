import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    console.warn("GEMINI_API_KEY is not defined in process.env. Attempting fallback...");
  }
  return key || "";
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function analyzeFootage(mediaUrl: string, mimeType: string, isLocal: boolean = false) {
  let mediaPart;

  if (isLocal) {
    // If it's a local file URL (blob:...), we need to fetch it to get base64
    const response = await fetch(mediaUrl);
    const blob = await response.blob();
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(blob);
    });
    
    mediaPart = {
      inlineData: {
        data: base64,
        mimeType: mimeType || 'image/jpeg'
      }
    };
  } else {
    // If it's a remote URL, we should still try to fetch it and send as inlineData
    // because sending URLs directly to Gemini 3 series models is done via urlContext usually
    // but for images/videos inlineData is most reliable in this environment.
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
      });

      mediaPart = {
        inlineData: {
          data: base64,
          mimeType: mimeType || blob.type || 'image/jpeg'
        }
      };
    } catch (e) {
      console.warn("Could not fetch media for Gemini inlineData, falling back to URL (might not work for all models)", e);
      // Fallback is harder in @google/genai for URLs without specific tools
      throw new Error("Failed to process media for AI analysis. Please ensure the URL is accessible.");
    }
  }

  const prompt = `You are a Wildlife Security Analyst and Species Identification Expert. Analyze this field footage (image or video) with absolute precision.
      
      CRITICAL INSTRUCTIONS:
      1. Identify the primary subject: is it 'Human' or 'Animal'?
      2. If it is an 'Animal', you MUST identify the specific species (e.g., Bengal Tiger, African Elephant, Red Fox, Golden Jackal, etc.).
      3. If it is a 'Human', species should be null.
      4. Provide a detailed one-sentence description of the subject's activity or posture.
      5. Return ONLY a valid JSON object. No other text.

      JSON Format:
      { 
        "type": "Human" | "Animal", 
        "species": string | null, 
        "confidence": number, 
        "description": string 
      }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [mediaPart, { text: prompt }] },
    config: {
      responseMimeType: "application/json"
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text.trim());
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", response.text);
    throw new Error("AI produced invalid data format.");
  }
}

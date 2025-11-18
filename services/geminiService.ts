import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getGameOverComment = async (score: number): Promise<string> => {
  if (!ai) {
    return score < 5 ? "Paper hands! You got rugged." : "HODLing strong, but still got liquidated.";
  }

  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = `
      You are a toxic but funny "Crypto Degen" influencer on Twitter.
      The player is playing "Clumsy Cuspey" (a flappy bird clone themed around crypto trading).
      The player just died (got liquidated) with a score (bag size) of ${score}.
      
      Use crypto slang like: "Rekt", "Rug pull", "Paper hands", "Diamond hands", "To the moon", "NGMI", "WAGMI", "Buy the dip", "FOMO".

      If score 0-5: Roast them for being a noob/paper hands.
      If score 6-20: Tell them they got greedy and leverage traded.
      If score 21-50: Impressive, respect the diamond hands.
      If score 50+: Call them a Whale or Market Maker.

      Keep it under 20 words. Be funny.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Failed to fetch AI comment:", error);
    return "Server overloaded. Probably Solana is down again.";
  }
};
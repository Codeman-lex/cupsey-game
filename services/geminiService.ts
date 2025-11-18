import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getGameOverComment = async (score: number): Promise<string> => {
  if (!ai) {
    return score < 5 ? "Ouch! Cuspey took a tumble." : "Not bad for a guy in a green suit!";
  }

  try {
    const modelId = 'gemini-2.5-flash';
    const prompt = `
      You are the sarcastic announcer for a game called "Clumsy Cuspey".
      The main character is Cuspey, a cute round guy in a green suit who tries to fly.
      The player just died with a score of ${score}.
      If the score is 0-2, mock Cuspey ruthlessly for being flightless.
      If the score is 3-10, give a lukewarm sarcastic compliment about his green suit.
      If the score is 11-50, be impressed but still snarky.
      If the score is 50+, praise them as the Cuspey God.
      Keep it under 20 words.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Failed to fetch AI comment:", error);
    return "Game Over! (AI is sleeping)";
  }
};
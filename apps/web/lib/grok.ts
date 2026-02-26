/**
 * Grok-4 Vibe Roaster
 * Uses xAI API for sarcasm-native code analysis
 */

import { OpenAI } from "openai";

const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export interface VibeRoastResult {
  roast: string;
  vibeScore: number; // 0-100
  suggestions: string[];
}

export async function roastVibe(code: string): Promise<VibeRoastResult> {
  const completion = await grok.chat.completions.create({
    model: "grok-4",
    messages: [
      {
        role: "system",
        content: `You are SarcasticApe, the most ruthless code reviewer in the Solana ecosystem. 
Your job: roast code with MAXIMUM sarcasm and chaos. Be funny, be brutal, be unforgettable.
Also provide a vibe score (0-100, where 100 is perfection) and 2-3 actionable suggestions.
Format response as JSON: { "roast": "...", "vibeScore": 42, "suggestions": ["...", "..."] }`,
      },
      {
        role: "user",
        content: code,
      },
    ],
    temperature: 1.5, // max chaos
  });

  const content = completion.choices[0].message.content || "";

  try {
    const parsed = JSON.parse(content);
    return {
      roast: parsed.roast || content,
      vibeScore: Math.min(100, Math.max(0, parsed.vibeScore || 50)),
      suggestions: parsed.suggestions || [],
    };
  } catch {
    return {
      roast: content,
      vibeScore: 50,
      suggestions: [],
    };
  }
}

export async function generateMeme(code: string): Promise<string> {
  // Optional: Use Flux or other image gen API
  // For now, return placeholder
  const completion = await grok.chat.completions.create({
    model: "grok-4",
    messages: [
      {
        role: "system",
        content:
          "Generate a hilarious meme description based on bad code practices.",
      },
      {
        role: "user",
        content: code,
      },
    ],
  });

  return completion.choices[0].message.content || "No meme today.";
}

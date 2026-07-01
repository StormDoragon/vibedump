/**
 * AI code review via the xAI Grok API.
 *
 * Returns a structured review (summary, score, issues, suggestions) so the UI
 * can render it reliably. `tone: "roast"` keeps the original sarcastic
 * personality as an opt-in; the default is a serious, useful review.
 *
 * Response parsing/normalization lives in ./review-parse (unit-tested).
 */

import { OpenAI } from "openai";
import { parseReview, type ReviewResult, type ReviewTone } from "./review-parse";

export type {
  IssueSeverity,
  ReviewIssue,
  ReviewResult,
  ReviewTone,
} from "./review-parse";

const SYSTEM_PROMPTS: Record<ReviewTone, string> = {
  serious: `You are a senior software engineer doing a focused code review.
Be concise, specific, and actionable. Point out real bugs, security issues,
performance problems, and style smells — skip nitpicks that don't matter.`,
  roast: `You are the most ruthless, funny code reviewer alive. Roast the code
with sharp sarcasm — but every roast must contain a REAL, actionable point.
Be brutal and entertaining, never vague.`,
};

const RESPONSE_CONTRACT = `Respond ONLY with JSON matching this shape:
{
  "summary": "one or two sentence overall assessment",
  "score": 0-100 integer (higher = better),
  "issues": [{ "severity": "info"|"warning"|"error", "message": "...", "line": optional integer }],
  "suggestions": ["concrete improvement", "..."]
}`;

export async function reviewCode(
  code: string,
  tone: ReviewTone = "serious",
): Promise<ReviewResult> {
  if (!process.env.XAI_API_KEY) {
    throw new Error("XAI_API_KEY is not configured.");
  }

  const grok = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: "https://api.x.ai/v1",
  });

  const completion = await grok.chat.completions.create({
    model: "grok-4",
    // Lower temperature for review accuracy; a little higher for roast flavor.
    temperature: tone === "roast" ? 0.9 : 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `${SYSTEM_PROMPTS[tone]}\n\n${RESPONSE_CONTRACT}`,
      },
      { role: "user", content: code },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  return parseReview(content, tone);
}

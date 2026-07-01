/**
 * AI code review via the xAI Grok API.
 *
 * Returns a structured review (summary, score, issues, suggestions) so the UI
 * can render it reliably. `tone: "roast"` keeps the original sarcastic
 * personality as an opt-in; the default is a serious, useful review.
 */

import { OpenAI } from "openai";

export type ReviewTone = "serious" | "roast";

export type IssueSeverity = "info" | "warning" | "error";

export interface ReviewIssue {
  severity: IssueSeverity;
  message: string;
  line?: number;
}

export interface ReviewResult {
  summary: string;
  score: number; // 0-100
  issues: ReviewIssue[];
  suggestions: string[];
  tone: ReviewTone;
}

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

function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function normalizeIssues(raw: unknown): ReviewIssue[] {
  if (!Array.isArray(raw)) return [];
  const allowed: IssueSeverity[] = ["info", "warning", "error"];
  return raw
    .map((item): ReviewIssue | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const message = typeof obj.message === "string" ? obj.message : "";
      if (!message) return null;
      const severity = allowed.includes(obj.severity as IssueSeverity)
        ? (obj.severity as IssueSeverity)
        : "info";
      const line = typeof obj.line === "number" ? obj.line : undefined;
      return { severity, message, line };
    })
    .filter((x): x is ReviewIssue => x !== null);
}

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
      { role: "system", content: `${SYSTEM_PROMPTS[tone]}\n\n${RESPONSE_CONTRACT}` },
      { role: "user", content: code },
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";

  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return {
      summary:
        typeof parsed.summary === "string" ? parsed.summary : "No summary returned.",
      score: clampScore(parsed.score),
      issues: normalizeIssues(parsed.issues),
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((s): s is string => typeof s === "string")
        : [],
      tone,
    };
  } catch {
    // Model didn't return valid JSON — surface its text rather than crash.
    return {
      summary: content || "The reviewer returned an unreadable response.",
      score: 50,
      issues: [],
      suggestions: [],
      tone,
    };
  }
}

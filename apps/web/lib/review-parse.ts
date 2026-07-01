/**
 * Parsing and normalization for the AI review response. Kept free of the
 * OpenAI/xAI client so the (fragile) JSON handling is unit-testable.
 */

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

const SEVERITIES: IssueSeverity[] = ["info", "warning", "error"];

/** Coerce an arbitrary value into a 0-100 integer score, defaulting to 50. */
export function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.min(100, Math.max(0, Math.round(n)));
}

/** Keep only well-formed issues, defaulting severity to "info". */
export function normalizeIssues(raw: unknown): ReviewIssue[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item): ReviewIssue | null => {
      if (!item || typeof item !== "object") return null;
      const obj = item as Record<string, unknown>;
      const message = typeof obj.message === "string" ? obj.message : "";
      if (!message) return null;
      const severity = SEVERITIES.includes(obj.severity as IssueSeverity)
        ? (obj.severity as IssueSeverity)
        : "info";
      const line = typeof obj.line === "number" ? obj.line : undefined;
      return { severity, message, line };
    })
    .filter((x): x is ReviewIssue => x !== null);
}

/**
 * Parse the model's JSON reply into a ReviewResult. If it isn't valid JSON,
 * fall back to surfacing the raw text rather than throwing.
 */
export function parseReview(content: string, tone: ReviewTone): ReviewResult {
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return {
      summary:
        typeof parsed.summary === "string"
          ? parsed.summary
          : "No summary returned.",
      score: clampScore(parsed.score),
      issues: normalizeIssues(parsed.issues),
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((s): s is string => typeof s === "string")
        : [],
      tone,
    };
  } catch {
    return {
      summary: content || "The reviewer returned an unreadable response.",
      score: 50,
      issues: [],
      suggestions: [],
      tone,
    };
  }
}

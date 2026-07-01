import { describe, expect, it } from "vitest";
import { clampScore, normalizeIssues, parseReview } from "./review-parse";

describe("clampScore", () => {
  it("clamps into 0-100 and rounds", () => {
    expect(clampScore(150)).toBe(100);
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(42.6)).toBe(43);
  });

  it("coerces numeric strings", () => {
    expect(clampScore("73")).toBe(73);
  });

  it("defaults to 50 for non-numeric values", () => {
    expect(clampScore("nope")).toBe(50);
    expect(clampScore(undefined)).toBe(50);
    expect(clampScore(Number.NaN)).toBe(50);
  });
});

describe("normalizeIssues", () => {
  it("returns [] for non-arrays", () => {
    expect(normalizeIssues(undefined)).toEqual([]);
    expect(normalizeIssues("oops")).toEqual([]);
  });

  it("drops entries without a message and defaults severity to info", () => {
    const result = normalizeIssues([
      { message: "no severity" },
      { severity: "bogus", message: "bad severity" },
      { severity: "error", message: "real", line: 3 },
      { severity: "warning" }, // no message -> dropped
      "not an object", // dropped
    ]);
    expect(result).toEqual([
      { severity: "info", message: "no severity", line: undefined },
      { severity: "info", message: "bad severity", line: undefined },
      { severity: "error", message: "real", line: 3 },
    ]);
  });
});

describe("parseReview", () => {
  it("parses a well-formed response", () => {
    const content = JSON.stringify({
      summary: "Looks fine",
      score: 88,
      issues: [{ severity: "warning", message: "unused var", line: 2 }],
      suggestions: ["add tests", 42, "use const"],
    });
    expect(parseReview(content, "serious")).toEqual({
      summary: "Looks fine",
      score: 88,
      issues: [{ severity: "warning", message: "unused var", line: 2 }],
      suggestions: ["add tests", "use const"], // non-strings filtered out
      tone: "serious",
    });
  });

  it("falls back gracefully on invalid JSON", () => {
    const result = parseReview("totally not json", "roast");
    expect(result).toEqual({
      summary: "totally not json",
      score: 50,
      issues: [],
      suggestions: [],
      tone: "roast",
    });
  });

  it("fills defaults for missing fields", () => {
    const result = parseReview("{}", "serious");
    expect(result.summary).toBe("No summary returned.");
    expect(result.score).toBe(50);
    expect(result.issues).toEqual([]);
    expect(result.suggestions).toEqual([]);
  });
});

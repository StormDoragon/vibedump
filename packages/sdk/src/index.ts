/**
 * @vibedump/sdk
 * Vibe SDK: Analyze, roast, patch, and pump
 */

export * from "./vibe-analyzer";
export * from "./vibe-patcher";
export * from "./pump-launcher";

export interface VibeConfig {
  code: string;
  language?: "ts" | "js" | "py" | "rs";
  files?: Record<string, string>;
}

export interface VibeResult {
  analysis: string;
  score: number;
  suggestions: string[];
  commitHash?: string;
}

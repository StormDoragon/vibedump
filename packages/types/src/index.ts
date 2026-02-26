/**
 * @vibedump/types
 * Shared TypeScript types across the monorepo
 */

export interface User {
  id: string;
  clerkId: string;
  username: string;
  email: string;
  vibeAvatar?: string;
  solanaWallet?: string;
  xHandle?: string;
  githubHandle?: string;
  createdAt: Date;
}

export interface Vibe {
  id: string;
  userId: string;
  code: string;
  language: "ts" | "js" | "py" | "rs" | "go" | "rb";
  roast: string;
  vibeScore: number;
  commitHash?: string;
  xPostUrl?: string;
  solanaProofTx?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VibeRequest {
  code: string;
  files?: Record<string, string>;
  language?: string;
  skipRoast?: boolean;
  skipCommit?: boolean;
  skipX?: boolean;
}

export interface VibeResponse {
  id: string;
  logs: string;
  roast: string;
  vibeScore: number;
  commitHash?: string;
  xPostUrl?: string;
  solanaProofTx?: string;
  error?: string;
}

export interface GithubCommitPayload {
  owner: string;
  repo: string;
  message: string;
  files: Record<string, string>;
  branch?: string;
}

export interface XPostPayload {
  text: string;
  imageUrl?: string;
  mimeType?: string;
}

export interface SolanaPumpConfig {
  tokenName: string;
  symbol: string;
  description: string;
  initialSupply: number;
  image?: string;
}

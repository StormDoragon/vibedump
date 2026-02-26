/**
 * Next.js Server Actions for Vibe Workflow
 * Coordinates WebContainer, Grok, GitHub, X, and Solana
 */

"use server";

import { auth } from "@clerk/nextjs/server";
import { roastVibe } from "./grok";
import { VibeContainer } from "./webcontainer";
import { commitVibe } from "./github";

export interface VibeRunRequest {
  code: string;
  files?: Record<string, string>;
  language?: string; // "ts", "js", "python", "rust", etc.
}

export interface VibeRunResult {
  logs: string;
  roast: string;
  commitHash?: string;
  xPostUrl?: string;
  solanaHash?: string;
}

export async function runVibe(request: VibeRunRequest): Promise<VibeRunResult> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // 1. Boot WebContainer and run code
  const container = new VibeContainer();
  await container.boot();

  const { output$ } = await container.runVibe({
    code: request.code,
    files: request.files,
  });

  // Collect logs
  const logs: string[] = [];
  for await (const chunk of output$) {
    logs.push(chunk.toString());
  }

  const logsOutput = logs.join("\n");

  // 2. Roast with Grok
  const roastResult = await roastVibe(request.code);

  // 3. (Optional) Commit to GitHub
  let commitHash: string | undefined;
  try {
    commitHash = await commitVibe({
      owner: "sarcasticapes",
      repo: "vibedump",
      message: `🔥 Vibe dump from ${userId}: ${roastResult.vibeScore}/100`,
      files: {
        [`vibes/${userId}/${Date.now()}.ts`]: request.code,
        [`vibes/${userId}/${Date.now()}.roast.md`]: roastResult.roast,
      },
    });
  } catch (e) {
    console.error("GitHub commit failed:", e);
  }

  await container.dispose();

  return {
    logs: logsOutput,
    roast: roastResult.roast,
    commitHash,
  };
}

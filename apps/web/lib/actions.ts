/**
 * Server Actions for the vibe workflow.
 *
 * The code sandbox (WebContainer) runs entirely in the browser, so it lives in
 * the client module `./webcontainer`, NOT here. This server action exists only
 * to keep the xAI API key on the server while performing the AI review.
 */

"use server";

import { type ReviewResult, type ReviewTone, reviewCode } from "./grok";

export interface ReviewRequest {
  code: string;
  tone?: ReviewTone;
}

export interface ReviewActionResult {
  review?: ReviewResult;
  error?: string;
}

export async function reviewCodeAction(
  request: ReviewRequest,
): Promise<ReviewActionResult> {
  const code = request.code?.trim();
  if (!code) {
    return { error: "Nothing to review — paste some code first." };
  }

  try {
    const review = await reviewCode(code, request.tone ?? "serious");
    return { review };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI review failed unexpectedly.";
    return { error: message };
  }
}

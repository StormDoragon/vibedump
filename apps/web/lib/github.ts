/**
 * GitHub Integration
 * Uses GitHub App + Octokit for secure commits without PAT hell
 */

import { App } from "octokit";

export interface CommitOptions {
  owner: string;
  repo: string;
  message: string;
  files: Record<string, string>;
  branch?: string;
}

export async function commitVibe(options: CommitOptions): Promise<string> {
  const app = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: process.env.GITHUB_PRIVATE_KEY!,
  });

  // Get authenticated client
  const octokit = await app.getInstallationOctokit(options.owner);

  // Get default branch
  const branch = options.branch || "main";

  // Get latest commit SHA
  const { data: refData } = await octokit.rest.git.getRef({
    owner: options.owner,
    repo: options.repo,
    ref: `heads/${branch}`,
  });

  const baseCommitSha = refData.object.sha;

  // Get base commit tree
  const { data: baseCommit } = await octokit.rest.git.getCommit({
    owner: options.owner,
    repo: options.repo,
    commit_sha: baseCommitSha,
  });

  // Create blobs for each file
  const blobs = await Promise.all(
    Object.entries(options.files).map(([path, content]) =>
      octokit.rest.git.createBlob({
        owner: options.owner,
        repo: options.repo,
        content,
        encoding: "utf-8",
      })
    )
  );

  // Create tree with new files
  const { data: newTree } = await octokit.rest.git.createTree({
    owner: options.owner,
    repo: options.repo,
    base_tree: baseCommit.tree.sha,
    tree: Object.keys(options.files).map((path, idx) => ({
      path,
      mode: "100644",
      type: "blob",
      sha: blobs[idx].data.sha,
    })),
  });

  // Create commit
  const { data: newCommit } = await octokit.rest.git.createCommit({
    owner: options.owner,
    repo: options.repo,
    message: options.message,
    tree: newTree.sha,
    parents: [baseCommitSha],
  });

  // Update ref
  await octokit.rest.git.updateRef({
    owner: options.owner,
    repo: options.repo,
    ref: `heads/${branch}`,
    sha: newCommit.sha,
  });

  return newCommit.sha;
}

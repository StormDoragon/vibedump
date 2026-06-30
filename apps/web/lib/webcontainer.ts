/**
 * Vibe WebContainer runner (browser-only)
 *
 * WebContainers boot a real Node.js runtime inside the browser using
 * SharedArrayBuffer, so this module MUST run on the client and the page
 * MUST be served cross-origin isolated (see the COOP/COEP headers in
 * next.config.js). Booting on the server is impossible — that was the
 * original bug.
 */

import { WebContainer } from "@webcontainer/api";

export type RunLanguage = "js" | "ts";

export interface RunCodeOptions {
  code: string;
  language?: RunLanguage;
  /** Called with each chunk of stdout/stderr as it streams in. */
  onOutput?: (chunk: string) => void;
  /** Hard timeout for the run process in milliseconds. */
  timeoutMs?: number;
}

export interface RunCodeResult {
  exitCode: number;
  timedOut: boolean;
}

// Node core modules we should never try to `npm install`.
const NODE_BUILTINS = new Set([
  "assert", "buffer", "child_process", "cluster", "console", "constants",
  "crypto", "dgram", "dns", "domain", "events", "fs", "http", "http2",
  "https", "inspector", "module", "net", "os", "path", "perf_hooks",
  "process", "punycode", "querystring", "readline", "repl", "stream",
  "string_decoder", "timers", "tls", "trace_events", "tty", "url", "util",
  "v8", "vm", "worker_threads", "zlib",
]);

// A single booted container is reused across runs — booting is expensive
// and WebContainer.boot() may only be called once per page.
let bootPromise: Promise<WebContainer> | null = null;

function getContainer(): Promise<WebContainer> {
  if (typeof window === "undefined") {
    throw new Error("WebContainer can only run in the browser.");
  }
  if (!bootPromise) {
    bootPromise = WebContainer.boot();
  }
  return bootPromise;
}

/**
 * Best-effort scan for external (npm) imports so we only install what the
 * snippet actually needs. Relative paths and Node builtins are skipped.
 */
function detectDependencies(code: string): string[] {
  const specifiers = new Set<string>();
  const patterns = [
    /import\s+[^"']*?from\s+["']([^"']+)["']/g, // import x from "pkg"
    /import\s+["']([^"']+)["']/g, // import "pkg"
    /import\s*\(\s*["']([^"']+)["']\s*\)/g, // import("pkg")
    /require\s*\(\s*["']([^"']+)["']\s*\)/g, // require("pkg")
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(code)) !== null) {
      const spec = match[1];
      if (spec.startsWith(".") || spec.startsWith("/")) continue; // relative
      const bare = spec.startsWith("node:") ? spec.slice(5) : spec;
      const top = bare.startsWith("@")
        ? bare.split("/").slice(0, 2).join("/") // @scope/pkg
        : bare.split("/")[0]; // pkg/sub -> pkg
      if (NODE_BUILTINS.has(top)) continue;
      specifiers.add(top);
    }
  }

  return [...specifiers];
}

async function streamToOutput(
  stream: ReadableStream<string>,
  onOutput?: (chunk: string) => void,
): Promise<void> {
  if (!onOutput) return;
  await stream.pipeTo(
    new WritableStream({
      write(chunk) {
        onOutput(chunk);
      },
    }),
  );
}

/**
 * Mount the snippet, install any detected dependencies, run it, and stream
 * the output. Resolves once the process exits (or times out).
 */
export async function runCode({
  code,
  language = "js",
  onOutput,
  timeoutMs = 30_000,
}: RunCodeOptions): Promise<RunCodeResult> {
  const container = await getContainer();
  const isTs = language === "ts";
  const entry = isTs ? "index.ts" : "index.js";

  const deps = detectDependencies(code);
  const dependencies: Record<string, string> = {};
  for (const dep of deps) dependencies[dep] = "latest";
  if (isTs) dependencies.tsx = "latest"; // run TypeScript without a build step

  const packageJson = {
    name: "vibe-snippet",
    private: true,
    type: "module" as const,
    dependencies,
  };

  await container.mount({
    "package.json": { file: { contents: JSON.stringify(packageJson, null, 2) } },
    [entry]: { file: { contents: code } },
  });

  const needsInstall = Object.keys(dependencies).length > 0;
  if (needsInstall) {
    onOutput?.(`\n[vibedump] installing: ${Object.keys(dependencies).join(", ")}\n`);
    const install = await container.spawn("npm", ["install", "--no-audit", "--no-fund"]);
    await streamToOutput(install.output, onOutput);
    const installExit = await install.exit;
    if (installExit !== 0) {
      onOutput?.(`\n[vibedump] install failed (exit ${installExit})\n`);
      return { exitCode: installExit, timedOut: false };
    }
  }

  onOutput?.("\n[vibedump] running...\n\n");
  const run = isTs
    ? await container.spawn("npx", ["tsx", entry])
    : await container.spawn("node", [entry]);

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    run.kill();
  }, timeoutMs);

  await streamToOutput(run.output, onOutput);
  const exitCode = await run.exit;
  clearTimeout(timer);

  if (timedOut) {
    onOutput?.(`\n[vibedump] killed after ${timeoutMs / 1000}s timeout\n`);
  } else {
    onOutput?.(`\n[vibedump] exited with code ${exitCode}\n`);
  }

  return { exitCode, timedOut };
}

/**
 * Pure static analysis of a code snippet — no browser or WebContainer
 * dependencies, so it's unit-testable in plain Node. Used by the sandbox
 * runner to decide what to install and how to execute the snippet.
 */

export type RunLanguage = "js" | "ts";

// Node core modules we should never try to `npm install`.
const NODE_BUILTINS = new Set([
  "assert", "buffer", "child_process", "cluster", "console", "constants",
  "crypto", "dgram", "dns", "domain", "events", "fs", "http", "http2",
  "https", "inspector", "module", "net", "os", "path", "perf_hooks",
  "process", "punycode", "querystring", "readline", "repl", "stream",
  "string_decoder", "timers", "tls", "trace_events", "tty", "url", "util",
  "v8", "vm", "worker_threads", "zlib",
]);

/** Reduce an import specifier to its installable package name. */
function toPackageName(specifier: string): string {
  const bare = specifier.startsWith("node:") ? specifier.slice(5) : specifier;
  return bare.startsWith("@")
    ? bare.split("/").slice(0, 2).join("/") // @scope/pkg
    : bare.split("/")[0]; // pkg/sub -> pkg
}

/**
 * Best-effort scan for external (npm) imports so we only install what the
 * snippet actually needs. Relative paths and Node builtins are skipped, and
 * results are de-duplicated.
 */
export function detectDependencies(code: string): string[] {
  const specifiers = new Set<string>();
  const patterns = [
    /import\s+[^"']*?from\s+["']([^"']+)["']/g, // import x from "pkg"
    /import\s+["']([^"']+)["']/g, // import "pkg"
    /import\s*\(\s*["']([^"']+)["']\s*\)/g, // import("pkg")
    /require\s*\(\s*["']([^"']+)["']\s*\)/g, // require("pkg")
  ];

  for (const pattern of patterns) {
    let match = pattern.exec(code);
    while (match !== null) {
      const spec = match[1];
      match = pattern.exec(code); // advance now so the continues below are safe
      if (spec.startsWith(".") || spec.startsWith("/")) continue; // relative
      const pkg = toPackageName(spec);
      if (NODE_BUILTINS.has(pkg)) continue;
      specifiers.add(pkg);
    }
  }

  return [...specifiers];
}

/**
 * True when the snippet uses ES module syntax (`import`/`export` statements).
 * CommonJS snippets (`require` / `module.exports`) return false so they run as
 * `.cjs` instead of being rejected by ESM mode.
 */
export function usesEsmSyntax(code: string): boolean {
  return (
    /(^|\n)\s*import\s+(?:[^;'"]*\sfrom\s+)?["']/.test(code) ||
    /(^|\n)\s*export\s+(?:default|const|let|var|function|class|async|\{|\*)/.test(
      code,
    )
  );
}

/**
 * Choose the entry filename so the module system matches the snippet:
 * `.ts` (run via tsx), `.mjs` for ESM, `.cjs` for CommonJS.
 */
export function chooseEntry(language: RunLanguage, code: string): string {
  if (language === "ts") return "index.ts";
  return usesEsmSyntax(code) ? "index.mjs" : "index.cjs";
}

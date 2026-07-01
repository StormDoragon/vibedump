/**
 * Copies Monaco's self-contained AMD bundle (min/vs) from node_modules into
 * public/monaco/vs so the editor loads from our own origin instead of a CDN.
 * Runs before `dev` and `build`. The output is gitignored — it's vendored at
 * build time, not committed.
 */
import { access, cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const monacoDir = dirname(require.resolve("monaco-editor/package.json"));
const srcVs = join(monacoDir, "min", "vs");
const destVs = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "monaco",
  "vs",
);

try {
  await access(destVs);
  console.log("[copy-monaco] public/monaco/vs already present — skipping");
} catch {
  await mkdir(dirname(destVs), { recursive: true });
  await cp(srcVs, destVs, { recursive: true });
  console.log("[copy-monaco] copied monaco min/vs -> public/monaco/vs");
}

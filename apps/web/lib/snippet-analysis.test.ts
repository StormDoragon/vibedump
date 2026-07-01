import { describe, expect, it } from "vitest";
import { chooseEntry, detectDependencies, usesEsmSyntax } from "./snippet-analysis";

describe("detectDependencies", () => {
  it("detects a named ESM import", () => {
    expect(detectDependencies(`import express from "express";`)).toEqual([
      "express",
    ]);
  });

  it("detects a bare side-effect import", () => {
    expect(detectDependencies(`import "dotenv/config";`)).toEqual(["dotenv"]);
  });

  it("detects dynamic import() and require()", () => {
    expect(detectDependencies(`const x = require("lodash");`)).toEqual([
      "lodash",
    ]);
    expect(detectDependencies(`await import("chalk");`)).toEqual(["chalk"]);
  });

  it("keeps scoped packages whole but strips subpaths", () => {
    expect(detectDependencies(`import { z } from "@scope/pkg/sub";`)).toEqual([
      "@scope/pkg",
    ]);
    expect(detectDependencies(`import fp from "lodash/fp";`)).toEqual(["lodash"]);
  });

  it("skips relative paths and Node builtins (incl. node: prefix)", () => {
    const code = `
      import { readFile } from "node:fs/promises";
      import path from "path";
      import helper from "./helper.js";
      import config from "../config";
    `;
    expect(detectDependencies(code)).toEqual([]);
  });

  it("de-duplicates repeated specifiers", () => {
    const code = `
      import { a } from "axios";
      const b = require("axios");
    `;
    expect(detectDependencies(code)).toEqual(["axios"]);
  });

  it("returns an empty array for dependency-free code", () => {
    expect(detectDependencies(`console.log("hi");`)).toEqual([]);
  });
});

describe("usesEsmSyntax", () => {
  it("is true for import statements", () => {
    expect(usesEsmSyntax(`import x from "x";`)).toBe(true);
    expect(usesEsmSyntax(`import "./side-effect";`)).toBe(true);
  });

  it("is true for export statements", () => {
    expect(usesEsmSyntax("export const value = 1;")).toBe(true);
    expect(usesEsmSyntax("export default function () {}")).toBe(true);
  });

  it("is false for CommonJS and plain scripts", () => {
    expect(usesEsmSyntax(`const x = require("x");`)).toBe(false);
    expect(usesEsmSyntax("module.exports = {};")).toBe(false);
    expect(usesEsmSyntax("console.log(1 + 2);")).toBe(false);
  });

  it("does not treat the word 'import' inside a string as ESM", () => {
    expect(usesEsmSyntax(`console.log("please import this");`)).toBe(false);
  });
});

describe("chooseEntry", () => {
  it("uses index.ts for TypeScript regardless of syntax", () => {
    expect(chooseEntry("ts", `const x = require("y");`)).toBe("index.ts");
  });

  it("uses .mjs for ESM JavaScript", () => {
    expect(chooseEntry("js", `import x from "x";`)).toBe("index.mjs");
  });

  it("uses .cjs for CommonJS / plain JavaScript", () => {
    expect(chooseEntry("js", `const x = require("x");`)).toBe("index.cjs");
    expect(chooseEntry("js", `console.log("hi");`)).toBe("index.cjs");
  });
});

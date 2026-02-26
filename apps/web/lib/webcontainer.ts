/**
 * Vibe WebContainer Manager
 * Boots and manages browser-native Node.js sandbox via WebContainer API
 */

import { WebContainer } from "@webcontainer/api";

export interface VibeRuntimeConfig {
  code: string;
  files?: Record<string, string>;
  dependencies?: Record<string, string>;
  npmScript?: string;
}

export class VibeContainer {
  private container: WebContainer | null = null;

  async boot() {
    this.container = await WebContainer.boot();
    return this.container;
  }

  async runVibe(config: VibeRuntimeConfig) {
    if (!this.container) {
      throw new Error("Container not booted. Call boot() first.");
    }

    // Default package.json with common stack
    const packageJson = {
      name: "vibe-project",
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "node index.js",
      },
      dependencies: {
        express: "^4.18.0",
        axios: "^1.6.0",
        dotenv: "^16.0.0",
        ...config.dependencies,
      },
    };

    // Mount files into container
    await this.container.mount({
      "package.json": {
        file: {
          contents: JSON.stringify(packageJson, null, 2),
        },
      },
      "index.js": {
        file: {
          contents: config.code,
        },
      },
      ...(config.files || {}),
    });

    // Install dependencies
    const installProcess = await this.container.spawn("npm", ["install"]);
    await installProcess.exit;

    // Run the vibe
    const runProcess = await this.container.spawn("npm", ["run", "dev"]);

    return {
      process: runProcess,
      output$: runProcess.output,
    };
  }

  async dispose() {
    if (this.container) {
      // WebContainer cleanup handled automatically
      this.container = null;
    }
  }
}

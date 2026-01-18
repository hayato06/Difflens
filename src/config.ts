import path from 'path';
import fs from 'fs';
import { DiffLensConfig } from './types';
import { build } from 'esbuild';

export const DEFAULT_CONFIG: DiffLensConfig = {
  scenarios: [],
  threshold: 0.1,
  outDir: '.difflens',
};

export async function loadConfig(configPath?: string): Promise<DiffLensConfig> {
  const searchPlaces = [
    'difflens.config.ts',
    'difflens.config.js',
    'difflens.config.mjs',
    'difflens.config.cjs',
  ];

  let resolvedPath: string | undefined;

  if (configPath) {
    resolvedPath = path.resolve(process.cwd(), configPath);
  } else {
    for (const place of searchPlaces) {
      const p = path.resolve(process.cwd(), place);
      if (fs.existsSync(p)) {
        resolvedPath = p;
        break;
      }
    }
  }

  if (!resolvedPath) {
    console.warn('No configuration file found. Using default config.');
    return DEFAULT_CONFIG;
  }

  try {
    let importPath = resolvedPath;
    let isTs = resolvedPath.endsWith('.ts');
    let tempFile: string | null = null;

    if (isTs) {
      // Transpile TS to JS using esbuild
      const outfile = resolvedPath.replace(/\.ts$/, '.js.tmp.mjs'); // Use .mjs to force ESM
      await build({
        entryPoints: [resolvedPath],
        outfile,
        bundle: true,
        platform: 'node',
        format: 'esm',
        external: ['difflens'], // Exclude self if referenced?
      });
      importPath = outfile;
      tempFile = outfile;
    }

    // Dynamic import
    // Use file:// protocol for absolute paths in ESM
    const importUrl = `file://${importPath}`;
    const userConfigModule = await import(importUrl);
    const userConfig = userConfigModule.default || userConfigModule;
    
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }

    return {
      ...DEFAULT_CONFIG,
      ...userConfig,
    };
  } catch (error) {
    console.error(`Failed to load configuration from ${resolvedPath}:`, error);
    throw error;
  }
}

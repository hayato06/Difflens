import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts', 'src/cli.ts', 'src/mcp-server.ts', 'src/api-server.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    clean: true,
    external: [
        'chromium-bidi/lib/cjs/bidiMapper/BidiMapper',
        'chromium-bidi/lib/cjs/cdp/CdpConnection',
        'playwright',
        'playwright-core',
        '@axe-core/playwright',
        'esbuild',
        'zod',
        '@modelcontextprotocol/sdk',
        'pixelmatch',
        'pngjs',
    ],
});

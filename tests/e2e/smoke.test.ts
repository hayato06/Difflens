import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { runTests } from '../../src/core/runner';
import { DiffLensConfig } from '../../src/types';
import path from 'path';
import fs from 'fs';

const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const OUT_DIR = path.join(__dirname, 'output');
const HTML_PATH = path.join(FIXTURE_DIR, 'index.html');

describe('E2E Smoke Test', () => {
    beforeAll(() => {
        if (!fs.existsSync(FIXTURE_DIR)) {
            fs.mkdirSync(FIXTURE_DIR, { recursive: true });
        }
        fs.writeFileSync(HTML_PATH, `
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"><title>Smoke Test</title></head>
            <body><main><h1>Hello World</h1></main></body>
            </html>
        `);
    });

    afterAll(() => {
        fs.rmSync(FIXTURE_DIR, { recursive: true, force: true });
        fs.rmSync(OUT_DIR, { recursive: true, force: true });
    });

    it('should run tests successfully', async () => {
        const config: DiffLensConfig = {
            scenarios: [
                {
                    label: 'smoke',
                    path: `file://${HTML_PATH}`,
                }
            ],
            outDir: OUT_DIR,
            // format: 'default' // Default is default
        };

        const success = await runTests(config);
        expect(success).toBe(true);

        // Check if artifacts are created
        // Default viewport adds -default suffix
        expect(fs.existsSync(path.join(OUT_DIR, 'baseline/smoke-default.png'))).toBe(true);
    });
});

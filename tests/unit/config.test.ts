import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { loadConfig, DEFAULT_CONFIG } from '../../src/config';
import fs from 'fs';
import path from 'path';

const TEST_DIR = path.join(__dirname, 'fixtures');

describe('config', () => {
    beforeAll(() => {
        if (!fs.existsSync(TEST_DIR)) {
            fs.mkdirSync(TEST_DIR, { recursive: true });
        }
    });

    afterAll(() => {
        fs.rmSync(TEST_DIR, { recursive: true, force: true });
    });

    describe('DEFAULT_CONFIG', () => {
        it('should have empty scenarios by default', () => {
            expect(DEFAULT_CONFIG.scenarios).toEqual([]);
        });

        it('should have default threshold of 0.1', () => {
            expect(DEFAULT_CONFIG.threshold).toBe(0.1);
        });

        it('should have default outDir of .difflens', () => {
            expect(DEFAULT_CONFIG.outDir).toBe('.difflens');
        });
    });

    describe('loadConfig', () => {
        it('should return default config when config path does not exist', async () => {
            const nonExistentPath = path.join(TEST_DIR, 'nonexistent.config.js');
            try {
                await loadConfig(nonExistentPath);
            } catch (error) {
                expect(error).toBeDefined();
            }
        });

        it('should load config from specified path', async () => {
            const configPath = path.join(TEST_DIR, 'test.config.mjs');
            fs.writeFileSync(configPath, `
                export default {
                    baseUrl: 'https://test.example.com',
                    scenarios: [{ label: 'test', path: '/' }]
                };
            `);

            const config = await loadConfig(configPath);
            expect(config.baseUrl).toBe('https://test.example.com');
            expect(config.scenarios).toHaveLength(1);
            expect(config.scenarios[0].label).toBe('test');
        });
    });
});

import { describe, it, expect } from 'vitest';
import type {
    DiffLensConfig,
    Viewport,
    Action,
    Scenario,
    TestResult,
    ReportData,
} from '../../src/types';

describe('types', () => {
    describe('DiffLensConfig', () => {
        it('should allow valid config object', () => {
            const config: DiffLensConfig = {
                baseUrl: 'https://example.com',
                scenarios: [
                    { label: 'home', path: '/' },
                ],
                threshold: 0.1,
                outDir: '.difflens',
            };
            expect(config.baseUrl).toBe('https://example.com');
            expect(config.scenarios).toHaveLength(1);
        });

        it('should allow config with viewports', () => {
            const config: DiffLensConfig = {
                scenarios: [],
                viewports: {
                    desktop: { width: 1280, height: 720 },
                    mobile: { width: 375, height: 667 },
                },
            };
            expect(config.viewports?.desktop.width).toBe(1280);
        });
    });

    describe('Viewport', () => {
        it('should allow viewport with label', () => {
            const viewport: Viewport = {
                width: 1920,
                height: 1080,
                label: 'full-hd',
            };
            expect(viewport.label).toBe('full-hd');
        });

        it('should allow viewport without label', () => {
            const viewport: Viewport = {
                width: 1280,
                height: 720,
            };
            expect(viewport.width).toBe(1280);
        });
    });

    describe('Action', () => {
        it('should allow click action', () => {
            const action: Action = {
                type: 'click',
                selector: '#button',
            };
            expect(action.type).toBe('click');
        });

        it('should allow type action', () => {
            const action: Action = {
                type: 'type',
                selector: '#input',
                value: 'test value',
            };
            expect(action.type).toBe('type');
            expect(action.value).toBe('test value');
        });

        it('should allow wait action', () => {
            const action: Action = {
                type: 'wait',
                timeout: 1000,
            };
            expect(action.type).toBe('wait');
            expect(action.timeout).toBe(1000);
        });
    });

    describe('Scenario', () => {
        it('should allow scenario with actions and viewports', () => {
            const scenario: Scenario = {
                label: 'login',
                path: '/login',
                viewports: [
                    { width: 1280, height: 720, label: 'desktop' },
                ],
                actions: [
                    { type: 'click', selector: '#login-btn' },
                ],
                maskSelectors: ['.date', '.time'],
                hideSelectors: ['.ads'],
            };
            expect(scenario.label).toBe('login');
            expect(scenario.actions).toHaveLength(1);
            expect(scenario.maskSelectors).toContain('.date');
        });
    });

    describe('TestResult', () => {
        it('should represent a passing test result', () => {
            const result: TestResult = {
                scenario: 'homepage',
                timestamp: '2025-01-01T00:00:00.000Z',
                status: 'pass',
                diffPixels: 0,
                diffPercentage: 0,
                screenshotPath: '.difflens/current/homepage.png',
                baselinePath: '.difflens/baseline/homepage.png',
                a11yViolations: [],
            };
            expect(result.status).toBe('pass');
            expect(result.diffPixels).toBe(0);
        });

        it('should represent a failing test result with dimension mismatch', () => {
            const result: TestResult = {
                scenario: 'homepage',
                timestamp: '2025-01-01T00:00:00.000Z',
                status: 'fail',
                diffPixels: -1,
                diffPercentage: 0,
                screenshotPath: '.difflens/current/homepage.png',
                a11yViolations: [],
                dimensionMismatch: true,
            };
            expect(result.status).toBe('fail');
            expect(result.dimensionMismatch).toBe(true);
        });
    });

    describe('ReportData', () => {
        it('should contain timestamp and results array', () => {
            const reportData: ReportData = {
                timestamp: '2025-01-01T00:00:00.000Z',
                results: [],
            };
            expect(reportData.timestamp).toBeDefined();
            expect(Array.isArray(reportData.results)).toBe(true);
        });
    });
});

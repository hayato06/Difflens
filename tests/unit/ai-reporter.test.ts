import { describe, it, expect } from 'vitest';
import { formatAiReport } from '../../src/core/reporters/ai-reporter';
import type { TestResult } from '../../src/types';

describe('formatAiReport', () => {
    it('should return success message when all tests pass', () => {
        const results: TestResult[] = [
            {
                scenario: 'homepage',
                timestamp: '2025-01-01T00:00:00.000Z',
                status: 'pass',
                diffPixels: 0,
                diffPercentage: 0,
                screenshotPath: '.difflens/current/homepage.png',
                a11yViolations: [],
            },
        ];

        const report = formatAiReport(results, '.difflens');
        expect(report).toContain('All tests passed');
        expect(report).toContain('No visual regressions');
    });

    it('should report visual regression failures', () => {
        const results: TestResult[] = [
            {
                scenario: 'homepage',
                timestamp: '2025-01-01T00:00:00.000Z',
                status: 'fail',
                diffPixels: 500,
                diffPercentage: 5.0,
                screenshotPath: '.difflens/current/homepage.png',
                diffPath: '.difflens/diff/homepage.png',
                a11yViolations: [],
            },
        ];

        const report = formatAiReport(results, '.difflens');
        expect(report).toContain('Visual Regression');
        expect(report).toContain('500');
        expect(report).toContain('5.00%');
    });

    it('should report dimension mismatch', () => {
        const results: TestResult[] = [
            {
                scenario: 'homepage',
                timestamp: '2025-01-01T00:00:00.000Z',
                status: 'fail',
                diffPixels: 0,
                diffPercentage: 0,
                screenshotPath: '.difflens/current/homepage.png',
                a11yViolations: [],
                dimensionMismatch: true,
            },
        ];

        const report = formatAiReport(results, '.difflens');
        expect(report).toContain('Dimension Mismatch');
        expect(report).toContain('different dimensions');
    });

    it('should report accessibility violations', () => {
        const results: TestResult[] = [
            {
                scenario: 'homepage',
                timestamp: '2025-01-01T00:00:00.000Z',
                status: 'pass',
                diffPixels: 0,
                diffPercentage: 0,
                screenshotPath: '.difflens/current/homepage.png',
                a11yViolations: [
                    {
                        id: 'color-contrast',
                        impact: 'serious',
                        description: 'Ensures the contrast between text and background meets WCAG 2 AA',
                        help: 'Elements must have sufficient color contrast',
                        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
                        tags: ['wcag2aa'],
                        nodes: [
                            {
                                html: '<span>Low contrast text</span>',
                                target: ['.low-contrast'],
                                impact: 'serious',
                                any: [],
                                all: [],
                                none: [],
                            },
                        ],
                    },
                ],
            },
        ];

        const report = formatAiReport(results, '.difflens');
        expect(report).toContain('Accessibility Violations');
        expect(report).toContain('color-contrast');
        expect(report).toContain('serious');
    });

    it('should count multiple issues correctly', () => {
        const results: TestResult[] = [
            {
                scenario: 'page1',
                timestamp: '2025-01-01T00:00:00.000Z',
                status: 'fail',
                diffPixels: 100,
                diffPercentage: 1.0,
                screenshotPath: '.difflens/current/page1.png',
                diffPath: '.difflens/diff/page1.png',
                a11yViolations: [],
            },
            {
                scenario: 'page2',
                timestamp: '2025-01-01T00:00:00.000Z',
                status: 'fail',
                diffPixels: 200,
                diffPercentage: 2.0,
                screenshotPath: '.difflens/current/page2.png',
                diffPath: '.difflens/diff/page2.png',
                a11yViolations: [],
            },
        ];

        const report = formatAiReport(results, '.difflens');
        expect(report).toContain('Found 2 issues');
        expect(report).toContain('Issue #1: page1');
        expect(report).toContain('Issue #2: page2');
    });
});

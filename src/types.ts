import { Result } from 'axe-core';

export interface DiffLensConfig {
    baseUrl?: string;
    viewports?: {
        [key: string]: { width: number; height: number };
    };
    scenarios: Scenario[];
    threshold?: number;
    outDir?: string;
    format?: 'default' | 'json' | 'ai';
    failOnActionError?: boolean;
    failOnNavigationError?: boolean;
}

export interface Viewport {
    width: number;
    height: number;
    label?: string;
}

export interface Action {
    type: 'click' | 'type' | 'wait';
    selector?: string;
    value?: string;
    timeout?: number;
}

export interface Scenario {
    label: string;
    path: string;
    viewports?: Viewport[];
    actions?: Action[];
    maskSelectors?: string[];
    hideSelectors?: string[];
}

export interface TestResult {
    scenario: string;
    timestamp: string;
    status: 'pass' | 'fail' | 'new';
    diffPixels: number;
    diffPercentage: number;
    screenshotPath: string;
    diffPath?: string;
    baselinePath?: string;
    a11yViolations: Result[];
    dimensionMismatch?: boolean;
}

export interface ReportData {
    timestamp: string;
    results: TestResult[];
}

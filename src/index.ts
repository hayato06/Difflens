// Type exports
export type {
    DiffLensConfig,
    Viewport,
    Action,
    Scenario,
    TestResult,
    ReportData,
} from './types';

// Core function exports
export { loadConfig, DEFAULT_CONFIG } from './config';
export { runTests } from './core/runner';
export { formatAiReport } from './core/reporters/ai-reporter';

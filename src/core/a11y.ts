import { Page } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { Result } from 'axe-core';

export interface A11yResult {
    violations: Result[];
    score?: number; // Optional score calculation
}

export async function runAxeAudit(page: Page): Promise<A11yResult> {
    const results = await new AxeBuilder({ page }).analyze();

    // Log violations to console for immediate feedback
    if (results.violations.length > 0) {
        console.error(`Found ${results.violations.length} accessibility violations:`);
        results.violations.forEach((violation) => {
            console.error(`- [${violation.impact}] ${violation.help} (${violation.id})`);
            violation.nodes.forEach((node) => {
                console.error(`  Target: ${node.target}`);
            });
        });
    }

    return {
        violations: results.violations,
    };
}

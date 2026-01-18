import { TestResult } from '../../types';
import path from 'path';

export function formatAiReport(results: TestResult[], outDir: string): string {
    let output = 'DiffLens Test Report\n====================\n\n';

    const failures = results.filter(r => r.status === 'fail' || r.a11yViolations.length > 0);

    if (failures.length === 0) {
        return output + 'All tests passed. No visual regressions or accessibility violations found.\n';
    }

    output += `Found ${failures.length} issues:\n\n`;

    failures.forEach((result, index) => {
        output += `Issue #${index + 1}: ${result.scenario}\n`;
        output += `----------------------------------------\n`;

        if (result.status === 'fail') {
            if (result.dimensionMismatch) {
                output += `[Dimension Mismatch]\n`;
                output += `  Baseline and current images have different dimensions.\n`;
            } else if (result.diffPixels > 0) {
                output += `[Visual Regression]\n`;
                output += `  Diff Pixels: ${result.diffPixels} (${result.diffPercentage.toFixed(2)}%)\n`;
                if (result.diffPath) {
                    output += `  Diff Image: ${path.relative(process.cwd(), result.diffPath)}\n`;
                }
            }
        }

        if (result.a11yViolations.length > 0) {
            output += `[Accessibility Violations]\n`;
            result.a11yViolations.forEach(v => {
                output += `  - [${v.impact}] ${v.help} (${v.id})\n`;
                output += `    Target: ${v.nodes.map(n => n.target.join(', ')).join(' | ')}\n`;
            });
        }
        output += '\n';
    });

    return output;
}

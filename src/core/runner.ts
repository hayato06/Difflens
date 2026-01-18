import { chromium, Browser, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { DiffLensConfig, Scenario, TestResult, ReportData } from '../types';
import { captureScreenshot } from './capture';
import { compareImages } from './compare';
import { runAxeAudit } from './a11y';
import { generateHtmlReport } from './report';

export async function runTests(config: DiffLensConfig): Promise<boolean> {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    const outDir = config.outDir || '.difflens';
    const dirs = {
        baseline: path.join(outDir, 'baseline'),
        current: path.join(outDir, 'current'),
        diff: path.join(outDir, 'diff'),
    };

    // Create directories
    Object.values(dirs).forEach((dir) => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });

    const results: TestResult[] = [];

    if (!config.scenarios || config.scenarios.length === 0) {
        console.error('Error: No scenarios defined in configuration.');
        return false;
    }

    for (const scenario of config.scenarios) {
        const viewports = scenario.viewports || config.viewports && Object.entries(config.viewports).map(([label, { width, height }]) => ({ label, width, height })) || [{ width: 1280, height: 720, label: 'default' }];

        for (const viewport of viewports) {
            const viewportLabel = viewport.label || `${viewport.width}x${viewport.height}`;
            const label = viewports.length > 1 || viewport.label ? `${scenario.label}-${viewportLabel}` : scenario.label;

            console.error(`Running scenario: ${label}`);
            const url = config.baseUrl ? new URL(scenario.path, config.baseUrl).toString() : scenario.path;

            await page.setViewportSize({ width: viewport.width, height: viewport.height });

            // Retry page.goto
            let retries = 2;
            let navigationSuccess = false;
            while (retries >= 0) {
                try {
                    await page.goto(url, { waitUntil: 'networkidle' });
                    navigationSuccess = true;
                    break;
                } catch (e) {
                    if (retries === 0) {
                        console.error(`  [WARN] Navigation failed: ${e}`);
                    } else {
                        console.error(`  [WARN] Navigation failed, retrying... (${retries} attempts left)`);
                        retries--;
                        await page.waitForTimeout(1000);
                    }
                }
            }

            if (!navigationSuccess) {
                if (config.failOnNavigationError) {
                    console.error(`  [FAIL] Navigation failed.`);
                    results.push({
                        scenario: label,
                        timestamp: new Date().toISOString(),
                        status: 'fail',
                        diffPixels: 0,
                        diffPercentage: 0,
                        screenshotPath: '',
                        a11yViolations: [],
                    });
                    continue; // Skip to next viewport/scenario
                }
                // If navigation fails and failOnNavigationError is false, we proceed to actions/capture 
                // which might fail or capture error page (current behavior)
            }

            // Execute actions
            let actionFailed = false;
            if (scenario.actions) {
                for (const action of scenario.actions) {
                    console.error(`  Action: ${action.type} ${action.selector || ''}`);
                    try {
                        if (action.type === 'click' && action.selector) {
                            await page.click(action.selector);
                        } else if (action.type === 'type' && action.selector && action.value) {
                            await page.fill(action.selector, action.value);
                        } else if (action.type === 'wait' && action.timeout) {
                            await page.waitForTimeout(action.timeout);
                        }
                    } catch (e) {
                        console.error(`  [WARN] Action failed: ${e}`);
                        actionFailed = true;
                        if (config.failOnActionError) {
                            break; // Stop actions if we want to fail fast
                        }
                    }
                }
                // Wait a bit after actions for UI to settle
                await page.waitForTimeout(500);
            }

            // Capture to current
            const currentPath = path.join(dirs.current, `${label}.png`);

            // Retry screenshot using captureScreenshot integration
            retries = 2;
            while (retries >= 0) {
                try {
                    // Use captureScreenshot with null URL to skip navigation
                    // Pass mask/hide selectors from scenario
                    await captureScreenshot(page, null, currentPath, {
                        fullPage: true,
                        maskSelectors: scenario.maskSelectors,
                        hideSelectors: scenario.hideSelectors
                    });
                    break;
                } catch (e) {
                    if (retries === 0) throw e;
                    console.error(`  [WARN] Screenshot failed, retrying... (${retries} attempts left)`);
                    retries--;
                    await page.waitForTimeout(1000);
                }
            }
            console.error(`  Screenshot captured: ${currentPath}`);

            // Accessibility
            const a11yResult = await runAxeAudit(page);
            if (a11yResult.violations.length > 0) {
                console.error(`  Accessibility violations: ${a11yResult.violations.length}`);
            }

            // Comparison
            const baselinePath = path.join(dirs.baseline, `${label}.png`);
            const diffPath = path.join(dirs.diff, `${label}.png`);

            let status: TestResult['status'] = 'new';
            let diffPixels = 0;
            let diffPercentage = 0;
            let finalDiffPath: string | undefined;
            let finalBaselinePath: string | undefined;
            let dimensionMismatch = false;

            if (fs.existsSync(baselinePath)) {
                finalBaselinePath = baselinePath;
                console.error('  Comparing with baseline...');
                const result = compareImages(baselinePath, currentPath, diffPath, config.threshold);

                diffPixels = result.diffPixels;
                diffPercentage = result.diffPercentage;
                dimensionMismatch = !result.isSameDimensions;

                if (!result.isSameDimensions) {
                    status = 'fail';
                    console.error(`  [FAIL] Dimension mismatch! Baseline and current images have different sizes.`);
                } else if (result.diffPixels > 0) {
                    status = 'fail';
                    finalDiffPath = diffPath;
                    console.error(`  [FAIL] Visual regression detected! Diff pixels: ${result.diffPixels} (${result.diffPercentage.toFixed(2)}%)`);
                    console.error(`  Diff image saved to: ${diffPath}`);
                } else {
                    status = 'pass';
                    console.error('  [PASS] No visual regression detected.');
                }
            } else {
                console.error('  Baseline not found. Saving current as baseline.');
                fs.copyFileSync(currentPath, baselinePath);
                console.error(`  Baseline saved to: ${baselinePath}`);
                finalBaselinePath = baselinePath;
            }

            // Check for accessibility violations and update status if needed
            if (a11yResult.violations.length > 0) {
                status = 'fail';
                console.error(`  [FAIL] Accessibility violations detected: ${a11yResult.violations.length}`);
            }

            // Check for action failure
            if (actionFailed && config.failOnActionError) {
                status = 'fail';
                console.error(`  [FAIL] Action execution failed.`);
            }

            results.push({
                scenario: label,
                timestamp: new Date().toISOString(),
                status,
                diffPixels,
                diffPercentage,
                screenshotPath: currentPath,
                diffPath: finalDiffPath,
                baselinePath: finalBaselinePath,
                a11yViolations: a11yResult.violations,
                dimensionMismatch,
            });
        }
    }

    await browser.close();

    // Generate Report
    const reportData: ReportData = {
        timestamp: new Date().toISOString(),
        results,
    };

    if (config.format === 'json') {
        console.log(JSON.stringify(results, null, 2));
    } else if (config.format === 'ai') {
        const { formatAiReport } = await import('./reporters/ai-reporter.js');
        console.log(formatAiReport(results, outDir));
    } else {
        generateHtmlReport(reportData, outDir);
    }

    const hasFailures = results.some(r => r.status === 'fail');
    return !hasFailures;
}

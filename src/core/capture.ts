import { Page } from 'playwright';
import path from 'path';

export interface CaptureOptions {
    fullPage?: boolean;
    hideSelectors?: string[];
    maskSelectors?: string[];
}

export async function captureScreenshot(
    page: Page,
    url: string | null,
    outputPath: string,
    options: CaptureOptions = {}
): Promise<void> {
    if (url) {
        await page.goto(url, { waitUntil: 'networkidle' });
    }

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);

    // Disable animations
    await page.addStyleTag({
        content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        transition-duration: 0s !important;
        animation-iteration-count: 1 !important;
      }
    `,
    });

    if (options.hideSelectors) {
        for (const selector of options.hideSelectors) {
            await page.locator(selector).evaluate((el) => (el.style.visibility = 'hidden'));
        }
    }

    if (options.maskSelectors) {
        for (const selector of options.maskSelectors) {
            await page.locator(selector).evaluate((el) => (el.style.backgroundColor = '#FF00FF'));
        }
    }

    await page.screenshot({
        path: outputPath,
        fullPage: options.fullPage ?? true,
        animations: 'disabled',
    });
}

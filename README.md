# DiffLens

[![npm version](https://img.shields.io/npm/v/difflens.svg)](https://www.npmjs.com/package/difflens)
[![CI](https://github.com/hayato06/difflens/actions/workflows/ci.yml/badge.svg)](https://github.com/hayato06/difflens/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/node/v/difflens.svg)](https://nodejs.org/)

**Visual Regression Testing for Everyone + Accessibility as a Service**

DiffLens is a lightweight, zero-config visual regression testing and accessibility auditing tool built on top of [Playwright](https://playwright.dev/).

## Features

- 📸 **Visual Regression Testing**: Automatically capture screenshots and detect pixel-perfect differences.
- ♿ **Accessibility Auditing**: Integrated `axe-core` checks to catch a11y violations.
- ⚙️ **Zero Config**: Works out of the box, or customize with `difflens.config.ts`.
- 📊 **HTML Reporting**: Generate visual reports to easily inspect diffs.
- 🤖 **CI Ready**: Proper exit codes for CI/CD integration.

## Installation

```bash
npm install -D difflens
# or
yarn add -D difflens
# or
pnpm add -D difflens
```

## Usage

### Initialize

Generate a configuration file:

```bash
npx difflens init
```

### Run Tests

Execute visual regression tests and accessibility audits:

```bash
npx difflens test
```

- **First Run**: Captures screenshots and saves them as **Baseline** (`.difflens/baseline`).
- **Subsequent Runs**: Captures new screenshots (`.difflens/current`) and compares them with the baseline.
- **Diffs**: If differences are detected, diff images are saved to `.difflens/diff` and the test fails.

### View Report

After running tests, open the generated HTML report:

```bash
open .difflens/index.html
```

## Configuration

Create `difflens.config.ts` in your project root:

```typescript
import { DiffLensConfig } from 'difflens';

const config: DiffLensConfig = {
  // Base URL for all scenarios (optional)
  baseUrl: 'https://example.com',

  // Output directory for artifacts (default: .difflens)
  outDir: '.difflens',

  // Image comparison threshold (0 to 1, default: 0.1)
  threshold: 0.1,

  // Fail test if an action fails (default: false)
  failOnActionError: false,

  // Test scenarios
  scenarios: [
    {
      label: 'homepage',
      path: '/',
      // Optional: Define multiple viewports
      viewports: [
        { width: 1280, height: 720, label: 'desktop' },
        { width: 375, height: 667, label: 'mobile' },
      ],
      // Optional: Perform actions before screenshot
      actions: [
        { type: 'wait', timeout: 1000 },
        { type: 'click', selector: '#login-button' },
        { type: 'type', selector: '#username', value: 'user' },
      ],
    },
    {
      label: 'about',
      path: '/about',
    },
  ],
};

export default config;
```

## MCP & API Server

DiffLens provides an MCP server and a REST API for integration with AI agents.

### Response Schema

Both the MCP tool and the API endpoint return a JSON response with the following structure:

```json
{
  "success": boolean, // Overall success status
  "results": [
    {
      "scenario": string,
      "status": "pass" | "fail" | "new",
      "diffPixels": number,
      "diffPercentage": number,
      "dimensionMismatch": boolean, // True if dimensions differ
      "a11yViolations": [ ... ] // List of accessibility violations
    }
  ]
}
```

## CLI Options

### `test`

- `--url <url>`: Run a quick test against a specific URL (overrides config).
- `--label <label>`: Label for the ad-hoc test (default: 'check').
- `--format <type>`: Output format.
    - `default`: Standard output with HTML report generation.
    - `json`: Output pure JSON to stdout (logs redirected to stderr).
    - `ai`: Output AI-friendly text summary to stdout (logs redirected to stderr).

### Exit Codes

- `0`: Success (No visual regressions or accessibility violations).
- `1`: Failure (Visual regression detected, dimension mismatch, or accessibility violations).

## License

MIT

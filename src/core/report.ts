import fs from 'fs';
import path from 'path';
import { ReportData } from '../types';

export function generateHtmlReport(data: ReportData, outDir: string) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DiffLens Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
    .summary { margin-bottom: 20px; padding: 15px; background: #eef; border-radius: 4px; }
    .scenario { border: 1px solid #ddd; margin-bottom: 20px; border-radius: 4px; overflow: hidden; }
    .scenario-header { padding: 10px 15px; background: #f9f9f9; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; }
    .scenario-title { font-weight: bold; font-size: 1.1em; }
    .status { padding: 4px 8px; border-radius: 4px; font-size: 0.9em; font-weight: bold; color: white; }
    .status.pass { background: #28a745; }
    .status.fail { background: #dc3545; }
    .status.new { background: #17a2b8; }
    .scenario-body { padding: 15px; }
    .images { display: flex; gap: 20px; margin-bottom: 15px; overflow-x: auto; }
    .image-container { flex: 0 0 auto; }
    .image-container img { max-width: 300px; border: 1px solid #ddd; border-radius: 4px; }
    .image-label { font-size: 0.9em; color: #666; margin-bottom: 5px; }
    .a11y { margin-top: 15px; border-top: 1px solid #eee; padding-top: 10px; }
    .a11y-title { font-weight: bold; color: #666; margin-bottom: 5px; }
    .violation { margin-bottom: 5px; color: #d63384; }
  </style>
</head>
<body>
  <div class="container">
    <h1>DiffLens Report</h1>
    <div class="summary">
      <p><strong>Generated at:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
      <p><strong>Total Scenarios:</strong> ${data.results.length}</p>
      <p><strong>Failed:</strong> ${data.results.filter(r => r.status === 'fail').length}</p>
    </div>

    ${data.results.map(result => `
      <div class="scenario">
        <div class="scenario-header">
          <span class="scenario-title">${result.scenario}</span>
          <span class="status ${result.status}">${result.status.toUpperCase()}</span>
        </div>
        <div class="scenario-body">
          <div class="images">
            ${result.baselinePath ? `
              <div class="image-container">
                <div class="image-label">Baseline</div>
                <img src="${path.relative(path.resolve(outDir), path.resolve(result.baselinePath))}" alt="Baseline">
              </div>
            ` : ''}
            <div class="image-container">
              <div class="image-label">Current</div>
              <img src="${path.relative(path.resolve(outDir), path.resolve(result.screenshotPath))}" alt="Current">
            </div>
            ${result.diffPath ? `
              <div class="image-container">
                <div class="image-label">Diff</div>
                <img src="${path.relative(path.resolve(outDir), path.resolve(result.diffPath))}" alt="Diff">
              </div>
            ` : ''}
          </div>
          
          ${result.diffPixels === -1 ? `
            <p style="color: #dc3545; font-weight: bold;">[FAIL] Dimension mismatch! Baseline and current images have different sizes.</p>
          ` : `
            <p><strong>Diff:</strong> ${result.diffPixels} pixels (${result.diffPercentage.toFixed(2)}%)</p>
          `}

          ${result.a11yViolations.length > 0 ? `
            <div class="a11y">
              <div class="a11y-title">Accessibility Violations (${result.a11yViolations.length})</div>
              ${result.a11yViolations.map(v => `
                <div class="violation">
                  [${v.impact}] ${v.help} (${v.id})
                </div>
              `).join('')}
            </div>
          ` : '<div class="a11y"><div class="a11y-title">No Accessibility Violations</div></div>'}
        </div>
      </div>
    `).join('')}
  </div>
</body>
</html>
  `;

  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(data, null, 2));
  console.log(`Report generated: ${path.join(outDir, 'index.html')}`);
}

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execFileAsync = promisify(execFile);
const app = new Hono();

app.get('/health', (c) => {
    return c.json({ status: 'ok', version: '0.0.1' });
});

app.post('/check', async (c) => {
    try {
        const body = await c.req.json();
        const { url, label } = body;

        if (!url) {
            return c.json({ error: 'URL is required' }, 400);
        }

        const scenarioLabel = label || 'check';
        const cliPath = path.resolve(__dirname, 'cli.js');

        // Construct command arguments
        const args = [cliPath, 'test', '--url', url, '--label', scenarioLabel, '--format', 'json'];

        console.log(`Executing: node ${args.join(' ')}`);

        try {
            const { stdout, stderr } = await execFileAsync(process.execPath, args);

            // Parse JSON output from CLI
            // CLI outputs JSON when --format json is used
            // However, CLI might output other logs before JSON if not careful.
            // Current CLI implementation of --format json only logs JSON.stringify(results).
            // But we need to be careful about other console.logs in runner.ts

            // Let's try to parse the last line or find JSON in output?
            // Or just return the raw stdout for now if parsing fails.

            let results;
            try {
                results = JSON.parse(stdout);
                if (!Array.isArray(results)) {
                    results = [results];
                }
            } catch (e) {
                // If parsing fails, return empty results with raw output
                results = [];
            }

            return c.json({
                success: true,
                results,
            });

        } catch (error: any) {
            // CLI returns exit code 1 if tests fail (visual regression found)
            // But we still want the report.
            const stdout = error.stdout;

            let results;
            try {
                results = JSON.parse(stdout);
                if (!Array.isArray(results)) {
                    results = [results];
                }
            } catch (e) {
                results = [];
            }

            return c.json({
                success: false, // Visual regression found or error
                results,
                error: error.message
            });
        }

    } catch (error: any) {
        return c.json({ error: error.message }, 500);
    }
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port
});

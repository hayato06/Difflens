import cac from 'cac';
import fs from 'fs';
import path from 'path';
import { version } from '../package.json';
import { loadConfig } from './config';
import { runTests } from './core/runner';
import { DiffLensConfig } from './types';

const cli = cac('difflens');

cli
    .command('init', 'Initialize DiffLens configuration')
    .action(() => {
        const configPath = path.resolve(process.cwd(), 'difflens.config.ts');
        if (fs.existsSync(configPath)) {
            console.log('Configuration file already exists: difflens.config.ts');
            return;
        }

        const template = `import { DiffLensConfig } from 'difflens';

const config: DiffLensConfig = {
  scenarios: [
    {
      label: 'example',
      path: 'https://example.com',
    },
  ],
  outDir: '.difflens',
};

export default config;
`;

        fs.writeFileSync(configPath, template);
        console.log('Created configuration file: difflens.config.ts');
    });

cli
    .command('test', 'Run visual regression tests')
    .option('--format <type>', 'Output format (default, json, ai)')
    .option('--url <url>', 'URL to test (overrides config file)')
    .option('--label <label>', 'Label for the test scenario', { default: 'check' })
    .action(async (options) => {
        console.error('Running tests...');
        try {
            let config: DiffLensConfig;
            if (options.url) {
                config = {
                    scenarios: [{ label: options.label, path: options.url }],
                    outDir: '.difflens',
                    format: options.format as any,
                };
            } else {
                config = await loadConfig();
                if (options.format) {
                    config.format = options.format as any;
                }
            }

            const success = await runTests(config);
            if (!success) {
                console.error('Tests failed.');
                process.exit(1);
            }
        } catch (error) {
            console.error('Test run failed:', error);
            process.exit(1);
        }
    });

cli
    .command('report', 'Generate HTML report')
    .action(() => {
        console.error('Generating report...');
        // TODO: Implement report logic if needed separately, currently handled in test
        console.error('Report generation is currently integrated into the test command.');
    });

cli.help();
cli.version(version);

try {
    cli.parse();
} catch (error) {
    console.error(error);
    process.exit(1);
}

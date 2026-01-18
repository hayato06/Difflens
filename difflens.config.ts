import { DiffLensConfig } from './src/types';

const config: DiffLensConfig = {
    scenarios: [
        {
            label: 'example-com',
            path: 'https://example.com',
        },
    ],
    outDir: '.difflens',
};

export default config;

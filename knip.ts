import type { KnipConfig } from 'knip'

// https://github.com/webpro/knip
const config: KnipConfig = {
    webpack: false,
    workspaces: {
        'packages/mask': {
            entry: [
                'background/mv2-entry.ts',
                'background/mv3-entry.ts',
                'src/extension/dashboard/index.ts',
                'src/extension/popups/entry.ts',
                'src/content-script.ts',
                'devtools/content-script/index.ts',
                'devtools/panels/index.tsx',
            ],
        },
        'packages/injected-script': {
            entry: ['main/index.ts'],
        },
        'packages/app': {
            entry: ['src/background-worker/init.ts', 'src/index.tsx'],
        },
        'packages/mask-sdk': {
            entry: ['main/index.ts'],
        },
    },
}

export default config

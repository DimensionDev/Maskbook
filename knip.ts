import type { KnipConfig } from 'knip'

// https://github.com/webpro/knip
const config: KnipConfig = {
    ignore: ['**/*.d.ts', '**/locales/index.ts'],
    vite: false,
    webpack: false,
    workspaces: {
        '.': {
            entry: ['*.js', '*.cjs'],
            ignoreDependencies: ['@typescript/lib-dom', 'ses', 'eslint-import-resolver-typescript', 'vite'],
        },
        'packages/mask': {
            ignore: ['public'],
            entry: [
                '.webpack/webpack.config.ts',
                'background/initialization/mv3-entry.ts',
                'dashboard/initialization/index.ts',
                'popups/initialization/index.ts',
                'content-script/index.ts',
                'devtools/content-script/index.ts',
                'devtools/panels/index.tsx',
            ],
            ignoreDependencies: ['webpack-cli'],
        },
        'packages/web3-constants': {
            entry: ['constants.ts'],
        },
        'packages/injected-script': {
            ignore: ['main/debugger.ts'],
            entry: ['main/index.ts'],
        },
    },
    ignoreWorkspaces: ['packages/polyfills'],
    ignoreDependencies: ['buffer', 'https-browserify', 'punycode'],
}

export default config

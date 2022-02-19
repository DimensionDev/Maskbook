const { join } = require('path')
const { ProvidePlugin } = require('webpack')

module.exports = {
    stories: ['../stories/**/*.mdx', '../stories/**/*.@(js|jsx|ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        {
            name: '@storybook/addon-essentials',
            options: {
                // https://github.com/storybookjs/storybook/issues/15901
                // docs not compatible with webpack 5.
                docs: false,
            },
        },
    ],
    reactOptions: {
        fastRefresh: true,
    },
    webpackFinal: async (config) => {
        config.experiments = { asyncWebAssembly: true, topLevelAwait: true }
        config.resolve.fallback = {
            crypto: false,
            stream: 'stream-browserify',
            os: false,
            http: false,
            https: false,
            buffer: 'buffer',
            path: 'path-browserify',
        }
        config.resolve.alias = {
            ...config.resolve.alias,
            '@masknet/shared': join(__dirname, '../../shared/src/'),
            '@masknet/shared-base': join(__dirname, '../../shared-base/src/'),
            '@masknet/theme': join(__dirname, '../../theme/src/'),
            '@masknet/icons': join(__dirname, '../../icons/index.ts'),
            '@masknet/web3-shared-base': join(__dirname, '../../web3-shared/base/src'),
            '@masknet/web3-shared-evm': join(__dirname, '../../web3-shared/evm/'),
            '@masknet/web3-shared-flow': join(__dirname, '../../web3-shared/flow/'),
            '@masknet/web3-shared-solana': join(__dirname, '../../web3-shared/solana/'),
            '@masknet/plugin-infra': join(__dirname, '../../plugin-infra/src/'),
            '@masknet/plugin-example': join(__dirname, '../../plugins/example/src/'),
            '@masknet/plugin-flow': join(__dirname, '../../plugins/Flow/src/'),
            '@masknet/plugin-solana': join(__dirname, '../../plugins/Solana/src/'),
            '@masknet/plugin-wallet': join(__dirname, '../../plugins/Wallet/src/'),
            '@masknet/public-api': join(__dirname, '../../public-api/src/'),
            '@masknet/backup-format': join(__dirname, '../../backup-format/src/'),
        }
        config.module.rules.push({
            test: /\.m?js$/,
            type: 'javascript/auto',
            resolve: {
                fullySpecified: false,
            },
        })

        config.plugins = config.plugins.map((plugin) => {
            if (plugin.constructor.name === 'DefinePlugin') {
                plugin.definitions['process.env.NODE_DEBUG'] = 'false'
            }

            return plugin
        })
        config.plugins.push(
            new ProvidePlugin({
                // Polyfill for Node global "Buffer" variable
                Buffer: ['buffer', 'Buffer'],
            }),
        )
        return config
    },
    core: {
        builder: 'webpack5',
    },
}

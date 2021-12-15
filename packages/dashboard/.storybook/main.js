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
        config.resolve.fallback = {
            crypto: false,
            stream: 'stream-browserify',
            os: false,
            http: false,
            https: false,
            buffer: 'buffer',
            path: 'path-browserify',
        }
        config.module.rules.push({
            test: /\.m?js$/,
            type: 'javascript/auto',
            resolve: {
                fullySpecified: false, // disable the behaviour
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

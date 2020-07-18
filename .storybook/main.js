module.exports = {
    stories: ['../src/stories/**/*.tsx'],
    addons: [
        '@storybook/addon-knobs/register',
        '@storybook/addon-actions',
        'storybook-addon-i18n/register.js',
        'storybook-addon-designs',
        '@storybook/addon-links',
        '@storybook/addon-docs',
        '@storybook/addon-viewport/register',
    ],
    webpackFinal: async (/** @type {import('webpack').Configuration} */ config) => {
        config.module.rules.push({
            test: /\.(ts|tsx)$/,
            use: [
                {
                    loader: require.resolve('ts-loader'),
                    options: {
                        transpileOnly: true,
                        compilerOptions: {
                            module: 'esnext',
                            noEmit: false,
                            importsNotUsedAsValues: 'remove',
                        },
                    },
                },
                { loader: require.resolve('react-docgen-typescript-loader') },
            ],
        })
        config.resolve.extensions.push('.ts', '.tsx')
        const webpack = require('webpack')
        config.plugins.unshift(
            new webpack.DefinePlugin({
                'process.env.STORYBOOK': 'true',
            }),
        )
        return config
    },
}

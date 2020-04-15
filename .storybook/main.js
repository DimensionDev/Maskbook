module.exports = {
    stories: ['../src/stories/**/*.tsx'],
    addons: [
        '@storybook/addon-knobs/register',
        '@storybook/addon-actions',
        'storybook-addon-material-ui/register',
        'storybook-addon-i18n/register.js',
        'storybook-addon-figma/register',
        '@storybook/addon-links',
        '@storybook/preset-typescript',
        // ---------^ not working.
        // maybe see https://github.com/storybookjs/presets/issues/65
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
                        compilerOptions: { noEmit: false },
                    },
                },
                { loader: require.resolve('react-docgen-typescript-loader') },
            ],
        })
        config.resolve.extensions.push('.ts', '.tsx')
        const webpack = require('webpack')
        config.plugins.push(
            new webpack.DefinePlugin({
                'process.env.storybook': 'true',
            }),
        )
        return config
    },
}

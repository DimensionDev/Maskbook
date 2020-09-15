module.exports = {
    stories: ['../packages/maskbook/src/stories/**/*.tsx'],
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
        const webpack = require('webpack')
        config.plugins.unshift(
            new webpack.DefinePlugin({
                'process.env.STORYBOOK': 'true',
            }),
        )
        return config
    },
}

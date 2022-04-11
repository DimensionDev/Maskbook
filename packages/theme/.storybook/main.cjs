const patchWebpackConfig = require('@masknet/storybook-shared/patch-webpack')

module.exports = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
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
    webpackFinal: patchWebpackConfig,
    core: {
        builder: 'webpack5',
    },
}

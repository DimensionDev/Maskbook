import patchWebpackConfig from '@masknet/storybook-shared/patch-webpack'

/** @type {import('@storybook/react-webpack5').StorybookConfig} */
const config = {
    framework: {
        name: '@storybook/react-webpack5',
        options: {
            fastRefresh: true,
            builder: {
                fsCache: true,
                lazyCompilation: true,
            },
            strictMode: true,
        },
    },
    stories: ['../stories/**/*.stories.@(ts|tsx)'],
    addons: [
        '@storybook/addon-links',
        {
            name: '@storybook/addon-essentials',
        },
    ],
    webpackFinal: patchWebpackConfig,
}
export default config

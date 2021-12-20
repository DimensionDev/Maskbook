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
    webpackFinal: async (config) => {
        config.experiments = { asyncWebAssembly: true, topLevelAwait: true }
        config.module.rules.push({
            test: /\.m?js$/,
            type: 'javascript/auto',
            resolve: {
                fullySpecified: false,
            },
        })
        return config
    },
    core: {
        builder: 'webpack5',
    },
}

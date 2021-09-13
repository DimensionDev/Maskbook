module.exports = {
    stories: ['../stories/**/*.mdx', '../stories/**/*.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
    reactOptions: {
        fastRefresh: true,
    },
    webpackFinal: async (config) => {
        config.module.rules.push({
            test: /\.m?js$/,
            type: 'javascript/auto',
        })
        return config
    },
}

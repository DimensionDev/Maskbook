module.exports = {
    stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
    reactOptions: {
        fastRefresh: true,
    },
    typescript: {
        // todo, fixme:
        //  temporary workaround is disable doc gen
        //  related to PR:
        //      https://github.com/DimensionDev/Maskbook/issues/3253
        //      https://github.com/styleguidist/react-docgen-typescript/issues/356
        reactDocgen: 'none',
    },
}

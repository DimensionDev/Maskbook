const { TsConfigPathsPlugin } = require('awesome-typescript-loader')
module.exports = ({ config }) => {
    config.module.rules.push({
        test: /\.(ts|tsx)$/,
        use: [
            {
                loader: require.resolve('awesome-typescript-loader'),
                options: {
                    transpileOnly: true,
                },
            },
        ],
    })
    config.resolve.extensions.push('.ts', '.tsx')
    config.module.rules = config.module.rules.filter(x => x.enforce !== 'pre')
    config.plugins.push(new TsConfigPathsPlugin({ isolatedModules: false }))
    return config
}

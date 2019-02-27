const path = require('path')
module.exports = (baseConfig, env, config) => {
    config.module.rules.push({
        test: /\.(ts|tsx)$/,
        use: [
            {
                loader: require.resolve('awesome-typescript-loader'),
            },
            {
                loader: require.resolve('react-docgen-typescript-loader'),
            },
        ],
    })
    config.resolve.extensions.push('.ts', '.tsx')
    return config
}

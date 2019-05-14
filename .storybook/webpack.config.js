module.exports = ({ config }) => {
    config.module.rules.push({
        test: /\.(ts|tsx)$/,
        use: [
            {
                loader: require.resolve('awesome-typescript-loader'),
            },
        ],
    })
    config.resolve.extensions.push('.ts', '.tsx')
    config.module.rules = config.module.rules.filter(x => x.enforce !== 'pre')
    return config
}

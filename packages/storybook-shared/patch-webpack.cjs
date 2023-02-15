const { ProvidePlugin, EnvironmentPlugin } = require('webpack')
module.exports = async function (config) {
    const transpile = config.module.rules.find((x) => x.test.toString().includes('tsx')).use
    transpile.push({
        loader: require.resolve('swc-loader'),
        options: {
            parseMap: true,
            jsc: {
                parser: {
                    syntax: 'typescript',
                    dynamicImport: true,
                    tsx: true,
                },
                target: 'es2022',
                transform: {
                    react: {
                        runtime: 'automatic',
                    },
                },
            },
        },
    })

    config.experiments = { asyncWebAssembly: true, topLevelAwait: true }
    if (!config.resolve.plugins) config.resolve.plugins = []
    config.resolve.extensionAlias = {
        '.js': ['.tsx', '.ts', '.js'],
        '.mjs': ['.mts', '.mjs'],
    }
    config.resolve.fallback = {
        crypto: false,
        stream: 'stream-browserify',
        os: false,
        http: false,
        https: false,
    }
    config.resolve.conditionNames = ['mask-src', '...']

    config.module.rules.push({
        test: /\.m?js$/,
        type: 'javascript/auto',
        resolve: {
            fullySpecified: false,
        },
    })

    config.plugins = config.plugins.map((plugin) => {
        if (plugin.constructor.name === 'DefinePlugin') {
            plugin.definitions['process.env.NODE_DEBUG'] = 'false'
        }

        return plugin
    })

    config.plugins.push(
        new ProvidePlugin({
            // Polyfill for Node global "Buffer" variable
            Buffer: ['buffer', 'Buffer'],
        }),
        new EnvironmentPlugin({
            shadowRootMode: 'open',
        }),
    )

    return config
}

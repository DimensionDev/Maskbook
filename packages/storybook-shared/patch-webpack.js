const { ProvidePlugin } = require('webpack')
const resolveTypeScriptPlugin = require('resolve-typescript-plugin')
module.exports = async function (config) {
    const transpile = config.module.rules
        .find((x) => x.test.toString().includes('tsx'))
        .use
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
                    target: 'es2021',
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
    config.resolve.plugins.push(new resolveTypeScriptPlugin())
    config.resolve.fallback = {
        crypto: false,
        stream: 'stream-browserify',
        os: false,
        http: false,
        https: false,
    }

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
        })
    )

    return config
}

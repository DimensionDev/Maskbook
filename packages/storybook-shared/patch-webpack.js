import webpack from 'webpack'
import { fileURLToPath } from 'url'
const { ProvidePlugin } = webpack

export default async function (config) {
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

    // https://github.com/storybookjs/storybook/issues/21242
    config.resolve.alias.global = fileURLToPath(new URL('./global', import.meta.url))

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
    )

    return config
}

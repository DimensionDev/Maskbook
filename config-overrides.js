const path = require('path')

process.env.NODE_ENV = 'development'
const env = process.env.NODE_ENV
process.env.GENERATE_SOURCEMAP = (env === 'development') + ''
module.exports = function override(/** @type{import("webpack").Configuration} */ config, env) {
    if (env === 'development') config.devtool = 'inline-source-map'
    config.entry = {
        app: path.join(__dirname, './src/index.tsx'),
        contentscript: path.join(__dirname, './src/content-script.ts'),
        backgroundservice: path.join(__dirname, './src/background-service.ts'),
        injectedscript: path.join(__dirname, './src/extension/injected-script/index.ts'),
    }
    config.output.filename = 'static/js/[name].js'
    config.output.chunkFilename = 'static/js/[name].chunk.js'
    config.optimization.runtimeChunk = false
    config.optimization.splitChunks = undefined

    config.module.wrappedContextCritical = false
    config.module.exprContextCritical = false
    config.module.unknownContextCritical = false

    // @ts-ignore
    config.plugins.push(new (require('write-file-webpack-plugin'))())
    config.plugins.push(
        new (require('copy-webpack-plugin'))(
            [
                {
                    from: path.join(__dirname, './public'),
                    to: path.join(__dirname, './dist'),
                },
            ],
            { ignore: ['*.html'] },
        ),
    )
    for (const x of config.module.rules) {
        if (!x.oneOf) continue
        for (const rule of x.oneOf) {
            if (rule.loader === require.resolve('babel-loader')) {
                if (rule.include) {
                    rule.loader = require.resolve('ts-loader')
                    rule.options = {
                        transpileOnly: true,
                        compilerOptions: {
                            jsx: 'react',
                        },
                    }
                }
            }
        }
    }
    config.module.rules.forEach(rule => {
        if (rule.oneOf) rule.oneOf = rule.oneOf.filter(x => x.loader !== require.resolve('babel-loader'))
    })
    return config
}
